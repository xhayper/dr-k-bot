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

@ApplyOptions<Utility.Options>({
  name: "ticket"
})
export class TicketUtility extends Utility {
  tickets = new Collection<string, Ticket>();

  private userMap = new Collection<Snowflake, string>();
  private messageIdMap = new Collection<Snowflake, string>();

  public async load() {
    await this.fetchTickets();
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

  private async fetchTickets() {
    const rows = await VerificationTicket.findMany();
    rows.forEach((row) => this.hydrate(row));
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
    const existing = this.tickets.get(ticket.id);

    if (existing) {
      if (existing.discordId !== ticket.discordId) {
        this.userMap.delete(existing.discordId);
      }

      if (existing.messageId && existing.messageId !== ticket.messageId) {
        this.messageIdMap.delete(existing.messageId);
      }
    }

    this.tickets.set(ticket.id, ticket);
    this.userMap.set(ticket.discordId, ticket.id);

    if (ticket.messageId) {
      this.messageIdMap.set(ticket.messageId, ticket.id);
    }

    return ticket;
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
    const existing = this.tickets.get(id);

    if (existing && existing.discordId !== value.discordId) {
      this.userMap.delete(existing.discordId);
    }

    if (existing?.messageId && existing.messageId !== value.messageId) {
      this.messageIdMap.delete(existing.messageId);
    }

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
    const ticket = this.tickets.get(id);
    if (!ticket) return;

    await VerificationTicket.delete({ where: { id } });

    this.tickets.delete(id);
    this.userMap.delete(ticket.discordId);

    if (ticket.messageId) {
      this.messageIdMap.delete(ticket.messageId);
    }
  }

  async get(id: string) {
    const cached = this.tickets.get(id);
    if (cached) return cached;

    const ticket = await VerificationTicket.findUnique({
      where: { id }
    });

    if (!ticket) return;
    return this.hydrate(ticket);
  }

  async getByMessageId(messageId: Snowflake) {
    const cachedId = this.messageIdMap.get(messageId);
    const cached = cachedId && this.tickets.get(cachedId);
    if (cached) return cached;

    const ticket = await VerificationTicket.findUnique({
      where: { messageId }
    });

    if (!ticket) return;
    return this.hydrate(ticket);
  }

  async has(id: string) {
    if (this.tickets.has(id)) return true;

    const ticket = await VerificationTicket.findUnique({
      where: { id }
    });

    if (!ticket) return false;

    this.hydrate(ticket);
    return true;
  }

  async getByUser(id: Snowflake) {
    const cachedId = this.userMap.get(id);
    const cached = cachedId && this.tickets.get(cachedId);
    if (cached) return cached;

    const ticket = await VerificationTicket.findUnique({
      where: { discordId: id }
    });

    if (!ticket) return;
    return this.hydrate(ticket);
  }

  async hasUser(id: Snowflake) {
    if (this.userMap.has(id)) return true;

    const ticket = await VerificationTicket.findUnique({
      where: { discordId: id }
    });

    if (!ticket) return false;

    this.hydrate(ticket);
    return true;
  }

  async removeByUser(id: Snowflake) {
    const ticket = await this.getByUser(id);
    if (!ticket) return;

    return this.remove(ticket.id);
  }
}

declare module "@sapphire/plugin-utilities-store" {
  interface Utilities {
    ticket: TicketUtility;
  }
}
