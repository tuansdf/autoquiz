import type { MiddlewareHandler } from "hono";
import { CustomException } from "../../custom-exception";
import { jwt } from "../../utils/jwt";
import { JWT_TYPE_ACCESS } from "./auth.constant";

export const authenticate = (): MiddlewareHandler => async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomException("Invalid credentials", 401);
  }

  const bearerToken = authHeader.substring(7);
  if (!bearerToken) {
    throw new CustomException("Invalid credentials", 401);
  }

  const payload = await jwt.verify(bearerToken);
  if (!payload) {
    throw new CustomException("Invalid credentials", 401);
  }

  if (JWT_TYPE_ACCESS !== payload.typ) {
    throw new CustomException("Invalid credentials", 401);
  }

  c.set("authPayload", payload);

  await next();
};

export const authorize = (): MiddlewareHandler => async (c, next) => {
  const authPayload = c.var.authPayload;

  if (!authPayload || !authPayload.admin) {
    throw new CustomException("Not Found", 404);
  }

  await next();
};
