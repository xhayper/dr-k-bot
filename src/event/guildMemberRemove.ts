import { Client, GuildMember, PartialGuildMember } from 'discord.js';
import { TypedEvent } from '../base/clientEvent';
import { VerificationUtility } from '..';
import config from '../config';

export default TypedEvent({
  eventName: 'guildMemberRemove',
  on: async (_: Client, member: GuildMember | PartialGuildMember) => {
    if (member.partial || member.user.bot || member.guild.id != config.guildId) return;

    const VerificationTicketList = await VerificationUtility.getTicketsFromUserId(member.user.id);
    if (!VerificationTicketList) return;

    for (const ticket of VerificationTicketList) {
      VerificationUtility.deleteTicket(ticket, {
        deleteType: 'LEAVE'
      });
    }
  }
});
