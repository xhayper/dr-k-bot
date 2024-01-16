import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { type ConfigType, readConfig } from './config';
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
  }

  public override async login(token?: string) {
    container.utilities = {
      guild: new GuildUtility(this)
    };

    const readConfigResult = await readConfig();

    if (readConfigResult.isErr()) {
      const err = readConfigResult.unwrapErr();
      container.logger.fatal(readConfigResult.unwrapErr());

      // TODO: Find a better way to handle this
      throw err;
    } else {
      container.config = readConfigResult.unwrap();
    }

    return super.login(token);
  }

  public override async destroy() {
    return super.destroy();
  }
}

// Declare extra properties on the container
declare module '@sapphire/pieces' {
  interface Container {
    config: ConfigType;
    utilities: {
      guild: GuildUtility;
    };
  }
}
