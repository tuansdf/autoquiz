import { CustomException } from "../../custom-exception.js";
import { base64 } from "../../utils/base64.js";
import { commonUtils } from "../../utils/common.util.js";
import { logger } from "../../utils/logger.js";
import { quizGenerator } from "./quiz-generator.js";
import { MAX_CONTEXT_SIZE } from "./quiz.constant.js";
import { quizRepository } from "./quiz.repository";
import type { CreateQuizRequest, Quiz } from "./quiz.type";

class QuizService {
  public async findOneById(id: string, userId: string): Promise<Quiz | null> {
    return quizRepository.findTopByIdAndCreatedBy(id, userId);
  }

  public async findAllByUserId(userId: string): Promise<Quiz[]> {
    return quizRepository.findAllByCreatedBy(userId);
  }

  private async generateQuestions(request: Quiz, context: string) {
    const question = await quizGenerator.generateQuestions(context);
    if (!question) {
      logger.error("Could not generate question " + request.id);
      return;
    }
    request.questions = base64.encode(question, { compression: true });
    await quizRepository.update(request);
  }

  public async create(request: CreateQuizRequest, userId: string): Promise<Quiz> {
    const context = base64.decode(request.context!, { decompression: true });
    if (context.length > MAX_CONTEXT_SIZE) {
      throw new CustomException("Context is too long");
    }
    const result = await quizRepository.insert({
      context: request.context,
      contextHash: commonUtils.sha1(request.context),
      createdBy: userId,
    });
    this.generateQuestions(result!, context);
    return result!;
  }
}

export const quizService = new QuizService();
