import "dotenv/config";
import { Hono } from "hono";
import { contextStorage } from "hono/context-storage";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Env } from "./env";
import { middleware } from "./middleware";
import { routes } from "./routes";

const app = new Hono();

app.use(contextStorage());
app.use(middleware.logger());
app.use(middleware.jwt());
app.use(cors({ origin: Env.CLIENT_ORIGIN }));
app.use(secureHeaders());

app.route("/api", routes);

app.notFound(middleware.notFound());
app.onError(middleware.errorHandler());

const port = Env.PORT || 5000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
