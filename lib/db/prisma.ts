import { PrismaClient } from "@prisma/client";

// Next.js dev hot-reload re-evaluates this module on every change; without
// caching the client on `globalThis`, each reload would open a new
// connection pool against the database. Prisma's own docs recommend this
// exact pattern for Next.js apps.
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

export const prisma = globalForPrisma.prisma ?? new PrismaClient();

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.prisma = prisma;
}
