import { defineConfig } from "vitest/config";
import path from "path";

const REAL_DB = process.env.VITEST_REAL_DB === "true";
const REAL_DB_TESTS = "tests/integration/real-db/**/*.spec.ts";

const TEST_ENV = {
  DATABASE_URL:
    process.env.DATABASE_URL ?? "postgresql://test:test@localhost:5432/test",
  JWT_SECRET: "test-jwt-secret",
  PASSWORD_RESET_SECRET: "test-password-reset-secret",
  JWT_EXPIRES_IN: "15m",
  REFRESH_TOKEN_EXPIRES_IN: "7d",
  GEMINI_API_KEY: "test-gemini-key",
  GOOGLE_CLIENT_ID: "test-google-client-id",
  RESEND_API_KEY: "test-resend-key",
  MAIL_FROM: "no-reply@iougurt.com",
  GEMINI_MODEL: "gemini-2.5-flash",
  NODE_ENV: "test",
  APP_URL: "http://localhost:3000",
};

export default defineConfig({
  resolve: {
    extensions: [".ts", ".tsx", ".js", ".jsx"],
    alias: {
      "@modules": path.resolve(__dirname, "src/modules"),
      "@shared": path.resolve(__dirname, "src/shared"),
      "@config": path.resolve(__dirname, "src/config"),
    },
  },
  test: {
    globals: true,
    environment: "node",
    env: TEST_ENV,
    hookTimeout: 30000,
    setupFiles: ["./tests/setup.ts"],
    include: REAL_DB ? [REAL_DB_TESTS] : ["tests/**/*.spec.ts", "src/**/*.spec.ts"],
    exclude: REAL_DB ? ["node_modules/**"] : ["node_modules/**", REAL_DB_TESTS],
    // Os arquivos de banco real compartilham o mesmo schema: rodar em série.
    fileParallelism: !REAL_DB,
    coverage: {
      provider: "v8",
      reporter: ["text", "text-summary", "html", "lcov", "json-summary"],
      reportsDirectory: "./coverage",
      include: ["src/**/*.ts"],
      exclude: [
        "src/server.ts",
        "src/**/*.spec.ts",
        "src/**/in-memory/**",
        "src/@types/**",
      ],
    },
  },
});
