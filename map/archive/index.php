<html>
	<head>
		
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<link rel="manifest" href="manifest.json">
	<meta name="viewport" content = "width = device-width, initial-scale =1, minimum-scale = .2, maximum-scale = 2, user-scalable = yes" />
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-1"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	  gtag('config', 'UA-116666952-1');
	</script>
		
	<title>Aero Center</title>
	
	<style>
		
		.vRoute {
			stroke: blue;
		}
		
		.vorJAN {
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
			background-color: #007cff;
	    border: none;
	    color: white;
	    padding: 15px 32px;
	    text-align: center;
	    text-decoration: none;
	    display: inline-block;
	    font-size: 16px;
	    margin: 4px 2px;
	    border-radius: 4px;
	    cursor: pointer;

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
		

		
	</style>
</head>
<body onload="addInput()">

<div class = "button">		
		<button onclick="fillBoxes()">Fill Answers</button>		
		<button onclick="clearBoxes()">Reset</button>		
		<button onclick="hintBoxes()">Hint!</button>				
</div>

<!-- <div class = "errorCount footer">Mistakes: <span id = "mistakes">0</span></div> -->


<?php
	echo file_get_contents("map.svg");
?>		


		<div id = "labels">
		</div>		
		
		<script src = "map-mini.js">
		</script>
	</body>
</html>