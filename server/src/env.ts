import { z } from "zod";

const schema = z.object({
  PORT: z.coerce.number().min(1),
  DB_URL: z.string().min(1),
  JWT_SECRET: z.string().min(1),
  JWT_ACCESS_LIFETIME: z.coerce.number().min(1),
  JWT_REFRESH_LIFETIME: z.coerce.number().min(1),
  GEMINI_API_KEY: z.coerce.string().min(1),
  MAIL_HOST: z.coerce.string().min(1),
  MAIL_PORT: z.coerce.number().min(1),
  MAIL_USERNAME: z.coerce.string().min(1),
  MAIL_PASSWORD: z.coerce.string().min(1),
  MAIL_FROM: z.coerce.string().min(1),
  MAIL_FROM_NAME: z.coerce.string().min(1),
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
