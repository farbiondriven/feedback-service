# syntax=docker/dockerfile:1
######################################
# 1) BUILD stage
######################################
FROM node:20-slim AS build
WORKDIR /app

# 1.1 Copy service manifest & tsconfig
COPY apps/service/package.json     apps/service/tsconfig.json ./

# 1.2 Install all deps (prod + dev)
RUN npm install

# 1.3 Generate Prisma client (schema lives at repo-root/prisma/)
COPY prisma/schema.prisma ./prisma/schema.prisma
RUN npx prisma generate --schema=./prisma/schema.prisma

# 1.4 Copy & build TypeScript
COPY apps/service/src ./src
RUN npm run build

# 1.5 Prune devDependencies for a lean runtime
RUN npm prune --production

######################################
# 2) RUNTIME stage
######################################
FROM gcr.io/distroless/nodejs20-debian12:nonroot
WORKDIR /app

# Copy only runtime bits
COPY --from=build /app/node_modules ./node_modules
COPY --from=build /app/dist         ./dist
COPY --from=build /app/prisma       ./prisma

EXPOSE 3000
ENV NODE_ENV=production
ENV PORT=3000

# Start the API (which will spawn worker threads from dist/worker.js)
CMD ["dist/server.js"]
