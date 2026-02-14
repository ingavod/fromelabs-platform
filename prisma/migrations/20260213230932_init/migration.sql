-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "passwordHash" TEXT NOT NULL,
    "emailVerified" INTEGER NOT NULL DEFAULT 0,
    "plan" TEXT NOT NULL DEFAULT 'FREE',
    "stripeCustomerId" TEXT,
    "stripeSubscriptionId" TEXT,
    "subscriptionStatus" TEXT NOT NULL DEFAULT 'INACTIVE',
    "messagesUsed" INTEGER NOT NULL DEFAULT 0,
    "messagesLimit" INTEGER NOT NULL DEFAULT 50,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    "lastLoginAt" TEXT
);

-- CreateTable
CREATE TABLE "Conversation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "title" TEXT NOT NULL DEFAULT 'Nueva conversación',
    "userId" TEXT NOT NULL,
    "createdAt" TEXT NOT NULL DEFAULT '',
    "updatedAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Conversation_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Message" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "conversationId" TEXT NOT NULL,
    "role" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tokensUsed" INTEGER NOT NULL DEFAULT 0,
    "model" TEXT,
    "createdAt" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Message_conversationId_fkey" FOREIGN KEY ("conversationId") REFERENCES "Conversation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Usage" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "userId" TEXT NOT NULL,
    "messagesCount" INTEGER NOT NULL DEFAULT 1,
    "tokensUsed" INTEGER NOT NULL,
    "cost" REAL NOT NULL,
    "model" TEXT NOT NULL,
    "timestamp" TEXT NOT NULL DEFAULT '',
    CONSTRAINT "Usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeCustomerId_key" ON "User"("stripeCustomerId");

-- CreateIndex
CREATE UNIQUE INDEX "User_stripeSubscriptionId_key" ON "User"("stripeSubscriptionId");
