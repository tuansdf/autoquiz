import { base64urlnopad } from "@scure/base";
import Pako from "pako";

const textEncoder = new TextEncoder();

class Base64Utils {
  public encode = (input: string, options?: { compression?: boolean }): string => {
    if (options?.compression) {
      return base64urlnopad.encode(Pako.deflate(input));
    }
    return base64urlnopad.encode(textEncoder.encode(input));
  };
  public decode = (input: string, options?: { decompression?: boolean }): string => {
    const decoded = base64urlnopad.decode(input);
    if (options?.decompression) {
      return Pako.inflate(decoded, { to: "string" });
    }
    return decoded.toString();
  };
}

export const base64 = new Base64Utils();
