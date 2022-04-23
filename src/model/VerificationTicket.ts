import { DataTypes, Model, ModelAttributes } from 'sequelize';

export class VerificationTicket extends Model {
  declare id: string;
  declare senderId: string;
  declare messageId: string;
  declare answers: {
    firstAnswer: string;
    secondAnswer: string;
    thirdAnswer: string;
    fourthAnswer: string;
    fifthAnswer: string;
  };
}

export const verificationTicketDataTypes: ModelAttributes = {
  id: {
    type: DataTypes.TEXT,
    primaryKey: true,
    unique: true,
    allowNull: false
  },
  senderId: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  messageId: {
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
