import { type GuildMember, EmbedBuilder } from "discord.js";
import { Subcommand } from "@sapphire/plugin-subcommands";
import { ApplyOptions } from "@sapphire/decorators";
import config from "../config";

const memberOption = (option: any, description = "-") =>
  option.setName("member").setDescription(description).setRequired(true);

// TODO: convert exception message into a function
// TODO: convert success message into function

@ApplyOptions<Subcommand.Options>({
  description: "Send a message in the member's dm",
  preconditions: ["ChangedGuildOnly", ["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly", "InternOnly"]],
  subcommands: [
    { name: "nsfw", chatInputRun: "chatInputNsfw" },
    { name: "warn", chatInputRun: "chatInputWarn" },
    { name: "custom", chatInputRun: "chatInputCustom" }
  ]
})
export class CommandHandler extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        (builder as any)
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((builder: any) =>
            builder.setName("nsfw").setDescription("Warn the member for NSFW").addUserOption(memberOption)
          )
          .addSubcommand((builder: any) =>
            builder
              .setName("warn")
              .setDescription("Warn the member in DM")
              .addUserOption(memberOption)
              .addStringOption((option: any) =>
                option.setName("reason").setDescription("The reason for the warning").setRequired(true)
              )
          )
          .addSubcommand((builder: any) =>
            builder
              .setName("custom")
              .setDescription("Send custom text in member's DM")
              .addUserOption(memberOption)
              .addStringOption((option: any) =>
                option.setName("message").setDescription("The message to send").setRequired(true)
              )
          ),
      {
        guildIds: [config.guildId]
      }
    );
  }

  public async chatInputNsfw(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember("member")! as GuildMember;

    try {
      await member.user.send({
        embeds: [
          this.container.utilities.embed
            .ERROR_COLOR(
              new EmbedBuilder({
                description: `${interaction.user} has deemed your pfp or banner to be against our NSFW policy, you have 10 minutes to change it or to contact ${interaction.user} to resolve the issue.`
              })
            )
            .toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          this.container.utilities.embed
            .SUCCESS_COLOR(
              new EmbedBuilder({
                title: "All done!",
                description: `Message sent to ${member.user}!`
              })
            )
            .toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .ERROR_COLOR(
                new EmbedBuilder({
                  description: `${member.user} have their DM closed!`
                })
              )
              .toJSON()
          ]
        });
      }
    }
  }

  public async chatInputWarn(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember("member")! as GuildMember;
    const reason = interaction.options.getString("reason", true);

    try {
      await member.user.send({
        embeds: [
          this.container.utilities.embed
            .ERROR_COLOR(
              new EmbedBuilder({
                title: "Hey!",
                description: `${interaction.user} has warned you for "${reason}". Contact them if you have questions or concerns regarding the warn`
              })
            )
            .toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          this.container.utilities.embed
            .SUCCESS_COLOR(
              new EmbedBuilder({
                title: "All done!",
                description: `Message sent to ${member.user}!`
              })
            )
            .toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .ERROR_COLOR(
                new EmbedBuilder({
                  description: `${member.user} have their DM closed!`
                })
              )
              .toJSON()
          ]
        });
      }
    }
  }

  public async chatInputCustom(interaction: Subcommand.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember("member")! as GuildMember;
    const message = interaction.options.getString("message", true);

    try {
      await member.user.send({
        embeds: [
          this.container.utilities.embed
            .ERROR_COLOR(
              new EmbedBuilder({
                description: message
              })
            )
            .toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          this.container.utilities.embed
            .SUCCESS_COLOR(
              new EmbedBuilder({
                title: "All done!",
                description: `Message sent to ${member.user}!`
              })
            )
            .toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            this.container.utilities.embed
              .ERROR_COLOR(
                new EmbedBuilder({
                  description: `${member.user} have their DM closed!`
                })
              )
              .toJSON()
          ]
        });
      }
    }
  }
}
