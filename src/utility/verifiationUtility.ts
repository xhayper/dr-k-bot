import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { VerificationTicket } from '../database';
import crypto, { randomUUID } from 'node:crypto';
import config from '../config';
import {
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  Colors,
  EmbedBuilder,
  Message,
  TextBasedChannel,
  User
} from 'discord.js';

export type PartialVerificationData = {
  id: string;
  requesterDiscordId: string;
  answers: {
    question: string;
    answer: string;
  }[];
};

export class VerificationUtility {
  public async deleteTicket(
    ticket: VerificationTicket,
    deletetionData?: {
      deleteType: 'DECLINED' | 'ACCEPTED' | 'LEAVE';
      who?: User;
    }
  ): Promise<void> {
    await ticket.destroy();
    if (ticket.logMessageId != 'undefinded' && GuildUtility.verificationLogChannel) {
      let message = await GuildUtility.verificationLogChannel.messages
        .fetch(ticket.logMessageId)
        .catch(() => undefined);
      if (!message) return;
      message = MessageUtility.disableAllComponent(message) as Message<true>;

      let embeds: EmbedBuilder[] | undefined;

      if (deletetionData) {
        embeds = message.embeds.map((embed) => {
          const embedBuilder = EmbedBuilder.from(embed);
          embedBuilder.setFooter({
            text:
              deletetionData.deleteType != 'LEAVE'
                ? `Ticket ${deletetionData.deleteType === 'DECLINED' ? 'declined' : 'accepted'} by ${
                    deletetionData.who!.tag
                  }`
                : `User left the server, Ticket deleted`
          });
          embedBuilder.setColor(['DECLINED', 'LEAVE'].includes(deletetionData.deleteType) ? Colors.Red : Colors.Green);
          return embedBuilder;
        });
      }

      await message.edit({
        content: message.content,
        embeds: embeds || message.embeds,
        components: message.components
      });
    }
  }

  public async getTicketFromId(id: string): Promise<void | VerificationTicket> {
    const ticket = await VerificationTicket.findOne({ where: { id } });
    if (!ticket) return;
    return ticket;
  }

  public async getTicketFromMessageId(messageId: string): Promise<void | VerificationTicket> {
    const ticket = await VerificationTicket.findOne({ where: { logMessageId: messageId } });
    if (!ticket) return;
    return ticket;
  }

  public async getTicketsFromUserId(userId: string): Promise<void | VerificationTicket[]> {
    const ticket = await VerificationTicket.findAll({ where: { requesterDiscordId: userId } });
    if (!ticket) return;
    return ticket;
  }

  public async getMessageFromTicketId(ticketId: string): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const ticket = await this.getTicketFromId(ticketId);
    if (!ticket) return;

    return await this.getMessageFromTicket(ticket);
  }

  public async getMessageFromTicket(ticket: VerificationTicket): Promise<void | Message> {
    if (!GuildUtility.verificationLogChannel) return;

    const message = await GuildUtility.verificationLogChannel.messages
      .fetch(ticket.logMessageId)
      .catch(() => undefined);
    if (!message) return;

    return message;
  }

  public async getUniqueTicketId(): Promise<string> {
    const ticketId = randomUUID();
    if (await VerificationTicket.findOne({ where: { id: ticketId } })) return this.getUniqueTicketId();
    return ticketId;
  }

  public async sendTicketInformation(
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
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              new ButtonBuilder().setLabel('Accept').setCustomId('verify_accept').setStyle(ButtonStyle.Success),
              new ButtonBuilder().setLabel('Decline').setCustomId('verify_decline').setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setLabel('Ticket').setCustomId('verify_ticket').setStyle(ButtonStyle.Secondary)
            ])
          ]
        : []
    });
  }
}
