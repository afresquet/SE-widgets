let fieldData;
let apiData;

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		apiData = await fetch(
			`${fieldData.api}?events=true&colors=true&settings=true`
		).then(data => data.json());

		const { colors } = apiData;

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
	} catch (error) {
		const container = document.querySelector(".background");

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

	const { events, settings } = apiData;

	const event = obj.detail.event;

	if (!events[event.type].active) return;

	const background = document.querySelector(".background");

	background.classList.add(event.type);

	setTimeout(() => {
		background.classList.remove(event.type);
	}, settings.layout.alertDuration * 1000);
});
