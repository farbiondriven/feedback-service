# ─── build stage ─────────────────────────────────────────────────────────────
FROM node:20-alpine AS build
WORKDIR /app

# 1) Install deps
COPY package.json package-lock.json ./
RUN npm ci --omit=dev

# 2) Copy your service + Prisma schema
COPY prisma          ./prisma
COPY apps/service/src ./src
COPY apps/service/tsconfig.json ./

# 3) Compile TS → JS
RUN npx tsc

# ─── runtime stage ───────────────────────────────────────────────────────────
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app

# Copy only runtime bits
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist        ./dist
COPY --from=build /app/prisma      ./prisma

ENV NODE_ENV=production
ENV PORT=3000

CMD ["dist/server.js"]
