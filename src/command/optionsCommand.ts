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
          .addStringOption((option) =>
            option
            .setName('filter')
            .setDescription('-')
            .addChoices(config.misc.chatFilters.map((filter) => ({ name: filter, value: filter })))
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
      )
      .addSubcommand((sub) =>
        sub
          .setName('showFilters')
          .setDescription('Shows all chat filters.')
      )
      .addSubcommand((sub) =>
        sub
          .setName('setUserMediaLimit')
          .setDescription('Sets the media limit for each user.')
          .addIntegerOption((option) =>
            option
            .setName('timer')
            .setDescription('In minutes')
            .setRequired(true)
          )
          .addIntegerOption((option) =>
            option
            .setName('messageCount')
            .setDescription('-')
            .setRequired(true)
          )
      )
      .addSubcommand((sub) =>
        sub
          .setName('dashboard')
          .setDescription('Shows the option information dashboard.')
      ),
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    // TODO add logic after confirming the menu works.
  }
} as SlashCommand;
