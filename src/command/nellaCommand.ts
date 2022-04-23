import { SlashCommand } from '../base/slashCommand';
import { CommandInteraction } from 'discord.js';
import config from '../config';

export default {
  name: "nella",
  guildId: [config.guildId],
  execute: (commandInteraction: CommandInteraction) => {
    commandInteraction.editReply("Oh, Nella? He's my boyfriend.");
  }
} as SlashCommand;
