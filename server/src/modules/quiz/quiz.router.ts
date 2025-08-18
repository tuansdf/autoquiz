import { Hono } from "hono";
import { z } from "zod";
import { authenticate } from "../auth/auth.middleware";
import { quizService } from "./quiz.service";
import { quizValidator } from "./quiz.validator";

export const quizRouter = new Hono();

quizRouter.get("/:id", authenticate(), async (c) => {
  const id = z.uuid().parse(c.req.param("id"));
  const userId = c.var.authPayload?.sub || "";
  return Response.json({ data: await quizService.findOneById(id, userId) });
});

quizRouter.get("/public/:id", async (c) => {
  const id = z.uuid().parse(c.req.param("id"));
  return Response.json({ data: await quizService.findOnePublicById(id) });
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

quizRouter.post("/:id/more", authenticate(), async (c) => {
  const quizId = z.uuid().parse(c.req.param("id"));
  const userId = c.var.authPayload?.sub || "";
  await quizService.generateMore(quizId, userId);
  return Response.json({ message: "OK" });
});

quizRouter.patch("/:id/public", authenticate(), async (c) => {
  const id = z.uuid().parse(c.req.param("id"));
  const userId = c.var.authPayload?.sub || "";
  const isPublic = c.req.query("value") === "true";
  await quizService.updateIsPublic(id, userId, isPublic);
  return Response.json({ message: "OK" });
});
