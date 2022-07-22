import { ActionRowBuilder, ButtonBuilder, Message } from 'discord.js';

export class MessageUtility {
  transformMessage(message: Message): string {
    return `${message.content}${message.content.trim() != '' && message.attachments.size > 0 ? '\n\n' : ''}${Array.from(
      message.attachments.values()
    )
      .map((attachment, index) => `[| Attachment ${index + 1} | ${attachment.name} |](${attachment.proxyURL})`)
      .join('\n')}`;
  }

  disableAllComponent(message: Message): Message {
    message.components.map((actionRow) => {
      const actionRowBuilder = ActionRowBuilder.from(actionRow);
      return actionRowBuilder.setComponents(actionRowBuilder.components.map((component) => {
        return ButtonBuilder.from(component as any).setDisabled(true);
      })
      );
    });
    return message;
  }
}
