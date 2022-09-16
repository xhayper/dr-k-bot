import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputComponentData, TextInputStyle } from 'discord.js';

export const questions: (Partial<TextInputComponentData> & { label: string })[] = [
  {
    label: 'Where did you accept the invite link from?',
    required: true,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  },
  {
    label: 'How old are you?',
    required: true,
    minLength: 1,
    maxLength: 3,
    style: TextInputStyle.Short
  },
  {
    label: 'Where did you first heard about Changed?',
    required: true,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  },
  {
    label: 'Why do you enjoy Changed?',
    required: true,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  },
  {
    label: "Who's your second favorite character?",
    required: true,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  }
];

export class ModalUtility {
  static createApplicationModal(): ModalBuilder {
    const modal = new ModalBuilder().setCustomId('verification').setTitle('Verification');

    questions.forEach((question, index) => {
      modal.addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents(
          new TextInputBuilder(question).setCustomId(`question-${index + 1}`)
        )
      ]);
    });

    return modal;
  }
}
