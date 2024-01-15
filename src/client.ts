import { LogLevel, SapphireClient, container } from '@sapphire/framework';
import { PrismaClient } from '@prisma/client';

const database = new PrismaClient({
  log: [
    { emit: 'event', level: 'query' },
    { emit: 'event', level: 'error' },
    { emit: 'event', level: 'info' },
    { emit: 'event', level: 'warn' }
  ]
});

database.$on('query', (query) => {
  container.logger.debug('Database:', query.query, `(${query.params.slice(1, -1)})`, `(took ${query.duration}ms)`);
});

database.$on('error', (err) => {
  container.logger.info('Database:', err.message);
});

database.$on('info', (info) => {
  container.logger.info('Database:', info.message);
});

database.$on('warn', (warn) => {
  container.logger.warn('Database:', warn.message);
});

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
    container.database = database;
    await database.$connect();
    return super.login(token);
  }

  public override async destroy() {
    await database.$disconnect();
    return super.destroy();
  }
}

// Declare extra properties on the container
declare module '@sapphire/pieces' {
  interface Container {
    database: typeof database;
  }
}
