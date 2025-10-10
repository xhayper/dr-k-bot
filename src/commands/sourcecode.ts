import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { MessageFlags } from "discord.js";

@ApplyOptions<Command.Options>({
  description: "Give you the link to the bot's source code"
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description),
      { idHints: ["1425879634263933030"] }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ flags: MessageFlags.Ephemeral });

    return interaction.editReply("https://github.com/xhayper/dr-k-bot");
  }
}
