import { customAlphabet } from "nanoid";

const alphabet = "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const nanoid = customAlphabet(alphabet);

class CommonUtils {
  public sha1(input: string): string {
    return Bun.CryptoHasher.hash("sha1", input, "base64url");
  }

  public generateVerificationCode(): string {
    return nanoid(6);
  }
}

export const commonUtils = new CommonUtils();
