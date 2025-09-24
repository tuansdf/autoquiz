import dayjs from "dayjs";
import { CustomException } from "../../custom-exception";
import { Env } from "../../env";
import { jwt } from "../../utils/jwt";
import { remoteConfigs } from "../config/remote-configs";
import { userRepository } from "../user/user.repository";
import type { User } from "../user/user.type";
import { JWT_TYPE_ACCESS, JWT_TYPE_EXCHANGE, JWT_TYPE_REFRESH } from "./auth.constant";
import type { LoginResponse, RefreshTokenRequest } from "./auth.type";

class AuthService {
  private async createLoginResponse(user: User): Promise<LoginResponse> {
    const now = dayjs();
    const accessJwt = await jwt.sign({
      iat: now.unix(),
      nbf: now.unix(),
      exp: now.add(Env.JWT_ACCESS_LIFETIME, "second").unix(),
      sub: user.id,
      username: user.username,
      admin: user.isAdmin,
      typ: JWT_TYPE_ACCESS,
    });
    const refreshJwt = await jwt.sign({
      iat: now.unix(),
      nbf: now.unix(),
      exp: now.add(Env.JWT_REFRESH_LIFETIME, "second").unix(),
      sub: user.id,
      typ: JWT_TYPE_REFRESH,
    });
    return {
      accessToken: accessJwt,
      refreshToken: refreshJwt,
    };
  }

  public async loginByUsername(username: string): Promise<string> {
    if (!username) {
      throw new CustomException("Invalid credentials", 401);
    }
    let user = await userRepository.findTopByUsername(username);
    if (!user?.isEnabled) {
      throw new CustomException("Your account is locked", 400);
    }
    if (!user) {
      if (!(await remoteConfigs.isRegistrationEnabled())) {
        throw new CustomException("Registration is currently disabled.", 400);
      }
      const isFirstUser = !(await userRepository.existsAny());
      user = await userRepository.insert({
        username: username,
        isAdmin: isFirstUser,
        isEnabled: true,
        tokenValidFrom: new Date(),
      });
    }
    if (!user) {
      throw new CustomException("Something went wrong", 500);
    }
    const now = dayjs();
    return await jwt.sign({
      iat: now.unix(),
      nbf: now.unix(),
      exp: now.add(30, "second").unix(),
      sub: user.id,
      typ: JWT_TYPE_EXCHANGE,
    });
  }

  public async invalidate(userId: string): Promise<void> {
    if (!userId) return;
    await userRepository.resetTokenValidity(userId);
  }

  public async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    const jwtPayload = await jwt.verify(request.token);
    if (!jwtPayload) {
      throw new CustomException("Invalid credentials", 401);
    }
    let user = await userRepository.findTopById(jwtPayload.sub || "");
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (!jwtPayload.iat || (jwtPayload.typ !== JWT_TYPE_REFRESH && jwtPayload.typ !== JWT_TYPE_EXCHANGE)) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.tokenValidFrom && jwtPayload.iat < dayjs(user.tokenValidFrom).unix()) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (!user.isEnabled) {
      throw new CustomException("Your account is locked", 400);
    }
    const result = await this.createLoginResponse(user);
    if (jwtPayload.typ === JWT_TYPE_REFRESH) {
      delete result.refreshToken;
    }
    return result;
  }
}

export const authService = new AuthService();
