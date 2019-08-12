let fieldData;
let apiData;

const cycle = (index = 0) => {
	const events = document.querySelectorAll(".event");

	if (!events.length)
		return setTimeout(cycle, fieldData.cycleDuration * 1000, index);

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

	return setTimeout(cycle, fieldData.cycleDuration * 1000, nextIndex);
};

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		cycle();

		apiData = await fetch(
			`${fieldData.api}?colors=true&events=true&settings=true`
		).then(data => data.json());

		const { events, colors } = apiData;

		const recents = obj.detail.recents.sort(
			(a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
		);

		const recentEvents = recents.reduce((obj, event) => {
			if (!events[event.type].active || obj[event.type]) return obj;

			switch (event.type) {
				case "cheer":
				case "tip":
				case "host":
				case "raid": {
					if (events[event.type].min <= event.amount) {
						obj[event.type] = event;
					}

					break;
				}

				default: {
					obj[event.type] = event;

					break;
				}
			}

			return obj;
		}, {});

		Object.values(recentEvents).forEach((event, i) => {
			let size = fieldData.fontSize;

			const container = document.querySelector(".container");

			const eventContainer = document.createElement("div");
			eventContainer.classList.add("event");
			eventContainer.classList.add(fieldData.direction);
			if (i > 0) eventContainer.classList.add("hiding");
			eventContainer.id = event.type;
			container.appendChild(eventContainer);

			const icon = document.createElement("div");
			icon.classList.add("icon");
			icon.classList.add("highlight");
			icon.style = `-webkit-mask-image: url(${events[event.type].icon});`;
			eventContainer.appendChild(icon);

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

		const css = Object.entries(colors).reduce((cssString, [event, color]) => {
			const eventClass = event === "default" ? "" : `.${event}`;

			return `${cssString}
		
			${eventClass} * {
				color: ${color.text};
			}
			
			${eventClass} .highlight {
				color: ${color.highlight};
			}
			
			${eventClass} .icon {
				background-color: ${color.highlight};
			}`;
		}, "");

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

	const { events } = apiData;

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

	if (!events[event.type].active) return;

	if (
		["cheer", "tip", "host", "raid"].includes(event.type) &&
		events[event.type].min > event.amount
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

	const { events } = apiData;

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

	if (!events[event.type].active) return;

	const container = document.querySelector(".container");

	container.classList.add(event.type);

	setTimeout(() => {
		container.classList.remove(event.type);
	}, apiData.settings.layout.alertDuration * 1000);
});
