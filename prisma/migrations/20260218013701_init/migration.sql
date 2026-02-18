-- CreateTable
CREATE TABLE "VerificationTicket" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "discordId" TEXT NOT NULL,
    "messageId" TEXT,
    "answers" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationTicket_discordId_key" ON "VerificationTicket"("discordId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationTicket_messageId_key" ON "VerificationTicket"("messageId");
