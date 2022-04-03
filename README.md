**NEDERLANDSE VERSIE ONDERAAN DE PAGINA**

# PlaceTUD Bot Bot (English)

The bot for PlaceTUD and their allies! This bot connects with the [command server](https://github.com/PlaceTUD/Commander) and gets it's orders from there. You can see the orderhistory [here](https://placetud.yanick.gay).

## User script bot

### Installation instructions

before you start, make sure your cooldown has run out!

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browserextention.
2. Click on this link: [https://github.com/PlaceTUD/Soldat/raw/master/placenlbot.user.js](https://github.com/PlaceTUD/Soldat/raw/master/placenlbot.user.js). If everything went well you'll see Tampermonkey ask you to add it. Click **Install**.
3. Reload your **r/place** tab. If everything went well, you'll see "Getting access token..." in the top right of your screen. The bot is now active, You'll be able to see what the bot is doing through these messages.

### Cons of this bot

- When the bot places a pixel, it will look as if it wasn't placed, while the bot has already done that (and thus you're in cooldown). You can see the cooldown in the topright of your screen.

## Headless bot

### You can get an access token
1. Go to [r/place](https://www.reddit.com/r/place/)
2. Open the browser console (F12 -> Click on console)
3. paste this code and press enter:
```
async function getAccessToken() {
	const usingOldReddit = window.location.href.includes('new.reddit.com');
	const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
	const response = await fetch(url);
	const responseText = await response.text();

	return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}

await getAccessToken()
```
4. The text between quotes (`"`) is your access token.

### Installation instructions

1. Install [NodeJS](https://nodejs.org/).
2. Download the bot via [this link](https://github.com/PlaceTUD/Soldat/archive/refs/heads/master.zip).
3. Extract the bot anywhere on your desktop
4. Open a command prompt/terminal in this folder
    Windows: Shift+right mousebutton in the folder -> Click on "open Powershell here"
    
    Mac: No clue, sorry!
    
    Linux: Is this necessary?
5. install the dependencies: `npm i`
6. execute the bot `node bot.js ACCESS_TOKEN_HERE`
7. BONUS: You can repeat these steps for any amount of accounts you'd want. Keep in mind to use different accounts.

# Docker alternative

This option is mostly useful for people who are already using docker.

1. Install [Docker](https://docs.docker.com/get-docker/)
2. Run this command: `docker run --pull=always --rm -it ghcr.io/placenl/placenl-bot ACCESS_TOKEN_HERE`