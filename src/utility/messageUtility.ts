import { Message } from 'discord.js';

export class MessageUtility {
  transformMessage(message: Message): string {
    return `${message.content}${message.content.trim() != '' && message.attachments.size > 0 ? '\n\n' : ''}${Array.from(
      message.attachments.values()
    )
      .map((attachment, index) => `[Attachment ${index + 1} | ${attachment.name}](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  disableAllComponent(message: Message): Message {
    message.components.forEach((actionRow) => {
      actionRow.components.forEach((component) => {
        component.setDisabled(true);
      });
    });
    return message;
  }
}
