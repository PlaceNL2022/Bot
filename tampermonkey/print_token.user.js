// ==UserScript==
// @name         Token Printer
// @namespace    https://github.com/fuho/Bot
// @version      2
// @description  Prints the reddit token
// @author       Wavelink
// @match        https://www.reddit.com/r/place/*
// @match        https://new.reddit.com/r/place/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @updateURL    https://github.com/PlaceCZ/Bot/raw/master/tampermonkey/print_token.user.js
// @downloadURL  https://github.com/PlaceCZ/Bot/raw/master/tampermonkey/print_token.user.js
// @grant        none
// ==/UserScript==

(async function () {
    'use strict';
    const accessToken = await getAccessToken();
    alert(accessToken);
})();

async function getAccessToken() {
    const usingOldReddit = window.location.href.includes('new.reddit.com');
    const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
    const response = await fetch(url);
    const responseText = await response.text();

    return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}
