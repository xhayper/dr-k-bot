import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import { VerificationUtility } from '..';

export default TypedEvent({
  eventName: 'guildMemberRemove',
  on: async (_: Client, member: GuildMember | PartialGuildMember) => {
    if (member.partial) return;
    if (member.user.bot) return;

    const VerificationTicketList = await VerificationUtility.getTicketsFromUserId(member.user.id);
    if (!VerificationTicketList) return;

    for (const ticket of VerificationTicketList) {
      VerificationUtility.deleteTicket(ticket, {
        deleteType: 'LEAVE'
      });
    }
  }
});
