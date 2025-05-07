# COMPOSE_FILE		=	./srcs/docker-compose.yml

# all:	up

# up:
# 	@docker compose -f $(COMPOSE_FILE) up --build -d

# down:
# 	@docker compose -f $(COMPOSE_FILE) down

# clean:
# 	# @docker compose -f $(COMPOSE_FILE) down
# 	# @docker system prune -a -f
# 	# @docker image prune -a -f
# 	# @docker network prune -f

# fclean: clean
# 	# @docker volume rm mariadb wordpress
# 	# @rm -rf /home/$(USER)/data/mariadb/*
# 	# @rm -rf /home/$(USER)/data/wordpress/*

# re: fclean all

# PHONY: all up down clean fclean

SRC = ./src
DIST = ./dist

SERVER_MAIN = server.js

all:	compile
	node $(DIST)/$(SERVER_MAIN)

compile:
	npm run build

fclean:
	rm -rf $(DIST)

.PHONY: all compile fclean
