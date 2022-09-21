import { CommandManager, EmbedUtility, GuildUtility, MessageUtility, VerificationUtility } from '..';
import { ModalUtility, questions } from '../utility/modalUtility';
import { TypedEvent } from '../base/clientEvent';
import { VerificationTicket } from '../database';
import { Logger } from '../logger';
import config from '../config';
import {
  ButtonInteraction,
  Client,
  Collection,
  CollectorFilter,
  GuildMember,
  Interaction,
  Message,
  EmbedBuilder,
  MessageMentionOptions,
  BaseMessageOptions,
  Snowflake,
  TextBasedChannel,
  User,
  InteractionType,
  ChatInputCommandInteraction
} from 'discord.js';

const questionAskCollection = new Collection<Snowflake, User>();

async function handleQuestion(
  textChannel: TextBasedChannel,
  filter?: CollectorFilter<[Message<boolean>]>,
  cancelMessage: string | BaseMessageOptions | null = {
    embeds: [EmbedUtility.OPERATION_CANCELLED()]
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

export default TypedEvent({
  eventName: 'interactionCreate',
  on: async (client: Client, interaction: Interaction) => {
    // if (!interaction.member || !(interaction.member instanceof GuildMember)) return;

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
            requesterDiscordId: interaction.user.id,
            logMessageId: 'undefined',
            answers: transformedAnswer
          };

          if (GuildUtility.verificationLogChannel) {
            const verifyMessage = await VerificationUtility.sendTicketInformation(
              GuildUtility.verificationLogChannel,
              verificationData
            );
            verificationData.logMessageId = verifyMessage ? verifyMessage.id : 'undefined';
          }

          await VerificationTicket.create(verificationData);

          await interaction.editReply({ content: 'Your submission was received successfully!' });
          break;
        }
      }
    } else if (interaction.type == InteractionType.ApplicationCommand) {
      const chatInputCommandInteraction = interaction as ChatInputCommandInteraction;
      const command = CommandManager.commands.get(chatInputCommandInteraction.commandName);
      if (!command) return;

      if (command.peferEphemeral) await interaction.deferReply({ ephemeral: true });
      else await interaction.deferReply();

      if (command.guildId && (!interaction.guild || !command.guildId.includes(interaction.guild.id)))
        return interaction.editReply({
          embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_USE_HERE(), interaction.user)]
        });

      if (command.permission) {
        if (
          !interaction.member ||
          !(interaction.member instanceof GuildMember) ||
          interaction.guildId !== config.guildId
        )
          return interaction.editReply({
            embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_USE_HERE(), interaction.user)]
          });

        if (
          (command.permission === 'BOT_OWNER' && !GuildUtility.isBotOwner(interaction.member)) ||
          (command.permission === 'ADMINISTRATOR' && !GuildUtility.isAdministrator(interaction.member)) ||
          (command.permission === 'SENIOR_SECURITY' && !GuildUtility.isSeniorSecurity(interaction.member)) ||
          (command.permission === 'MODERATOR' && !GuildUtility.isModerator(interaction.member)) ||
          (command.permission === 'INTERN' && !GuildUtility.isIntern(interaction.member)) ||
          (command.permission === 'SECURITY' && !GuildUtility.isSecurity(interaction.member))
        )
          return interaction.editReply({
            embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.NO_PERMISSION(), interaction.user)]
          });
      }

      Logger.info(
        `${(interaction.member?.user ?? interaction.user).username}#${(interaction.member?.user ?? interaction.user).discriminator
        } used command ${command.data.name}`
      );
      command.execute(chatInputCommandInteraction);
    } else if (interaction.isButton()) {
      if (!interaction.guild || interaction.guild.id != config.guildId) return;
      const buttonInteraction = interaction as ButtonInteraction;

      let moderator: GuildMember | void;
      let ticket: VerificationTicket | void;
      let verificationMessage: Message | void;

      // Check for permission, set fields and set up
      switch (buttonInteraction.customId) {
        case 'verify_accept':
        case 'verify_decline':
        case 'verify_ticket': {
          await buttonInteraction.deferReply();
          moderator = await GuildUtility.getGuildMember(buttonInteraction.user.id);
          if (!moderator) throw new Error("This wasn't suppose to happened");
          if (!GuildUtility.isSecurity(moderator))
            return buttonInteraction.editReply({
              embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.NO_PERMISSION(), buttonInteraction.user)]
            });

          ticket = await VerificationUtility.getTicketFromMessageId(buttonInteraction.message.id);
          if (!ticket)
            return buttonInteraction.editReply({
              embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_TICKET(), buttonInteraction.user)]
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
              )
            ]
          });
          break;
        }
      }

      // The actual logic
      switch (buttonInteraction.customId) {
        case 'verify_accept': {
          const member = await GuildUtility.getGuildMember(ticket!.requesterDiscordId);
          if (!member)
            return buttonInteraction.editReply({
              embeds: [
                EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), buttonInteraction.user).setFooter({
                  text: ticket!.id
                })
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
              )
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
                )
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
              )
            ]
          });

          const reason = await handleQuestion(
            GuildUtility.verificationLogChannel!,
            (responseMessage: Message) => responseMessage.author.id === buttonInteraction.user.id,
            {
              embeds: [
                EmbedUtility.TIMESTAMP_NOW(
                  EmbedUtility.USER_AUTHOR(EmbedUtility.OPERATION_CANCELLED(), buttonInteraction.user)
                )
              ]
            }
          ).catch(() => {
            questionAskCollection.delete(verificationMessage!.id);
            buttonInteraction.followUp({
              embeds: [
                EmbedUtility.ERROR_COLOR(
                  EmbedUtility.USER_AUTHOR(EmbedUtility.DIDNT_RESPOND_IN_TIME(), buttonInteraction.user)
                )
              ]
            });
            return;
          });

          if (!reason) {
            questionAskCollection.delete(verificationMessage!.id);
            return;
          }

          const user = await client.users.fetch(ticket!.requesterDiscordId).catch(() => undefined);
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
                  )
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
              )
            ],
            allowedMentions: {
              repliedUser: false
            }
          });

          break;
        }
        case 'verify_ticket': {
          const member = await GuildUtility.getGuildMember(ticket!.requesterDiscordId);
          if (!member)
            return buttonInteraction.editReply({
              embeds: [
                EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_FIND_USER(), buttonInteraction.user).setFooter({
                  text: ticket!.id
                })
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
              ).setFooter({
                text: ticket!.id
              })
            ]
          });

          break;
        }
        case 'verify': {
          const verificationModal = ModalUtility.createApplicationModal();
          await interaction.showModal(verificationModal);
          break;
        }
      }
    }
  }
});
