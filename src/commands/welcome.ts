import { reply } from '@sapphire/plugin-editable-commands';
import { ApplyOptions } from '@sapphire/decorators';
import { Args, Command } from '@sapphire/framework';
import { EmbedBuilder } from '@discordjs/builders';
import { GuildMember, Message } from 'discord.js';
import { GuildUtility, EmbedUtility } from '..';
import config from '../config';

@ApplyOptions<Command.Options>({
  description: 'Give the target user a warm welcome~',
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

    const member = interaction.options.getMember('member') as GuildMember;

    await GuildUtility.sendWelcomeMessage(member);
    await interaction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'All done!',
            description: `I have send welcome message for ${member}!`
          })
        ).toJSON()
      ]
    });
  }

  public override async messageRun(message: Message, args: Args) {
    const member = await args.pick('member').catch(() => null);

    if (!member) return await reply(message, 'Please specify a member to welcome!');

    await GuildUtility.sendWelcomeMessage(member);
    await reply(message, {
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'All done!',
            description: `I have send welcome message for ${member}!`
          })
        ).toJSON()
      ]
    });
  }
}
