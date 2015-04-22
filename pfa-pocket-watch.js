// --------------- Add some CSS classes and some JS file(s) ----------
var js = document.createElement("script");
js.type = "text/javascript";
js.src = "progressbar.min.js";
//document.getElementsByTagName('head')[0].appendChild(js);

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.analogDigitalClockDoW { position: absolute; top: 100px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockTimeWithDoW { position: absolute; top: 130px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockTimeWithoutDoW { position: absolute; top: 155px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockDay { position: absolute; top: 195px; left: 70px; width: 60px; height: 60px; text-align: center; color: black; font-size: 23px; } '
				+ '.analogDigitalClockMonth { position: absolute; top: 240px; left: 151px; width: 60px; height: 60px; text-align: center; color: black; font-size: 20px; } '
				+ '.analogDigitalClockYear { position: absolute; top: 195px; left: 222px; width: 60px; height: 60px; text-align: center; color: black; font-size: 23px; } '
				+ '';
document.getElementsByTagName('head')[0].appendChild(style);

// ---------------------public APIS ---------------------------------
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
function getLastDayOfMonth(month, year){
	switch(month){
	case 0 :
	case 2 :
	case 4 :
	case 6 :
	case 7 :
	case 9 :
	case 11 :
		return 31;
	case 3 :
	case 5 :
	case 8 :
	case 10 :
		return 30;
	case 1 :
		// this is not Gregorian calendar but differences will be in 2100  
		return (year % 4 == 0)? 29 : 28;
	}
}
function getNumberOfDaysFromYear(year){
	// this is not Gregorian calendar but differences will be in 2100  
	return (year % 4 == 0)? 366 : 365;
}
function getDaysSinceBeginningOfYear(nowIs){
	var start = new Date(nowIs.getFullYear(), 0, 0);
	var diff = nowIs - start;
	var oneDay = 1000 * 60 * 60 * 24;
	return Math.floor(diff / oneDay);
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
		backgroundImage : "url('images/watch/analog-digital2.png')",
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
	var divId = "dayNameDiv" + theClock.clockIndex;
	if (theClock.options.showDate){
		// the name of the day
		theDiv = document.createElement("DIV");
		theDiv.id = divId;
		theDiv.className = 'analogDigitalClockDoW';
		var dayName = theClock.options.days[nowIs.getDay()];
		theDiv.innerHTML = dayName;  
		theClock.div.appendChild(theDiv);
		theClock[theDiv.id ] = theDiv;
		theClock[theDiv.id  + ".value"] = nowIs.getDay();
		
		// the day
		theDiv = document.createElement("DIV");
		theDiv.id = "dayDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockDay';
		theClock.div.appendChild(theDiv);
		theClock[theDiv.id + ".value"] = nowIs.getDate();
		var days = new ProgressBar.Circle(theDiv, {
			duration: 200,
			color: "#000000",
			trailWidth: 3,
			strokeWidth: 3,
			trailColor: "#ddd"
		});
		theClock["day"] = days;
		analogDigitalClockSetDayProgress(nowIs, days);
		// the progressbar sets the position: relative and make all looks wrong
		theDiv.style.position = "absolute";

		// the month
		theDiv = document.createElement("DIV");
		theDiv.id = "monthDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockMonth';
		theClock.div.appendChild(theDiv);
		theClock[theDiv.id + ".value"] = nowIs.getMonth();
		var months = new ProgressBar.Circle(theDiv, {
			duration: 200,
			color: "#000000",
			trailWidth: 3,
			strokeWidth: 3,
			trailColor: "#ddd"
		});
		theClock["month"] = months;
		analogDigitalClockSetMonthProgress(nowIs, months, theClock.options.monthsAbbr);
		// the progressbar sets the position: relative and make all looks wrong
		theDiv.style.position = "absolute";
		
		// the year
		theDiv = document.createElement("DIV");
		theDiv.id = "yearDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockYear';
		theClock.div.appendChild(theDiv);
		theClock[theDiv.id + ".value"] = nowIs.getMonth();
		var years = new ProgressBar.Circle(theDiv, {
			duration: 200,
			color: "#000000",
			trailWidth: 3,
			strokeWidth: 3,
			trailColor: "#ddd"
		});
		theClock["year"] = years;
		analogDigitalClockSetYearProgress(nowIs, years);
		// the progressbar sets the position: relative and make all looks wrong
		theDiv.style.position = "absolute";
	} else {
		// we add this in order to make time updating easier. We can check if this value > -1 => we have day div
		theClock[divId + ".value"] = -1;
	}	
	console.log("dayNameDiv: ", theDiv);
	// the time
	theDiv = document.createElement("DIV");
	theDiv.id = "timeDiv" + theClock.clockIndex;
	theDiv.className = (theClock.options.showDate)? "analogDigitalClockTimeWithDoW" : "analogDigitalClockTimeWithoutDoW";
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
function analogDigitalClockSetDayProgress(nowIs, days){
	days.animate(nowIs.getHours() / 24);
	days.setText(nowIs.getDate());
}
function analogDigitalClockSetMonthProgress(nowIs, months, monthsNames){
	months.animate((nowIs.getDate() - 1) / getLastDayOfMonth(nowIs.getMonth(), nowIs.getFullYear()));
	months.setText(monthsNames[nowIs.getMonth()]);
}
function analogDigitalClockSetYearProgress(nowIs, years){
	years.animate((getDaysSinceBeginningOfYear(nowIs) - 1) / getNumberOfDaysFromYear(nowIs.getFullYear()));
	years.setText(nowIs.getFullYear());
}
