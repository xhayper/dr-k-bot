import { type GuildMember, EmbedBuilder } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";
import { Command } from "@sapphire/framework";
import config from "../config";

@ApplyOptions<Command.Options>({
  description: "Toggle role of a member",
  preconditions: ["ChangedGuildOnly", ["HeadSecurityOnly", "SeniorSecurityOnly", "SecurityOnly"]]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) =>
            option.setName("member").setDescription("The member to toggle the role").setRequired(true)
          )
          .addStringOption((option) =>
            option
              .setName("role")
              .setDescription("The role")
              .setRequired(true)
              .addChoices(...Object.keys(config.toggleRole).map((roleName) => ({ name: roleName, value: roleName })))
          ),
      {
        idHints: ["1425880757989146675"],
        guildIds: [config.guildId]
      }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputCommandInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember("member") as GuildMember;
    const role = interaction.options.getString("role", true);

    const roleId = config.toggleRole[role];
    if (!roleId) throw new Error("That wasn't suppose to happened!");

    const removeRole = member.roles.cache.has(roleId);
    if (removeRole) member.roles.remove(roleId);
    else member.roles.add(roleId);

    await interaction.editReply({
      embeds: [
        this.container.utilities.embed
          .SUCCESS_COLOR(
            new EmbedBuilder({
              title: "Done!",
              description: `${removeRole ? "Removed" : "Added"} \`${role}\` ${removeRole ? "from" : "to"} ${member}!`
            })
          )
          .toJSON()
      ]
    });

    await this.container.utilities.guild.sendAuditLog({
      embeds: [
        this.container.utilities.embed
          .AUDIT_MESSAGE(
            interaction.user,
            `**${removeRole ? "⛔️" : "✅"} Role ${removeRole ? "removed" : "added"} ${
              removeRole ? "from" : "to"
            } ${member}!**`
          )
          .addFields([{ name: `**Role ${removeRole ? "removed" : "added"}**`, value: `<@&${roleId}>` }])
          .setColor(removeRole ? 0xed4245 : 0x57f287)
          .toJSON()
      ]
    });
  }
}
