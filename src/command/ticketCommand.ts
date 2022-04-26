import { CommandInteraction, GuildMember, MessageEmbed } from 'discord.js';
import { SlashCommandBuilder } from '@discordjs/builders';
import { SlashCommand } from '../base/slashCommand';
import { EmbedUtility, GuildUtility } from '..';
import config from '../config';

export default {
  data: new SlashCommandBuilder()
    .setName('tacket')
    .setDescription('Open a thread to ask for additional information')
    .addUserOption((option) => option.setName('user').setDescription('-').setRequired(true)),
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    const targetMember = commandInteraction.options.getMember('user', true);
    await GuildUtility.openThread(commandInteraction.member as GuildMember, targetMember as GuildMember);

    await commandInteraction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          EmbedUtility.USER_AUTHOR(
            new MessageEmbed({
              description: `Thread opened with ${targetMember}!`
            }),
            commandInteraction.user
          )
        )
      ]
    });
  }
} as SlashCommand;
