import { v4 } from "uuid";
import { questionRepository } from "./question.repository";
import type { NewQuestion, Question } from "./question.type";

class QuestionService {
  public async findAllByQuizId(quizId: string): Promise<Question[] | null> {
    return questionRepository.findAllByQuizId(quizId);
  }

  public async addAllByQuizId(questions: NewQuestion[], quizId: string): Promise<undefined> {
    if (!questions.length) return;
    questions.forEach((question) => {
      question.quizId = quizId;
      question.answers?.forEach((answer) => {
        answer.id = v4();
      });
    });
    return questionRepository.insertAll(questions);
  }
}

export const questionService = new QuestionService();
