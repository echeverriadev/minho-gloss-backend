# syntax=docker/dockerfile:1

# ---- base: dependencias ----
FROM node:24-alpine AS base
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

# ---- dev: NestJS en modo watch ----
FROM base AS dev
COPY . .
EXPOSE 3000
CMD ["npm", "run", "start:dev"]

# ---- build: compila TypeScript ----
FROM base AS build
COPY . .
RUN npm run build && npm prune --omit=dev

# ---- prod: imagen liviana solo con lo necesario ----
FROM node:24-alpine AS prod
ENV NODE_ENV=production
WORKDIR /app
COPY --from=build /app/package.json ./
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist ./dist
USER node
EXPOSE 3000
CMD ["node", "dist/main"]
