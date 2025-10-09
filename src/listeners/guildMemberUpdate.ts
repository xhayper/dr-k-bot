import { type GuildMember, type PartialGuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import config from "../config";

export class GuildMemberUpdateEvent extends Listener {
  public async run(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    if (oldMember.partial || oldMember.user.bot || oldMember.guild.id !== config.guildId) return;
    if (oldMember.roles.cache.equals(newMember.roles.cache)) return;

    if (
      newMember.roles.cache.has(config.role.levelZero) &&
      newMember.roles.cache.some((role) => config.role.levelRoles.includes(role.id))
    ) {
      await newMember.roles.remove(config.role.levelZero, "autorole");
    }
  }
}
