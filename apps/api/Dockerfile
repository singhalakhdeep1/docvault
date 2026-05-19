FROM node:20-alpine AS deps
WORKDIR /app
RUN npm install -g pnpm@9
COPY pnpm-workspace.yaml package.json pnpm-lock.yaml* ./
COPY packages/database/package.json packages/database/
COPY packages/shared/package.json packages/shared/
COPY apps/api/package.json apps/api/
RUN pnpm install --frozen-lockfile

FROM node:20-alpine AS builder
WORKDIR /app
RUN npm install -g pnpm@9
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/packages/database/node_modules ./packages/database/node_modules
COPY --from=deps /app/apps/api/node_modules ./apps/api/node_modules
COPY . .
RUN pnpm --filter @docsvault/database db:generate
RUN pnpm --filter @docsvault/api build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
COPY --from=builder /app/apps/api/dist ./dist
COPY --from=builder /app/apps/api/node_modules ./node_modules
COPY --from=builder /app/packages/database/prisma ./prisma
EXPOSE 4000
CMD ["node", "dist/main.js"]
