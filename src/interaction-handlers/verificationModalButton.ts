import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { MessageFlags, type ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    if ((await this.container.utilities.verification.getTicketsFromUserId(interaction.user.id)).length > 0) {
      await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "You already have a ticket! Please be patient!"
      });
      return;
    }

    await interaction.showModal(this.container.utilities.modal.createApplicationModal());
  }

  public parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "verify") return this.none();

    return this.some();
  }
}
