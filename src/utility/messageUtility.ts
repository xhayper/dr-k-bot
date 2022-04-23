import { Message } from 'discord.js';

export class MessageUtility {
  transformMessage(message: Message): string {
    return `${message.content}${message.content.trim() != '' && message.attachments.size > 0 ? '\n\n' : ''}${Array.from(
      message.attachments.values()
    )
      .map((attachment, index) => `[Attachment ${index + 1}](${attachment.proxyURL})`)
      .join('\n')}`;
  }
}
