import { Attachment, AttachmentBuilder, Client, Message, TextBasedChannel } from 'discord.js';
import config from '../config';

export class MessageUtility {
  private client: Client;
  private imageStorageChannel: TextBasedChannel | null = null;

  constructor(client: Client) {
    this.client = client;
    this.client.channels.fetch(config.channel['image-storage'], { allowUnknownGuild: true }).then((channel) => {
      if (!channel?.isTextBased()) return;
      this.imageStorageChannel = channel;
    });
  }

  public async transformMessage(message: Message, transformToPermenant: boolean = false): Promise<string> {
    return `${message.content}${
      message.content.trim() != '' && message.attachments.size > 0 ? '\n\n' : ''
    }${(transformToPermenant
      ? await this.transformToPermenantImage(Array.from(message.attachments.values()))
      : Array.from(message.attachments.values())
    )
      .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  public async transformToPermenantImage(attachment: Attachment[]): Promise<Attachment[]> {
    if (!this.imageStorageChannel) return attachment;

    const message = await this.imageStorageChannel.send({
      files: attachment.map(
        (attachment) =>
          new AttachmentBuilder(attachment.attachment, {
            name: attachment.name ?? undefined,
            description: attachment.description ?? undefined
          })
      )
    });

    if (!message) return attachment;

    return Array.from(message.attachments.values());
  }

  public disableAllComponent(message: Message): Message {
    message.components = [];
    return message;
  }
}
