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

const embedUtility = new EmbedUtility();
const guildUtility = new GuildUtility(client);

const commandManager = new CommandManager(client);
const eventManager = new EventManager(client);

(async () => {
  await eventManager.reloadEvents();

  client.login();
})();

export {
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  eventManager as EventManager,
  commandManager as CommandManager
};
