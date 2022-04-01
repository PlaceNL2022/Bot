// ==UserScript==
// @name         PlaceDE Bot
// @namespace    https://github.com/PlaceDE/Bot
// @version      4
// @description  /r/place bot
// @author       NoahvdAa
// @match        https://www.reddit.com/r/place/*
// @match        https://new.reddit.com/r/place/*
// @icon         https://www.google.com/s2/favicons?sz=64&domain=reddit.com
// @require	     https://cdn.jsdelivr.net/npm/toastify-js
// @resource     TOASTIFY_CSS https://cdn.jsdelivr.net/npm/toastify-js/src/toastify.min.css
// @updateURL    https://github.com/PlaceDE/Bot/raw/master/placedebot.user.js
// @downloadURL  https://github.com/PlaceDE/Bot/raw/master/placedebot.user.js
// @grant        GM_getResourceText
// @grant        GM_addStyle
// ==/UserScript==

// Sorry voor de rommelige code, haast en clean gaatn iet altijd samen ;)

var placeOrders = [];
var accessToken;
var canvas = document.createElement('canvas');

const COLOR_MAPPINGS = {
	'#FF4500': 2,
	'#FFA800': 3,
	'#FFD635': 4,
	'#00A368': 6,
	'#7EED56': 8,
	'#2450A4': 12,
	'#3690EA': 13,
	'#51E9F4': 14,
	'#811E9F': 18,
	'#B44AC0': 19,
	'#FF99AA': 23,
	'#9C6926': 25,
	'#000000': 27,
	'#898D90': 29,
	'#D4D7D9': 30,
	'#FFFFFF': 31
};

(async function () {
	GM_addStyle(GM_getResourceText('TOASTIFY_CSS'));
	canvas.width = 1000;
	canvas.height = 1000;
	canvas = document.body.appendChild(canvas);

	Toastify({
		text: 'Abfrage des Zugriffstokens...',
		duration: 10000
	}).showToast();
	accessToken = await getAccessToken();
	Toastify({
		text: 'Zugriffstoken eingesammelt!',
		duration: 10000
	}).showToast();

	setInterval(updateOrders, 5 * 60 * 1000); // Update orders elke vijf minuten.
	await updateOrders();
	attemptPlace();
})();


function getWork() {
	const pixel = placeOrders
		.map(it => it.pixel)
		.flat()
	shuffle(pixel)
	return pixel
}

// from https://stackoverflow.com/questions/2450954/how-to-randomize-shuffle-a-javascript-array
function shuffle(array) {
	let currentIndex = array.length,  randomIndex;

	// While there remain elements to shuffle...
	while (currentIndex != 0) {

		// Pick a remaining element...
		randomIndex = Math.floor(Math.random() * currentIndex);
		currentIndex--;

		// And swap it with the current element.
		[array[currentIndex], array[randomIndex]] = [
			array[randomIndex], array[currentIndex]];
	}

	return array;
}
async function attemptPlace() {
	var ctx;
	try {
		const canvasUrl = await getCurrentImageUrl();
		ctx = await getCanvasFromUrl(canvasUrl);
	} catch (e) {
		console.warn('Fehler beim Abrufen der Zeichenfläche:', e);
		Toastify({
			text: 'Fehler beim Abrufen der Zeichenfläche. Neuer Versuch in 15 Sekunden...',
			duration: 10000
		}).showToast();
		setTimeout(attemptPlace, 15000); // probeer opnieuw in 15sec.
		return;
	}

	for (const order of getWork()) {
		const x = order[0];
		const y = order[1];
		const colorId = COLOR_MAPPINGS[order[2]] ?? order[2]

		const rgbaAtLocation = ctx.getImageData(x, y, 1, 1).data;
		const hex = rgbToHex(rgbaAtLocation[0], rgbaAtLocation[1], rgbaAtLocation[2]);
		const currentColorId = COLOR_MAPPINGS[hex];
		// Deze pixel klopt al.
		if (currentColorId == colorId) continue;

		Toastify({
			text: `Pixel wird gesetzt auf ${x}, ${y}...`,
			duration: 10000
		}).showToast();
		await place(x, y, colorId);

		Toastify({
			text: `Warten auf Abkühlzeit.`,
			duration: 315000
		}).showToast();
		setTimeout(attemptPlace, 315000); // 5min en 15sec, just to be safe.
		return;
	}

	Toastify({
		text: 'Alle bestellten Pixel haben bereits die richtige Farbe!',
		duration: 10000
	}).showToast();
	setTimeout(attemptPlace, 30000); // probeer opnieuw in 30sec.
}

function updateOrders() {
	fetch('https://placenl.github.io/Orders/orders.json').then(async (response) => {
		if (!response.ok) return console.warn('Bestellungen können nicht geladen werden!');
		const data = await response.json();

		if (JSON.stringify(data) !== JSON.stringify(placeOrders)) {
			Toastify({
				text: `Neue Bestellungen geladen. Gesamtanzahl: ${data.length}.`,
				duration: 10000
			}).showToast();
		}

		placeOrders = data;
	}).catch((e) => console.warn('Bestellungen können nicht geladen werden!', e));
}

function place(x, y, color) {
	return fetch('https://gql-realtime-2.reddit.com/query', {
		method: 'POST',
		body: JSON.stringify({
			'operationName': 'setPixel',
			'variables': {
				'input': {
					'actionName': 'r/replace:set_pixel',
					'PixelMessageData': {
						'coordinate': {
							'x': x,
							'y': y
						},
						'colorIndex': color,
						'canvasIndex': 0
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

async function getAccessToken() {
	const response = await fetch('https://www.reddit.com/r/place/');
	const responseText = await response.text();

	// TODO: ew
	return responseText.split('\"accessToken\":\"')[1].split('"')[0];
}

async function getCurrentImageUrl() {
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
								'tag': '0'
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

			// TODO: ew
			if (!parsed.payload || !parsed.payload.data || !parsed.payload.data.subscribe || !parsed.payload.data.subscribe.data) return;

			ws.close();
			resolve(parsed.payload.data.subscribe.data.name);
		}


		ws.onerror = reject;
	});
}

function getCanvasFromUrl(url) {
	return new Promise((resolve, reject) => {
		var ctx = canvas.getContext('2d');
		var img = new Image();
		img.crossOrigin = 'anonymous';
		img.onload = () => {
			ctx.drawImage(img, 0, 0);
			resolve(ctx);
		};
		img.onerror = reject;
		img.src = url;
	});
}

function rgbToHex(r, g, b) {
	return '#' + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1).toUpperCase();
}
