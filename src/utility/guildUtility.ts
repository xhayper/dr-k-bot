import { type SapphireClient } from '@sapphire/framework';
import { EmbedUtility, UserUtilty } from '..';
import config from '../config';
import {
  type GuildTextBasedChannel,
  type Guild,
  type GuildMember,
  type Message,
  type MessagePayload,
  type TextChannel,
  type UserResolvable,
  ChannelType,
  EmbedBuilder,
  MessageCreateOptions
} from 'discord.js';

export class GuildUtility {
  private client: SapphireClient;

  public auditLogChannel: GuildTextBasedChannel | undefined;
  public verificationLogChannel: GuildTextBasedChannel | undefined;
  public primaryGeneralChannel: GuildTextBasedChannel | undefined;
  public verificationThreadChannel: TextChannel | undefined;
  public banAppealLogChannel: GuildTextBasedChannel | undefined;

  public guild: Guild | undefined;

  constructor(client: SapphireClient) {
    this.client = client;
    this.client.guilds
      .fetch(config.guildId)
      .then(async (guild) => {
        this.guild = guild;

        const auditLogChannel = await guild.channels.fetch(config.channel.auditLog).catch(() => undefined);
        this.auditLogChannel = (auditLogChannel && auditLogChannel.isTextBased() && auditLogChannel) || undefined;

        const verificationLogChannel = await guild.channels
          .fetch(config.channel.verificationLog)
          .catch(() => undefined);
        this.verificationLogChannel =
          (verificationLogChannel && verificationLogChannel.isTextBased() && verificationLogChannel) || undefined;

        const primaryGeneralChannel = await guild.channels.fetch(config.channel['general-1']).catch(() => undefined);
        this.primaryGeneralChannel =
          (primaryGeneralChannel && primaryGeneralChannel.isTextBased() && primaryGeneralChannel) || undefined;

        const ticketThreadChannel = await guild.channels.fetch(config.channel.ticketThread).catch(() => undefined);
        this.verificationThreadChannel =
          (ticketThreadChannel &&
            ticketThreadChannel.isTextBased() &&
            !ticketThreadChannel.isVoiceBased() &&
            !ticketThreadChannel.isThread() &&
            !ticketThreadChannel.isDMBased() &&
            ticketThreadChannel.type !== ChannelType.GuildAnnouncement &&
            ticketThreadChannel) ||
          undefined;

        const banAppealLogChannel = await guild.channels
          .fetch(config.channel['ban-appeal-logs'])
          .catch(() => undefined);
        this.banAppealLogChannel =
          (banAppealLogChannel && banAppealLogChannel.isTextBased() && banAppealLogChannel) || undefined;
      })
      .catch(() => null);
  }

  public async sendWelcomeMessage(member: GuildMember): Promise<void | Message> {
    if (!this.primaryGeneralChannel) return;
    return await this.primaryGeneralChannel.send({
      content: member.toString(),
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new EmbedBuilder({
            title: `Everyone give \`${member.user.tag}\` a warm welcome!`,
            thumbnail: {
              url:
                member.user.avatarURL({
                  size: 4096
                }) ?? member.user.defaultAvatarURL
            },
            description: `We're happy to have you here!\nOnce you're level 1, Head over to <#${config.channel['role-selection']}> to get some roles!`
          })
        ).toJSON()
      ]
    });
  }

  public async openThread(moderator: GuildMember, member: GuildMember): Promise<void> {
    if (!this.verificationThreadChannel) return;
    const thread = await this.verificationThreadChannel.threads.create({
      name: `${member.user.username} Ticket`,
      type: ChannelType.PrivateThread,
      invitable: true,
      autoArchiveDuration: 10080
    });

    await thread.send({
      content: `<@150337210225393665> | ${moderator} ${member.user}` // ${config.user.botOwner.map((id) => `<@${id}>`).join(' ')} |
    });

    return;
  }

  public async sendAuditLog(message: string | MessagePayload | MessageCreateOptions): Promise<void | Message> {
    if (!this.auditLogChannel) return;
    return this.auditLogChannel.send(message);
  }

  public async sendVerificationLog(message: string | MessagePayload | MessageCreateOptions): Promise<void | Message> {
    if (!this.verificationLogChannel) return;
    return this.verificationLogChannel.send(message);
  }

  public async sendBanAppealLog(message: string | MessagePayload | MessageCreateOptions): Promise<void | Message> {
    if (!this.banAppealLogChannel) return;
    return this.banAppealLogChannel.send(message);
  }

  public async getGuildMember(user: UserResolvable): Promise<void | GuildMember> {
    return this.guild?.members.fetch(user).catch(() => undefined);
  }

  public isBotOwner(member: GuildMember): boolean {
    return UserUtilty.isBotOwner(member.user);
  }

  public isHeadSecurity(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.headSecurity);
  }

  public isSeniorSecurity(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.seniorSecurity);
  }

  public isIntern(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.intern);
  }

  public isSecurity(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.security);
  }
}
