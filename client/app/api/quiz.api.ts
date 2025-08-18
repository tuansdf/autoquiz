import { apiAuth, apiPublic } from "@/api/instance.api.js";
import type { GetQuizResponse, GetQuizzesResponse } from "@/type/quiz.type.js";
import { getSession } from "@/utils/auth.util.js";
import { base64 } from "@/utils/base64.js";

export const getQuizzes = async (): Promise<GetQuizzesResponse> => {
  const result = await apiAuth.get("api/quizzes");
  return result.json();
};

export const getQuiz = async (id?: string): Promise<GetQuizResponse> => {
  const isAuth = !!getSession();
  let url = `api/quizzes/${id}`;
  if (!isAuth) {
    url = `api/quizzes/public/${id}`;
  }
  const result = await (isAuth ? apiAuth : apiPublic).get(url);
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

export const generateQuestions = async (data: { quizId: string }): Promise<GetQuizResponse> => {
  const result = await apiAuth.post(`api/quizzes/${data.quizId}/more`);
  return result.json();
};

export const updateQuizVisibility = async (data: { id: string; isPublic: boolean }): Promise<void> => {
  const result = await apiAuth.patch(`api/quizzes/${data.id}/public?value=${data.isPublic}`);
  return result.json();
};
