import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder } from '@discordjs/builders';
import { GuildMember, Message } from 'discord.js';
import { GuildUtility, EmbedUtility } from '..';
import config from '../config';

@ApplyOptions<Command.Options>({
  description: '-',
  preconditions: ['ChangedGuildOnly', ['HeadSecurityOnly', 'SeniorSecurityOnly', 'SecurityOnly', 'InternOnly']]
})
export class CommandHandler extends Command {
  public override registerApplicationCommands(registry: Command.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        builder //
          .setName(this.name)
          .setDescription(this.description)
          .addUserOption((option) => option.setName('member').setDescription('-').setRequired(true)),
      {
        guildIds: [config.guildId]
      }
    );
  }

  public override async chatInputRun(interaction: Command.ChatInputInteraction) {
    await interaction.deferReply();

    const targetMember = interaction.options.getMember('user');
    await GuildUtility.openThread(interaction.member as GuildMember, targetMember as GuildMember);

    await interaction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          EmbedUtility.USER_AUTHOR(
            new EmbedBuilder({
              description: `Thread opened with ${targetMember}!`
            }),
            interaction.user
          )
        ).toJSON()
      ]
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const targetMember = await args.pick('member').catch(() => null);

    if (!targetMember) return reply(message, 'Please provide a member!');

    await GuildUtility.openThread(message.member!, targetMember);

    reply(message, {
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          EmbedUtility.USER_AUTHOR(
            new EmbedBuilder({
              description: `Thread opened with ${targetMember}!`
            }),
            message.author
          )
        ).toJSON()
      ]
    });
  }
}
