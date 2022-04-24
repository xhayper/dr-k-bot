import { Client, Message, MessageEmbed, PartialMessage } from 'discord.js';
import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { TypedEvent } from '../base/clientEvent';
import config from '../config';

export default TypedEvent({
  eventName: 'messageDelete',
  on: async (_: Client, message: Message | PartialMessage) => {
    if (message.partial || message.author.bot || message.channel.id == config.channel.auditLog) return;

    GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.ERROR_COLOR(
          EmbedUtility.TIMESTAMP_NOW(
            EmbedUtility.USER_AUTHOR(
              new MessageEmbed({
                description: `**🗑 Message sent by ${message.author} deleted in ${
                  message.channel
                }**\n${MessageUtility.transformMessage(message)}`,
                footer: {
                  text: `Message ID: ${message.id}`
                }
              }),
              message.author
            )
          )
        )
      ]
    });
  }
});
