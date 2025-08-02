import { apiAuth } from "@/api/instance.api.js";
import type { GetQuizzesResponse } from "@/type/quiz.type.js";

export const getQuizzes = async (): Promise<GetQuizzesResponse> => {
  const result = await apiAuth.get("api/quizzes");
  return result.json();
};
