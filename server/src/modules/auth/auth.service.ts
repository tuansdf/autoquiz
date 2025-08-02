import dayjs from "dayjs";
import { v4 } from "uuid";
import { CustomException } from "../../custom-exception";
import { Env } from "../../env";
import { jwt } from "../../utils/jwt";
import { passwordEncoder } from "../../utils/password-encoder";
import { remoteConfigs } from "../config/remote-configs.js";
import { userRepository } from "../user/user.repository";
import type { User } from "../user/user.type";
import { JWT_TYPE_ACCESS, JWT_TYPE_REFRESH } from "./auth.constant";
import type {
  ChangePasswordRequest,
  LoginRequest,
  LoginResponse,
  RefreshTokenRequest,
  RegisterRequest,
  ResetPasswordRequest,
  ResetPasswordResponse,
} from "./auth.type";

class AuthService {
  private async createLoginResponse(user: User) {
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

  public async login(request: LoginRequest): Promise<LoginResponse> {
    const user = await userRepository.findTopByUsername(request.username);
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    const isPasswordCorrect = await passwordEncoder.verify(request.password, user?.password || "");
    if (!isPasswordCorrect) {
      throw new CustomException("Invalid credentials", 401);
    }
    return this.createLoginResponse(user);
  }

  public async register(request: RegisterRequest): Promise<LoginResponse> {
    if (!(await remoteConfigs.isRegistrationEnabled())) {
      throw new CustomException("Registration is disabled");
    }
    const usernameExists = await userRepository.existsByUsername(request.username);
    if (usernameExists) {
      throw new CustomException("Username already exists");
    }
    const isFirstUser = !(await userRepository.existsAny());
    const hashedPassword = await passwordEncoder.encode(request.password);
    const user = await userRepository.insert({
      username: request.username,
      password: hashedPassword,
      isAdmin: isFirstUser,
      isEnabled: true,
      tokenValidFrom: new Date(),
    });
    return this.createLoginResponse(user!);
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
    if (!jwtPayload.iat) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.tokenValidFrom && jwtPayload.iat < dayjs(user.tokenValidFrom).unix()) {
      throw new CustomException("Invalid credentials", 401);
    }
    return this.createLoginResponse(user!);
  }

  public async resetPassword(request: ResetPasswordRequest): Promise<ResetPasswordResponse> {
    let user = await userRepository.findTopByUsername(request.username);
    if (!user) {
      throw new CustomException("User not found", 404);
    }
    const generatedPassword = v4();
    user.password = await passwordEncoder.encode(generatedPassword);
    await userRepository.update(user);
    return {
      password: generatedPassword,
    };
  }

  public async changePassword(request: ChangePasswordRequest, userId: string): Promise<void> {
    let user = await userRepository.findTopById(userId);
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    const isPasswordCorrect = await passwordEncoder.verify(request.oldPassword, user?.password || "");
    if (!isPasswordCorrect) {
      throw new CustomException("Invalid credentials", 401);
    }
    user.password = await passwordEncoder.encode(request.newPassword);
    await userRepository.update(user);
  }
}

export const authService = new AuthService();
