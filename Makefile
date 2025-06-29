#───────────────────────────────────────────────────────────────────────────────
#  Makefile – feedback-service
#───────────────────────────────────────────────────────────────────────────────

API_DIR     := apps/service
PRISMA      := npx prisma

.PHONY: install build dev dev-api dev-worker lint lint-fix format clean \
        db-generate db-migrate db-migrate-deploy docker-build docker-up docker-down

## 📦  Install all workspaces and generate Prisma client
install:
	@echo "📦  Installing root + workspaces …"
	npm install

## 🔨  Compile TypeScript in every workspace
build: install
	@echo "🔨  Building all packages …"
	npm run --workspaces build

## 🚀  Start API (watch) – open another terminal for the worker
dev: install
	npm --workspace $(API_DIR) run dev

## 🚀  Start only the API (watch)
dev-api: install
	npm --workspace $(API_DIR) run dev


##  Lint every workspace
lint: install
	npm run --workspaces lint

##  Lint & auto-fix with ESLint + Prettier
lint-fix:
	@echo "🛠  Running ESLint+Prettier in fix mode…"
	npm run lint:fix

##  Format code with Prettier
format:
	@echo "🧹  Formatting code with Prettier…"
	npm run format

##  Remove node_modules & build artefacts
clean:
	rm -rf node_modules */node_modules $(API_DIR)/dist 

docker-build:
	docker compose build

docker-up: docker-build
	docker compose up

docker-down:
	docker compose down
