import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class RequestVerificationButtonHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'request_verification_button') return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    if (this.container.config.verificationQuestions.length === 0) {
      await interaction.reply({ content: 'There are no verification questions!', ephemeral: true });
      return;
    }

    if (await this.container.utilities.verification.isUserPendingVerification(interaction.user.id)) {
      await interaction.reply({ content: 'You are already pending verification!', ephemeral: true });
      return;
    }

    await interaction.showModal({
      title: 'Verification Request',
      custom_id: 'request_verification_modal',
      components: [
        ...this.container.config.verificationQuestions
          .map(this.container.utilities.config.toTextInput)
          .map((data, index) => ({
            type: 1,
            components: [{ ...data, custom_id: index.toString(), customId: undefined }]
          }))
      ]
    });
  }
}
