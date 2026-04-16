FROM node:20-alpine AS api
WORKDIR /app
COPY server/package.json ./
RUN npm install --production
COPY server/ ./
CMD ["node", "index.js"]

FROM node:20-alpine AS build
WORKDIR /app
COPY package.json bun.lock* ./
RUN npm install
COPY . .
ARG VITE_API_URL=/api
ENV VITE_API_URL=$VITE_API_URL
RUN npm run build

FROM nginx:alpine AS frontend
COPY --from=build /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
