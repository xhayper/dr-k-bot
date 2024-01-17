import { InteractionHandler, InteractionHandlerTypes } from '@sapphire/framework';
import { type ButtonInteraction } from 'discord.js';
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
    await interaction.deferReply();

    if (!(await this.container.utilities.guild.checkForSecurityInInteraction(interaction))) return;

    interaction.editReply({
      content: 'Verification decline'
    });
  }
}
