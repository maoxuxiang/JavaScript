/**
 * EventHandler serves as the controller of the application, receiving events
 * from user, conduct corresponding actions and render approriate views
 */

var sr = new SR();
var ct = new CT();
var utd = new UTD();
var medications = new Medication();

var EventHandler = function() {
	this.initEvent();
};

EventHandler.prototype.initEvent = function() {
	window.onload = this.windowOnLoad();
	this.launchPageEventHandler = new LaunchPageEventHandler();
	this.topTabEventHandler = new TopTabEventHandler();
	this.sideBarEventHandler = new SideBarEventHandler();
	this.mainSectionEventHandler = new MainSectionEventHandler();
	
	Utility.loadLaunchPage();
};

/**
 * define some events that need to occur on loading the window
 */
EventHandler.prototype.windowOnLoad = function() {
//	var current = $("div#content div#summary div.current");
//	current.show();
//	current.siblings().hide();

	//	Utility.fireFlexReference();
	LaunchPageEventHandler.enableExpandCollapse();

	Utility.createTooltip();
	
	$(document).ajaxStart(function() {
		$("div.modal").show();
	});

	$(document).ajaxStop(function() {
		$("div.modal").fadeOut('slow');
	});
	
//	SideBarEventHandler.__ShowMedicationBox();
//	SideBarEventHandler.loadKSAndRenderView();
};


/** ------------------------ LaunchPageEventHandler ------------------------------- */
var LaunchPageEventHandler = function() {
	this.initEvent();
};

LaunchPageEventHandler.prototype.initEvent = function() {
	this.onClick();
};

LaunchPageEventHandler.prototype.onClick = function() {
	$("div#launch span.diseasetext").click(function(e) {
		e.stopPropagation();
		diseaseType = $(this).attr("value").toLowerCase();
		Utility.hideLaunchPage();
		Utility.fireFlexReference();
		Utility.showClearButtonWithMedicationSelected();
		SideBarEventHandler.loadKSAndRenderView();
		SideBarEventHandler.__ShowMedicationBox();
		MainSectionEventHandler.showUTDMoreButton();
	});
};

/**
 * Enable the expand and collapse feature on the launching page
 */
LaunchPageEventHandler.enableExpandCollapse = function() {
	var icons = {
	  header: "ui-icon-circle-arrow-e",
	  activeHeader: "ui-icon-circle-arrow-s"
    };
	$("div#launch div#accordion").accordion({
		collapsible: true,
		heightStyle: "content",
		icons: icons,
		active: 9
	});
};

/** *********************** TopTabEventHandler ********************************* */

var TopTabEventHandler = function() {
	this.initVar();
	this.initEvent();
};

TopTabEventHandler.prototype.initVar = function() {
	this.tab = $("div#topTab ul li");

};

TopTabEventHandler.prototype.initEvent = function() {
	this.onClick();
	this.onHover();
};

/**
 * For clicking the top tabs, no real change of content takes place, just
 * selecting content to show
 */
TopTabEventHandler.prototype.onClick = function() {
	this.tab.click(function() {
		// tabs
		$(this).addClass('current');
		$(this).siblings().removeClass('current');

		Utility.hideAllSummaryContent();
		switch ($(this).attr('id')) {
		case 'flex':
			Utility.fireFlexReference();
			break;
		case 'fast':
			Utility.showFastContent();
			break;
		case 'reference':
			Utility.showReference();
			break;
		case 'phome':
			Utility.showPatientHome();
			break;
		}
	});
	
	$("div#main h1 span.backtohome").click(function(){
		Utility.loadLaunchPage();
	});
};

TopTabEventHandler.prototype.onHover = function() {

};

/** *********************** SideBarEventHandler ********************************* */

var SideBarEventHandler = function() {
	this.initVar();
	this.initEvent();
};

SideBarEventHandler.prototype.initVar = function() {
	
};

SideBarEventHandler.prototype.initEvent = function() {
	SideBarEventHandler.attachEventToProblemBox();
	SideBarEventHandler.attachEventToMedicationBox();
};

/**
 * Show the correct medication box based on the user selected problem
 */
SideBarEventHandler.__ShowMedicationBox = function() {
	medications = new Medication();
	medications.setMedContent(diseaseType);
	View.renderMedicationBox(medications);
	Utility.uncheckAllDescendantInputBox($("div#medication"));
};

/**
 * Problem box deprecated
 */
SideBarEventHandler.attachEventToProblemBox = function() {
	// for problem list
//	$("div#problemList ul li").click(function() {
//		if ($(this).hasClass('selected')) {
//			$(this).removeClass('selected');
//			// uncheck the box
//			$(this).children('input').prop('checked', false);
//		} else {
//			$(this).siblings().removeClass('selected');
//			$(this).siblings().children('input').prop('checked', false);
//			
//			$(this).addClass('selected');
//			// check the box
//			$(this).children('input').prop('checked', true);
//		}
//		Utility.fireFlexReference();
//		SideBarEventHandler.__ShowMedicationBox();
//		SideBarEventHandler.loadKSAndRenderView();
//		MainSectionEventHandler.showUTDMoreButton();
//	});
};

SideBarEventHandler.attachEventToMedicationBox = function() {
//	$("div#medication div.sublevel *").click(function() {
//		var parent = $(this).parent();
//		if ($(this).hasClass('filterOptionOnly')) {
//			Utility.uncheckAllDescendantInputBox($(this).parent().parent().parent().parent().parent());
//		}
//		if (parent.hasClass('selected') && !$(this).hasClass('filterOptionOnly')) {
//			parent.removeClass('selected');
//			// uncheck the box
//			parent.children('input').prop('checked', false);
//		} else {
//			parent.addClass('selected');
//			// check the box
//			parent.children('input').prop('checked', true);
//		}
//		Utility.fireFlexReference();
//		SideBarEventHandler.loadKSAndRenderView();
//		MainSectionEventHandler.showUTDMoreButton();
//	});
	
	// for show all filter
	$("div#medication div.title span.filterOptionAll").click(function(){
		Utility.checkAllDescendantInputBox($(this).parent().parent());
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		MainSectionEventHandler.showUTDMoreButton();
	});
	
	// for clear all filter
	$("div#medication div.title span.filterOptionNone").click(function(){
		Utility.uncheckAllDescendantInputBox($(this).parent().parent());
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		MainSectionEventHandler.showUTDMoreButton();
	});
	
	$("div#medication div.sublevel input").click(function() {
		var parent = $(this).parent();
		if (parent.hasClass('selected')) {
			parent.removeClass('selected');
			// uncheck the box
			parent.children('input').prop('checked', false);
		} else {
			parent.addClass('selected');
			// check the box
			parent.children('input').prop('checked', true);
		}
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
//		MainSectionEventHandler.showUTDMoreButton();
	});
	
	$("div#medication div.sublevel div.text").click(function() {
		var parent = $(this).parent();
		if (parent.hasClass('selected')) {
			parent.removeClass('selected');
			// uncheck the box
			parent.children('input').prop('checked', false);
		} else {
			parent.addClass('selected');
			// check the box
			parent.children('input').prop('checked', true);
		}
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
//		MainSectionEventHandler.showUTDMoreButton();
	});
	
	$("div#medication div.sublevel div.filterOptionOnly").click(function() {
		var parent = $(this).parent();
		Utility.uncheckAllDescendantInputBox($(this).parent().parent().parent().parent().parent());
		if (parent.hasClass('selected')) {
			parent.removeClass('selected');
			// uncheck the box
			parent.children('input').prop('checked', false);
		} else {
			parent.addClass('selected');
			// check the box
			parent.children('input').prop('checked', true);
		}
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		MainSectionEventHandler.showUTDMoreButton();
	});
	
	// hover over each medication
	$("div#medication div.upperlevel, div#medication div.sublevel")
		.mouseover(function(){
			$(this).find("div.filterOptionOnly").addClass("show");
		})
		.mouseout(function(){
			$(this).find("div.filterOptionOnly").removeClass("show");
		});

	
	$("div#medication div.upperlevel input").click(function(){
		var parent = $(this).parent();
		var grandparent = parent.parent();
		if (parent.hasClass('selected')) {
			Utility.uncheckAllDescendantInputBox(grandparent);
		} else {
			Utility.checkAllDescendantInputBox(grandparent);
		}
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		// when click here while some section is on full screen display
//		MainSectionEventHandler.showUTDMoreButton();
	});
	
	$("div#medication div.upperlevel div.text").click(function(){
		var parent = $(this).parent();
		var grandparent = parent.parent();
		if (parent.hasClass('selected')) {
			Utility.uncheckAllDescendantInputBox(grandparent);
		} else {
			Utility.checkAllDescendantInputBox(grandparent);
		}
		Utility.showClearButtonWithMedicationSelected();
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		// when click here while some section is on full screen display
//		MainSectionEventHandler.showUTDMoreButton();
	});
	
	$("div#medication div.upperlevel div.filterOptionOnly").click(function(){
		var parent = $(this).parent();
		Utility.uncheckAllDescendantInputBox(parent.parent().parent());
		parent.addClass('selected');
		Utility.checkAllDescendantInputBox(parent.parent());
		Utility.fireFlexReference();
		SideBarEventHandler.loadKSAndRenderView();
		// when click here while some section is on full screen display
		MainSectionEventHandler.showUTDMoreButton();
		Utility.showClearButtonWithMedicationSelected();
	});
};

/**
 * Function to load all contents in the knowledge summary section
 */
SideBarEventHandler.loadKSAndRenderView = function() {
	// retrieve content and render view
	var medTermCodes = SideBarEventHandler.getSelectedMedicationsTermCode();
	var medNames = SideBarEventHandler.getSelectedMedicationsNames();
//	var diseaseType = SideBarEventHandler.getSelectedDiseaseType();
	
	SideBarEventHandler.loadSRAndRenderView(diseaseType, medTermCodes, medNames);
	SideBarEventHandler.loadCTAndRenderView(diseaseType, medTermCodes, medNames);
	SideBarEventHandler.loadUTDAndRenderView(diseaseType, medTermCodes, medNames);
};

/**
 * Function to load systematic review section and render corresponding view
 * 
 * @param medNames is an array of medication names that are currently selected
 */
SideBarEventHandler.loadSRAndRenderView = function(diseaseTypes, medTermCodes, medNames) {
	sr = new SR();
	sr.setSRContent(diseaseTypes, medTermCodes);
	View.renderSRView(sr, medNames, MAX_ARTICLE);
	MainSectionEventHandler.paginationSR(MAX_ARTICLE);
};

/**
 * Function to load clinical trial section and render corresponding view
 * 
 * @param medNames is an array of medication names that are currently selected
 */
SideBarEventHandler.loadCTAndRenderView = function(diseaseTypes, medTermCodes, medNames) {
	ct = new CT();
	ct.setCTContent(diseaseTypes, medTermCodes);
	View.renderCTView(ct, medNames, MAX_ARTICLE);
	MainSectionEventHandler.paginationCT(MAX_ARTICLE);
};

/**
 * Function to load upToDate section and render corresponding view
 * 
 * @param medNames is an array of medication names that are currently selected
 */
SideBarEventHandler.loadUTDAndRenderView = function(diseaseTypes, medTermCodes, medNames) {
	utd = new UTD();
	utd.setUTDContent(diseaseTypes, medTermCodes);
	View.renderUTDView(utd, medNames, MAX_SENTENCE);
};

/**
 * Retrieve the currently selected medication names for knowledge retrievel
 * 
 * @returns Array is an array of strings, which are medication names
 */
SideBarEventHandler.getSelectedMedicationsTermCode = function() {
	var meds = $("div#medication .selected");
	if (meds == null) return null;
	var medTermCodes = new Array();
	for (var i=0; i<meds.length; i++) {
		medTermCodes[i] = meds[i].getAttribute('term').toLowerCase().trim();
	}
	return medTermCodes;
};


SideBarEventHandler.getSelectedMedicationsNames = function() {
	var meds = $("div#medication div.selected div.text span.name");
	var medNames = new Array();
	var idx=0;
	for (var i=0; i<meds.length; i++) {
		var med = meds[i].textContent;
		med = med.replace("*", "");
		if (med.indexOf("(") >= 0) {
			var tmp = med.split("(");
			for (var j=0; j<tmp.length; j++) {
				medNames[idx++] = tmp[j].trim().replace(")", "").replace(/s$/, "").toLowerCase();
			}
		} else {
			medNames[idx++] = med.toLowerCase().replace(/s$/, "");
		}
	}
	return medNames;
};

// Assumption here is only one problem gets selected
SideBarEventHandler.getSelectedDiseaseType = function() {
	var diseases = $("div#problemList .selected");
	var diseaseType = diseases.text().toLowerCase().trim();
	return diseaseType;
};

/* ---------------------------------------- Main section event handler ------------------------------------------ */

var MainSectionEventHandler = function() {
	this.initEvent();
};

MainSectionEventHandler.prototype.initEvent = function() {
	this.onClick();
};

/**
 * Show the "more sentence" button if section has more than MAX_ARTICLE sentences, hide otherwise
 */
MainSectionEventHandler.showMoreButton = function() {
	var button = $("div#flexcontent div.showfullscreen").find("button.more");
	var ksummary = button.parent();
	var list = ksummary.find("ul").children();

	if (list.length > MAX_ARTICLE) {
		button.show();
		button.find('span').text("MORE");
	} else {
		button.hide();
	}
};

MainSectionEventHandler.showUTDMoreButton = function() {
	var button = $("div#flexcontent div.showfullscreen").find("button.utdmore");
	var list; 
	for (var i=0; i<button.length; i++) {
		list = button[i].parentNode.childNodes;
		if (list.length - 1 > MAX_ARTICLE) {
			button[i].style.display = 'block';
		} else {
			button[i].style.display = 'none';
		}
	}
	// reattach the click event because it's newly generated button
//	MainSectionEventHandler.utdButtonClickHandler();
};

/**
 * hide the "more sentence" button if section has more than 5 sentences
 */
MainSectionEventHandler.hideMoreButton = function(button) {
	button.hide();
};

MainSectionEventHandler.setMoreButtonText = function(button, text) {
	button.find("span").text(text);
};

MainSectionEventHandler.showCorrectNumberOfArticles = function(list) {
	list.hide();
	list.slice(0, MAX_ARTICLE).show();
};

MainSectionEventHandler.prototype.onClick = function() {
	// expand to full window, and hide other sections
	$("div#summary div#flexcontent div#systematicReview div.fullscreenicon img").click(function() {
		var fullScreenWindow = $(this).parent().parent().parent();
		var moreButton = fullScreenWindow.find("button.more");
		if (fullScreenWindow.hasClass('showfullscreen')) {
			fullScreenWindow.removeClass('showfullscreen');
			$(this).attr('src', 'images/fullscreen.jpg');
			fullScreenWindow.siblings(':not(#default)').show();
			MainSectionEventHandler.paginationSR(MAX_ARTICLE);
			
//			MainSectionEventHandler.hideMoreButton(moreButton);
//			MainSectionEventHandler.showCorrectNumberOfArticles(fullScreenWindow.find("div.ksummary ul").children());
		} else {
			fullScreenWindow.addClass("showfullscreen");
			$(this).attr('src', 'images/exitfs.jpg');
			fullScreenWindow.siblings().hide();
			MainSectionEventHandler.paginationSR(MAX_ARTICLE_FULLWINDOW);
			
//			MainSectionEventHandler.showMoreButton();
		}
	});
	
	$("div#summary div#flexcontent div#clinicalTrial div.fullscreenicon img").click(function() {
		var fullScreenWindow = $(this).parent().parent().parent();
		var moreButton = fullScreenWindow.find("button.more");
		if (fullScreenWindow.hasClass('showfullscreen')) {
			fullScreenWindow.removeClass('showfullscreen');
			$(this).attr('src', 'images/fullscreen.jpg');
			fullScreenWindow.siblings(':not(#default)').show();
			MainSectionEventHandler.paginationCT(MAX_ARTICLE);
			
//			MainSectionEventHandler.hideMoreButton(moreButton);
//			MainSectionEventHandler.showCorrectNumberOfArticles(fullScreenWindow.find("div.ksummary ul").children());
		} else {
			fullScreenWindow.addClass("showfullscreen");
			$(this).attr('src', 'images/exitfs.jpg');
			fullScreenWindow.siblings().hide();
			MainSectionEventHandler.paginationCT(MAX_ARTICLE_FULLWINDOW);
			
//			MainSectionEventHandler.showMoreButton();
		}
	});
	
	// click button to show/hide more sentences
	$("button.more").button().click(function(event){
		event.preventDefault();
		var button = $(this);
		var list = button.parent().find("ul").children();
		if (button.text().toLowerCase() == "more") {
			list.slice(0, MAX_ARTICLE_FULLWINDOW).show();
			MainSectionEventHandler.setMoreButtonText(button, "Less");
		} else {
			list.hide();
			list.slice(0, MAX_ARTICLE).show(); 
			MainSectionEventHandler.setMoreButtonText(button, "More");
		}
	});
	
	// need separate handler for full screen icon of upToDate session
	$("div#summary div#flexcontent div#upToDate div.fullscreenicon img").click(function(){
		var fullScreenWindow = $(this).parent().parent().parent();
		var moreButton = fullScreenWindow.find("button.utdmore");
		if (fullScreenWindow.hasClass('showfullscreen')) {
//			$("div#upToDate .ksummary").children().removeClass("withmorebutton");
			fullScreenWindow.removeClass('showfullscreen');
			$(this).attr('src', 'images/fullscreen.jpg');
			fullScreenWindow.siblings().addClass("shown");
			fullScreenWindow.siblings().removeClass("hidden");
			// hide utdmore button
			for (var i=0; i<moreButton.length; i++) {
				moreButton[i].style.display = 'none';
			}
		} else {
//			$("div#upToDate .ksummary").children().addClass("withmorebutton");
			fullScreenWindow.addClass("showfullscreen");
			$(this).attr('src', 'images/exitfs.jpg');
			fullScreenWindow.siblings().addClass("hidden");
			fullScreenWindow.siblings().removeClass("shown");
			// show utdmore button
			for (var i=0; i<moreButton.length; i++) {
				moreButton[i].style.display = 'block';
			}
			MainSectionEventHandler.showUTDMoreButton();
		}
	});
};

// handler for "more" button at the end of each sentence
MainSectionEventHandler.moreContentUTDClickHandler = function() {
	$("div#upToDate div.ksummary div.feed div.feedcontent div.sentence span.tunecontent").click(function(){
		var parent = $(this).parent();
		var previous = parent.find("span.previous");
		var next = parent.find("span.next");
		if ($(this).text().trim() == "more") {
			previous.show("slow");
			next.show("slow");
			$(this).text("less");
			parent.find("img").removeClass("more");
			parent.find("img").addClass("less");
		} else {
			previous.hide("fast");
			next.hide("fast");
			$(this).text("more");
			parent.find("img").removeClass("less");
			parent.find("img").addClass("more");
		}
	});
};

MainSectionEventHandler.moreContentSRClickHandler = function() {
	$("div#systematicReview div.ksummary span.relSentence span.tunecontent").click(function(){
		var parent = $(this).parent();
		var results = parent.find("span.results");
		if ($(this).text().trim() == "more") {
			results.show("slow");
			$(this).text("less");
			parent.find("img").removeClass("more");
			parent.find("img").addClass("less");
		} else {
			results.hide("fast");
			$(this).text("more");
			parent.find("img").removeClass("less");
			parent.find("img").addClass("more");
		}
	});
};

MainSectionEventHandler.moreContentCTClickHandler = function() {
	$("div#clinicalTrial div.ksummary span.relSentence span.tunecontent").click(function(){
		var parent = $(this).parent();
		var results = parent.find("span.results");
		console.log("here");
		if ($(this).text().trim() == "more") {
			results.show("slow");
			$(this).text("less");
			parent.find("img").removeClass("more");
			parent.find("img").addClass("less");
		} else {
			results.hide("fast");
			$(this).text("more");
			parent.find("img").removeClass("less");
			parent.find("img").addClass("more");
		}
	});
};

MainSectionEventHandler.paginationSR = function(items_per_page) {
	$("div.paging_container_sr").pajinate({
		items_per_page: items_per_page,
		num_page_links_to_display : 3,
		item_container_id : '.paging_content_sr',
		nav_panel_id : '.page_navigation_sr'
	});
};

MainSectionEventHandler.paginationCT = function(items_per_page) {
	$("div.paging_container_ct").pajinate({
		items_per_page: items_per_page,
		num_page_links_to_display : 3,
		item_container_id : '.paging_content_ct',
		nav_panel_id : '.page_navigation_ct'
	});
};

//MainSectionEventHandler.utdButtonClickHandler = function() {
//	$("button.utdmore").button().click(function(event){
//		event.preventDefault();
//		var button = $(this);
//		var list = button.parent().children();
//		if (button.text().toLowerCase() == "more") {
//			for (var i=0; i<list.length - 1 && i<MAX_SENTENCE_FULLWINDOW; i++) {
//				list[i].style.display = 'block';
//			}
//			button.find('span').text('Less');
//		} else {
//			for (var i=MAX_SENTENCE; i<list.length - 1; i++) {
//				list[i].style.display = 'none';
//			}
//			button.find('span').text('More');
//		}
//	});
//};

MainSectionEventHandler.expandCollapseUTD = function() {
	$("div#upToDate div.ksummary div.feedtitle").click(function() {
		$(this).siblings().slideToggle("medium");
		var img_src = $(this).find("img").attr("src");
		var new_src = (img_src == "images/expand.jpg" ? "images/collapse.jpg" : "images/expand.jpg");
		$(this).find("img").attr("src", new_src);
	});
};

