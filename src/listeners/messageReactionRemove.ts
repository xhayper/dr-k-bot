import { type MessageReaction, type PartialMessageReaction, type User, type PartialUser } from "discord.js";
import { Listener } from "@sapphire/framework";

export class MessageReactionRemoveEvent extends Listener {
  public run(reaction: MessageReaction | PartialMessageReaction, user: User | PartialUser) {
    if (reaction.partial || user.partial) return;
    this.container.utilities.guild.sendAuditLog({
      embeds: [
        this.container.utilities.embed
          .ERROR_COLOR(
            this.container.utilities.embed
              .AUDIT_MESSAGE(user, `**🗑 Reaction on [message](${reaction.message.url}) was deleted!**`)
              .addFields([
                {
                  name: "Emoji",
                  value: reaction.emoji.imageURL({ size: 4096, extension: "png" })
                    ? `[\:${reaction.emoji.name}\:](${reaction.emoji.imageURL({ size: 4096, extension: "png" })})`
                    : reaction.emoji.name!
                }
              ])
          )
          .toJSON()
      ]
    });
  }
}
