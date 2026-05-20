import { z } from "zod";

const envSchema = z.object({
  NODE_ENV: z
    .enum(["development", "test", "production"])
    .default("development"),
  PORT: z.coerce.number().default(3005),
  DATABASE_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(32),
});

export type SocialConfig = z.infer<typeof envSchema>;

export const config: SocialConfig = envSchema.parse(process.env);
