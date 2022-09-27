import { VerificationUtility, GuildUtility, EmbedUtility, MessageUtility } from '..';
import { VerificationTicket, VerificationTicketType } from '../database';
import { questions, ModalUtility } from '../utility/modalUtility';
import { EmbedBuilder } from '@discordjs/builders';
import { Listener } from '@sapphire/framework';
import config from '../config';
import {
  ButtonInteraction,
  Collection,
  CollectorFilter,
  GuildMember,
  Interaction,
  Message,
  MessageMentionOptions,
  MessageOptions,
  Snowflake,
  TextBasedChannel,
  User
} from 'discord.js';

const questionAskCollection = new Collection<Snowflake, User>();

async function handleQuestion(
  textChannel: TextBasedChannel,
  filter?: CollectorFilter<[Message<boolean>]>,
  cancelMessage: string | MessageOptions | null = {
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
    if (cancelMessage != null && cancelMessage) {
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

export class UserEvent extends Listener {
  public async run(interaction: Interaction) {
    if (interaction.isModalSubmit()) {
      switch (interaction.customId) {
        case 'verification': {
          await interaction.deferReply({ ephemeral: true });

          const randomTicketId = await VerificationUtility.getUniqueTicketId();

          const transformedAnswer = questions.map((quest, index) => ({
            question: quest.label,
            answer: interaction.fields.getTextInputValue(`question-${index + 1}`)
          }));

          const verificationData = {
            id: randomTicketId,
            discordId: interaction.user.id,
            messageId: 'undefined',
            answers: JSON.stringify(transformedAnswer)
          };

          if (GuildUtility.verificationLogChannel) {
            const verifyMessage = await VerificationUtility.sendTicketInformation(
              GuildUtility.verificationLogChannel,
              verificationData
            );
            verificationData.messageId = verifyMessage ? verifyMessage.id : 'undefined';
          }

          await VerificationTicket.create({ data: verificationData });

          await interaction.editReply({ content: 'Your submission was received successfully!' });
          break;
        }
      }
    } else if (interaction.isButton()) {
      if (!interaction.guild || interaction.guild.id != config.guildId) return;
      const buttonInteraction = interaction as ButtonInteraction;

      let moderator: GuildMember | void;
      let ticket: VerificationTicketType | void;
      let verificationMessage: Message | void;

      // Check for permission, set fields and set up
      switch (buttonInteraction.customId) {
        case 'verify_accept':
        case 'verify_decline':
        case 'verify_ticket': {
          await buttonInteraction.deferReply();
          moderator = await GuildUtility.getGuildMember(buttonInteraction.user.id);
          if (!moderator) throw new Error("This wasn't suppose to happened");
          if (
            !GuildUtility.isHeadSecurity(moderator) &&
            !GuildUtility.isSeniorSecurity(moderator) &&
            !GuildUtility.isSecurity(moderator) &&
            !GuildUtility.isIntern(moderator)
          )
            return buttonInteraction.editReply({
              embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.NO_PERMISSION(), buttonInteraction.user).toJSON()]
            });

          ticket = await VerificationUtility.getTicketFromMessageId(buttonInteraction.message.id);
          if (!ticket)
            return buttonInteraction.editReply({
              embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_TICKET(), buttonInteraction.user).toJSON()]
            });

          if (ticket) verificationMessage = await VerificationUtility.getMessageFromTicket(ticket);
          break;
        }
        case 'verify': {
          break;
        }
        default: {
          await buttonInteraction.editReply({
            embeds: [
              EmbedUtility.ERROR_COLOR(
                EmbedUtility.USER_AUTHOR(
                  new EmbedBuilder().setDescription(`No implementation for ${buttonInteraction.customId}!`),
                  buttonInteraction.user
                )
              ).toJSON()
            ]
          });
          break;
        }
      }

      // The actual logic
      switch (buttonInteraction.customId) {
        case 'verify_accept': {
          const member = await GuildUtility.getGuildMember(ticket!.discordId);
          if (!member)
            return buttonInteraction.editReply({
              embeds: [
                EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), buttonInteraction.user)
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

          await buttonInteraction.editReply({
            embeds: [
              EmbedUtility.SUCCESS_COLOR(
                EmbedUtility.USER_AUTHOR(
                  new EmbedBuilder().setDescription(`${member.user} has been accepted!`),
                  buttonInteraction.user
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
            return buttonInteraction.editReply({
              embeds: [
                EmbedUtility.USER_AUTHOR(
                  EmbedUtility.VERIFICATION_ALREADY_TAKEN(
                    new EmbedBuilder({
                      footer: { text: ticket!.id }
                    }),
                    questionAskCollection.get(verificationMessage!.id)!
                  ),
                  buttonInteraction.user
                ).toJSON()
              ]
            });

          questionAskCollection.set(verificationMessage!.id, buttonInteraction.user);

          await buttonInteraction.editReply({
            embeds: [
              EmbedUtility.SUCCESS_COLOR(
                EmbedUtility.USER_AUTHOR(
                  new EmbedBuilder({
                    description: "What's the reason for declining?",
                    footer: {
                      text: `Respond within 5 minutes | Say 'cancel' to exit | ${ticket!.id}`
                    }
                  }),
                  buttonInteraction.user
                )
              ).toJSON()
            ]
          });

          const reason = await handleQuestion(
            GuildUtility.verificationLogChannel!,
            (responseMessage: Message) => responseMessage.author.id === buttonInteraction.user.id,
            {
              embeds: [
                EmbedUtility.TIMESTAMP_NOW(
                  EmbedUtility.USER_AUTHOR(EmbedUtility.OPERATION_CANCELLED(), buttonInteraction.user)
                ).toJSON()
              ]
            }
          ).catch(() => {
            questionAskCollection.delete(verificationMessage!.id);
            buttonInteraction.followUp({
              embeds: [
                EmbedUtility.ERROR_COLOR(
                  EmbedUtility.USER_AUTHOR(EmbedUtility.DIDNT_RESPOND_IN_TIME(), buttonInteraction.user)
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
                      description: `Your verification request has been declined by ${moderator}\nReason: ${await MessageUtility.transformMessage(
                        reason
                      )}`
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
            return buttonInteraction.editReply({
              embeds: [
                EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), buttonInteraction.user)
                  .setFooter({
                    text: ticket!.id
                  })
                  .toJSON()
              ]
            });

          await GuildUtility.openThread(moderator!, member);

          await buttonInteraction.editReply({
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
        case 'verify': {
          await interaction.showModal(ModalUtility.createApplicationModal());
          break;
        }
      }
    }
  }
}
