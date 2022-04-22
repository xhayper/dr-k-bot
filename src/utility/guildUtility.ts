import { UserUtilty } from '..';
import config from '../config';
import {
  Client,
  Guild,
  GuildMember,
  Message,
  MessageOptions,
  MessagePayload,
  TextBasedChannel,
  UserResolvable
} from 'discord.js';

export class GuildUtility {
  #client: Client;

  auditLogChannel: TextBasedChannel | undefined;
  verificationLogChannel: TextBasedChannel | undefined;
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
    });
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
