import { VerificationTicket, VerificationTicketType } from '../database';
import { EmbedUtility, GuildUtility, VerificationUtility } from '..';
import { type Message, MessageAttachment } from 'discord.js';
import { reply } from '@sapphire/plugin-editable-commands';
import { Subcommand } from '@sapphire/plugin-subcommands';
import { ApplyOptions } from '@sapphire/decorators';
import { EmbedBuilder } from '@discordjs/builders';
import { type Args } from '@sapphire/framework';
import config from '../config';

const verificationTicketIdOption = (option: any) => {
  return option.setName('id').setDescription('The ticket id').setRequired(true);
};

const getTicketFromInteraction = async (
  interaction: Subcommand.ChatInputInteraction
): Promise<VerificationTicketType | null> => {
  const ticket = await VerificationUtility.getTicketFromId(interaction.options.getString('id', true));

  if (!ticket) {
    interaction.editReply({
      embeds: [EmbedUtility.CANT_FIND_TICKET().toJSON()]
    });

    return null;
  }

  return ticket;
};

const getTicketFromArgs = async (message: Message, args: Args): Promise<VerificationTicketType | null> => {
  const ticket = await VerificationUtility.getTicketFromId(await args.pick('string').catch(() => ''));

  if (!ticket) {
    reply(message, {
      embeds: [EmbedUtility.CANT_FIND_TICKET().toJSON()]
    });

    return null;
  }

  return ticket;
};

const createVerificationListAttachment = (verificationTickets: VerificationTicketType[]): MessageAttachment => {
  return new MessageAttachment(
    Buffer.from(
      verificationTickets
        .map((ticket) => {
          return `User ID: ${ticket.discordId}\nTicket ID: ${
            ticket.id
          }\n--------------------------------------------------\n${JSON.parse(ticket.answers)
            .map((answerData: { question: string; answer: string }) => `${answerData.question}: ${answerData.answer}`)
            .join('\n\n')}`;
        })
        .join('\n\n\n')
    ),
    'verification-tickets.txt'
  );
};

@ApplyOptions<Subcommand.Options>({
  description: 'Verification ticket management',
  preconditions: ['ChangedGuildOnly', ['HeadSecurityOnly', 'SeniorSecurityOnly', 'SecurityOnly', 'InternOnly']],
  subcommands: [
    { name: 'accept', messageRun: 'messageAccept', chatInputRun: 'chatInputAccept' },
    { name: 'decline', messageRun: 'messageDecline', chatInputRun: 'chatInputDecline' },
    { name: 'info', messageRun: 'messageInfo', chatInputRun: 'chatInputInfo' },
    { name: 'list', messageRun: 'messageList', chatInputRun: 'chatInputList' }
  ]
})
export class CommandHandler extends Subcommand {
  public override registerApplicationCommands(registry: Subcommand.Registry) {
    registry.registerChatInputCommand(
      (builder) =>
        (builder as any)
          .setName(this.name)
          .setDescription(this.description)
          .addSubcommand((builder: any) =>
            builder.setName('accept').setDescription('-').addStringOption(verificationTicketIdOption)
          )
          .addSubcommand((builder: any) =>
            builder
              .setName('decline')
              .setDescription('-')
              .addStringOption(verificationTicketIdOption)
              .addStringOption((option: any) =>
                option.setName('reason').setDescription('The reason for declining the request').setRequired(true)
              )
          )
          .addSubcommand((builder: any) =>
            builder
              .setName('info')
              .setDescription('Show a specific verification ticket')
              .addStringOption(verificationTicketIdOption)
          )
          .addSubcommand((builder: any) =>
            builder.setName('list').setDescription('Show unfinished verification tickets')
          ),
      {
        guildIds: [config.guildId]
      }
    );
  }

  public async messageAccept(message: Message, args: Args) {
    const ticket = await getTicketFromArgs(message, args);
    if (!ticket) return;

    const member = await GuildUtility.getGuildMember(ticket.discordId);
    if (!member)
      return await reply(message, {
        embeds: [EmbedUtility.CANT_FIND_USER().toJSON()]
      });

    await member.roles.remove(config.role.unverified);

    await VerificationUtility.deleteTicket(ticket!, {
      deleteType: 'ACCEPTED',
      who: message.author
    });

    await reply(message, {
      embeds: [
        EmbedUtility.SUCCESS_COLOR(new EmbedBuilder().setDescription(`${member.user} has been accepted!`)).toJSON()
      ]
    });

    await GuildUtility.sendWelcomeMessage(member);
  }

  public async chatInputAccept(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    const member = await GuildUtility.getGuildMember(ticket.discordId);
    if (!member)
      return await interaction.editReply({
        embeds: [EmbedUtility.CANT_FIND_USER().toJSON()]
      });

    await member.roles.remove(config.role.unverified);

    await VerificationUtility.deleteTicket(ticket!, {
      deleteType: 'ACCEPTED',
      who: interaction.user
    });

    await interaction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(new EmbedBuilder().setDescription(`${member.user} has been accepted!`)).toJSON()
      ]
    });

    await GuildUtility.sendWelcomeMessage(member);
  }

  public async messageDecline(message: Message, args: Args) {
    const ticket = await getTicketFromArgs(message, args);
    if (!ticket) return;

    const reason = args.rest('string').catch(() => null);
    if (!reason) await reply(message, "You didn't provide a reason!");

    const user = await this.container.client.users.fetch(ticket!.discordId).catch(() => undefined);

    if (user)
      user
        .send({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                title: 'Sorry!',
                description: `Your verification request has been declined by ${message.author}\nReason: ${reason}`
              })
            ).toJSON()
          ]
        })
        .catch(() => undefined);

    await VerificationUtility.deleteTicket(ticket!, {
      deleteType: 'DECLINED',
      who: message.author
    });

    await reply(message, {
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            description: `${user} has been declined!`
          })
        ).toJSON()
      ]
    });
  }

  public async chatInputDecline(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    const reason = interaction.options.getString('reason', true);

    const user = await this.container.client.users.fetch(ticket!.discordId).catch(() => undefined);
    if (user)
      user
        .send({
          embeds: [
            EmbedUtility.ERROR_COLOR(
              new EmbedBuilder({
                title: 'Sorry!',
                description: `Your verification request has been declined by ${interaction.user}\nReason: ${reason}`
              })
            ).toJSON()
          ]
        })
        .catch(() => undefined);

    await VerificationUtility.deleteTicket(ticket!, {
      deleteType: 'DECLINED',
      who: interaction.user
    });

    await interaction.editReply({
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            description: `${user} has been declined!`
          })
        ).toJSON()
      ]
    });
  }

  public async messageInfo(message: Message, args: Args) {
    const ticket = await getTicketFromArgs(message, args);
    if (!ticket) return;

    await reply(message, {
      embeds: [(await EmbedUtility.VERIFICATION_INFO(ticket as VerificationTicketType)).toJSON()]
    });
  }

  public async chatInputInfo(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const ticket = await getTicketFromInteraction(interaction);
    if (!ticket) return;

    await interaction.editReply({
      embeds: [(await EmbedUtility.VERIFICATION_INFO(ticket as VerificationTicketType)).toJSON()]
    });
  }

  public async messageList(message: Message, args: Args) {
    const verificationTickets = await VerificationTicket.findMany();

    if (verificationTickets.length == 0)
      return await reply(message, 'There are no verification tickets as of right now.');

    await reply(message, {
      content: `There's currently ${verificationTickets.length} verification ticket(s)!`,
      files: [createVerificationListAttachment(verificationTickets)]
    });
  }

  public async chatInputList(interaction: Subcommand.ChatInputInteraction) {
    await interaction.deferReply();

    const verificationTickets = await VerificationTicket.findMany();

    if (verificationTickets.length == 0)
      return await interaction.editReply('There are no verification tickets as of right now.');

    await interaction.editReply({
      content: `There's currently ${verificationTickets.length} verification ticket(s)!`,
      files: [createVerificationListAttachment(verificationTickets)]
    });
  }
}
