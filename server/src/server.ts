import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { ZodError } from "zod";
import { CustomException } from "./custom-exception";
import { Env } from "./env";
import { routes } from "./routes";
import { logger } from "./utils/logger";

const app = new Hono();

app.use(cors());
app.use(secureHeaders());
app.use(async (c, next) => {
  const requestId = Math.random().toString(36).slice(2, 10);
  c.set("requestId", requestId);
  const url = new URL(c.req.url);
  const path = url.pathname + url.search;
  const method = c.req.method;
  const start = Date.now();
  logger.info({ requestId, event: "ENTER", method, path });
  await next();
  logger.info({ requestId, event: "EXIT", method, path, elapsedMs: Date.now() - start });
});

app.route("/api", routes);

app.notFound(() => {
  return Response.json({ message: "Not Found" }, { status: 404 });
});
app.onError((err, c) => {
  const requestId = c.var.requestId;
  logger.error({ requestId, error: err });
  let errorMessage = "Something Went Wrong";
  let status = 500;
  if (err instanceof CustomException) {
    status = err.status || 400;
    if (err.message) errorMessage = err.message;
  }
  if (err instanceof ZodError) {
    status = 400;
    errorMessage = err.issues
      .map((issue) => (issue.path?.[0] ? String(issue.path[0]) + ": " : "") + issue.message)
      .join("\n");
  }
  return Response.json({ message: errorMessage }, { status });
});

const port = Env.PORT || 5000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
