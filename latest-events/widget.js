let fieldData = {};

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

window.addEventListener("onWidgetLoad", obj => {
	fieldData = obj.detail.fieldData;

	const recents = obj.detail.recents.sort(
		(a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt)
	);

	const events = {};

	recents.forEach(event => {
		if (
			!["follower", "subscriber", "cheer", "tip", "host", "raid"].includes(
				event.type
			)
		)
			return;

		if (events[event.type]) return;

		switch (event.type) {
			case "cheer":
			case "tip":
			case "host":
			case "raid": {
				if (
					fieldData[event.type] === "yes" &&
					fieldData[`${event.type}Min`] <= event.amount
				) {
					events[event.type] = event;
				}

				break;
			}

			default: {
				if (fieldData[event.type] === "yes") {
					events[event.type] = event;
				}

				break;
			}
		}
	});

	Object.values(events).forEach(event => {
		let size = fieldData.fontSize;

		const container = document.querySelector(".container");

		const eventContainer = document.createElement("div");
		eventContainer.classList.add("event");
		eventContainer.classList.add("hiding");
		eventContainer.id = event.type;
		container.appendChild(eventContainer);

		const image = document.createElement("img");
		image.classList.add("icon");
		image.src = fieldData[`${event.type}Icon`];
		eventContainer.appendChild(image);

		const name = document.createElement("div");
		name.classList.add("text");
		name.innerText = event.name;
		name.style.fontSize = `${size}px`;
		eventContainer.appendChild(name);
		while (
			name.clientWidth > container.clientWidth - fieldData.gapSize &&
			size > fieldData.minFontSize
		) {
			size = size - 1;
			name.style.fontSize = `${size}px`;
		}

		if (event.amount) {
			const amount = document.createElement("div");
			amount.classList.add("amount");

			switch (event.type) {
				case "subscriber": {
					amount.innerText = `x${event.amount}`;
					break;
				}
				case "tip": {
					amount.innerText = fieldData.tipSymbol + event.amount;
					break;
				}
				default: {
					amount.innerText = event.amount;
					break;
				}
			}

			eventContainer.appendChild(amount);
		}
	});

	cycle();
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

	let size = fieldData.fontSize;

	const container = document.querySelector(".container");

	const text = document.querySelector(`#${event.type} > .text`);

	if (event.gifted) {
		text.innerText = event.sender;
	} else {
		text.innerText = event.name;
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
				amount.innerText = `gift x${event.count}`;
			} else if (event.gifted) {
				amount.innerText = "gift x1";
			} else {
				amount.innerText = `x${event.amount}`;
			}
			break;
		}
		case "tip": {
			amount.innerText = fieldData.tipSymbol + event.amount;
			break;
		}
		default: {
			amount.innerText = event.amount;
			break;
		}
	}
});
