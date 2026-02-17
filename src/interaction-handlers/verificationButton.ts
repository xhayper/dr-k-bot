import { container, InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";
import {
  type ButtonInteraction,
  type CollectorFilter,
  type GuildMember,
  type Message,
  type MessageMentionOptions,
  type MessageCreateOptions,
  type Snowflake,
  type User,
  type SendableChannels,
  EmbedBuilder,
  Collection
} from "discord.js";

const validCustomId = ["verify_accept", "verify_decline", "verify_ticket"];

const questionAskCollection = new Collection<Snowflake, User>();

async function handleQuestion(
  textChannel: SendableChannels,
  filter?: CollectorFilter<[Message<boolean>]>,
  cancelMessage: string | MessageCreateOptions | null = {
    embeds: [container.utilities.embed.OPERATION_CANCELLED().toJSON()]
  }
): Promise<Message | void> {
  const message = await textChannel.awaitMessages({
    max: 1,
    filter,
    time: 180000,
    errors: ["time"]
  });
  const response = message.first();
  if (!response) return;
  if (response.content.toLowerCase().trim() === "cancel") {
    if (cancelMessage !== null && cancelMessage) {
      const opt: { allowedMentions: MessageMentionOptions } = {
        allowedMentions: { repliedUser: false }
      };
      if (typeof cancelMessage === "string") {
        await response.reply({ content: cancelMessage, ...opt });
      } else {
        await response.reply({ ...cancelMessage, ...opt });
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
    let verificationMessage: Message | void;

    moderator = await this.container.utilities.guild.getGuildMember(interaction.user.id);
    if (!moderator) throw new Error("This wasn't suppose to happened");

    if (
      !this.container.utilities.guild.isHeadSecurity(moderator) &&
      !this.container.utilities.guild.isSeniorSecurity(moderator) &&
      !this.container.utilities.guild.isSecurity(moderator) &&
      !this.container.utilities.guild.isIntern(moderator)
    ) {
      return interaction.editReply({
        embeds: [
          this.container.utilities.embed
            .USER_AUTHOR(this.container.utilities.embed.NO_PERMISSION(), interaction.user)
            .toJSON()
        ]
      });
    }

    const ticket = await this.container.utilities.ticket.getByMessageId(interaction.message.id);

    if (!ticket) {
      return interaction.editReply({
        embeds: [
          this.container.utilities.embed
            .USER_AUTHOR(this.container.utilities.embed.CANT_FIND_TICKET(), interaction.user)
            .toJSON()
        ]
      });
    }

    verificationMessage = await this.container.utilities.verification.getMessageFromTicketId(ticket.id);

    switch (interaction.customId) {
      case "verify_accept": {
        const member = await this.container.utilities.guild.getGuildMember(ticket.discordId);

        if (!member) {
          return interaction.editReply({
            embeds: [
              this.container.utilities.embed
                .USER_AUTHOR(this.container.utilities.embed.CANT_FIND_USER(), interaction.user)
                .setFooter({ text: ticket.id })
                .toJSON()
            ]
          });
        }

        await member.roles.remove(config.role.unverified);

        await this.container.utilities.verification.deleteTicket(ticket.id, {
          deleteType: "ACCEPTED",
          who: moderator.user
        });

        await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .SUCCESS_COLOR(
                this.container.utilities.embed
                  .USER_AUTHOR(new EmbedBuilder().setDescription(`${member.user} has been accepted!`), interaction.user)
                  .setFooter({ text: ticket.id })
              )
              .toJSON()
          ]
        });

        await this.container.utilities.guild.sendWelcomeMessage(member);
        break;
      }

      case "verify_decline": {
        if (!verificationMessage) return;

        if (questionAskCollection.has(verificationMessage.id)) {
          return interaction.editReply({
            embeds: [
              this.container.utilities.embed
                .USER_AUTHOR(
                  this.container.utilities.embed.VERIFICATION_ALREADY_TAKEN(
                    new EmbedBuilder({ footer: { text: ticket.id } }),
                    questionAskCollection.get(verificationMessage.id)!
                  ),
                  interaction.user
                )
                .toJSON()
            ]
          });
        }

        questionAskCollection.set(verificationMessage.id, interaction.user);

        await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .SUCCESS_COLOR(
                this.container.utilities.embed.USER_AUTHOR(
                  new EmbedBuilder({
                    description: "What's the reason for declining?",
                    footer: {
                      text: `Respond within 5 minutes | Say 'cancel' to exit | ${ticket.id}`
                    }
                  }),
                  interaction.user
                )
              )
              .toJSON()
          ]
        });

        const reason = await handleQuestion(
          this.container.utilities.guild.verificationLogChannel!,
          (responseMessage: Message) => responseMessage.author.id === interaction.user.id,
          {
            embeds: [
              this.container.utilities.embed
                .TIMESTAMP_NOW(
                  this.container.utilities.embed.USER_AUTHOR(
                    this.container.utilities.embed.OPERATION_CANCELLED(),
                    interaction.user
                  )
                )
                .toJSON()
            ]
          }
        ).catch(() => {
          questionAskCollection.delete(verificationMessage!.id);
          interaction.followUp({
            embeds: [
              this.container.utilities.embed
                .ERROR_COLOR(
                  this.container.utilities.embed.USER_AUTHOR(
                    this.container.utilities.embed.DIDNT_RESPOND_IN_TIME(),
                    interaction.user
                  )
                )
                .toJSON()
            ]
          });
          return;
        });

        if (!reason) {
          questionAskCollection.delete(verificationMessage.id);
          return;
        }

        const user = await this.container.client.users.fetch(ticket.discordId).catch(() => undefined);

        if (user) {
          user
            .send({
              embeds: [
                this.container.utilities.embed
                  .ERROR_COLOR(
                    new EmbedBuilder({
                      title: "Sorry!",
                      description: `Your verification request has been declined by ${moderator}\nReason: ${
                        (await this.container.utilities.message.transformMessage(reason)).text
                      }`
                    })
                  )
                  .toJSON()
              ]
            })
            .catch(() => undefined);
        }

        await this.container.utilities.verification.deleteTicket(ticket.id, {
          deleteType: "DECLINED",
          who: moderator.user
        });

        await reason.reply({
          embeds: [
            this.container.utilities.embed
              .SUCCESS_COLOR(
                this.container.utilities.embed.USER_AUTHOR(
                  new EmbedBuilder({
                    description: `${user ?? "User"} has been declined!`
                  }).setFooter({ text: ticket.id }),
                  moderator.user
                )
              )
              .toJSON()
          ],
          allowedMentions: { repliedUser: false }
        });

        questionAskCollection.delete(verificationMessage.id);

        break;
      }

      case "verify_ticket": {
        const member = await this.container.utilities.guild.getGuildMember(ticket.discordId);

        if (!member) {
          return interaction.editReply({
            embeds: [
              this.container.utilities.embed
                .USER_AUTHOR(this.container.utilities.embed.CANT_FIND_USER(), interaction.user)
                .setFooter({ text: ticket.id })
                .toJSON()
            ]
          });
        }

        await this.container.utilities.guild.openThread(moderator, member);

        await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .SUCCESS_COLOR(
                this.container.utilities.embed.USER_AUTHOR(
                  new EmbedBuilder({
                    description: `Thread opened with ${member}!`
                  }),
                  moderator.user
                )
              )
              .setFooter({ text: ticket.id })
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
