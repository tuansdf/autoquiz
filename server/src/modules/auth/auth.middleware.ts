import type { MiddlewareHandler } from "hono";
import { CustomException } from "../../custom-exception";
import { jwtService } from "./jwt.service";

export const authenticate = (): MiddlewareHandler => async (c, next) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    throw new CustomException("Invalid credentials", 401);
  }

  const bearerToken = authHeader.substring(7);
  if (!bearerToken) {
    throw new CustomException("Invalid credentials", 401);
  }

  const payload = await jwtService.verifyAccessJwt(bearerToken);
  if (!payload) {
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
