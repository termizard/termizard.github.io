#!/bin/bash

# ============================================================
# extract-build.sh
# Достаёт собранные файлы из Docker-образа и копирует только
# те, что перечислены в deploy-files.conf, в папку dist/
# ============================================================

set -e  # останавливаться при любой ошибке

LIST_FILE="deploy-files.conf"
OUT_DIR="dist"
IMAGE_NAME="react-build-tmp"
DOCKERFILE="Dockerfile"


if ! docker image inspect "$IMAGE_NAME" &> /dev/null; then
  echo "Образ '$IMAGE_NAME' не найден. Пробую собрать из Dockerfile (target build)..."
  docker build --target build -t "$IMAGE_NAME" .
fi

CONTAINER_NAME="tmp-extract-$$"  # $$ — PID скрипта, чтобы имя было уникальным
echo "Создаю временный контейнер '$CONTAINER_NAME' из образа '$IMAGE_NAME'..."
docker create --name "$CONTAINER_NAME" "$IMAGE_NAME"

TMP_DIST=$(mktemp -d /tmp/react-dist.XXXXXX)
echo "Копирую содержимое /app/dist из контейнера во временную папку $TMP_DIST..."
docker cp "$CONTAINER_NAME:/app/dist/." "$TMP_DIST"

docker rm "$CONTAINER_NAME"

rm -rf "$OUT_DIR"
mkdir -p "$OUT_DIR"

if [ ! -f "$LIST_FILE" ]; then
  echo "ОШИБКА: файл '$LIST_FILE' не найден!"
  exit 1
fi

echo "Фильтрую файлы по списку '$LIST_FILE'..."
while IFS= read -r line || [ -n "$line" ]; do
  # Удаление \r на случай Windows-переводов строк
  line=$(echo "$line" | sed 's/\r$//')
  # Пропуск пустых строк и комментариев
  [ -z "$line" ] && continue
  case "$line" in \#*) continue ;; esac

  if [ -e "$TMP_DIST/$line" ]; then
    cp -r "$TMP_DIST/$line" "$OUT_DIR/"
    echo "  ✓ $line"
  else
    echo "  ⚠ WARNING: '$line' not found"
  fi
done < "$LIST_FILE"

rm -rf "$TMP_DIST"

echo "Готово. Файлы скопированы в '$OUT_DIR'"