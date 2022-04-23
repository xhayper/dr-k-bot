import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';

export default {
  name: "eval",
  permission: "BOT_OWNER",
  execute: async (commandInteraction: CommandInteraction) => {
    commandInteraction.editReply(await eval(commandInteraction.options.getString('code', true)));
  }
} as SlashCommand;
