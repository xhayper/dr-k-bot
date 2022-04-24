import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { Client, Message, PartialMessage } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import config from '../config';

export default TypedEvent({
  eventName: 'messageDelete',
  on: async (_: Client, message: Message | PartialMessage) => {
    if (message.partial || message.author.bot || message.channel.id == config.channel.auditLog) return;

    GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.ERROR_COLOR(
          EmbedUtility.AUDIT_MESSAGE(
            message.author,
            `**🗑 Message sent by ${message.author} deleted in ${message.channel}**\n${MessageUtility.transformMessage(
              message
            )}`
          ).setFooter({
            text: `Message ID: ${message.id}`
          })
        )
      ]
    });
  }
});
