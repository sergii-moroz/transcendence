COMPOSE_FILE		=	./srcs/docker-compose.yml

all:	up

up:
	@docker compose -f $(COMPOSE_FILE) up --build -d

down:
	@docker compose -f $(COMPOSE_FILE) down

clean:
	# @docker compose -f $(COMPOSE_FILE) down
	# @docker system prune -a -f
	# @docker image prune -a -f
	# @docker network prune -f

fclean: clean
	# @docker volume rm mariadb wordpress
	# @rm -rf /home/$(USER)/data/mariadb/*
	# @rm -rf /home/$(USER)/data/wordpress/*

re: fclean all

PHONY: all up down clean fclean
