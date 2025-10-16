import { Hono } from "hono";
import { authRouter } from "./modules/auth/auth.router";
import { configRouter } from "./modules/config/config.router";
import { quizRouter } from "./modules/quiz/quiz.router";

export const routes = new Hono();

routes.get("/health", async (c) => {
  return c.text("OK");
});
routes.route("/auth", authRouter);
routes.route("/configs", configRouter);
routes.route("/quizzes", quizRouter);
