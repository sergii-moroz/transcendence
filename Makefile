COMPOSE_FILE = ./srcs/docker-compose.yml

MON_COMPOSE = ./srcs/services/observability/docker-compose.monitoring.yml

.PHONY: all up down clean fclean re

all: up

up:
	@docker compose -f $(COMPOSE_FILE) up --build -d

down:
	@docker compose -f $(COMPOSE_FILE) down

monitoring:
	@docker compose -f $(MON_COMPOSE) up -d
mon-down:
	@docker compose -f $(MON_COMPOSE) down

clean: down
	@docker system prune -a -f
	@docker image prune -a -f
	@docker network prune -f

fclean: clean
	# @docker volume rm mariadb wordpress
	# @rm -rf /home/$(USER)/data/mariadb/*
	# @rm -rf /home/$(USER)/data/wordpress/*

re: fclean all
