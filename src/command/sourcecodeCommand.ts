import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';

export default {
  data: new SlashCommandBuilder().setName('sourcecode').setDescription("Give you the link to the bot's source code"),
  execute: (commandInteraction: CommandInteraction) => {
    commandInteraction.editReply('https://github.com/xhayper/dr-k-bot');
  }
} as SlashCommand;
