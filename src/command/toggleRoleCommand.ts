import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  name: 'togglerole',
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    const member = commandInteraction.options.getMember('member', true) as GuildMember;
    const role = commandInteraction.options.getString('role', true);

    const roleId = config.toggleRole[role];
    if (!roleId) throw new Error("That wasn't suppose to happened!");

    const removeRole = member.roles.cache.has(roleId);
    if (removeRole) member.roles.remove(roleId);
    else member.roles.add(roleId);

    await commandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new MessageEmbed({
            title: 'Done!',
            description: `${removeRole ? 'Removed' : 'Added'} \`${role}\` ${removeRole ? 'from' : 'to'} ${member}!`
          })
        )
      ]
    });

    await GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          EmbedUtility.AUDIT_MESSAGE(
            commandInteraction.user,
            `**${removeRole ? "⛔️" : "✅"} Role ${removeRole ? 'removed' : 'added'} ${removeRole ? 'from' : 'to'} ${member}!**`
          ).addField(`**Role ${removeRole ? 'removed' : 'added'}**`, `<@&${roleId}>`)
        )
      ]
    });
  }
} as SlashCommand;
