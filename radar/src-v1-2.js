var airplanes = [];
var tick = 0;
var lastUpdate = Date.now();
//numberOfPlanes = 30;
interval = 1000;
vectorLength = 1;
planeCount = 1;
fixes = ["JAN", "SQS", "MEI", "MLU", "MCB", "GLH", "IGB", "KVKS", "KHBG", "KSTF", "BLE", "RINKY"];
airports = ["KESF", "KNEW", "KMEM", "KSGF", "KGPT", "KBIX", "0M8", "KGWO", "KJAN", "KDTN", "KSHV", "KLRF"];
keyboardCommands = {PVD: "QP", FP: "FP", ALT: "QZ", RS: "RS", FR: "FR"};
makeButtons();
mainLoop();


function makeButtons() {
	var table = document.getElementById("keyboard-buttons");
	for (var i = 0, row; row = table.rows[i]; i++) {
		for (var j = 0, cell; cell = table.rows[i].cells[j]; j++) {
			cell.addEventListener("click", function() {keyPress(this)}, false);			
			if (keyboardCommands[cell.innerHTML] === undefined) {
				cell.style.color = "#666666";
			}
		}
  }
}

function keyPress(key) {
	var key = key.innerHTML;
	var keyCommand = keyboardCommands[key];
//	console.log(keyCommand);
	if (keyCommand === undefined) {
		keyCommand = key + " - sorry, not enabled yet!";
	}
	document.getElementById("messageBox").value = keyCommand + " ";
	
}

function getAirplaneById(id) {
	var plane;
	for (i = 0; i < airplanes.length; i++) {
		plane = airplanes[i];
		if (plane.callsign == id || plane.cid == id || plane.code == id) return plane;
	}
	return false;
}

function parseMessageBox() {
	var messageBox = document.getElementById("messageBox");
	var message = messageBox.value.toUpperCase();


	if (event.key === "Enter") {
		messageBox.value = "";
		outputMessage("");	
//		console.log(message);
		parseMessage(message);
	}
}

function parseMessage(message) {
	message = message.split(" ");
	message = message.filter(Boolean);

	var command = message[0];
	
	if (command == "FP") {
		return parseFlightPlan(message);
	}
	else if (command == "QP") {
		return parsePVD(message);
	}
	else if (command == "QZ") {
		return parseALT(message);
	}
	else if (command == "RS"){
		return parseRS(message);
	}
	else if (command == "TIME") {
		return parseTime(message);
	}
	else if (command == "FR") {
		return parseFR(message);
	}
	else if (command === undefined) {
		outputMessage("");
	}
	else {
		outputError("'" + command + "' is not a supported command.");
		console.log("parseMessage error: " + command);
		return false;
	}
}

function parseFR(message) {
	var airplane;
	if (airplane = getAirplaneById(message[1])) {
		outputMessage(airplane.callsign + " " + airplane.type + " " + airplane.code + " " + airplane.route);
	}
	else outputError("FR: " + messsage[0] + " not found.");
	
}

function parseRS(message) {
	var id = message[1];
	var airplane;
	if (airplane = getAirplaneById(id)) {
		airplane.remove();
		outputMessage("Removed " + id);
		return true;
	}
	else {
		outputError(id + " not found");
		return false;
	}
}

function parseALT(message) {
	if (message.length != 3) {
		outputError("ALT [alt] [cid]");
		return;
	}
	var alt = message[1];
	var cid = message[2];
	var plane; 

	if (plane = getAirplaneById(cid)) {
		if (plane.setAltitude(alt)){
			outputMessage(plane.callsign + " alt " + plane.altitude);
			return true;
		}
		else {
			outputError("Invalid altitude");
			return false;
		}		
	}
	else {
		outputError("Plane not found");
		return false;
	}	
}

function loadScenario(scenario) {
	if (scenario == "11M") {
		 document.getElementById("scenarioEntry").value = 
`ERAM 11M
TIME 0000
FP ENY111 DH8C/A 0006 220 ZAMMA056041 E0000 120 JAN..AEX..KAEX
FP N26BB BE40/I 0014 288 ZAMMA113027 E0000 100 SQS..UJM..KBVX
FP AWE452 B737/G 0004 458 MON212020 E0001 230 JAN..KTLH
FP ENY204 TBM7/G 0007 170 MON000000 E0001 110 MCB..KMJD
FP AWE26 B737/I 0003 410 MON249030 E0003 170 RMG..KCLT
FP N225YM C650/G 0012 316 3231/9146 E0004 210 SIGNS..KJAN
FP SWA651 B737/G 0026 458 3152/9112 E0005 230 JAN..KSDF
FP N24CC C550/G 0625 300 MON E0008 210 SQS..VUZ..KPLR
FP AAL16 MD88/I 0001 400 3138/9016 E0008 170 SQS..STL..BDF..KORD
FP N2556E BE9L/G 0013 201 3231/9146 E0010 170 JAN..SQS..MEM..KSUS
FP N619PL PA32/G 0021 155 KGWO E0010 000 SQS..HLI..KPAH
QZ 090 N619PL
FP N69872 BE9L/G 0023 202 3152/9109 E0014 050 SQS..KGWO
FP N441CA C441/G 0016 240 ZAMMA032024 E0015 180 KCLL
FP FDX1216 DH8D/G 0011 305 SQS E0015 120 JAN..KHEZ
FP N442RG C72R/A 0017 120 KVKS E0015 000 SQS..HLI..KBNA
QZ 060 N442RG
FP N89QP BE9/L 0315 250 MLU072010 E0016 110 HATER..EWA..KORL
FP N552DC GLF2/G 0345 320 JAN161024 E0016 220 CLL..KAMA
FP N5TU BE35/G 0020 165 KGWO E0018 000 SQS..IGB..KUBS
QZ 050 N5TU
FP N43MR C550/A 0015 330 GLH E0019 170 JAN..MIZZE..KHBG
FP N2387L PA34/G 0343 160 MCB E0020 070 JAN..KHKS
FP USX507 FA20/G 0027 450 PBF E0020 230 KBIX
FP N986PL C402/A 0025 175 SQS E0024 130 KMSY
FP N825TR C750/I 0024 440 04M311010 E0026 200 AEX..KSGR
FP BUSTR21 2/F117/I 0005 460 3148/9058 E0035 210 IGB..KADW
FP N658AB LJ45/I 0341 450 JAN341038 E0039 240 EMG..KSTF`;
	}
	else if (scenario == "PO") {
		document.getElementById("scenarioEntry").value = 
`POINT OUTS
TIME 0000
FP DAL42 B777/G 0001 450 RINKY087015 EXX00 130 MLU..KMLU
FP AAL120 B747/G 0002 450 SQS EXX00 200 KHEZ
FP N123 C172/G 0003 130 ROMAR180015 EXX00 130 KGPT
FP N808S C152/G 0004 400 BLE EXX00 000 SQS..KUOX
QZ 040 N808S
FP UAL111 B727/G 0005 450 KJAN EXX00 000 MCB..KMSY
QZ 230 UAL111
FP TIGER1 F22/G 0006 450 KGWO EXX00 000 SQS..KSUS
QZ 200 TIGER1
FP QXE300 B727/G 0007 450 JELMI EXX00 150 KLIT
QZ 230 QXE300
FP N552S C450/G 0008 200 HATER090020 EXX00 070 IGB..KGTR`;
	}
	
}

function parseTime(message) {
	var time = message[1];
	if (time == "NOW") {
		useCurrentTime();
	}
	else {
			if (time.length != 4 || parseInt(time[1],10) > 2400) {
			outputError("Invalid Start Time!");
			return false;
		}
		//reset clock
		hour = parseInt(time.substring(0,2));
		minute = parseInt(time.substring(2,4));
		second = 0;
	}
	outputMessage("Clock set to " + time);
	return true;
}

function parsePVD(message) {
	var planeid = message[message.length - 1]; 
	var sector = message[1];
	var plane;
	if (plane = getAirplaneById(planeid)) {
		outputMessage("QP: " + plane.callsign + " point out " + sector);
		return true;
	}
	else {
		outputMessage("PVD: " + planeid + " not found.");
		return false;
	}
	
}

function parseFlightPlan(message) {
//	Airplane(callsign, type, cid, speed, x, y, startingTime, currentAltitude, altitude, route)
// FP N123 C172 1234 200 JAN180010 0000 100 200 JAN..SQS..IGB..MEI..KJAN
	var err = "";
	var error = "";
	if (message.length < 9) {
		outputMessage("FP: [callsign] [type] [code] [speed] [fix] [fix time] [current altitude] [route]");
		return;
	}
	var callsign = message[1];
	var type = message[2];
	var code = message[3];
	if (code.length != 4) {
		err += "code ";
	}
	var speed = message[4];
	if (speed.length != 3) {
		err += "speed ";
	}
	var startPoint = message[5];
	var time = message[6];
	time = time.substr(time.length - 4, 4);
	if (time == "XX00") {
		time = fourDigitClock;
	}
	var alt = message[7];
	if (alt.length != 3) {
		err += "alt ";
	}	
	var route = message[8];
	if (err != "") {
		outputMessage("FP invalid! Check the following fields: " + err);
		return false;
	}
	
	if (getAirplaneById(callsign) || getAirplaneById(code)) {
		outputMessage("Error: Plane exists with that callsign or code");
		return false;
	}

	var coords = fixToCords(startPoint);
	var cid = makeCID();
	
	//console.log(route);
	var plane = new Airplane(callsign, type, code, cid, speed, coords.left, coords.top, time, alt, route, false);
	outputMessage("FP " + callsign);
	airplanes.push(plane);
	radarPing();
	return true;
}

function setVectorLength(length) {
	vectorLength = length;
	for (i = 0; i < airplanes.length; i++) {
		if (airplanes[i].isFlying) {
			airplanes[i].updateVectorLine();
		}

	}		

}

function makeCID() {
	var cid = 1000 + planeCount; 
	cid = cid.toString().substring(1, 4);
	return cid;
}

function toggleDwellLock(block) {
	if (block.dwellLock == "false") {
		block.classname = "dwell-lock datablock";
	}
	else {
		block.classname = "datablock";
	}
}
	

function rand(min, max) {
  var num = Math.floor(Math.random() * (max - min + 1)) + min;
  return num;
}		



function radarPing() {
//	console.log("Ping: " + Date.now());
	var airplane;
	for (i = 0; i < airplanes.length; i++) {
//		console.log("radarping(): " + Date.now() + " " + tick + " i= " + i);
		airplane = airplanes[i];
		airplane.move();
		if (!airplane.isFlying && airplane.startTime == fourDigitClock) {
			airplane.isFlying = true;
			airplane.draw();
		}
		//airplanes[i].collisionDetect();
	}		
	lastUpdate = Date.now();
	tick++;
	clockTick();
}

function getCoords(elem) {
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + box.height/2 + pageYOffset,
    left: box.left + box.width/2 + pageXOffset
  };
}

function fixToCords(fixString) {
	var fix, deg, dist;
	//parse lat/long entry
	if (fixString.indexOf("/") == 4) {
		var lat = fixString.substring(0, 4);
		var log = fixString.substring(5, 9);
		fixCoords = convertRealCoordToDisplay(lat.substring(0, 2) + "." + lat.substring(2, 4), log.substring(0, 2) + "." + log.substring(2, 4));
		fixCoords.top = fixCoords.displayY;
		fixCoords.left = fixCoords.displayX;
		deg = 0;
		dist = 0;
	}
	//9 character radial degree distance (ex:	 JAN187012) 
	else if (fixString.length >= 9) {
		fix = fixString.substring(0, fixString.length - 6).toLowerCase();
		deg = fixString.substring(fixString.length - 6, fixString.length - 3);
		dist = fixString.substring(fixString.length - 3, fixString.length);
		console.log(fix + " " + deg + " " + dist);
		dist = milesToPixels(dist);		
		fixCoords = getFixCoordsByName(fix);
		console.log(fixCoords.top + " " + fixCoords.left);
	}
	else if (fixString.length <= 5) {
		fix = fixString;
		deg = 0;
		dist = 0;
		fixCoords = getFixCoordsByName(fix);
	}
	//fixElem = document.getElementById(fix);
	//fixCoords = getCoords(fixElem);
	return {
		top: fixCoords.top - Math.cos(deg * (Math.PI/180)) * dist,
		left: fixCoords.left + Math.sin(deg * (Math.PI/180)) * dist	
		//node.style.top = coords.top - (Math.cos(vorDegree * (Math.PI/180))  * radius);
		//node.style.left = coords.left + (Math.sin(vorDegree * (Math.PI/180))  * radius);
	};
}


function resetPlanes() {
	for (i = 0; i < airplanes.length; i++) {
		airplanes[i].x = rand(100,1000);
		airplanes[i].y = rand(100,1000);
		document.getElementById(airplanes[i].callsign + "history").innerHTML = "";
		airplanes[i].step = 0;
		airplanes[i].nextFix = fixes[Math.floor(Math.random()*fixes.length)];
		airplanes[i].heading = airplanes[i].getFixHeading(airplanes[i].nextFix);
		airplanes[i].lastUpdateTime = 0;
		airplanes[i].move();

	}
	radarPing();
}

function pixelsToMiles(pixels) {
	//6.947 pixel per mile
	//0.144 mile per pixel
	return pixels * .15834;
}

function milesToPixels(miles) {
	//6.947 pixel per mile
	//0.144 mile per pixel
	return miles * 6.31571;
	
}

function outputMessage(message) {
	var output = document.getElementById("outputBox");
	output.innerHTML = "✓ " + message;
	console.log(message);
}

function outputError(message) {
	var output = document.getElementById("outputBox");
	output.innerHTML = "✖︎ " + message;
	console.log(message);
}

function makePlanes() {
/*
	for (i = 0; i < numberOfPlanes; i++) {
		var plane = new Airplane("N" + i + rand(10, 999), i, rand(10, 48), rand(10, 20), rand(10, 24), rand(100,1000), rand(50,1000), rand(0,359));
		airplanes.push(plane);
		plane.draw();
	}
*/
}

function clearPlanes() {
	document.getElementById("planes").innerHTML = "";
	airplanes = [];
	tick = 0;
	planeCount = 0;
	useCurrentTime();
}

function getFix(fix) {
	for (i = 0; i < fixes_json.length; i++) {
		if (fixes_json[i].ident == fix) {
			return fixes_json[i];
		}
	}
}

/*
  let box = elem.getBoundingClientRect();
  return {
    top: box.top + box.height/2 + pageYOffset,
    left: box.left + box.width/2 + pageXOffset
  };
*/


function getFixCoordsByName(fix) {
	try {
		var fixElement = document.getElementById(fix.toLowerCase()).getBoundingClientRect();		
		var fixTop = fixElement.top + fixElement.height/2 + pageYOffset;
		var fixLeft = fixElement.left + fixElement.width/2 + pageXOffset; 
		//console.log("found " + fix + " on page");
	}
	catch (err) {
		fixElement = getFix(fix.toUpperCase());
		if (fixElement === undefined) {
			fixElement = getFix("K" + fix.toUpperCase());
		}
		var nextCoords = convertRealCoordToDisplay(fixElement.latitude_deg, fixElement.longitude_deg);
		fixTop = nextCoords.displayY;
		fixLeft = nextCoords.displayX;		
		//console.log("found " + fix + " in file");
	}
	return {top: fixTop, left: fixLeft};

}

function convertRealCoordToDisplay(latitude, longitude) {
	var displayX = 62294.14889  -682.85668 * longitude;
	var displayY = 14368.92359 -420.0504 * latitude;
	
//displayX = (62294.14889) + -682.85668× realX
//displayY = (14368.92359) + -420.0504 × realY	
	
	//console.log("x" + displayX + "y" + displayY);
	
	return {displayX, displayY};
}

function makeBeaconCode() {
	var code = "";
	do {
		for (i = 0; i < 4; i++) {
			code += rand(0,7).toString();
		}
	}
	while (getAirplaneById(code));
	return code; 
}

function makeCallsign() {
	var prefixes = ["N", "VV", "R", "N", "COA", "USX", "QXE", "AAL", "DAL"];
	var prefix = prefixes[rand(0, prefixes.length - 1)];
	var callsign;
	do {
		callsign = prefix + rand(1,9999);
	}
	while (getAirplaneById(callsign))
	return callsign; 
}


function makePlane() {
	//Airplane(callsign, type, code, cid, speed, x, y, startTime, currentAltitude, altitude, route)
	var route = "";
/*
	for (i = 0; i < 10; i++) {
		route += ".." + fixes[Math.floor(Math.random()*fixes.length)];
	}
*/
	route = airports[rand(0, airports.length - 1)];
	var plane = new Airplane(makeCallsign(), "F16", makeBeaconCode(), makeCID(), rand(100, 480), rand(100,1000), rand(50,1000), fourDigitClock, rand(50, 200), route, true, rand(5, 24) * 10);
	airplanes.push(plane);
	plane.draw();
}

function showScenarioBox() {
	if (document.getElementById("scenarioBox").style.display == "none") {
		document.getElementById("scenarioBox").style.display = "block";
	}
	else {
		document.getElementById("scenarioBox").style.display = "none";
	}
}

function runScenario() {
	clearPlanes();
	var scenario = document.getElementById("scenarioEntry").value;
	var lines = scenario.split('\n');
	var scenarioName = lines.shift();
	
	for(var i = 0;i < lines.length;i++){
		line = lines[i];
    //console.log(line);
    if (!parseMessage(line)) {
	    outputError("Error line " + (i + 2) + ": " + line);
	    clearPlanes();
	    return;
    }
	}
	outputMessage("Success! Loaded " + scenarioName);
}

function showHelp() {
	var helpbox = document.getElementById("helpbox");
	if (helpbox.style.display == "none") {
		helpbox.style.display = "block";
	}
	else {
		helpbox.style.display = "none";
	}
}

//var timer = setInterval(radarPing, interval);

function mainLoop() {
	radarPing();
	requestAnimationFrame(mainLoop);
}

