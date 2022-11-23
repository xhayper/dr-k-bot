import { type GuildMember, type PartialGuildMember } from 'discord.js';
import { Listener } from '@sapphire/framework';
import { VerificationUtility } from '..';
import config from '../config';

export class UserEvent extends Listener {
  public async run(member: GuildMember | PartialGuildMember) {
    if (member.partial || member.user.bot || member.guild.id != config.guildId) return;

    const VerificationTicketList = await VerificationUtility.getTicketsFromUserId(member.user.id);
    if (!VerificationTicketList) return;

    for (const ticket of VerificationTicketList) {
      VerificationUtility.deleteTicket(ticket, {
        deleteType: 'LEAVE'
      });
    }
  }
}
