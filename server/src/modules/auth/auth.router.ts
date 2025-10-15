import { Hono } from "hono";
import { authenticate } from "./auth.middleware";
import { authSchemas } from "./auth.schema";
import { authService } from "./auth.service";
import { oauth2Router } from "./oauth2.router";

export const authRouter = new Hono();

authRouter.route("/oauth2", oauth2Router);

authRouter.post("/token/refresh", async (c) => {
  const request = authSchemas.refreshToken.parse(await c.req.json());
  return Response.json({ data: await authService.refreshToken(request) });
});

authRouter.get("/token/validate", authenticate(), async () => {
  return Response.json({ message: "OK" });
});

authRouter.post("/token/invalidate", authenticate(), async (c) => {
  const userId = c.var.authPayload?.sub || "";
  await authService.invalidate(userId);
  return Response.json({
    message: "OK",
  });
});
