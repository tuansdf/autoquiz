FROM node:22-alpine AS client-build
WORKDIR /app/client
RUN npm i -g pnpm
COPY client/package.json client/pnpm-lock.yaml ./
RUN --mount=type=cache,id=pnpm,target=/pnpm/store pnpm install --frozen-lockfile --store-dir=/pnpm/store
COPY client/ ./
RUN pnpm run build

FROM oven/bun:1-alpine AS server-build
WORKDIR /app/server
COPY server/package.json server/bun.lock ./
RUN --mount=type=cache,id=bun-cache,target=/root/.bun/install/cache bun install --frozen-lockfile
COPY server/ ./
RUN bun run build

FROM oven/bun:1-alpine
WORKDIR /app
COPY --from=server-build /app/server/dist /app
COPY --from=client-build /app/client/build/client /app/static
USER bun

EXPOSE 5000
CMD ["bun", "run", "/app/index.js"]
