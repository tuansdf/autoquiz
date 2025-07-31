import { Hono } from "hono";
import { z } from "zod";
import { authenticate } from "../auth/auth.middleware";
import { quizService } from "./quiz.service";
import { quizValidator } from "./quiz.validator.js";

export const quizRouter = new Hono();

quizRouter.get("/:id", authenticate(), async (c) => {
  const id = z.uuid().parse(c.req.param("id"));
  const userId = c.var.authPayload?.sub || "";
  return Response.json({ data: await quizService.findOneById(id, userId) });
});

quizRouter.get("/", authenticate(), async (c) => {
  const userId = c.var.authPayload?.sub || "";
  return Response.json({ data: await quizService.findAllByUserId(userId) });
});

quizRouter.post("/", authenticate(), async (c) => {
  const userId = c.var.authPayload?.sub || "";
  const request = quizValidator.validateCreate(await c.req.json());
  return Response.json({ data: await quizService.create(request, userId) });
});
