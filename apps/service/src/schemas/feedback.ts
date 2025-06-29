// apps/api/src/schemas/feedback.ts
//--------------------------------------------------
import { Sentiment } from '@prisma/client';

/**
 * Reuse the Prisma enum values for JSON-Schema
 * and the TS type.
 */
export const SentimentSchema = {
  type: 'string' as const,
  enum: Object.values(Sentiment) as Sentiment[],
};

export type SentimentType = Sentiment;

export interface FeedbackBody {
  content: string;
}
export const FeedbackBodySchema = {
  type: 'object' as const,
  required: ['content'] as const,
  properties: {
    content: { type: 'string' as const, minLength: 1, maxLength: 1000 },
  },
  additionalProperties: false as const,
};

export interface FeedbackAccepted {
  id: number;
}
export const FeedbackAcceptedSchema = {
  type: 'object' as const,
  required: ['id'] as const,
  properties: {
    id: { type: 'integer' as const },
  },
  additionalProperties: false as const,
};

export interface FeedbackItem {
  id: number;
  content: string;
  sentiment: SentimentType;
  createdAt: string; // ISO date-time
}
export const FeedbackItemSchema = {
  type: 'object' as const,
  required: ['id', 'content', 'sentiment', 'createdAt'] as const,
  properties: {
    id: { type: 'integer' as const },
    content: { type: 'string' as const },
    sentiment: SentimentSchema,
    createdAt: { type: 'string' as const, format: 'date-time' as const },
  },
  additionalProperties: false as const,
};

/** GET /admin/feedback  list response */
export type FeedbackList = FeedbackItem[];
export const FeedbackListSchema = {
  type: 'array' as const,
  items: FeedbackItemSchema,
} as const;

/** Generic error shape */
export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
}
export const ErrorResponseSchema = {
  type: 'object' as const,
  required: ['statusCode', 'error', 'message'] as const,
  properties: {
    statusCode: { type: 'integer' as const },
    error: { type: 'string' as const },
    message: { type: 'string' as const },
  },
  additionalProperties: false as const,
};
