import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { VerificationUtility } from './utility/verificationUtility';
import { ConfigUtility } from './utility/configUtility';
import { GuildUtility } from './utility/guildUtility';
import { EmbedUtility } from './utility/embedUtility';

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
      guild: new GuildUtility(this),
      verification: new VerificationUtility(),
      config: new ConfigUtility(),
      embed: new EmbedUtility()
    };
  }
}

declare module '@sapphire/pieces' {
  interface Container {
    utilities: {
      guild: GuildUtility;
      verification: VerificationUtility;
      config: ConfigUtility;
      embed: EmbedUtility;
    };
  }
}
