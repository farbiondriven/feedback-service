#───────────────────────────────────────────────────────────────────────────────
#  Makefile – feedback-service
#───────────────────────────────────────────────────────────────────────────────

API_DIR     := apps/api
WORKER_DIR  := apps/worker
PRISMA      := npx prisma

.PHONY: install build dev dev-api dev-worker lint clean \
        db-generate db-migrate db-migrate-deploy docker-build docker-up docker-down

## 📦  Install all workspaces and generate Prisma client
install:
	@echo "📦  Installing root + workspaces …"
	npm install
	$(MAKE) db-generate

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

## 🛠   Start only the worker (watch)
dev-worker: install
	npm --workspace $(WORKER_DIR) run dev

## 🔍  Lint every workspace
lint: install
	npm run --workspaces lint

## 🗑   Remove node_modules & build artefacts
clean:
	rm -rf node_modules */node_modules $(API_DIR)/dist $(WORKER_DIR)/dist

#───────────────────────────────────────────────────────────────────────────────
#  🗄️  DATABASE (Prisma)
#───────────────────────────────────────────────────────────────────────────────

## Generate Prisma client (runs automatically in `make install`)
db-generate:
	$(PRISMA) generate

## Run development migration – NAME=<name>  e.g. `make db-migrate NAME=add_column`
db-migrate:
ifndef NAME
	$(error You must pass NAME=<migration_name>)
endif
	$(PRISMA) migrate dev --name "$(NAME)"

## Deploy migrations in production / CI
db-migrate-deploy:
	$(PRISMA) migrate deploy

#───────────────────────────────────────────────────────────────────────────────
#  🐳  Docker helpers
#───────────────────────────────────────────────────────────────────────────────

docker-build:
	docker compose build

docker-up: docker-build
	docker compose up

docker-down:
	docker compose down
