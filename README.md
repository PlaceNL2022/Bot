**NEDERLANDSE VERSIE ONDERAAN DE PAGINA**

# PlaceNL Bot (English)

The bot for PlaceNL and their allies! This bot connects with the [command server](https://github.com/PlaceNL/Commando) and gets it's orders from there. You can see the orderhistory [here](https://placenl.noahvdaa.me/).

## User script bot

### Installation instructions

before you start, make sure your cooldown has run out!

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browserextention.
2. Click on this link: [https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js](https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js). If everything went well you'll see Tampermonkey ask you to add it. Click **Install**.
3. Reload your **r/place** tab. If everything went well, you'll see "Accesstoken ophalen..." in the top right of your screen. The bot is now active, You'll be able to see what the bot is doing through these messages.

### Cons of this bot

- When the bot places a pixel, it will look as if it wasn't placed, while the bot has already done that (and thus you're in cooldown). You can see the cooldown in the topright of your screen.

## Headless bot

### How to get reddit_session cookie
**NOTE: People have reported that this is annoying to do on chrome because teksts get unselected. Therefore we recommend that you use firefox.**

1. Go to [r/place](https://reddit.com/r/place)
2. Open dev tools and go to the network tab
3. Refresh the page
4. Click on the first request to reddit.com/r/place (See image)
![Screenshot_20220403_165251](https://user-images.githubusercontent.com/9784257/161433856-27ef7e7c-7f00-4b37-b274-4199ea919aa9.png)
5. Go to the tab called `Cookies`
6. Copy the value of the `reddit_session` cookie

### Installation instructions

1. Install [NodeJS](https://nodejs.org/).
2. Download the bot via [this link](https://github.com/PlaceNL/Bot/archive/refs/heads/master.zip).
3. Extract the bot anywhere on your desktop
4. Open a command prompt/terminal in this folder
    Windows: Shift+right mousebutton in the folder -> Click on "open Powershell here"
    
    Mac: No clue, sorry!
    
    Linux: Is this necessary?
5. install the dependencies: `npm i`
6. execute the bot `node bot.js SESSION_COOKIE_HERE`
7. BONUS: You can repeat these steps for any amount of accounts you'd want. Keep in mind to use different accounts.

# Docker alternative

This option is mostly useful for people who are already using docker.

It has been confirmed to run on x64(average desktop computer) and armv7(raspberry pi), but it should also be able to run on arm64(new apple computers).

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Run this command: `docker run --pull=always --restart unless-stopped -it ghcr.io/placenl/placenl-bot SESSION_COOKIE_HERE`

-----

# PlaceNL Bot

De bot voor PlaceNL! Deze bot verbindt met de [commando server](https://github.com/PlaceNL/Commando) en krijgt daar order van. De ordergeschiedenis kan je [hier](https://placenl.noahvdaa.me/) bekijken.

## User script bot

### Installatieinstructies

Voordat je begint, zorg dat je pixel wachttijd is verlopen!

1. Installeer de [Tampermonkey](https://www.tampermonkey.net/) browserextensie.
2. Klik op deze link: [https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js](https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js). Als het goed is zal Tampermonkey je moeten aanbieden om een userscript te installeren. Klik op **Install**.
3. Herlaad je **r/place** tabblad. Als alles goed is gegaan, zie je "Accesstoken ophalen..." rechtsbovenin je scherm. De bot is nu actief, en zal je via deze meldingen rechtsbovenin je scherm op de hoogte houden van wat 'ie doet.

### Nadelen van deze bot

- Wanneer de bot een pixel plaatst, ziet het er voor jezelf uit alsof je nog steeds een pixel kunt plaatsen, terwijl de bot dit al voor je heeft gedaan (en je dus in de 5 minuten cooldown zit). De cooldown wordt daarom rechtsbovenin je scherm weergegeven.

## Headless bot

### Je sessie cookie verkrijgen
**NOTE: People have reported that this is annoying to do on chrome because teksts get unselected. Therefore we recommend that you use firefox.**

**NOTE: Mensen hebben ons verteld dat dit process vervelend is op chrome, hierom raden wij firefox aan.**

1. Ga naar [r/place](https://reddit.com/r/place)
2. Open Element inspecteren/F12 en ga naar het tabje netwerk
3. Herlaad de pagina
4. Click op de eerste request naar reddit.com/r/place (Zie afbeelding)
![Screenshot_20220403_165251](https://user-images.githubusercontent.com/9784257/161433856-27ef7e7c-7f00-4b37-b274-4199ea919aa9.png)
5. Ga naar het tabje cookies
6. Kopieer de waarde van `reddit_session`

### Installatieinstructies

1. Installeer [NodeJS](https://nodejs.org/).
2. Download de bot via [deze link](https://github.com/PlaceNL/Bot/archive/refs/heads/master.zip).
3. Pak de bot uit naar een folder ergens op je computer.
4. Open een command prompt/terminal in deze folder
    Windows: Shift+Rechter muis knop in de folder -> Click op "Powershell hier openen"
    Mac: Echt geen idee. Sorry!
    Linux: Niet echt nodig toch?
5. Installeer de nodige depdendencies met `npm i`
6. Voor de bot uit met `node bot.js SESSIE_COOKIE_HIER`
7. BONUS: Je kunt de laatse twee stappen zo vaak doen als je wil voor extra accounts. Let wel op dat je andere accounts gebruikt anders heeft het niet heel veel zin.

# Docker alternatief

Dit alternatief is vooral geschikt voor iedereen die al docker gebruikt.

Het is bevestigd dat het op x64(gemiddelde desktopcomputer) en armv7(raspberry pi) draait, maar het zou ook op arm64(nieuwe Apple-computers) moeten kunnen draaien.

1. Installeer [Docker](https://docs.docker.com/get-docker/)
2. Start dit command: `docker run --pull=always --restart unless-stopped -it ghcr.io/placenl/placenl-bot SESSIE_COOKIE_HIER`
