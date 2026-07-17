FROM node:20-slim AS deps
WORKDIR /app
COPY package.json package-lock.json ./
COPY packages/flashcards-client/package.json ./packages/flashcards-client/
COPY packages/flashcards-server/package.json ./packages/flashcards-server/
RUN npm ci

FROM deps AS build
COPY index.html vite.config.ts tsconfig.json tailwind.config.ts postcss.config.js drizzle.config.ts ./
COPY src ./src
COPY server ./server
COPY drizzle ./drizzle
COPY packages ./packages
RUN npm run build

FROM node:20-slim AS production
WORKDIR /app
ENV NODE_ENV=production

COPY package.json package-lock.json ./
RUN npm ci --omit=dev

COPY --from=build /app/dist ./dist
COPY server ./server
COPY drizzle ./drizzle
COPY docker/entrypoint.sh ./docker/entrypoint.sh
RUN chmod +x docker/entrypoint.sh

EXPOSE 3102
ENTRYPOINT ["./docker/entrypoint.sh"]
