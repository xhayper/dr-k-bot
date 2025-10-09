// Load enviroment variable
import "dotenv/config";

// Load sapphire plugin
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-subcommands/register";

import { LogLevel, SapphireClient } from "@sapphire/framework";

const client = new SapphireClient({
  typing: true,
  logger: {
    level: process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info
  },
  intents: [
    "MessageContent",
    // DM
    "DirectMessages",
    // Guild
    "Guilds",
    "GuildMembers",
    "GuildMessages",
    "GuildMessageReactions"
  ]
});

client.login();
