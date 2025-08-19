import { Hono } from "hono";
import { authenticate } from "./auth.middleware";
import { authService } from "./auth.service";
import { authValidator } from "./auth.validator";

export const authRouter = new Hono();

authRouter.post("/token/refresh", async (c) => {
  const request = authValidator.validateRefreshToken(await c.req.json());
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
