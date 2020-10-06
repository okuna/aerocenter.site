<html>
	<head>
		
	<meta name="apple-mobile-web-app-capable" content="yes">
	<meta name="mobile-web-app-capable" content="yes">
	<link rel="manifest" href="manifest.json">
	<meta name="viewport" content = "width = device-width, initial-scale =1, minimum-scale = .2, maximum-scale = 2, user-scalable = yes" />
	<!-- Global site tag (gtag.js) - Google Analytics -->
	<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-2"></script>
	<script>
	  window.dataLayer = window.dataLayer || [];
	  function gtag(){dataLayer.push(arguments);}
	  gtag('js', new Date());
	  gtag('config', 'UA-116666952-2');
	</script>
		
	<title>Fake ERAM V0.1</title>
	
	<style>
		
		body {
			font-family: monospace;
			background: black;
			color: white;
		}
		
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
			position: fixed;
			top: 10px;
		}
		
		.button button{
			background-color: #2e2e2e;
	    color: yellow;
	    padding: 10px 10px;
	    text-align: center;
	    text-decoration: none;
	    display: inline-block;
	    font-size: 12;
	    border: 1px solid yellow;
	    margin: 4px 2px;
	    font-family: monospace;
	    

		}
		
		
		
		.button select {
			display: inline-block;
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

		}
		
		svg {
			fill: white !important;
		}
		
		.datablock {
			font-family: monospace;
			font-size: small;
			color: rgba(255, 247, 0, 0.5);
			white-space: nowrap;
		}
		
		.dwell-lock {
			color: yellow;
		}
		
		.target {
			position: absolute;
			top: 100;
			left: 100;
		}
		
		.keyboard {
			position: fixed;
			bottom: 0;
			opacity: .8;
		}
		
		table {
			border-collapse: collapse;
			display: inline-block;

		}
		
		table, th, td {
			border: 1px solid white;
		}
		
		td {
			height: 50px;
			width: 50px;
			background-color: black;
			text-align: center;
		}
		
		.orange {
			background-color: #c8aa00;
		}
		
		.edge {
			border-left: 5px solid white;
		}
		
		.output {
			height: 50px;
			background-color: #333333;
			border: 1px solid white;
			font-family: monospace;
			font-size: medium;
		}
		
		.input-box {
			width: 100%;
			background: #202020;
			border: 1px solid white;
			color: white;
			font-family: monospace;
			outline: none;
		}
		
		.input-box:focus {
			background: #565656;
		}
		
		.plane {
			height: 10px;
			width: 10px;
			transform: rotate(45deg);
			display: block;
			border: 1px solid yellow;
			
		}
		
		.trail {
			position: absolute;
			height: 15px;
			width: 5px;

			display: block;
			transform: rotate(-45deg);
			border-right: 1px solid yellow;
		}
		
		.pointer {
			position: absolute;
			transform-origin: bottom;
			height: 20px; 
 			width: 0px; 
			display: block;
			border-right: 1px solid yellow;
		}
		
		.scenarioBox > textarea {
			width: 100%;
			opacity: .8;
			background-color: grey;
			color: white;
			font-family: monospace;


		}
		.scenarioBox {
			display: none;			
		}
		
		.helpbox {
			display: none;
			background-color: grey;
			color: white;
			font-family: monospace;
			font-size: small;
			width: 100%;
			max-width: 1000px;
			opacity: .8;
			padding: 5px;
		}
		
		a {
			color: white;
		}
		
		input {
			text-transform: uppercase;
		}
		
	</style>
</head>
<body>
		
<div id = "planes"></div>	
	
<!-- <div class = "errorCount footer">Mistakes: <span id = "mistakes">0</span></div> -->

<div class = "map">
	<div class = "button">
		<span>Fake ERAM v0.1</span>
		<span class = "clock" id="clock">00:00:00</span>		
<!-- 		<button onclick = "resetPlanes()">Shuffle Airplanes</button> -->
		<button onclick = "makePlane()">Random Target</button>
		<button onclick = "clearPlanes()">Reset</button>
		<button onclick = "showScenarioBox()">Script</button>
		<button onclick = "showHelp()">Help</button>
		<span class = "background">
			Vector 
		</span>	
		<select onchange ="setVectorLength(this.value);">
			<option>0</option>
			<option selected>1</option>
			<option>2</option>
			<option>4</option>
			<option>8</option>
		</select>	
		
		<div class = "helpbox" id = "helpbox">
			Supported Commands:<br>
			<ul>
				<li>QP [sector] [ACID] - Practice pointing out</li>
				<li>QZ [altitude] [ACID] - Assign altitude to airplane</li>
				<li>FP [callsign] [type] [code] [speed] [fix] [time] [altitude] [upcoming route] - create a moving target. Route cannot have airways. Plane will appear at [time]. Use "EXX00" as time to have the target appear immediately.</li>
				<ul>
					<li>Example: FP HELLO1 F22/G 1234 450 SQS230005 EXX00 200 KGWO..BLE..MCB..KIAH</li>
				</ul>
				<li>RS [ACID] - delete target and all its associated data</li>
				<li>FR [ACID] - View flight plan information</li>
				<li>TIME [time] - set the clock. Use TIME NOW to set to the current time.</li>
			</ul>
			[ACID] may be callsign, CID, or beacon code<br>
			Scripting:<br>
			<ul>
			<li>Use multiple commands to write out a scenario. The first line must be the scenario name, and the second line should be a TIME command.</li>	
			</ul>
			
			<hr>
			More features coming soon. Probably. Contact <a href = "mailto:coordinate@areocenter.site">coordinate@areocenter.site</a> with questions/issues. 
		</div>
		<div class = "scenarioBox" id = "scenarioBox">
			<textarea rows = "10" placeholder = "Enter SCENARIO NAME followed by TIME and FP commands..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false" id = "scenarioEntry"></textarea>
		<span class = "background">
			Load Scenario 
		</span>	
		<select onchange ="loadScenario(this.value);">
			<option value="" selected hidden>Select Scenario...</option>
			<option value = "11M">11 M</option>
			<option value = "PO">Point outs</option>
		</select>	
			
			<button onclick = "runScenario()">Run Script!</button>
		</div>
	</div>

<?php
	echo file_get_contents("map.svg");
?>		

</div>

<div class = keyboard>
	
	<table id = "keyboard-buttons">
		<tr>
			<td>&darr;</td><td class = "edge">RS</td><td>SR</td><td>CRD</td><td>DROP TRK</td><td>CODE</td><td>DM</td><td class = "edge">AM</td><td>RTE</td><td>FR</td>
		</tr>
		<tr>
			<td>&#xff0a;</td><td class = "edge">FP</td><td>CP</td><td>RF</td><td>RPT</td><td class = "orange">TRK</td><td>HALO</td><td class = "edge">INT</td><td class = "orange">PVD</td><td>ALT</td>
		</tr>
	</table>
	
	<div class = "output" id = "outputBox"></div>
	
	<div class = "input">
		<input class = "input-box" type = "text" id = "messageBox" onkeypress = "parseMessageBox()" placeholder = "Enter a supported ERAM message..." autocomplete="off" autocorrect="off" autocapitalize="off" spellcheck="false"></input>
	</div>
</div>

	<div id = "labels">
	</div>		
<script type="text/javascript" src="fixes.json"></script>
<script type="text/javascript" src="clock-1.js"></script>	
<script type="text/javascript" src="airplane-v1-2.js"></script>	
<script type="text/javascript" src="src-v1-2.js"></script>
	</body>
</html>