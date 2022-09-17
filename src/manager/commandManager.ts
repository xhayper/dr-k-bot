import { Client, Collection, RESTPostAPIChatInputApplicationCommandsJSONBody } from 'discord.js';
import { EqualUtility } from '../utility/equalUtility';
import { SlashCommand } from '../base/slashCommand';
import { Logger } from '../logger';
import path from 'node:path';

import glob from 'glob';
export class CommandManager {
  private client: Client;

  commands: Collection<string, SlashCommand> = new Collection();

  constructor(client: Client) {
    this.client = client;
  }

  async reloadCommands() {
    this.commands.clear();

    const commandPathList = glob.sync(path.join(__dirname, '../command/*.+(js|ts)'));

    for (const command of commandPathList) {
      delete require.cache[require.resolve(command)];

      const commandModule = (await import(command)).default as SlashCommand;
      if (!commandModule.data) continue;
      this.commands.set(commandModule.data.name, commandModule);
    }

    if (!this.client.isReady()) return;

    const application = await this.client.application?.fetch();
    const fetchedGlobalCommands = await application.commands.fetch();

    for (const commandModule of this.commands.values()) {
      const globalAPICommand = fetchedGlobalCommands?.find((command) => command.name === commandModule.data.name);

      if (commandModule.guildId && commandModule.guildId.length > 0) {
        for (const guildId of commandModule.guildId) {
          const guild = await this.client.guilds.fetch(guildId);
          if (!guild) continue;

          Logger.info(`Checking guild command "${commandModule.data.name}" for guild "${guild.name}"`);

          const guildAPICommandList = await guild.commands.fetch();
          const guildAPICommand = guildAPICommandList.find((command) => command.name === commandModule.data.name);

          if (!guildAPICommand) {
            Logger.info(`Creating guild command "${commandModule.data.name}" for guild "${guild.name}"`);
            await guild.commands.create(commandModule.data);
            // TODO: Remove this when it is in stable
          } else if (
            !EqualUtility.isCommandEqual(
              guildAPICommand,
              commandModule.data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody
            )
          ) {
            Logger.info(`Updating guild command "${commandModule.data.name}" for guild "${guild.name}"`);
            await guild.commands.edit(guildAPICommand.id, commandModule.data);
          }

          for (const guildCommand of guildAPICommandList.values()) {
            const mod = this.commands.get(guildCommand.name);
            if (mod && mod.guildId && mod.guildId.includes(guildId)) continue;
            Logger.info(`Deleting guild command "${guildCommand.name}" for guild "${guild.name}"`);
            await guildCommand.delete();
          }
        }

        if (globalAPICommand) await globalAPICommand.delete();
      } else {
        Logger.info(`Checking global command "${commandModule.data.name}"`);

        if (!globalAPICommand) {
          Logger.info(`Creating global command "${commandModule.data.name}"`);
          await application.commands.create(commandModule.data);
          // TODO: Remove this when it is in stable
        } else if (
          !EqualUtility.isCommandEqual(
            globalAPICommand,
            commandModule.data.toJSON() as RESTPostAPIChatInputApplicationCommandsJSONBody
          )
        ) {
          Logger.info(`Updating global command "${commandModule.data.name}"`);
          await application.commands.edit(globalAPICommand.id, commandModule.data);
        }
      }
    }

    for (const globalCommand of fetchedGlobalCommands.values()) {
      if (this.commands.get(globalCommand.name)) continue;
      Logger.info(`Deleting global command "${globalCommand.name}"`);
      await globalCommand.delete();
    }
  }
}
