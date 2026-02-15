import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import { MessageFlags, ModalSubmitInteraction } from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class Handler extends InteractionHandler {
  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    const userId = interaction.fields.getTextInputValue("userId");
    const messageId = interaction.fields.getTextInputValue("messageId");
    const messageContent = interaction.fields.getTextInputValue("messageContent");
    const optionalFile = interaction.fields.getUploadedFiles("optionalFile");

    if (!messageContent && !optionalFile) return interaction.editReply("Either a message or file is needed!");

    const user = await this.container.client.users.fetch(userId).catch(() => undefined);

    if (!user) return interaction.editReply("Can't find that user!");

    const channel = await user.createDM(true).catch(() => undefined);

    if (!channel) return interaction.editReply("No DM history with that user!");

    const message = messageId ? await channel.messages.fetch(messageId).catch(() => undefined) : undefined;

    if (message)
      message
        ?.reply({
          content: messageContent,
          files: Object.values(optionalFile ?? {})
        })
        .then(() => interaction.editReply("Reply sent!"))
        .catch((err) => {
          interaction.editReply("Unable to send message!");
          console.error(err);
        });
    else
      user
        .send({
          content: messageContent,
          files: Object.values(optionalFile ?? {})
        })
        .then(() => interaction.editReply("Reply sent!"))
        .catch((err) => {
          interaction.editReply("Unable to send message");
          console.error(err);
        });
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "replyModal") return this.none();
    return this.some();
  }
}
