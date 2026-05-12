import { PrismaClient } from "@streamforge/auth-service/prisma";
import { config } from "./config";

const globalForPrisma = globalThis as unknown as {
  realtimePrisma?: PrismaClient;
};

export const prisma =
  globalForPrisma.realtimePrisma ??
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (config.NODE_ENV !== "production") {
  globalForPrisma.realtimePrisma = prisma;
}
