import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  name: 'welcome',
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    const member = commandInteraction.options.getMember('member', true) as GuildMember;

    await GuildUtility.sendWelcomeMessage(member);
    await commandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new MessageEmbed({
            title: 'All done!',
            description: `I have send welcome message for ${member}!`
          })
        )
      ]
    });
  }
} as SlashCommand;
