# PlaceNL Bot (Czech Edition)

Robot pro PlaceNL! Tento robot automaticky načítá objednávky každých pár minut, aby zabránil robotům pracovat proti sobě.

## Pokyny pro instalaci

Než začnete, ujistěte se, že vaše pixelová latence vypršela!

1. Nainstalujte si rozšíření prohlížeče Tampermonkey.
2. Klikněte na tento odkaz: https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js. Pokud vše půjde dobře, Tampermonkey by vám měl nabídnout instalaci uživatelského skriptu. Klikněte na **Instalovat**.
3. Znovu načtěte stránku **r/place**. Pokud vše proběhlo v pořádku, v pravém horním rohu obrazovky se zobrazí „Získávání přístupového tokenu...“. Robot je nyní aktivní a bude vás informovat o tom, co dělá, prostřednictvím těchto oznámení v pravé horní části obrazovky.

## Nevýhody tohoto bota

Když bot umístí pixel, zdá se vám, že stále můžete umístit pixel, když to bot již udělal za vás (takže jste v 5minutovém cooldownu).
Bot ještě nezohledňuje existující cooldown, takže předpokládá, že když otevřete **r/place**, můžete okamžitě umístit pixel. V nejhorším případě by váš první pixel mohl ztratit 4 minuty a 59 sekund času.
