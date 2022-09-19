import { ChatInputCommandInteraction, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('-')
    .addStringOption((input) => input.setName('code').setDescription('-').setRequired(true)),
  guildId: [config.guildId],
  permission: 'BOT_OWNER',
  execute: async (chatInputCommandInteraction: ChatInputCommandInteraction) => {
    const code = chatInputCommandInteraction.options.getString('code', true);

    try {
      const result = await eval(code);
      chatInputCommandInteraction.editReply(result ?? 'No output');
    } catch (e: any) {
      chatInputCommandInteraction.editReply(e.toString());
    }
  }
} as SlashCommand;
