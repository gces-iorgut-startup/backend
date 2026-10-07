// Roda os testes de integração contra um PostgreSQL real.
// Uso: npm run test:real-db [-- <args extras do vitest>]
import { spawnSync } from "node:child_process";

const env = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    "postgresql://iougurt:iougurt@localhost:5432/iougurt_test?schema=public",
  VITEST_REAL_DB: "true",
};

function run(command, args) {
  const result = spawnSync(command, args, {
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.error) throw result.error;
  if (result.status !== 0) process.exit(result.status ?? 1);
}

run("npx", ["prisma", "migrate", "deploy"]);
run("npx", ["vitest", "run", ...process.argv.slice(2)]);
