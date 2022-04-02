import fetch from 'node-fetch';
import WebSocket from 'ws';
import * as Canvas from 'canvas';

const createCanvas = Canvas.default.createCanvas;
const loadImage = Canvas.default.loadImage;

const args = process.argv.slice(2);

if (args.length != 1 && !process.env.ACCESS_TOKEN) {
    console.error('Missing access token.');
    process.exit(1);
}

let accessToken = process.env.ACCESS_TOKEN || args[0];

var socket;
var order = undefined;

var currentOrderCanvas = createCanvas(2000, 1000);
var currentOrderCtx = currentOrderCanvas.getContext('2d');
var currentPlaceCanvas = createCanvas(2000, 1000);

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
    currentOrderCanvas.width = 2000;
    currentOrderCanvas.height = 1000;
    currentPlaceCanvas.width = 2000;
    currentPlaceCanvas.height = 1000;

    connectSocket();
    attemptPlace();

    setInterval(() => {
        if (socket) socket.send(JSON.stringify({ type: 'ping' }));
    }, 5000);
})();

function connectSocket() {
    console.log('Connectring with PlaceTUD server...');

    socket = new WebSocket('wss://placetud.yanick.gay/api/ws');

    socket.onopen = function () {
        console.log('Connected with PlaceTUD server!');
        socket.send(JSON.stringify({ type: 'getmap' }));
    };

    socket.onmessage = async function (message) {
        var data;
        try {
            data = JSON.parse(message.data);
        } catch (e) {
            console.log('Fout bij parsen JSON: ' + message.data);
            return;
        }

        switch (data.type.toLowerCase()) {
            case 'map':
                console.log(`New map loaded (reason: ${data.reason ? data.reason : 'connected to server'})`);
                currentOrderCtx = await getCanvasFromUrl(`https://placetud.yanick.gay/maps/${data.data}`, currentOrderCanvas);
                order = getRealWork(currentOrderCtx.getImageData(0, 0, 2000, 1000).data);
                break;
            default:
                break;
        }
    };

    socket.onclose = function (e) {
        console.log(`PlaceTUD Server has broken the connection: ${e.reason}`);
        console.error('Socket error: ', e.reason);
        socket.close();
        setTimeout(connectSocket, 1000);
    };
}

async function attemptPlace() {
    if (order === undefined) {
        setTimeout(attemptPlace, 2000); // probeer opnieuw in 2sec.
        return;
    }
    var ctx;
    try {
        ctx = await getCanvasFromUrl(await getCurrentImageUrl('0'), currentPlaceCanvas, 0, 0);
        ctx = await getCanvasFromUrl(await getCurrentImageUrl('1'), currentPlaceCanvas, 1000, 0);
    } catch (e) {
        console.warn('Error loading map: ', e);
        console.log('Error loading map. Trying again in 10 seconds');
        setTimeout(attemptPlace, 10000);
        return;
    }

    const rgbaOrder = currentOrderCtx.getImageData(0, 0, 2000, 1000).data;
    const rgbaCanvas = ctx.getImageData(0, 0, 2000, 1000).data;
    const work = getPendingWork(order, rgbaOrder, rgbaCanvas);

    if (work.length === 0) {
        console.log(`All pixels are already in the right place! Try again in 30 seconds ...`);
        setTimeout(attemptPlace, 30000); // probeer opnieuw in 30sec.
        return;
    }

    const idx = Math.floor(Math.random() * work.length);
    const i = work[idx];
    const x = i % 2000;
    const y = Math.floor(i / 2000);
    const hex = rgbaOrderToHex(i, rgbaOrder);

    console.log(`Pixel try to place on ${x}, ${y}...`);

    const res = await place(x, y, COLOR_MAPPINGS[hex]);
    const data = await res.json();

    try {
        if (data.errors) {
            const error = data.errors[0];
            const nextPixel = error.extensions.nextAvailablePixelTs + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            console.log(`Pixel te snel geplaatst! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`);
            setTimeout(attemptPlace, delay);
        } else {
            const nextPixel = data.data.act.data[0].data.nextAvailablePixelTimestamp + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            console.log(`Pixel geplaatst op ${x}, ${y}! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`);
            setTimeout(attemptPlace, delay);
        }
    } catch (e) {
        console.warn('Fout bij response analyseren', e);
        console.log(`Fout bij response analyseren: ${e}.`);
        setTimeout(attemptPlace, 10000);
    }
}

function place(x, y, color) {
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
            headers : {
                'User-Agent': 'Mozilla/5.0 (X11; Linux x86_64; rv:98.0) Gecko/20100101 Firefox/98.0',
                'Origin': 'https://hot-potato.reddit.com'
            }
        });

        ws.onopen = () => {
            ws.send(JSON.stringify({
                'type': 'connection_init',
                'payload': {
                    'Authorization': `Bearer ${accessToken}`
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
            if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

            ws.close();
            resolve(parsed.payload.data.subscribe.data.name + `?noCache=${Date.now() * Math.random()}`);
        }

        ws.onerror = reject;
    });
}

function getCanvasFromUrl(url, canvas, x = 0, y = 0) {
    return new Promise((resolve, reject) => {
        const ctx = canvas.getContext('2d');
        const load = () => {
            loadImage(url).then(img => {
                ctx.drawImage(img, x, y);
                resolve(ctx);
            }).catch(() => {
                console.log('Fout bij ophalen map. Opnieuw proberen in 3 sec...');
                setTimeout(() => load(), 3000);
            })
        };
        load();
    });
}

function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

let rgbaOrderToHex = (i, rgbaOrder) =>
    rgbToHex(rgbaOrder[i * 4], rgbaOrder[i * 4 + 1], rgbaOrder[i * 4 + 2]);