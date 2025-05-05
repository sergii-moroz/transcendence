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