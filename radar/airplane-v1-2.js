/*
	Defines an airplane object
	*/

function Airplane(callsign, type, code, cid, speed, x, y, startTime, currentAltitude, route, status, altitude = -1) {
	if (altitude < 0) {
		altitude = currentAltitude;
	}
	this.routeArray = [];
	this.callsign = callsign; 
	this.type = type;
	this.code = code;
	this.cid = cid;
	this.speed = speed;
	this.x = x;
	this.y = y;
	this.startTime = startTime;	
	this.currentAltitude = parseInt(currentAltitude, 10);
	this.altitude = parseInt(altitude, 10);
	this.route = route;
	
	this.routeArray = route.split(".");
	this.routeArray = this.routeArray.filter(Boolean);
	this.nextFix = this.routeArray.shift();
	//drop first fix if it is departure airport
	if (this.routeArray.length > 1 && this.nextFix.substr(0, 1) == "K") {
		this.nextFix = this.routeArray.shift();
	}
	this.heading = this.getFixHeading(this.nextFix);	
	
	this.dwellLock = false;
	this.color = "yellow";
	this.history = [];
	this.step = 0;
	this.climbRate = 2000; //feet per minute
	this.isFlying = status;
	//	this.nextFix = fixes[Math.floor(Math.random()*fixes.length)];
	this.lastUpdateTime = Date.now();
	planeCount++;
}

Airplane.prototype.setAltitude = function(alt) {
	alt = parseInt(alt);
	if (!Number.isInteger(alt) || alt > 999) {
		console.log("alt: invalid " + alt);
		return false;
	}
	else {
		this.altitude = alt;
	}
	if (this.isFlying) {
		this.updateDataBlock();
	}

	return true;
}

Airplane.prototype.remove = function() {
	var index = airplanes.indexOf(this);
	var ele = this.element;
	
	ele.parentNode.removeChild(ele);

  airplanes.splice(index, 1);
}

/*
	Fires every update to calculate new position of airplane
	*/

Airplane.prototype.move = function() {
	//amount of time since last radar sweep

	if (!this.isFlying) {
		this.lastUpdateTime = Date.now();
		return;
	}
	var timeDiff = Date.now() - this.lastUpdateTime;

	//don't move if less than 10 seconds 
	if (timeDiff < 10000) return;
	//console.log("move " + this.cid + " at " + tick);	
	//distance moved in px
	var pixelSpeed = timeDiff / 1000 / 60 / 60 * milesToPixels(this.speed);
	//get heading
	this.lastUpdateTime = Date.now();
	if (this.hasReachedFix()) {
		if (this.routeArray.length != 0) {
			this.nextFix = this.routeArray.shift();
		}
//		else {
//			this.nextFix = fixes[Math.floor(Math.random()*fixes.length)];
//		}
		this.heading = this.getFixHeading(this.nextFix);
	}
	if (this.hasLanded()) {
		return;
	}
	
	this.x = this.x + Math.sin(this.heading * (Math.PI/180)) * pixelSpeed;
	this.y = this.y - Math.cos(this.heading * (Math.PI/180)) * pixelSpeed;			
	var climbAmount = this.climbRate * timeDiff / 1000 / 60 / 100;
	if (this.altitude < this.currentAltitude - 3) {
		this.currentAltitude -= climbAmount;
	}
	else if (this.altitude > this.currentAltitude + 3){
		this.currentAltitude += climbAmount;
	}
	else {
		this.altitude = this.currentAltitude;
	}
	var planeDiv = document.getElementById(this.callsign);
	planeDiv.style.top = this.y;
	planeDiv.style.left = this.x;
	planeDiv.style.color = this.color;

	var historyDiv = document.getElementById(this.callsign + "history");
	var trail = document.createElement("div");
//			var marker = document.createTextNode("\\");
//			trail.appendChild(marker);
	trail.className = "trail";
	trail.style.position = "absolute";

	trail.style.top = this.y - (trail.offsetWidth / 2);
	trail.style.left = this.x - (trail.offsetWidth / 2);
	trail.id = this.callsign + "_" + this.step;
	trail.class = "plane";
	
	historyDiv.appendChild(trail);
	if (this.step > 4) {
		var oldstep = this.step - 5;
		var oldtrail = document.getElementById(this.callsign + "_" + oldstep);
		oldtrail.parentNode.removeChild(oldtrail);				
	}

	this.step++;
	this.updateDataBlock();
	this.updateVectorLine();
	
	if (this.x < -10 || this.x > 2000) {
		this.remove();
	}
	if (this.y < -10 || this.y > 1300) {
		this.remove();
	}
};

Airplane.prototype.hasReachedFix = function() {
	//fixElement = document.getElementById(this.nextFix.toLowerCase()).getBoundingClientRect();
  var coords = getFixCoordsByName(this.nextFix);
  var dy = coords.top - this.y; //+ pageYOffset;
  var dx = coords.left - this.x; //+ pageXOffset;
  var distance = Math.sqrt(dx * dx + dy * dy);	
  this.distance = distance;
  if (distance < 10) {
    console.log(this.callsign + " reached " + this.nextFix);
    return true;
  }
  return false;
};

Airplane.prototype.hasLanded = function() {
  if (this.hasReachedFix() && (this.nextFix.substr(0,1) == "K" || this.nextFix == "0M8")) {
  	this.remove(); 
  }
}

Airplane.prototype.getFixHeading = function(nextFix) {
/*
	try {
		var fixElement = document.getElementById(nextFix.toLowerCase()).getBoundingClientRect();		
		var nextFixTop = fixElement.top;
		var nextFixLeft = fixElement.left; 

	}
	catch (err) {
		fixElement = getFix(nextFix);
		var nextCoords = convertRealCoordToDisplay(fixElement.latitude_deg, fixElement.longitude_deg);
		nextFixLeft = nextCoords.displayLeft;
		nextFixTop = nextCoords.displayTop;		
	}
*/
	var coords = getFixCoordsByName(nextFix);
	
	var yDist = coords.top - this.y; //+ pageYOffset;
	var xDist = coords.left - this.x; //+ pageXOffset;	
	
	if (coords.left > (this.x + pageXOffset)) {
		offset = -90;
	}
	else {
		offset = 90;
	}
	
	heading = Math.atan(yDist / xDist) * (180/Math.PI) - offset;

	return parseInt(heading);
};
		
Airplane.prototype.draw = function() {
	var wrapper = document.createElement("div");
	var outerWrapper = document.createElement("div");
	wrapper.id = this.callsign;
	outerWrapper.id = this.callsign + "wrapper";
	var target = document.createElement("div");
	var dataBlock = document.createElement("div");
	var pointer = document.createElement("div");
	pointer.className = "pointer";
	pointer.id = this.callsign + "pointer";			
	dataBlock.id = this.callsign + "dataBlock";
	dataBlock.style.position = "relative";
	dataBlock.style.top = "-20";
	dataBlock.style.left = "20";
	dataBlock.className = "datablock";
	dataBlock.addEventListener('click', function() {toggleDwellLock(dataBlock); });
//			var text = document.createTextNode("⊟");
	
	
//			target.style.transform = "rotate(45deg)";
//			target.appendChild(text);
	wrapper.style.position = "absolute";
	wrapper.style.color = this.color;
	wrapper.style.left = this.x;
	wrapper.style.top = this.y;
	
	target.className = "plane";
//			target.style.left = parseFloat(target.style.left) - (target.offsetWidth / 2);
//			target.style.top = parseFloat(target.style.top) - (target.offsetHeight / 2);
	var historyDiv = document.createElement("div"); 
	historyDiv.id = this.callsign + "history";
	

	wrapper.appendChild(target);
	wrapper.appendChild(dataBlock);
	outerWrapper.appendChild(pointer);
	outerWrapper.appendChild(wrapper);
	outerWrapper.appendChild(historyDiv);
	document.getElementById("planes").appendChild(outerWrapper);
	this.heading = this.getFixHeading(this.nextFix);
	this.element = outerWrapper;
	this.updateDataBlock();
	this.updateVectorLine();
	this.move();	
	console.log("draw(): " + this.callsign + " at " + this.startTime);
};


/*
*
* moves 1 minute vector line pointer around with the data block 
*
*/

Airplane.prototype.updateVectorLine = function() {
	var pointer = document.getElementById(this.callsign + "pointer");
	pointer.style.height = (milesToPixels(this.speed) / (60 / vectorLength)) + "px";				
	pointer.style.position = "absolute";
	pointer.style.transform = "rotate(" + this.heading + "deg)";
	pointer.style.top = this.y + 5;
	pointer.style.left = this.x + 5;
//			pointer.style.top = this.y + Math.cos(this.heading * (Math.PI/180))  * 10;
//			pointer.style.left = this. x + Math.sin(this.heading * (Math.PI/180))  * 10;
//			pointer.style.left = parseFloat(pointer.style.left) - (pointer.offsetWidth / 2);
	pointer.style.top = parseFloat(pointer.style.top) - (pointer.offsetHeight);	
	
};

Airplane.prototype.updateDataBlock = function() {
	var dataBlock = document.getElementById(this.callsign + "dataBlock");
	if (dataBlock === undefined) {
		return;
	}
	var alt = this.altitude;
	var destination;
	
	if (this.nextFix.substr(0,1) == "K") {
		destination = this.nextFix;
	}
	else if (this.routeArray.length != 0){
		destination = this.routeArray[this.routeArray.length - 1];
	}
	else {
		destination = this.nextFix;
	}
	var currentAlt = parseInt(this.currentAltitude);
	if (alt < 100) {
		alt = "0" + alt;
	}
	if (currentAlt < 100) {
		currentAlt = "0" + currentAlt;
	}
	dataBlock.innerHTML = "";
	var text = document.createTextNode(this.callsign);
	dataBlock.appendChild(text);
	dataBlock.appendChild(document.createElement("br"));
	if (Math.abs(this.altitude - this.currentAltitude) < 3) {
		dataBlock.appendChild(document.createTextNode(alt.toString().substr(0,3) + "C"));	
		
	}
	else {
		if (this.altitude < this.currentAltitude) {
			icon = '↓';
		}
		else {
			icon = '↑';
		}
		dataBlock.appendChild(document.createTextNode(alt + icon + currentAlt));	
	}
	dataBlock.appendChild(document.createElement("br"));
	dataBlock.appendChild(document.createTextNode(this.cid));
	dataBlock.appendChild(document.createTextNode(" " + this.speed));
	dataBlock.appendChild(document.createElement("br"));
	dataBlock.appendChild(document.createTextNode(destination));
};

//borrowed from mozilla.org
Airplane.prototype.collisionDetect = function() {
  for (var j = 0; j < airplanes.length; j++) {
    if (!(this === airplanes[j])) {
      var dx = this.x - airplanes[j].x;
      var dy = this.y - airplanes[j].y;
      var distance = Math.sqrt(dx * dx + dy * dy);

      if (distance < 20 && (Math.abs(this.currentAltitude - airplanes[j].currentAltitude) < 5)) {
	      //console.log(this.callsign + " hit " + airplanes[j].callsign);
        airplanes[j].color = "red"; 
        this.color = "red";
      }
      else {
	      this.color = "yellow";
      }
    }
  }
};
