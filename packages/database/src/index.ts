// Re-export Prisma client for use across DocsVault services
export { PrismaClient } from "@prisma/client";
export * from "@prisma/client";

// Set default DATABASE_URL if not provided
if (!process.env.DATABASE_URL) {
    process.env.DATABASE_URL = "postgresql://docsvault:docsvault@localhost:5432/docsvault";
}

import { PrismaClient } from "@prisma/client";

declare global {
    // eslint-disable-next-line no-var
    var __prisma: PrismaClient | undefined;
}

function createPrismaClient() {
    return new PrismaClient({
        log: process.env.NODE_ENV === "development"
            ? ["query", "error", "warn"]
            : ["error"],
    });
}

// Singleton pattern — prevent multiple instances in dev (HMR)
export const prisma: PrismaClient =
    globalThis.__prisma ?? createPrismaClient();

if (process.env.NODE_ENV !== "production") {
    globalThis.__prisma = prisma;
}
