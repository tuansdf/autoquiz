import type { MiddlewareHandler } from "hono";
import { CustomException } from "../../custom-exception";

export const authenticate = (): MiddlewareHandler => async (c, next) => {
  if (!c.var.authPayload) {
    throw new CustomException("Invalid credentials", 401);
  }

  await next();
};

export const authorize = (): MiddlewareHandler => async (c, next) => {
  const authPayload = c.var.authPayload;

  if (!authPayload || !authPayload.admin) {
    throw new CustomException("Not Found", 404);
  }

  await next();
};
