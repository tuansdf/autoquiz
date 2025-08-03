import { refreshToken } from "@/api/auth.api.js";
import { decodeAccessToken, getAccessToken, getRefreshToken, handleLoginSuccess } from "@/utils/auth.util.js";
import dayjs from "dayjs";
import ky from "ky";

const EXPIRED_SECONDS_OFFSET = 10;

const redirectToAuth = () => {
  window.location.href = "/auth";
};

export const apiPublic = ky.create({
  prefixUrl: import.meta.env.VITE_SERVER_BASE_URL,
});

export const apiAuth = apiPublic.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        try {
          const accessToken = decodeAccessToken();
          if (!accessToken) {
            redirectToAuth();
            return;
          }
          const expired = dayjs().unix() > (accessToken?.exp || 0) - EXPIRED_SECONDS_OFFSET;
          if (!expired) {
            request.headers.set("Authorization", "Bearer " + getAccessToken());
            return request;
          }
          const refreshJwt = getRefreshToken();
          if (!refreshJwt) {
            redirectToAuth();
            return;
          }
          const result = await refreshToken({ token: refreshJwt });
          handleLoginSuccess(result);
          request.headers.set("Authorization", "Bearer " + result.data?.accessToken);
          return request;
        } catch (e) {
          redirectToAuth();
        }
      },
    ],
  },
});
