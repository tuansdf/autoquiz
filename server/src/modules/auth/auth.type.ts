import type { MakeNullish } from "../../types";

export type LoginRequest = {
  email: string;
  password: string;
};

export type RegisterRequest = {
  email: string;
  password: string;
};

export type LoginResponse = MakeNullish<{
  accessToken: string;
  refreshToken: string;
}>;

export type RefreshTokenRequest = {
  token: string;
};

export type ResetPasswordRequest = {
  email: string;
};

export type ResetPasswordResponse = MakeNullish<{
  password: string;
}>;

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};

export type VerifyAccountRequest = {
  email: string;
  code: string;
};
