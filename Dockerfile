FROM node:20-alpine AS build
WORKDIR /app

# Копируем package.json из папки app/ в /app/
COPY app/package*.json ./
RUN npm install

# Копируем остальные исходники из app/
COPY app/ .

RUN npm install
RUN npm install react react-dom
RUN npm install @studio-freight/react-lenis framer-motion
RUN npm install -D @types/react @types/react-dom
RUN npm install i18next react-i18next i18next-browser-languagedetector
RUN npm install --save-dev fast-glob unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-autolink-headings
RUN npm install --save-dev marked
RUN npm install --save-dev markdown-it markdown-it-anchor fast-glob
RUN npm run build

FROM alpine:3.19
WORKDIR /out
COPY deploy-files.conf .
COPY --from=build /app/dist /tmp/full-dist

RUN rm -rf /out/* \
    && while IFS= read -r line || [ -n "$line" ]; do \
         line=$(echo "$line" | sed 's/\r$//'); \
         [ -z "$line" ] && continue; \
         case "$line" in \#*) continue ;; esac; \
         if [ -e "/tmp/full-dist/$line" ]; then \
           cp -av "/tmp/full-dist/$line" /out/; \
         else \
           echo "WARNING: '$line' not found"; \
         fi \
       done < deploy-files.conf \
    && rm -rf /tmp/full-dist \
