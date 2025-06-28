###############  build stage  ###############
FROM node:20-slim AS builder

# 1. Work in /usr/src/app (any path is fine, just be consistent)
WORKDIR /usr/src/app

# 2. Copy ONLY what is needed to resolve & install deps
COPY package.json package-lock.json ./
COPY apps/frontend/package.json apps/frontend/

# 3. Install ALL workspaces in one shot, fully locked
RUN npm ci --workspaces --include-workspace-root

# 4. Copy the rest of the repo (source files, config, etc.)
COPY . .

# 5. Build just the frontend workspace
RUN npm run --workspace=apps/frontend build

###############  runtime stage  #############
FROM nginx:alpine

# 6. Copy the compiled static files into Nginx
COPY --from=builder /usr/src/app/apps/frontend/dist /usr/share/nginx/html

# 7. (Optional) expose and tweak Nginx
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
