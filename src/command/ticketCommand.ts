import { ChatInputCommandInteraction, GuildMember, EmbedBuilder } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('ticket')
    .setDescription('Open a thread to ask for additional information')
    .addUserOption((option) => option.setName('user').setDescription('-').setRequired(true)),
  guildId: [config.guildId],
  permission: 'SECURITY',
  execute: async (ChatInputCommandInteraction: ChatInputCommandInteraction) => {
    const targetMember = ChatInputCommandInteraction.options.getMember('user');
    await GuildUtility.openThread(ChatInputCommandInteraction.member as GuildMember, targetMember as GuildMember);

    await ChatInputCommandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          EmbedUtility.USER_AUTHOR(
            new EmbedBuilder({
              description: `Thread opened with ${targetMember}!`
            }),
            ChatInputCommandInteraction.user
          )
        )
      ]
    });
  }
} as SlashCommand;
