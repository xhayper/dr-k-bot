import { type GuildMember, type PartialGuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import config from "../config";

export class GuildMemberRemoveEvent extends Listener {
  public async run(member: GuildMember | PartialGuildMember) {
    if (member.partial || member.user.bot || member.guild.id !== config.guildId) return;

    const verificationTicket = await this.container.utilities.verification.getTicketFromUserId(member.user.id);

    if (!verificationTicket) return;

    await this.container.utilities.verification.deleteTicket(verificationTicket.id, {
      deleteType: "LEAVE"
    });
  }
}
