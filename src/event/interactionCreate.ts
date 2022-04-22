import { TypedEvent } from '../base/clientEvent';
import { Client, CommandInteraction, GuildMember, Interaction } from 'discord.js';
import { CommandManager, EmbedUtility, GuildUtility } from '..';

export default TypedEvent({
  eventName: 'interactionCreate',
  on: async (_: Client, interaction: Interaction) => {
    if (!interaction.member || !(interaction.member instanceof GuildMember)) return;
    if (interaction.isCommand()) {
      const interactionCommand = interaction as CommandInteraction;
      const command = CommandManager.commands.get(interactionCommand.commandName);
      if (!command) return;

      if (command.peferEphemeral) await interaction.deferReply({ ephemeral: true });
      else await interaction.deferReply();

      if (command.guildId && (!interaction.guild || !command.guildId.includes(interaction.guild.id)))
        return interaction.editReply({ embeds: [EmbedUtility.CANT_USE_HERE()] });

      if (
        command.permission &&
        ((command.permission === 'BOT_OWNER' && !GuildUtility.isBotOwner(interaction.member)) ||
          (command.permission === 'ADMINISTRATOR' && !GuildUtility.isAdministrator(interaction.member)) ||
          (command.permission === 'MODERATOR' && !GuildUtility.isModerator(interaction.member)))
      )
        return interaction.editReply({ embeds: [EmbedUtility.NO_PERMISSION()] });

      command.execute(interactionCommand);
    }
  }
});
