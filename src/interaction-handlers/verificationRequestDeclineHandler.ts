import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { TextInputStyle, type ButtonInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class VerificaationRequestDeclineHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'verification_request_decline') return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    if (!(await this.container.utilities.guild.checkForSecurityInInteraction(interaction, true))) return;

    await interaction.showModal({
      title: 'Decline Verification Request',
      custom_id: 'verification_decline_modal',
      components: [
        {
          type: 1,
          components: [
            {
              type: 4,
              label: 'Id',
              custom_id: 'decline_verification_request_id',
              style: TextInputStyle.Short,
              min_length: 36,
              max_length: 36,
              required: true,

              value: '1be84b4b-156a-4973-85fc-03b0bf6e9756'
            }
          ]
        },
        {
          type: 1,
          components: [
            {
              type: 4,
              label: 'Reason',
              custom_id: 'decline_verification_request_reason',
              style: TextInputStyle.Paragraph,
              required: true
            }
          ]
        }
      ]
    });
  }
}
