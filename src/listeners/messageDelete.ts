import { type Message, type PartialMessage } from "discord.js";
import { Listener } from "@sapphire/framework";
import config from "../config";

export class MessageDeleteEvent extends Listener {
  public async run(message: Message | PartialMessage) {
    if (
      message.partial ||
      message.author.bot ||
      message.channel.id === config.channel.auditLog ||
      message.channel.id === config.channel["image-storage"] ||
      !message.guild ||
      message.guild.id !== config.guildId
    )
      return;

    const { text, attachmentMessage: imageMessage } = await this.container.utilities.message.transformMessage(
      message,
      true
    );

    const auditMessage = await this.container.utilities.guild.sendAuditLog({
      embeds: [
        this.container.utilities.embed
          .ERROR_COLOR(
            this.container.utilities.embed
              .AUDIT_MESSAGE(
                message.author,
                `**🗑 Message sent by ${message.author} deleted in ${message.channel}**\n${text}`
              )
              .setFooter({
                text: `Message ID: ${message.id}`
              })
          )
          .toJSON()
      ]
    });

    if (auditMessage && imageMessage) imageMessage.edit(`For this log: <${auditMessage.url}>`);
  }
}
