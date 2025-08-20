import "dotenv/config";
import { Hono } from "hono";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Env } from "./env";
import { middleware } from "./middleware";
import { routes } from "./routes";

const app = new Hono();

app.use(middleware.logger());

app.use(cors({ origin: Env.CLIENT_BASE_URL }));
app.use(secureHeaders({ crossOriginOpenerPolicy: "unsafe-none" }));

app.route("/api", routes);

app.notFound(middleware.notFound());
app.onError(middleware.errorHandler());

const port = Env.PORT || 5000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
