/**
 * 
 */


var View = function() {};

/**
 * Current medication that the patient is on
 */
View.currentMeds = ["methotrexate", "prednisone", "metformin"];

View.minCountForMedicationToShow = 3;

/**
 * Render the medication box on the left
 * 
 * @param med is the Medication object holding all the medication data
 */
View.renderMedicationBox = function(med) {
	if (!(med instanceof Medication)) return;
	var meds = med.medarr;
	var medcontent = $("div#leftColumn div#medication div.content");
	medcontent.text("");
	if (meds.length == 0) {
		medcontent.text("No medications for this vignette yet.");
		View.hideFilterOptionAll();
		return;
	}
	var html = "";
	html += "<ul>";
	for (var i=0; i<meds.length; i++) {
		if (meds[i].count < View.minCountForMedicationToShow) continue;
		var upperlevel = meds[i];
		html += "<li>";
		html += "<div class='upperlevel' term='" + upperlevel.term + "'>";
		html += "<input type='checkbox'>"; 
		if (View.currentMeds.indexOf(upperlevel.label.toLowerCase()) >= 0) {
			html += "<div class='text currentmed'><span class='name'>" + upperlevel.label + "</span>"; 
		} else {
			html += "<div class='text'><span class='name'>" + upperlevel.label + "</span>";
		}
		html += "<span class='entryCount'> (" + upperlevel.count + ")</span>" + "</div>";
		html += "<div class='filterOptionOnly'>only</div>";
		html += "</div>";
		// render subcategories
		if (upperlevel.subCategories.length != 0) {
			html += "<ul>";
			for (var j=0; j<upperlevel.subCategories.length; j++) {
				if (upperlevel.subCategories[j].count < View.minCountForMedicationToShow) continue;
				
				var lowerlevel = upperlevel.subCategories[j];
				html += "<li>";
				html += "<div class='sublevel' term='" + lowerlevel.term + "'>";
				html += "<input type='checkbox'>";
				if (View.currentMeds.indexOf(lowerlevel.label.toLowerCase()) >= 0) {
					html += "<div class='text currentmed'><span class='name'>*" + lowerlevel.label + "</span>"; 
				} else {
					html += "<div class='text'><span class='name'>" + lowerlevel.label + "</span>";
				}
				html += "<span class='entryCount'> (" + lowerlevel.count + ")</span>" + "</div>";
				html += "<div class='filterOptionOnly'>only</div>";
				html += "</div>";
				html += "</li>";
			}
			html += "</ul>";
		}
		html += "</li>";
	}
	html += "</ul>";
	// attach the formed html
	medcontent.append(html);
	// show the "show all" filter
	View.showFilterOptionAll();
	// re-attach event handler because these are newly generated contents
	SideBarEventHandler.attachEventToMedicationBox();
};

View.showFilterOptionAll = function() {
	$("div#medication div.title span.filterOptionAll").show();
};

View.hideFilterOptionAll = function() {
	$("div#medication div.title span.filterOptionAll").hide();
};

/**
 * Configurable array of abstract fields that are shown on mouse hover the title and extracted sentence
 */
View.hoverOverFields = ["results", "result", "conclusions", "conclusion"];

/**
 * Check whether a field name is in the hoverOverFields
 * 
 * @param fieldName is the field name to check
 * @returns true if the fieldName is in the array, false otherwise
 */
View.isHoverOverField = function(fieldName) {
	return (fieldName != null && View.hoverOverFields.indexOf(fieldName.toLowerCase()) >= 0) ? true : false;
};

/**
 * convert str to title case (first letter uppercase)
 * @param str
 * @returns
 */
View.__toTitleCase = function(str) {
	return str.replace(/(?:^|\s)\w/g, function(match){
		return match.toUpperCase();
	}); 
};

/**
 * Highlight user selected filters
 * @param content is the content that needs to be searched for terms
 * @param medications is an array of terms to be highlighted
 */
View.__highlightMedications = function(content, medications) {
	if (medications == null) return content;
	for (var i=0; i<medications.length; i++) {
		content = content.replace(medications[i], "<span class='selectedMedsMatch'>" + medications[i] + "</span>");
		content = content.replace(medications[i].toUpperCase(), "<span class='selectedMedsMatch'>" + medications[i].toUpperCase() + "</span>");
		content = content.replace(View.__toTitleCase(medications[i]), "<span class='selectedMedsMatch'>" + View.__toTitleCase(medications[i]) + "</span>");
	}
	return content;
};

/**
 * Render the systematic review view.
 * 
 * @param sr is a SR object which stores all the data needed for presentation
 */
View.renderSRView = function(sr, medNames, limit) {
	if (!(sr instanceof SR)) return;
	var srList = $("div#systematicReview div.ksummary ul");
	// empty current list
	srList.text("");
	if (sr.entryArray.length == 0) {
		srList.append("Sorry, no contents could be retrieved.");
		View.hideCounts($("div#systematicReview div.header div.title span.count"));
	} else {
		var entryArray = sr.entryArray;
		View.showCounts($("div#systematicReview div.header div.title span.count"), entryArray.length, "citations");
		// for each entry, make a li element
		for (i=0; i<entryArray.length; i++) {
			var entry = entryArray[i];
			var abst = entry.abst;
			// create html string
			var html = "";
			
			
//			if (i < limit) {
//				html += "<li>";
//			} else {
//				html += "<li style=\"display:none\">";
//			}
			html += "<li>";
			
			html += "<a target=\"_blank\" href=\"" + entry.link + "\">"; 
			html += View.__highlightMedications(entry.title, medNames);
			html += "</a>";
			html += "<span class=\"jounral bold italic\"> " + entry.source + ".</span>";
			html += "<span class=\"pubdate\"> " + entry.pubdate.split("-")[0] + ".</span>";
			
			html += "<span class=\"relSentence\">";
			html += "<span class=\"results\">";
			
			var hasMoreSentence=false;
			for (var j=0; j<entry.abst.fieldNames.length; j++) {
				var fieldName = entry.abst.fieldNames[j];
				if (fieldName == null) continue;
				fieldName = fieldName.toLowerCase();
				if (fieldName == "results" || fieldName == "result") {
					var content = entry.abst.fieldContents[j];
					html += "<span class='highlight'>";
					html +=	"<span class='bold'> " + fieldName.toUpperCase() +": </span>" + View.__highlightMedications(content, medNames);
					html += "</span>";
					hasMoreSentence=true;
				}
			}
			
			html += "</span>";

			if (entry.summary.length != 0) {
				html += " <span class=\"bold\">Conclusions: </span>";
			} 
			html += View.__highlightMedications(entry.summary, medNames);
			
			if (hasMoreSentence) {
				html += "<span class=\"tunecontent\">more</span>";
				html += "<img class=\"more\"src=\"http://c1.tacdn.com/img2/x.gif\">";
			}
			html += "</span>";
			html += "</li>";
			srList.append(html);
		}
	}
	MainSectionEventHandler.moreContentSRClickHandler();
};

View.renderCTView = function(ct, medNames, limit) {
	if (!(ct instanceof CT)) return;
	var ctList = $("div#clinicalTrial div.ksummary ul");
	// empty current list
	ctList.text("");
	if (ct.entryArray.length == 0) {
		ctList.append("Sorry, no contents could be retrieved.");
		View.hideCounts($("div#clinicalTrial div.header div.title span.count"));
	} else {
		var entryArray = ct.entryArray;
		View.showCounts($("div#clinicalTrial div.header div.title span.count"), entryArray.length, "citations");
		// for each entry, make a li element
		for (i=0; i<entryArray.length; i++) {
			var entry = entryArray[i];
			var abst = entry.abst;
			// create html string
			var html = "";
			if (i < limit) {
				html += "<li>";
			} else {
				html += "<li style=\"display:none\">";
			}
			html += "<a target=\"_blank\" href=\"" + entry.link + "\">"; 
			
			html += View.__highlightMedications(entry.title, medNames);
			html += "</a>";
			html += "<span class=\"jounral bold italic\"> " + entry.source + ".</span>";
			if (entry.pubdate != null) html += "<span class=\"pubdate\"> " + entry.pubdate.split("-")[0] + ".</span>";
			if (entry.fundingSource != null) {
				html += "<span> [" + entry.fundingSource + " funding].</span>";
			}
			if (entry.sampleSize != null) {
				html += "<span> [n=" + entry.sampleSize + "].</span>";
			}
			html += "<span class=\"relSentence\">";
			
			html += "<span class=\"results\">";
			
			var hasMoreSentence=false;
			for (var j=0; j<entry.abst.fieldNames.length; j++) {
				var fieldName = entry.abst.fieldNames[j];
				if (fieldName == null) continue;
				fieldName = fieldName.toLowerCase();
				if (fieldName == "results" || fieldName == "result") {
					var content = entry.abst.fieldContents[j];
					html += "<span class='highlight'>";
					html +=	"<span class='bold'> " + fieldName.toUpperCase() +": </span>" + View.__highlightMedications(content, medNames);
					html += "</span>";
					hasMoreSentence=true;
				}
			}
			html += "</span>";
			
			if (entry.summary.length != 0) {
				html += " <span class=\"bold\">Conclusions: </span>";
			}
			html +=	View.__highlightMedications(entry.summary, medNames);
			if (hasMoreSentence) {
				html += "<span class=\"tunecontent\">more</span>";
				html += "<img class=\"more\"src=\"http://c1.tacdn.com/img2/x.gif\">";
			}
			html += "</span>";
			html += "</li>";
			ctList.append(html);
		}
	}
	MainSectionEventHandler.moreContentCTClickHandler();
};

View.renderUTDView = function(utd, medNames, limit) {
	if (!(utd instanceof UTD)) return;
	var hasContent = false;
	var feeds = utd.feedArray;
	var utdFeeds = $("div#upToDate div.ksummary");
	utdFeeds.text("");
	if (utd.feedArray.length == 0) {
		utdFeeds.text("Sorry, no content is retrieved.");
		View.hideCounts($("div#upToDate div.header div.title span.count"));
	} else {
		// iterate over feeds
		var totalSentences = 0;
		for (var i=0; i<feeds.length; i++) {
			var lastSentenceLabel = ""; // record section title of last sentence to group together sentences within same section
			
			var html = "";
			var feed = feeds[i];
			
			var sentences = feed.entries;
			var j;
			if (sentences.length != 0) {
				html += "<div class=\"feed\">";
				totalSentences += sentences.length;
				hasContent = true;
				html += "<div class=\"feedtitle\">";
				html += "<img src=\"images/expand.jpg\">";
				html += View.__highlightMedications(feed.title, medNames);
				
				html += "<span class=\"count\"> (";
				
				html += (totalSentences <= MAX_SENTENCE ? totalSentences : MAX_SENTENCE);
				
				html +=" sentences)</span>";
				
				html += "</div>";
				html += "<div class=\"feedcontent\" style=\"display:none\">";
				// iterate over sentences
				for (j=0; j<sentences.length; j++) {
					
					var sentence = sentences[j];
					
					if (lastSentenceLabel != sentence.label) {
						if (j<limit) {
							html += "<div class=\"sectiontitle\">";
						} else {
							html += "<div class=\"sectiontitle\" style=\"display:none\">";
						}
						html +=  "<span class=\"bold\">" + View.__highlightMedications(sentence.label, medNames) + "</span>";
						html += "<a target=\"_blank\" href=\"" + sentence.link + "\">";
						// add uptodate logo
						html += "<img src=\"images/utd_logo.png\">";
						html += "</a>";	
						html += "</div>";
						lastSentenceLabel = sentence.label;
					}
					
					if (j < limit) {
						html += "<div class=\"sentence\">";
					} else {
						html += "<div class=\"sentence\" style=\"display:none\">";
					}
					
					// add bullet point at beginning of each sentence
					if (sentence.label == "SUMMARY AND RECOMMENDATIONS") {
						html += "&#8226; ";
					}
					
					var last = feed.getEntry(parseInt(sentence.id) - 1);
					var next = feed.getEntry(parseInt(sentence.id) + 1);
					// previous sentence
					if (last != null) {
						html += "<span class=\"previous highlight\">";
						html += View.__highlightMedications(last.sentence, medNames);
						html += " </span>"
					}
					
					html += View.__highlightMedications(sentence.sentence, medNames);
					
					// following sentence
					if (next != null) {
						html += "<span class=\"next highlight\"> ";
						html += View.__highlightMedications(next.sentence, medNames);
						html += " </span>"
					}
					
					if (last != null || next != null) {
						html += "<span class=\"tunecontent\">more</span>";
						html += "<img class=\"more\"src=\"http://c1.tacdn.com/img2/x.gif\">";
					}
					html += "</div>";
				}
				// if more sentences, then add the "more" button
//				html += "<button class=\"utdmore\">More</button>";
				html += "</div>";
				html += "</div>";
			}
			utdFeeds.append(html);
			totalSentences = 0;
		}
		
	}
	if (!hasContent) {
		utdFeeds.append("sorry, no sentence is retrieved.");
		View.hideCounts($("div#upToDate div.header div.title span.count"));
	}
//	MainSectionEventHandler.utdButtonClickHandler();
	MainSectionEventHandler.moreContentUTDClickHandler();
	MainSectionEventHandler.expandCollapseUTD();
};

View.showCounts = function(selector, count, suffix) {
	selector.text("(" + count + " " + suffix + ")");
};

View.hideCounts = function(selector) {
	selector.text("");
};
