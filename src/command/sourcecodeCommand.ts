import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';
import config from '../config';

export default {
  name: 'sourcecode',
  guildId: [config.guildId],
  execute: (commandInteraction: CommandInteraction) => {
    commandInteraction.editReply('https://github.com/xhayper/dr-k-bot');
  }
} as SlashCommand;
