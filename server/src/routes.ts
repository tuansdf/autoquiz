import { Hono } from "hono";
import { authRouter } from "./modules/auth/auth.router";
import { configRouter } from "./modules/config/config.router";

export const routes = new Hono();

routes.get("/health", () => {
  return new Response("OK");
});
routes.route("/auth", authRouter);
routes.route("/configs", configRouter);
