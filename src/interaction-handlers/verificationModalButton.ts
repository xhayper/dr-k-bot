import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { ModalUtility } from '../utility/modalUtility';
import { ApplyOptions } from '@sapphire/decorators';
import { type ButtonInteraction } from 'discord.js';
import { VerificationUtility } from '..';

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    if (await VerificationUtility.getTicketsFromUserId(interaction.user.id)) {
      await interaction.deferReply({ ephemeral: true });
      await interaction.editReply({ content: 'You already have a ticket! Please be patient!' });
      return;
    }

    await interaction.showModal(ModalUtility.createApplicationModal());
  }

  public parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'verify') return this.none();

    return this.some();
  }
}
