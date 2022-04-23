import { Message, Snowflake } from 'discord.js';
import { GuildUtility } from '..';
import { VerificationTicket } from '../database';

export class VerificationUtility {
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

  async getMessageFromTicketId(ticketId: string): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const ticket = await this.getTicketFromId(ticketId);
    if (!ticket) return;

    return await this.getMessageFromTicket(ticket);
  }

  async getMessageFromTicket(ticket: VerificationTicket): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.messageId);
    if (!message) return;

    return message;
  }
}
