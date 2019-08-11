let fieldData;
let colors;

window.addEventListener("onWidgetLoad", async obj => {
	fieldData = obj.detail.fieldData;

	if (!fieldData.fetchColors) return;

	colors = await fetch(fieldData.colorsApi)
		.then(data => data.json())
		.catch(error => console.log(error));

	const css = Object.entries(colors).reduce((cssString, [event, color]) => {
		const eventClass = event === "default" ? ".background" : `.${event}`;

		return `${cssString}
		
			${eventClass} {
				background-color: ${color.background};
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

	const background = document.querySelector(".background");

	background.classList.add(event.type);

	setTimeout(() => {
		background.classList.remove(event.type);
	}, fieldData.duration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				duration: 5,
				fetchColors: "yes",
				colorsApi:
					"https://us-central1-valbot-beta.cloudfunctions.net/colorSchemes",
				follower: "yes",
				subscriber: "yes",
				cheer: "yes",
				tip: "yes",
				host: "yes",
				raid: "yes",
			},
		},
	})
);
