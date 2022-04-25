import { SlashCommand } from '../base/slashCommand';
import { Collection } from 'discord.js';
import glob from 'glob';
import path from 'path';

export class CommandManager {
  commands: Collection<string, SlashCommand> = new Collection();

  async reloadCommands() {
    this.commands.clear();

    const commandPathList = glob.sync(path.join(__dirname, '../command/*.+(js|ts)'));

    for (const command of commandPathList) {
      delete require.cache[require.resolve(command)];

      const commandModule = (await import(command)).default as SlashCommand;
      if (!commandModule.name) continue;
      this.commands.set(commandModule.name, commandModule);
    }
  }
}
