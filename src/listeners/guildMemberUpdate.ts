import { type GuildMember, type PartialGuildMember } from 'discord.js';
import { Listener } from '@sapphire/framework';
import { GuildUtility } from '..';
import config from '../config';

export class UserEvent extends Listener {
  public async run(oldMember: GuildMember | PartialGuildMember, newMember: GuildMember) {
    if (oldMember.partial || oldMember.user.bot || oldMember.guild.id !== config.guildId) return;
    if (oldMember.roles.cache.equals(newMember.roles.cache)) return;

    if (
      newMember.roles.cache.has(config.role.levelZero) &&
      newMember.roles.cache.some((role) => config.role.levelRoles.includes(role.id))
    ) {
      await newMember.roles.remove(config.role.levelZero, 'autorole');
    }

    if (
      newMember.roles.cache.has(config.role.unverified) &&
      newMember.roles.cache.some((role) => config.role.patreonRoles.includes(role.id))
    ) {
      await newMember.roles.remove(config.role.unverified, 'autorole');
      await GuildUtility.sendWelcomeMessage(newMember);
    }
  }
}
