const emblems = {
	IRON: "https://i.imgur.com/7pKJ0KW.png",
	BRONZE: "https://i.imgur.com/oxXKZNM.png",
	SILVER: "https://i.imgur.com/DyO1O3P.png",
	GOLD: "https://i.imgur.com/zNOnzRz.png",
	PLATINUM: "https://i.imgur.com/DZeOqRD.png",
	DIAMOND: "https://i.imgur.com/Omq7eOh.png",
	MASTER: "https://i.imgur.com/6PyL3t6.png",
	GRANDMASTER: "https://i.imgur.com/BtR4BLk.png",
	CHALLENGER: "https://i.imgur.com/bD0OgAM.png",
};

let fieldData;
let apiData;
let id;

const fetchRankData = async () => {
	const url = `https://cors-anywhere.herokuapp.com/https://${
		fieldData.server
	}.api.riotgames.com/lol/league/v4/entries/by-summoner/${id}?api_key=${
		fieldData.apiKey
	}`;

	const response = await fetch(url).then(res => res.json());

	return response.find(x => x.queueType === fieldData.queue);
};

const refreshRankData = async () => {
	const data = await fetchRankData();

	const container = document.querySelector(".container");
	container.classList.add(fieldData.direction);

	if (!data) {
		container.textContent = "No rank data received";

		return;
	}

	let emblem = document.querySelector(".emblem");
	if (!emblem) {
		emblem = document.createElement("img");
		emblem.classList.add("emblem");
		container.append(emblem);
	}
	emblem.src = emblems[data.tier];

	let rank = document.querySelector(".rank");
	if (!rank) {
		rank = document.createElement("div");
		rank.classList.add("rank");
		rank.classList.add("highlight");
		container.append(rank);
	}
	rank.textContent = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(data.tier)
		? data.tier
		: `${data.tier} ${data.rank}`;

	let points = document.querySelector(".points");
	if (!points) {
		points = document.createElement("div");
		points.classList.add("points");
		container.append(points);
	}
	points.textContent = `${data.leaguePoints} LP`;

	return setTimeout(refreshRankData, fieldData.refreshRate * 60 * 1000);
};

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		const url = `https://cors-anywhere.herokuapp.com/https://${
			fieldData.server
		}.api.riotgames.com/lol/summoner/v4/summoners/by-name/${
			fieldData.summonerName
		}?api_key=${fieldData.apiKey}`;

		const response = await fetch(url).then(res => res.json());

		if (response.status) {
			const container = document.querySelector(".container");
			container.textContent = response.status.message;

			return;
		}

		id = response.id;

		refreshRankData();

		apiData = await fetch(fieldData.api).then(data => data.json());

		const { events, settings } = apiData;

		const css = Object.entries(events).reduce(
			(cssString, [eventName, event]) => `${cssString}
	
		.${eventName} * {
			color: ${event.colors.primary};
		}
		
		.${eventName} .highlight {
			color: ${event.colors.secondary};
		}`,
			`* {
			color: ${settings.colors.default.primary};
		}
		
		.highlight {
			color: ${settings.colors.default.secondary};
		}`
		);

		const style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));

		const head = document.querySelector("head");
		head.appendChild(style);
	} catch (error) {
		const container = document.querySelector(".container");

		container.textContent = error;
	}
});

window.addEventListener("onEventReceived", obj => {
	const listener = obj.detail.listener;

	if (
		![
			"follower-latest",
			"subscriber-latest",
			"cheer-latest",
			"tip-latest",
			"host-latest",
			"raid-latest",
		].includes(listener)
	)
		return;

	const event = obj.detail.event;

	const { events, settings } = apiData;

	if (!events[event.type].active) return;

	const container = document.querySelector(".container");

	container.classList.add(event.type);

	setTimeout(() => {
		container.classList.remove(event.type);
	}, settings.alertDuration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				direction: "vertical",
				server: "la2",
				queue: "RANKED_TFT",
				summonerName: "valaxor",
				apiKey: "RGAPI-71742c40-9463-4a69-ae86-fa4dc0655125",
				refreshRate: 5,
				api: "https://us-central1-valbot-beta.cloudfunctions.net/widget",
			},
		},
	})
);
