class Base64Utils {
  public encode = (input: string): string => {
    return Buffer.from(input).toString("base64url");
  };
  public decode = (input: string): string => {
    return Buffer.from(input, "base64url").toString();
  };
}

export const base64 = new Base64Utils();
