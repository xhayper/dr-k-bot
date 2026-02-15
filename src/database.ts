import { PrismaClient, VerificationTicket as VerificationTicketType } from "./generated/prisma/client";
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3";
import { container } from "@sapphire/framework";

const adapter = new PrismaBetterSqlite3({
  url: process.env.DATABASE_URL
});

const prisma = new PrismaClient({
  adapter,
  log: [{ emit: "event", level: "query" }]
});

prisma.$on("query", (event) => {
  container.logger.debug("-- Database Query --");
  container.logger.debug(`Query: ${event.query}`);
  container.logger.debug(`Params: ${event.params}`);
  container.logger.debug(`Duration: ${event.duration}ms`);
});

export const VerificationTicket = prisma.verificationTicket;
export { VerificationTicketType };
