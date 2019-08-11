let fieldData;
let colors;

window.addEventListener("onWidgetLoad", async obj => {
	fieldData = obj.detail.fieldData;

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

	if (!fieldData.fetchColors) return;

	colors = await fetch(fieldData.colorsApi)
		.then(data => data.json())
		.catch(error => console.log(error));

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

	const layout = document.querySelector(".layout");

	layout.classList.add(event.type);

	setTimeout(() => {
		layout.classList.remove(event.type);
	}, fieldData.duration * 1000);
});

window.dispatchEvent(
	new CustomEvent("onWidgetLoad", {
		detail: {
			fieldData: {
				webcamPosition: "topleft",
				duration: 5,
				horizontalDividers: 4,
				verticalDividers: 3,
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
