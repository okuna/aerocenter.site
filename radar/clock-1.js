	var hour = 0;
	var minute = 0;
	var second = 0;
	var fourDigitClock;
	var lastClockTime = Date.now();

	
	var isPaused = false;
	
	useCurrentTime();
	
	
	function useCurrentTime() {
		var today = new Date();
		hour = today.getHours();
		minute = today.getMinutes();
		second = today.getSeconds();
		updateTimer();
		updateAltimiter();
		startTimer();
		
	}
	
	function resetTimer() {
		second = 0;
		minute = 0;
		hour = 0;
		updateTimer();
		updateAltimiter();
		startTimer();
	}
	
	function increment10min() {
		for (i = 0; i < 10; i++) {
			incrementMinute();
		}
	}
	
	function decrement10min() {
		for (i = 0; i < 10; i++) {
			decrementMinute();
		}
	}

	
	function rewind() {
		if (second == 0) {
			decrementMinute();
		}
		else {
			second = 0;	
		}
		
		updateTimer();
		pauseTimer();
	}
	
	function pauseTimer() {
		isPaused = true;
		updateTimer();	
		document.getElementById("clock").style.color = "#fc1900";
	}
	
	function startTimer() {
		isPaused = false;
		updateTimer();	
		document.getElementById("clock").style.color = "#00fc07";
	}
	
	function incrementMinute() {
		minute++;
		if (minute > 59) {
			minute = 0;
			incrementHour();
		}
		updateTimer();	
	}
	
	function incrementHour() {
		hour++;
		if (hour > 23) {
			hour = 0;
		}
		updateAltimiter();
		updateTimer();	
	}
	
	function decrementMinute() {
		minute--;
		if (minute < 0) {
			minute = 59;
			decrementHour();
		}
		updateTimer();	
	}
	
	function decrementHour() {
		hour--;
		if (hour < 0) {
			hour = 23;
		}
		updateAltimiter();
		updateTimer();	
	}
	
	function updateAltimiter() {
		setAltimiter("jan");
		setAltimiter("vks");
		setAltimiter("gwo");
		setAltimiter("mlu");
	}
	
	function setAltimiter(id) {
		var altimiter = 2980;
		var span = 25;
		var metarId = id + "Metar";
		var stringHour = hour;
		if (stringHour < 10) {
			stringHour = "0" + stringHour;
		}
		
		random = Math.floor(Math.random() * span);		
		altimiter += random;
		var metarBody = id.toUpperCase() + " " + stringHour + "00Z AUTO 35008KT 10SM CLR 27/21 A" + altimiter;
		
		var altimeterLastThree = altimiter.toString().substr(1, 3);
		
//		document.getElementById(id).innerHTML = altimeterLastThree; 
//		document.getElementById(metarId).innerHTML = metarBody;
	}
	
	function setMetar(metarId) {
		document.getElementById(metarId).innerHTML = metarBody;
		
	}
	
	function updateTimer() {
		var sSecond;
		var sMinute;
		var sHour;
		
		second < 10 ? sSecond = "0" + second : sSecond = second;
		minute < 10 ? sMinute = "0" + minute : sMinute = minute; 
		hour < 10 ? sHour = "0" + hour : sHour = hour;
		var d = sHour + ":" + sMinute + ":" + sSecond;
		fourDigitClock = sHour + sMinute;
	
	  document.getElementById("clock").innerHTML = d;
	
	}
	
	function clockTick() {
		if (!isPaused && (Date.now() - lastClockTime > 999)) {		
	    second++;
	    lastClockTime = Date.now();
	    if (second > 59) {
	    	incrementMinute();
	    	second = 0;
	    }
			updateTimer();    
		}
	}
