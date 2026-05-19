FROM node:20-alpine
WORKDIR /app
COPY package.json pnpm-lock.yaml ./
RUN corepack enable && pnpm i --frozen-lockfile
COPY . .
RUN pnpm build
CMD ["pnpm", "dev"]

