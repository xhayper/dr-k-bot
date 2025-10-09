import { type GuildMember, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import config from "../config";

@ApplyOptions<Command.Options>({
  description: "Open a thread to ask for additional information",
  preconditions: ["ChangedGuildOnly", ["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly", "InternOnly"]]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) => option.setName("member").setDescription("-").setRequired(true)),
      {
        idHints: ["1425880756408025159"],
        guildIds: [config.guildId]
      }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const targetMember = interaction.options.getMember("member");
    await this.container.utilities.guild.openThread(interaction.member as GuildMember, targetMember as GuildMember);

    await interaction.editReply({
      embeds: [
        this.container.utilities.embed
          .SUCCESS_COLOR(
            this.container.utilities.embed.USER_AUTHOR(
              new EmbedBuilder({
                description: `Thread opened with ${targetMember}!`
              }),
              interaction.user
            )
          )
          .toJSON()
      ]
    });
  }
}
