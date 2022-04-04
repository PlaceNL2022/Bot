FROM node:17-alpine
WORKDIR /usr/src/app
ENV PREFIX docker
COPY package*.json ./
RUN npm ci
COPY bot.js .
USER node
ENTRYPOINT ["node", "bot.js"]
