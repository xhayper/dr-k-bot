import { EmbedUtility, GuildUtility, VerificationUtility } from '..';
import { SlashCommand } from '../base/slashCommand';
import { VerificationTicket } from '../database';
import config from '../config';
import {
  ChatInputCommandInteraction,
  AttachmentBuilder,
  EmbedBuilder,
  SlashCommandBuilder,
  SlashCommandStringOption
} from 'discord.js';

const verificationTicketIdOption = (option: SlashCommandStringOption) => {
  return option.setName('id').setDescription('The ticket id').setRequired(true);
};

export default {
  data: new SlashCommandBuilder()
    .setName('verification')
    .setDescription('Verification ticket management')
    .addSubcommand((builder) =>
      builder.setName('accept').setDescription('-').addStringOption(verificationTicketIdOption)
    )
    .addSubcommand((builder) =>
      builder
        .setName('decline')
        .setDescription('-')
        .addStringOption(verificationTicketIdOption)
        .addStringOption((option) =>
          option.setName('reason').setDescription('The reason for declining the request').setRequired(true)
        )
    )
    .addSubcommand((builder) =>
      builder
        .setName('info')
        .setDescription('Show a specific verification ticket')
        .addStringOption(verificationTicketIdOption)
    )
    .addSubcommand((builder) => builder.setName('list').setDescription('Show unfinished verification tickets')),
  guildId: [config.guildId],
  permission: 'SECURITY',
  execute: async (ChatInputCommandInteraction: ChatInputCommandInteraction) => {
    let verificationTicket: VerificationTicket | void;

    const subCommand = ChatInputCommandInteraction.options.getSubcommand(true);

    // Checking and setting field
    switch (subCommand) {
      case 'accept':
      case 'decline':
      case 'info': {
        verificationTicket = await VerificationUtility.getTicketFromId(
          ChatInputCommandInteraction.options.getString('id', true)
        );
        if (!verificationTicket)
          return ChatInputCommandInteraction.editReply({
            embeds: [EmbedUtility.CANT_FIND_TICKET()]
          });
        break;
      }
    }

    // The actual logic
    switch (subCommand) {
      case 'accept': {
        // TODO: Maybe merge this with the one in "interactionCreate"?
        const member = await GuildUtility.getGuildMember(verificationTicket!.requesterDiscordId);
        if (!member)
          return ChatInputCommandInteraction.editReply({
            embeds: [EmbedUtility.CANT_FIND_USER()]
          });

        await member.roles.remove(config.role.unverified);

        await VerificationUtility.deleteTicket(verificationTicket!, {
          deleteType: 'ACCEPTED',
          who: ChatInputCommandInteraction.user
        });

        await ChatInputCommandInteraction.editReply({
          embeds: [EmbedUtility.SUCCESS_COLOR(new EmbedBuilder().setDescription(`${member.user} has been accepted!`))]
        });

        await GuildUtility.sendWelcomeMessage(member);
        break;
      }

      case 'decline': {
        // TODO: Maybe merge this with the one in "interactionCreate"?
        const reason = ChatInputCommandInteraction.options.getString('reason', true);
        const user = await ChatInputCommandInteraction.client.users
          .fetch(verificationTicket!.requesterDiscordId)
          .catch(() => undefined);
        if (user)
          user
            .send({
              embeds: [
                EmbedUtility.ERROR_COLOR(
                  new EmbedBuilder({
                    title: 'Sorry!',
                    description: `Your verification request has been declined by ${ChatInputCommandInteraction.user}\nReason: ${reason}`
                  })
                )
              ]
            })
            .catch(() => undefined);

        await VerificationUtility.deleteTicket(verificationTicket!, {
          deleteType: 'DECLINED',
          who: ChatInputCommandInteraction.user
        });

        await ChatInputCommandInteraction.editReply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              new EmbedBuilder({
                description: `${user} has been declined!`
              })
            )
          ]
        });
        break;
      }
      case 'info': {
        ChatInputCommandInteraction.editReply({
          embeds: [await EmbedUtility.VERIFICATION_INFO(verificationTicket as VerificationTicket)]
        });
        break;
      }
      case 'list': {
        const verificationTicketList = await VerificationTicket.findAll();
        if (verificationTicketList.length == 0)
          return await ChatInputCommandInteraction.editReply('There are no verification tickets as of right now.');

        //TODO: Improve this bit
        await ChatInputCommandInteraction.editReply({
          content: `There's currently ${verificationTicketList.length} verification ticket(s)!`,
          files: [
            new AttachmentBuilder(
              Buffer.from(
                verificationTicketList
                  .map((verificationTicket) => {
                    return `User ID: ${verificationTicket.requesterDiscordId}\nTicket ID: ${
                      verificationTicket.id
                    }\n--------------------------------------------------\n${verificationTicket.answers
                      .map((answerData) => `${answerData.question}: ${answerData.answer}`)
                      .join('\n\n')}`;
                  })
                  .join('\n\n\n')
              ),
              {
                name: 'tickets.txt'
              }
            )
          ]
        });
        break;
      }
    }
  }
} as SlashCommand;
