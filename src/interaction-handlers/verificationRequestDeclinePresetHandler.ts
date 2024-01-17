import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type StringSelectMenuInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

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
    await interaction.deferReply();
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

    await interaction.editReply({
      content: `You selected: ${selectedOption.value}`
    });
  }
}
