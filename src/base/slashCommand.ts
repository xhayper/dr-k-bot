import { CommandInteraction, Snowflake } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';

export interface SlashCommand {
  data: SlashCommandBuilder;
  guildId?: Snowflake[] | string[];
  permission?: 'BOT_OWNER' | 'ADMINISTRATOR' | 'MODERATOR' | 'INTERN' | 'SECURITY';
  peferEphemeral?: boolean;
  execute: (commandInteraction: CommandInteraction) => void | Promise<void>;
}
