/**
 * Simple helper that spins up a Node.js worker‑thread to run sentiment analysis
 * without blocking the main Fastify event‑loop. Swapping to a real queue (BullMQ,
 * Graphile‑Worker, etc.) is as easy as changing this one function.
 */
import { Worker } from 'worker_threads';
import { resolve } from 'path';

export interface SentimentJobData {
  id: number;
  content: string;
}

/**
 * Enqueue a sentiment‑analysis task.
 *
 * In dev we point straight at the TypeScript source via ts‑node/tsx; in
 * production we assume `tsc` transpiles to JS inside `dist/`.
 */
export function enqueueSentiment(id: number, content: string): void {
  const workerEntry =
    process.env.NODE_ENV === 'production'
      ? // compiled JS after `tsc --outDir dist`
        resolve(__dirname, './workers/sentiment.js')
      : // run TS directly with tsx/ts‑node
        resolve(__dirname, './workers/sentiment.ts');

  // Fire‑and‑forget (no message channel back to the main thread).
  new Worker(workerEntry, {
    workerData: { id, content } satisfies SentimentJobData
  });
}