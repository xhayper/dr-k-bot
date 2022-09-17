import { VerificationTicket, verificationTicketDataTypes } from './model/VerificationTicket';
import { Sequelize } from 'sequelize';
import { Logger } from './logger';
import path from 'node:path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../database.sqlite'),
  logging: (sql: string, timing?: number) => {
    Logger.debug(`${sql} ${timing ? `(${timing.toString()}ms)` : ''}`);
  }
});

VerificationTicket.init(verificationTicketDataTypes, { sequelize });
VerificationTicket.sync();

export { VerificationTicket };
