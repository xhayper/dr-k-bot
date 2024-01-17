import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ModalSubmitInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class RequestVerificationModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'request_verification_modal') return this.none();
    return this.some();
  }

  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    if (await this.container.utilities.verification.isUserPendingVerification(interaction.user.id)) {
      await interaction.editReply({ content: 'You are already pending verification!' });
      return;
    }

    const verificationData = this.container.config.verificationQuestions.map((data, index) => ({
      question: data.label,
      answer: interaction.fields.getTextInputValue(index.toString())
    }));

    const verificationRequestAndLogResult = await this.container.utilities.verification.createVerificationRequestAndLog(
      interaction.user.id,
      verificationData
    );

    if (verificationRequestAndLogResult.isErr()) {
      const err = verificationRequestAndLogResult.unwrapErr();

      if (err.type === 'verification_pending') {
        await interaction.editReply({ content: 'You are already pending verification!' });
        return;
      }

      await interaction.editReply({ content: 'An error have occured! please report to hayper!' });
      this.container.logger.error(err.err);
      return;
    }

    this.container.logger.info(
      `Verification request created for ${interaction.user.id}, Ticket id: ${verificationRequestAndLogResult.unwrap().request.id}`
    );

    await interaction.editReply({ content: 'Your verification request have been submitted!' });
  }
}
