# PlaceTUD Bot

Bot von PlaceNL auf TUDisch! The bot connects to the [Commander server](https://github.com/PlaceTUD/Commander) and obtains orders from it. You can view the order history [here](https://placetud.yanick.gay/).

## User script bot

### Install routine

Before you start, make sure your pixel place cooldown has expired!

1. Install the [Tampermonkey](https://www.tampermonkey.net/) browser extension.
2. Click on this link: [https://raw.githubusercontent.com/PlaceTUD/Soldat/master/placenlbot.user.js](https://raw.githubusercontent.com/PlaceTUD/Soldat/master/placenlbot.user.js). If all goes well, Tampermonkey should offer you to install a userscript. Click on **Install**.
3. Reload your **r/place** tab. If everything went well, you'll see "Get access token..." at the top right of your screen. The bot is now active, and will keep you informed of what it is doing via these notifications at the top right of your screen.

### Disadvantages of this bot

- When the bot places a pixel, it appears that you can still place a pixel, when the bot has already done this for you (so you are in the 5 minute cooldown). The cooldown is therefore displayed at the top right of your screen.

## Headless bot

### Obtain your access token
1. Go to [r/place](https://www.reddit.com/r/place/)
2. Open the browser console (F12/Inspect element -> Click on console)
3. Paste the following code and press enter:
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
4. The text between the quotes (`"`) is your access token.

### Install routine

1. Install [NodeJS](https://nodejs.org/).
2. Download the bot from [this link](https://github.com/PlaceNL/Bot/archive/refs/heads/master.zip).
3. Extract the bot to a folder somewhere on your computer.
4. Open a command prompt/terminal in this folder
     Windows: Shift + Right mouse button in the folder -> Click on "Open Powershell here"
     Mac: Really no idea. Sorry!
     Linux: Not really necessary, right?
5. Install the necessary depdendencies with `npm i`
6. Execute the bot using `node bot.js ACCESS_TOKEN_HERE`
7. BONUS: You can do the last two steps as many times as you want for additional accounts. Make sure you use other accounts otherwise it won't make much sense.
