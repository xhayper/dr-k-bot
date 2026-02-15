import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";
import {
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  TextInputBuilder,
  TextInputStyle,
  type ButtonInteraction
} from "discord.js";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.Button
})
export class Handler extends InteractionHandler {
  public async run(interaction: ButtonInteraction) {
    const [userId, messageId] = interaction.customId.replace("reply_", "").split("_");

    const modal = new ModalBuilder().setCustomId("replyModal").setTitle("Reply to message");

    const userIdInput = new TextInputBuilder()
      .setCustomId("userId")
      .setStyle(TextInputStyle.Short)
      .setValue(userId)
      .setRequired(true);

    const messageIdInput = new TextInputBuilder()
      .setCustomId("messageId")
      .setStyle(TextInputStyle.Short)
      .setValue(messageId);

    const messageContentInput = new TextInputBuilder()
      .setCustomId("messageContent")
      .setStyle(TextInputStyle.Paragraph)
      .setRequired(false);

    const optionalFileInput = new FileUploadBuilder().setCustomId("optionalFile").setRequired(false);

    const userIdLabel = new LabelBuilder()
      .setLabel("User ID")
      .setDescription("The ID of the user to reply to")
      .setTextInputComponent(userIdInput);

    const messageIdLabel = new LabelBuilder()
      .setLabel("Message ID")
      .setDescription("The ID of the message to reply to")
      .setTextInputComponent(messageIdInput);

    const messageContentLabel = new LabelBuilder()
      .setLabel("The content of the message to reply")
      .setDescription("The content of the message")
      .setTextInputComponent(messageContentInput);

    const fileInputLabel = new LabelBuilder()
      .setLabel("File to attach")
      .setDescription("If you want to attach any file, put it here")
      .setFileUploadComponent(optionalFileInput);

    modal.addLabelComponents(userIdLabel, messageIdLabel, messageContentLabel, fileInputLabel);

    await interaction.showModal(modal);
  }

  public parse(interaction: ButtonInteraction) {
    if (!interaction.customId.startsWith("reply_")) return this.none();
    return this.some();
  }
}
