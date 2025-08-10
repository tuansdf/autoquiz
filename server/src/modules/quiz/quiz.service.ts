import { CustomException } from "../../custom-exception.js";
import { base64 } from "../../utils/base64.js";
import { commonUtils } from "../../utils/common.util.js";
import { quizGenerator } from "./quiz-generator.js";
import { DEFAULT_QUESTIONS, MAX_CONTEXT_SIZE, MAX_QUESTIONS } from "./quiz.constant.js";
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

  private async generateQuestions(quizId: string, request: CreateQuizRequest) {
    let ok = false;
    let title = "";
    let questions: any = null;
    const metadata = await quizGenerator.generateMetadata(request.context);
    if (metadata?.ok) {
      title = metadata.title;
      let numberOfQuestions = metadata.numberOfQuestions || 0;
      if (numberOfQuestions <= 1) {
        numberOfQuestions = DEFAULT_QUESTIONS;
      }
      if (numberOfQuestions > MAX_QUESTIONS) {
        numberOfQuestions = MAX_QUESTIONS;
      }
      const response = await quizGenerator.generateQuestions(request.context, numberOfQuestions, []);
      if (response?.questions) {
        ok = true;
        questions = response?.questions;
      }
    }
    await quizRepository.update({
      id: quizId,
      title,
      ok,
      questions: base64.encode(JSON.stringify(questions), { compression: true }),
      updatedAt: new Date(),
    });
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
    request.context = context;
    this.generateQuestions(result?.id!, request);
    return result!;
  }
}

export const quizService = new QuizService();
