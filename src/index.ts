// Import source-map-support
import "source-map-support/register";

// Load enviroment variable
import 'dotenv/config';

// Load sapphire plugin
import '@sapphire/plugin-logger/register';
import '@sapphire/plugin-hmr/register';
import '@sapphire/plugin-editable-commands/register';
import '@sapphire/plugin-subcommands/register';

// All the utility
import { VerificationUtility } from './utility/verifiationUtility';
import { MessageUtility } from './utility/messageUtility';
import { EmbedUtility } from './utility/embedUtility';
import { GuildUtility } from './utility/guildUtility';
import { UserUtility } from './utility/userUtility';

import { LogLevel, SapphireClient } from '@sapphire/framework';

const client = new SapphireClient({
  defaultPrefix: 'drk!',
  loadMessageCommandListeners: true,
  typing: true,
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
  },
  hmr: {
    enabled: process.env.NODE_ENV === 'development'
  },
  intents: [
    'MESSAGE_CONTENT',
    // DM
    'DIRECT_MESSAGES',
    // Guild
    'GUILDS',
    'GUILD_MEMBERS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS'
  ]
});

const verificationUtility = new VerificationUtility();
const embedUtility = new EmbedUtility(client);
const userUtility = new UserUtility();

client.login();

const messageUtility = new MessageUtility(client);
const guildUtility = new GuildUtility(client);

export {
  verificationUtility as VerificationUtility,
  messageUtility as MessageUtility,
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  userUtility as UserUtilty
};
