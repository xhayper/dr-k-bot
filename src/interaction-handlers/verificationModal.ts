import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { MessageFlags, type ModalSubmitInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class Handler extends InteractionHandler {
  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    if (await this.container.utilities.ticket.hasUser(interaction.user.id)) {
      return interaction.editReply({
        content: "You already have a ticket! Please be patient!"
      });
    }

    const ticketId = await this.container.utilities.verification.getUniqueTicketId();

    const answers = config.questions.map((quest, index) => ({
      question: quest.label,
      answer: interaction.fields.getTextInputValue(`question-${index + 1}`)
    }));

    const emptyAnswers = answers.reduce((arr, ans, index) => {
      if (!ans.answer || ans.answer.trim().length === 0) arr.push(index);
      return arr;
    }, [] as number[]);

    if (emptyAnswers.length > 0) {
      return interaction.editReply({
        content: `Answer for question ${emptyAnswers.map((i) => i + 1).join(", ")} is empty!`
      });
    }

    const shortAnswers = answers.reduce((arr, ans, index) => {
      const question = config.questions[index];

      if (question.minLength && ans.answer.trim().length < question.minLength) arr.push(index);

      return arr;
    }, [] as number[]);

    if (shortAnswers.length > 0) {
      return interaction.editReply({
        content: `Answer for question ${shortAnswers.map((i) => i + 1).join(", ")} is too short!`
      });
    }

    const ticket = await this.container.utilities.ticket.add(ticketId, {
      discordId: interaction.user.id,
      messageId: null,
      answers
    });

    const channel = this.container.utilities.guild.verificationLogChannel;

    if (channel) {
      const message = await this.container.utilities.verification.sendTicketInformation(channel, ticket);

      if (message) {
        await this.container.utilities.ticket.edit(ticket.id, {
          discordId: ticket.discordId,
          answers: ticket.answers,
          messageId: message.id
        });
      }
    }

    await interaction.editReply({
      content: "Your submission was received successfully!"
    });
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "verification") return this.none();
    return this.some();
  }
}
