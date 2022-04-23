import { CommandManager, EmbedUtility, GuildUtility, VerificationManager } from '..';
import { TypedEvent } from '../base/clientEvent';
import { VerificationTicket } from '../database';
import {
  ButtonInteraction,
  Client,
  Collection,
  CommandInteraction,
  GuildMember,
  Interaction,
  Message,
  MessageEmbed,
  Snowflake,
  User
} from 'discord.js';

const questionAskCollection = new Collection<Snowflake, User>();
const verificationCollection = new Collection<User, boolean>();

export default TypedEvent({
  eventName: 'interactionCreate',
  on: async (_: Client, interaction: Interaction) => {
    if (!interaction.member || !(interaction.member instanceof GuildMember)) return;
    if (interaction.isButton()) {
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
              embeds: [EmbedUtility.USER_TITLE(EmbedUtility.NO_PERMISSION(), buttonInteraction.user)]
            });

          ticket = await VerificationManager.getTicketFromMessageId(buttonInteraction.message.id);
          if (!ticket)
            return buttonInteraction.editReply({
              embeds: [EmbedUtility.USER_TITLE(EmbedUtility.CANT_FIND_TICKET(), buttonInteraction.user)]
            });

          if (ticket) verificationMessage = await VerificationManager.getMessageFromTicket(ticket);
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
                EmbedUtility.USER_TITLE(
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
          break;
        }
        case 'verify_decline': {
          if (questionAskCollection.has(verificationMessage!.id))
            return buttonInteraction.reply({
              embeds: [
                EmbedUtility.USER_TITLE(
                  EmbedUtility.VERIFICATION_ALREADY_TAKEN(
                    new MessageEmbed(),
                    questionAskCollection.get(verificationMessage!.id)!
                  ),
                  buttonInteraction.user
                )
              ]
            });

          questionAskCollection.set(verificationMessage!.id, buttonInteraction.user);

          await buttonInteraction.reply({
            embeds: [
              EmbedUtility.USER_TITLE(
                new MessageEmbed({
                  description: "What's the reason for declining?"
                }),
                buttonInteraction.user
              )
            ]
          });

          const response = await verificationMessage!.channel
            .awaitMessages({
              max: 1,
              filter: (responseMessage: Message) => responseMessage.author.id === buttonInteraction.user.id,
              time: 180000,
              errors: ['time']
            })
            .catch(() => {
              buttonInteraction.followUp("You didn't respond in time!");
              questionAskCollection.delete(verificationMessage!.id);
              return;
            });

          if (!response) {
            questionAskCollection.delete(verificationMessage!.id);
            return;
          }

          const reason = response!.first();
          console.log(reason);
          break;
        }
        case 'verify_ticket': {
          break;
        }
        case 'verify': {
          break;
        }
      }
    } else if (interaction.isCommand()) {
      const commandInteraction = interaction as CommandInteraction;
      const command = CommandManager.commands.get(commandInteraction.commandName);
      if (!command) return;

      if (command.peferEphemeral) await interaction.deferReply({ ephemeral: true });
      else await interaction.deferReply();

      if (command.guildId && (!interaction.guild || !command.guildId.includes(interaction.guild.id)))
        return interaction.editReply({
          embeds: [EmbedUtility.USER_TITLE(EmbedUtility.CANT_USE_HERE(), interaction.user)]
        });

      if (
        command.permission &&
        ((command.permission === 'BOT_OWNER' && !GuildUtility.isBotOwner(interaction.member)) ||
          (command.permission === 'ADMINISTRATOR' && !GuildUtility.isAdministrator(interaction.member)) ||
          (command.permission === 'MODERATOR' && !GuildUtility.isModerator(interaction.member)))
      )
        return interaction.editReply({
          embeds: [EmbedUtility.USER_TITLE(EmbedUtility.NO_PERMISSION(), interaction.user)]
        });

      command.execute(commandInteraction);
    }
  }
});
