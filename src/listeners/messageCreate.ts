import { AttachmentBuilder, type Message } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Listener } from "@sapphire/framework";
import path from "node:path";
import fs from "node:fs";

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, "../../insult.json"), "utf8")) as string[];

@ApplyOptions<Listener.Options>({
  event: "messageCreate"
})
export class MessageCreateEvent extends Listener {
  public async run(message: Message) {
    if (message.author.id === this.container.client.id) return;
    if (message.type != 0) return;
    if (message.channel.isDMBased()) {
      this.container.utilities.guild.dmLogChannel?.send({
        files: Array.from(message.attachments.values()).map((attachment) =>
          new AttachmentBuilder((attachment as any).attachment, {
            name: attachment.name ?? undefined,
            description: attachment.description ?? ""
          }).setSpoiler(attachment.spoiler)
        ),
        embeds: [
          {
            author: {
              name: message.author.username,
              icon_url:
                message.author.avatarURL({
                  size: 4096
                }) ?? message.author.defaultAvatarURL
            },
            description: message.content || "(No content)",
            timestamp: new Date().toISOString()
          }
        ],
        components: [
          {
            type: 1,
            components: [
              {
                type: 2,
                customId: `reply_${message.author.id}_${message.id}`,
                label: "Reply",
                style: 1
              }
            ]
          }
        ]
      });
    } else {
      const splitText = message.content.split(" ");
      if (
        message.mentions.users.size === 1 &&
        splitText.length === 1 &&
        [`<@${this.container.client.user!.id}>`, `<@!${this.container.client.user!.id}>`].some(
          (mentionText) => splitText[0] === mentionText
        )
      ) {
        return await message.reply({
          content: insultList[Math.floor(Math.random() * insultList.length)],
          allowedMentions: {
            repliedUser: false
          }
        });
      }
    }
  }
}
