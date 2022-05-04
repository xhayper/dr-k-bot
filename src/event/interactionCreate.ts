import { CommandManager, EmbedUtility, GuildUtility, MessageUtility, VerificationUtility } from '..';
import { TypedEvent } from '../base/clientEvent';
import { VerificationTicket } from '../database';
import { Logger } from '../logger';
import config from '../config';
import {
  ButtonInteraction,
  Client,
  Collection,
  CollectorFilter,
  CommandInteraction,
  GuildMember,
  Interaction,
  Message,
  MessageEmbed,
  MessageMentionOptions,
  MessageOptions,
  Snowflake,
  TextBasedChannel,
  User
} from 'discord.js';

const questionAskCollection = new Collection<Snowflake, User>();
const verificationCollection = new Collection<User, boolean>();

async function handleQuestion(
  textChannel: TextBasedChannel,
  filter?: CollectorFilter<[Message<boolean>]>,
  cancelMessage: string | MessageOptions | null = {
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
    if (!interaction.member || !(interaction.member instanceof GuildMember)) return;

    if (interaction.isCommand()) {
      const commandInteraction = interaction as CommandInteraction;
      const command = CommandManager.commands.get(commandInteraction.commandName);
      if (!command) return;

      if (command.peferEphemeral) await interaction.deferReply({ ephemeral: true });
      else await interaction.deferReply();

      if (command.guildId && (!interaction.guild || !command.guildId.includes(interaction.guild.id)))
        return interaction.editReply({
          embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.CANT_USE_HERE(), interaction.user)]
        });

      if (
        command.permission &&
        ((command.permission === 'BOT_OWNER' && !GuildUtility.isBotOwner(interaction.member)) ||
          (command.permission === 'ADMINISTRATOR' && !GuildUtility.isAdministrator(interaction.member)) ||
          (command.permission === 'MODERATOR' && !GuildUtility.isModerator(interaction.member)))
      )
        return interaction.editReply({
          embeds: [EmbedUtility.USER_AUTHOR(EmbedUtility.NO_PERMISSION(), interaction.user)]
        });

      Logger.info(`${interaction.member.user.tag} used command ${command.data.name}`);
      command.execute(commandInteraction);
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
          if (!GuildUtility.isModerator(moderator))
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
          await buttonInteraction.deferReply({ ephemeral: true });
          break;
        }
        default: {
          await buttonInteraction.editReply({
            embeds: [
              EmbedUtility.ERROR_COLOR(
                EmbedUtility.USER_AUTHOR(
                  new MessageEmbed().setDescription(`No implementation for ${buttonInteraction.customId}!`),
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
                  new MessageEmbed().setDescription(`${member.user} has been accepted!`),
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
                    new MessageEmbed({
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
                  new MessageEmbed({
                    description: "What's the reason for declining?",
                    footer: {
                      text: `Respond within 5 minutes | Say 'cancel'to exit | ${ticket!.id}`
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
                    new MessageEmbed({
                      title: 'Sorry!',
                      description: `Your verification request has been declined by ${moderator}\nReason: ${MessageUtility.transformMessage(
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
                  new MessageEmbed({
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
                  new MessageEmbed({
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
          if (verificationCollection.has(buttonInteraction.user))
            return buttonInteraction.editReply({ embeds: [EmbedUtility.ALREADY_IN_SESSION()] });

          verificationCollection.set(buttonInteraction.user, true);

          const dmChannel = interaction.user.dmChannel || (await interaction.user.createDM());

          try {
            await dmChannel.send({
              embeds: [
                EmbedUtility.SUCCESS_COLOR(
                  new MessageEmbed({
                    description:
                      'Before we can grant you access to the rest of the server, we needs you to answer some questions. The answers will __**NOT**__ be used for any other purposes, please answer all the following questions with honesty. Thanks!'
                  })
                )
              ]
            });
          } catch (e: any) {
            if (e.code === 50007) return buttonInteraction.editReply({ embeds: [EmbedUtility.CANT_DM()] });
            else throw e;
          }

          buttonInteraction.editReply({
            embeds: [
              EmbedUtility.SUCCESS_COLOR(
                new MessageEmbed({
                  description: 'Please check your Direct Message!'
                })
              )
            ]
          });

          const answerList = [];

          for (const [index, value] of Object.entries(config.questions)) {
            const currentIndex = parseInt(index);
            await dmChannel
              .send({
                embeds: [
                  EmbedUtility.SUCCESS_COLOR(
                    new MessageEmbed({
                      title: `Question ${currentIndex + 1}`,
                      description: value,
                      footer: {
                        text: `Respond within 5 minutes! | Say 'cancel' to exit! | Question ${currentIndex + 1}/${
                          config.questions.length
                        }`
                      }
                    })
                  )
                ]
              })
              .catch(async () => {
                verificationCollection.delete(buttonInteraction.user);
                return await dmChannel.send({ embeds: [EmbedUtility.DIDNT_RESPOND_IN_TIME()] }).catch(() => undefined);
              });

            const answer = await handleQuestion(dmChannel);
            if (!answer) {
              verificationCollection.delete(buttonInteraction.user);
              return;
            } else {
              answerList.push({
                question: value,
                message: answer
              });
            }
          }

          verificationCollection.delete(buttonInteraction.user);

          const randomTicketId = await VerificationUtility.getUniqueTicketId();

          const transformedAnswer = answerList.map((answerData) => ({
            question: answerData.question,
            answer: MessageUtility.transformMessage(answerData.message)
          }));

          const verificationData = {
            id: randomTicketId,
            requesterDiscordId: buttonInteraction.user.id,
            logMessageId: 'undefined',
            answers: transformedAnswer
          };

          if (GuildUtility.verificationLogChannel) {
            const verifyMessage = await VerificationUtility.sendTicketInformation(
              GuildUtility.verificationLogChannel,
              verificationData
            );
            verificationData.logMessageId = (verifyMessage && verifyMessage.id) || 'undefined';
          }

          await VerificationTicket.create(verificationData);

          await dmChannel
            .send({
              embeds: [EmbedUtility.SUCCESS_COLOR(EmbedUtility.VERIFICATION_SUCCESS(randomTicketId))]
            })
            .catch(() => undefined);

          break;
        }
      }
    }
  }
});
