import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';

export default {
  name: "nella",
  guildId: ['894855956276600873'],
  execute: (command: CommandInteraction) => {
    command.editReply("Oh, Nella? He's my boyfriend.");
  }
} as SlashCommand;
