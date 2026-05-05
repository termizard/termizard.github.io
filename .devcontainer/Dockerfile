FROM node:20-alpine

# Утилиты для отслеживания файлов (пригодятся)
RUN apk add --no-cache git

WORKDIR /workspace

EXPOSE 3000

# Команда по умолчанию – держит контейнер живым,
# реальный dev-сервер запустится через postStartCommand
CMD ["sleep", "infinity"]
