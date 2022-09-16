import { Message } from 'discord.js';

export class MessageUtility {
  public async transformMessage(message: Message): Promise<string> {
    return `${message.content}${message.content.trim() != '' && message.attachments.size > 0 ? '\n\n' : ''}${Array.from(
      message.attachments.values()
    )
      .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  public disableAllComponent(message: Message): Message {
    message.components = [];
    return message;
  }
}
