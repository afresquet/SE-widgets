let fieldData;
let apiData;

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		apiData = await fetch(fieldData.api).then(data => data.json());

		const { events, settings } = apiData;

		const webcam = document.querySelector(".webcam");
		const display = document.querySelector(".display");
		const horizontalSegment = document.querySelector(".horizontal-segment");
		const verticalSegment = document.querySelector(".vertical-segment");

		switch (fieldData.webcamPosition) {
			case "topleft": {
				webcam.classList.add("topleft");
				display.classList.add("bottomright");
				horizontalSegment.classList.add("topright");
				verticalSegment.classList.add("bottomleft");
				break;
			}
			case "topright": {
				webcam.classList.add("topright");
				display.classList.add("bottomleft");
				horizontalSegment.classList.add("topleft");
				verticalSegment.classList.add("bottomright");
				break;
			}
			case "bottomright": {
				webcam.classList.add("bottomright");
				display.classList.add("topleft");
				horizontalSegment.classList.add("bottomleft");
				verticalSegment.classList.add("topright");
				break;
			}
			case "bottomleft": {
				webcam.classList.add("bottomleft");
				display.classList.add("topright");
				horizontalSegment.classList.add("bottomright");
				verticalSegment.classList.add("topleft");
				break;
			}

			default:
				break;
		}

		const horizontalDividers = document.querySelectorAll(".horizontal-divider");
		horizontalDividers.forEach((divider, index) => {
			if (index + 1 > fieldData.horizontalDividers) return;

			divider.classList.remove("hide");
		});
		const verticalDividers = document.querySelectorAll(".vertical-divider");
		verticalDividers.forEach((divider, index) => {
			if (index + 1 > fieldData.verticalDividers) return;

			divider.classList.remove("hide");
		});

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
