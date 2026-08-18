let autocorrect = false;

function inputId(item) {
	return `${item.id}_${item.answer}`;
}

function setAutocorrect() {
	const checkbox = document.getElementById("enableAutocorrect");
	const checkButton = document.getElementById("checkAnswers");
	if (checkbox.checked) {
		autocorrect = true;
		checkButton.style.backgroundColor = "gray";
		checkAll();
	} else {
		autocorrect = false;
		checkButton.style.backgroundColor = "#0061c6";
	}
}

function renderAnswerInputs() {
	const radius = 50;

	for (const item of mapQuizItems) {
		const vorElement = document.getElementById(item.id);
		if (!vorElement) continue;
		const coords = getCoords(vorElement);

		const node = document.createElement("input");
		node.style.position = "absolute";
		node.id = inputId(item);
		node.dataset.answer = item.answer;
		node.className = "vorDegree";
		node.addEventListener('keyup', function () { doInput(this); });

		if (item.type === "label" || item.type === "airway") {
			node.setAttribute('placeholder', item.type === "airway" ? "V00" : "ABC");
			node.setAttribute("type", "text");
			node.setAttribute("spellcheck", "false");
			node.setAttribute("class", "labelText");
			node.style.textAlign = "center";
			node.style.left = coords.left;
			node.style.top = coords.top - 15;
		} else if (item.type === "vorDegree") {
			const deg = parseInt(item.answer);
			node.setAttribute('type', 'tel');
			node.setAttribute('inputmode', 'numeric');
			node.setAttribute('placeholder', "000");
			if (deg < 180) {
				node.style.transform = `rotate(${deg - 90}deg)`;
			} else {
				node.style.transform = `rotate(${deg - 270}deg)`;
				node.style.textAlign = "right";
			}
			node.style.left = coords.left + (Math.sin(deg * (Math.PI / 180)) * radius);
			node.style.top = coords.top - (Math.cos(deg * (Math.PI / 180)) * radius);
		} else if (item.type === "boundary") {
			const rotation = vorElement.getAttribute("transform");
			if (rotation !== null) {
				node.style.transform = rotation.substring(0, rotation.length - 1) + "deg)";
			}
			node.setAttribute('placeholder', "00");
			node.setAttribute('type', 'tel');
			node.setAttribute('inputmode', 'numeric');
			node.style.textAlign = "center";
			node.style.left = coords.left;
			node.style.top = coords.top;
		}

		document.getElementById("labels").appendChild(node);

		const placed = document.getElementById(node.id);
		node.style.left = parseFloat(node.style.left) - (placed.offsetWidth / 2);
		node.style.top = parseFloat(node.style.top) - (placed.offsetHeight / 2);
	}
}

function fillBoxes() {
	for (const item of mapQuizItems) {
		const ele = document.getElementById(inputId(item));
		ele.style.color = "black";
		ele.disabled = false;
		ele.defaultValue = item.answer;
		ele.value = item.answer;
	}
}

function hintBoxes() {
	for (const item of mapQuizItems) {
		const ele = document.getElementById(inputId(item));
		if (ele.value === "") {
			ele.defaultValue = item.answer.substring(0, 1);
			ele.value = item.answer.substring(0, 1);
		}
	}
}

function clearBoxes() {
	for (const item of mapQuizItems) {
		const ele = document.getElementById(inputId(item));
		ele.defaultValue = "";
		ele.style.color = "black";
		ele.style.background = "transparent";
		ele.disabled = false;
		ele.value = "";
	}
}

function getCoords(elem) {
	const box = elem.getBoundingClientRect();
	return {
		top: box.top + box.height / 2,
		left: box.left + box.width / 2
	};
}

function doInput(ele) {
	if (autocorrect) {
		checkBoxes(ele);
	}
}

function checkAll() {
	for (const item of mapQuizItems) {
		checkBoxes(document.getElementById(inputId(item)));
	}
}

function toggleSectors() {
	const sectors = document.getElementById("sectors");
	sectors.style.display = sectors.style.display === "none" ? "block" : "none";
}

function checkBoxes(ele) {
	const answer = ele.dataset.answer.toUpperCase();
	ele.value = ele.value.toUpperCase();
	const input = ele.value;

	if (answer.startsWith(input)) {
		ele.style.color = "black";
		ele.style.background = "transparent";
	} else {
		ele.style.color = "red";
		ele.style.background = "rgba(255,255,0, .5)";
	}
	if (answer === input) {
		ele.disabled = true;
		ele.style.color = "#055a00";
	}
}
