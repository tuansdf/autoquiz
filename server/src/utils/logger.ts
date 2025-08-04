import pino from "pino";

const destination = pino.destination({ sync: false });
export const logger = pino({}, destination);
