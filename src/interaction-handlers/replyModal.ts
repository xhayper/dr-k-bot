import { AttachmentBuilder, MessageFlags, ModalSubmitInteraction } from "discord.js";
import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { ApplyOptions } from "@sapphire/decorators";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class Handler extends InteractionHandler {
  public async run(interaction: ModalSubmitInteraction) {
    if (!interaction.inCachedGuild() || !this.container.utilities.guild.isSecurity(interaction.member)) return;

    await interaction.deferReply({
      flags: MessageFlags.Ephemeral
    });

    const userId = interaction.fields.getTextInputValue("userId");
    const messageId = interaction.fields.getTextInputValue("messageId");
    const messageContent = interaction.fields.getTextInputValue("messageContent");
    const optionalFile = interaction.fields.getUploadedFiles("optionalFile");

    if (!messageContent && optionalFile?.size === 0)
      return interaction.editReply("Either a message or file is needed!");

    const user = await this.container.client.users.fetch(userId).catch(() => undefined);

    if (!user) return interaction.editReply("Can't find that user!");

    const channel = await user.createDM(true).catch(() => undefined);

    if (!channel) return interaction.editReply("No DM history with that user!");

    const message = messageId ? await channel.messages.fetch(messageId).catch(() => undefined) : undefined;

    const files = Array.from(optionalFile?.values() ?? []).map((attachment) =>
      new AttachmentBuilder((attachment as any).attachment, {
        name: attachment.name ?? undefined,
        description: attachment.description ?? ""
      }).setSpoiler(attachment.spoiler)
    );

    if (message)
      message
        ?.reply({
          content: messageContent,
          files: files
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
          files: files
        })
        .then(() => interaction.editReply("Reply sent!"))
        .catch((err) => {
          interaction.editReply("Unable to send message");
          console.error(err);
        });

    if (interaction.message)
      interaction.message.edit({
        embeds: [
          {
            ...interaction.message!.embeds[0]!.data,
            footer: {
              text: `Last reply by ${interaction.user.username}`,
              icon_url:
                interaction.user.avatarURL({
                  size: 4096
                }) ?? interaction.user.defaultAvatarURL
            }
          }
        ]
      });
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "replyModal") return this.none();
    return this.some();
  }
}
