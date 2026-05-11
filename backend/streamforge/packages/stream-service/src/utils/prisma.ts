import { PrismaClient } from "@streamforge/auth-service/prisma";
import { config } from "./config";

const g = globalThis as { _prisma?: PrismaClient };

export const prisma =
  g._prisma ??
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });

if (config.NODE_ENV !== "production") g._prisma = prisma;
