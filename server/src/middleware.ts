import type { ErrorHandler, MiddlewareHandler, NotFoundHandler } from "hono";
import { v4 } from "uuid";
import { exceptionUtils } from "./utils/exception.util";
import { logger } from "./utils/logger";

class Middleware {
  public logger(): MiddlewareHandler {
    return async (c, next) => {
      const start = performance.now();
      const requestId = v4();
      c.set("requestId", requestId);
      const path = c.req.path;
      const method = c.req.method;
      logger.info({ requestId, event: "ENTER", method, path });
      await next();
      logger.info({ requestId, event: "EXIT", method, path, elapsedMs: performance.now() - start });
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
      logger.error({ requestId, error: err });
      const response = exceptionUtils.toResponse(err);
      return Response.json({ message: response.message }, { status: response.status });
    };
  }
}

export const middleware = new Middleware();
