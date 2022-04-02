@echo off
mkdir PlaceCZ
cd PlaceCZ
curl https://raw.githubusercontent.com/PlaceCZ/Bot/master/headlessBot.js -o bot.js
curl https://raw.githubusercontent.com/PlaceCZ/Bot/master/package.json -o package.json
npm install