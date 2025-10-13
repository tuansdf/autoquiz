import dayjs from "dayjs";
import type { JWTPayload } from "jose";
import { Env } from "../../env";
import { jwt } from "../../utils/jwt";
import type { User } from "../user/user.type";
import { JWT_TYPE_ACCESS, JWT_TYPE_OAUTH2, JWT_TYPE_REFRESH } from "./auth.constant";

const encoder = new TextEncoder();
const accessSecret = encoder.encode(Env.JWT_ACCESS_SECRET);
const refreshSecret = encoder.encode(Env.JWT_REFRESH_SECRET);
const oauth2Secret = encoder.encode(Env.JWT_OAUTH2_SECRET);

class JwtService {
  public async createAccessJwt(user: User): Promise<string> {
    const now = dayjs();
    return await jwt.sign(
      {
        iat: now.unix(),
        nbf: now.unix(),
        exp: now.add(Env.JWT_ACCESS_LIFETIME, "second").unix(),
        sub: user.id,
        username: user.username,
        admin: user.isAdmin,
        typ: JWT_TYPE_ACCESS,
      },
      accessSecret,
    );
  }

  public async createRefreshJwt(user: User): Promise<string> {
    const now = dayjs();
    return await jwt.sign(
      {
        iat: now.unix(),
        nbf: now.unix(),
        exp: now.add(Env.JWT_REFRESH_LIFETIME, "second").unix(),
        sub: user.id,
        typ: JWT_TYPE_REFRESH,
      },
      refreshSecret,
    );
  }

  public async createOauth2Jwt(user: User): Promise<string> {
    const now = dayjs();
    return await jwt.sign(
      {
        iat: now.unix(),
        nbf: now.unix(),
        exp: now.add(30, "second").unix(),
        sub: user.id,
        typ: JWT_TYPE_OAUTH2,
      },
      oauth2Secret,
    );
  }

  public async verifyAccessJwt(token: string): Promise<JWTPayload | null> {
    return jwt.verify(token, accessSecret);
  }

  public async verifyRefreshJwt(token: string): Promise<JWTPayload | null> {
    return jwt.verify(token, refreshSecret);
  }

  public async verifyOauth2Jwt(token: string): Promise<JWTPayload | null> {
    return jwt.verify(token, oauth2Secret);
  }
}

export const jwtService = new JwtService();
