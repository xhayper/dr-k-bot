import { PrismaClient, VerificationTicket as VerificationTicketType } from "./generated/prisma/client";
import { PrismaLibSql } from "@prisma/adapter-libsql";
import { container } from "@sapphire/framework";

const adapter = new PrismaLibSql({
  url: process.env.TURSO_DATABASE_URL!,
  authToken: process.env.TURSO_AUTH_TOKEN!
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
