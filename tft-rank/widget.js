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

let fieldData = {};
let id = "";

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

	let text = document.querySelector(".text");
	if (!text) {
		text = document.createElement("div");
		text.classList.add("text");
		container.append(text);
	}

	let rank = document.querySelector(".rank");
	if (!rank) {
		rank = document.createElement("div");
		rank.classList.add("rank");
		text.append(rank);
	}
	rank.textContent = ["MASTER", "GRANDMASTER", "CHALLENGER"].includes(data.tier)
		? data.tier
		: `${data.tier} ${data.rank}`;

	let points = document.querySelector(".points");
	if (!points) {
		points = document.createElement("div");
		points.classList.add("points");
		text.append(points);
	}
	points.textContent = `${data.leaguePoints} LP`;

	return setTimeout(refreshRankData, fieldData.refreshRate * 60 * 1000);
};

window.addEventListener("onWidgetLoad", async obj => {
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
});
