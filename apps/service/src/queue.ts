/**
 * Simple helper that spins up a Node.js worker‑thread to run sentiment analysis
 * without blocking the main Fastify event‑loop. Swapping to a real queue (BullMQ,
 * Graphile‑Worker, etc.) is as easy as changing this one function.
 */
import { Worker } from 'worker_threads';
import path from 'path';

export interface SentimentJobData {
  id: number;
  content: string;
}
const isProduction = process.env.NODE_ENV === 'production';
const isTest = process.env.JEST_WORKER_ID !== undefined;

export function enqueueSentiment(id: number, content: string): void {
  const workerFile = isProduction
    ? path.join(__dirname, 'worker.js') // built JS inside the image
    : path.join(__dirname, 'worker.ts');

  const worker = new Worker(workerFile, {
    workerData: { id, content },
    execArgv: isTest ? ['-r', 'ts-node/register'] : [],
  });

  worker.once('error', (err) =>
    console.error('[enqueueSentiment] worker crashed:', err),
  );
}
