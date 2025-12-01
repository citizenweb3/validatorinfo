# ==============================================
# Stage 1: Dependencies - устанавливаем все зависимости один раз
# ==============================================
FROM node:20 AS deps

WORKDIR /app

# Копируем только файлы зависимостей для лучшего кэширования
COPY package.json yarn.lock ./

# Устанавливаем зависимости с retry и увеличенным таймаутом
# --frozen-lockfile - не обновлять yarn.lock (детерминированная сборка)
# --network-timeout - увеличенный таймаут для проблемных сетей
RUN yarn install --frozen-lockfile --network-timeout 100000

# ==============================================
# Stage 2: Base - базовый образ с кодом и Prisma клиентами
# ==============================================
FROM node:20 AS base

# Устанавливаем redis-cli (нужен для всех сервисов)
RUN apt-get update && \
    apt-get install -y redis-tools && \
    rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Копируем node_modules из deps stage
COPY --from=deps /app/node_modules ./node_modules

# Копируем весь код проекта
COPY . .

# Генерируем Prisma клиенты (основной и events)
RUN npx prisma generate
RUN npx prisma generate --schema=prisma/events/schema.prisma

# ==============================================
# Stage 3: Builder - сборка Next.js приложения
# ==============================================
FROM base AS builder

WORKDIR /app

# Принимаем DATABASE_URL как build аргументы
# Нужны для сборки Next.js, т.к. API routes инициализируют Prisma
ARG DATABASE_URL
ARG EVENTS_DATABASE_URL

# Устанавливаем как environment переменные для build процесса
ENV DATABASE_URL=${DATABASE_URL}
ENV EVENTS_DATABASE_URL=${EVENTS_DATABASE_URL}

# Собираем Next.js приложение
RUN yarn build

# ==============================================
# Stage 4: Migrations - образ для миграций БД
# ==============================================
FROM base AS migrations

WORKDIR /app

# Создаём папку uploads
RUN mkdir -p /app/uploads

# Команда будет переопределена в docker-compose.yml
CMD ["echo", "Migrations service ready"]

# ==============================================
# Stage 5: Frontend - production образ для Next.js
# ==============================================
FROM base AS frontend

WORKDIR /app

# Копируем собранное приложение из builder stage
COPY --from=builder /app/.next ./.next

# Создаём папку uploads
RUN mkdir -p /app/uploads

# Указываем порт
EXPOSE 3000

# Запускаем production сервер
CMD ["yarn", "start"]

# ==============================================
# Stage 6: Indexer - образ для background jobs
# ==============================================
FROM base AS indexer

WORKDIR /app

# Создаём папку uploads
RUN mkdir -p /app/uploads

# Указываем порт
EXPOSE 3001

# Точка входа с flushall и запуском индексера
ENTRYPOINT ["sh", "-c", "redis-cli -h redis flushall && exec npx tsx server/indexer.ts"]
