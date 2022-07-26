import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';

export default {
  data: new SlashCommandBuilder().setName('sourcecode').setDescription("Give you the link to the bot's source code"),
  execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => {
    chatInputCommandInteraction.editReply('https://github.com/xhayper/dr-k-bot');
  }
} as SlashCommand;
