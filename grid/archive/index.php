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
			    padding: 15px;
			    text-align: left;
			    border: 1px solid black;
			    text-align: center;
			    width: 8.3333333333%;
			    height: 60px;
			    opacity: 0;
			    
			}			
			th {
				background-color: #55b6ff;
				padding: 0px;
				height: 30px;

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
		array("160", "1 P S", "C172", "C182", "C210", "PA32", "PA24", "BE36", "SR22", "PA46"),
		array("160", "2 P S", "PA34", "PA31", "BE58", "C421"),
		array("200", "1 TP S", "C208", "PC12"),
		array("240", "2 TP S", "BE9T", "B190", "SW4", "B350", "C441"),
		array("240", "2 TP L", "DH8", "SF34", "DH8D"),
		array("300", "4 TP L", "C130"),
		array("460+", "1 J L", "F16"),
		array("320", "2 J S", "C510", "EA50", "T37", "BE40", "C750", "LJ55", "T38"),
		array("430", "2 J L", "CRJ2", "E190", "E145", "CRJ9", "B712", "B753", "B738", "A320", "MD82", "GLF4"),
		array("460+", "2 J H", "B772", "B763"),
		array("460+", "4 J H", "C17", "C5", "E3TF", "A388", "A343", "B1", "B2", "B742", "K35R"),
		array("460+", "8 J H", "B52")
	);
	
	echo "<table id = 'planeTable'>";
	for ($i = 0; $i < 12; $i++) {
		echo "<tr>";		
		for ($j = 0; $j < 12; $j++) {
			$id = $j . "." . $i;			
			if ($i < 2) {
				$airplane = $airplanes[$j][$i];				
				echo "<th id = '$id' onclick = 'reveal(this);'>$airplane</th>";
			}
			else if (array_key_exists($i, $airplanes[$j])) {
				$airplane = $airplanes[$j][$i];				
				echo "<td id = '$id' onclick = 'reveal(this);'>$airplane</td>";
			}
			else {
				echo "<td id = '$id' style = 'background-color: grey;' onclick = 'reveal(this);'></td>";
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
		
		function click(ele) {
			
		}
		
		function reveal(ele) {
			ele.style.opacity = "1";
			var yPos = ele.id.substring(ele.id.indexOf(".") + 1, ele.id.length);
			var xPos = ele.id.substring(0, ele.id.indexOf("."));
			if (ele.innerHTML == "") {
				for (i = yPos; i < 12; i++) {
					var id = xPos + "." + i;
					var blank = document.getElementById(id);
					blank.style.backgroundColor = "gray"
					blank.style.opacity = "1";
				}
				ele.style.backgroundColor = "gray";
			}
			
		}
		
		function hide(ele) {
			ele.style.opacity = "0";
			ele.style.backgroundColor = "white";
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

	