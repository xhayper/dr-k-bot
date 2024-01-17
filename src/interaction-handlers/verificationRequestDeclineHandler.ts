import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { TextInputStyle, type ButtonInteraction } from 'discord.js';
import { type VerificationRequest } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';

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
    if (!(await this.container.utilities.guild.checkForSecurityInInteraction(interaction))) return;

    let verificationId: string | undefined;

    const verificationRequestFindResult = await Result.fromAsync<VerificationRequest | null, unknown>(
      async () =>
        await this.container.database.verificationRequest.findUnique({
          where: {
            logMessageId: interaction.message.id
          }
        })
    );

    if (verificationRequestFindResult.isOk()) {
      if (verificationRequestFindResult.unwrap() !== null) {
        verificationId = verificationRequestFindResult.unwrap()!.id;
      }
    }

    await interaction.showModal({
      title: 'Decline Verification Request',
      custom_id: 'verification_request_decline_modal',
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
              value: verificationId
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
              style: TextInputStyle.Paragraph
            }
          ]
        }
      ]
    });
  }
}
