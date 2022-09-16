import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import config from '../config';

export default {
  data: new SlashCommandBuilder().setName('pippindip').setDescription('-'),
  guildId: [config.guildId],
  execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => {
    chatInputCommandInteraction.editReply("Oh, Pip? He's the most fabulous femboy i ever met.");
  }
} as SlashCommand;
