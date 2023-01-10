import { type GuildTextBasedChannel, type Message, Attachment, AttachmentBuilder } from 'discord.js';
import { type SapphireClient } from '@sapphire/framework';
import config from '../config';

export class MessageUtility {
  private client: SapphireClient;
  private imageStorageChannel: GuildTextBasedChannel | null = null;

  constructor(client: SapphireClient) {
    this.client = client;
    this.client.channels.fetch(config.channel['image-storage'], { allowUnknownGuild: true }).then((channel) => {
      if (!channel || !channel.isTextBased() || channel.isDMBased()) return;
      this.imageStorageChannel = channel;
    });
  }

  public async transformMessage(
    message: Message,
    transformToPermenant: boolean = false,
    exposeOrigin: boolean = false
  ): Promise<string> {
    return `${message.content}${
      message.content.trim() !== '' && message.attachments.size > 0 ? '\n\n' : ''
    }${(transformToPermenant
      ? await this.transformToPermenantImage(
          Array.from(message.attachments.values()),
          exposeOrigin ? message : undefined
        )
      : Array.from(message.attachments.values())
    )
      .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  public async transformToPermenantImage(attachment: Attachment[], originMessage?: Message): Promise<Attachment[]> {
    if (0 >= attachment.length) return [];
    if (!this.imageStorageChannel) return attachment;

    const message = await this.imageStorageChannel.send({
      content: originMessage ? `For <${originMessage.url}>` : undefined,
      files: attachment.map(
        (attachment) =>
          new AttachmentBuilder(attachment.attachment, {
            name: attachment.name ?? undefined,
            description: attachment.description ?? ''
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
