import { VerificationTicketType, VerificationTicket } from "../database";
import { Utility } from "@sapphire/plugin-utilities-store";
import { Collection, type Snowflake } from "discord.js";
import { ApplyOptions } from "@sapphire/decorators";

export interface TicketAnswer {
  question: string;
  answer: string;
}

export interface Ticket {
  id: string;
  discordId: Snowflake;
  messageId?: Snowflake | null;
  answers: TicketAnswer[];
}

interface CacheEntry<T> {
  value: T;
  expiresAt: number;
}

@ApplyOptions<Utility.Options>({
  name: "ticket"
})
export class TicketUtility extends Utility {
  private ttl = 1 * 60 * 60 * 1000;

  private tickets = new Collection<string, CacheEntry<Ticket>>();
  private userMap = new Collection<Snowflake, CacheEntry<string>>();
  private messageIdMap = new Collection<Snowflake, CacheEntry<string>>();

  private missingTickets = new Collection<string, number>();
  private missingUsers = new Collection<Snowflake, number>();
  private missingMessages = new Collection<Snowflake, number>();

  private sweeper?: NodeJS.Timeout;

  public async load() {
    if (!this.sweeper) this.sweeper = setInterval(() => this.sweepAll(), this.ttl);
    return void (await this.getAll());
  }

  private now() {
    return Date.now();
  }

  private isExpired(exp: number) {
    return exp <= this.now();
  }

  private setCache<K, V>(map: Collection<K, CacheEntry<V>>, key: K, value: V, expiresAt?: number) {
    map.set(key, { value, expiresAt: expiresAt ?? this.now() + this.ttl });
  }

  private evictTicket(ticket: Ticket) {
    const userEntry = this.userMap.get(ticket.discordId);
    if (userEntry?.value === ticket.id) this.userMap.delete(ticket.discordId);

    if (ticket.messageId) {
      const msgEntry = this.messageIdMap.get(ticket.messageId);
      if (msgEntry?.value === ticket.id) this.messageIdMap.delete(ticket.messageId);
    }

    this.tickets.delete(ticket.id);
  }

  private getCache<K, V>(map: Collection<K, CacheEntry<V>>, key: K) {
    const entry = map.get(key);
    if (!entry) return;

    if (this.isExpired(entry.expiresAt)) {
      map.delete(key);
      if (map === this.tickets) this.evictTicket(entry.value as unknown as Ticket);
      return;
    }

    return entry.value;
  }

  private setMissing<K>(map: Collection<K, number>, key: K) {
    map.set(key, this.now() + this.ttl);
  }

  private hasMissing<K>(map: Collection<K, number>, key: K) {
    const exp = map.get(key);
    if (!exp) return false;

    if (this.isExpired(exp)) {
      map.delete(key);
      return false;
    }

    return true;
  }

  private parseAnswers(raw: string): TicketAnswer[] {
    try {
      const parsed = JSON.parse(raw);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }

  private stringifyAnswers(data: TicketAnswer[]): string {
    return JSON.stringify(data);
  }

  private transform(row: VerificationTicketType): Ticket {
    return {
      id: row.id,
      discordId: row.discordId as Snowflake,
      messageId: row.messageId as Snowflake | null,
      answers: this.parseAnswers(row.answers)
    };
  }

  private hydrate(row: VerificationTicketType) {
    const ticket = this.transform(row);
    const existing = this.tickets.get(ticket.id)?.value;

    if (existing) this.evictTicket(existing);

    const expiresAt = this.now() + this.ttl;

    this.setCache(this.tickets, ticket.id, ticket, expiresAt);
    this.setCache(this.userMap, ticket.discordId, ticket.id, expiresAt);

    if (ticket.messageId) {
      this.setCache(this.messageIdMap, ticket.messageId, ticket.id, expiresAt);
    }

    this.missingTickets.delete(ticket.id);
    this.missingUsers.delete(ticket.discordId);
    if (ticket.messageId) this.missingMessages.delete(ticket.messageId);

    return ticket;
  }

  private sweepCollection<K>(map: Collection<K, number>) {
    map.forEach((exp, key) => {
      if (this.isExpired(exp)) map.delete(key);
    });
  }

  public sweepAll() {
    this.tickets.forEach((entry) => {
      if (this.isExpired(entry.expiresAt)) this.evictTicket(entry.value);
    });

    this.userMap.forEach((entry, key) => {
      if (this.isExpired(entry.expiresAt)) this.userMap.delete(key);
    });

    this.messageIdMap.forEach((entry, key) => {
      if (this.isExpired(entry.expiresAt)) this.messageIdMap.delete(key);
    });

    this.sweepCollection(this.missingTickets);
    this.sweepCollection(this.missingUsers);
    this.sweepCollection(this.missingMessages);
  }

  public async getTickets(cached = true): Promise<Ticket[]> {
    if (!cached) return this.getAll();
    this.sweepAll();
    return Array.from(this.tickets.values(), (v) => v.value);
  }

  async add(id: string, value: Omit<Ticket, "id">) {
    const result = await VerificationTicket.upsert({
      where: { id },
      create: {
        id,
        discordId: value.discordId,
        messageId: value.messageId ?? null,
        answers: this.stringifyAnswers(value.answers)
      },
      update: {
        discordId: value.discordId,
        messageId: value.messageId ?? null,
        answers: this.stringifyAnswers(value.answers)
      }
    });

    return this.hydrate(result);
  }

  async edit(id: string, value: Omit<Ticket, "id">) {
    const result = await VerificationTicket.update({
      where: { id },
      data: {
        discordId: value.discordId,
        messageId: value.messageId ?? null,
        answers: this.stringifyAnswers(value.answers)
      }
    });

    return this.hydrate(result);
  }

  async remove(id: string) {
    const ticket = await VerificationTicket.findUnique({ where: { id } });
    if (!ticket) return;

    await VerificationTicket.delete({ where: { id } });

    this.evictTicket(this.transform(ticket));
  }

  async getAll(cached = false) {
    if (cached) return this.getTickets();
    this.tickets.clear();
    this.userMap.clear();
    this.messageIdMap.clear();
    this.missingTickets.clear();
    this.missingUsers.clear();
    this.missingMessages.clear();
    const tickets = await VerificationTicket.findMany();
    tickets.forEach((t) => this.hydrate(t));
    return Array.from(this.tickets.values(), (v) => v.value);
  }

  async get(id: string) {
    const cached = this.getCache(this.tickets, id);
    if (cached) return cached;

    if (this.hasMissing(this.missingTickets, id)) return;

    const ticket = await VerificationTicket.findUnique({ where: { id } });

    if (!ticket) {
      this.setMissing(this.missingTickets, id);
      return;
    }

    return this.hydrate(ticket);
  }

  async getByMessageId(messageId: Snowflake) {
    const cachedId = this.getCache(this.messageIdMap, messageId);
    const cached = cachedId && this.getCache(this.tickets, cachedId);
    if (cached) return cached;

    if (this.hasMissing(this.missingMessages, messageId)) return;

    const ticket = await VerificationTicket.findUnique({
      where: { messageId }
    });

    if (!ticket) {
      this.setMissing(this.missingMessages, messageId);
      return;
    }

    return this.hydrate(ticket);
  }

  async has(id: string) {
    if (this.getCache(this.tickets, id)) return true;
    if (this.hasMissing(this.missingTickets, id)) return false;

    const ticket = await VerificationTicket.findUnique({ where: { id } });

    if (!ticket) {
      this.setMissing(this.missingTickets, id);
      return false;
    }

    this.hydrate(ticket);
    return true;
  }

  async getByUser(id: Snowflake) {
    const cachedId = this.getCache(this.userMap, id);
    const cached = cachedId && this.getCache(this.tickets, cachedId);
    if (cached) return cached;

    if (this.hasMissing(this.missingUsers, id)) return;

    const ticket = await VerificationTicket.findUnique({
      where: { discordId: id }
    });

    if (!ticket) {
      this.setMissing(this.missingUsers, id);
      return;
    }

    return this.hydrate(ticket);
  }

  async hasUser(id: Snowflake) {
    if (this.getCache(this.userMap, id)) return true;
    if (this.hasMissing(this.missingUsers, id)) return false;

    const ticket = await VerificationTicket.findUnique({
      where: { discordId: id }
    });

    if (!ticket) {
      this.setMissing(this.missingUsers, id);
      return false;
    }

    this.hydrate(ticket);
    return true;
  }

  async removeByUser(id: Snowflake) {
    const ticket = await VerificationTicket.findUnique({
      where: { discordId: id }
    });
    if (!ticket) return;

    await VerificationTicket.delete({ where: { id: ticket.id } });
    this.evictTicket(this.transform(ticket));
  }
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {
    ticket: TicketUtility;
  }
}
