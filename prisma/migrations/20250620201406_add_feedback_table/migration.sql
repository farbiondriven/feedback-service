-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('GOOD', 'NEUTRAL', 'BAD', 'UNDETERMINED');

-- CreateTable
CREATE TABLE "Text" (
    "id" SERIAL NOT NULL,
    "content" TEXT NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'UNDETERMINED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Text_pkey" PRIMARY KEY ("id")
);
