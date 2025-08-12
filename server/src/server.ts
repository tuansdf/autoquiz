import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { v4 } from "uuid";
import { Env } from "./env";
import { routes } from "./routes";
import { exceptionUtils } from "./utils/exception.util";
import { logger } from "./utils/logger";

const app = new Hono();

app.use(
  cors({
    origin: Env.CLIENT_BASE_URL,
  }),
);
app.use(secureHeaders({ crossOriginOpenerPolicy: false }));
app.use(async (c, next) => {
  const requestId = v4();
  c.set("requestId", requestId);
  const path = c.req.path;
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
  const response = exceptionUtils.toResponse(err);
  return Response.json({ message: response.message }, { status: response.status });
});

const port = Env.PORT || 5000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
