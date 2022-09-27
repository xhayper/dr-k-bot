import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from '@discordjs/builders';
import { GuildMember, Message } from 'discord.js';
import { Args } from '@sapphire/framework';
import { EmbedUtility } from '..';
import config from '../config';

const memberOption = (option: any, description = '-') =>
  option.setName('member').setDescription(description).setRequired(true);

// TODO: convert exception message into a function
// TODO: convert success message into function

@ApplyOptions<Subcommand.Options>({
  description: '-',
  preconditions: ['ChangedGuildOnly', ['HeadSecurityOnly', 'SeniorSecurityOnly', 'SecurityOnly', 'InternOnly']],
  subcommands: [
    { name: 'nsfw', messageRun: 'messageNsfw', chatInputRun: 'chatInputNsfw' },
    { name: 'warn', messageRun: 'messagWarn', chatInputRun: 'chatInputWarn' },
    { name: 'custom', messageRun: 'messageCustom', chatInputRun: 'chatInputCustom' }
  ]
})
export class CommandHandler extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        (builder as any)
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((builder: any) => builder.setName('nsfw').setDescription('-').addUserOption(memberOption))
          .addSubcommand((builder: any) =>
            builder
              .setName('warn')
              .setDescription('-')
              .addUserOption(memberOption)
              .addStringOption((option: any) => option.setName('reason').setDescription('-').setRequired(true))
          )
          .addSubcommand((builder: any) =>
            builder
              .setName('custom')
              .setDescription('-')
              .addUserOption(memberOption)
              .addStringOption((option: any) => option.setName('message').setDescription('-').setRequired(true))
          ),
      {
        guildIds: [config.guildId]
      }
    );
  }

  public async chatInputNsfw(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('member')! as GuildMember;

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              description: `${interaction.user} has deemed your pfp or banner to be against our NSFW policy, you have 10 minutes to change it or to contact ${interaction.user} to resolve the issue.`
            })
          ).toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }

  public async messageNsfw(message: Message, args: Args) {
    const member = await args.pick('member').catch(() => null);

    if (!member) return await reply(message, 'Please provide a member!');

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              description: `${message.author} has deemed your pfp or banner to be against our NSFW policy, you have 10 minutes to change it or to contact ${message.author} to resolve the issue.`
            })
          ).toJSON()
        ]
      });

      await reply(message, {
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await reply(message, {
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }

  public async chatInputWarn(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('member')! as GuildMember;
    const reason = interaction.options.getString('reason', true);

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              title: 'Hey!',
              description: `${interaction.user} has warned you for "${reason}". Contact them if you have questions or concerns regarding the warn`
            })
          ).toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }

  public async messagWarn(message: Message, args: Args) {
    const member = await args.pick('member').catch(() => null);
    const reason = await args.rest('string').catch(() => null);

    if (!member) return await reply(message, 'Please provide a member!');
    if (!reason) return await reply(message, 'Please provide a reason!');

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              title: 'Hey!',
              description: `${message.author} has warned you for "${reason}". Contact them if you have questions or concerns regarding the warn`
            })
          ).toJSON()
        ]
      });

      await reply(message, {
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await reply(message, {
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }

  public async chatInputCustom(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const member = interaction.options.getMember('member')! as GuildMember;
    const message = interaction.options.getString('message', true);

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              description: message
            })
          ).toJSON()
        ]
      });

      await interaction.editReply({
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await interaction.editReply({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }

  public async messageCustom(message: Message, args: Args) {
    const member = await args.pick('member').catch(() => null);
    const customMessage = await args.rest('string').catch(() => null);

    if (!member) return await reply(message, 'Please provide a member!');
    if (!customMessage) return await reply(message, 'Please provide a message!');

    try {
      await member.user.send({
        embeds: [
          EmbedUtility.ERROR_COLOR(
            new EmbedBuilder({
              description: customMessage
            })
          ).toJSON()
        ]
      });

      await reply(message, {
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new EmbedBuilder({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          ).toJSON()
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        return await reply(message, {
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                description: `${member.user} have their DM closed!`
              })
            ).toJSON()
          ]
        });
      }
    }
  }
}
