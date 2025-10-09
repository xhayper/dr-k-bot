import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import { inspect } from "node:util";

const clean = async (text: any): Promise<string> => {
  if (text && text.constructor.name === "Promise") text = await text;

  if (typeof text !== "string") text = inspect(text, { depth: 1 });

  text = text.replace(/`/g, "`" + String.fromCharCode(8203)).replace(/@/g, "@" + String.fromCharCode(8203));

  return text;
};

@ApplyOptions<Command.Options>({
  description: "-",
  preconditions: ["BotOwnerOnly"]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addStringOption((input) => input.setName("code").setDescription("-").setRequired(true))
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply({ ephemeral: true });

    const code = interaction.options.getString("code", true);

    try {
      const result = await clean(eval(code));
      interaction.editReply(`\`\`\`\n${result ?? "No output"}\n\`\`\``);
    } catch (e: any) {
      interaction.editReply(`\`\`\`\n${await clean(e)}\n\`\`\``);
    }
  }
}
