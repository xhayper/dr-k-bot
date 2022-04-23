import { EmbedUtility, UserUtilty } from '..';
import config from '../config';
import {
  Client,
  Guild,
  GuildMember,
  Message,
  MessageEmbed,
  MessageOptions,
  MessagePayload,
  NewsChannel,
  TextBasedChannel,
  TextChannel,
  UserResolvable
} from 'discord.js';

export class GuildUtility {
  #client: Client;

  auditLogChannel: TextBasedChannel | undefined;
  verificationLogChannel: TextBasedChannel | undefined;
  primaryGeneralChannel: TextBasedChannel | undefined;
  verificationThreadChannel: TextChannel | NewsChannel | undefined;

  guild: Guild | undefined;

  constructor(client: Client) {
    this.#client = client;
    this.#client.guilds.fetch(config.guildId).then(async (guild) => {
      this.guild = guild;

      const auditLogChannel = await guild.channels.fetch(config.channel.auditLog);
      if (auditLogChannel && auditLogChannel.isText()) this.auditLogChannel = auditLogChannel;

      const verificationLogChannel = await guild.channels.fetch(config.channel.verificationLog);
      if (verificationLogChannel && verificationLogChannel.isText())
        this.verificationLogChannel = verificationLogChannel;

      const primaryGeneralChannel = await guild.channels.fetch(config.channel['general-1']);
      if (primaryGeneralChannel && primaryGeneralChannel.isText()) this.primaryGeneralChannel = primaryGeneralChannel;

      const ticketThreadChannel = await guild.channels.fetch(config.channel.ticketThread);
      if (ticketThreadChannel && ticketThreadChannel.isText()) this.verificationThreadChannel = ticketThreadChannel;
    });
  }

  async sendWelcomeMessage(member: GuildMember): Promise<void | Message> {
    if (!this.primaryGeneralChannel) return;
    return await this.primaryGeneralChannel.send({
      content: member.toString(),
      embeds: [
        EmbedUtility.SUCCESS_COLOR(
          new MessageEmbed({
            title: `Everyone give \`${member.user.tag}\` a warm welcome!`,
            thumbnail: {
              url:
                member.user.avatarURL({
                  dynamic: true,
                  size: 4096
                }) || member.user.defaultAvatarURL
            },
            // TODO: Remove hard-coded channel id
            description: `We're happy to have you here!\nOnce you're level 5, Head over to <#895157379103092776> to get some roles!`
          })
        )
      ]
    });
  }

  async openThread(moderator: GuildMember, member: GuildMember): Promise<void> {
    if (!this.verificationThreadChannel) return;
    const thread = await this.verificationThreadChannel.threads.create({
      name: `${member.user.username} Ticket`,
      // @ts-expect-error
      type: 'GUILD_PRIVATE_THREAD',
      // @ts-expect-error
      invitable: true,
      autoArchiveDuration: 'MAX'
    });

    await thread.send({
      content: `||${config.user.botOwner.map((id) => `<@${id}>`).join(' ')} ${moderator} ${member.user}||`
    });

    return;
  }

  async sendAuditLog(message: string | MessagePayload | MessageOptions): Promise<void | Message> {
    if (!this.auditLogChannel) return;
    return await this.auditLogChannel.send(message);
  }

  async sendVerificationLog(message: string | MessagePayload | MessageOptions): Promise<void | Message> {
    if (!this.verificationLogChannel) return;
    return await this.verificationLogChannel.send(message);
  }

  async getGuildMember(user: UserResolvable): Promise<void | GuildMember> {
    return await this.guild?.members.fetch(user);
  }

  isBotOwner(member: GuildMember): boolean {
    return UserUtilty.isBotOwner(member.user);
  }

  isAdministrator(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.administrator) || this.isBotOwner(member);
  }

  isModerator(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.moderator) || this.isAdministrator(member);
  }
}
