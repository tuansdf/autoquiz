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
  VerifyAccountRequest,
} from "./auth.type";

class AuthService {
  private async createLoginResponse(user: User) {
    const now = dayjs();
    const accessJwt = await jwt.sign({
      iat: now.unix(),
      nbf: now.unix(),
      exp: now.add(Env.JWT_ACCESS_LIFETIME, "second").unix(),
      sub: user.id,
      email: user.email,
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
    const user = await userRepository.findTopByEmail(request.email);
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.loginLockedUntil && dayjs().isBefore(dayjs(user.loginLockedUntil))) {
      await passwordEncoder.encode("");
      throw new CustomException("Invalid credentials", 401);
    }
    const isPasswordCorrect = await passwordEncoder.verify(request.password, user?.password || "");
    if (!isPasswordCorrect) {
      await userRepository.addFailedAttempts(user.id);
      throw new CustomException("Invalid credentials", 401);
    }
    if (!user.isEnabled) {
      throw new CustomException("Your account is locked", 401);
    }
    await userRepository.addSucceededAttempts(user.id);
    return this.createLoginResponse(user);
  }

  public async register(request: RegisterRequest): Promise<LoginResponse> {
    if (!(await remoteConfigs.isRegistrationEnabled())) {
      throw new CustomException("Registration is currently disabled.");
    }
    const allowedDomains = await remoteConfigs.getAllowedEmailDomains();
    const emailDomain = request.email.substring(request.email.indexOf("@") + 1);
    if (allowedDomains.length && !allowedDomains.includes(emailDomain)) {
      throw new CustomException(
        `Please enter an email address from one of the allowed domains: ${allowedDomains.join(", ")}`,
      );
    }
    const emailExists = await userRepository.existsByEmail(request.email);
    if (emailExists) {
      throw new CustomException("Email already exists");
    }
    const isFirstUser = !(await userRepository.existsAny());
    const hashedPassword = await passwordEncoder.encode(request.password);
    const user = await userRepository.insert({
      email: request.email,
      password: hashedPassword,
      isAdmin: isFirstUser,
      isEnabled: true,
      verificationCode: v4(),
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
    if (!user?.isEnabled) {
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
    let user = await userRepository.findTopByEmail(request.email);
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

  public async verifyAccount(request: VerifyAccountRequest) {
    let user = await userRepository.findTopByEmail(request.email);
    if (!user) {
      throw new CustomException("Invalid credentials", 401);
    }
    if (user.isEnabled) return;
    if (user.verificationCode !== request.code) {
      throw new CustomException("Invalid credentials", 401);
    }
    user.verificationCode = "";
    user.isEnabled = true;
    await userRepository.update(user);
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
