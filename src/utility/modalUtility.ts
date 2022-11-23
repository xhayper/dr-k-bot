import config from '../config';
import {
  MessageActionRow,
  TextInputComponent,
  type MessageActionRowOptions,
  type ModalActionRowComponent,
  type ModalActionRowComponentResolvable,
  type ModalOptions
} from 'discord.js';

export class ModalUtility {
  static createApplicationModal(): ModalOptions {
    const components:
      | MessageActionRow<ModalActionRowComponent>[]
      | MessageActionRowOptions<ModalActionRowComponentResolvable>[] = [] as any;

    config.questions.forEach((question, index) => {
      components.push(
        new MessageActionRow<TextInputComponent>().addComponents([
          new TextInputComponent(question).setCustomId(`question-${index + 1}`)
        ])
      );
    });

    return {
      customId: 'verification',
      title: 'Verification',
      components
    };
  }
}
