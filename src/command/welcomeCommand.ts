import { CommandInteraction, GuildMember } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { GuildUtility } from '..';
import config from '../config';

export default {
  name: 'welcome',
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    GuildUtility.sendWelcomeMessage(commandInteraction.options.getMember('member', true) as GuildMember);
  }
} as SlashCommand;
