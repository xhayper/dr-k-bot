import { ModalBuilder, TextInputBuilder, ActionRowBuilder } from "discord.js";
import { Utility } from "@sapphire/plugin-utilities-store";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";

@ApplyOptions<Utility.Options>({
  name: "modal"
})
export class ModalUtility extends Utility {
  public createApplicationModal(): ModalBuilder {
    const modal = new ModalBuilder();

    modal.setCustomId("verification");
    modal.setTitle("Verification");

    config.questions.forEach((question, index) => {
      modal.addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder(question).setCustomId(`question-${index + 1}`)
        ])
      ]);
    });

    return modal;
  }

  public createBanAppealModal(): ModalBuilder {
    const modal = new ModalBuilder();

    modal.setCustomId("ban_appeal");
    modal.setTitle("Ban Appeal");

    config.appealQuestions.forEach((question, index) => {
      modal.addComponents([
        new ActionRowBuilder<TextInputBuilder>().addComponents([
          new TextInputBuilder(question).setCustomId(`question-${index + 1}`)
        ])
      ]);
    });

    return modal;
  }
}

declare module "@sapphire/plugin-utilities-store" {
  export interface Utilities {
    modal: ModalUtility;
  }
}
