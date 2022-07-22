import { ActionRowBuilder, ButtonBuilder, Message } from 'discord.js';

export class MessageUtility {
  async transformMessage(message: Message): Promise<string> {
    const msg = await message.fetch(true);
    return `${msg.content}${msg.content.trim() != '' && msg.attachments.size > 0 ? '\n\n' : ''}${Array.from(
      msg.attachments.values()
    )
      .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  disableAllComponent(message: Message): Message {
    message.components = [];
    return message;
  }
}
