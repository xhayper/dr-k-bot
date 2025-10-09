import { InteractionHandler, InteractionHandlerTypes } from "@sapphire/framework";
import { type ModalSubmitInteraction } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";

@ApplyOptions<InteractionHandler.Options>({
  interactionHandlerType: InteractionHandlerTypes.ModalSubmit
})
export class Handler extends InteractionHandler {
  public async run(interaction: ModalSubmitInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const transformedAnswer = config.appealQuestions.map((quest, index) => ({
      question: quest.label,
      answer: interaction.fields.getTextInputValue(`question-${index + 1}`)
    }));

    const emptyAnswer = transformedAnswer.reduce((arr, answerData, index) => {
      if (!answerData.answer || 0 >= answerData.answer.trim().length) arr.push(index);
      return arr;
    }, [] as number[]);

    if (emptyAnswer.length > 0)
      return void (await interaction.editReply({
        content: `Answer for question ${emptyAnswer.map((questionNumber) => questionNumber + 1).join(", ")} is empty!`
      }));

    const shortAnswer = transformedAnswer.reduce((arr, answerData, index) => {
      const question = config.appealQuestions[index];
      if (question.minLength && question.minLength > answerData.answer.trim().length) arr.push(index);
      return arr;
    }, [] as number[]);

    if (shortAnswer.length > 0)
      return void (await interaction.editReply({
        content: `Answer for question ${shortAnswer
          .map((questionNumber) => questionNumber + 1)
          .join(", ")} is too short!`
      }));

    if (this.container.utilities.guild.banAppealLogChannel) {
      const appealMessage = await this.container.utilities.guild.sendBanAppealLog({
        embeds: [
          this.container.utilities.embed
            .BAN_APPEAL_INFO({
              appealer: interaction.user,
              answers: transformedAnswer
            })
            .toJSON()
        ]
      });

      await appealMessage!.react("✅");
      await appealMessage!.react("❌");

      await interaction.editReply({ content: "Your submission was received successfully!" });
    } else {
      await interaction.editReply({ content: "Something went wrong!" });
    }
  }

  public parse(interaction: ModalSubmitInteraction) {
    if (interaction.customId !== "ban_appeal") return this.none();

    return this.some();
  }
}
