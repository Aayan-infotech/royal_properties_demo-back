FROM node:22.16.0-bullseye AS builder
WORKDIR /usr/src/app
COPY package.json package-lock.json* ./
RUN npm ci
COPY . .
RUN npm run build
FROM node:22.16.0-bullseye-slim AS runner
WORKDIR /usr/src/app
ENV NODE_ENV=production
ENV PORT=7878
COPY package.json package-lock.json* ./
RUN npm ci --omit=dev
COPY --from=builder /usr/src/app/dist ./dist
EXPOSE 7878
CMD ["node", "dist/main"]
