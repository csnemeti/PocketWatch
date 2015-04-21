/**
 * Function used for returning default options for #pfaAllianceClock(divId, options)
 */
function getDefaultOptions(){
	return {
		// defines the look of the watch. Contains sizes, background image, and various settings.
		theme : "analog-digital",
		// put some tic-tac sound in page
		sound : false,
		// show the seconds on watch. NOTE: some themes might ignore this property.
		showSeconds : true,
		// show date (or part of date: day & month) on watch. NOTE: some themes might ignore this property.
		showDate : true,
		// name of the days: Sunday first, Monday,...
		days: ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
		// name of the days abbreviated: Sunday first, Monday,...
		daysAbbr: ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"],
		// name of month abbreviated
		monthsAbbr: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]
	};
}
/** 
  * Clock builder.
  * @param divId   - the ID of the DIV / SPAN / etc. that will contain the clock 
  * @param options - the clock options
  * @see #getDefaultOptions() - for default options
  */
function pfaAllianceClock(divId, options){	
	// init the clock, prepare it's data
	this.clockIndex = pfaAllianceClocks.length;
	pfaAllianceClocks[this.clockIndex] = null;
	// store the div
	this.div = document.getElementById(divId);
	// handle the options
	this.options = handleOptions(options);
	console.log("Options: ", this.options);
	this.theme = loadTheme(this.options.theme);
	this.timer = null;
	console.log("Theme options: ", this.theme);
	configureDiv(this.div, this.theme);
	// call theme init method
	this.theme.initMethod(this);
	
	
	// now we should have the clock congigured, it's safe to store it in the list
	pfaAllianceClocks[this.clockIndex] = this;
	
	// start & stop functions
	this.start = function(){
		if (this.timer == null){
			this.timer = setInterval(this.theme.renderMethod, 1000, this.clockIndex); 
		}
	};
	this.stop = function(){
		if (this.timer != null){
			clearInterval(this.timer);
			this.timer = null;
		}
	};	
}
// ----------------- Private functions ---------------------
/** All clocks from the page. */
var pfaAllianceClocks = new Array();

/**
 * Load the theme options.
 * @param themeName - the name of the theme
 * @return the theme specific options (size, background, border, etc.)
 */
function loadTheme(themeName){
	var functionName = "loadTheme_" + themeName.replace('-', '_') + "()";
	return eval(functionName);
}
/**
 * Configure the DIV that was sent as parameter...
 * @param theDiv - the DIV that was sent as parameter
 * @param theme  - the theme that contain the configuration
 */
function configureDiv(theDiv, theme){
	theDiv.style.padding = "0px";
	theDiv.style.width = theme.width + "px";
	theDiv.style.height = theme.height + "px";
	if (theme.background != null){
		theDiv.style.background = theme.background;
	}
	if (theme.backgroundColor != null){
		theDiv.style.backgroundColor = theme.backgroundColor;
	}
	if (theme.backgroundImage != null){
		theDiv.style.backgroundImage = theme.backgroundImage;
	}
}
/**
 * Verifies if options are valid. Complete it with defaults.
 * @param options - the options to check
 * @return the verified options
 */
function handleOptions(options){
	var fixedOptions = {};
	var defaultOptions = getDefaultOptions();
	for (var prop in defaultOptions){
		fixedOptions[prop] = getOptionsValue(options, prop, defaultOptions[prop]);
	}
	return fixedOptions;
}
function getOptionsValue(options, key, defaultValue){
	var value = defaultValue;
	if (options != null && typeof options == 'object'){	
		value = options[key];
		if (value == null || typeof value == 'undefined'){
			value = defaultValue;
		}
	}
	return value;
}

function twoDigits(number){
	return (number < 10)? "0" + number : "" + number;
}

// --------------- Analog - Digital theme methods --------------------
/**
 * Load the theme specific options.
 * @return the theme specific options (size, background, border, etc.)
 */
function loadTheme_analog_digital(){
	return {
		width : 357,
		height : 357,
		background :  null,
		backgroundColor :  null,
		backgroundImage : "url('images/watch/analog-digital.png')",
		initMethod : analogDigitalClockInit,
		renderMethod : analogDigitalClockRender
	};
}
/**
 * Init the clock for this theme.
 * @param theClock - the clock object
 */
function analogDigitalClockInit(theClock){
	console.log("Init: ", theClock);
	var theDiv = null;
	var nowIs = new Date();
	// the name of the day
	var divId = "dayNameDiv" + theClock.clockIndex;
	if (theClock.options.showDate){
		theDiv = document.createElement("DIV");
		theDiv.id = divId;
		theDiv.style="position: absolute; top: 100px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px;";
		var dayName = theClock.options.days[nowIs.getDay()];
		theDiv.innerHTML = dayName;  
		theClock.div.appendChild(theDiv);
		theClock[divId] = theDiv;
		theClock[divId + ".value"] = nowIs.getDay();
	} else {
		// we add this in order to make time updating easier. We can check if this value > -1 => we have day div
		theClock[divId + ".value"] = -1;
	}	
	// the time
	theDiv = document.createElement("DIV");
	theDiv.id = "timeDiv" + theClock.clockIndex;
	var topValue = (theClock.options.showDate)? "130px" : "155px";
	theDiv.style="position: absolute; top: " + topValue + "; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px;";
	var dayName = analogDigitalClockFormatTime(nowIs, theClock.options.showSeconds);
	theDiv.innerHTML = dayName;  
	theClock.div.appendChild(theDiv); 
	theClock[theDiv.id] = theDiv;
}
function analogDigitalClockRender(clockIndex){	
	// preparation
	var theClock = pfaAllianceClocks[clockIndex];
	var timeDiv = theClock["timeDiv" + clockIndex];
	var dayIndexValue = theClock["dayNameDiv" + clockIndex + ".value"];
	// get current time
	var nowIs = new Date();
	// set the new time
	timeDiv.innerHTML = analogDigitalClockFormatTime(nowIs, theClock.options.showSeconds);
	// change day name if necessary
	if (dayIndexValue > -1 && dayIndexValue != nowIs.getDay()){
		theClock["dayNameDiv" + clockIndex + ".value"] = nowIs.getDay();
		theClock["dayNameDiv" + clockIndex].innerHTML = theClock.options.days[nowIs.getDay()];
	}
}
function analogDigitalClockFormatTime(currentTime, addSeconds){
	return twoDigits(currentTime.getHours()) + " : " + twoDigits(currentTime.getMinutes()) + ((addSeconds)? " : " + twoDigits(currentTime.getSeconds()) : "");
}