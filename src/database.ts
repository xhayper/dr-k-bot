import { PrismaClient } from '@prisma/client';
import { container } from '@sapphire/pieces';

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

container.database = database;

declare module '@sapphire/pieces' {
  interface Container {
    database: typeof database;
  }
}

export { database };
