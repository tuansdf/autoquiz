import type { CommonResponse } from "@/type/common.type.js";

export type LoginResponse = CommonResponse<{
  accessToken?: string;
  refreshToken?: string;
}>;

export type User = {
  userId?: string;
  username?: string;
  isAdmin?: boolean;
};
