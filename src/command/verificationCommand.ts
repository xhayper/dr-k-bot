import { CommandInteraction, MessageAttachment, MessageEmbed } from 'discord.js';
import { EmbedUtility, GuildUtility, VerificationUtility } from '..';
import { SlashCommand } from '../base/slashCommand';
import { VerificationTicket } from '../database';
import config from '../config';
import moment from 'moment';

export default {
  name: 'verification',
  guildId: [config.guildId],
  permission: 'MODERATOR',
  execute: async (commandInteraction: CommandInteraction) => {
    let verificationTicket: VerificationTicket | void;

    const subCommand = commandInteraction.options.getSubcommand(true);

    // Checking and setting field
    switch (subCommand) {
      case 'accept':
      case 'decline':
      case 'info': {
        verificationTicket = await VerificationUtility.getTicketFromId(
          commandInteraction.options.getString('id', true)
        );
        if (!verificationTicket)
          return commandInteraction.editReply({
            embeds: [EmbedUtility.CANT_FIND_TICKET()]
          });
        break;
      }
    }

    // The actual logic
    switch (subCommand) {
      case 'accept': {
        // TODO: Maybe merge this with the one in "interactionCreate"?
        const member = await GuildUtility.getGuildMember(verificationTicket!.senderId);
        if (!member)
          return commandInteraction.editReply({
            embeds: [EmbedUtility.CANT_FIND_USER()]
          });

        await member.roles.remove(config.role.unverified);

        await VerificationUtility.deleteTicket(verificationTicket!, {
          deleteType: 'ACCEPTED',
          who: commandInteraction.user
        });

        await commandInteraction.editReply({
          embeds: [EmbedUtility.SUCCESS_COLOR(new MessageEmbed().setDescription(`${member.user} has been accepted!`))]
        });

        await GuildUtility.sendWelcomeMessage(member);

        await GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              EmbedUtility.AUDIT_MESSAGE(commandInteraction.user, `**✅ ${member.user} has been accepted!**`)
            )
          ]
        });
        break;
      }

      case 'decline': {
        // TODO: Maybe merge this with the one in "interactionCreate"?
        const reason = commandInteraction.options.getString('reason', true);
        const user = await commandInteraction.client.users.fetch(verificationTicket!.senderId);
        if (user)
          try {
            user.send({
              embeds: [
                EmbedUtility.ERROR_COLOR(
                  new MessageEmbed({
                    title: 'Sorry!',
                    description: `Your verification request has been declined by ${commandInteraction.user}\nReason: ${reason}`
                  })
                )
              ]
            });
          } catch (ignored) {}

        await VerificationUtility.deleteTicket(verificationTicket!, {
          deleteType: 'DECLINED',
          who: commandInteraction.user
        });

        await commandInteraction.editReply({
          embeds: [
            EmbedUtility.SUCCESS_COLOR(
              new MessageEmbed({
                description: `${user} has been declined!`
              })
            )
          ]
        });

        await GuildUtility.sendAuditLog({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              EmbedUtility.AUDIT_MESSAGE(
                commandInteraction.user,
                `**⛔️ ${user} has been declined!**\nReason: ${reason}`
              )
            )
          ]
        });
        break;
      }
      case 'info': {
        commandInteraction.editReply({
          embeds: [await EmbedUtility.VERIFICATION_INFO(verificationTicket as VerificationTicket)]
        });
        break;
      }
      case 'list': {
        const verificationTicketList = await VerificationTicket.findAll();
        if (verificationTicketList.length == 0)
          return await commandInteraction.editReply('There are no verification tickets as of right now.');

        //TODO: Improve this bit
        await commandInteraction.editReply({
          content: `There's currently ${verificationTicketList.length} verification ticket(s)!`,
          files: [
            new MessageAttachment(
              Buffer.from(
                (
                  await Promise.all(
                    verificationTicketList.map(async (verificationTicket) => {
                      const targetUser = await commandInteraction.client.users.fetch(verificationTicket.senderId);

                      const answerArray = [
                        verificationTicket.answers.firstAnswer,
                        verificationTicket.answers.secondAnswer,
                        verificationTicket.answers.thirdAnswer,
                        verificationTicket.answers.fourthAnswer,
                        verificationTicket.answers.fifthAnswer
                      ];

                      return `User: ${targetUser.tag}\nAccount creation date: ${moment(targetUser.createdAt).format(
                        'MMMM Do YYYY'
                      )}\nTicket ID: ${
                        verificationTicket.id
                      }\n--------------------------------------------------\n${answerArray
                        .map((answer, index) => `${index + 1}:\n${answer}`)
                        .join('\n')}`;
                    })
                  )
                ).join('\n\n')
              ),
              'tickets.txt'
            )
          ]
        });
        break;
      }
    }
  }
} as SlashCommand;
