// Load in enviroment variable
import 'dotenv/config';

// All the utility
import { VerificationUtility } from './utility/verifiationUtility';
import { MessageUtility } from './utility/messageUtility';
import { EmbedUtility } from './utility/embedUtility';
import { GuildUtility } from './utility/guildUtility';
import { UserUtility } from './utility/userUtility';

// Manager
import { CommandManager } from './manager/commandManager';
import { EventManager } from './manager/eventManager';

// All the required modules
import { Client, GatewayIntentBits } from 'discord.js';

const client = new Client({
  intents: [
    // DM
    GatewayIntentBits.DirectMessages,
    // Guild
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.GuildMessageReactions
  ]
});

const verificationUtility = new VerificationUtility();
const embedUtility = new EmbedUtility(client);
const messageUtility = new MessageUtility();
const userUtility = new UserUtility();

const commandManager = new CommandManager(client);
const eventManager = new EventManager(client);

(async () => {
  await eventManager.reloadEvents();
})();

client.login();

const guildUtility = new GuildUtility(client);

export {
  verificationUtility as VerificationUtility,
  messageUtility as MessageUtility,
  embedUtility as EmbedUtility,
  guildUtility as GuildUtility,
  userUtility as UserUtilty,
  eventManager as EventManager,
  commandManager as CommandManager
};
