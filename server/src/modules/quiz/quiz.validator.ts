import { z } from "zod";
import { MAX_CONTEXT_SIZE } from "./quiz.constant.js";
import type { CreateQuizRequest } from "./quiz.type.js";

const createQuizSchema = z.object({
  context: z.string().check(z.minLength(1), z.maxLength(MAX_CONTEXT_SIZE, "Context is too long")),
});

class QuizValidator {
  public validateCreate(request: any): CreateQuizRequest {
    return createQuizSchema.parse(request);
  }
}

export const quizValidator = new QuizValidator();
