FROM node:17-alpine

WORKDIR /usr/src/app

RUN apk add --update --no-cache python3 build-base cairo-dev jpeg-dev pango-dev giflib-dev

COPY package*.json ./

RUN npm ci

COPY bot.js ./

USER node
CMD ["node", "bot.js"]
