import { EmbedUtility, GuildUtility, MessageUtility } from '..';
import { Message, PartialMessage } from 'discord.js';
import { Listener } from '@sapphire/framework';
import config from '../config';

export class UserEvent extends Listener {
  public async run(message: Message | PartialMessage) {
    if (
      message.partial ||
      message.author.bot ||
      message.channel.id == config.channel.auditLog ||
      message.channel.id == config.channel['image-storage'] ||
      !message.guild ||
      message.guild.id != config.guildId
    )
      return;

    GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.ERROR_COLOR(
          EmbedUtility.AUDIT_MESSAGE(
            message.author,
            `**🗑 Message sent by ${message.author} deleted in ${
              message.channel
            }**\n${await MessageUtility.transformMessage(message, true)}`
          ).setFooter({
            text: `Message ID: ${message.id}`
          })
        ).toJSON()
      ]
    });
  }
}
