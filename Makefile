COMPOSE_FILE = ./srcs/docker-compose.yml

#MON_COMPOSE = ./srcs/services/observability/docker-compose.monitoring.yml

.PHONY: all up down clean fclean re

all: up

up:
	@docker compose -f $(COMPOSE_FILE) up --build -d
#	@docker compose -f $(MON_COMPOSE) up -d

down:
#	@docker compose -f $(MON_COMPOSE) down
	@docker compose -f $(COMPOSE_FILE) down


# monitoring:
loadtest:
	@docker compose -f $(COMPOSE_FILE) run --rm k6

# mon-down:
	

restart:
	@docker compose -f $(COMPOSE_FILE) restart
#	@docker compose -f $(MON_COMPOSE) restart


clean: down
	@docker system prune -a -f
	@docker image prune -a -f
	@docker network prune -f

fclean: clean
	# @docker volume rm mariadb wordpress
	# @rm -rf /home/$(USER)/data/mariadb/*
	# @rm -rf /home/$(USER)/data/wordpress/*

re: fclean all
