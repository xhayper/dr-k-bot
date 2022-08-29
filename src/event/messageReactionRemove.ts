import { Client, MessageReaction, PartialMessageReaction, PartialUser, User } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import { EmbedUtility, GuildUtility } from '..';

export default TypedEvent({
  eventName: 'messageReactionRemove',
  on: async (_: Client, reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) => {
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
        )
      ]
    });
  }
});
