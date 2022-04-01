# PlaceNL Bot

De bot voor PlaceNL! Deze bot haalt elke paar minuten automatisch [orders](https://github.com/PlaceNL/Orders) op, om te voorkomen dat bots elkaar gaan tegenwerken.

## Installatieinstructies

Voordat je begint, zorg dat je pixel wachttijd is verlopen!

1. Installeer de [Tampermonkey](https://www.tampermonkey.net/) browserextensie.
2. Klik op deze link: [https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js](https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js). Als het goed is zal Tampermonkey je moeten aanbieden om een userscript te installeren. Klik op **Install**.
3. Herlaad je **r/place** tabblad. Als alles goed is gegaan, zie je "Accesstoken ophalen..." rechtsbovenin je scherm. De bot is nu actief, en zal je via deze meldingen rechtsbovenin je scherm op de hoogte houden van wat 'ie doet.

## Nadelen van deze bot

- Wanneer de bot een pixel plaatst, ziet het er voor jezelf uit alsof je nog steeds een pixel kunt plaatsen, terwijl de bot dit al voor je heeft gedaan (en je dus in de 5 minuten cooldown zit).
- De bot gaat houdt nog geen rekening met een bestaande cooldown, en gaat er dus van uit dat wanneer je **r/place** opent je meteen een pixel kunt plaatsen. Het kan hierdoor dat je eerste pixel in het ergste geval 4 minuten en 59 seconden tijd verspilt.
