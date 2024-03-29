import { type SapphireClient } from '@sapphire/framework';
import config from '../config';
import {
  type GuildTextBasedChannel,
  type Message,
  Attachment,
  AttachmentBuilder,
  StageChannel,
  ChannelType
} from 'discord.js';

export class MessageUtility {
  private client: SapphireClient;
  private imageStorageChannel: Exclude<GuildTextBasedChannel, StageChannel> | null = null;

  constructor(client: SapphireClient) {
    this.client = client;
    this.client.channels.fetch(config.channel['image-storage'], { allowUnknownGuild: true }).then((channel) => {
      if (!channel || !channel.isTextBased() || channel.isDMBased() || channel.type === ChannelType.GuildStageVoice)
        return;
      this.imageStorageChannel = channel;
    });
  }

  public async transformMessage(
    message: Message,
    transformToPermenant: boolean = false
  ): Promise<{ text: string; imageMessage: Message | undefined }> {
    let imageMessage: Message | undefined;
    let imageAttachments: Attachment[] = Array.from(message.attachments.values());

    if (transformToPermenant) {
      const transformResult = await this.transformToPermenantImage(Array.from(message.attachments.values()));
      imageMessage = transformResult.message;
      imageAttachments = transformResult.attachments;
    }

    return {
      text: `${message.content}${
        message.content.trim() !== '' && imageAttachments.length > 0 ? '\n\n' : ''
      }${imageAttachments
        .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
        .join('\n')}`,
      imageMessage
    };
  }

  public async transformToPermenantImage(attachment: Attachment[]): Promise<{
    attachments: Attachment[];
    message?: Message;
  }> {
    if (0 >= attachment.length) return { attachments: [] };
    if (!this.imageStorageChannel) return { attachments: attachment };

    const message = await this.imageStorageChannel.send({
      files: attachment.map(
        (attachment) =>
          new AttachmentBuilder((attachment as any).attachment, {
            name: attachment.name ?? undefined,
            description: attachment.description ?? ''
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
