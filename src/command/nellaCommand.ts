import { SlashCommand } from '../base/slashCommand';
import { SlashCommandBuilder } from '@discordjs/builders';
import { CommandInteraction } from 'discord.js';

export default {
  builder: new SlashCommandBuilder().setName('nella').setDescription('-'),
  guildId: ['894855956276600873'],
  execute: (command: CommandInteraction) => {
    command.editReply("Oh, Nella? He's my boyfriend.");
  }
} as SlashCommand;
