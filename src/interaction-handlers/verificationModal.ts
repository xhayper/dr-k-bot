import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ModalSubmitInteraction } from 'discord.js';
import { GuildUtility, VerificationUtility } from '..';
import { ApplyOptions } from '@sapphire/decorators';
import { VerificationTicket } from '../database';
import config from '../config';

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class Handler extends InteractionHandler {
  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const randomTicketId = await VerificationUtility.getUniqueTicketId();

    const transformedAnswer = config.questions.map((quest, index) => ({
      question: quest.label,
      answer: interaction.fields.getTextInputValue(`question-${index + 1}`)
    }));

    const emptyAnswer = transformedAnswer.filter(
      (answerData) => !answerData.answer || 0 >= answerData.answer.trim().length
    );

    if (emptyAnswer.length > 0)
      return void (await interaction.editReply({
        content: `Answer for question ${emptyAnswer.join(', ')} is empty!`
      }));

    const shortAnswer = transformedAnswer.filter((answerData, index) => {
      const question = config.questions[index];
      return question.minLength && question.minLength > answerData.answer.trim().length;
    });

    if (shortAnswer.length > 0)
      return void (await interaction.editReply({
        content: `Answer for question ${emptyAnswer.join(', ')} is too short!`
      }));

    const verificationData = {
      id: randomTicketId,
      discordId: interaction.user.id,
      messageId: 'undefined',
      answers: JSON.stringify(transformedAnswer)
    };

    if (GuildUtility.verificationLogChannel) {
      const verifyMessage = await VerificationUtility.sendTicketInformation(
        GuildUtility.verificationLogChannel,
        verificationData
      );
      verificationData.messageId = verifyMessage ? verifyMessage.id : 'undefined';
    }

    await VerificationTicket.create({ data: verificationData });

    await interaction.editReply({ content: 'Your submission was received successfully!' });
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'verification') return this.none();

    return this.some();
  }
}
