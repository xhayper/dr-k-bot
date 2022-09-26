import { PrismaClient, VerificationTicket as VerificationTicketType } from '@prisma/client';
import { Logger } from './logger';

const prisma = new PrismaClient({
  log: [{ emit: 'event', level: 'query' }]
});

prisma.$on('query', (event) => {
  Logger.debug('-- Database Query --');
  Logger.debug(`Query: ${event.query}`);
  Logger.debug(`Params: ${event.params}`);
  Logger.debug(`Duration: ${event.duration}ms`);
});

export const VerificationTicket = prisma.verificationTicket;
export { VerificationTicketType };
