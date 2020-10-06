<html>
	<head>
		
		<title>Grid</title>
		<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">		
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-2"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-116666952-2');
</script>

		
		<style>
			html {
			  touch-action: manipulation;
			}			
			
			table {
				padding: 10 px;
				width: 100%;
			}
			th, td {
			    padding: 0px;
			    border: 1px solid black;
			    text-align: center;
			    width: 8.3333333333%;
			    height: 60px;
			    background-size: cover;
			    background-position: center center; 
			    opacity: 1;
			    
			}			
			
			td {
				vertical-align: top;
			}
			
			td > div {
			  position: relative;
			  height: 60px;
			  padding: 0;
			}

			.highlight {
				background: rgba(255, 255, 255, 0.71); 
			}

			.climbRate {
				position: absolute;
				right: 1px;
				bottom: 1px;
				font-size: x-small;
			}		
			.speed {
				position: absolute;
				left: 1px;
				bottom: 1px;
				font-size: x-small;
			}		
			
			.green {
				background: rgba(53, 255, 100, 0.72);
			}
			
			.red {
				background: rgba(255, 94, 94, 0.72);
			}

			
			th {
				background-color: #29b6f6;
				padding: 0px;
				height: 30px;

			}
			
			
			
			.btn-group {
				width: 33.4%;	
			}
			
			.btn-group button {
				width: 50%;
		    border: 1px solid black; /* Green border */
		    border-top: none;

		    height: 60px;
		    
		    background-color: #ab47bc;

		    cursor: pointer; /* Pointer/hand icon */
		    float: left; /* Float the buttons side by side */
			}
			
.btn-group button:not(:last-child) {
    border-right: none; /* Prevent double borders */
}

/* Clear floats (clearfix hack) */

/* Add a background color on hover */
.btn-group button:active {
    background-color: #7905ff;
}			

			
		</style>
	</head>
	
	<body>
<?php
	error_reporting(0);
	$airplanes = array(
		array("160", "1 P S", "C172.6.12", "C182.8.12", "C210.8", "PA32.8", "PA24.10.12", "BE36.10", "SR22.10", "PA46.11"),
		array("160", "2 P S", "PA34.11", "PA31.14", "BE58.14", "C421.14.20"),
		array("200", "1 TP S", "C208.11.16", "PC12.15"),
		array("240", "2 TP S", "BE9T.18.20", "B190.18", "SW4.18", "B350.27.27", "C441.27"),
		array("240", "2 TP L", "DH8.14", "SF34.18", "DH8D.24.27"),
		array("300", "4 TP L", "C130.14"),
		array("460+", "1 J L", "F16.80"),
		array("320", "2 J S", "C510.20", "EA50.20", "T37.30", "BE40.30.43", "C750.35.46", "LJ55.40.43", "T38.80.46"),
		array("430", "2 J L", "CRJ2.20.40", "E190.20", "E145.20", "CRJ9.20", "B712.20", "B753.20.46", "B738.30", "A320.30", "MD82.30", "GLF4.40.46"),
		array("460+", "2 J H", "B772.20", "B763.30"),
		array("460+", "4 J H", "C17.20.43", "C5.20", "E3TF.30.43", "A388.30", "A343.30", "B1.30", "B2.30", "B742.30", "K35R.40.43"),
		array("460+", "8 J H", "B52.30")
	);
	
	echo "<table id = 'planeTable'>";
	for ($i = 0; $i < 12; $i++) {
		echo "<tr>";		
		for ($j = 0; $j < 12; $j++) {
			$id = $j . "." . $i;			
			if ($i < 2) {
				$airplane = $airplanes[$j][$i];
				
				echo "<th id = '$id' onclick = 'flip(this);'>$airplane</th>";
			}
			else if (array_key_exists($i, $airplanes[$j])) {
				$averageSpeed = $airplanes[$j][0];
				$string = $airplanes[$j][$i];
				//from beginning to first period
				$airplane = substr($string, 0, strpos($string, "."));
				//from after first period to end
				$string = substr($string, strpos($string, ".") + 1);
				//string has period? go to period OR use whole string 
				if (strpos($string, ".")) {
					$climbRate = substr($string, 0, strpos($string, "."));
					$speed = substr($string, strpos($string, ".") + 1);
					$speed *= 10;
					if ($speed == 460) $speed = $speed . "+";
				}	
				else {
					$climbRate = $string; 
					$speed = "";
				}
				$color = getColor($climbRate);
				$climbRate *= 100;				
				$averageSpeed > $speed ? $highlight = "red" : $highlight = "green";
				
				$photo = $airplane . ".jpg";
				echo "<td id = '$id' style = 'background-image: url(airplanes/$photo);' onclick = 'flip(this);'><div class = 'tdArea'><span class = 'highlight'>$airplane</span><span class = 'speed $highlight'>$speed</span><span class = 'climbRate highlight'>$climbRate</span></div></td>";
			}
			else {
				echo "<td id = '$id' style = 'background-color: grey;' onclick = 'flip(this);'></td>";
			}

						
		}
		echo "</tr>";
	}
	echo "</table>";
	
	function getColor($climbRate) {
		switch($climbRate) {
			case 6: return "#00ff92";
			case 8: return "#00c7ff";
			case 10: return "#00afff";
			case 11: return "#0082ff";
			case 14: return "#0053ff"; 
			case 15: return "#002eff";
			case 18: return "#002bff";
			case 20: return "#7d00ff"; 
			case 24: return "#b400ff";
			case 27: return "#ff00fc";
			case 30: return "#ff009b";
			case 35: return "#ff004f";
			case 40: return "#ff5900";
			case 80: return "#ffc400";
		}
	}
	
?>


	<div class = "btn-group">
		<button onclick = "showAll()">Show All</button>
		<button onclick = "hideAll()">Hide All</button>
		<button onclick = "showPlanes()">Show Planes</button>
		<button onclick = "hidePlanes()">Hide Planes</button>

	</div>	
	<script>
		
		function flip(ele) {
			console.log("1");
			if (ele.style.opacity != "0") {
				hide(ele);
			}
			else {
				reveal(ele);
			}
		}
		
		function reveal(ele) {
			ele.style.opacity = "1";
			var yPos = ele.id.substring(ele.id.indexOf(".") + 1, ele.id.length);
			var xPos = ele.id.substring(0, ele.id.indexOf("."));
			if (ele.innerHTML == "") {
				for (i = yPos; i < 12; i++) {
					var id = xPos + "." + i;
					var blank = document.getElementById(id);
					blank.style.opacity = "1";
				}
			}
		}
		
		function hide(ele) {
			ele.style.opacity = "0";
			var yPos = ele.id.substring(ele.id.indexOf(".") + 1, ele.id.length);
			var xPos = ele.id.substring(0, ele.id.indexOf("."));
			if (ele.innerHTML == "") {
				for (i = yPos; i < 12; i++) {
					var id = xPos + "." + i;
					var blank = document.getElementById(id);
					blank.style.opacity = "0";
				}
			}
			
		}
		
		function showAll() {
			showPlanes();
			table = document.getElementsByTagName("th");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "1";
			}

		}
		
		function hideAll() {
			hidePlanes();
			table = document.getElementsByTagName("th");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "0";
			}	
		}
		
		function showPlanes() {
			table = document.getElementsByTagName("td");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "1";
			}
		}
		function hidePlanes() {
			table = document.getElementsByTagName("td");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "0";
			}
			
		}
		
	
	</script>

		
	</body>	
</html>

	