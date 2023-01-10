import { GuildUtility, EmbedUtility, VerificationUtility, MessageUtility } from '..';
import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { VerificationTicketType } from '../database';
import { ApplyOptions } from '@sapphire/decorators';
import config from '../config';
import {
  type ButtonInteraction,
  type CollectorFilter,
  type GuildMember,
  type Message,
  type MessageMentionOptions,
  type MessageCreateOptions,
  type Snowflake,
  type TextBasedChannel,
  type User,
  EmbedBuilder,
  Collection
} from 'discord.js';

const validCustomId = ['verify_accept', 'verify_decline', 'verify_ticket'];

const questionAskCollection = new Collection<Snowflake, User>();

async function handleQuestion(
  textChannel: TextBasedChannel,
  filter?: CollectorFilter<[Message<boolean>]>,
  cancelMessage: string | MessageCreateOptions | null = {
    embeds: [EmbedUtility.OPERATION_CANCELLED().toJSON()]
  }
): Promise<Message | void> {
  const message = await textChannel.awaitMessages({
    max: 1,
    filter,
    time: 180000,
    errors: ['time']
  });
  const response = message.first();
  if (!response) return;
  if (response.content.toLowerCase().trim() === 'cancel') {
    if (cancelMessage !== null && cancelMessage) {
      const opt: { allowedMentions: MessageMentionOptions } = {
        allowedMentions: {
          repliedUser: false
        }
      };
      if (typeof cancelMessage === 'string') {
        await response.reply({
          content: cancelMessage,
          ...opt
        });
      } else {
        await response.reply({
          ...cancelMessage,
          ...opt
        });
      }
    }
    return;
  }
  return response;
}

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    await interaction.deferReply();

    let moderator: GuildMember | void;
    let ticket: VerificationTicketType | void;
    let verificationMessage: Message | void;

    moderator = await GuildUtility.getGuildMember(interaction.user.id);
    if (!moderator) throw new Error("This wasn't suppose to happened");
    if (
      !GuildUtility.isHeadSecurity(moderator) &&
      !GuildUtility.isSeniorSecurity(moderator) &&
      !GuildUtility.isSecurity(moderator) &&
      !GuildUtility.isIntern(moderator)
    )
      return interaction.editReply({
        embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.NO_PERMISSION(), interaction.user).toJSON()]
      });

    ticket = await VerificationUtility.getTicketFromMessageId(interaction.message.id);
    if (!ticket)
      return interaction.editReply({
        embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_TICKET(), interaction.user).toJSON()]
      });

    if (ticket) verificationMessage = await VerificationUtility.getMessageFromTicket(ticket);

    switch (interaction.customId) {
      case 'verify_accept': {
        const member = await GuildUtility.getGuildMember(ticket!.discordId);
        if (!member)
          return interaction.editReply({
            embeds: [
              EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), interaction.user)
                .setFooter({
                  text: ticket!.id
                })
                .toJSON()
            ]
          });

        await member.roles.remove(config.role.unverified);

        await VerificationUtility.deleteTicket(ticket!, {
          deleteType: 'ACCEPTED',
          who: moderator!.user
        });

        await interaction.editReply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              EmbedUtility.USER_AUTHOR(
                new EmbedBuilder().setDescription(`${member.user} has been accepted!`),
                interaction.user
              ).setFooter({
                text: ticket!.id
              })
            ).toJSON()
          ]
        });

        await GuildUtility.sendWelcomeMessage(member);
        break;
      }
      case 'verify_decline': {
        if (questionAskCollection.has(verificationMessage!.id))
          return interaction.editReply({
            embeds: [
              EmbedUtility.USER_AUTHOR(
                EmbedUtility.VERIFICATION_ALREADY_TAKEN(
                  new EmbedBuilder({
                    footer: { text: ticket!.id }
                  }),
                  questionAskCollection.get(verificationMessage!.id)!
                ),
                interaction.user
              ).toJSON()
            ]
          });

        questionAskCollection.set(verificationMessage!.id, interaction.user);

        await interaction.editReply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              EmbedUtility.USER_AUTHOR(
                new EmbedBuilder({
                  description: "What's the reason for declining?",
                  footer: {
                    text: `Respond within 5 minutes | Say 'cancel' to exit | ${ticket!.id}`
                  }
                }),
                interaction.user
              )
            ).toJSON()
          ]
        });

        const reason = await handleQuestion(
          GuildUtility.verificationLogChannel!,
          (responseMessage: Message) => responseMessage.author.id === interaction.user.id,
          {
            embeds: [
              EmbedUtility.TIMESTAMP_NOW(
                EmbedUtility.USER_AUTHOR(EmbedUtility.OPERATION_CANCELLED(), interaction.user)
              ).toJSON()
            ]
          }
        ).catch(() => {
          questionAskCollection.delete(verificationMessage!.id);
          interaction.followUp({
            embeds: [
              EmbedUtility.ERROR_COLOR(
                EmbedUtility.USER_AUTHOR(EmbedUtility.DIDNT_RESPOND_IN_TIME(), interaction.user)
              ).toJSON()
            ]
          });
          return;
        });

        if (!reason) {
          questionAskCollection.delete(verificationMessage!.id);
          return;
        }

        const user = await this.container.client.users.fetch(ticket!.discordId).catch(() => undefined);
        if (user)
          user
            .send({
              embeds: [
                EmbedUtility.ERROR_COLOR(
                  new EmbedBuilder({
                    title: 'Sorry!',
                    description: `Your verification request has been declined by ${moderator}\nReason: ${
                      (await MessageUtility.transformMessage(reason)).text
                    }`
                  })
                ).toJSON()
              ]
            })
            .catch(() => undefined);

        await VerificationUtility.deleteTicket(ticket!, {
          deleteType: 'DECLINED',
          who: moderator!.user
        });

        await reason.reply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              EmbedUtility.USER_AUTHOR(
                new EmbedBuilder({
                  description: `${user} has been declined!`
                }).setFooter({ text: ticket!.id }),
                moderator!.user
              )
            ).toJSON()
          ],
          allowedMentions: {
            repliedUser: false
          }
        });

        break;
      }
      case 'verify_ticket': {
        const member = await GuildUtility.getGuildMember(ticket!.discordId);
        if (!member)
          return interaction.editReply({
            embeds: [
              EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), interaction.user)
                .setFooter({
                  text: ticket!.id
                })
                .toJSON()
            ]
          });

        await GuildUtility.openThread(moderator!, member);

        await interaction.editReply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              EmbedUtility.USER_AUTHOR(
                new EmbedBuilder({
                  description: `Thread opened with ${member}!`
                }),
                moderator!.user
              )
            )
              .setFooter({
                text: ticket!.id
              })
              .toJSON()
          ]
        });

        break;
      }
    }
  }

  public parse(interaction: ButtonInteraction) {
    if (!validCustomId.includes(interaction.customId)) return this.none();

    return this.some();
  }
}
