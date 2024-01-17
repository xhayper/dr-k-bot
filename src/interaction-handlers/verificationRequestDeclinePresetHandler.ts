import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type StringSelectMenuInteraction } from 'discord.js';
import { VerificationRequest } from '@prisma/client';
import { ApplyOptions } from '@sapphire/decorators';
import { Result } from '@sapphire/result';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.SelectMenu
})
export class VerificaationRequestDeclinePresetHandler extends InteractionHandler {
  public override parse(interaction: StringSelectMenuInteraction) {
    if (interaction.customId !== 'verification_request_decline_preset') return this.none();
    return this.some();
  }

  public async run(interaction: StringSelectMenuInteraction) {
    await interaction.deferReply({ ephemeral: true });

    if (!(await this.container.utilities.guild.checkForSecurityInInteraction(interaction))) return;

    let interactionValue: number;

    if (interaction.values.length === 0) {
      await interaction.editReply({
        content: 'You did not select any option!'
      });
      return;
    }

    try {
      interactionValue = parseInt(interaction.values[0]);
    } catch (error) {
      await interaction.editReply({
        content: 'An error have occured! please report to hayper!'
      });
      this.container.logger.error("Couldn't parse interaction value, interaction =>", interaction);
      return;
    }

    if (
      !this.container.config.declineReasonPreset ||
      interactionValue + 1 > this.container.config.declineReasonPreset.length
    ) {
      await interaction.editReply({
        content: 'The decline reason preset list on this message is outdated!'
      });

      return;
    }

    const selectedOption = this.container.config.declineReasonPreset[interactionValue];

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

    if (!verificationId) {
      await interaction.editReply({
        content: "Can't seems to find ticket associated with this message!"
      });
      return;
    }

    this.container.utilities.verification.declineVerificationRequestAndRespond(
      interaction,
      verificationId,
      selectedOption.value
    );
  }
}
