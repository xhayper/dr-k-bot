import { ChatInputCommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('welcome')
    .setDescription('-')
    .addUserOption((option) => option.setName('member').setDescription('-').setRequired(true)),
  guildId: [config.guildId],
  permission: 'SECURITY',
  execute: async (ChatInputCommandInteraction: ChatInputCommandInteraction) => {
    const member = ChatInputCommandInteraction.options.getMember('member') as GuildMember;

    await GuildUtility.sendWelcomeMessage(member);
    await ChatInputCommandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: 'All done!',
            description: `I have send welcome message for ${member}!`
          })
        )
      ]
    });
  }
} as SlashCommand;
