// Load enviroment variable
import "dotenv/config";

// Load sapphire plugin
import "@sapphire/plugin-logger/register";
import "@sapphire/plugin-utilities-store/register";
import "@sapphire/plugin-subcommands/register";

import { LogLevel, SapphireClient } from "@sapphire/framework";
import { Partials } from "discord.js";

const client = new SapphireClient({
  typing: true,
  logger: {
    level: process.env.NODE_ENV === "development" ? LogLevel.Debug : LogLevel.Info
  },
  partials: [Partials.Message, Partials.Channel],
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
