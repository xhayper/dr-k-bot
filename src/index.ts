// Import source-map-support
import 'source-map-support/register';

// Load enviroment variable
import 'dotenv/config';

// Load sapphire plugin
import '@sapphire/plugin-logger/register';
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
  defaultPrefix: 'k!',
  disableMentionPrefix: true,
  loadMessageCommandListeners: true,
  typing: true,
  logger: {
    level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
  },
  intents: [
    'MessageContent',
    // DM
    'DirectMessages',
    // Guild
    'Guilds',
    'GuildMembers',
    'GuildMessages',
    'GuildMessageReactions'
  ]
});

const verificationUtility = new VerificationUtility();
const userUtility = new UserUtility();

let messageUtility: MessageUtility;
let embedUtility: EmbedUtility;
let guildUtility: GuildUtility;

client.once('ready', () => {
  messageUtility = new MessageUtility(client);
  embedUtility = new EmbedUtility(client);
  guildUtility = new GuildUtility(client);
});

client.login();

export {
  verificationUtility as VerificationUtility,
  messageUtility as MessageUtility,
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  userUtility as UserUtilty
};
