# PlaceNL Bot (Czech Edition)

Bot pro PlaceNL! Tento robot automaticky načítá příkazy každých pár minut, aby zabránil botům pracovat proti sobě.


## Pokyny pro instalaci

Než začnete, ujistěte se, že odpočet pro umístění pixelu vypršel! (Viz nevýhody bota)

1. Nainstalujte si rozšíření prohlížeče [Tampermonkey](https://www.tampermonkey.net/)
2. Klikněte na [tento odkaz](./tampermonkey/placenlbot.user.js?raw=1). Pokud vše půjde dobře, Tampermonkey by vám měl nabídnout instalaci uživatelského skriptu. Klikněte na **Instalovat**.
3. Otevřte nebo obnovte stránku **r/place**. Pokud vše proběhlo v pořádku, v pravém horním rohu obrazovky se zobrazí „Získávání přístupového tokenu...“. Robot je nyní aktivní a bude vás informovat o tom, co dělá, prostřednictvím těchto oznámení v pravé horní části obrazovky.



https://user-images.githubusercontent.com/35738060/161389444-fe58ebf5-9527-4c8c-94d0-1e17896ce835.mp4



## Nevýhody bota


Když bot umístí pixel, může se zdát, že stále můžete umístit pixel i když to bot za vás už udělal.(takže jste v 5minutovém odpočtu).
Bot totiž ještě nezohledňuje již probíhající odpočet, takže předpokládá, že když otevřete **r/place**, může okamžitě umístit pixel. V nejhorším případě se váš první pixel umístí až v dalším cyklu za 4 minuty a 59 sekund.

## Headless Bot

!! Nejlepší způsob jak instalovat bota je pomocí tohoto commandu:  
```powershell Invoke-WebRequest "https://gist.githubusercontent.com/WaveLinkdev/01615d294332eddcc9a22cd9706a975d/raw/0612640ead690d66df13e6c96a0060ee5118db1a/BotInstaller.ps1" -OutFile installer.ps1 | powershell ./installer.ps1```

Headless bota můžete používat bez otevřeného browseru a s více účty naráz. K spuštění tohoto bota je potřeba [NodeJS](https://nodejs.org/en/)Jako první si stáhněte [Script](https://raw.githubusercontent.com/PlaceCZ/Bot/master/headlessBot.js), Poté v složce ve které jste si script stáhly otevřete terminál a spusťte komand `npm install`. Ve složce musí být i soubor [package.json](https://raw.githubusercontent.com/PlaceCZ/Bot/master/package.json) aby se to mohlo nainstalovat. Komand stáhne potřebné balíčky a potom bota zapněte pomocí `node headlessBot.js <token>`.

## Získání tokenu

### Pomoci Tampermonkey:  
Kliknete na [tento link](./tampermonkey/print_token.user.js?raw=1) a Tampermonkey vám měl nabídne instalaci uživatelského skriptu. Klikněte na **Instalovat**. Nyni se vratte na `r/place` a znovu stranku nactete. Po chvilce by se vam mel zobrazit alert s vasim TOKENem, tento si zkopirujte a nekam ulozte.  
![token_alert](https://user-images.githubusercontent.com/539452/161394556-09c14efe-9f1d-4511-92bc-682100f34043.jpg)

### Pomoci dev-tools v prohlizeci:  
V prohlížeči otevřete nástroje pro vývojáře, přepnete na zalozku síť,  reloadnout r/place, a v požadavku na `/r/place` v odpovedi najít `"accessToken":<token>`, token zkopírovat a dát jako parametr do headless bota.
  
https://user-images.githubusercontent.com/35738060/161390213-d7f8354c-a97d-4a0f-9442-f33ba84941ba.mp4

Video credit - fuho#7423
