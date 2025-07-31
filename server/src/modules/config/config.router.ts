import { Hono } from "hono";
import { authenticate, authorize } from "../auth/auth.middleware";
import { configService } from "./config.service";

export const configRouter = new Hono();

configRouter.get("/", authenticate(), authorize(), async () => {
  return Response.json({ data: await configService.findAll() });
});

configRouter.post("/", authenticate(), authorize(), async (c) => {
  const request = await c.req.json();
  return Response.json({ data: await configService.create(request) });
});

configRouter.patch("/", authenticate(), authorize(), async (c) => {
  const request = await c.req.json();
  return Response.json({ data: await configService.update(request) });
});
