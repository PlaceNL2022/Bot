# PlaceNL Bot (Czech Edition)

Bot pro PlaceNL! Tento robot automaticky načítá příkazy každých pár minut, aby zabránil botům pracovat proti sobě.

## Pokyny pro instalaci

Než začnete, ujistěte se, že odpočet pro umístění pixelu vypršel! (Viz nevýhody bota)

1. Nainstalujte si rozšíření prohlížeče [Tampermonkey](https://www.tampermonkey.net/)
2. Klikněte na tento odkaz: https://github.com/PlaceCZ/Bot/raw/master/placenlbot.user.js. Pokud vše půjde dobře, Tampermonkey by vám měl nabídnout instalaci uživatelského skriptu. Klikněte na **Instalovat**.
3. Otevřte nebo obnovte stránku **r/place**. Pokud vše proběhlo v pořádku, v pravém horním rohu obrazovky se zobrazí „Získávání přístupového tokenu...“. Robot je nyní aktivní a bude vás informovat o tom, co dělá, prostřednictvím těchto oznámení v pravé horní části obrazovky.

## Nevýhody bota

Když bot umístí pixel, může se zdát, že stále můžete umístit pixel i když to bot za vás už udělal.(takže jste v 5minutovém odpočtu).
Bot totiž ještě nezohledňuje již probíhající odpočet, takže předpokládá, že když otevřete **r/place**, může okamžitě umístit pixel. V nejhorším případě se váš první pixel umístí až v dalším cyklu za 4 minuty a 59 sekund.
