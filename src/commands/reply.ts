import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import {
  FileUploadBuilder,
  LabelBuilder,
  ModalBuilder,
  TextDisplayBuilder,
  TextInputBuilder,
  TextInputStyle
} from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Open the reply prompt",
  preconditions: [["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly"]]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description),
      {
        idHints: ["1472607272298479706"]
      }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    const modal = new ModalBuilder().setCustomId("replyModal").setTitle("Reply to message");

    const userIdInput = new TextInputBuilder().setCustomId("userId").setStyle(TextInputStyle.Short).setRequired(true);

    const messageIdInput = new TextInputBuilder()
      .setCustomId("messageId")
      .setStyle(TextInputStyle.Short)
      .setRequired(false);

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
      .setLabel("Message ID (Optional)")
      .setDescription("The ID of the message to reply to")
      .setTextInputComponent(messageIdInput);

    const messageReplyLabel = new TextDisplayBuilder().setContent("Choose one or both of the below");

    const messageContentLabel = new LabelBuilder()
      .setLabel("The content of the message to reply")
      .setDescription("The content of the message")
      .setTextInputComponent(messageContentInput);

    const fileInputLabel = new LabelBuilder()
      .setLabel("File to attach")
      .setDescription("If you want to attach any file, put it here")
      .setFileUploadComponent(optionalFileInput);

    modal
      .addLabelComponents(userIdLabel, messageIdLabel)
      .addTextDisplayComponents(messageReplyLabel)
      .addLabelComponents(messageContentLabel, fileInputLabel);

    await interaction.showModal(modal);
  }
}
