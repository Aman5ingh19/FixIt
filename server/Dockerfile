# ── FixIt Server ──

# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npx prisma generate

# Stage 2: Production
FROM node:20-alpine
WORKDIR /app

RUN addgroup -g 1001 -S fixit && adduser -S fixit -u 1001

COPY --from=builder --chown=fixit:fixit /app/node_modules ./node_modules
COPY --from=builder --chown=fixit:fixit /app/prisma ./prisma
COPY --from=builder --chown=fixit:fixit /app/src ./src
COPY --from=builder --chown=fixit:fixit /app/package.json ./

USER fixit

EXPOSE 5000

HEALTHCHECK --interval=30s --timeout=10s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:5000/api/health || exit 1

CMD ["node", "src/server.js"]
