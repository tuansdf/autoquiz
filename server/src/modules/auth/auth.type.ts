import type { MakeNullish } from "../../types";

export type LoginResponse = MakeNullish<{
  accessToken: string;
  refreshToken: string;
}>;

export type RefreshTokenRequest = {
  token: string;
};
