import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility } from '..';
import config from '../config';

export default {
  name: 'dm',
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
        case 'nsfw_profile': {
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
                  description: `${commandInteraction.user} has verbal warned you for ${message}`
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
            EmbedUtility.USER_AUTHOR(
              new MessageEmbed({
                title: 'All done!',
                description: `Message sent to ${member.user}!`
              }),
              commandInteraction.user
            )
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
                description: `I can't seems to sent ${member.user} a dm!`
              })
            )
          ]
        });
      }
    }
  }
} as SlashCommand;
