import { PrismaClient } from "@streamforge/auth-service/prisma";
import { config } from "./config";
const g = globalThis as { _mediaPrisma?: PrismaClient };
export const prisma =
  g._mediaPrisma ??
  new PrismaClient({
    log: config.NODE_ENV === "development" ? ["error", "warn"] : ["error"],
  });
if (config.NODE_ENV !== "production") g._mediaPrisma = prisma;
