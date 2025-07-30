import { HTTPException } from "hono/http-exception";

export class CustomException extends HTTPException {
  constructor(message?: string, status?: number) {
    const s = status || 400;
    const m = message || "Bad Request";
    // @ts-ignore
    super(s, { message: m });

    this.name = this.constructor.name;

    Error.captureStackTrace(this, this.constructor);
  }
}
