import { CommandInteraction, GuildResolvable } from 'discord.js';

export interface SlashCommand {
  name: string;
  guildId?: GuildResolvable[];
  permission?: 'BOT_OWNER' | 'ADMINISTRATOR' | 'MODERATOR';
  peferEphemeral?: boolean;
  execute: (commandInteraction: CommandInteraction) => void | Promise<void>;
}
