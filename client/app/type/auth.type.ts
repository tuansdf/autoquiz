import type { CommonResponse } from "@/type/common.type.js";

export type LoginRequest = {
  email: string;
  password: string;
};

export type LoginResponse = CommonResponse<{
  accessToken?: string;
  refreshToken?: string;
}>;

export type User = {
  userId?: string;
  email?: string;
  isAdmin?: boolean;
};
