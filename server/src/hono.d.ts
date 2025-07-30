import type { JWTPayload } from "jose";

declare module "hono" {
  interface ContextVariableMap {
    requestId: string;
    authPayload?: JWTPayload;
  }
}
