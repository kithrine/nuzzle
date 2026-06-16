import "@testing-library/jest-dom/vitest";

// Load .env into process.env for tests that need it (e.g. the database
// layer tests, which instantiate a real PrismaClient reading
// process.env.DATABASE_URL). Prisma's own CLI commands load .env
// themselves, but a PrismaClient constructed inside a Vitest run does not.
try {
  process.loadEnvFile();
} catch {
  // No .env file present (e.g. CI, where env vars are injected directly).
}
