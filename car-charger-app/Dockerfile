FROM node:lts-alpine AS builder

WORKDIR /app

COPY public ./public
COPY src ./src
COPY package*.json .

RUN npm install
RUN npm run build

FROM nginx:1.21.6-alpine

EXPOSE 20000

COPY nginx.conf /etc/nginx/nginx.conf
COPY --from=builder /app/build /data/www/car-charging-app
