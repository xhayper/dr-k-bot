import { Client, Guild, GuildMember, UserResolvable } from 'discord.js';
import config from '../config';

export class GuildUtility {
  #client: Client;

  guild: Guild | undefined;

  constructor(client: Client) {
    this.#client = client;
    this.#client.guilds.fetch(config.guildId).then((guild) => {
      this.guild = guild;
    });
  }

  async getGuildMember(user: UserResolvable): Promise<void | GuildMember> {
    return await this.guild?.members.fetch(user);
  }

  isBotOwner(member: GuildMember): boolean {
    return config.user.botOwner.includes(member.user.id);
  }

  isAdministrator(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.administrator) || this.isBotOwner(member);
  }

  isModerator(member: GuildMember): boolean {
    return member.roles.cache.has(config.role.moderator) || this.isAdministrator(member);
  }
}
