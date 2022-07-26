import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import config from '../config';

export default {
  data: new SlashCommandBuilder().setName('nella').setDescription('-'),
  guildId: [config.guildId],
  execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => {
    chatInputCommandInteraction.editReply("Oh, Nella? He's my boyfriend.");
  }
} as SlashCommand;
