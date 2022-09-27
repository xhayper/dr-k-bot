import {
  MessageActionRow,
  MessageActionRowOptions,
  ModalActionRowComponent,
  ModalActionRowComponentResolvable,
  ModalOptions,
  TextInputComponent,
  TextInputComponentOptions
} from 'discord.js';

export const questions: TextInputComponentOptions[] = [
  {
    label: 'Where did you obtain the invite from?',
    required: true,
    minLength: 25,
    maxLength: 1024,
    style: 'PARAGRAPH'
  },
  {
    label: 'How old are you?',
    required: true,
    minLength: 1,
    maxLength: 3,
    style: 'SHORT'
  },
  {
    label: 'How do you know about Changed? (Be specific)',
    required: true,
    minLength: 50,
    maxLength: 1024,
    style: 'PARAGRAPH'
  },
  {
    label: 'Why do you like Changed? (Be Specific)',
    required: true,
    minLength: 50,
    maxLength: 1024,
    style: 'PARAGRAPH'
  },
  {
    label: "Who's your 2nd favorite character? and why?",
    required: true,
    minLength: 50,
    maxLength: 1024,
    style: 'PARAGRAPH'
  }
];

export class ModalUtility {
  // static createApplicationModal(): ModalBuilder {
  //   const modal = new ModalBuilder().setCustomId('verification').setTitle('Verification');

  //   questions.forEach((question, index) => {
  //     modal.addComponents([
  //       new ActionRowBuilder<TextInputBuilder>().addComponents(
  //         new TextInputBuilder(question as any).setCustomId(`question-${index + 1}`)
  //       )
  //     ]);
  //   });

  //   return modal;
  // }

  static createApplicationModal(): ModalOptions {
    const components:
      | MessageActionRow<ModalActionRowComponent>[]
      | MessageActionRowOptions<ModalActionRowComponentResolvable>[] = [] as any;

    questions.forEach((question, index) => {
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
