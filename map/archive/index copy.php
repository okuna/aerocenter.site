<html>
	<head>
<!-- Global site tag (gtag.js) - Google Analytics -->
<script async src="https://www.googletagmanager.com/gtag/js?id=UA-116666952-1"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', 'UA-116666952-1');
</script>
		
		<title>✈️ Map by Keith</title>
		
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
			
			.vorDegree {

				border-radius: 3px;
				border: none;
				background: transparent;
				width: 50pt;
				left: 50%
				transform: translate(-50%, 0);
				font-size: 1.5vmin;
				text-shadow:0px 0px 11px white
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
		</style>
	</head>
	
	<body onload="addInput()">

<div class = "button">		
		<button onclick="fillBoxes()">Fill Answers</button>		
		<button onclick="clearBoxes()">Clear Answers</button>		
		<button onclick="hintBoxes()">Hint!</button>				
</div>


<?php
	include "map.svg";
?>		


		<div id = "labels">
		</div>		
		
		<script>
				var vorArray = [
					"vorJAN_JAN",					
					"vorJAN_005",
					"vorJAN_049",
					"vorJAN_091",
					"vorJAN_106",
					"vorJAN_129",
					"vorJAN_164",
					"vorJAN_179",
					"vorJAN_194",
					"vorJAN_223",
					"vorJAN_251",
					"vorJAN_266",
					"vorJAN_281",
					"vorJAN_300",
					"vorJAN_320",
					"vorJAN_335",
					"vorJAN_350",
					"vorMLU_MLU",					
					"vorMLU_072",
					"vorMLU_087",
					"vorMLU_102",
					"vorSQS_SQS",
					"vorSQS_007",
					"vorSQS_023",
					"vorSQS_086",
					"vorSQS_156",
					"vorSQS_171",
					"vorSQS_186",
					"vorSQS_256",
					"vorSQS_273",
					"vorSQS_341",
					"vorIGB_IGB",					
					"vorIGB_231",
					"vorIGB_266",
					"vorMEI_MEI",
					"vorMEI_272",
					"vorMEI_257",
					"vorMCB_MCB",
					"vorMCB_001",
					"vorMCB_016",
					"vorMCB_345",
					"vorGLH_GLH",
					"vorGLH_092",
					"vorGLH_143",
					"vorHEZ_HEZ",
					"vorHEZ_026",
					"vorHEZ_044",
					"ubaby_UBABY",
					"jelmi_JELMI",					
					"yazoo_YAZOO",
					"kgwo_KGWO",
					"hater_HATER",
					"arguw_ARGUW",
					"rinky_RINKY",
					"dinky_DINKY",
					"signs_SIGNS",					
					"dorts_DORTS",
					"talpy_TALPY",
					"hazal_HAZAL",
					"ricks_RICKS",
					"mizze_MIZZE",
					"zamma_ZAMMA",
					"kjan_KJAN",
					"khks_KHKS",
					"kjvw_KJVW",
					"kvks_KVKS",
					"ble_BLE",					
					"ktvr_KTVR"
				];
			
			function addInput() {

				
				let radius = 70;
				
				for (var i = 0; i < vorArray.length; i++) {
					vorName = vorArray[i].substring(0, vorArray[i].indexOf("_"));
					vorDegree = parseInt(vorArray[i].substring(vorArray[i].indexOf("_") + 1, vorArray[i].length));
					var node = document.createElement("input");  					
					node.style.position = "absolute";					
					node.id = vorArray[i];					
					node.className = "vorDegree";					
					var coords = getCoords(document.getElementById(vorName));	
					node.addEventListener('keyup',function(){checkVOR(this)});									
					
					if (isNaN(vorDegree)) {
						node.setAttribute('placeholder', "ABC");
						node.style.textAlign = "center";
						node.style.left = coords.left;
						node.style.top = coords.top - 15;
					}
					else {
						
						//var rectNode = document.createElementNS("http://www.w3.org/2000/svg","circle");
						//rectNode.setAttribute("r", "3");
	
						node.setAttribute('type', 'tel');
						node.setAttribute('inputmode', 'numeric');
						node.setAttribute('placeholder', "000");
						node.className = "vorDegree";

	
						if (vorDegree < 180) {
							node.style.transform = "rotate("+(vorDegree - 90)+"deg)";
						}
						else {
							node.style.transform = "rotate("+(vorDegree - 270)+"deg)";
							node.style.textAlign = "right";
						}


						
						node.style.left = coords.left + (Math.sin(vorDegree * (Math.PI/180))  * radius);
						node.style.top = coords.top - (Math.cos(vorDegree * (Math.PI/180))  * radius);

						
						//rectNode.setAttribute("cx", parseInt(node.style.left) + 18);
						//rectNode.setAttribute("cy", parseInt(node.style.top));			
					}

					document.getElementById("labels").appendChild(node);
				}
			}
			
			function fillBoxes() {
				for (var i = 0; i < vorArray.length; i++) {
					vorID = vorArray[i].substring(0, vorArray[i].indexOf("_"));
					vorDegree = vorArray[i].substring(vorArray[i].indexOf("_") + 1, vorArray[i].length);
					ele = document.getElementById(vorArray[i]);
					ele.defaultValue = vorDegree;					
					ele.value = vorDegree;					

				}
			}

			function hintBoxes() {
				for (var i = 0; i < vorArray.length; i++) {
					vorID = vorArray[i].substring(0, vorArray[i].indexOf("_"));
					vorDegree = vorArray[i].substring(vorArray[i].indexOf("_") + 1, vorArray[i].length);
					ele = document.getElementById(vorArray[i]);
					if (ele.value == "") {
						ele.defaultValue = vorDegree.substring(0,1);					
						ele.value = vorDegree.substring(0,1);						
					}

				}
			}
			
			
			function clearBoxes() {
				for (var i = 0; i < vorArray.length; i++) {
					ele = document.getElementById(vorArray[i]);
					ele.defaultValue = "";					
					ele.value = "";					

				}
			}
			
			function getCoords(elem) {

			  let box = elem.getBoundingClientRect();
			
			  return {
			    top: box.top + box.height/2 - 14,
			    left: box.left + box.width/2 - 29
			  };
	
			}			

			function checkVOR(ele) {
				var id = ele.id.toUpperCase();
				var input = ele.value.toUpperCase();
				var degrees = id.substring(id.indexOf("_") + 1, id.length);
				console.log(degrees);
//				ele.style.transform = "rotate(-"+(90-degrees)+"deg)";	
			
				if (degrees.substring(0,input.length) == input) {
					ele.style.color = "black";
				}
				else {
					ele.style.color = "red";
				}
			}	
		</script>
	</body>
</html>