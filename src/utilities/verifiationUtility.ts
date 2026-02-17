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
import { Ticket } from "./ticketUtility";

@ApplyOptions<Utility.Options>({
  name: "verification"
})
export class VerificationUtility extends Utility {
  public async deleteTicket(
    ticketId: string,
    deletionData?: {
      deleteType: "DECLINED" | "ACCEPTED" | "LEAVE";
      who?: User;
    }
  ): Promise<void> {
    const ticket = await this.container.utilities.ticket.get(ticketId);
    if (!ticket) return;

    const verificationChannel = this.container.utilities.guild.verificationLogChannel;

    await this.container.utilities.ticket.remove(ticketId);

    if (!verificationChannel || !ticket.messageId) return;

    let message = await verificationChannel.messages.fetch(ticket.messageId).catch(() => undefined);

    if (!message) return;

    message = this.container.utilities.message.disableAllComponent(message) as Message<true>;

    let embeds: EmbedBuilder[] | undefined;

    if (deletionData) {
      embeds = message.embeds.map((embed) => {
        const builder = new EmbedBuilder(embed.data);

        builder.setFooter({
          text:
            deletionData.deleteType !== "LEAVE"
              ? `Ticket ${
                  deletionData.deleteType === "DECLINED" ? "declined" : "accepted"
                } by ${deletionData.who!.username}`
              : "User left the server, Ticket deleted"
        });

        builder.setColor(["DECLINED", "LEAVE"].includes(deletionData.deleteType) ? [255, 75, 75] : [75, 255, 75]);

        return builder;
      });
    }

    await message.edit({
      content: message.content,
      embeds: embeds?.map((b) => b.toJSON()) ?? message.embeds,
      components: message.components
    });
  }

  public async getTicketFromId(id: string) {
    return this.container.utilities.ticket.get(id);
  }

  public async getTicketFromUserId(userId: string) {
    return this.container.utilities.ticket.getByUser(userId);
  }

  public async getMessageFromTicketId(ticketId: string) {
    const ticket = await this.container.utilities.ticket.get(ticketId);
    if (!ticket?.messageId) return;

    const channel = this.container.utilities.guild.verificationLogChannel;
    if (!channel) return;

    return channel.messages.fetch(ticket.messageId).catch(() => undefined);
  }

  public async getUniqueTicketId(): Promise<string> {
    while (true) {
      const id = randomUUID();
      if (!(await this.container.utilities.ticket.has(id))) return id;
    }
  }

  public async sendTicketInformation(
    channel: SendableChannels,
    data: Ticket,
    addButton = true,
    pingVerificationTeam = true
  ): Promise<Message | void> {
    const message = await channel.send({
      content: pingVerificationTeam ? `<@&${config.role.verificationTeam}> | <@${data.discordId}>` : undefined,

      embeds: [(await this.container.utilities.embed.VERIFICATION_INFO(data)).toJSON()],

      components: addButton
        ? [
            new ActionRowBuilder<ButtonBuilder>().addComponents([
              new ButtonBuilder().setLabel("Accept").setCustomId("verify_accept").setStyle(ButtonStyle.Success),

              new ButtonBuilder().setLabel("Decline").setCustomId("verify_decline").setStyle(ButtonStyle.Danger),

              new ButtonBuilder()
                .setLabel("Reply")
                .setCustomId(`reply_${data.discordId}`)
                .setStyle(ButtonStyle.Primary),

              new ButtonBuilder().setLabel("Ticket").setCustomId("verify_ticket").setStyle(ButtonStyle.Secondary)
            ])
          ]
        : []
    });

    if (!message) return;

    const existingTicket = await this.container.utilities.ticket.get(data.id);

    if (existingTicket) {
      await this.container.utilities.ticket.edit(data.id, {
        discordId: existingTicket.discordId,
        answers: existingTicket.answers,
        messageId: message.id
      });
    }

    return message;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {
    verification: VerificationUtility;
  }
}
