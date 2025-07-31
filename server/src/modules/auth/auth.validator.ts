import { z } from "zod";
import type {
  ChangePasswordRequest,
  LoginRequest,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
} from "./auth.type";

const usernameSchema = z.string().check(z.minLength(3), z.maxLength(40), z.trim());
const passwordSchema = z.string().check(z.minLength(12), z.maxLength(40));

const loginSchema = z.object({
  username: usernameSchema,
  password: passwordSchema,
});

const refreshTokenSchema = z.object({
  token: z.string().check(z.minLength(1), z.maxLength(512)),
});

const resetPasswordSchema = z.object({
  username: usernameSchema,
});

const changePasswordSchema = z.object({
  oldPassword: passwordSchema,
  newPassword: passwordSchema,
});

class AuthValidator {
  public validateLogin(request: any): LoginRequest {
    return loginSchema.parse(request);
  }

  public validateRegister(request: any): RegisterRequest {
    return loginSchema.parse(request);
  }

  public validateRefreshToken(request: any): RefreshTokenRequest {
    return refreshTokenSchema.parse(request);
  }

  public validateResetPassword(request: any): ResetPasswordRequest {
    return resetPasswordSchema.parse(request);
  }

  public validateChangePassword(request: any): ChangePasswordRequest {
    return changePasswordSchema.parse(request);
  }
}

export const authValidator = new AuthValidator();
