import { type GuildMember, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import config from "../config";

@ApplyOptions<Command.Options>({
  description: "Give the target meber a warm welcome~",
  preconditions: ["ChangedGuildOnly", ["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly", "InternOnly"]]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option.setName("member").setDescription("The member to welcome").setRequired(true)
          ),
      {
        idHints: ["1425880758450520218"],
        guildIds: [config.guildId]
      }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember("member") as GuildMember;

    await this.container.utilities.guild.sendWelcomeMessage(member);
    await interaction.editReply({
      embeds: [
        this.container.utilities.embed
          .SUCCESS_COLOR(
            new EmbedBuilder({
              title: "All done!",
              description: `I have send welcome message for ${member}!`
            })
          )
          .toJSON()
      ]
    });
  }
}
