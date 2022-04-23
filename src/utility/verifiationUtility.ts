import { Client, Message, MessageEmbed, TextBasedChannel, User } from 'discord.js';
import { VerificationTicket } from '../database';
import { EmbedUtility, GuildUtility } from '..';
import { v4 as uuidv4 } from 'uuid';
import config from '../config';
import moment from 'moment';

export class VerificationUtility {
  #client: Client;

  constructor(client: Client) {
    this.#client = client;
  }

  async deleteTicket(
    ticket: VerificationTicket,
    deletetionData?: {
      deleteType: 'DECLINED' | 'ACCEPTED';
      who: User;
    }
  ): Promise<void> {
    await ticket.destroy();
    if (ticket.messageId != 'undefinded' && GuildUtility.verificationLogChannel) {
      const message = await GuildUtility.verificationLogChannel.messages.fetch(ticket.messageId);
      if (!message) return;
      message.components.forEach((actionRow) => {
        actionRow.components.forEach((component) => {
          component.setDisabled(true);
        });
      });

      if (deletetionData) {
        message.embeds.forEach((embed) => {
          embed.setFooter({
            text: `Ticket ${deletetionData.deleteType === 'DECLINED' ? 'declined' : 'accepted'} by ${
              deletetionData.who.tag
            }`
          });
          embed.setColor(deletetionData.deleteType === 'DECLINED' ? 'RED' : 'GREEN');
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

  async getUniqueTicketId(): Promise<string> {
    const ticketId = uuidv4();
    if (await VerificationTicket.findOne({ where: { id: ticketId } })) return this.getUniqueTicketId();
    return ticketId;
  }

  async sendTicketInformation(
    channel: TextBasedChannel,
    data: {
      id: string;
      senderId: string;
      answers: {
        firstQuestion: string;
        secondAnswer: string;
        thirdAnswer: string;
        fourthAnswer: string;
        fifthAnswer: string;
      };
    },
    addButton: boolean = true,
    pingVerificationTeam: boolean = true
  ): Promise<Message | void> {
    const targetUser = await this.#client.users.fetch(data.senderId);

    const baseEmbed = new MessageEmbed();
    baseEmbed.addField(
      `Ticket Information`,
      `**User**: ${targetUser}\n**Account creation date**: ${moment(targetUser.createdAt).format(
        'MMMM Do YYYY'
      )}\n**Ticket ID**: ${data.id}`
    );
    baseEmbed.setThumbnail(targetUser.displayAvatarURL({ dynamic: true, size: 4096 }) || targetUser.defaultAvatarURL);

    const questionList = config.questions;

    for (const [index, value] of Object.entries(Object.values(data.answers))) {
      const currentIndex = parseInt(index);
      baseEmbed.addField(questionList[currentIndex], value, true);
    }

    return await channel.send({
      content: pingVerificationTeam ? `<@&${config.role.verificationTeam}> | <@${data.senderId}>` : undefined,
      embeds: [EmbedUtility.SUCCESS_COLOR(baseEmbed)],
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
