import { DataTypes, Model, ModelAttributes } from 'sequelize';

export class VerificationTicket extends Model {
  declare id: string;
  declare requesterDiscordId: string;
  declare logMessageId: string;
  declare answers: {
    question: string;
    answer: string;
  }[];
}

export const verificationTicketDataTypes: ModelAttributes = {
  id: {
    type: DataTypes.TEXT,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  requesterDiscordId: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  logMessageId: {
    type: DataTypes.TEXT,
    unique: true,
    allowNull: false
  },
  answers: {
    type: DataTypes.JSON,
    unique: false,
    allowNull: false
  }
};
