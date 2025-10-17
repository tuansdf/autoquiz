import { googleAuth } from "@hono/oauth-providers/google";
import { Hono } from "hono";
import { Env } from "../../env";
import { logger } from "../../utils/logger";
import { authSchemas } from "./auth.schema";
import { authService } from "./auth.service";

export const oauth2Router = new Hono();

oauth2Router.get(
  "/authorization/google",
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
    } catch (err) {
      logger.error({ err });
      return c.redirect(Env.CLIENT_OAUTH_CALLBACK_URL.replace("{code}", ""));
    }
  },
);

oauth2Router.post("/token/exchange", async (c) => {
  const request = authSchemas.refreshToken.parse(await c.req.json());
  return Response.json({ data: await authService.exchangeOauth2Token(request) });
});
