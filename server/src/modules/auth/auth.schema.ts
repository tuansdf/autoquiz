import { z } from "zod";

export const authSchemas = {
  refreshToken: z.object({
    token: z.string().min(1).max(512),
  }),
};
