import type { MakeNullish } from "../../types";

export type LoginRequest = {
  username: string;
  password: string;
};

export type RegisterRequest = {
  username: string;
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
  username: string;
};

export type ResetPasswordResponse = MakeNullish<{
  password: string;
}>;

export type ChangePasswordRequest = {
  oldPassword: string;
  newPassword: string;
};
