import dayjs from "dayjs";
import { CustomException } from "../../custom-exception";
import { remoteConfigs } from "../config/remote-configs";
import { userRepository } from "../user/user.repository";
import type { LoginResponse, RefreshTokenRequest } from "./auth.type";
import { jwtService } from "./jwt.service";

class AuthService {
  public async loginByUsername(username: string): Promise<string> {
    if (!username) {
      throw new CustomException("Invalid credentials", 401);
    }
    let user = await userRepository.findTopByUsername(username);
    if (user && !user.isEnabled) {
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
    return await jwtService.createOauth2Jwt(user);
  }

  public async invalidate(userId: string): Promise<void> {
    if (!userId) return;
    await userRepository.resetTokenValidity(userId);
  }

  public async refreshToken(request: RefreshTokenRequest): Promise<LoginResponse> {
    const jwtPayload = await jwtService.verifyRefreshJwt(request.token);
    if (!jwtPayload || !jwtPayload.iat) {
      throw new CustomException("Invalid credentials", 401);
    }
    let user = await userRepository.findTopById(jwtPayload.sub || "");
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.tokenValidFrom && jwtPayload.iat < dayjs(user.tokenValidFrom).unix()) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (!user.isEnabled) {
      throw new CustomException("Your account is locked", 400);
    }
    return {
      accessToken: await jwtService.createAccessJwt(user),
    };
  }

  public async exchangeOauth2Token(request: RefreshTokenRequest): Promise<LoginResponse> {
    const jwtPayload = await jwtService.verifyOauth2Jwt(request.token);
    if (!jwtPayload || !jwtPayload.iat) {
      throw new CustomException("Invalid credentials", 401);
    }
    let user = await userRepository.findTopById(jwtPayload.sub || "");
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.tokenValidFrom && jwtPayload.iat < dayjs(user.tokenValidFrom).unix()) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (!user.isEnabled) {
      throw new CustomException("Your account is locked", 400);
    }
    return {
      accessToken: await jwtService.createAccessJwt(user),
      refreshToken: await jwtService.createRefreshJwt(user),
    };
  }
}

export const authService = new AuthService();
