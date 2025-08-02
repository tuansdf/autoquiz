import { apiPublic } from "@/api/instance.api.js";
import type { LoginRequest, LoginResponse } from "@/type/auth.type.js";

export const login = async (data: LoginRequest): Promise<LoginResponse> => {
  const result = await apiPublic.post("api/auth/login", {
    json: data,
  });
  return result.json();
};

export const register = async (data: LoginRequest): Promise<LoginResponse> => {
  const result = await apiPublic.post("api/auth/register", {
    json: data,
  });
  return result.json();
};

export const refreshToken = async (data: { token: string }): Promise<LoginResponse> => {
  const result = await apiPublic.post("api/auth/token/refresh", {
    json: data,
  });
  return result.json();
};
