FROM node:17-alpine

WORKDIR /usr/src/app

COPY bot.js .
COPY package*.json .

RUN npm ci

USER node
CMD ["node", "bot.js", "$ACCESS-TOKEN"]
