// apps/api/src/prisma.ts
//--------------------------------------------------
import { PrismaClient } from '@prisma/client';

/**
 * A single PrismaClient instance for the whole Fastify process.
 * Re-using the connection pool avoids “too many connections” errors
 * in dev hot-reload loops and in serverless environments.
 */
const prisma = new PrismaClient();

export default prisma;
