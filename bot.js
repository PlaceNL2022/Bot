import fetch from 'node-fetch';
import getPixels from "get-pixels";
import WebSocket from 'ws';
import https from 'https'

const VERSION_NUMBER = 4;

console.log(`PlaceNL headless client V${VERSION_NUMBER}`);

const args = process.argv.slice(2);

//if (args.length != 1 && !process.env.ACCESS_TOKEN) {
//    console.error("Missing access token.")
//    process.exit(1);
//}


let redditSessionCookies = (process.env.REDDIT_SESSION || args[0])
if (redditSessionCookies) redditSessionCookies = redditSessionCookies.split(';')

let userNames = (process.env.BOT_USERNAME || false)
if (userNames) userNames = userNames.split(';');
let passWords = (process.env.BOT_PASSWORD || false)
if (passWords) passWords = passWords.split(';');

if (userNames || passWords) {
    if (userNames?.length !== passWords?.length) {
        console.error('Een user per password graar (en ook andersom).');
        userNames = false;
        passWords = false;
    }
}
if (!(redditSessionCookies || (userNames && passWords))) {
    console.error("Missing credintials cookie.")
    process.exit(1);
}
if(!redditSessionCookies) redditSessionCookies = [];

var hasTokens = false;

let accessTokens;
let defaultAccessToken;

if (redditSessionCookies?.length > 4) {
    console.warn("Meer dan 4 reddit accounts per IP addres wordt niet geadviseerd!")
}

var socket;
var currentOrders;
var currentOrderList;

const COLOR_MAPPINGS = {
    '#BE0039': 1,
    '#FF4500': 2,
    '#FFA800': 3,
    '#FFD635': 4,
    '#00A368': 6,
    '#00CC78': 7,
    '#7EED56': 8,
    '#00756F': 9,
    '#009EAA': 10,
    '#2450A4': 12,
    '#3690EA': 13,
    '#51E9F4': 14,
    '#493AC1': 15,
    '#6A5CFF': 16,
    '#811E9F': 18,
    '#B44AC0': 19,
    '#FF3881': 22,
    '#FF99AA': 23,
    '#6D482F': 24,
    '#9C6926': 25,
    '#000000': 27,
    '#898D90': 29,
    '#D4D7D9': 30,
    '#FFFFFF': 31
};

let rgbaJoin = (a1, a2, rowSize = 1000, cellSize = 4) => {
    const rawRowSize = rowSize * cellSize;
    const rows = a1.length / rawRowSize;
    let result = new Uint8Array(a1.length + a2.length);
    for (var row = 0; row < rows; row++) {
        result.set(a1.slice(rawRowSize * row, rawRowSize * (row + 1)), rawRowSize * 2 * row);
        result.set(a2.slice(rawRowSize * row, rawRowSize * (row + 1)), rawRowSize * (2 * row + 1));
    }
    return result;
};

let getRealWork = rgbaOrder => {
    let order = [];
    for (var i = 0; i < 2000000; i++) {
        if (rgbaOrder[(i * 4) + 3] !== 0) {
            order.push(i);
        }
    }
    return order;
};

let getPendingWork = (work, rgbaOrder, rgbaCanvas) => {
    let pendingWork = [];
    for (const i of work) {
        if (rgbaOrderToHex(i, rgbaOrder) !== rgbaOrderToHex(i, rgbaCanvas)) {
            pendingWork.push(i);
        }
    }
    return pendingWork;
};

(async function () {
    await refreshTokens(); // wachten totdat je de tokens hebt (duurt nu langer);
    connectSocket();

    startPlacement();

    setInterval(() => {
        if (socket) socket.send(JSON.stringify({ type: 'ping' }));
    }, 5000);
    // Refresh de tokens elke 30 minuten. Moet genoeg zijn toch.
    setInterval(refreshTokens, 30 * 60 * 1000);
})();

function startPlacement() {
    if (!hasTokens) {
        // Probeer over een seconde opnieuw.
        setTimeout(startPlacement, 1000);
        return
    }

    // Try to stagger pixel placement
    const interval = 300 / accessTokens.length;
    var delay = 0;
    for (const accessToken of accessTokens) {
        setTimeout(() => attemptPlace(accessToken), delay * 1000);
        delay += interval;
    }
}


function request(options, body) {
    let promise = new Promise((resolve, reject) => {
        const req = https.request(options, (res) => {
            resolve(res);
        });

        req.on('error', (e) => {
            reject(error);
        });
        if (body) {
            req.write(body); //stuurd de pass en username
        }
        req.end();
    });
    return promise
}
async function GetToken(username, password) {
    let place_url = "https://www.reddit.com/r/place/"
    let reddit_url = "https://www.reddit.com/login/"
    let response = await fetch(reddit_url); //pak de csrf token van de login form (ook nodig voor sesion cookie)
    let responseText = await response.text();

    let csrf = responseText.match(/csrf_token" value\="(.*?)">/)[1]; // crsf token

    let cookies = response.headers.raw()['set-cookie']; //alle cookie
    let session = cookies[0].match(/session\=(.*?;)/)[1]; // eerste is altijd (hoop ik) de session cookie

    let body = `csrf_token=${csrf}&password=${password}&username=${username}`; //body van login request

    const options = {
        hostname: 'www.reddit.com',
        port: 443,
        path: '/login',
        method: 'POST',
        headers: {
            'cookie': `session=${session}`, //login request heeft session cookie nodig (van de eerde login form)
        }
    };

    //node fetch werkt hier niet want die set bepalde header die niet mogen geset worden
    let result = await request(options, body);
    let cookie_reddit_session;
    try {
        cookie_reddit_session = result.headers['set-cookie'][0].match(/reddit_session\=(.*?);/)[1]; //reddit_session cookie
    } catch (error) {
        console.error(error);
    }
    
    response = await fetch(place_url, {
        headers: {
            cookie: `reddit_session=${cookie_reddit_session}`
        }
    })
    responseText = await response.text();

    return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}


async function refreshTokens() {
    let tokens = [];
    if (userNames && passWords) {
        for (let i = 0; i < userNames.length; i++) {
            let password = passWords[i];
            let username = userNames[i];
            console.log(`Reddit session token ophalen voor ${username}`);
            let token = await GetToken(username, password);
            tokens.push(token);
        }
        console.log("Refreshed tokens: ", tokens)

        accessTokens = tokens;
        defaultAccessToken = tokens[0];
        hasTokens = true;
        return
    }




    for (const cookie of redditSessionCookies) {
        const response = await fetch("https://www.reddit.com/r/place/", {
            headers: {
                cookie: `reddit_session=${cookie}`
            }
        });
        const responseText = await response.text()

        let token = responseText.split('\"accessToken\":\"')[1].split('"')[0];
        tokens.push(token);
    }

    console.log("Refreshed tokens: ", tokens)

    accessTokens = tokens;
    defaultAccessToken = tokens[0];
    hasTokens = true;
}

function connectSocket() {
    console.log('Verbinden met PlaceNL server...')

    socket = new WebSocket('wss://placenl.noahvdaa.me/api/ws');

    socket.onerror = function (e) {
        console.error("Socket error: " + e.message)
    }

    socket.onopen = function () {
        console.log('Verbonden met PlaceNL server!')
        socket.send(JSON.stringify({ type: 'getmap' }));
        socket.send(JSON.stringify({ type: 'brand', brand: `nodeheadlessV${VERSION_NUMBER}` }));
    };

    socket.onmessage = async function (message) {
        var data;
        try {
            data = JSON.parse(message.data);
        } catch (e) {
            return;
        }

        switch (data.type.toLowerCase()) {
            case 'map':
                console.log(`Nieuwe map geladen (reden: ${data.reason ? data.reason : 'verbonden met server'})`)
                currentOrders = await getMapFromUrl(`https://placenl.noahvdaa.me/maps/${data.data}`);
                currentOrderList = getRealWork(currentOrders.data);
                break;
            default:
                break;
        }
    };

    socket.onclose = function (e) {
        console.warn(`PlaceNL server heeft de verbinding verbroken: ${e.reason}`)
        console.error('Socketfout: ', e.reason);
        socket.close();
        setTimeout(connectSocket, 1000);
    };
}

async function attemptPlace(accessToken) {
    let retry = () => attemptPlace(accessToken);
    if (currentOrderList === undefined) {
        setTimeout(retry, 2000); // probeer opnieuw in 2sec.
        return;
    }

    var map0;
    var map1;
    try {
        map0 = await getMapFromUrl(await getCurrentImageUrl('0'))
        map1 = await getMapFromUrl(await getCurrentImageUrl('1'));
    } catch (e) {
        console.warn('Fout bij ophalen map: ', e);
        setTimeout(retry, 15000); // probeer opnieuw in 15sec.
        return;
    }

    const rgbaOrder = currentOrders.data;
    const rgbaCanvas = rgbaJoin(map0.data, map1.data);
    const work = getPendingWork(currentOrderList, rgbaOrder, rgbaCanvas);

    if (work.length === 0) {
        console.log(`Alle pixels staan al op de goede plaats! Opnieuw proberen in 30 sec...`);
        setTimeout(retry, 30000); // probeer opnieuw in 30sec.
        return;
    }

    const percentComplete = 100 - Math.ceil(work.length * 100 / currentOrderList.length);
    const workRemaining = work.length;
    const idx = Math.floor(Math.random() * work.length);
    const i = work[idx];
    const x = i % 2000;
    const y = Math.floor(i / 2000);
    const hex = rgbaOrderToHex(i, rgbaOrder);

    console.log(`Proberen pixel te plaatsen op ${x}, ${y}... (${percentComplete}% compleet, nog ${workRemaining} over)`);

    const res = await place(x, y, COLOR_MAPPINGS[hex], accessToken);
    const data = await res.json();
    try {
        if (data.errors) {
            const error = data.errors[0];
            if (error.extensions && error.extensions.nextAvailablePixelTimestamp ||  error.extensions.nextAvailablePixelTs) {
                const nextPixel = ( error.extensions.nextAvailablePixelTimestamp || error.extensions.nextAvailablePixelTs) + 3000;
                const nextPixelDate = new Date(nextPixel);
                const delay = nextPixelDate.getTime() - Date.now();
                console.log(`Pixel te snel geplaatst! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`)
                setTimeout(retry, delay);
            }else {
                console.error(`[!!] Kritieke fout: ${error.message}. Heb je de 'reddit_session' cookie goed gekopieerd?`);
                console.error(`[!!] Los dit op en herstart het script`);
            }
        } else {
            const nextPixel = data.data.act.data[0].data.nextAvailablePixelTimestamp + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            console.log(`Pixel geplaatst op ${x}, ${y}! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`)
            setTimeout(retry, delay);
        }
    } catch (e) {
        console.warn('Fout bij response analyseren', e);
        setTimeout(retry, 10000);
    }
}

function place(x, y, color, accessToken = defaultAccessToken) {
    socket.send(JSON.stringify({ type: 'placepixel', x, y, color }));
    return fetch('https://gql-realtime-2.reddit.com/query', {
        method: 'POST',
        body: JSON.stringify({
            'operationName': 'setPixel',
            'variables': {
                'input': {
                    'actionName': 'r/replace:set_pixel',
                    'PixelMessageData': {
                        'coordinate': {
                            'x': x % 1000,
                            'y': y % 1000
                        },
                        'colorIndex': color,
                        'canvasIndex': (x > 999 ? 1 : 0)
                    }
                }
            },
            'query': 'mutation setPixel($input: ActInput!) {\n  act(input: $input) {\n    data {\n      ... on BasicMessage {\n        id\n        data {\n          ... on GetUserCooldownResponseMessageData {\n            nextAvailablePixelTimestamp\n            __typename\n          }\n          ... on SetPixelResponseMessageData {\n            timestamp\n            __typename\n          }\n          __typename\n        }\n        __typename\n      }\n      __typename\n    }\n    __typename\n  }\n}\n'
        }),
        headers: {
            'origin': 'https://hot-potato.reddit.com',
            'referer': 'https://hot-potato.reddit.com/',
            'apollographql-client-name': 'mona-lisa',
            'Authorization': `Bearer ${accessToken}`,
            'Content-Type': 'application/json'
        }
    });
}

async function getCurrentImageUrl(id = '0') {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws', {
            headers: {
                "User-Agent": "Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0",
                "Origin": "https://hot-potato.reddit.com"
            }
        });

        ws.onopen = () => {
            ws.send(JSON.stringify({
                'type': 'connection_init',
                'payload': {
                    'Authorization': `Bearer ${defaultAccessToken}`
                }
            }));

            ws.send(JSON.stringify({
                'id': '1',
                'type': 'start',
                'payload': {
                    'variables': {
                        'input': {
                            'channel': {
                                'teamOwner': 'AFD2022',
                                'category': 'CANVAS',
                                'tag': id
                            }
                        }
                    },
                    'extensions': {},
                    'operationName': 'replace',
                    'query': 'subscription replace($input: SubscribeInput!) {\n  subscribe(input: $input) {\n    id\n    ... on BasicMessage {\n      data {\n        __typename\n        ... on FullFrameMessageData {\n          __typename\n          name\n          timestamp\n        }\n      }\n      __typename\n    }\n    __typename\n  }\n}'
                }
            }));
        };

        ws.onmessage = (message) => {
            const { data } = message;
            const parsed = JSON.parse(data);

            if (parsed.type === 'connection_error') {
                console.error(`[!!] Kon /r/place map niet laden: ${parsed.payload.message}. Is de access token niet meer geldig?`);
            }

            // TODO: ew
            if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

            ws.close();
            resolve(parsed.payload.data.subscribe.data.name + `?noCache=${Date.now() * Math.random()}`);
        }


        ws.onerror = reject;
    });
}

function getMapFromUrl(url) {
    return new Promise((resolve, reject) => {
        getPixels(url, function (err, pixels) {
            if (err) {
                console.log("Bad image path")
                reject()
                return
            }
            resolve(pixels)
        })
    });
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

let rgbaOrderToHex = (i, rgbaOrder) =>
    rgbToHex(rgbaOrder[i * 4], rgbaOrder[i * 4 + 1], rgbaOrder[i * 4 + 2]);
