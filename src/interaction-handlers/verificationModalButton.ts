import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { type ButtonInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    if ((await this.container.utilities.verification.getTicketsFromUserId(interaction.user.id)).length > 0) {
      await interaction.reply({ ephemeral: true, content: "You already have a ticket! Please be patient!" });
      return;
    }

    await interaction.showModal(this.container.utilities.modal.createApplicationModal());
  }

  public parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "verify") return this.none();

    return this.some();
  }
}
