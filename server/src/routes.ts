import { Hono } from "hono";
import { authenticate } from "./modules/auth/auth.middleware";
import { authRouter } from "./modules/auth/auth.router";
import { oauthRouter } from "./modules/auth/oauth.router";
import { configRouter } from "./modules/config/config.router";
import { quizRouter } from "./modules/quiz/quiz.router.js";

export const routes = new Hono();

routes.get("/health", authenticate(), async (c) => {
  await new Promise((resolve) => setTimeout(resolve, 1000));
  return c.text("OK");
});
routes.route("/auth", oauthRouter);
routes.route("/auth", authRouter);
routes.route("/configs", configRouter);
routes.route("/quizzes", quizRouter);
