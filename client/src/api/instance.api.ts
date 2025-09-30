import { ENV_SERVER_BASE_URL } from "@/env.js";
import { getValidAccessToken, handleLogout } from "@/utils/auth.util.js";
import ky from "ky";

export const apiPublic = ky.create({
  prefixUrl: ENV_SERVER_BASE_URL || "/",
});

export const apiAuth = apiPublic.extend({
  hooks: {
    beforeRequest: [
      async (request) => {
        try {
          const accessToken = await getValidAccessToken();
          if (!accessToken) {
            handleLogout();
            return;
          }
          request.headers.set("Authorization", "Bearer " + accessToken);
          return request;
        } catch (e) {
          handleLogout();
        }
      },
    ],
  },
});
