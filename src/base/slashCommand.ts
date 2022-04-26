import { CommandInteraction, GuildResolvable } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface SlashCommand {
  data: SlashCommandBuilder;
  guildId?: GuildResolvable[];
  permission?: 'BOT_OWNER' | 'ADMINISTRATOR' | 'MODERATOR';
  peferEphemeral?: boolean;
  execute: (commandInteraction: CommandInteraction) => void | Promise<void>;
}
