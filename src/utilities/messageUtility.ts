import { Utility } from "@sapphire/plugin-utilities-store";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";
import { type SendableChannels, type Message, Attachment, AttachmentBuilder } from "discord.js";

@ApplyOptions<Utility.Options>({
  name: "message"
})
export class MessageUtility extends Utility {
  private attachmentStorageChannel: SendableChannels | null = null;

  public async load() {
    this.container.client.channels
      .fetch(config.channel["image-storage"], { allowUnknownGuild: true })
      .then((channel) => {
        if (!channel || !channel.isSendable()) return;
        this.attachmentStorageChannel = channel;
      });
  }

  public async transformMessage(
    message: Message,
    transformToPermenant: boolean = false
  ): Promise<{ text: string; attachmentMessage: Message | undefined }> {
    let attachmentMessage: Message | undefined;
    let attachments: Attachment[] = Array.from(message.attachments.values());

    if (transformToPermenant) {
      const transformResult = await this.transformToPermenantAttachment(Array.from(message.attachments.values()));
      attachmentMessage = transformResult.message;
      attachments = transformResult.attachments;
    }

    return {
      text: `${message.content}${message.content.trim() !== "" && attachments.length > 0 ? "\n\n" : ""}${attachments
        .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
        .join("\n")}`,
      attachmentMessage
    };
  }

  public async transformToPermenantAttachment(attachment: Attachment[]): Promise<{
    attachments: Attachment[];
    message?: Message;
  }> {
    if (0 >= attachment.length) return { attachments: [] };
    if (!this.attachmentStorageChannel) return { attachments: attachment };

    const message = await this.attachmentStorageChannel.send({
      files: attachment.map(
        (attachment) =>
          new AttachmentBuilder((attachment as any).attachment, {
            name: attachment.name ?? undefined,
            description: attachment.description ?? ""
          })
      )
    });

    if (!message) return { attachments: attachment };

    return {
      attachments: Array.from(message.attachments.values()),
      message
    };
  }

  public disableAllComponent(message: Message): Message {
    message.components = [];
    return message;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    message: MessageUtility;
  }
}
