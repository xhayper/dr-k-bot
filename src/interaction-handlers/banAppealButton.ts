import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    await interaction.showModal(this.container.utilities.modal.createBanAppealModal());
  }

  public parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "appeal_ban") return this.none();
    return this.some();
  }
}
