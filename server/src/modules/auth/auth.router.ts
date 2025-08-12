import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { Env } from "../../env";
import { exceptionUtils } from "../../utils/exception.util";
import { logger } from "../../utils/logger";
import { authenticate } from "./auth.middleware";
import { authService } from "./auth.service";
import { authValidator } from "./auth.validator";

export const authRouter = new Hono();

authRouter.use(
  "/google",
  googleAuth({
    client_id: Env.GOOGLE_CLIENT_ID,
    client_secret: Env.GOOGLE_CLIENT_SECRET,
    redirect_uri: Env.GOOGLE_REDIRECT_URI,
    prompt: "select_account",
    access_type: "online",
    scope: ["email"],
  }),
);

authRouter.get("/google", async (c) => {
  const requestId = c.var.requestId;
  try {
    const user = c.get("user-google");
    const loginResponse = await authService.loginByUsername(user?.email || "");

    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Success</title>
      </head>
      <body>
        <script>
          window.opener?.postMessage(${JSON.stringify({ data: loginResponse })}, '${Env.CLIENT_BASE_URL}');
        </script>
        <p>Authenticated successfully. This window can be closed.</p>
      </body>
      </html>
  `);
  } catch (e) {
    logger.error({ requestId, error: e });
    const response = exceptionUtils.toResponse(e);
    return c.html(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Authentication Failed</title>
      </head>
      <body>
        <script>
          window.opener?.postMessage(${JSON.stringify({ message: response.message })}, '${Env.CLIENT_BASE_URL}');
        </script>
        <p>Authentication failed. This window can be closed.</p>
      </body>
      </html>
  `);
  }
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
  return Response.json({
    message: "OK",
  });
});
