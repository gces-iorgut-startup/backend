import { beforeAll, beforeEach, vi } from "vitest";
import { mockDeep, mockReset } from "vitest-mock-extended";
import type { PrismaClient } from "@prisma/client";

const { useRealPrisma } = vi.hoisted(() => ({
  useRealPrisma: process.env.VITEST_REAL_DB === "true",
}));

vi.mock("@config/prisma", async () => {
  if (useRealPrisma) {
    return await vi.importActual<typeof import("@config/prisma")>("@config/prisma");
  }

  return {
    prisma: mockDeep<PrismaClient>(),
  };
});

vi.mock("resend", () => {
  if (useRealPrisma) {
    return {};
  }

  return {
    Resend: vi.fn().mockImplementation(() => ({
      emails: {
        send: vi
          .fn()
          .mockResolvedValue({ data: { id: "mail-id" }, error: null }),
      },
    })),
  };
});

vi.mock("@google/generative-ai", () => {
  if (useRealPrisma) {
    return {};
  }

  return {
    GoogleGenerativeAI: vi.fn().mockImplementation(() => ({
      getGenerativeModel: vi.fn().mockImplementation(() => ({
        generateContent: vi.fn().mockResolvedValue({
          response: { text: () => "Resumo de IA simulado para o atendimento." },
        }),
      })),
    })),
  };
});

vi.mock("google-auth-library", () => {
  if (useRealPrisma) {
    return {};
  }

  return {
    OAuth2Client: vi.fn().mockImplementation(() => ({
      getTokenInfo: vi.fn().mockResolvedValue({
        email: "google-user@iougurt.com",
        sub: "google-sub-123",
      }),
      verifyIdToken: vi.fn().mockResolvedValue({
        getPayload: () => ({
          sub: "google-sub-123",
          email: "google-user@iougurt.com",
          email_verified: true,
          name: "Google User",
        }),
      }),
    })),
  };
});

import { prisma } from "@config/prisma";

beforeAll(() => {
  vi.spyOn(console, "error").mockImplementation(() => undefined);
  vi.spyOn(console, "warn").mockImplementation(() => undefined);
});

beforeEach(() => {
  if (useRealPrisma) return;

  mockReset(prisma as unknown as ReturnType<typeof mockDeep>);
  const tx = prisma as unknown as {
    $transaction: ReturnType<typeof vi.fn>;
  };
  tx.$transaction.mockImplementation(async (arg: unknown) => {
    if (typeof arg === "function") {
      return (arg as (client: unknown) => unknown)(prisma);
    }
    if (Array.isArray(arg)) {
      return Promise.all(arg);
    }
    return undefined;
  });
});

export const prismaMock = prisma as unknown as PrismaClient;
