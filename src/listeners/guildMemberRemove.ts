import { type GuildMember, type PartialGuildMember } from "discord.js";
import { Listener } from "@sapphire/framework";
import config from "../config";

export class GuildMemberRemoveEvent extends Listener {
  public async run(member: GuildMember | PartialGuildMember) {
    if (member.partial || member.user.bot || member.guild.id !== config.guildId) return;

    const VerificationTicketList = await this.container.utilities.verification.getTicketsFromUserId(member.user.id);
    if (!VerificationTicketList) return;

    for (const ticket of VerificationTicketList) {
      this.container.utilities.verification.deleteTicket(ticket, {
        deleteType: "LEAVE"
      });
    }
  }
}
