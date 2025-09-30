import { CustomException } from "../../custom-exception";
import { base64 } from "../../utils/base64";
import { logger } from "../../utils/logger";
import { questionRepository } from "../question/question.repository";
import { questionService } from "../question/question.service";
import { quizGenerator } from "./quiz-generator";
import { DEFAULT_QUESTIONS, MAX_CONTEXT_SIZE, MAX_QUESTIONS } from "./quiz.constant";
import { quizRepository } from "./quiz.repository";
import type { CreateQuizRequest, Quiz, QuizListItem, QuizPrivate, QuizPublic } from "./quiz.type";

class QuizService {
  public async findOneById(id: string, userId: string): Promise<QuizPrivate | null> {
    const quiz = await quizRepository.findTopByIdAndCreatedBy(id, userId);
    if (!quiz) return null;
    const questions = await questionService.findAllByQuizId(quiz.id || "");
    if (questions?.length) {
      quiz.questions = base64.encode(JSON.stringify(questions), { compression: true });
    }
    return quiz;
  }

  public async findOnePublicById(id: string): Promise<QuizPublic | null> {
    const quiz = await quizRepository.findTopByIdAndIsPublic(id);
    if (!quiz) return null;
    const questions = await questionService.findAllByQuizId(quiz.id || "");
    if (questions?.length) {
      quiz.questions = base64.encode(JSON.stringify(questions), { compression: true });
    }
    return quiz;
  }

  public async findAllByUserId(userId: string): Promise<QuizListItem[]> {
    return quizRepository.findAllByCreatedBy(userId);
  }

  public async updateIsPublic(id: string, userId: string, value: boolean): Promise<void> {
    return quizRepository.updateIsPublicByIdAndUserId(id, userId, value);
  }

  private async generateQuestions(quizId: string, request: CreateQuizRequest) {
    try {
      await quizRepository.update({
        id: quizId,
        isProcessing: true,
        updatedAt: new Date(),
      });
      const questions = await questionRepository.findAllByQuizId(quizId);
      const response = await quizGenerator.generateQuestions(request.context, DEFAULT_QUESTIONS, questions);
      await quizRepository.update({
        id: quizId,
        title: response?.title,
        isProcessing: false,
        updatedAt: new Date(),
      });
      await questionService.addAllByQuizId(response?.questions || [], quizId);
    } catch (e) {
      logger.error({ error: e, method: "QuizService.generateQuestions" });
      await quizRepository.update({
        id: quizId,
        isProcessing: false,
        updatedAt: new Date(),
      });
    }
  }

  public async create(request: CreateQuizRequest, userId: string): Promise<Quiz> {
    const context = base64.decode(request.context!, { decompression: true });
    if (context.length > MAX_CONTEXT_SIZE) {
      throw new CustomException("Context is too long");
    }
    const result = await quizRepository.insert({
      context: request.context,
      isProcessing: true,
      createdBy: userId,
    });
    this.generateQuestions(result?.id!, { context });
    return result!;
  }

  public async generateMore(quizId: string, userId: string) {
    const quiz = await quizRepository.findTopByIdAndCreatedBy(quizId, userId);
    if (!quiz) {
      throw new CustomException("Quiz not found");
    }
    if (quiz.isProcessing) {
      throw new CustomException("Another request is being processed");
    }
    const questions = await questionRepository.countAllByQuizId(quizId);
    if (questions >= MAX_QUESTIONS) {
      throw new CustomException("You have reached the maximum number of questions for this quiz");
    }
    this.generateQuestions(quizId, { context: base64.decode(quiz.context || "", { decompression: true }) });
  }
}

export const quizService = new QuizService();
