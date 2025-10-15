import { z } from "zod";
import { MAX_CONTEXT_SIZE } from "./quiz.constant";

export const quizSchemas = {
  create: z.object({
    context: z.string().trim().min(1).max(MAX_CONTEXT_SIZE, "Context is too long"),
  }),
};
