import { SlashCommand } from '../base/slashCommand';
import { Client, Collection } from 'discord.js';
import { APIApplicationCommandBase, SlashRegister } from 'slash-register';
import glob from 'glob';
import path from 'path';

export class CommandManager {
  commands: Collection<string, SlashCommand> = new Collection();

  #slashRegister: SlashRegister;
  #client: Client;

  constructor(client: Client) {
    this.#slashRegister = new SlashRegister();
    this.#client = client;
  }

  async reloadCommands() {
    this.#slashRegister.login(this.#client.token!);

    this.#slashRegister.clearGlobalCommand();
    this.#slashRegister.clearGuildCommand();

    this.commands.clear();

    const commandPathList = glob.sync(path.join(__dirname, '../command/*.+(js|ts)'));

    for (const command of commandPathList) {
      delete require.cache[require.resolve(command)];

      const commandModule = (await import(command)).default as SlashCommand;
      if (!commandModule.data) continue;
      this.commands.set(commandModule.data.name, commandModule);
      this.#slashRegister.addGlobalCommand(commandModule.data.toJSON() as APIApplicationCommandBase);
    }

    await this.#slashRegister.syncAll();
  }
}
