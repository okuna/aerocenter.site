<!DOCTYPE html>
<html lang="en">
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

		body {
			display: flex;
			flex-direction: column;
			height: 100vh;
			margin: 0;
			padding: 0;
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
			max-height: 14px;
			width: auto;
			overflow: visible;
			text-overflow: none;
		}
			
		.speed {
			left: 1px;
			max-width: 25%;
		}

		.climbRate {
			right: 1px;
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
			flex-wrap: wrap;
			justify-content: space-around;
		}

		.btn-group button {
			flex: 1 0 16%;
			margin: 2px;
			height: 50px;
			background-color: #ab47bc;
			cursor: pointer;
			border: 1px solid black;
			color: black;
			outline: none;
			box-shadow: 0 0 0 2px #000;
		}

		.btn-group button:active {
			background-color: #7905ff;
		}

		/* Adjustments for mobile devices */
		@media (max-width: 1024px) {
			#planeTable {
				display: block;
				overflow-x: auto; /* Enables horizontal scrolling on mobile */
				overflow-y: auto;
				white-space: nowrap;
				max-width: 100%; /* Prevents overflow beyond viewport */
			}
			.cell {
				min-width: 80px;
				height: 55px;
			}
			.speed {
				width: auto;
				max-width: 30%;
			}
			.climbRate {
				width: auto;
				overflow: visible;
				text-overflow: none;
			}
			.highlight {
				font-size: 10px;
			}
			.btn-group {
				flex-wrap: wrap;
				padding: 1px;
			}
			.btn-group button {
				flex: 1 0 calc(33.33% - 4px);
				height: 35px;
				margin: 1px;
				font-size: 14px;
			}

			.btn-group button:nth-child(1) { order: 1; } /* Show All */
			.btn-group button:nth-child(2) { order: 4; } /* Hide All */
			.btn-group button:nth-child(3) { order: 2; } /* Show Planes */
			.btn-group button:nth-child(4) { order: 5; } /* Hide Planes */
			.btn-group button:nth-child(5) { order: 3; } /* Show Headers */
			.btn-group button:nth-child(6) { order: 6; } /* Hide Headers */
		}
			
	</style>
</head>

<body>
<?php
	error_reporting(0);
	//Airplane data entry
	$airplanes = [
		["160", "1 P S", "C172.6.8.12", "C182.8.10.12", "C210.8.10", "PA32.8.10", "BE36.10.12", "PA24.10.12.12", "SR22.10.12", "PA46.11.14"],
		["160", "2 P S", "PA34.11.14", "BE58.14.17", "C421.14.17.20", "PA31.14.17"],
		["200", "1 TP S", "C208.11.14.16", "PC12.15.20"],
		["240", "2 TP S", "BE9T.18.24.20", "B190.18.24", "SW4.18.24", "B350.27.30.27", "C441.27.42"],
		["240", "2 TP L", "DH8.14.17", "SF34.18.24", "DH8D.24.26.27"],
		["300", "4 TP L", "C130.14.17"],
		["460+", "1 J L", "F16.80.100"],
		["320", "2 J S", "C510.20.30", "EA50.20.30", "T37.30.35", "BE40.30.35.43", "C750.35.40.46", "LJ55.40.50.43", "T38.80.100.46"],
		["430", "2 J L", "B712.20.30", "B753.20.30.46", "CRJ2.20.25.40", "CRJ9.20.30", "E145.20.30", "E190.20.25", "A320.30.35", "B738.30.35", "MD82.30.35", "GLF4.40.50.46"],
		["460+", "2 J H", "B772.20.30", "B763.30.35"],
		["460+", "4 J H", "C5.20.30", "C17.20.30.43", "A343.30.35", "E3TF.30.35.43", "B1.30.35", "B2.30.35", "B742.30.35", "K35R.40.45.43"],
		["460+", "4 J J", "A388.30.35"],
		["460+", "8 J H", "B52.30.35"]
	];
	
	//Render tables cells with dynamic attributes
	function renderCell($id, $content, $isHeader = false, $attributes = '') {
		$tag = $isHeader ? 'th' : 'td';
		$class = $isHeader ? 'cell' : ($content ? 'cell airplane-cell' : 'cell blank-cell');
		return "<$tag id='$id' class='$class' $attributes>$content</$tag>";
	}

	//Dynamic table generation
	echo "<table id = 'planeTable'>";
	$maxRows = max(array_map('count', $airplanes));
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
				$minClimbRate = (int)($parts[1] ?? 0) * 100; //Fallback for missing parts
				$maxClimbRate = (int)($parts[2] ?? 0) * 100;
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
			6 => "#FFFF99",
			8 => "#E6FF99",
			10 => "#CCFF99",
			11 => "#B3FF99",
			14 => "#99FFCC", 
			15 => "#99FFFF",
			18 => "#99E6FF",
			20 => "#99CCFF", 
			24 => "#CCB3FF",
			27 => "#E6CCFF",
			30 => "#FFB3E6",
			35 => "#FFCCE6",
			40 => "#FFE6F2",
			80 => "#FFF2CC"
		];
		return $colors[$climbRate] ?? '#cccccc'; //Default color for unexpected rates
	}
?>

	<div class = "btn-group">
		<button onclick = "showAll()">Show All</button>
		<button onclick = "hideAll()">Hide All</button>
		<button onclick = "showPlanes()">Show Planes</button>
		<button onclick = "hidePlanes()">Hide Planes</button>
		<button onclick = "showHeaders()">Show Headers</button>
		<button onclick = "hideHeaders()">Hide Headers</button>
	</div>	
	<script>

	//Toggle visibility of grid elements by adding/removing the 'hidden' class
    function flip(ele) {
		ele.classList.toggle('hidden');
	}

	//Select all header and data cells
	const ths = document.querySelectorAll("th");
	const tds = document.querySelectorAll("td");

	//Master function for toggle buttons
    function toggleCells(showHeaders, showPlanes) {
		ths.forEach(th => {
			if (showHeaders) th.classList.remove('hidden');
			else if (showHeaders !== null) th.classList.add('hidden');
		});
		tds.forEach(td => {
			if (td.innerHTML.trim() !== '') {
				if (showPlanes) td.classList.remove('hidden');
				else if (showPlanes !== null) td.classList.add('hidden');
			}
		});
	}

	const showAll = () => toggleCells(true, true);
	const hideAll = () => toggleCells(false, false);
	const showPlanes = () => toggleCells(null, true);
	const hidePlanes = () => toggleCells(null, false);
	const showHeaders = () => toggleCells(true, null);
	const hideHeaders = () => toggleCells(false, null);

	//Dynamically resizes speed and climb rate text sizes for readability
	function adjustFontSizes() {
		const boxes = document.querySelectorAll('.speed, .climbRate');
		boxes.forEach(box => {
			const containerWidth = box.parentElement.offsetWidth;
			const fontSize = Math.min(Math.max(5, containerWidth * 0.094), 12);
			box.style.fontSize = `${fontSize}px`;
		});
	}

	//Throttles resize events
	function throttle(func, wait) {
		let timeout;
		return function (...args) {
			if (!timeout) {
				timeout = setTimeout(() => {
					timeout = null;
					func.apply(this, args);
				}, wait);
			}
		};
	}

	window.addEventListener('resize', throttle(() => {
		requestAnimationFrame(adjustFontSizes);
	}, 250));

	adjustFontSizes();

</script>
</body>	
</html>