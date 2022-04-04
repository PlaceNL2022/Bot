// ==UserScript==
// @name         PlaceNL Bot
// @namespace    https://github.com/PlaceNL/Bot
// @version      27
// @description  De bot voor PlaceNL!
// @author       NoahvdAa
// @match        https://www.reddit.com/r/place/*
// @match        https://new.reddit.com/r/place/*
// @connect      reddit.com
// @connect      placenl.noahvdaa.me
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @require	     https://cdn.jsdelivr.net/npm/toastify-js
// @resource     TOASTIFY_CSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @updateURL    https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js
// @downloadURL  https://github.com/PlaceNL/Bot/raw/master/placenlbot.user.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// @grant        GM.xmlHttpRequest
// ==/UserScript==

// Sorry voor de rommelige code, haast en clean gaat niet altijd samen ;)

var socket;
var order = undefined;
var accessToken;
var currentOrderCanvas = document.createElement('canvas');
var currentOrderCtx = currentOrderCanvas.getContext('2d');
var currentPlaceCanvas = document.createElement('canvas');

// Global constants
const DEFAULT_TOAST_DURATION_MS = 10000;

const R_PLACE_WIDTH = 2000;
const R_PLACE_HEIGHT = 2000;

const SCRIPT_BRAND = 'userScriptV27'

// Mapping for canvas ID to pixels
const CANVAS_MAPPING = {
    '0': [0, 0],
    '1': [1000, 0],
    '2': [0, 1000],
    '3': [1000, 1000],
}

const COLOR_MAPPINGS = {
    '#6D001A': 0,
    '#BE0039': 1,
    '#FF4500': 2,
    '#FFA800': 3,
    '#FFD635': 4,
    '#FFF8B8': 5,
    '#00A368': 6,
    '#00CC78': 7,
    '#7EED56': 8,
    '#00756F': 9,
    '#009EAA': 10,
    '#00CCC0': 11,
    '#2450A4': 12,
    '#3690EA': 13,
    '#51E9F4': 14,
    '#493AC1': 15,
    '#6A5CFF': 16,
    '#94B3FF': 17,
    '#811E9F': 18,
    '#B44AC0': 19,
    '#E4ABFF': 20,
    '#DE107F': 21,
    '#FF3881': 22,
    '#FF99AA': 23,
    '#6D482F': 24,
    '#9C6926': 25,
    '#FFB470': 26,
    '#000000': 27,
    '#515252': 28,
    '#898D90': 29,
    '#D4D7D9': 30,
    '#FFFFFF': 31
};


let getRealWork = rgbaOrder => {
    let order = [];
    for (let i = 0; i < R_PLACE_WIDTH * R_PLACE_HEIGHT; i++) {
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


/**
 * A helper function to show a toast to the user with information.
 *
 * @param {string} text Text to show to the user.
 * @param {number} [duration] Duration to show the toast (negative will be infinitive).
 * @param [style] Additional styling for the toast.
 */
function showToastToUser({text, duration, style}) {
    duration = duration || DEFAULT_TOAST_DURATION_MS;
    style = style || {}
    Toastify({
        text: text,
        duration: duration,
        style: style,
    }).showToast();
}

(async function () {
    GM_addStyle(GM_getResourceText('TOASTIFY_CSS'));
    currentOrderCanvas.width = R_PLACE_WIDTH;
    currentOrderCanvas.height = R_PLACE_HEIGHT;
    currentOrderCanvas.style.display = 'none';
    currentOrderCanvas = document.body.appendChild(currentOrderCanvas);
    currentPlaceCanvas.width = R_PLACE_WIDTH;
    currentPlaceCanvas.height = R_PLACE_HEIGHT;
    currentPlaceCanvas.style.display = 'none';
    currentPlaceCanvas = document.body.appendChild(currentPlaceCanvas);

    showToastToUser({text: 'Accesstoken ophalen...'});
    accessToken = await getAccessToken();
    showToastToUser({text: 'Accesstoken opgehaald!'});

    connectSocket();
    attemptPlace();

    setInterval(() => {
        if (socket && socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
    }, 5000);
    setInterval(async () => {
        accessToken = await getAccessToken();
    }, 30 * 60 * 1000)
})();


/**
 * Connect to the commando server for orders.
 */
function connectSocket() {
    showToastToUser({text: 'Verbinden met PlaceNL server...'});

    socket = new WebSocket('wss://placenl.noahvdaa.me/api/ws');

    socket.onopen = function () {
        showToastToUser({text: 'Verbonden met PlaceNL server!'});
        socket.send(JSON.stringify({type: 'getmap'}));
        socket.send(JSON.stringify({type: 'brand', brand: SCRIPT_BRAND}));
    };

    socket.onmessage = async function (message) {
        let data;
        try {
            data = JSON.parse(message.data);
        } catch (e) {
            return;
        }

        switch (data.type.toLowerCase()) {
            case 'map':  // Command that a new map is available.
                // Show user information about loading new map
                showToastToUser({text: `Nieuwe map laden (reden: ${data.reason ? data.reason : 'verbonden met server'})...`});

                // Get the new canvas from the server
                currentOrderCtx = await getCanvasFromUrl(`https://placenl.noahvdaa.me/maps/${data.data}`, currentOrderCanvas, 0, 0, true);
                // Figure out the "real" work
                order = getRealWork(currentOrderCtx.getImageData(0, 0, R_PLACE_WIDTH, R_PLACE_HEIGHT).data);

                // Show the user that the map has loaded.
                showToastToUser({text: `Nieuwe map geladen, ${order.length} pixels in totaal`});
                break;
            case 'toast': // Command to show the user a toast.
                showToastToUser({
                    text: `Bericht van server: ${data.message}`,
                    duration: data.duration || DEFAULT_TOAST_DURATION_MS,
                    style: data.style || {}
                });
                break;
            default:
                // Invalid command.
                break;
        }
    };

    socket.onclose = function (e) {
        showToastToUser({text: `PlaceNL server heeft de verbinding verbroken: ${e.reason}`});
        console.error('Socketfout: ', e.reason);
        socket.close();
        setTimeout(connectSocket, 1000);
    };
}

/**
 * Attempt to place a pixel.
 */
async function attemptPlace() {
    if (order === undefined) {
        setTimeout(attemptPlace, 2000); // probeer opnieuw in 2sec.
        return;
    }
    let ctx;
    try {
        // Loop over all the parts of the r/place canvas
        for (const canvas_id in CANVAS_MAPPING) {
            let canvas_coords = CANVAS_MAPPING[canvas_id];
            let canvas_x = canvas_coords[0];
            let canvas_y = canvas_coords[1];

            // Make a request and update the currentPlaceCanvas
            ctx = await getCanvasFromUrl(await getCurrentImageUrl(canvas_id), currentPlaceCanvas, canvas_x, canvas_y, false);
        }
    } catch (e) {
        console.warn('Fout bij ophalen map: ', e);
        showToastToUser({text: 'Fout bij ophalen map. Opnieuw proberen in 10 sec...'});
        setTimeout(attemptPlace, 10000); // probeer opnieuw in 10sec.
        return;
    }

    const rgbaOrder = currentOrderCtx.getImageData(0, 0, R_PLACE_WIDTH, R_PLACE_HEIGHT).data;
    const rgbaCanvas = ctx.getImageData(0, 0, R_PLACE_WIDTH, R_PLACE_HEIGHT).data;
    const work = getPendingWork(order, rgbaOrder, rgbaCanvas);

    if (work.length === 0) {
        showToastToUser({
            text: `Alle pixels staan al op de goede plaats! Opnieuw proberen in 30 sec...`,
            duration: 30000
        });
        setTimeout(attemptPlace, 30000); // probeer opnieuw in 30sec.
        return;
    }

    const percentComplete = 100 - Math.ceil(work.length * 100 / order.length);
    const workRemaining = work.length;
    const idx = Math.floor(Math.random() * work.length);
    const i = work[idx];
    const x = i % R_PLACE_WIDTH;
    const y = Math.floor(i / R_PLACE_WIDTH);
    const hex = rgbaOrderToHex(i, rgbaOrder);

    showToastToUser({text: `Proberen pixel te plaatsen op ${x}, ${y}... (${percentComplete}% compleet, nog ${workRemaining} over)`});

    const res = await place(x, y, COLOR_MAPPINGS[hex]);
    const data = await res.json();
    try {
        if (data.errors) {
            const error = data.errors[0];
            const nextPixel = error.extensions.nextAvailablePixelTs + 3000;
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            const toast_duration = delay > 0 ? delay : DEFAULT_TOAST_DURATION_MS;
            showToastToUser({
                text: `Pixel te snel geplaatst! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`,
                duration: toast_duration
            });
            setTimeout(attemptPlace, delay);
        } else {
            const nextPixel = data.data.act.data[0].data.nextAvailablePixelTimestamp + 3000 + Math.floor(Math.random() * 10000); // Random tijd toevoegen tussen 0 en 10 sec om detectie te voorkomen en te spreiden na server herstart.
            const nextPixelDate = new Date(nextPixel);
            const delay = nextPixelDate.getTime() - Date.now();
            const toast_duration = delay > 0 ? delay : DEFAULT_TOAST_DURATION_MS;
            showToastToUser({
                text: `Pixel geplaatst op ${x}, ${y}! Volgende pixel wordt geplaatst om ${nextPixelDate.toLocaleTimeString()}.`,
                duration: toast_duration
            });
            setTimeout(attemptPlace, delay);
        }
    } catch (e) {
        console.warn('Fout bij response analyseren', e);
        showToastToUser({text: `Fout bij response analyseren: ${e}.`});
        setTimeout(attemptPlace, 10000);
    }
}


/**
 * Place a pixel on r/place.
 * @param {number} x X position of the pixel.
 * @param {number }y Y position of the pixel.
 *
 * @param color The color ID of the pixel.
 */
function place(x, y, color) {
    socket.send(JSON.stringify({type: 'placepixel', x, y, color}));
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
                        'canvasIndex': getCanvas(x, y)
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


/**
 * Get reddit canvas based x and y positions
 * @param x
 * @param y
 * @returns {number}
 */
function getCanvas(x, y) {
    if (x <= 999) {
        return y <= 999 ? 0 : 2;
    } else {
        return y <= 999 ? 1 : 3;
    }
}


/**
 * Get the access token for the current user window.
 */
async function getAccessToken() {
    const usingOldReddit = window.location.href.includes('new.reddit.com');
    const url = usingOldReddit ? 'https://new.reddit.com/r/place/' : 'https://www.reddit.com/r/place/';
    const response = await fetch(url);
    const responseText = await response.text();

    // TODO: ew
    return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}


/**
 * Get the URL for a canvas of the current r/place image
 * @param id
 */
async function getCurrentImageUrl(id = '0') {
    return new Promise((resolve, reject) => {
        const ws = new WebSocket('wss://gql-realtime-2.reddit.com/query', 'graphql-ws');

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
            const {data} = message;
            const parsed = JSON.parse(data);

            // TODO: ew
            if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

            ws.close();
            resolve(parsed.payload.data.subscribe.data.name + `?noCache=${Date.now() * Math.random()}`);
        }

        ws.onerror = reject;
    });
}


/**
 * Get the r/place canvas given a provided URl.
 *
 * @param url URL to get the canvas from
 * @param canvas canvas to update with new information.
 * @param x x corner to start local canvas update from.
 * @param y y corner to start local canvas update from.
 * @param clearCanvas if the previous canvas should be cleared.
 */
function getCanvasFromUrl(url, canvas, x = 0, y = 0, clearCanvas = false) {
    return new Promise((resolve, reject) => {
        let loadImage = ctx => {
        GM.xmlHttpRequest({
            method: "GET",
            url: url,
            responseType: 'blob',
            onload: function(response) {
            let urlCreator = window.URL || window.webkitURL;
            let imageUrl = urlCreator.createObjectURL(this.response);
            let img = new Image();
            img.onload = () => {
                if (clearCanvas) {
                    ctx.clearRect(0, 0, canvas.width, canvas.height);
                }
                ctx.drawImage(img, x, y);
                resolve(ctx);
            };
            img.onerror = () => {
                showToastToUser({
                    text: 'Fout bij ophalen map. Opnieuw proberen in 3 sec...',
                    duration: 3000
                });
                setTimeout(() => loadImage(ctx), 3000);
            };
            img.src = imageUrl;
  }
})
        };
        loadImage(canvas.getContext('2d'));
    });
}

/**
 * Convert RGB values to HEX string.
 */
function rgbToHex(r, g, b) {
    return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}

let rgbaOrderToHex = (i, rgbaOrder) =>
    rgbToHex(rgbaOrder[i * 4], rgbaOrder[i * 4 + 1], rgbaOrder[i * 4 + 2]);
