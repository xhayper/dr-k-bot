import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';

export default {
  name: "eval",
  permission: "BOT_OWNER",
  execute: async (command: CommandInteraction) => {
    command.editReply(await eval(command.options.getString('code', true)));
  }
} as SlashCommand;
