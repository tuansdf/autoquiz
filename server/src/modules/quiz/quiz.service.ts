import { CustomException } from "../../custom-exception.js";
import { base64 } from "../../utils/base64.js";
import { commonUtils } from "../../utils/common.util.js";
import { logger } from "../../utils/logger.js";
import { quizGenerator } from "./quiz-generator.js";
import { MAX_CONTEXT_SIZE } from "./quiz.constant.js";
import { quizRepository } from "./quiz.repository";
import type { CreateQuizRequest, Quiz, QuizListItem, QuizPublic } from "./quiz.type";

class QuizService {
  public async findOneById(id: string, userId: string): Promise<Quiz | null> {
    return quizRepository.findTopByIdAndCreatedBy(id, userId);
  }

  public async findOnePublicById(id: string): Promise<QuizPublic | null> {
    return quizRepository.findTopByIdAndIsPublic(id);
  }

  public async findAllByUserId(userId: string): Promise<QuizListItem[]> {
    return quizRepository.findAllByCreatedBy(userId);
  }

  public async updateIsPublic(id: string, userId: string, value: boolean): Promise<void> {
    return quizRepository.updateIsPublicByIdAndUserId(id, userId, value);
  }

  private async generateQuestions(request: Quiz, context: string) {
    const generated = await quizGenerator.generateQuestions(context);
    if (!generated) {
      logger.error("Could not generate question " + request.id);
      return;
    }
    request.title = generated.title;
    request.questions = base64.encode(JSON.stringify(generated.questions), { compression: true });
    request.updatedAt = new Date();
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
