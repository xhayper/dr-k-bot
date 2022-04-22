import { VerificationTicket, verificationTicketDataTypes } from './model/VerificationTicket';
import { Sequelize } from 'sequelize';
import path from 'path';

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: path.join(__dirname, '../../database.sqlite')
});

VerificationTicket.init(verificationTicketDataTypes, { sequelize });
VerificationTicket.sync();

export { VerificationTicket };
