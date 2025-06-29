import { FastifyInstance } from 'fastify';
import { buildApp } from '../src/server';

import { prismaMock } from '../src/singleton';

describe('Feedback API', () => {
  let app: FastifyInstance;
  beforeEach(() => {
    jest.clearAllMocks();
  });

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('POST /feedback', () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it('🏷️  returns 200 and enqueues sentiment for valid content', async () => {
      prismaMock.opinions.create.mockResolvedValue({
        id: 42,
        content: 'Looks great!',
        sentiment: 'UNDETERMINED',
        createdAt: new Date(),
      });
      prismaMock.opinions.update.mockResolvedValue({
        id: 42,
        content: 'Looks great!',
        sentiment: 'GOOD',
        createdAt: new Date(),
      });

      const res = await app.inject({
        method: 'POST',
        url: '/feedback',
        payload: { content: 'Looks great!' },
      });

      expect(res.statusCode).toBe(200);
      expect(res.json()).toEqual({ id: 42 });
      expect(prismaMock.opinions.create).toHaveBeenCalledWith({
        data: { content: 'Looks great!' },
      });
    });

    it('🔢  returns 400 when content exceeds max length', async () => {
      const long = 'a'.repeat(1001);
      const res = await app.inject({
        method: 'POST',
        url: '/feedback',
        payload: { content: long },
      });

      expect(res.statusCode).toBe(400);
      const body = res.json();
      expect(body).toHaveProperty('statusCode', 400);
      expect(body).toHaveProperty('error', 'Bad Request');
      // DB and queue should never be called
      expect(prismaMock.opinions.create).not.toHaveBeenCalled();
    });
  });

  describe('GET /admin/feedback', () => {
    const ADMIN = 'super-secret';

    beforeAll(() => {
      process.env.ADMIN_TOKEN = ADMIN;
    });

    beforeEach(() => {
      prismaMock.opinions.findMany.mockResolvedValue([
        {
          id: 1,
          content: 'Test content',
          sentiment: 'NEUTRAL',
          createdAt: new Date('2025-06-30T12:00:00Z'),
        },
      ]);
    });

    it('🚫  rejects without a token', async () => {
      const res = await app.inject({ method: 'GET', url: '/admin/feedback' });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toMatchObject({
        statusCode: 401,
        error: 'Unauthorized',
      });
    });

    it('✅  allows with valid token and returns list', async () => {
      const res = await app.inject({
        method: 'GET',
        url: '/admin/feedback',
        headers: { Authorization: `Bearer ${ADMIN}` },
      });
      expect(res.statusCode).toBe(200);
      const list = res.json();
      expect(Array.isArray(list)).toBe(true);
      expect(list[0]).toMatchObject({
        id: 1,
        content: 'Test content',
        sentiment: 'NEUTRAL',
        createdAt: '2025-06-30T12:00:00.000Z',
      });
      expect(prismaMock.opinions.findMany).toHaveBeenCalled();
    });
  });
});
