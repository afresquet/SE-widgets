let fieldData;

const cycle = (index = 0) => {
	const socials = document.querySelectorAll(".social");
	const icons = document.querySelectorAll(".icon");

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
	fieldData = obj.detail.fieldData;

	const data = await fetch(fieldData.socialsApi)
		.then(data => data.json())
		.catch(error => console.log(error));

	const values = Object.entries(data).map(([name, social]) => ({
		...social,
		name,
	}));

	const container = document.querySelector(".container");
	container.classList.add(fieldData.direction);

	const socials = document.createElement("div");
	socials.classList.add("socials");

	const icons = document.createElement("div");
	icons.classList.add("icons");

	values.forEach(value => {
		const text = document.createElement("div");
		text.classList.add("social");
		text.classList.add("highlight");
		text.classList.add("hiding");
		text.innerText = value.name;
		socials.appendChild(text);
	});

	values.forEach(value => {
		const icon = document.createElement("div");
		icon.classList.add("icon");
		icon.classList.add("highlight");
		icon.classList.add("hiding");
		icon.style = `-webkit-mask-image: url(${value.icon});`;
		icons.appendChild(icon);
	});

	container.prepend(socials);
	if (fieldData.direction === "vertical") {
		container.prepend(icons);
	} else if (fieldData.direction === "horizontal") {
		container.append(icons);
	}

	cycle();

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
