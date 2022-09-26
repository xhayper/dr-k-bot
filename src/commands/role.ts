import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder } from '@discordjs/builders';
import { GuildMember, Message } from 'discord.js';
import { GuildUtility, EmbedUtility } from '..';
import config from '../config';

@ApplyOptions<Command.Options>({
  description: '-',
  preconditions: ['ChangedGuildOnly', ['HeadSecurityOnly', 'SeniorSecurityOnly', 'SecurityOnly']]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand((builder) =>
      builder //
        .setName(this.name)
        .setDescription(this.description)
        .addUserOption((option) => option.setName('member').setDescription('-').setRequired(true))
        .addStringOption((option) =>
          option
            .setName('role')
            .setDescription('-')
            .setRequired(true)
            .addChoices(...Object.keys(config.toggleRole).map((roleName) => ({ name: roleName, value: roleName })))
        )
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('member') as GuildMember;
    const role = interaction.options.getString('role', true);

    const roleId = config.toggleRole[role];
    if (!roleId) throw new Error("That wasn't suppose to happened!");

    const removeRole = member.roles.cache.has(roleId);
    if (removeRole) member.roles.remove(roleId);
    else member.roles.add(roleId);

    await interaction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'Done!',
            description: `${removeRole ? 'Removed' : 'Added'} \`${role}\` ${removeRole ? 'from' : 'to'} ${member}!`
          })
        ).toJSON()
      ]
    });

    await GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.AUDIT_MESSAGE(
          interaction.user,
          `**${removeRole ? '⛔️' : '✅'} Role ${removeRole ? 'removed' : 'added'} ${
            removeRole ? 'from' : 'to'
          } ${member}!**`
        )
          .addFields([{ name: `**Role ${removeRole ? 'removed' : 'added'}**`, value: `<@&${roleId}>` }])
          .setColor(removeRole ? 0xed4245 : 0x57f287)
          .toJSON()
      ]
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const member = await args.pick('member').catch(() => null);
    const role = await args.rest('string').catch(() => null);

    if (!member) return reply(message, 'Please provide a member!');
    if (!role) return reply(message, 'Please provide a role!');

    if (!Object.keys(config.toggleRole).includes(role)) return reply(message, "That role can't be used!");

    const roleId = config.toggleRole[role];
    if (!roleId) throw new Error("That wasn't suppose to happened!");

    const removeRole = member.roles.cache.has(roleId);
    if (removeRole) member.roles.remove(roleId);
    else member.roles.add(roleId);

    await reply(message, {
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'Done!',
            description: `${removeRole ? 'Removed' : 'Added'} \`${role}\` ${removeRole ? 'from' : 'to'} ${member}!`
          })
        ).toJSON()
      ]
    });

    await GuildUtility.sendAuditLog({
      embeds: [
        EmbedUtility.AUDIT_MESSAGE(
          message.author,
          `**${removeRole ? '⛔️' : '✅'} Role ${removeRole ? 'removed' : 'added'} ${
            removeRole ? 'from' : 'to'
          } ${member}!**`
        )
          .addFields([{ name: `**Role ${removeRole ? 'removed' : 'added'}**`, value: `<@&${roleId}>` }])
          .setColor(removeRole ? 0xed4245 : 0x57f287)
          .toJSON()
      ]
    });
  }
}
