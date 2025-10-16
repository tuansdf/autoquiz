import { type Context, type ErrorHandler, type MiddlewareHandler, type NotFoundHandler } from "hono";
import { v4 } from "uuid";
import { jwtService } from "./modules/auth/jwt.service";
import { exceptionUtils } from "./utils/exception.util";
import { logger } from "./utils/logger";
import { runWithContext } from "./utils/request-context";

class Middleware {
  private async getJwtPayload(c: Context) {
    const authHeader = c.req.header("Authorization");
    if (!authHeader || !authHeader.startsWith("Bearer ")) return undefined;
    const bearerToken = authHeader.substring(7);
    if (!bearerToken) return undefined;
    const payload = await jwtService.verifyAccessJwt(bearerToken);
    if (!payload) return undefined;
    return payload;
  }

  public jwt(): MiddlewareHandler {
    return async (c, next) => {
      c.set("authPayload", await this.getJwtPayload(c));
      await next();
    };
  }

  public context(): MiddlewareHandler {
    return async (c, next) => {
      runWithContext(
        {
          requestId: c.var.requestId,
          userId: c.var.authPayload?.sub,
        },
        next,
      );
    };
  }

  public logger(): MiddlewareHandler {
    return async (c, next) => {
      const start = performance.now();
      const requestId = v4();
      c.set("requestId", requestId);
      const path = c.req.path;
      const method = c.req.method;
      logger.info({
        requestId,
        event: "ENTER",
        method,
        path,
      });
      await next();
      logger.info({
        requestId,
        userId: c.var.authPayload?.sub,
        event: "EXIT",
        method,
        path,
        elapsedMs: performance.now() - start,
        status: c.res.status,
      });
    };
  }

  public notFound(): NotFoundHandler {
    return () => {
      return Response.json({ message: "Not Found" }, { status: 404 });
    };
  }

  public errorHandler(): ErrorHandler {
    return (err, c) => {
      const requestId = c.var.requestId;
      logger.error({ requestId, err });
      const response = exceptionUtils.toResponse(err);
      return Response.json({ message: response.message }, { status: response.status! });
    };
  }
}

export const middleware = new Middleware();
