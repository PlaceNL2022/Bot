# PlaceNL Bot (Czech Edition)

Bot pro PlaceNL! Tento robot automaticky načítá příkazy každých pár minut, aby zabránil botům pracovat proti sobě.


## Pokyny pro instalaci

Než začnete, ujistěte se, že odpočet pro umístění pixelu vypršel! (Viz nevýhody bota)

1. Nainstalujte si rozšíření prohlížeče [Tampermonkey](https://www.tampermonkey.net/)
2. Klikněte na tento odkaz: https://github.com/PlaceCZ/Bot/raw/master/placenlbot.user.js. Pokud vše půjde dobře, Tampermonkey by vám měl nabídnout instalaci uživatelského skriptu. Klikněte na **Instalovat**.
3. Otevřte nebo obnovte stránku **r/place**. Pokud vše proběhlo v pořádku, v pravém horním rohu obrazovky se zobrazí „Získávání přístupového tokenu...“. Robot je nyní aktivní a bude vás informovat o tom, co dělá, prostřednictvím těchto oznámení v pravé horní části obrazovky.



https://user-images.githubusercontent.com/35738060/161389444-fe58ebf5-9527-4c8c-94d0-1e17896ce835.mp4



## Nevýhody bota


Když bot umístí pixel, může se zdát, že stále můžete umístit pixel i když to bot za vás už udělal.(takže jste v 5minutovém odpočtu).
Bot totiž ještě nezohledňuje již probíhající odpočet, takže předpokládá, že když otevřete **r/place**, může okamžitě umístit pixel. V nejhorším případě se váš první pixel umístí až v dalším cyklu za 4 minuty a 59 sekund.

## Headless Bot

Headless bota můžete používat bez otevřeného browseru a s více účty naráz. K spuštění tohoto bota je potřeba [NodeJS](https://nodejs.org/en/)Jako první si stáhněte [Script](https://raw.githubusercontent.com/PlaceCZ/Bot/master/headlessBot.js), Poté v složce ve které jste si script stáhly otevřete terminál a spusťte komand `npm install`. Komand stáhne potřebné balíčky a potom bota zapněte pomocí `node headlessBot.js <token>`.

## Získání tokenu
<žádám o doplnění>
v prohlížeči otevřít nástroje pro vývojáře, přepnout na tabulku síť,  reloadnout r/place, a v požadavku na /r/place tak v odpovedi najít "accessToken":<token>, token zkopírovat a dát jako parametr do toho headless bota

https://user-images.githubusercontent.com/35738060/161390213-d7f8354c-a97d-4a0f-9442-f33ba84941ba.mp4

Video credit - fuho#7423
