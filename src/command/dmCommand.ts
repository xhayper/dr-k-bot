import { SlashCommandBuilder, SlashCommandUserOption } from '@discordjs/builders';
import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility } from '..';
import config from '../config';

const memberOption = (option: SlashCommandUserOption, description = '-') =>
  option.setName('member').setDescription(description).setRequired(true);

export default {
  data: new SlashCommandBuilder()
    .setName('dm')
    .setDescription('-')
    .addSubcommand((builder) => builder.setName('nsfw').setDescription('-').addUserOption(memberOption))
    .addSubcommand((builder) =>
      builder
        .setName('warn')
        .setDescription('-')
        .addUserOption(memberOption)
        .addStringOption((option) => option.setName('reason').setDescription('-').setRequired(true))
    )
    .addSubcommand((builder) =>
      builder
        .setName('custom')
        .setDescription('-')
        .addUserOption(memberOption)
        .addStringOption((option) => option.setName('message').setDescription('-').setRequired(true))
    ),
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    const member = commandInteraction.options.getMember('member', true) as GuildMember;
    const dmType = commandInteraction.options.getSubcommand(true);

    let message;

    switch (dmType) {
      case 'custom':
        message = commandInteraction.options.getString('message', true);
        break;
      case 'warn':
        message = commandInteraction.options.getString('reason', true);
        break;
    }

    try {
      switch (dmType) {
        case 'nsfw': {
          await member.user.send({
            embeds: [
              EmbedUtility.ERROR_COLOR(
                new MessageEmbed({
                  description: `${commandInteraction.user} has deemed your pfp or banner to be against our NSFW policy, you have 10 minutes to change it or to contact ${commandInteraction.user} to resolve the issue.`
                })
              )
            ]
          });
          break;
        }

        case 'custom': {
          await member.user.send({
            embeds: [
              EmbedUtility.SUCCESS_COLOR(
                new MessageEmbed({
                  description: message
                })
              )
            ]
          });
          break;
        }

        case 'warn': {
          await member.user.send({
            embeds: [
              EmbedUtility.ERROR_COLOR(
                new MessageEmbed({
                  title: 'Hey!',
                  description: `${commandInteraction.user} has warned you for "${message}", Contact them if you have questions or concerns regarding the warn`
                })
              )
            ]
          });
          break;
        }
      }

      await commandInteraction.editReply({
        embeds: [
          EmbedUtility.SUCCESS_COLOR(
            new MessageEmbed({
              title: 'All done!',
              description: `Message sent to ${member.user}!`
            })
          )
        ]
      });
    } catch (e: any) {
      if (e.code === 50007) {
        // This implies that there was an error while sending a dm
        return commandInteraction.editReply({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new MessageEmbed({
                description: `I can't seem to send ${member.user} a dm!`
              })
            )
          ]
        });
      }
    }
  }
} as SlashCommand;
