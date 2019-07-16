let fieldData = {};
const values = [
	{
		name: "twitter",
		icon: "https://i.imgur.com/lMqnUHv.png",
	},
	{
		name: "discord",
		icon: "https://i.imgur.com/jPUg41N.png",
	},
	{
		name: "youtube",
		icon: "https://i.imgur.com/ygZnhRj.png",
	},
	{
		name: "twitch",
		icon: "https://i.imgur.com/Y11InnC.png",
	},
];

const cycle = (index = 0) => {
	const socials = document.querySelectorAll(".social");

	const currentElement = socials.item(index);
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

	const nextIndex = index + 1 >= socials.length ? 0 : index + 1;

	return setTimeout(cycle, fieldData.time * 1000, nextIndex);
};

window.addEventListener("onWidgetLoad", obj => {
	fieldData = obj.detail.fieldData;

	const container = document.querySelector(".container");

	const socials = document.createElement("div");
	socials.classList.add("socials");

	const elements = values.map(value => {
		const social = document.createElement("div");
		social.classList.add("social");
		social.classList.add("hiding");
		social.id = value.name;

		const icon = document.createElement("img");
		icon.classList.add("icon");
		icon.src = value.icon;
		social.appendChild(icon);

		const text = document.createElement("div");
		text.classList.add("text");
		console.log(text.classList);
		text.innerText = value.name;
		social.appendChild(text);

		return social;
	});

	elements.forEach(element => socials.append(element));

	container.prepend(socials);

	const heigth = elements.reduce(
		(height, element) => height + element.clientHeight,
		0
	);
	socials.style.height = `${heigth / elements.length}px`;

	cycle();
});
