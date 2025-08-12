import { z } from "zod";
import type { RefreshTokenRequest } from "./auth.type";

const refreshTokenSchema = z.object({
  token: z.string().check(z.minLength(1), z.maxLength(512)),
});

class AuthValidator {
  public validateRefreshToken(request: any): RefreshTokenRequest {
    return refreshTokenSchema.parse(request);
  }
}

export const authValidator = new AuthValidator();
