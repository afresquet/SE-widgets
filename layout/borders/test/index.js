let fieldData;
let apiData;

window.addEventListener("onWidgetLoad", async obj => {
	try {
		fieldData = obj.detail.fieldData;

		apiData = await fetch(
			`${fieldData.api}?colors=true&events=true&settings=true`
		).then(data => data.json());

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

		const { colors } = apiData;

		const css = Object.entries(colors).reduce((cssString, [event, color]) => {
			const eventClass = event === "default" ? "" : `.${event}`;

			return `${cssString}
		
			${eventClass} * {
				border-color: ${color.highlight};
			}`;
		}, "");

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
	}, settings.layout.alertDuration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				webcamPosition: "topleft",
				api: "https://us-central1-valbot-beta.cloudfunctions.net/widget",
				horizontalDividers: 4,
				verticalDividers: 3,
			},
		},
	})
);
