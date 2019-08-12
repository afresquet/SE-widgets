let fieldData;
let apiData;

const cycle = (index = 0) => {
	const socials = document.querySelectorAll(".social");
	const icons = document.querySelectorAll(".icon");

	if (!socials.length || !icons.length)
		return setTimeout(cycle, fieldData.cycleDuration * 1000, index);

	const currentSocial = socials.item(index);
	const previousSocial = document.querySelector(".social.showing");
	const hiddenSocial = document.querySelector(".social.leaving");
	const currentIcon = icons.item(index);
	const previousIcon = document.querySelector(".icon.showing");
	const hiddenIcon = document.querySelector(".icon.leaving");

	currentSocial.classList.add("showing");
	currentSocial.classList.remove("hiding");
	currentIcon.classList.add("showing");
	currentIcon.classList.remove("hiding");

	if (previousSocial) {
		previousSocial.classList.add("leaving");
		previousSocial.classList.remove("showing");
	}
	if (previousIcon) {
		previousIcon.classList.add("leaving");
		previousIcon.classList.remove("showing");
	}

	if (hiddenSocial) {
		hiddenSocial.classList.add("hiding");
		hiddenSocial.classList.remove("leaving");
	}
	if (hiddenIcon) {
		hiddenIcon.classList.add("hiding");
		hiddenIcon.classList.remove("leaving");
	}

	const nextIndex = index + 1 >= socials.length ? 0 : index + 1;

	return setTimeout(cycle, fieldData.cycleDuration * 1000, nextIndex);
};

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		cycle();

		apiData = await fetch(
			`${fieldData.api}?socials=true&colors=true&events=true&settings=true`
		).then(data => data.json());

		const { socials, colors } = apiData;

		const values = Object.entries(socials).map(([name, social]) => ({
			...social,
			name,
		}));

		const container = document.querySelector(".container");
		container.classList.add(fieldData.direction);

		const socialsContainer = document.createElement("div");
		socialsContainer.classList.add("socials");

		const iconsContainer = document.createElement("div");
		iconsContainer.classList.add("icons");

		values.forEach((value, i) => {
			const text = document.createElement("div");
			text.classList.add("social");
			text.classList.add("highlight");
			if (i > 0) text.classList.add("hiding");
			text.innerText = value.name;
			socialsContainer.appendChild(text);
		});

		values.forEach((value, i) => {
			const icon = document.createElement("div");
			icon.classList.add("icon");
			icon.classList.add("highlight");
			if (i > 0) icon.classList.add("hiding");
			icon.style = `-webkit-mask-image: url(${value.icon});`;
			iconsContainer.appendChild(icon);
		});

		container.prepend(socialsContainer);
		if (fieldData.direction === "vertical") {
			container.prepend(iconsContainer);
		} else if (fieldData.direction === "horizontal") {
			container.append(iconsContainer);
		}

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
	}, settings.layout.alertDuration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				direction: "horizontal",
				api: "https://us-central1-valbot-beta.cloudfunctions.net/widget",
				cycleDuration: 5,
			},
		},
	})
);
