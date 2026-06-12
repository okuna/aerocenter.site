const vorArray = [
	{ id: "vorMHZ", answer: "MHZ" },
	{ id: "vorMHZ", answer: "005" },
	{ id: "vorMHZ", answer: "049" },
	{ id: "vorMHZ", answer: "091" },
	{ id: "vorMHZ", answer: "106" },
	{ id: "vorMHZ", answer: "129" },
	{ id: "vorMHZ", answer: "164" },
	{ id: "vorMHZ", answer: "179" },
	{ id: "vorMHZ", answer: "194" },
	{ id: "vorMHZ", answer: "223" },
	{ id: "vorMHZ", answer: "251" },
	{ id: "vorMHZ", answer: "266" },
	{ id: "vorMHZ", answer: "281" },
	{ id: "vorMHZ", answer: "300" },
	{ id: "vorMHZ", answer: "320" },
	{ id: "vorMHZ", answer: "335" },
	{ id: "vorMHZ", answer: "350" },
	{ id: "vorMLU", answer: "MLU" },
	{ id: "vorMLU", answer: "072" },
	{ id: "vorMLU", answer: "087" },
	{ id: "vorMLU", answer: "102" },
	{ id: "vorSQS", answer: "SQS" },
	{ id: "vorSQS", answer: "007" },
	{ id: "vorSQS", answer: "023" },
	{ id: "vorSQS", answer: "086" },
	{ id: "vorSQS", answer: "156" },
	{ id: "vorSQS", answer: "171" },
	{ id: "vorSQS", answer: "186" },
	{ id: "vorSQS", answer: "256" },
	{ id: "vorSQS", answer: "273" },
	{ id: "vorSQS", answer: "341" },
	{ id: "vorIGB", answer: "IGB" },
	{ id: "vorIGB", answer: "231" },
	{ id: "vorIGB", answer: "266" },
	{ id: "vorMEI", answer: "MEI" },
	{ id: "vorMEI", answer: "272" },
	{ id: "vorMEI", answer: "257" },
	{ id: "vorMCB", answer: "MCB" },
	{ id: "vorMCB", answer: "001" },
	{ id: "vorMCB", answer: "016" },
	{ id: "vorMCB", answer: "345" },
	{ id: "vorGLH", answer: "GLH" },
	{ id: "vorGLH", answer: "092" },
	{ id: "vorGLH", answer: "143" },
	{ id: "vorHEZ", answer: "HEZ" },
	{ id: "vorHEZ", answer: "026" },
	{ id: "vorHEZ", answer: "044" },
	{ id: "ubaby", answer: "UBABY" },
	{ id: "deske", answer: "DESKE" },
	{ id: "yazoo", answer: "YAZOO" },
	{ id: "kgwo", answer: "KGWO" },
	{ id: "hater", answer: "HATER" },
	{ id: "arguw", answer: "ARGUW" },
	{ id: "stuee", answer: "STUEE" },
	{ id: "dinky", answer: "DINKY" },
	{ id: "hedud", answer: "HEDUD" },
	{ id: "dorts", answer: "DORTS" },
	{ id: "barne", answer: "BARNE" },
	{ id: "hazal", answer: "HAZAL" },
	{ id: "ricks", answer: "RICKS" },
	{ id: "mizze", answer: "MIZZE" },
	{ id: "zamma", answer: "ZAMMA" },
	{ id: "boosi", answer: "BOOSI" },
	{ id: "kjan", answer: "KJAN" },
	{ id: "khks", answer: "KHKS" },
	{ id: "kjvw", answer: "KJVW" },
	{ id: "kvks", answer: "KVKS" },
	{ id: "ble", answer: "BLE" },
	{ id: "0m8", answer: "0M8" },
	{ id: "ktvr", answer: "KTVR" },
	{ id: "v427-14", answer: "14" },
	{ id: "v18-15", answer: "15" },
	{ id: "mluv417-16", answer: "16" },
	{ id: "v427-31", answer: "31" },
	{ id: "v18-31", answer: "31" },
	{ id: "v417-31", answer: "31" },
	{ id: "v245-20", answer: "20" },
	{ id: "v417-20", answer: "20" },
	{ id: "v18-19", answer: "19" },
	{ id: "v427-18", answer: "18" },
	{ id: "path3236", answer: "20" },
	{ id: "path5096", answer: "26" },
	{ id: "path3214", answer: "21" },
	{ id: "path3216", answer: "21" },
	{ id: "path3220", answer: "33" },
	{ id: "path3222", answer: "35" },
	{ id: "path3224", answer: "35" },
	{ id: "path3226", answer: "16" },
	{ id: "path3228", answer: "12" },
	{ id: "path3230", answer: "12" },
	{ id: "path3232", answer: "14" },
	{ id: "path3234", answer: "17" },
	{ id: "path3238", answer: "17" },
	{ id: "path3240", answer: "17" },
	{ id: "path3242", answer: "24" },
	{ id: "path3244", answer: "23" },
	{ id: "path3246", answer: "25" },
	{ id: "path3248", answer: "13" },
	{ id: "path3250", answer: "14" },
	{ id: "path3252", answer: "26" },
	{ id: "path3218", answer: "21" },
	{ id: "path4503", answer: "V9" },
	{ id: "path4479", answer: "V9-11" },
	{ id: "path311", answer: "V9" },
	{ id: "path4495", answer: "V11" },
	{ id: "path315", answer: "V11" },
	{ id: "path4465", answer: "V18" },
	{ id: "path4830", answer: "V74" },
	{ id: "path4489", answer: "V245" },
	{ id: "path4511", answer: "V245" },
	{ id: "v417", answer: "V417" },
	{ id: "path4469", answer: "V417" },
	{ id: "path4471", answer: "V417" },
	{ id: "path4461", answer: "V427" },
	{ id: "path4459", answer: "V427" },
	{ id: "path4505", answer: "V555" },
	{ id: "path4483", answer: "V555" },
	{ id: "path4499", answer: "V557" },
	{ id: "path4475", answer: "V557" },
	{ id: "path313", answer: "V535" },
	{ id: "path2789", answer: "V278" },
	{ id: "path4485", answer: "V278" },
	{ id: "path4491", answer: "V18" },
	{ id: "rect12239", answer: "75" },
	{ id: "rect12241", answer: "72" },
	{ id: "rect12243", answer: "75" },
	{ id: "rect12245", answer: "120" },
	{ id: "rect12247", answer: "72" },
	{ id: "rect12249", answer: "70" },
	{ id: "rect12251", answer: "102" },
	{ id: "rect12253", answer: "60" },
	{ id: "rect12255", answer: "58" },
	{ id: "rect12257", answer: "60" },
	{ id: "rect12259", answer: "74" },
	{ id: "rect12233", answer: "98" },
	{ id: "rect12231", answer: "95" },
	{ id: "rect12235", answer: "98" },
	{ id: "rect12237", answer: "79" },
	{ id: "rect12261", answer: "36" },
	{ id: "rect12269", answer: "69" },
	{ id: "rect12267", answer: "92" },
	{ id: "rect12265", answer: "87" },
	{ id: "rect12263", answer: "88" },
	{ id: "path4990", answer: "TKH" },
	{ id: "rect13117", answer: "19" },
	{ id: "rect13131", answer: "12" },
	{ id: "rect13133", answer: "49" },
	{ id: "rect13135", answer: "49" },
	{ id: "rect13137", answer: "41" },
	{ id: "rect3745", answer: "23" },
	{ id: "rect13139", answer: "49" },
	{ id: "rect13141", answer: "49" },
	{ id: "rect13143", answer: "26" },
	{ id: "rect13145", answer: "53" },
	{ id: "rect13147", answer: "37" },
	{ id: "rect13149", answer: "38" },
	{ id: "rect13151", answer: "37" },
	{ id: "rect13153", answer: "38" },
	{ id: "rect13155", answer: "58" },
	{ id: "rect13157", answer: "62" },
	{ id: "rect13159", answer: "46" },
	{ id: "rect13161", answer: "56" },
	{ id: "rect13163", answer: "44" },
	{ id: "rect13165", answer: "30" },
	{ id: "rect13167", answer: "30" },
	{ id: "rect13169", answer: "16" },
	{ id: "rect13171", answer: "42" },
	{ id: "rect13173", answer: "16" },
	{ id: "rect13177", answer: "26" },
	{ id: "rect13179", answer: "48" },
	{ id: "rect13181", answer: "23" },
	{ id: "rect13183", answer: "64" },
	{ id: "rect3763", answer: "42" },
	{ id: "rect3800", answer: "5000" },
];

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

function addInput() {
	const radius = 50;

	for (const item of vorArray) {
		const vorElement = document.getElementById(item.id);
		if (!vorElement) continue;
		const coords = getCoords(vorElement);
		const vorDegree = parseInt(item.answer);

		const node = document.createElement("input");
		node.style.position = "absolute";
		node.id = inputId(item);
		node.dataset.answer = item.answer;
		node.className = "vorDegree";
		node.addEventListener('keyup', function () { doInput(this); });

		// airports, NAVAIDs, intersections
		if (isNaN(vorDegree) || item.id === "ble" || item.id === "0m8") {
			node.setAttribute('placeholder', "ABC");
			node.setAttribute("type", "text");
			// airway names starting with V
			if (item.answer.substring(0, 1) === "V") {
				node.setAttribute('placeholder', "V00");
			}
			node.setAttribute("spellcheck", "false");
			node.setAttribute("class", "labelText");
			node.style.textAlign = "center";
			node.style.left = coords.left;
			node.style.top = coords.top - 15;
		}
		// degrees around VOR circle
		else if (item.id.substring(0, 3) === "vor") {
			node.setAttribute('type', 'tel');
			node.setAttribute('inputmode', 'numeric');
			node.setAttribute('placeholder', "000");
			if (vorDegree < 180) {
				node.style.transform = `rotate(${vorDegree - 90}deg)`;
			} else {
				node.style.transform = `rotate(${vorDegree - 270}deg)`;
				node.style.textAlign = "right";
			}
			node.style.left = coords.left + (Math.sin(vorDegree * (Math.PI / 180)) * radius);
			node.style.top = coords.top - (Math.cos(vorDegree * (Math.PI / 180)) * radius);
		}
		// boundary numbers (diamond box)
		else {
			if (item.id.substring(0, 4) === "rect") {
				const rotation = vorElement.getAttribute("transform");
				if (rotation !== null) {
					node.style.transform = rotation.substring(0, rotation.length - 1) + "deg)";
				}
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
	for (const item of vorArray) {
		const ele = document.getElementById(inputId(item));
		ele.style.color = "black";
		ele.disabled = false;
		ele.defaultValue = item.answer;
		ele.value = item.answer;
	}
}

function hintBoxes() {
	for (const item of vorArray) {
		const ele = document.getElementById(inputId(item));
		if (ele.value === "") {
			ele.defaultValue = item.answer.substring(0, 1);
			ele.value = item.answer.substring(0, 1);
		}
	}
}

function clearBoxes() {
	for (const item of vorArray) {
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
	for (const item of vorArray) {
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
