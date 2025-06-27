// apps/service/src/__tests__/feedback.spec.ts
import { FastifyInstance } from "fastify";
import { buildApp } from "../src/server";

jest.mock("../db", () => ({
  __esModule: true,
  // match the shape of your exported `prisma` object
  prisma: {
    text: {
      create: jest.fn(),
      findMany: jest.fn(),
    },
  },
}));

import prisma from "../src/db";
import { enqueueSentiment } from "../src/queue";

describe("Feedback API", () => {
  let app: FastifyInstance;

  beforeAll(async () => {
    app = await buildApp();
  });

  afterAll(async () => {
    await app.close();
  });

  describe("POST /feedback", () => {
    beforeEach(() => {
      jest.resetAllMocks();
    });

    it("🏷️  returns 202 and enqueues sentiment for valid content", async () => {
      (prisma.text.create as jest.Mock).mockResolvedValue({
        id: 42,
        content: "Looks great!",
        sentiment: "UNDETERMINED",
        createdAt: new Date(),
      });

      const res = await app.inject({
        method: "POST",
        url: "/feedback",
        payload: { content: "Looks great!" },
      });

      expect(res.statusCode).toBe(202);
      expect(res.json()).toEqual({ id: 42 });
      expect(prisma.text.create).toHaveBeenCalledWith({
        data: { content: "Looks great!" },
      });
      expect(enqueueSentiment).toHaveBeenCalledWith(42, "Looks great!");
    });

    it("🔢  returns 400 when content exceeds max length", async () => {
      const long = "a".repeat(2001);
      const res = await app.inject({
        method: "POST",
        url: "/feedback",
        payload: { content: long },
      });

      expect(res.statusCode).toBe(400);
      const body = res.json();
      expect(body).toHaveProperty("statusCode", 400);
      expect(body).toHaveProperty("error", "Bad Request");
      // DB and queue should never be called
      expect(prisma.text.create).not.toHaveBeenCalled();
      expect(enqueueSentiment).not.toHaveBeenCalled();
    });
  });

  describe("GET /admin/feedback", () => {
    const ADMIN = "super-secret";

    beforeAll(() => {
      process.env.ADMIN_TOKEN = ADMIN;
    });

    beforeEach(() => {
      jest.resetAllMocks();
      (prisma.text.findMany as jest.Mock).mockResolvedValue([
        {
          id: 1,
          content: "Test content",
          sentiment: "NEUTRAL",
          createdAt: new Date("2025-06-30T12:00:00Z"),
        },
      ]);
    });

    it("🚫  rejects without a token", async () => {
      const res = await app.inject({ method: "GET", url: "/admin/feedback" });
      expect(res.statusCode).toBe(401);
      expect(res.json()).toMatchObject({
        statusCode: 401,
        error: "Unauthorized",
      });
    });

    it("✅  allows with valid token and returns list", async () => {
      const res = await app.inject({
        method: "GET",
        url: "/admin/feedback",
        headers: { Authorization: `Bearer ${ADMIN}` },
      });
      expect(res.statusCode).toBe(200);
      const list = res.json();
      expect(Array.isArray(list)).toBe(true);
      expect(list[0]).toMatchObject({
        id: 1,
        content: "Test content",
        sentiment: "NEUTRAL",
        createdAt: "2025-06-30T12:00:00.000Z",
      });
      expect(prisma.text.findMany).toHaveBeenCalled();
    });
  });
});
