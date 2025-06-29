import { parentPort, workerData } from 'worker_threads';
import winkNLP from 'wink-nlp';
import model from 'wink-eng-lite-web-model';
import { PrismaClient, Sentiment } from '@prisma/client';
import { performance } from 'node:perf_hooks';

interface JobData {
  id: number;
  content: string;
}

const prisma = new PrismaClient();
const nlp = winkNLP(model);

(async () => {
  const t0 = performance.now();
  try {
    const { id, content } = workerData as JobData;
    console.info(`Worker thread ${id}`);
    // build a document and get its sentiment score
    const doc = nlp.readDoc(content);
    const score = doc.out(nlp.its.sentiment) as number;

    // map to the Prisma enum
    const bucket =
      score > 0
        ? Sentiment.GOOD
        : score < 0
          ? Sentiment.BAD
          : Sentiment.NEUTRAL;

    // update the record
    await prisma.opinions.update({
      where: { id },
      data: { sentiment: bucket },
    });

    parentPort?.postMessage({ success: true });
  } catch (err) {
    console.error('[sentiment-worker] Error processing job:', err);
    parentPort?.postMessage({
      success: false,
      error: (err as Error).message,
    });
  } finally {
    await prisma.$disconnect();
    const ms = performance.now() - t0;
    console.info(`Sentiment Worker took ${ms.toFixed(1)} ms`);
    process.exit();
  }
})();
