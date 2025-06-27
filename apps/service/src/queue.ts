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

export function enqueueSentiment(id: number, content: string): void {
  // __dirname at runtime === /app/dist
  //const workerFile = path.join(__dirname, "worker.js");
  const workerFile = path.join(__dirname, 'worker.ts');

  const worker = new Worker(workerFile, {
    workerData: { id, content },
  });

  worker.once('error', (err) => console.error('[enqueueSentiment] worker crashed:', err));
}
