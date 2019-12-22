let fieldData;
let apiData;

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		apiData = await fetch(fieldData.api).then(data => data.json());

		const { events, settings } = apiData;

		const css = Object.entries(events).reduce(
			(cssString, [eventName, event]) => `${cssString}
		
			.${eventName} * {
				border-color: ${event.colors.secondary};
			}`,
			`* {
				border-color: ${settings.colors.default.secondary};
			}`
		);

		const style = document.createElement("style");
		style.type = "text/css";
		style.appendChild(document.createTextNode(css));

		const head = document.querySelector("head");
		head.appendChild(style);
	} catch (error) {
		const container = document.querySelector(".layout");

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

	const layout = document.querySelector(".layout");

	layout.classList.add(event.type);

	setTimeout(() => {
		layout.classList.remove(event.type);
	}, settings.alertDuration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				api: "https://us-central1-valbot-beta.cloudfunctions.net/widget",
			},
		},
	})
);
