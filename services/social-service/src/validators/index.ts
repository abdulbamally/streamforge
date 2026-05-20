import { z } from "zod";

export const profileQuerySchema = z.object({
  id: z.string().uuid().optional(),
});
