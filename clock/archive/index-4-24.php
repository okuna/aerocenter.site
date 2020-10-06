<html>
  <head>
		<meta name="apple-mobile-web-app-capable" content="yes">
		<meta name="mobile-web-app-capable" content="yes">
		<link rel="manifest" href="manifest.json">		
		<meta name="viewport" content = "width = device-width, initial-scale =1, minimum-scale = .2, maximum-scale = 2, user-scalable = no" />    
		<link rel="apple-touch-icon" href="apple-touch-icon.png">				
		<meta charset="utf-8">
    <!-- Bootstrap CSS -->
    <link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">
    
    <!-- Global site tag (gtag.js) - Google Analytics -->
		<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-1"></script>
		<script>
		  window.dataLayer = window.dataLayer || [];
		  function gtag(){dataLayer.push(arguments);}
		  gtag('js', new Date());
		
		  gtag('config', 'UA-116666952-1');
		</script>



    <title>Clock</title>
    
    <style>
	    
		@media only screen and (max-width: 600px) {
			.clock {
				font-size: 20vw;
			}	
								
		} 	    		
		@media only screen and (min-width: 601px) {
	    .clock {
		    font-size: 17vw;
	    }
    }
    
    .clock {
	    position: relative;
	    font-family: monospace;
	    text-align: center;
	    padding: 10pt;
 	    margin: 0pt;
	    line-height: .8;
	    z-index: -1;


    }
    
nav {
    width: 100%;
    background: #f0f0f0;
    border: 1px solid #ccc;
    border-right: none;
    z-index: 3;
}

nav ul {
    overflow: hidden;
    margin: 0;
    padding: 0;
}

nav ul li {
    list-style: none;
		float: left; 
    text-align: center;
    border-left: 1px solid #fff;
    border-right: 1px solid #ccc;
    box-sizing: border-box;
    
}

.s4 li {
	width: 25%;
  width: calc(100% / 4);  
}
.s6 li {
	width: 16.6667%;
  width: calc(100% / 6);  
}


nav ul li:first-child {
    border-left: none;
}

nav ul li a {
    display: block;
    text-decoration: none;
    color: #616161;
    padding: 10px 10px;
    width = 100%;
}

a:active {
    background-color: yellow;
}

table {
	margin: 1%;
	margin-left: auto;
  margin-right: auto;
  width: 50%;

	border: 1px solid black;
	
}

td {
	padding: 5px;
	font-size: xx-large;
}



    
    </style>
  </head>
  <body ontouchstart>

<nav>
	<ul class = "s6">
		<li><a onclick="decrementHour()">-01:00</a></li>
		<li><a onclick="incrementHour()">+01:00</a></li>
		<li><a onclick="decrement10min()">-00:10</a></li>
		<li><a onclick="increment10min()">+00:10</a></li>
		<li><a onclick="decrementMinute()">-00:01</a></li>
		<li><a onclick="incrementMinute()">+00:01</a></li>
	</ul>
</nav>
	  
<p class = "clock" id="clock">00:00:00</p>



<nav>
	<ul class = "s4">
		<li><a onclick="startTimer()">Start</a></li>
		<li><a onclick="pauseTimer()">Pause</a></li>
		<li><a onclick="useCurrentTime()">Reset</a></li>
		<li><a onclick="rewind()"><<</a></li>
	</ul>
</nav>

<table>
	<tr><td style="text-align:right">JAN</td><td id = "jan"></td></tr>
	<tr><td style="text-align:right">VKS</td><td id = "vks"></td></tr>
	<tr><td style="text-align:right">GWO</td><td id = "gwo"></td></tr>
	<tr><td style="text-align:right">MLU</td><td id = "mlu"></td></tr>
</table>


<script>
	
	var hour = 0;
	var minute = 0;
	var second = 0;
	
	var isPaused = false;
	
	useCurrentTime();
	updateAltimiter();
	
	var myVar = setInterval(tick ,1000);
	
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
		document.getElementById("clock").style.backgroundColor = "#ffcdba";
	}
	
	function startTimer() {
		isPaused = false;
		updateTimer();	
		document.getElementById("clock").style.backgroundColor = "#ceffad";
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
		random = Math.floor(Math.random() * span);		
		altimiter += random;
		document.getElementById(id).innerHTML = altimiter; 
	}
	
	function updateTimer() {
		var sSecond;
		var sMinute;
		var sHour;
		
		second < 10 ? sSecond = "0" + second : sSecond = second;
		minute < 10 ? sMinute = "0" + minute : sMinute = minute; 
		hour < 10 ? sHour = "0" + hour : sHour = hour;
		var d = sHour + ":" + sMinute + ":" + sSecond;
	
	  document.getElementById("clock").innerHTML = d;
	
	}
	
	function tick() {
		if (!isPaused) {		
	    second++;
	    if (second > 59) {
	    	incrementMinute();
	    	second = 0;
	    }
			updateTimer();    
		}
	}
</script>

    

    <!-- Optional JavaScript -->
    <!-- jQuery first, then Popper.js, then Bootstrap JS -->
    <script src="https://code.jquery.com/jquery-3.3.1.slim.min.js" integrity="sha384-q8i/X+965DzO0rT7abK41JStQIAqVgRVzpbzo5smXKp4YfRvH+8abtTE1Pi6jizo" crossorigin="anonymous"></script>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/popper.js/1.14.0/umd/popper.min.js" integrity="sha384-cs/chFZiN24E4KMATLdqdvsezGxaGsi4hLGOzlXwp5UZB1LY//20VyM2taTB4QvJ" crossorigin="anonymous"></script>
    <script src="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/js/bootstrap.min.js" integrity="sha384-uefMccjFJAIv6A+rW+L4AHf99KvxDjWSu1z9VI8SKNVmz4sk7buKt/6v9KI65qnm" crossorigin="anonymous"></script>
  </body>
</html>
