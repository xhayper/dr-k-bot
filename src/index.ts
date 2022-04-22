// Load in enviroment variable
import 'dotenv/config';

// All the utility
import { EmbedUtility } from './utility/embedUtility';
import { GuildUtility } from './utility/guildUtility';

// Manager
import { CommandManager } from './manager/commandManager';
import { EventManager } from './manager/eventManager';

// All the required modules
import { Client } from 'discord.js';
import { VerificationUtility } from './utility/verifiationUtility';

const client = new Client({
  intents: [
    // DM
    'DIRECT_MESSAGES',
    // Guild
    'GUILD_MEMBERS',
    'GUILDS',
    'GUILD_MESSAGES',
    'GUILD_MESSAGE_REACTIONS'
  ]
});

const verificationManager = new VerificationUtility();
const guildUtility = new GuildUtility(client);
const embedUtility = new EmbedUtility();

const commandManager = new CommandManager(client);
const eventManager = new EventManager(client);

(async () => {
  await eventManager.reloadEvents();

  client.login();
})();

export {
  verificationManager as VerificationManager,
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  
  eventManager as EventManager,
  commandManager as CommandManager
};
