// Load in enviroment variable
import 'dotenv/config';

// All the utility
import { VerificationUtility } from './utility/verifiationUtility';
import { EmbedUtility } from './utility/embedUtility';
import { GuildUtility } from './utility/guildUtility';
import { UserUtility } from './utility/userUtility';

// Manager
import { CommandManager } from './manager/commandManager';
import { EventManager } from './manager/eventManager';

// All the required modules
import { Client } from 'discord.js';
import { MessageUtility } from './utility/messageUtility';

const client = new Client({
  intents: [
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
const guildUtility = new GuildUtility(client);
const embedUtility = new EmbedUtility(client);
const messageUtility = new MessageUtility();
const userUtility = new UserUtility();

const commandManager = new CommandManager(client);
const eventManager = new EventManager(client);

(async () => {
  await eventManager.reloadEvents();

  client.login();
})();

export {
  verificationUtility as VerificationUtility,
  messageUtility as MessageUtility,
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  userUtility as UserUtilty,
  eventManager as EventManager,
  commandManager as CommandManager
};
