import { PrismaClient, VerificationTicket as VerificationTicketType } from '@prisma/client';
import { container } from '@sapphire/framework';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }]
});

prisma.$on('query', (event) => {
  container.logger.debug('-- Database Query --');
  container.logger.debug(`Query: ${event.query}`);
  container.logger.debug(`Params: ${event.params}`);
  container.logger.debug(`Duration: ${event.duration}ms`);
});

export const VerificationTicket = prisma.verificationTicket;
export { VerificationTicketType };
