import { ChatInputCommandInteraction, Snowflake } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface SlashCommand {
  data: SlashCommandBuilder;
  guildId?: Snowflake[] | string[];
  permission?: 'BOT_OWNER' | 'ADMINISTRATOR' | 'SENIOR_SECURITY' | 'MODERATOR' | 'INTERN' | 'SECURITY';
  peferEphemeral?: boolean;
  execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => void | Promise<void>;
}
