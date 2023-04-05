// Import source-map-support
import 'source-map-support/register';

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
import config from './config';
import { mwn } from 'mwn';

const wikiClient = new mwn({
  apiUrl: config.wikiApiLink,
  userAgent: 'DrKBot/2.0.0 (https://github.com/xhayper/dr-k-bot) mwn/1.11.5'
});

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
  userUtility as UserUtilty,
  wikiClient
};
