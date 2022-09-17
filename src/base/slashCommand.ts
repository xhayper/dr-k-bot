import { ChatInputCommandInteraction, Snowflake, SlashCommandBuilder } from 'discord.js';

export interface SlashCommand {
  data: SlashCommandBuilder;
  guildId?: Snowflake[] | string[];
  permission?: 'BOT_OWNER' | 'ADMINISTRATOR' | 'SENIOR_SECURITY' | 'MODERATOR' | 'INTERN' | 'SECURITY';
  peferEphemeral?: boolean;
  execute: (chatInputCommandInteraction: ChatInputCommandInteraction) => void | Promise<void>;
}
