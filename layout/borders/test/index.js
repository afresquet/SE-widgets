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

		if (fieldData.splits === "yes") {
			const splitsDivider = document.createElement("div");
			splitsDivider.classList.add("divider");
			splitsDivider.classList.add("splits");
			horizontalSegment.append(splitsDivider);

			for (let i = 0; i < fieldData.splitsDividers; i++) {
				const splitDivider = document.createElement("div");
				splitDivider.classList.add("split-divider");
				splitsDivider.append(splitDivider);
			}
		}
		fieldData.verticalDividers.split(/\s+/).forEach(pos => {
			const verticalDivider = document.createElement("div");
			verticalDivider.classList.add("divider");
			verticalDivider.classList.add("vertical-divider");
			verticalDivider.style = `top: calc(${pos}% - var(--border-width));`;
			verticalSegment.append(verticalDivider);
		});
		fieldData.horizontalDividers.split(/\s+/).forEach(pos => {
			const horizontalDivider = document.createElement("div");
			horizontalDivider.classList.add("divider");
			horizontalDivider.classList.add("horizontal-divider");
			horizontalDivider.style = `left: calc(${pos}% - var(--border-width));`;
			horizontalSegment.append(horizontalDivider);
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

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				webcamPosition: "topleft",
				api: "https://us-central1-valbot-beta.cloudfunctions.net/widget",
				splits: "no",
				splitsDividers: 2,
				horizontalDividers: "20 40 60 80",
				verticalDividers: "25 50 75",
			},
		},
	})
);
