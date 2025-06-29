-- CreateEnum
CREATE TYPE "Sentiment" AS ENUM ('GOOD', 'NEUTRAL', 'BAD', 'UNDETERMINED');

-- CreateTable
CREATE TABLE "Opinions" (
    "id" SERIAL NOT NULL,
    "content" VARCHAR(1000) NOT NULL,
    "sentiment" "Sentiment" NOT NULL DEFAULT 'UNDETERMINED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Opinions_pkey" PRIMARY KEY ("id")
);
