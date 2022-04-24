import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';

export default {
  name: 'sourcecode',
  execute: (commandInteraction: CommandInteraction) => {
    commandInteraction.editReply('https://github.com/xhayper/dr-k-bot');
  }
} as SlashCommand;
