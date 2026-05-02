FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./

RUN npm install
RUN npm install react react-dom
RUN npm install @studio-freight/react-lenis framer-motion
RUN npm install -D @types/react @types/react-dom
RUN npm install i18next react-i18next i18next-browser-languagedetector
RUN npm install --save-dev fast-glob unified remark-parse remark-gfm remark-rehype rehype-stringify rehype-slug rehype-autolink-headings
RUN npm install --save-dev marked
RUN npm install --save-dev markdown-it markdown-it-anchor fast-glob
COPY . .

RUN npm run build:docs
RUN npm run build


FROM alpine:3.19
WORKDIR /out
COPY --from=build /app/dist /out
