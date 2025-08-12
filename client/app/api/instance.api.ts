import { getValidAccessToken } from "@/utils/auth.util.js";
import ky from "ky";

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
          const accessToken = await getValidAccessToken();
          if (!accessToken) {
            redirectToAuth();
            return;
          }
          request.headers.set("Authorization", "Bearer " + accessToken);
          return request;
        } catch (e) {
          redirectToAuth();
        }
      },
    ],
  },
});
