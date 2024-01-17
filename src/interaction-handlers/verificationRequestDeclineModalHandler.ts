import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ModalSubmitInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class VerificaationRequestDeclineModalHandler extends InteractionHandler {
  public override parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== 'verification_request_decline_modal') return this.none();
    return this.some();
  }

  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply();

    if (!(await this.container.utilities.guild.checkForSecurityInInteraction(interaction))) return;

    const id = interaction.fields.getTextInputValue('decline_verification_request_id');
    const reason = interaction.fields.getTextInputValue('decline_verification_request_reason');

    this.container.utilities.verification.tempCommonDecline(interaction, id, reason);
  }
}
