-- CreateTable
CREATE TABLE "VerificationRequest" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "ownerId" TEXT NOT NULL
);

-- CreateTable
CREATE TABLE "VerificationAnswer" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "question" TEXT NOT NULL,
    "answer" BLOB NOT NULL,
    "verificationRequestId" TEXT,
    CONSTRAINT "VerificationAnswer_verificationRequestId_fkey" FOREIGN KEY ("verificationRequestId") REFERENCES "VerificationRequest" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "VerificationRequest_ownerId_key" ON "VerificationRequest"("ownerId");

-- CreateIndex
CREATE UNIQUE INDEX "VerificationAnswer_question_key" ON "VerificationAnswer"("question");