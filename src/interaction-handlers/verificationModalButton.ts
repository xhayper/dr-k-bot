import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { MessageFlags, type ButtonInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    const hasTicket = await this.container.utilities.ticket.hasUser(interaction.user.id);

    if (hasTicket) {
      return void (await interaction.reply({
        flags: MessageFlags.Ephemeral,
        content: "You already have a ticket! Please be patient!"
      }));
    }

    return void (await interaction.showModal(this.container.utilities.modal.createApplicationModal()));
  }

  public parse(interaction: ButtonInteraction) {
    if (interaction.customId !== "verify") return this.none();
    return this.some();
  }
}
