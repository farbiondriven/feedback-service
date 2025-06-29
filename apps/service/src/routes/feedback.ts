// apps/api/src/routes/feedback.ts
//--------------------------------------------------
import { FastifyPluginAsync } from 'fastify';
import prisma from '../db';
import { enqueueSentiment } from '../queue';
import {
  FeedbackBody,
  FeedbackBodySchema,
  FeedbackAccepted,
  FeedbackAcceptedSchema,
  FeedbackList,
  FeedbackListSchema,
  ErrorResponse,
  ErrorResponseSchema,
} from '../schemas/feedback';

const feedbackRoutes: FastifyPluginAsync = async (app) => {
  // ─── POST /feedback ──────────────────────────────────────────────────────
  app.post<{
    Body: FeedbackBody;
    Reply: FeedbackAccepted | ErrorResponse;
  }>(
    '/feedback',
    {
      schema: {
        body: FeedbackBodySchema,
        response: {
          200: FeedbackAcceptedSchema,
          400: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const { content } = req.body;
      if (!content.trim()) {
        return reply.code(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: 'Content cannot be empty',
        });
      }
      try {
        const record = await prisma.text.create({ data: { content } });
        enqueueSentiment(record.id, content);
        return reply.send({ id: record.id });
      } catch (err) {
        app.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Failed to enqueue job',
        });
      }
    },
  );

  // ─── GET /admin/feedback ─────────────────────────────────────────────────
  app.get(
    '/admin/feedback',
    {
      schema: {
        response: {
          200: FeedbackListSchema,
          401: ErrorResponseSchema,
          500: ErrorResponseSchema,
        },
      },
      preHandler: async (req, reply) => {
        const token = (req.headers.authorization ?? '').replace(
          /^Bearer\s*/i,
          '',
        );
        if (token !== process.env.ADMIN_TOKEN) {
          return reply.code(401).send({
            statusCode: 401,
            error: 'Unauthorized',
            message: 'Invalid admin token',
          });
        }
      },
    },
    async (req, reply) => {
      try {
        const raw = await prisma.text.findMany({
          orderBy: { createdAt: 'desc' },
        });
        const list: FeedbackList = raw.map((r) => ({
          id: r.id,
          content: r.content,
          sentiment: r.sentiment,
          createdAt: r.createdAt.toISOString(),
        }));
        return reply.send(list);
      } catch (err) {
        app.log.error(err);
        return reply.code(500).send({
          statusCode: 500,
          error: 'Internal Server Error',
          message: 'Could not fetch feedback list',
        });
      }
    },
  );
};

export default feedbackRoutes;
