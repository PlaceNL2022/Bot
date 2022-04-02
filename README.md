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

### Je access token verkrijgen
1. Ga naar [r/place](https://www.reddit.com/r/place/)
2. Open de browser console (F12/Element inspecteren -> Click op console)
3. Plak de volgende code en druk op enter:
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
4. De tekst tussen de quotes (`"`) is je access token.

### Installatieinstructies

1. Installeer [NodeJS](https://nodejs.org/).
2. Download de bot via [deze link](https://github.com/PlaceNL/Bot/archive/refs/heads/master.zip).
3. Pak de bot uit naar een folder ergens op je computer.
4. Open een command prompt/terminal in deze folder
    Windows: Shift+Rechter muis knop in de folder -> Click op "Powershell hier openen"
    Mac: Echt geen idee. Sorry!
    Linux: Niet echt nodig toch?
5. Installeer de nodige depdendencies met `npm i`
6. Voor de bot uit met `node bot.js ACCESS_TOKEN_HIER`
7. BONUS: Je kunt de laatse twee stappen zo vaak doen als je wil voor extra accounts. Let wel op dat je andere accounts gebruikt anders heeft het niet heel veel zin.
