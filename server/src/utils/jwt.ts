import { decodeJwt, type JWTPayload, jwtVerify, SignJWT } from "jose";

const signHeader = { alg: "HS256" };
const verifyOptions = { algorithms: ["HS256"] };

class JWTUtils {
  public async decode(toBeDecoded: string) {
    return decodeJwt(toBeDecoded);
  }
  public async sign(payload: JWTPayload, secret: Uint8Array): Promise<string> {
    return await new SignJWT(payload).setProtectedHeader(signHeader).sign(secret);
  }
  public async verify(toBeVerified: string, secret: Uint8Array): Promise<JWTPayload | null> {
    try {
      const verified = await jwtVerify(toBeVerified, secret, verifyOptions);
      return verified.payload;
    } catch (e) {
      return null;
    }
  }
}

export const jwt = new JWTUtils();
