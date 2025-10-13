import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().optional(),
  DB_URL: z.string().min(1),
  JWT_ACCESS_SECRET: z.string().min(1),
  JWT_REFRESH_SECRET: z.string().min(1),
  JWT_OAUTH2_SECRET: z.string().min(1),
  JWT_ACCESS_LIFETIME: z.coerce.number().min(1),
  JWT_REFRESH_LIFETIME: z.coerce.number().min(1),
  GEMINI_API_KEY: z.coerce.string().min(1),
  GOOGLE_CLIENT_ID: z.string().min(1),
  GOOGLE_CLIENT_SECRET: z.string().min(1),
  GOOGLE_REDIRECT_URI: z.url().min(1),
  SERVER_ENV: z.string().optional(),
  CLIENT_ORIGIN: z.string().min(1),
  CLIENT_OAUTH_CALLBACK_URL: z.string().min(1),
});

const parsed = schema.safeParse(process.env);

if (!parsed.success) {
  console.error("ENV ERRORS:");
  parsed.error.issues.forEach((error) => {
    console.error(` - ${error.path.join(", ")}: ${error.message}`);
  });
  process.exit(1);
}

export const Env = parsed.data;
