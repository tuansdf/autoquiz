import "dotenv/config";
import { Hono } from "hono";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";
import { secureHeaders } from "hono/secure-headers";
import { Env } from "./env";
import { middleware } from "./middleware";
import { routes } from "./routes";

const app = new Hono();

app.use(middleware.logger());
if (Env.SERVER_ENV === "development") {
  app.use(cors());
}
app.use(secureHeaders());

app.route("/api", routes);
app.use(
  "/*",
  serveStatic({
    root: "./static",
    precompressed: true,
    onFound: (path, c) => {
      if (path.endsWith(".html")) {
        c.header("Cache-Control", "no-cache");
      } else {
        c.header("Cache-Control", "public, max-age=31536000, immutable");
      }
    },
  }),
);
app.get(serveStatic({ path: "./static/index.html" }));

app.notFound(middleware.notFound());
app.onError(middleware.errorHandler());

const port = Env.PORT || 5000;
console.log(`Server is running on port ${port}`);

export default {
  port,
  fetch: app.fetch,
};
