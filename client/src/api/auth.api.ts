import { apiPublic } from "@/api/instance.api.js";
import type { LoginResponse } from "@/type/auth.type.js";

export const refreshToken = async (data: { token: string }): Promise<LoginResponse> => {
  const result = await apiPublic.post("api/auth/token/refresh", {
    json: data,
  });
  return result.json();
};

export const exchangeToken = async (data: { token: string }): Promise<LoginResponse> => {
  const result = await apiPublic.post("api/oauth/exchange", {
    json: data,
  });
  return result.json();
};
