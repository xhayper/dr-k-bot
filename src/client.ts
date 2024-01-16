import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { GuildUtility } from './utility/guildUtility';

export class DrKClient extends SapphireClient {
  public constructor() {
    super({
      intents: [
        'MessageContent',
        // DM
        'DirectMessages',
        // Guild
        'Guilds',
        'GuildMembers',
        'GuildMessages',
        'GuildMessageReactions'
      ],
      logger: {
        level: process.env.NODE_ENV === 'development' ? LogLevel.Debug : LogLevel.Info
      }
    });

    container.utilities = {
      guild: new GuildUtility(this)
    };
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    utilities: {
      guild: GuildUtility;
    };
  }
}
