class CommonUtils {
  public sha1(input: string): string {
    return Bun.CryptoHasher.hash("sha1", input, "base64url");
  }
}

export const commonUtils = new CommonUtils();
