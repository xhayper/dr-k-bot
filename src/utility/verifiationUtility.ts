import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { Message, TextBasedChannel, User } from 'discord.js';
import { VerificationTicket } from '../database';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';

export type PartialVerificationData = {
  id: string;
  requesterDiscordId: string;
  answers: {
    firstAnswer: string;
    secondAnswer: string;
    thirdAnswer: string;
    fourthAnswer: string;
    fifthAnswer: string;
  };
};

export class VerificationUtility {
  async deleteTicket(
    ticket: VerificationTicket,
    deletetionData?: {
      deleteType: 'DECLINED' | 'ACCEPTED' | 'LEAVE';
      who?: User;
    }
  ): Promise<void> {
    await ticket.destroy();
    if (ticket.logMessageId != 'undefinded' && GuildUtility.verificationLogChannel) {
      let message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.logMessageId);
      if (!message) return;
      message = MessageUtility.disableAllComponent(message);

      if (deletetionData) {
        message.embeds.forEach((embed) => {
          embed.setFooter({
            text:
              deletetionData.deleteType != 'LEAVE'
                ? `Ticket ${deletetionData.deleteType === 'DECLINED' ? 'declined' : 'accepted'} by ${
                    deletetionData.who!.tag
                  }`
                : `User left the server, Ticket deleted`
          });
          embed.setColor(['DECLINED', 'LEAVE'].includes(deletetionData.deleteType) ? 'RED' : 'GREEN');
        });
      }

      await message.edit({
        content: message.content,
        attachments: message.attachments.map((attachment) => attachment),
        embeds: message.embeds,
        components: message.components
      });
    }
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

  async getTicketsFromUserId(userId: string): Promise<void | VerificationTicket[]> {
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

    const message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.logMessageId);
    if (!message) return;

    return message;
  }

  async getUniqueTicketId(): Promise<string> {
    const ticketId = uuidv4();
    if (await VerificationTicket.findOne({ where: { id: ticketId } })) return this.getUniqueTicketId();
    return ticketId;
  }

  async sendTicketInformation(
    channel: TextBasedChannel,
    data: PartialVerificationData,
    addButton: boolean = true,
    pingVerificationTeam: boolean = true
  ): Promise<Message | void> {
    return await channel.send({
      content: pingVerificationTeam ? `<@&${config.role.verificationTeam}> | <@${data.requesterDiscordId}>` : undefined,
      embeds: [await EmbedUtility.VERIFICATION_INFO(data)],
      components: addButton
        ? [
            {
              type: 'ACTION_ROW',
              components: [
                {
                  type: 'BUTTON',
                  label: 'Accept',
                  customId: 'verify_accept',
                  style: 'SUCCESS'
                },
                {
                  type: 'BUTTON',
                  label: 'Decline',
                  customId: 'verify_decline',
                  style: 'DANGER'
                },
                {
                  type: 'BUTTON',
                  label: 'Ticket',
                  customId: 'verify_ticket',
                  style: 'SECONDARY'
                }
              ]
            }
          ]
        : undefined
    });
  }
}
