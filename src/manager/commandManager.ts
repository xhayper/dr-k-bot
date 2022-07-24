import { APIApplicationCommand, Routes } from 'discord-api-types/v9';
import { SlashCommand } from '../base/slashCommand';
import { Client, Collection } from 'discord.js';
import { REST } from '@discordjs/rest';
import glob from 'glob';
import path from 'path';

export class CommandManager {
  #client: Client;
  #rest: REST;

  commands: Collection<string, SlashCommand> = new Collection();

  constructor(client: Client) {
    this.#client = client;
    this.#rest = new REST({ version: '9' }).setToken(client.token!);
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

    const currentCommand = (await this.#rest.get(
      Routes.applicationCommands(this.#client.user!.id)
    )) as APIApplicationCommand[];

    for (const command of currentCommand) {
      await this.#rest.delete(Routes.applicationCommand(this.#client.user!.id, command.id));
    }

    console.log(this.commands.map((slashCommand) => slashCommand.data.toJSON()));

    this.#rest.put(Routes.applicationCommands(this.#client.user!.id), {
      body: this.commands.map((slashCommand) => slashCommand.data.toJSON())
    });
  }
}
