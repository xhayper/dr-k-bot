import { MessageActionRow, MessageButton, type Message, type TextBasedChannel, type User } from 'discord.js';
import { VerificationTicket, type VerificationTicketType } from '../database';
import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { EmbedBuilder } from '@discordjs/builders';
import { randomUUID } from 'node:crypto';
import config from '../config';

export type PartialVerificationData = {
  id: string;
  discordId: string;
  answers: string;
};

export class VerificationUtility {
  public async deleteTicket(
    ticket: VerificationTicketType,
    deletetionData?: {
      deleteType: 'DECLINED' | 'ACCEPTED' | 'LEAVE';
      who?: User;
    }
  ): Promise<void> {
    await VerificationTicket.delete({ where: { id: ticket.id } });
    if (ticket.messageId != 'undefinded' && GuildUtility.verificationLogChannel) {
      let message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.messageId!).catch(() => undefined);
      if (!message) return;
      message = MessageUtility.disableAllComponent(message) as Message<true>;

      let embeds: EmbedBuilder[] | undefined;

      if (deletetionData) {
        embeds = message.embeds.map((embed) => {
          embed.setFooter({
            text:
              deletetionData.deleteType != 'LEAVE'
                ? `Ticket ${deletetionData.deleteType === 'DECLINED' ? 'declined' : 'accepted'} by ${
                    deletetionData.who!.tag
                  }`
                : `User left the server, Ticket deleted`
          });
          embed.setColor(['DECLINED', 'LEAVE'].includes(deletetionData.deleteType) ? 'RED' : 'GREEN');
          return new EmbedBuilder(embed.toJSON());
        });
      }

      await message.edit({
        content: message.content,
        embeds: embeds?.map((builder) => builder.toJSON()) || message.embeds,
        components: message.components
      });
    }
  }

  public async getTicketFromId(id: string): Promise<void | VerificationTicketType> {
    const ticket = await VerificationTicket.findUnique({ where: { id } });
    if (!ticket) return;
    return ticket;
  }

  public async getTicketFromMessageId(messageId: string): Promise<void | VerificationTicketType> {
    const ticket = await VerificationTicket.findUnique({ where: { messageId } });
    if (!ticket) return;
    return ticket;
  }

  public async getTicketsFromUserId(userId: string): Promise<void | VerificationTicketType[]> {
    const ticket = await VerificationTicket.findMany({ where: { discordId: userId } });
    if (!ticket) return;
    return ticket;
  }

  public async getMessageFromTicketId(ticketId: string): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const ticket = await this.getTicketFromId(ticketId);
    if (!ticket) return;

    return await this.getMessageFromTicket(ticket);
  }

  public async getMessageFromTicket(ticket: VerificationTicketType): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.messageId!).catch(() => undefined);
    if (!message) return;

    return message;
  }

  public async getUniqueTicketId(): Promise<string> {
    const ticketId = randomUUID();
    if (await VerificationTicket.findUnique({ where: { id: ticketId } })) return this.getUniqueTicketId();
    return ticketId;
  }

  public async sendTicketInformation(
    channel: TextBasedChannel,
    data: PartialVerificationData,
    addButton: boolean = true,
    pingVerificationTeam: boolean = true
  ): Promise<Message | void> {
    return await channel.send({
      content: pingVerificationTeam ? `<@&${config.role.verificationTeam}> | <@${data.discordId}>` : undefined,
      embeds: [(await EmbedUtility.VERIFICATION_INFO(data)).toJSON()],
      components: addButton
        ? [
            new MessageActionRow<MessageButton>().addComponents([
              new MessageButton().setLabel('Accept').setCustomId('verify_accept').setStyle('SUCCESS'),
              new MessageButton().setLabel('Decline').setCustomId('verify_decline').setStyle('DANGER'),
              new MessageButton().setLabel('Ticket').setCustomId('verify_ticket').setStyle('SECONDARY')
            ])
          ]
        : []
    });
  }
}
