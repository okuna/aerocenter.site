<html>
	<head>
		
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<link rel="manifest" href="manifest.json">
	<meta name="viewport" content="width=device-width, initial-scale =1, minimum-scale=.2, maximum-scale=2, user-scalable=yes" />
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-2"></script>
	<script>
	  window.dataLayer=window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	  gtag('config', 'UA-116666952-2');
	</script>
		
	<title>Aero Center</title>
	
	<style>
		
		body {
			font-family: sans-serif;
		}
		
		.vRoute {
			stroke: blue;
		}
		
		.vorMHZ {
			position: absolute;
			left: 548px;
			top: 500px;
			width: 50%;
		}
		
		input:disabled
		{
		    opacity:1;
		}		
				
		
		.vorDegree {
			border-radius: 3px;
			border: none;
			background: transparent;
			width: 25pt;
			text-transform: uppercase;
		}
		
		.labelText {
			border-radius: 3px;
			border: none;
			background: transparent;
			width: 50pt;
			text-transform: uppercase;

		}
		
		
		.button {
			position: absolute;
			top: 10px;
		}
		
		.button button{
			background-color: #0061c6;
	    color: white;
	    padding: 10px 10px;
	    text-align: center;
	    text-decoration: none;
	    display: inline-block;
	    font-size: 12;
	    

	    margin: 4px 2px;
	    border-radius: 4px;
	    

		}
		
		.button button{
			cursor: pointer;
			border: none;
			
		}
				
		.footer {
			font-family: sans-serif;
			font-size: small;
		}
		
		.errorCount {
			position: fixed;
			background: white;
	    bottom: 10;
	    right: 10;
		}
		
		.checkbox {
			display: inline-block;

		}
		
		.sectorText {
			font-size: x-small;
			white-space: nowrap;
		}
		
		
		

		
	</style>
</head>
<body onload="addInput()">

<div class="button">		
		<a href="/"><button>Back to AeroCenter Site</button></a>
		<button onclick="fillBoxes()">Fill Answers</button>		
		<button onclick="clearBoxes()">Reset</button>		
		<button onclick="toggleSectors()">Toggle Airspace</button>
		<button onclick="hintBoxes()">Hint!</button>				
		<button onclick="checkAll()" id="checkAnswers">Check Answers</button>
		<span class="checkbox"><input class="checkbox" onclick="setAutocorrect()" type="checkbox" name="autocorrect" id="enableAutocorrect"> Autocorrect</span>
</div>

<div id="sectors">	
	<div style="position: absolute; left: 435; top: 470;" class="sectorText">
		66<br>
		JAN LO<br>
		125.0 - 325.0<br>
		45<br>
		VKS HI<br>
		130.25 - 330.25<br>
	</div>
	<div style="position: absolute; left: 260; top: 380;" class="sectorText">
		67<br>
		GLH LO<br>
		126.0 - 326.0
	</div>
	<div style="position: absolute; left: 485; top: 60;" class="sectorText">
		15<br>
		HEE LO<br>
		127.0 - 327.0
	</div>
	<div style="position: absolute; left: 850; top: 150;" class="sectorText">
		12<br>CBM LO<br>128.0 - 328.0
	</div>
	<div style="position: absolute; left: 1100; top: 535;" class="sectorText">
		65<br>
		EWA LO<br>
		129.0 - 329.0
	</div>
	<div style="position: absolute; left: 35; top: 500;" class="sectorText">
		F30<br>
		MLU LO<br>
		135.1 - 335.1
	</div>
	<div style="position: absolute; left: 80; top: 950;" class="sectorText">
		H40<br>
		POE LO<br>
		134.1 - 334.1
	</div>
	<div style="position: absolute; left: 470; top: 1030;" class="sectorText">
		H27<br>
		PCU LO<br>
		133.1 - 333.1
	</div>
	<div style="position: absolute; left: 850; top: 1030;" class="sectorText">
		H65<br>
		MCB HI<br>
		133.25 - 333.25
	</div>
	<div style="position: absolute; left: 50; top: 760; color: green;" class="sectorText">
		MLU APCH<br>
		SFC-060<br>
		118.2 - 258.2
	</div>
	<div style="position: absolute; left: 815; top: 810; color: green;" class="sectorText">
		JAN APCH<br>
		SFC-050<br>
		119.2 - 259.2
	</div>
	<div style="position: absolute; left: 50; top: 725;" class="sectorText">
		ZFW
	</div>
	<div style="position: absolute; left: 50; top: 735;" class="sectorText">
		ZHU
	</div>	
	<div style="position: absolute; left: 1167; top: 985;" class="sectorText">
		ZAE
	</div>	
	<div style="position: absolute; left: 1167; top: 1000;" class="sectorText">
		ZHU
	</div>	
	
	<div style="position: absolute; left: 750; top: 240; color: green;" class="sectorText">
		120.2<br>
		260.2
	</div>
	<div style="position: absolute; left: 800; top: 360; color: red;" class="sectorText">
		<u>Meridian 1 West</u><br>
		8000 MSL to but not including FL180
	</div>
	<div style="position: absolute; left: 800; top: 230; color: red;" class="sectorText">
		<u>Columbus 3 MOA</u><br>
		8000 MSL to but not including FL180
	</div>
	<div style="position: absolute; left: 820; top: 900; color: red;" class="sectorText">
		<u>Meridian 2 West</u><br>
		8000 MSL to but not including FL180
	</div>
</div>




<!-- <div class="errorCount footer">Mistakes: <span id="mistakes">0</span></div> -->


<?php
	echo file_get_contents("map.svg");
?>		


		<div id="labels">
		</div>		
		
		<script src="src.js?id=2025022201">
		</script>
	</body>
</html>
