import { apiAuth } from "@/api/instance.api.js";
import type { GetQuizResponse, GetQuizzesResponse } from "@/type/quiz.type.js";
import { base64 } from "@/utils/base64.js";

export const getQuizzes = async (): Promise<GetQuizzesResponse> => {
  const result = await apiAuth.get("api/quizzes");
  return result.json();
};

export const getQuiz = async (id?: string): Promise<GetQuizResponse> => {
  const result = await apiAuth.get(`api/quizzes/${id}`);
  const quiz = (await result.json()) as any;
  if (quiz?.data?.questions) {
    quiz.data.questions = JSON.parse(base64.decode(quiz.data.questions, { decompression: true }));
  }
  return quiz;
};

export const createQuiz = async (data: { context: string }): Promise<GetQuizResponse> => {
  const result = await apiAuth.post("api/quizzes", {
    json: {
      context: base64.encode(JSON.stringify(data.context), { compression: true }),
    },
  });
  return result.json();
};
