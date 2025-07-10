# Main docker‑compose file
COMPOSE_FILE := ./docker-compose.yml
# Monitoring stack (optional)
MON_COMPOSE  := ./services/observability/docker-compose.monitoring.yml

# Reproducible dependencies — lock‑файл бекенда
LOCK := srcs/services/web/backend/package-lock.json

$(LOCK):
	@echo "🔧  Generating package-lock.json…"
	cd srcs/services/web/backend && npm install --package-lock-only --ignore-scripts

# Phony targets
.PHONY: all build up down restart loadtest clean fclean re

# Default target ─ start the stack (with build if images are stale)
all: up

# Build images only (useful in CI)
build: $(LOCK)
	@docker compose -f $(COMPOSE_FILE) build
#	@docker compose -f $(MON_COMPOSE) build

# Up stack, rebuilding images when Docker detects changes
up: $(LOCK)
	@docker compose -f $(COMPOSE_FILE) up --build -d
#	@docker compose -f $(MON_COMPOSE) up -d


down:
#	@docker compose -f $(MON_COMPOSE) down
	@docker compose -f $(COMPOSE_FILE) down

loadtest:
	@docker compose -f $(COMPOSE_FILE) run --rm k6

# Restart containers without rebuilding
restart:
	@docker compose -f $(COMPOSE_FILE) restart
#	@docker compose -f $(MON_COMPOSE) restart

# Clean dangling images / networks after shutting down
clean: down
	@docker system prune -a -f
	@docker image prune  -a -f
	@docker network prune -f

# Full clean (incl. custom volumes / host dirs)
fclean: clean
	# @docker volume rm mariadb wordpress
	# @rm -rf /home/$(USER)/data/mariadb/*
	# @rm -rf /home/$(USER)/data/wordpress/*

# Rebuild everything from scratch
re: fclean all
