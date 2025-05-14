# FROM alpine:3.21.3
FROM node:23-alpine

# create app directory
WORKDIR /usr/src/app

RUN apk update && apk upgrade
RUN apk apk add --no-cache dumb-init python3 libc-dev make g++

# Install app dependencies
COPY package*.json ./
RUN npm Ci --only=dev

# Copy app source code

COPY . .

EXPOSE 3000
ENTRYPOINT [ "dumb-init" ]
CMD [ "node", "server-all-addresses.js" ]
