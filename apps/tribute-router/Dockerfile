FROM node:24-alpine@sha256:ebfe2f90462722a7a4de65e91990e97fe0d401c70e0e762c5b53302f905ec1c1 AS node

FROM node AS base
RUN NODE_OPTIONS='--dns-result-order=ipv4first --no-network-family-autoselection' npm install -g pnpm@12.8.0
ENV pnpm_config_store_dir=/pnpm/store
WORKDIR /repo
COPY pnpm-lock.yaml pnpm-workspace.yaml ./
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store pnpm fetch
COPY package.json ./
COPY packages ./packages
COPY tooling ./tooling
COPY apps/tribute-router ./apps/tribute-router

FROM base AS build
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --ignore-scripts --filter @acme/tribute-router...
RUN pnpm --filter @acme/tribute-router build

FROM base AS prod-deps
# pnpm 12: `pnpm fetch` заполняет node_modules зависимостями всего монорепо — начинаем с чистого.
RUN rm -rf node_modules
RUN --mount=type=cache,id=pnpm-store,target=/pnpm/store \
    pnpm install --offline --frozen-lockfile --ignore-scripts --prod --filter @acme/tribute-router

FROM node
ENV NODE_ENV=production
EXPOSE 8000
WORKDIR /repo/apps/tribute-router
COPY --from=prod-deps /repo/node_modules /repo/node_modules
COPY --from=prod-deps /repo/apps/tribute-router/node_modules ./node_modules
COPY --from=build /repo/apps/tribute-router/package.json ./
COPY --from=build /repo/apps/tribute-router/dist ./dist
USER node
HEALTHCHECK --interval=10s --timeout=3s --start-period=10s --retries=3 \
    CMD wget -qO- http://127.0.0.1:8000/health || exit 1
CMD ["node", "dist/index.js"]
