let fieldData;

window.addEventListener("onWidgetLoad", obj => {
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
