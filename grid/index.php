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
			    width: 7.69230769%;
			    height: 60px;
			    
			}			
			
			td > div {
			  position: relative;
			  height: 60px;
			  padding: 0;
			}

			.cell {
				opacity: 1;
			}

			.blank-cell {
				background-color: gray;
			}

			.airplane-cell {
				background-size: cover;
				background-position: center center;
			}

			.hidden {
				opacity: 0;
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
				display: flex;
				width: 100%;	
			}
			
			.btn-group button {
				flex: 1;
				border: 1px solid black;
				border-top: none;
				height: 60px;
				background-color: #ab47bc;
				cursor: pointer;
			}
			
			.btn-group button:not(:last-child) {
				border-right: none;
			}

			.btn-group button:active {
				background-color: #7905ff;
			}
			
		</style>
	</head>
	
	<body>
<?php
	error_reporting(0);
	$airplanes = array(
		array("160", "1 P S", "C172.6.8.12", "C182.8.10.12", "C210.8.10", "PA32.8.10", "BE36.10.12", "PA24.10.12.12", "SR22.10.12", "PA46.11.14"),
		array("160", "2 P S", "PA34.11.14", "BE58.14.17", "C421.14.17.20", "PA31.14.17"),
		array("200", "1 TP S", "C208.11.14.16", "PC12.15.20"),
		array("240", "2 TP S", "BE9T.18.24.20", "B190.18.24", "SW4.18.24", "B350.27.30.27", "C441.27.42"),
		array("240", "2 TP L", "DH8.14.17", "SF34.18.24", "DH8D.24.26.27"),
		array("300", "4 TP L", "C130.14.17"),
		array("460+", "1 J L", "F16.80.100"),
		array("320", "2 J S", "C510.20.30", "EA50.20.30", "T37.30.35", "BE40.30.35.43", "C750.35.40.46", "LJ55.40.50.43", "T38.80.100.46"),
		array("430", "2 J L", "B712.20.30", "B753.20.30.46", "CRJ2.20.25.40", "CRJ9.20.30", "E145.20.30", "E190.20.25", "A320.30.35", "B738.30.35", "MD82.30.35", "GLF4.40.50.46"),
		array("460+", "2 J H", "B772.20.30", "B763.30.35"),
		array("460+", "4 J H", "C5.20.30", "C17.20.30.43", "A343.30.35", "E3TF.30.35.43", "B1.30.35", "B2.30.35", "B742.30.35", "K35R.40.45.43"),
		array("460+", "4 J J", "A388.30.35"),
		array("460+", "8 J H", "B52.30.35")
	);
	
	echo "<table id = 'planeTable'>";
	$maxRows = max(array_map('count', $airplanes));
	for ($i = 0; $i < $maxRows; $i++) {
		echo "<tr>";		
		for ($j = 0; $j < count($airplanes); $j++) {
			$id = $j . "." . $i;			
			if ($i < 2) {
				$airplane = $airplanes[$j][$i];
				echo "<th id = '$id' class='cell' onclick='flip(this);'>$airplane</th>";
			}
			else if ($i >= 2 && isset($airplanes[$j][$i])) {
				$averageSpeed = (int)$airplanes[$j][0];
				$parts = explode('.', $airplanes[$j][$i]);
				$airplane = $parts[0];
				$minClimbRate = (int)$parts[1] * 100;
				$maxClimbRate = (int)$parts[2] * 100;
				$speed = isset($parts[3]) ? (int)$parts[3] * 10 : "";
				if ($speed == 460) $speed .= "+";
				$speedValue = (int)str_replace("+", "", $speed);
				$highlight = ($averageSpeed > $speedValue) ? "red" : "green";
				$color = getColor($minClimbRate / 100);			
				$photo = $airplane . ".jpg";
				$climbRateDisplay = "$minClimbRate - $maxClimbRate";
				echo "<td id = '$id' class='cell airplane-cell' style='background-image: url(airplanes/$photo);' onclick = 'flip(this);'><div class = 'tdArea'><span class = 'highlight'>$airplane</span><span class = 'speed $highlight'>$speed</span><span class = 'climbRate' style='background-color: $color;'>$climbRateDisplay</span></div></td>";
			}
			else {
				echo "<td id = '$id' class='cell blank-cell'></td>";
				//Remove flip function from blank cells. They should be left grey to more accurately represent number of cards in each column.
			}
						
		}
		echo "</tr>";
	}
	echo "</table>";
	
	//Returns a color based on the climb rate so similar climb rates are visually grouped.
	function getColor($climbRate) {
		$colors = [
			6 => "#00ff92",
			8 => "#00c7ff",
			10 => "#00afff",
			11 => "#0082ff",
			14 => "#0053ff", 
			15 => "#002eff",
			18 => "#002bff",
			20 => "#7d00ff", 
			24 => "#b400ff",
			27 => "#ff00fc",
			30 => "#ff009b",
			35 => "#ff004f",
			40 => "#ff5900",
			80 => "#ffc400"
		];
		return $colors[$climbRate] ?? '#cccccc'; //Default color for unexpected rates
	}
	
?>


	<div class = "btn-group">
		<button onclick = "showAll()">Show All</button>
		<button onclick = "hideAll()">Hide All</button>
		<button onclick = "showPlanes()">Show Planes</button>
		<button onclick = "hidePlanes()">Hide Planes</button>

	</div>	
	<script>

	const ths = document.getElementsByTagName("th");
	const tds = document.getElementsByTagName("td");

	//Toggle visibility of grid elements by flipping the 'hidden' class
    function flip(ele) {
		ele.classList.toggle('hidden');
	}

    function showAll() {
        for (let i = 0; i < ths.length; i++) {
			ths[i].classList.remove('hidden');
		}
		for (let i = 0; i < tds.length; i++) {
			if (tds[i].innerHTML !== "") {
				tds[i].classList.remove('hidden');
			}
		}
    }

    function hideAll() {
        for (let i = 0; i < ths.length; i++) {
			ths[i].classList.add('hidden');
		}
		for (let i = 0; i < tds.length; i++) {
			if (tds[i].innerHTML !== "") { //Prevents blank (gray) spaces from being flipped
				tds[i].classList.add('hidden');
			}
		}
    }

    function showPlanes() {
        for (let i = 0; i < tds.length; i++) {
			if (tds[i].innerHTML !== "") {
				tds[i].classList.remove('hidden');
			}
		}
    }

    function hidePlanes() {
        for (let i = 0; i < tds.length; i++) {
			if (tds[i].innerHTML !== "") {
				tds[i].classList.add('hidden');
			}
		}
	}
</script>

		
	</body>	
</html>

	