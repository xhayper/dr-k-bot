import { MessageReaction, PartialMessageReaction, User, PartialUser } from 'discord.js';
import { EmbedUtility, GuildUtility } from '..';
import { Listener } from '@sapphire/framework';

export class UserEvent extends Listener {
  public run(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (reaction.partial || user.partial) return;
    GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.ERROR_COLOR(
          EmbedUtility.AUDIT_MESSAGE(
            user,
            `**🗑 Reaction on [message](${reaction.message.url}) was deleted!**`
          ).addFields([
            {
              name: 'Emoji',
              value: reaction.emoji.url ? `[\:${reaction.emoji.name}\:](${reaction.emoji.url})` : reaction.emoji.name!
            }
          ])
        ).toJSON()
      ]
    });
  }
}
