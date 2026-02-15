import { type VerificationTicketType, VerificationTicket } from "../database";
import { Utility } from "@sapphire/plugin-utilities-store";
import { ApplyOptions } from "@sapphire/decorators";
import { randomUUID } from "node:crypto";
import config from "../config";
import {
  type Message,
  type User,
  ActionRowBuilder,
  ButtonBuilder,
  ButtonStyle,
  EmbedBuilder,
  SendableChannels
} from "discord.js";

export type PartialVerificationData = {
  id: string;
  discordId: string;
  answers: string;
};

@ApplyOptions<Utility.Options>({
  name: "verification"
})
export class VerificationUtility extends Utility {
  public async deleteTicket(
    ticket: VerificationTicketType,
    deletetionData?: {
      deleteType: "DECLINED" | "ACCEPTED" | "LEAVE";
      who?: User;
    }
  ): Promise<void> {
    await VerificationTicket.delete({ where: { id: ticket.id } });
    if (ticket.messageId !== "undefinded" && this.container.utilities.guild.verificationLogChannel) {
      let message = await this.container.utilities.guild.verificationLogChannel.messages
        .fetch(ticket.messageId!)
        .catch(() => undefined);
      if (!message) return;
      message = this.container.utilities.message.disableAllComponent(message) as Message<true>;

      let embeds: EmbedBuilder[] | undefined;

      if (deletetionData) {
        embeds = message.embeds.map((embed) => {
          const builder = new EmbedBuilder(embed.data);

          builder.setFooter({
            text:
              deletetionData.deleteType !== "LEAVE"
                ? `Ticket ${deletetionData.deleteType === "DECLINED" ? "declined" : "accepted"} by ${
                    deletetionData.who!.username
                  }`
                : `User left the server, Ticket deleted`
          });

          builder.setColor(["DECLINED", "LEAVE"].includes(deletetionData.deleteType) ? [255, 75, 75] : [75, 255, 75]);

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
    if (!this.container.utilities.guild.verificationLogChannel) return;

    const ticket = await this.getTicketFromId(ticketId);
    if (!ticket) return;

    return await this.getMessageFromTicket(ticket);
  }

  public async getMessageFromTicket(ticket: VerificationTicketType): Promise<void | Message> {
    if (!this.container.utilities.guild.verificationLogChannel) return;

    const message = await this.container.utilities.guild.verificationLogChannel.messages
      .fetch(ticket.messageId!)
      .catch(() => undefined);
    if (!message) return;

    return message;
  }

  public async getUniqueTicketId(): Promise<string> {
    const ticketId = randomUUID();
    if (await VerificationTicket.findUnique({ where: { id: ticketId } })) return await this.getUniqueTicketId();
    return ticketId;
  }

  public async sendTicketInformation(
    channel: SendableChannels,
    data: PartialVerificationData,
    addButton: boolean = true,
    pingVerificationTeam: boolean = true
  ): Promise<Message | void> {
    return await channel.send({
      content: pingVerificationTeam ? `<@&${config.role.verificationTeam}> | <@${data.discordId}>` : undefined,
      embeds: [(await this.container.utilities.embed.VERIFICATION_INFO(data)).toJSON()],
      components: addButton
        ? [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              new ButtonBuilder().setLabel("Accept").setCustomId("verify_accept").setStyle(ButtonStyle.Success),
              new ButtonBuilder().setLabel("Decline").setCustomId("verify_decline").setStyle(ButtonStyle.Danger),
              new ButtonBuilder().setLabel("Reply").setCustomId(`reply_${data.discordId}`).setStyle(ButtonStyle.Primary),
              new ButtonBuilder().setLabel("Ticket").setCustomId("verify_ticket").setStyle(ButtonStyle.Secondary)
            ])
          ]
        : []
    });
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    verification: VerificationUtility;
  }
}
