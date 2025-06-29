import { PrismaClient } from '@prisma/client';
import { mockDeep, mockReset } from 'jest-mock-extended';

const prismaMock = mockDeep<PrismaClient>();

jest.mock('./db', () => {
  // pull the *real* module so we can forward its named exports
  const actual = jest.requireActual<typeof import('./db')>('./db');

  return {
    __esModule: true,
    ...actual, // Sentiment (and any other enums) stay intact
    default: prismaMock, // but *default* becomes the deep mock
  };
});

beforeEach(() => mockReset(prismaMock));

export { prismaMock };
