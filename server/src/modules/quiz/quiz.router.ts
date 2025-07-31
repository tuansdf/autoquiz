import { Hono } from "hono";
import { authenticate } from "../auth/auth.middleware";
import { quizService } from "./quiz.service";

export const quizRouter = new Hono();

quizRouter.get("/:id", authenticate(), async (c) => {
  const id = c.req.param("id");
  const userId = c.var.authPayload?.sub || "";
  return Response.json({ data: await quizService.findOneById(id, userId) });
});

quizRouter.get("/", authenticate(), async (c) => {
  const userId = c.var.authPayload?.sub || "";
  return Response.json({ data: await quizService.findAllByUserId(userId) });
});
