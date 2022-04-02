FROM node:17-alpine
WORKDIR /usr/src/app
COPY package*.json ./
RUN npm ci
USER node
COPY bot.js .
CMD ["node", "bot.js"]
