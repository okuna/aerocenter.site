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
			    opacity: 0;
			    background-size: cover;
			    background-position: center center; 
			    
			}			
			
			td {
				vertical-align: top;
			}
			
			td > div {
			  position: relative;
			  height: 60px;
			  padding: 0;
			}

			
			.climbRate {
				position: absolute;
				right: 1px;
				bottom: 1px;
				font-size: x-small;
			}		
			
			th {
				background-color: #63ceff;
				padding: 0px;
				height: 30px;

			}
			
			.highlight {
				background: rgba(255, 255, 255, 0.71); 
			}
			
			
			.btn-group {
				width: 16.666%;	
			}
			
			.btn-group button {
				width: 50%;
		    border: 1px solid black; /* Green border */
		    border-top: none;

		    padding: 10px 24px; /* Some padding */
		    height: 60px;
		    
		    background-color: #ff60e8;

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
		array("160", "1 P S", "C172.6", "C182.8", "C210.8", "PA32.8", "PA24.10", "BE36.10", "SR22.10", "PA46.11"),
		array("160", "2 P S", "PA34.11", "PA31.14", "BE58.14", "C421.14"),
		array("200", "1 TP S", "C208.11", "PC12.15"),
		array("240", "2 TP S", "BE9T.18", "B190.18", "SW4.18", "B350.27", "C441.27"),
		array("240", "2 TP L", "DH8.14", "SF34.18", "DH8D.24"),
		array("300", "4 TP L", "C130.14"),
		array("460+", "1 J L", "F16.80"),
		array("320", "2 J S", "C510.20", "EA50.20", "T37.30", "BE40.30", "C750.35", "LJ55.40", "T38.80"),
		array("430", "2 J L", "CRJ2.20", "E190.20", "E145.20", "CRJ9.20", "B712.20", "B753.20", "B738.30", "A320.30", "MD82.30", "GLF4.40"),
		array("460+", "2 J H", "B772.20", "B763.30"),
		array("460+", "4 J H", "C17.20", "C5.20", "E3TF.30", "A388.30", "A343.30", "B1.30", "B2.30", "B742.30", "K35R.40"),
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
				$airplane = substr($airplanes[$j][$i], 0, strpos($airplanes[$j][$i], "."));
				$climbRate = substr($airplanes[$j][$i], strpos($airplanes[$j][$i], ".") + 1) * 100;
				$photo = $airplane . ".jpg";
				echo "<td id = '$id' style = 'background-image: url(airplanes/$photo);' onclick = 'flip(this);'><div class = 'tdArea'><span class = 'highlight'>$airplane</span><span class = 'climbRate highlight'>$climbRate</span></div></td>";
			}
			else {
				echo "<td id = '$id' style = 'background-color: grey;' onclick = 'flip(this);'></td>";
			}

						
		}
		echo "</tr>";
	}
	echo "</table>";
	
?>


	<div class = "btn-group">
		<button onclick = "showAll()">Show All</button>
		<button onclick = "hideAll()">Hide All</button>
	</div>	
	<script>
		
		function flip(ele) {
			console.log("1");
			if (ele.style.opacity == 1) {
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
			table = document.getElementsByTagName("td");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "1";
			}
			table = document.getElementsByTagName("th");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "1";
			}
	
		}
		
		function hideAll() {
			table = document.getElementsByTagName("td");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "0";
			}
			table = document.getElementsByTagName("th");
			for (i = 0; i < table.length; i++) {
				table[i].style.opacity = "0";
			}
			
		}
		
	
	</script>

		
	</body>	
</html>

	