import { quizRepository } from "./quiz.repository";
import type { Quiz } from "./quiz.type";

class QuizService {
  public async findOneById(id: string, userId: string): Promise<Quiz | null> {
    return quizRepository.findTopByIdAndCreatedBy(id, userId);
  }

  public async findAllByUserId(userId: string): Promise<Quiz[]> {
    return quizRepository.findAllByCreatedBy(userId);
  }
}

export const quizService = new QuizService();
