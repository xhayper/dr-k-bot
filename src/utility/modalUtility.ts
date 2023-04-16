import { ModalBuilder, TextInputBuilder, ActionRowBuilder } from 'discord.js';
import config from '../config';

export class ModalUtility {
  static createApplicationModal(): ModalBuilder {
    const modal = new ModalBuilder();

    modal.setCustomId('verification');
    modal.setTitle('Verification');

    config.questions.forEach((question, index) => {
      modal.addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder(question).setCustomId(`question-${index + 1}`)
        ])
      ]);
    });

    return modal;
  }

  static createBanAppealModal(): ModalBuilder {
    const modal = new ModalBuilder();

    modal.setCustomId('ban_appeal');
    modal.setTitle('Ban Appeal');

    config.appealQuestions.forEach((question, index) => {
      modal.addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder(question).setCustomId(`question-${index + 1}`)
        ])
      ]);
    });

    return modal;
  }
}
