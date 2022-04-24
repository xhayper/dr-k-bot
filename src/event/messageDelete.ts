import { Client, Message, MessageEmbed, PartialMessage } from 'discord.js';
import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { TypedEvent } from '../base/clientEvent';

export default TypedEvent({
  eventName: 'messageDelete',
  on: async (_: Client, message: Message | PartialMessage) => {
    if (message.partial) return;

    GuildUtility.sendAuditLog({
      embeds: [
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
      ]
    });
  }
});
