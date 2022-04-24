import { CommandInteraction, GuildMember } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { GuildUtility } from '..';

export default {
  name: 'welcome',
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    GuildUtility.sendWelcomeMessage(commandInteraction.options.getMember('member', true) as GuildMember);
  }
} as SlashCommand;
