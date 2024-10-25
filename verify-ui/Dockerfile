FROM node:18-alpine AS base
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /usr/src/app

COPY package*.json ./
RUN npm install
COPY . .

RUN npm run build
EXPOSE 3002
CMD ["npm", "start"]
