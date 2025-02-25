<html>
<head>
		
	<title>Grid</title>
	<link rel="stylesheet" href="https://stackpath.bootstrapcdn.com/bootstrap/4.1.0/css/bootstrap.min.css" integrity="sha384-9gVQ4dYFwwWSjIDZnLEWnxCjeSWFphJiwGPXr1jddIhOegiu1FwO5qRGvFXOdJZ4" crossorigin="anonymous">		
	<meta name="viewport" content="width=device-width, initial-scale=1">
	<meta name="format-detection" content="telephone=no">
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
			touch-action: manipulation; /* Prevents double tap zoom on mobile */
		}			

		table {
			width: 100%;
			border-collapse: collapse;
		}
		
		.cell {
			padding: 0;
			border: 1px solid black;
			text-align: center;
			min-width: 90px;
			height: 60px;
			box-sizing: border-box;
		}

		th.cell {
			background-color: #29b6f6;
			height: 30px;
		}

		td.cell {
			position: relative;
		}

		.airplane-cell {
			background-size: cover;
			background-position: center;
		}

		.blank-cell {
			background-color: gray;
		}

		.tdArea {
			height: 100%;
		}

		.speed, .climbRate {
			position: absolute;
			bottom: 1px;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
			
		.speed {
			left: 1px;
			width: 25%;
		}

		.climbRate {
			right: 1px;
			width: 50%;
		}	

		.hidden {
			opacity: 0;
		}

		.highlight {
			background: rgba(255, 255, 255, 0.71); 
		}	
			
		.green {
			background: rgba(53, 255, 100, 0.72);
		}
			
		.red {
			background: rgba(255, 94, 94, 0.72);
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

		@media (max-width: 768px) {
			#planeTable {
				display: block;
				overflow-x: auto; /* Enables horizontal scrolling on mobile */
				white-space: nowrap;
				max-width: 100%; /* Prevents overflow beyond viewport */
			}
			.cell {
				min-width: 80px;  /* Slightly smaller for mobile */
				height: 55px;
			}
			.speed {
				width: 30%;
			}
			.climbRate {
				width: 60%;
			}
			.highlight {
				font-size: 10px;
			}
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
	
	function renderCell($id, $content, $isHeader = false, $attributes = '') {
		$tag = $isHeader ? 'th' : 'td';
		$class = $isHeader ? 'cell' : ($content ? 'cell airplane-cell' : 'cell blank-cell');
		return "<$tag id='$id' class='$class' $attributes>$content</$tag>";
	}

	echo "<table id = 'planeTable'>";
	$maxRows = max(array_map('count', $airplanes)); //Dynamically calculate rows
	for ($i = 0; $i < $maxRows; $i++) {
		echo "<tr>";		
		for ($j = 0; $j < count($airplanes); $j++) {
			$id = "$j.$i";			
			if (!isset($airplanes[$j][$i])) {
				echo renderCell($id, '');
				continue;
			}
			$airplaneData = $airplanes[$j][$i];
			if ($i < 2) {
				echo renderCell($id, $airplaneData, true, "onclick='flip(this);'");
			} else {
				$averageSpeed = (int)$airplanes[$j][0];
				$parts = explode('.', $airplaneData);
				$airplane = $parts[0];
				$minClimbRate = (int)$parts[1] * 100;
				$maxClimbRate = (int)$parts[2] * 100;
				$speed = isset($parts[3]) ? (int)$parts[3] * 10 : '';
				if ($speed == 460) $speed .= '+';
				$speedValue = (int)str_replace('+', '', $speed);
				$highlight = $averageSpeed > $speedValue ? 'red' : 'green';
				$color = getColor($minClimbRate / 100);
				$photo = "$airplane.jpg";
				$content = "<div class='tdArea'><span class='highlight'>$airplane</span><span class='speed $highlight'>$speed</span><span class='climbRate' style='background-color: $color;'>$minClimbRate-$maxClimbRate</span></div>";
				echo renderCell($id, $content, false, "style='background-image: url(airplanes/$photo);' onclick='flip(this);'");
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

	//Toggle visibility of grid elements by flipping the 'hidden' class
    function flip(ele) {
		ele.classList.toggle('hidden');
	}

	const ths = document.querySelectorAll("th");
	const tds = document.querySelectorAll("td");

    function toggleCells(showHeaders, showPlanes) {
		ths.forEach(th => {
			if (showHeaders) {
				th.classList.remove('hidden');
			} else if (showHeaders !== null) {
				th.classList.add('hidden');
			}
		});
		tds.forEach(td => {
			if (td.innerHTML.trim() !== '') {
				if (showPlanes) {
					td.classList.remove('hidden');
				} else {
					td.classList.add('hidden');
				}
			}
		});
	}

	const showAll = () => toggleCells(true, true);
	const hideAll = () => toggleCells(false, false);
	const showPlanes = () => toggleCells(null, true);
	const hidePlanes = () => toggleCells(null, false);

	//Resizes speed and climb rate text sizes to always remain readable
	function adjustFontSizes() {
		const boxes = document.querySelectorAll('.speed, .climbRate');
		boxes.forEach(box => {
			const containerWidth = box.parentElement.offsetWidth;
			const fontSize = Math.min(Math.max(6, containerWidth * 0.094), 12);
			box.style.fontSize = `${fontSize}px`;
		});
	}

	function debounce(func, wait) {
		let timeout;
		return function (...args) {
			clearTimeout(timeout);
			timeout = setTimeout(() => func.apply(this, args), wait);
		};
	}

	adjustFontSizes();
	window.addEventListener('resize', debounce(adjustFontSizes, 100));

</script>
</body>	
</html>