FROM node:20-alpine AS build

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .
RUN npm run build

FROM alpine:3.19

WORKDIR /out
COPY --from=build /app/dist /out
