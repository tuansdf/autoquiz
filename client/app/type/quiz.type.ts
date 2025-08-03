import type { CommonResponse } from "@/type/common.type.js";

export type Quiz = {
  id?: string;
  title?: string;
  createdAt?: string;
  generated?: boolean;
};

export type QuizDetail = {
  id?: string;
  title?: string;
  questions?: Question[];
  isPublic?: boolean;
  createdAt?: string;
  updatedAt?: string;
};

export type Question = {
  id?: string;
  text?: string;
  answers?: { id?: string; text?: string; correct?: boolean; selected?: boolean }[];
  explanation?: string;
  selected?: string | string[];
};

export type GetQuizzesResponse = CommonResponse<Quiz[]>;
export type GetQuizResponse = CommonResponse<QuizDetail>;
