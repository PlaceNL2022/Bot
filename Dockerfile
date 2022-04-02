FROM node:17-alpine

WORKDIR /usr/src/app

RUN npm ci

RUN apk add --update --no-cache python3 build-base cairo-dev jpeg-dev pango-dev giflib-dev

RUN npm install canvas

COPY bot.js ./
COPY package*.json ./

USER node
CMD ["node", "bot.js"]
