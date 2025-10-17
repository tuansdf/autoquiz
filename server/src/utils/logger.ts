import { getContext } from "hono/context-storage";
import pino from "pino";

const destination = pino.destination({ sync: false });
export const logger = pino(
  {
    mixin: () => {
      const context = getContext();
      return {
        requestId: context.var.requestId,
      };
    },
  },
  destination,
);
