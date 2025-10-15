import { z } from "zod";
import type { MakeNullish } from "../../types";
import type { authSchemas } from "./auth.schema";

export type LoginResponse = MakeNullish<{
  accessToken: string;
  refreshToken: string;
}>;

export type RefreshTokenRequest = z.infer<typeof authSchemas.refreshToken>;
