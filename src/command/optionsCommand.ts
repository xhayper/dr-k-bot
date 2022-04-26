import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
      .setName("options")
      .setDescription('Adjust Dr. K bot options.')
      .addSubcommand((sub) =>
        sub
          .setName('removeFilter')
          .setDescription('Removes one of the chat filters.')
          .addChoices(...config.misc.chatFilters)
          .addStringOption((option) =>
            option
            .setName('filter')
            .setDescription('-')
            .addChoices(...config.misc.chatFilters)
            .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('addFilter')
          .setDescription('Adds a chat filter.')
          .addStringOption((option) =>
            option
            .setName('filter')
            .setDescription('-')
            .setRequired(true)
          )
      ),
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    // TODO add logic after confirming the menu works.
  }
} as SlashCommand;
