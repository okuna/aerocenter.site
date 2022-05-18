			var vorArray = [
				"vorMHZ_MHZ",					
				"vorMHZ_005",
				"vorMHZ_049",
				"vorMHZ_091",
				"vorMHZ_106",
				"vorMHZ_129",
				"vorMHZ_164",
				"vorMHZ_179",
				"vorMHZ_194",
				"vorMHZ_233",
				"vorMHZ_251",
				"vorMHZ_266",
				"vorMHZ_281",
				"vorMHZ_300",
				"vorMHZ_327",
				"vorMHZ_335",
				"vorMHZ_350",
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
				"deski_DESKI",					
				"yazoo_YAZOO",
				"kgwo_KGWO",
				"hater_HATER",
				"arguw_ARGUW",
				"stuee_STUEE",
				"dinky_DINKY",
				"hedud_HEDUD",					
				"dorts_DORTS",
				"barne_BARNE",
				"hazal_HAZAL",
				"ricks_RICKS",
				"mizze_MIZZE",
				"zamma_ZAMMA",
				"boosi_BOOSI",
				"kjan_KJAN",
				"khks_KHKS",
				"kjvw_KJVW",
				"kvks_KVKS",
				"ble_0M8",					
				"ktvr_KTVR",
				"v427-14_14",
				"v18-15_15",
				"mluv417-16_16",
				"v427-31_31",
				"v18-31_31",
				"v417-31_31",
				"v245-20_20",
				"v417-20_20",
				"v18-19_19",
				"v427-18_18",
				"path3236_20",
				"path5096_26",
				"path3214_21",
				"path3216_21",
				"path3220_33",
				"path3222_35",
				"path3224_35",
				"path3226_16",
				"path3228_12",
				"path3230_12",
				"path3232_14",
				"path3234_17",
				"path3238_17",
				"path3240_17",
				"path3242_24",
				"path3244_23",
				"path3246_25",
				"path3248_13",
				"path3250_14",
				"path3252_26",
				"path3218_21",
				"path4503_V9",
				"path4479_V9-11",
				"path311_V9",
				"path4495_V11",
				"path315_V11",
				"path4465_V18",
				"path4830_V74",
				"path4489_V245",
				"path4511_V245",
				"path4493_V417",
				"path4469_V417",
				"path4461_V427",
				"path4459_V427",
				"path4505_V555",
				"path4483_V555",
				"path4499_V557",
				"path4475_V557",
				"path313_V535",
				"path2831_V278",
				"path4485_V278",
				"path4491_V18",
				"rect12239_75",
				"rect12241_72",
				"rect12243_75",
				"rect12245_120",
				"rect12247_73",
				"rect12249_70",
				"rect12251_102",
				"rect12253_60",
				"rect12255_58",
				"rect12257_60",
				"rect12259_74",
				"rect12233_98",
				"rect12231_95",
				"rect12235_98",
				"rect12237_79",
				"rect12261_36",
				"rect12269_69",
				"rect12267_92",
				"rect12265_87",
				"rect12263_88",
				"path4990_TV",
				"rect13117_19",
				"rect13131_12",
				"rect13133_49",
				"rect13135_49",
				"rect13137_41",
				"rect13139_49",
				"rect13141_49",
				"rect13143_26",
				"rect13145_53",
				"rect13147_37",
				"rect13149_38",
				"rect13151_37",
				"rect13153_38",
				"rect13155_58",
				"rect13157_62",
				"rect13159_46",
				"rect13161_56",
				"rect13163_44",
				"rect13165_30",
				"rect13167_30",
				"rect13169_16",
				"rect13171_42",
				"rect13173_16",
				"rect13175_21",
				"rect13177_26",
				"rect13179_48",
				"rect13181_23",
				"rect13183_64",
				"rect3763_42",
				"rect3800_5000"
			];
			
			var errorCount = 0;							
			
			var autocorrect = false;
			
			function setAutocorrect() {
				checkbox = document.getElementById("enableAutocorrect");
				checkButton = document.getElementById("checkAnswers");
				if (checkbox.checked) {
					autocorrect = true;
					checkButton.style.backgroundColor = "gray";
					checkAll();
				}
				else {
					autocorrect = false;
					checkButton.style.backgroundColor = "#0061c6";
				}
			}
				
			function addInput() {

				
				var radius = 50;
				
				
				for (var i = 0; i < vorArray.length; i++) {
					var vorName = vorArray[i].substring(0, vorArray[i].indexOf("_"));
					var vorData = vorArray[i].substring(vorArray[i].indexOf("_") + 1, vorArray[i].length);
					var vorDegree = parseInt(vorData);
					var vorElement = document.getElementById(vorName);
					if (!vorElement) continue;
					var coords = getCoords(vorElement);	

					var node = document.createElement("input");  										
					node.style.position = "absolute";					
					node.id = vorArray[i];					
					node.className = "vorDegree";					

					node.addEventListener('keyup',function(){doInput(this)});									
					//airports, NAVAIDS, intersections
					if (isNaN(vorDegree) || vorName == "ble") {
						node.setAttribute('placeholder', "ABC");
						node.setAttribute("type", "text");
						//airway names starting with V
						if (vorData.substring(0, 1) == "V") {
							node.setAttribute('placeholder', "V00");		
						}
						
						node.setAttribute("spellcheck", "false");
						node.setAttribute("class","labelText");
						node.style.textAlign = "center";
						node.style.left = coords.left;
						node.style.top = coords.top - 15;
					}
					//degrees around VOR circle 
					else if (vorName.substring(0, 3) == "vor") {
						
						//var rectNode = document.createElementNS("http://www.w3.org/2000/svg","circle");
						//rectNode.setAttribute("r", "3");
	
						node.setAttribute('type', 'tel');
						node.setAttribute('inputmode', 'numeric');
						node.setAttribute('placeholder', "000");
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
					//boundary numbers (diamond box)
					else {						
						if (vorName.substring(0,4) == "rect") {
			
							var rotation = document.getElementById(vorName).getAttribute("transform");
							if (rotation !== null) {
								rotation = rotation.substring(0, rotation.length - 1);

								node.style.transform = rotation + "deg)";
							}
						}
						
						node.setAttribute('placeholder', "00");
						node.setAttribute('type', 'tel');
						node.setAttribute('inputmode', 'numeric');
						node.style.textAlign = "center";
						node.style.left = coords.left;
						node.style.top = coords.top;
					}					


					document.getElementById("labels").appendChild(node);
					

					var node = document.getElementById(node.id);
					var box = node.getBoundingClientRect();						

					node.style.left = parseFloat(node.style.left) - (node.offsetWidth / 2);
					node.style.top = parseFloat(node.style.top) - (node.offsetHeight / 2);					

				}
			}
			
			function fillBoxes() {
				for (var i = 0; i < vorArray.length; i++) {
					vorID = vorArray[i].substring(0, vorArray[i].indexOf("_"));
					vorDegree = vorArray[i].substring(vorArray[i].indexOf("_") + 1, vorArray[i].length);
					ele = document.getElementById(vorArray[i]);
					ele.style.color = "black";
					ele.disabled = false;

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
					ele.style.color = "black";
					ele.style.background = "transparent";
					ele.disabled = false;
				
					ele.value = "";					
					errorCount = 0;
					//document.getElementById("mistakes").innerHTML = 0;

				}
			}
			
			function getCoords(elem) {

			  var box = elem.getBoundingClientRect();
			
			  return {
			    top: box.top + box.height/2,
			    left: box.left + box.width/2
			  };
	
			}			
			
			function getAngle(elem) {

			}
			
			function doInput(ele) {
				if (autocorrect) {
					checkBoxes(ele);
				}
			}
			
			function checkAll() {
				for (var i = 0; i < vorArray.length; i++) {
					ele = document.getElementById(vorArray[i]);
					checkBoxes(ele);

				}
			}
			
			function toggleSectors() {
				var sectors = document.getElementById("sectors");
				if (sectors.style.display === "none") {
					sectors.style.display = "block";
				} 
				else {
					sectors.style.display = "none";
				}
			}


			function checkBoxes(ele) {
				var id = ele.id.toUpperCase();
				ele.value = ele.value.toUpperCase();
				var input = ele.value.toUpperCase();
				var degrees = id.substring(id.indexOf("_") + 1, id.length);
	//				ele.style.transform = "rotate(-"+(90-degrees)+"deg)";	
			
				if (degrees.substring(0,input.length) == input) {
					ele.style.color = "black";
				}
				else {
/*
				var key = event.keyCode || event.charCode;
		    if (key != 8 && key != 46 && (ele.value.length == 1 || ele.style.color == "black")) {
					errorCount++;    
		    }			
*/
				ele.style.color = "red";
				ele.style.background = "rgba(255,255,0, .5)";

			  }
			  if (degrees == input) {
				  ele.disabled = true;
				  ele.style.color = "#055a00";
			  }
				console.log(errorCount);
//				document.getElementById("mistakes").innerHTML = errorCount;

				
				
				
			}	
