import { ActionRowBuilder, ModalBuilder, TextInputBuilder, TextInputComponentData, TextInputStyle } from 'discord.js';

export const questions: (Partial<TextInputComponentData> & { label: string })[] = [
  {
    label: 'Where did you obtain the invite from?',
    required: true,
    minLength: 100,
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
    label: 'How do you know about Changed? (Be specific)',
    required: true,
    minLength: 100,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  },
  {
    label: 'Why do you like Changed? (Be Specific)',
    required: true,
    minLength: 100,
    maxLength: 1024,
    style: TextInputStyle.Paragraph
  },
  {
    label: "Who's your second favorite character?",
    required: true,
    minLength: 100,
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
