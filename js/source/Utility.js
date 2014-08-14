/**
 * Utility class that provides functions that general apply to multiple places
 */

var Utility = function() {
	
};

Utility.hideAllSummaryContent = function() {
	$("div#flexcontent").hide();
	$("div#fastcontent").hide();
	$("div#reference").hide();
	$("div#patienthome").hide();
};

Utility.showPatientHome = function() {
	$("div#patienthome").show();
};

Utility.showReference = function() {
	$("div#reference").show();
};

Utility.showFastContent = function() {
	$("div#fastcontent").show();
};

Utility.showFlexContent = function() {
	$("div#flexcontent").show();
};

/**
 * Load the launching page
 */
Utility.loadLaunchPage = function() {
	$("body div#launch").show();
	$("body div#main").hide();
};

Utility.hideLaunchPage = function() {
	$("body div#launch").hide();
	$("body div#main").show();
};

/**
 * Switch to the knowledge summary (flex reference for now)
 */
Utility.fireFlexReference = function() {
	$("div#reference").hide();
	$("div#patienthome").hide();
	$("div#fastcontent").hide();
	$("div#flexcontent").show();

	var flexTab = $("div#topTab ul li#flex");
	flexTab.addClass('current');
	flexTab.siblings().removeClass('current');
	
	var problem = diseaseType;
	var dft = $("div#flexcontent div#default");
	if (problem == "") {
		dft.show();
		dft.siblings().hide();
	} else {
		dft.hide();
		dft.siblings().show();
	}
};

Utility.createTooltip = function() {
	$(document).tooltip(
	{
		show : {
			duration : 800
		},
		hide : {
			duration : 800
		},
		position : {
			my : "center bottom-20",
			at : "center top",
			using : function(position, feedback) {
				$(this).css(position);
				$("<div>").addClass("arrow").addClass(feedback.vertical).addClass(feedback.horizontal).appendTo(this);
			}
		},
		// customize the content in tooltip to highlight certain text
		content: function() {
			var element = $(this);
			return element.attr("title");
		}
	});
};

/**
 * Utility to sort an array according to score field of each object in situ 
 * @param entryArray is an array of objects to be sorted
 */
Utility.sortByScore = function(entryArray) {
	if (entryArray.length == 0) return;
	// i is the element to be inserted
	for (var i=1; i<entryArray.length; i++) {
		var tmp = entryArray[i];
		for (var j = i-1; j >= 0; j--) {
			if (tmp.score > entryArray[j].score){
				entryArray[j+1] = entryArray[j];
			} else {
				entryArray[j+1] = tmp;
				break;
			}
		}
		if (j<0) entryArray[0] = tmp;
	}
};

/**
 * Utility to sort an array according to id field of each object in situ 
 * @param entryArray is an array of objects to be sorted
 * @param start is the starting index of the array to be sorted
 * @param limit is the number of elements to be sorted starting from the given start index
 */
Utility.sortById = function(entryArray, start, limit) {
	if (entryArray.length == 0 /*|| start >= entryArray.length || limit >= entryArray.length || start + limit >= entryArray.length*/) return;
	// i is the element to be inserted
	for (var i=start + 1; i<start + limit && i<entryArray.length; i++) {
		var tmp = entryArray[i];
		for (var j = i-1; j >= 0; j--) {
			if (tmp.id < entryArray[j].id){
				entryArray[j+1] = entryArray[j];
			} else {
				entryArray[j+1] = tmp;
				break;
			}
		}
		if (j<0) entryArray[0] = tmp;
	}
};

Utility.prioritizeSummaryAndRecommendation = function(entryArray, start, limit, isLandingPage) {
	if (entryArray.length == 0 /*|| start >= entryArray.length || limit >= entryArray.length || start + limit >= entryArray.length*/) return;
	
	var summaryEntryIndices = new Array();
	var summaryEntries = new Array();
	var idx=0;
	
	if (!isLandingPage) {
		for (var i=start; i<start + limit && i<entryArray.length; i++) {
			if (entryArray[i].label.toLowerCase() == "summary and recommendations") {
				summaryEntries[idx] = entryArray[i];
				summaryEntryIndices[idx] = i;
				idx++;
			}
		}
	} else {
		for (var i=start; i<entryArray.length; i++) {
			if (entryArray[i].label.toLowerCase() == "summary and recommendations") {
				summaryEntries[idx] = entryArray[i];
				summaryEntryIndices[idx] = i;
				idx++;
			}
		}
	}
	
	// push elements back to make room for summary and recommendations
	var offset = summaryEntries.length;
	var startIdx = summaryEntryIndices[0] - 1;
	for (var j=startIdx; j>=0; j--) {
		entryArray[j+offset] = entryArray[j];
	}
	
	// now put the summary and recommendations at upfront
	for (var k=0; k<offset; k++) {
		entryArray[k] = summaryEntries[k];
	}
	
};

Utility.uncheckAllDescendantInputBox = function(rootElement) {
	rootElement.find("input[type='checkbox']").prop('checked', false);
	rootElement.find(".selected").removeClass('selected');
};

Utility.checkAllDescendantInputBox = function(rootElement) {
	rootElement.find("input[type='checkbox']").prop('checked', true);
	rootElement.find(".upperlevel").addClass('selected');
	rootElement.find(".sublevel").addClass('selected');
};

Utility.showClearButtonWithMedicationSelected = function() {
	var selectedMedication = $("#medication .content").find(".selected");
	
	if(selectedMedication.length == 0) {
		$("#medication .filterOptionNone").hide();
	} else {
		$("#medication .filterOptionNone").show();
	}
};

/***************************************** XMLParser Utility class ******************************************/
var XMLParser = function() {
	
};

XMLParser.getXmlParse = function(xmlString) {
	var xmlString = xmlString;
	var xmlParse = $($.parseXML(xmlString));
	return xmlParse;
};

