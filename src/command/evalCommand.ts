import { SlashCommand } from '../base/slashCommand';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export default {
  builder: new SlashCommandBuilder()
    .setName('eval')
    .setDescription('-')
    .addStringOption((option) => option.setName('code').setDescription('The code to evaluate').setRequired(true)),
  guildId: ['894855956276600873'],
  execute: async (command: CommandInteraction) => {
    command.editReply(await eval(command.options.getString('code', true)));
  }
} as SlashCommand;
