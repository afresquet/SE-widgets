let fieldData;

window.addEventListener("onWidgetLoad", obj => {
	fieldData = obj.detail.fieldData;
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
