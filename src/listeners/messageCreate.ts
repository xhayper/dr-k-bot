import { Listener } from "@sapphire/framework";
import { type Message } from "discord.js";
import path from "node:path";
import fs from "node:fs";

const insultList = JSON.parse(fs.readFileSync(path.join(__dirname, "../../insult.json"), "utf8")) as string[];

export class UserEvent extends Listener {
  public async run(message: Message) {
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
