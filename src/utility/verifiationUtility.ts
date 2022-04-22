import { Message } from 'discord.js';
import { VerificationTicket } from '../database';

export class VerificationUtility {
  async getTicketFromMessage(message: Message): Promise<void | VerificationTicket> {
    return await this.getTicketFromMessageId(message.id);
  }

  async getTicketFromId(id: string): Promise<void | VerificationTicket> {
    const ticket = await VerificationTicket.findOne({ where: { id } });
    if (!ticket) return;
    return ticket;
  }

  async getTicketFromMessageId(messageId: string): Promise<void | VerificationTicket> {
    const ticket = await VerificationTicket.findOne({ where: { messageId } });
    if (!ticket) return;
    return ticket;
  }

  async getTicketsFromUser(userId: string): Promise<void | VerificationTicket[]> {
    const ticket = await VerificationTicket.findAll({ where: { userId } });
    if (!ticket) return;
    return ticket;
  }
}
