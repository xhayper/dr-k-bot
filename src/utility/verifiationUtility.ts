import { type VerificationTicketType, VerificationTicket } from '../database';
import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { randomUUID } from 'node:crypto';
import config from '../config';
import {
  type Message,
  type TextBasedChannel,
  type User,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder
} from 'discord.js';

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
    if (ticket.messageId !== 'undefinded' && GuildUtility.verificationLogChannel) {
      let message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.messageId!).catch(() => undefined);
      if (!message) return;
      message = MessageUtility.disableAllComponent(message) as Message<true>;

      let embeds: EmbedBuilder[] | undefined;

      if (deletetionData) {
        embeds = message.embeds.map((embed) => {
          const builder = new EmbedBuilder(embed.data);

          builder.setFooter({
            text:
              deletetionData.deleteType !== 'LEAVE'
                ? `Ticket ${deletetionData.deleteType === 'DECLINED' ? 'declined' : 'accepted'} by ${
                    deletetionData.who!.username
                  }`
                : `User left the server, Ticket deleted`
          });

          builder.setColor(['DECLINED', 'LEAVE'].includes(deletetionData.deleteType) ? [255, 75, 75] : [75, 255, 75]);

          return builder;
        });
      }

      await message.edit({
        content: message.content,
        embeds: embeds?.map((builder) => builder.toJSON()) ?? message.embeds,
        components: message.components
      });
    }
  }

  public getTicketFromId(id: string): Promise<null | VerificationTicketType> {
    return VerificationTicket.findUnique({ where: { id } });
  }

  public getTicketFromMessageId(messageId: string): Promise<null | VerificationTicketType> {
    return VerificationTicket.findUnique({ where: { messageId } });
  }

  public getTicketsFromUserId(userId: string): Promise<VerificationTicketType[]> {
    return VerificationTicket.findMany({ where: { discordId: userId } });
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
    if (await VerificationTicket.findUnique({ where: { id: ticketId } })) return await this.getUniqueTicketId();
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
