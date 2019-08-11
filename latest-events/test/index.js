let fieldData;

const cycle = (index = 0) => {
	const events = document.querySelectorAll(".event");

	const currentElement = events.item(index);
	const previousElement = document.querySelector(".showing");
	const hiddenElement = document.querySelector(".leaving");

	currentElement.classList.add("showing");
	currentElement.classList.remove("hiding");

	if (previousElement) {
		previousElement.classList.add("leaving");
		previousElement.classList.remove("showing");
	}

	if (hiddenElement) {
		hiddenElement.classList.add("hiding");
		hiddenElement.classList.remove("leaving");
	}

	const nextIndex = index + 1 >= events.length ? 0 : index + 1;

	return setTimeout(cycle, fieldData.time * 1000, nextIndex);
};

window.addEventListener("onWidgetLoad", async obj => {
	fieldData = obj.detail.fieldData;

	const recents = obj.detail.recents.sort(
		(a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
	);

	const events = recents.reduce((obj, event) => {
		if (
			!["follower", "subscriber", "cheer", "tip", "host", "raid"].includes(
				event.type
			)
		)
			return obj;

		if (obj[event.type]) return obj;

		switch (event.type) {
			case "cheer":
			case "tip":
			case "host":
			case "raid": {
				if (
					fieldData[event.type] === "yes" &&
					fieldData[`${event.type}Min`] <= event.amount
				) {
					obj[event.type] = event;
				}

				break;
			}

			default: {
				if (fieldData[event.type] === "yes") {
					obj[event.type] = event;
				}

				break;
			}
		}

		return obj;
	}, {});

	Object.values(events).forEach(event => {
		let size = fieldData.fontSize;

		const container = document.querySelector(".container");

		const eventContainer = document.createElement("div");
		eventContainer.classList.add("event");
		eventContainer.classList.add(fieldData.direction);
		eventContainer.classList.add("hiding");
		eventContainer.id = event.type;
		container.appendChild(eventContainer);

		const image = document.createElement("img");
		image.classList.add("icon");
		image.src = fieldData[`${event.type}Icon`];
		eventContainer.appendChild(image);

		const name = document.createElement("div");
		name.classList.add("text");
		name.textContent = event.name;
		eventContainer.appendChild(name);

		if (fieldData.direction === "vertical") {
			while (
				name.clientWidth > container.clientWidth - fieldData.gapSize &&
				size > fieldData.minFontSize
			) {
				size = size - 1;
				name.style.fontSize = `${size}px`;
			}
		}

		if (event.amount) {
			const amount = document.createElement("div");
			amount.classList.add("amount");
			amount.classList.add("highlight");

			switch (event.type) {
				case "subscriber": {
					amount.textContent = `x${event.amount}`;
					break;
				}
				case "tip": {
					amount.textContent = fieldData.tipSymbol + event.amount;
					break;
				}
				default: {
					amount.textContent = event.amount;
					break;
				}
			}

			eventContainer.appendChild(amount);
		}
	});

	cycle();

	if (!fieldData.colorsApi) return;

	colors = await fetch(fieldData.colorsApi)
		.then(data => data.json())
		.catch(error => console.log(error));

	const css = Object.entries(colors).reduce((cssString, [event, color]) => {
		const eventClass = event === "default" ? "" : `.${event}`;

		return `${cssString}
		
			${eventClass} * {
				color: ${color.text};
			}
			
			${eventClass} .highlight {
				color: ${color.highlight};
			}`;
	}, "");

	const style = document.createElement("style");
	style.type = "text/css";
	style.appendChild(document.createTextNode(css));

	const head = document.querySelector("head");
	head.appendChild(style);
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

	if (fieldData[event.type] !== "yes") return;

	if (
		["cheer", "tip", "host", "raid"].includes(event.type) &&
		fieldData[`${event.type}Min`] > event.amount
	)
		return;

	if (event.type === "subscriber" && event.isCommunityGift) return;

	if (event.type === "host" && event.isRaid) return;

	let size = fieldData.fontSize;

	const container = document.querySelector(".container");

	const text = document.querySelector(`#${event.type} > .text`);

	if (event.gifted) {
		text.textContent = event.sender;
	} else {
		text.textContent = event.name;
	}
	text.style.fontSize = `${size}px`;

	while (
		text.clientWidth > container.clientWidth - fieldData.gapSize &&
		size > fieldData.minFontSize
	) {
		size = size - 1;
		text.style.fontSize = `${size}px`;
	}

	const amount = document.querySelector(`#${event.type} > .amount`);

	if (!amount) return;

	switch (event.type) {
		case "subscriber": {
			if (event.bulkGifted) {
				amount.textContent = `gift x${event.count}`;
			} else if (event.gifted) {
				amount.textContent = "gift x1";
			} else {
				amount.textContent = `x${event.amount}`;
			}
			break;
		}
		case "tip": {
			amount.textContent = fieldData.tipSymbol + event.amount;
			break;
		}
		default: {
			amount.textContent = event.amount;
			break;
		}
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

	if (fieldData[event.type] !== "yes") return;

	const container = document.querySelector(".container");

	container.classList.add(event.type);

	setTimeout(() => {
		container.classList.remove(event.type);
	}, fieldData.colorDuration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				direction: "vertical",
				time: 3,
				fontSize: 40,
				minFontSize: 10,
				gapSize: 10,
				tipSymbol: "$",
				colorsApi:
					"https://us-central1-valbot-beta.cloudfunctions.net/colorSchemes",
				colorDuration: 3,
				follower: "yes",
				followerIcon: "https://i.imgur.com/3EZQo3S.png",
				subscriber: "yes",
				subscriberIcon: "https://i.imgur.com/1SU07Xe.png",
				cheer: "yes",
				cheerMin: 1,
				cheerIcon: "https://i.imgur.com/FI6eR0l.png",
				tip: "yes",
				tipMin: 1,
				host: "yes",
				hostMin: 1,
				raid: "yes",
				raidMin: 1,
			},
			recents: [
				{ type: "follower", name: "fjsakdlfsaldafjksadjfl" },
				{ type: "subscriber", name: "webs2d", amount: 2 },
				{ type: "cheer", name: "Etchy", amount: 2 },
			],
		},
	})
);
