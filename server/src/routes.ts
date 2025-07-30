import { Hono } from "hono";
import { authRouter } from "./modules/auth/auth.router";

export const routes = new Hono();

routes.get("/health", () => {
  return new Response("OK");
});
routes.route("/auth", authRouter);
