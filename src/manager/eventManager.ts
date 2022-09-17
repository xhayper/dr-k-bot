import { ClientEvent } from '../base/clientEvent';
import { Client } from 'discord.js';
import path from 'node:path';
import glob from 'glob';

export class EventManager {
  private client: Client;

  constructor(client: Client) {
    this.client = client;
  }

  public async reloadEvents() {
    this.client.removeAllListeners();

    const eventPathList = glob.sync(path.join(__dirname, '../event/*.+(js|ts)'));

    for (const event of eventPathList) {
      delete require.cache[require.resolve(event)];

      const eventModule = (await import(event)).default as ClientEvent<any>;
      if (!eventModule.eventName) continue;

      ['on', 'once'].forEach((functionName) => {
        //@ts-expect-error
        if (!eventModule[functionName] || typeof eventModule[functionName] != 'function') return;
        // @ts-expect-error
        this.client[functionName](eventModule.eventName, (...args: any[]) =>
          // @ts-expect-error
          eventModule[functionName](this.client, ...args)
        );
      });
    }
  }
}
