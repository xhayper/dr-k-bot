import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';
import { ApplyOptions } from '@sapphire/decorators';

// TODO: Use embed

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class VerificaationRequestAcceptHandler extends InteractionHandler {
  public override parse(interaction: ButtonInteraction) {
    if (interaction.customId !== 'verification_request_accept') return this.none();
    return this.some();
  }

  public async run(interaction: ButtonInteraction) {
    await interaction.deferReply();

    if (!interaction.member || !this.container.utilities.guild.isSecurity(interaction.member!.roles)) return;

    interaction.editReply({
      content: 'Verification accept'
    });
  }
}
