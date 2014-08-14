/**
 * XMLParser class is used to parse and manipulate xml strings
 * 
 * Note that the file name should in the format of disease_type_SOURCE.xml
 * 
 * Dependency: jquery library
 */

var ksAjaxBase = "ajax/getKnowledgeSummary.php";

var medAjaxBase = "ajax/getMedications.php";

/* ------------------------------------- Start medication model ------------------------------------------------ */
var Medication = function() {
	this.xml = null;
	this.medarr = new Array();
};

/**
 * This is data class holding single medication
 */
var MedicationEntry = function() {
	this.count = 0;
	this.label = null;
	this.term = null;
	this.subCategories = new Array(); // subcategories is an array of MedicationEntry objects
};

/**
 * Count number of entries that match this concept/medication
 */
MedicationEntry.prototype.countNumOfTotalEntries = function() {
	var count = 0;
	if (sr.length != 0) count += sr.countNumOfMatchedEntries(this.term);
	if (ct.length != 0) count += ct.countNumOfMatchedEntries(this.term);
	if (utd.length != 0) count += utd.countNumOfMatchedEntries(this.term);
	return count;
};

Medication.prototype.setXml = function(disease) {
	var url = medAjaxBase;
	var words = disease.split(" ");
	var dis = words.join("_");
	url += "?dis=" + dis;
	
	var xml = null;
	$.ajax({
		url: url,
		async: false,
		success: function(data){
			if (data == null) xml = null;
			else xml = XMLParser.getXmlParse(data);
		}
	});
	this.xml = xml;
};

/**
 * Set the medication content based on the given disease type
 * @param disease
 */
Medication.prototype.setMedContent = function(disease) {
	if (disease  == null || disease.length == 0) return;
	this.setXml(disease);
	if (this.xml == null) return;
	
	var upperlevelarr = this.xml.find("feed").children();
	for (var i=0; i<upperlevelarr.length; i++) {
		var upperlevel = upperlevelarr[i];
		var upperlevelMedEntry = this.__ConvertToMedicationEntry(upperlevel);
		var lowerlevelarr = upperlevel.getElementsByTagName("category");
		if (lowerlevelarr.length != 0) {
			for (var j=0; j<lowerlevelarr.length; j++) {
				upperlevelMedEntry.subCategories[j] = this.__ConvertToMedicationEntry(lowerlevelarr[j]);
				upperlevelMedEntry.count += upperlevelMedEntry.subCategories[j].count;
			}
		}
		this.medarr[i] = upperlevelMedEntry;
	}
};

/**
 * Map given HTML element object to MedicationEntry object defined above
 * @param element
 */
Medication.prototype.__ConvertToMedicationEntry = function(element) {
	var medEntry = new MedicationEntry();
	medEntry.label = element.getAttribute("label");
	medEntry.term = element.getAttribute("term");
	medEntry.count = medEntry.countNumOfTotalEntries();
	return medEntry;
};

/* -------------------------------------- Start Systematic Review models ------------------------------------------- */

var SR = function() {
	this.xml = null;
	this.entryArray = new Array();
};

/**
 * Set the xml context
 */
SR.prototype.setXml = function(disease) {
	var url = ksAjaxBase + "?src=sr&dis=";
	if (disease.length > 0) {
		var words = disease.split(" ");
		var dis = words.join("_");
		url += dis;
	}
	var xml = null;
	$.ajax({
		url: url,
		async: false,
		success: function(data){
			xml = XMLParser.getXmlParse(data);
		}
	});
	this.xml = xml;
}; 

/**
 * Set the systematic review content based on selected concepts
 * @param meds is an array of selected concepts
 */
SR.prototype.setSRContent = function(disease, meds) {
	this.setXml(disease);
	if (this.xml == null) return;
	var entries = this.xml.find("entry");
	
	var idx=0;
	for (var i=0; i<entries.length; i++) {
		var entry = this.__ConvertEntryElementToSREntry(entries[i], meds);
		if (entry.show) {
			this.entryArray[idx++] = entry;
		}
	}
	Utility.sortByScore(this.entryArray);
};

/**
 * Whether we should show the article based on concept matching
 * @param element is the article to check against
 * @param concepts is an array of selected concepts
 * @returns {Boolean} true if the element should be shown, false otherwise
 */
SR.prototype.__IsShow = function (element, concepts) {
	if (element == null) return false;
	if (concepts.length == 0) return true;
	var metadata = element.getElementsByTagName("category");
	if (metadata.length == 0) return false;
	var isshow = false;
	for (var i=0; i<metadata.length; i++) {
		var scheme = metadata[i].getAttribute("scheme");
		if (scheme.match(/semanticType/) != null) {
			var label = metadata[i].getAttribute("term");
			if (label.length != 0 && concepts.indexOf(label.toLowerCase()) != -1) {
				isshow = true;
			}
		}
	}
	return isshow;
};

/**
 * Convert an xml entry to SREntry object
 * @param element is an entry element
 * @param concepts is an array of selected concepts
 * @returns {SREntry} is a converted SREntry object
 */
SR.prototype.__ConvertEntryElementToSREntry = function(element, concepts) {
	var srEntry = new SREntry();
	
	// first check whether this entry satisfies the user selection criteria, return if false
	if (!this.__IsShow(element, concepts)) {
		srEntry.show = false;
		return srEntry;
	} 
	var title = element.getElementsByTagName("title");
	var link = element.getElementsByTagName("link");
	var id = element.getElementsByTagName("id");
	var pubdate = element.getElementsByTagName("updated");
	var summary = element.getElementsByTagName("summary");
	var content = element.getElementsByTagName("content");
	var categories = element.getElementsByTagName("category");
	var source = element.getElementsByTagName("source");

	if (title.length != 0) srEntry.title = title[0].textContent;
	else srEntry.title = "";
	
	if (link.length != 0) srEntry.link = link[0].getAttribute("href");
	else srEntry.link = "";
	
	if (id.length != 0) srEntry.id = id[0].textContent;
	else srEntry.id = "";
	
	if (pubdate.length != 0) srEntry.pubdate = pubdate[0].textContent;
	else srEntry.pubdate = "";
	
	if (summary.length != 0) srEntry.summary = summary[0].textContent;
	else srEntry.summary = "";
	
	var sections = content[0].getElementsByTagName("section");
	for (var i=0; i<sections.length; i++) {
		var section = sections[i];
		var sectionId = section.getAttribute("id");
		if (sectionId == null) continue;
		// encode double quotes in the text
		var text = section.getElementsByTagName("fragment")[0].textContent.replace(/"/g, "&quot;");
		srEntry.abst.fieldNames[i] = sectionId;
		srEntry.abst.fieldContents[i] = text;
	}
	
	// find quality probability data element and term codes
	var tcindex = 0; // index for term codes array
	
	for (var i=0; i<categories.length; i++) {
		var scheme = categories[i].getAttribute("scheme");
		if (scheme == "org.openinfobutton.qualityProbability") {
			srEntry.score = categories[i].getAttribute("term");
		}
		
		if (scheme.match(/semanticType/) != null) {
			srEntry.termCodes[tcindex++] = categories[i].getAttribute("term");
		}
	}
	
	srEntry.source = source[0].getAttribute("type");
	return srEntry;
};

/**
 * Count the number of entries that have the given medication term code
 * @param medicationTermCode
 */
SR.prototype.countNumOfMatchedEntries = function(medicationTermCode) {
	var entryArray = this.entryArray;
	if (entryArray.length == 0) return 0;
	var count = 0;
	for (var i=0; i<entryArray.length; i++) {
		if (entryArray[i].hasTermCode(medicationTermCode)) count++;
	}
	return count;
};

/**
 * SREntry class stores information about a systematic review article
 * 
 */
var SREntry = function() {
	this.title = null;
	this.link = null;
	this.id = null;
	this.pubdate = null;
	this.summary = null;
	this.abst = new EntryAbstract();
	this.score = 0.0;
	this.source = null;
	// whether this entry needs to be shown based on some filtering criteria
	this.show = true;
	// store the concept codes of each article
	this.termCodes = new Array();
};

/**
 * Whether entry has the given medication term code
 * @param medicationTermCode
 */
SREntry.prototype.hasTermCode = function(medicationTermCode) {
	if (this.termCodes.length == 0) return false;
	for (var i=0; i<this.termCodes.length; i++) {
		if (this.termCodes[i] === medicationTermCode) {
			return true;
		}
	}
	return false;
};

var EntryAbstract = function() {
	this.objectives = null;
	this.methods = null;
	this.results = null;
	this.conclusions = null;
	
	this.fieldNames = new Array();
	this.fieldContents = new Array();
};

/* -------------------------------------- Start Clinical Trial models ------------------------------------------- */

var CT = function () {
	this.xml = null;
	this.entryArray = new Array();
};

CT.prototype.setXml = function(disease) {
	var url = ksAjaxBase + "?src=rct&dis=";
	if (disease.length > 0) {
		var words = disease.split(" ");
		var dis = words.join("_");
		url += dis;
	}
	var xml;
	
	$.ajax({
		url: url,
		async: false,
		success: function(data){
			xml = XMLParser.getXmlParse(data);
		}
	});
	this.xml = xml;
}; 

CT.prototype.setCTContent = function(disease, meds) {
	this.setXml(disease);
	if (this.xml == null) return;
	var entries = this.xml.find("entry");
	
	var idx=0;
	for (var i=0; i<entries.length; i++) {
		var entry = this.__ConvertEntryElementToCTEntry(entries[i], meds);
		if (entry.show) {
			this.entryArray[idx++] = entry;
		}
	}
	Utility.sortByScore(this.entryArray);
};

CT.prototype.__IsShow = function (element, concepts) {
	if (element == null) return false;
	if (concepts.length == 0) return true;
	var metadata = element.getElementsByTagName("category");
	if (metadata.length == 0) return false;
	var isshow = false;
	for (var i=0; i<metadata.length; i++) {
		var scheme = metadata[i].getAttribute("scheme");
		if (scheme.match(/semanticType/) != null) {
			var label = metadata[i].getAttribute("term");
			if (label.length != 0 && concepts.indexOf(label.toLowerCase()) != -1) {
				isshow = true;
			}
		}
	}
	return isshow;
};

/**
 * 
 * @param element
 * @returns {SREntry}
 */
CT.prototype.__ConvertEntryElementToCTEntry = function(element, concepts) {
	var ctEntry = new CTEntry();
	// first check whether this entry satisfies the user selection criteria, return if false
	if (!this.__IsShow(element, concepts)) {
		ctEntry.show = false;
		return ctEntry;
	} 
	var title = element.getElementsByTagName("title");
	var link = element.getElementsByTagName("link");
	var id = element.getElementsByTagName("id");
	var pubdate = element.getElementsByTagName("updated");
	var summary = element.getElementsByTagName("summary");
	var content = element.getElementsByTagName("content");
	var categories = element.getElementsByTagName("category");
	var source = element.getElementsByTagName("source");

	if (title.length > 0) ctEntry.title = title[0].textContent;
	if (link.length > 0) ctEntry.link = link[0].getAttribute("href");
	if (id.length > 0) ctEntry.id = id[0].textContent;
	if (pubdate.length > 0) ctEntry.pubdate = pubdate[0].textContent;
	ctEntry.summary = summary[0].textContent;
	
	var sections = content[0].getElementsByTagName("section");
	for (var i=0; i<sections.length; i++) {
		var section = sections[i];
		var sectionId = section.getAttribute("id");
		if (sectionId == null) continue;
		// encode double quotes in the text
		var text = section.getElementsByTagName("fragment")[0].textContent.replace(/"/g, "&quot;");
		ctEntry.abst.fieldNames[i] = sectionId;
		ctEntry.abst.fieldContents[i] = text;
	}
	
	// find quality probability data element, funding source, sample size and term codes
	var tcindex = 0; // index for term codes array
	
	for (var i=0; i<categories.length; i++) {
		var scheme = categories[i].getAttribute("scheme");
		if (scheme == "org.openinfobutton.qualityProbability") {
			ctEntry.score = categories[i].getAttribute("term");
		}
		if (scheme == "org.openinfobutton.fundingSourceType") {
			ctEntry.fundingSource = categories[i].getAttribute("term");
		}
		if (scheme == "org.openinfobutton.actualSample") {
			ctEntry.sampleSize = categories[i].getAttribute("term");
		}
		if (scheme.match(/semanticType/) != null) {
			ctEntry.termCodes[tcindex++] = categories[i].getAttribute("term");
		}
	}
	
	ctEntry.source = source[0].getAttribute("type");
	return ctEntry;
};

/**
 * Count the number of entries that have the given medication term code
 * @param medicationTermCode
 */
CT.prototype.countNumOfMatchedEntries = function(medicationTermCode) {
	var entryArray = this.entryArray;
	if (entryArray.length == 0) return 0;
	var count = 0;
	for (var i=0; i<entryArray.length; i++) {
		if (entryArray[i].hasTermCode(medicationTermCode)) count++;
	}
	return count;
};


/**
 * CTEntry class stores information about a systematic review article
 * 
 */
var CTEntry = function() {
	this.title = null;
	this.link = null;
	this.id = null;
	this.pubdate = null;
	this.summary = null;
	this.abst = new EntryAbstract();
	this.score = 0.0;
	this.fundingSource = null;
	this.sampleSize = null;
	this.source = null;
	
	// whether this entry needs to be shown based on some filtering criteria
	this.show = true;
	// store the concept codes of each article
	this.termCodes = new Array();
};

/**
 * Whether entry has the given medication term code
 * @param medicationTermCode
 */
CTEntry.prototype.hasTermCode = function(medicationTermCode) {
	if (this.termCodes.length == 0) return false;
	for (var i=0; i<this.termCodes.length; i++) {
		if (this.termCodes[i] === medicationTermCode) {
			return true;
		}
	}
	return false;
};



/* -------------------------------------- Start UpToDate models ------------------------------------------- */

var UTD = function () {
	this.xml = null;
	this.feedArray = new Array();
};

UTD.prototype.setXml = function(disease) {
	var url = ksAjaxBase + "?src=utd&dis=";
	if (disease.length > 0) {
		var words = disease.split(" ");
		var dis = words.join("_");
		url += dis;
	}
	var xml;
	
	$.ajax({
		url: url,
		async: false,
		success: function(data){
			xml = XMLParser.getXmlParse(data);
		}
	});
	this.xml = xml;
}; 

UTD.prototype.setUTDContent = function(disease, meds) {
	this.setXml(disease);
	if (this.xml == null) return;
	var feeds = this.xml.find("feed");
	for (var i=0; i<feeds.length; i++) {
		this.feedArray[i] = this.__ConvertFeedElementToUTDFeed(feeds[i], meds);
	}
};

/**
 * Whether the sentence needs to be shown
 */
UTD.prototype.__IsShow = function (entry, concepts) {
	if (entry == null) return false;
	if (concepts.length == 0) return true;
	var metadata = entry.getElementsByTagName("category");
	if (metadata.length == 0) return false;
	var isshow = false;
	for (var i=0; i<metadata.length; i++) {
		var scheme = metadata[i].getAttribute("scheme");
		if (scheme.match(/semanticType/) != null) {
			var label = metadata[i].getAttribute("term");
			if (label.length != 0 && concepts.indexOf(label.toLowerCase()) != -1) {
				isshow = true;
			}
		}
	}
	return isshow;
};

UTD.prototype.__ConvertFeedElementToUTDFeed = function(element, concepts) {
	var utdFeed = new UTDFeed();
	
	var title = element.getElementsByTagName("title");
	var link = element.getElementsByTagName("link");
	var id = element.getElementsByTagName("id");
	var entries = element.getElementsByTagName("entry");
	
	utdFeed.title = title[0].textContent;
	utdFeed.link = link[0].getAttribute("href");
	utdFeed.id = id[0].textContent;
	
	var idx=0;
	// convert each entry to UTDEntry which really is a sentence
	for (var i=0; i<entries.length; i++) {
		utdFeed.orgEntries[i] = this.__ConvertEntryToUTDEntry(entries[i]);
		if (this.__IsShow(entries[i], concepts)) {
			utdFeed.entries[idx++] = utdFeed.orgEntries[i];
		}
	}
	
	// get the most relevant sentences upfront
	Utility.sortByScore(utdFeed.entries);
	
//	Utility.sortById(utdFeed.entries, 0, MAX_SENTENCE);
//	Utility.sortById(utdFeed.entries, MAX_SENTENCE, MAX_SENTENCE_FULLWINDOW);
	
	
	// this is intended to group sentences within same section together
	Utility.sortById(utdFeed.entries, 0, MAX_SENTENCE_FULLWINDOW);

	
	
	// TODO customize sorting algorithm: put summary and recommendation section sentences upfront on landing page
	var isLandingPage = true;
	if (concepts.length > 0) isLandingPage = false;
	Utility.prioritizeSummaryAndRecommendation(utdFeed.entries, 0, MAX_SENTENCE_FULLWINDOW, isLandingPage);
	
	return utdFeed;
};

/**
 * Convert xml entry to utd entry which is a sentence
 * @param entry
 */
UTD.prototype.__ConvertEntryToUTDEntry = function(entry) {
	var utdEntry = new UTDEntry();

	var link = entry.getElementsByTagName("link");
	var id = entry.getElementsByTagName("id");
	var section = entry.getElementsByTagName("section");
	var sentence = entry.getElementsByTagName("fragment");
	var categories = entry.getElementsByTagName("category");
	
	utdEntry.link = link[0].getAttribute("href");
	utdEntry.id = id[0].textContent;
	utdEntry.label = section[0].getAttribute("label");
	utdEntry.sentence = sentence[0].textContent;
	
	var tcindex = 0;
	
	for (var i=0; i<categories.length; i++) {
		var scheme = categories[i].getAttribute("scheme");
		if (scheme == "org.openInfobutton.score") {
			utdEntry.score = categories[i].getAttribute("term");
		}
		if (scheme.match(/semanticType/) != null) {
			utdEntry.termCodes[tcindex++] = categories[i].getAttribute("term");
		}
	}

	return utdEntry;
};

/**
 * Count the number of matched sentences in all feeds of this utd object
 * @param medicationTermCode
 * @returns {Number}
 */
UTD.prototype.countNumOfMatchedEntries = function(medicationTermCode) {
	var feedArray = this.feedArray;
	if (feedArray.length == 0) return 0;
	var count = 0;
	for (var i=0; i<feedArray.length; i++) count += feedArray[i].countNumOfMatchedEntries(medicationTermCode);
	return count;
};

/**
 * UTD feed is an upToDate article
 */
var UTDFeed = function() {
	this.title = null;
	this.id = null;
	// array of sentences that are currently shown
	this.entries = new Array();
	// store all the entries for references
	this.orgEntries = new Array();
};

/**
 * Get the entry with the given id
 * @param id
 * @returns
 */
UTDFeed.prototype.getEntry = function(id) {
	if (this.orgEntries.length == 0) return;
	for (var i=0; i<this.orgEntries.length; i++) {
		if (this.orgEntries[i].id == id) return this.orgEntries[i];
	}
};

/**
 * Count the number of matched sentences in the feed
 * @param medicationTermCode
 * @returns {Number}
 */
UTDFeed.prototype.countNumOfMatchedEntries = function(medicationTermCode) {
	var entries = this.entries;
	if (entries.length == 0) return 0;
	var count = 0;
	for (var i=0; i<entries.length; i++) {
		if (entries[i].hasTermCode(medicationTermCode)) count++;
	}
	return count;
};

/**
 * UTD entry is a sentence
 */
var UTDEntry = function() {
	this.link = null;
	this.id = null;
	this.label = null;
	this.sentence = null;
	this.score = 0;
	this.termCodes = new Array();
};

/**
 * Whether entry has the given medication term code
 * @param medicationTermCode
 */
UTDEntry.prototype.hasTermCode = function(medicationTermCode) {
	if (this.termCodes.length == 0) return false;
	for (var i=0; i<this.termCodes.length; i++) {
		if (this.termCodes[i] === medicationTermCode) {
			return true;
		}
	}
	return false;
};


