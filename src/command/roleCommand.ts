import { ChatInputCommandInteraction, GuildMember, EmbedBuilder, Colors, SlashCommandBuilder } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('role')
    .setDescription('-')
    .addUserOption((option) => option.setName('member').setDescription('-').setRequired(true))
    .addStringOption((option) =>
      option
        .setName('role')
        .setDescription('-')
        .setRequired(true)
        .addChoices(...Object.keys(config.toggleRole).map((roleName) => ({ name: roleName, value: roleName })))
    ),
  guildId: [config.guildId],
  permission: 'SECURITY',
  execute: async (chatInputCommandInteraction: ChatInputCommandInteraction) => {
    const member = chatInputCommandInteraction.options.getMember('member') as GuildMember;
    const role = chatInputCommandInteraction.options.getString('role', true);

    const roleId = config.toggleRole[role];
    if (!roleId) throw new Error("That wasn't suppose to happened!");

    const removeRole = member.roles.cache.has(roleId);
    if (removeRole) member.roles.remove(roleId);
    else member.roles.add(roleId);

    await chatInputCommandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'Done!',
            description: `${removeRole ? 'Removed' : 'Added'} \`${role}\` ${removeRole ? 'from' : 'to'} ${member}!`
          })
        )
      ]
    });

    await GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.AUDIT_MESSAGE(
          chatInputCommandInteraction.user,
          `**${removeRole ? '⛔️' : '✅'} Role ${removeRole ? 'removed' : 'added'} ${removeRole ? 'from' : 'to'
          } ${member}!**`
        )
          .addFields([{ name: `**Role ${removeRole ? 'removed' : 'added'}**`, value: `<@&${roleId}>` }])
          .setColor(removeRole ? Colors.Red : Colors.Green)
      ]
    });
  }
} as SlashCommand;
