import { Hono } from "hono";
import { authenticate, authorize } from "../auth/auth.middleware";
import { configService } from "./config.service";

export const configRouter = new Hono();

configRouter.use(authenticate());
configRouter.use(authorize());

configRouter.get("/", async () => {
  return Response.json({ data: await configService.findAll() });
});

configRouter.post("/", async (c) => {
  const request = await c.req.json();
  return Response.json({ data: await configService.create(request) });
});

configRouter.patch("/", async (c) => {
  const request = await c.req.json();
  return Response.json({ data: await configService.update(request) });
});
