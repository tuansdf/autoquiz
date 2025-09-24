import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { Env } from "../../env";
import { logger } from "../../utils/logger";
import { authService } from "./auth.service";
import { authValidator } from "./auth.validator";

export const oauthRouter = new Hono();

oauthRouter.get(
  "/google",
  googleAuth({
    client_id: Env.GOOGLE_CLIENT_ID,
    client_secret: Env.GOOGLE_CLIENT_SECRET,
    redirect_uri: Env.GOOGLE_REDIRECT_URI,
    prompt: "select_account",
    access_type: "online",
    scope: ["email"],
  }),
  async (c) => {
    try {
      const user = c.get("user-google");
      const code = await authService.loginByUsername(user?.email || "");
      return c.redirect(Env.CLIENT_OAUTH_CALLBACK_URL.replace("{code}", code));
    } catch (e) {
      logger.error({ requestId: c.var.requestId, error: e });
      return c.redirect(Env.CLIENT_OAUTH_CALLBACK_URL.replace("{code}", ""));
    }
  },
);

oauthRouter.post("/exchange", async (c) => {
  const request = authValidator.validateRefreshToken(await c.req.json());
  return Response.json({ data: await authService.refreshToken(request) });
});
