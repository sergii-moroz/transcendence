###########################################################
# Stage 1 — build                                          #
###########################################################
FROM node:23-alpine AS builder

# Базовые утилиты для сборки нативных зависимостей
RUN apk add --no-cache python3 make g++ openssl

# Рабочая директория всего проекта
WORKDIR /app

# 1. Копируем только манифесты — это самый кэшируемый слой
COPY backend/package*.json ./backend/

# 2. Ставим зависимости
WORKDIR /app/backend
RUN npm ci

# 3. Копируем остальной код
COPY backend/ .

# 4. Сборка TypeScript → JavaScript
RUN npm run build

RUN mkdir -p /app/backend/dist/ssl
RUN openssl req \
	-x509 \
	-nodes \
	-days 365 \
	-newkey rsa:4096 \
	-out /app/backend/dist/ssl/server.crt \
	-keyout /app/backend/dist/ssl/server.key \
	-subj "/C=DE/ST=IDF/L=Heilbronn/O=42/OU=42/CN=smoroz.42.fr/UID=smoroz"


###########################################################
# Stage 2 — production                                     #
###########################################################
FROM node:23-alpine

# Рабочая директория рантайма
WORKDIR /app/backend

# 1. Копируем package-манифесты, ставим ТОЛЬКО prod-зависимости
COPY backend/package*.json ./
RUN npm ci --omit=dev

# 2. Подтягиваем собранный JS из первого этапа
COPY --from=builder /app/backend/dist ./dist

# 3. (опц.) передаём переменные окружения и другие нужные файлы
COPY backend/.env .

# Сервис слушает порт 4242
EXPOSE 443

# Health-check для оркестраторов
HEALTHCHECK --interval=30s --timeout=3s \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4242/health || exit 1

# Запуск приложения
CMD ["node", "dist/index.js"]
