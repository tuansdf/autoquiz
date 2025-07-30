import { Hono } from "hono";
import { authenticate, authorize } from "./auth.middleware";
import { authService } from "./auth.service";
import { authValidator } from "./auth.validator";

export const authRouter = new Hono();

authRouter.post("/login", async (c) => {
  const request = authValidator.validateLogin(await c.req.json());
  return Response.json({ data: await authService.login(request) });
});

authRouter.post("/register", async (c) => {
  const request = authValidator.validateRegister(await c.req.json());
  return Response.json({ data: await authService.register(request) });
});

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
  return Response.json(null);
});

authRouter.post("/password/reset", authenticate(), authorize(), async (c) => {
  const request = authValidator.validateResetPassword(await c.req.json());
  return Response.json({
    data: await authService.resetPassword(request),
  });
});

authRouter.post("/password/change", authenticate(), async (c) => {
  const userId = c.var.authPayload?.sub || "";
  const request = authValidator.validateChangePassword(await c.req.json());
  await authService.changePassword(request, userId);
  return Response.json({
    message: "OK",
  });
});
