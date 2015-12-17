// --------------- Add some CSS classes and some JS file(s) ----------
var urlStart = null;
for(var els = document.getElementsByTagName ('script'), i = els.length; i--;){
    // els[i].id !== "myId" && (els[i].style.display = "none");	
	if(els[i].src && els[i].src.indexOf("pfa-pocket-watch") >= 0){
		urlStart = els[i].src.substring(0, els[i].src.indexOf("pfa-pocket-watch"));
	}
}
if(urlStart == null){
	alert("Could not identify path to our JS!\nWatch will not work...");
	urlStart = "";
}
var js = document.createElement("script");
js.type = "text/javascript";
js.src = urlStart + "progressbar.min.js";
document.getElementsByTagName('head')[0].appendChild(js);

var style = document.createElement('style');
style.type = 'text/css';
style.innerHTML = '.analogDigitalClockDoW { position: absolute; top: 100px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockTimeWithDoW { position: absolute; top: 130px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockTimeWithoutDoW { position: absolute; top: 155px; left: 80px; width: 205px; height: 35px; z-indez: 10; padding: 0px; margin: 0px; text-align: center; color: black; font-size: 30px; } '
				+ '.analogDigitalClockDay { position: absolute; top: 195px; left: 70px; width: 60px; height: 60px; text-align: center; color: black; font-size: 23px; } '
				+ '.analogDigitalClockMonth { position: absolute; top: 240px; left: 151px; width: 60px; height: 60px; text-align: center; color: black; font-size: 20px; } '
				+ '.analogDigitalClockYear { position: absolute; top: 195px; left: 222px; width: 60px; height: 60px; text-align: center; color: black; font-size: 23px; } '
				+ '.analogDigitalClockSound { position: absolute; top: 205px; left: 170px; width: 32px; height: 32px; text-align: center; } '
				+ '.w3ClockSound { position: absolute; top: 210px; left: 200px; width: 32px; height: 32px; text-align: center; } '
				+ '.w4Day { position: absolute; top: 110px; left: 200px; width: 100px; height: 20px; text-align: center; backgrous-color: white} '
				
				+ '.fimUnselectable { -moz-user-select: -moz-none; -khtml-user-select: none; -webkit-user-select: none; -ms-user-select: none; user-select: none; } '
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
		sound : "off",
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
	this.theme = loadTheme(this.options);
	this.timer = null;
	this["soundPlaying"] = false;
	console.log("Theme options: ", this.theme);
	configureDiv(this.div, this.theme);
	
	// start & stop functions
	this.start = function() {
		// this is guard for preventing double start
		if (this.timer == null) {						
			this.timer = setInterval(this.theme.renderMethod, 1000, this.clockIndex);
			if (this.options.sound == "onStart" && this.theme.startSound != null) {
				this.theme.startSound(this);
			}
		}
	};
	this.stop = function() {
		if (this.timer != null) {
			clearInterval(this.timer);
			this.timer = null;
			if (this.theme.stopSound != null) {
				this.theme.stopSound(this);
			}
		}
	};
	
	// when sound is pressed
	self = this;
	this.toogleSound = function() {
		console.log("Toogle sound");
		if (self.timer != null) {
			// start if not running, stop if running
			if (self["soundPlaying"]) {
				if (self.theme.stopSound != null) {
					self.theme.stopSound(self);
				}
			} else {
				if (self.theme.startSound != null) {
					self.theme.startSound(self);
				}
			}
			// stop it if timer is not running anymore
		} else if (self.theme.stopSound != null) {
			self.theme.stopSound(self);
		}
	};
	
	// when mouse over & out is asked
	if (this.options.sound == "onHover") {
		var self = this;
		this.div.addEventListener('mouseenter', function(){
			console.log("Mouse in");
			if (self.timer != null) {
				console.log("Playing sound");
				self.theme.startSound(self);
			}
		});
		this.div.addEventListener('mouseleave', function(){
			console.log("Mouse out");
			if (self.timer != null) {
				console.log("Stopping sound");
				self.theme.stopSound(self);
			}
		});
	}

	// call theme init method
	this.theme.initMethod(this);	
	
	// now we should have the clock configured, it's safe to store it in the list
	pfaAllianceClocks[this.clockIndex] = this;
}
// ----------------- Private functions ---------------------
/** All clocks from the page. */
var pfaAllianceClocks = new Array();

/**
 * Load the theme options.
 * @param themeName - the name of the theme
 * @return the theme specific options (size, background, border, etc.)
 */
function loadTheme(options){	
	var functionName = "loadTheme_" + options.theme.replace('-', '_');
	console.log("Loading: ", functionName);
	var fn = window[functionName];
	console.log("Loading: ", functionName, " -> ", fn);
	return fn.apply(null, [options]);
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
	// handle sound values
	var sound = fixedOptions.sound.toLowerCase();
	if ("onsoundon" == sound) {
		fixedOptions.sound = 'onSoundOn';
	} else if ("onhover" == sound) {
		fixedOptions.sound = 'onHover';
	} else if ("onstart" == sound) {
		fixedOptions.sound = 'onStart';
	} else {
		fixedOptions.sound = 'off';
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
/**
 * Generic method for start playing the sound
 * @param theClock the clock
 */
function genericStartSound(theClock) {
	console.log("Starting sound...");
	if (theClock["sound"] != null) {
		theClock["sound"].play();
		theClock["soundPlaying"] = true;
		if (theClock["soundImg"]) {
			theClock["soundImg"].src = urlStart + "pfa-pocket-watch-themes/speaker_on_32.png";
		}
	}
}
/**
 * Generic method for stop playing the sound
 * @param theClock the clock
 */
function genericStopSound(theClock) {
	console.log("Stop sound...");
	if (theClock["sound"] != null) {
		theClock["sound"].pause();
		theClock["soundPlaying"] = false;
		if (theClock["soundImg"]) {
			theClock["soundImg"].src = urlStart + "pfa-pocket-watch-themes/speaker_off_32.png";
		}
	}
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
//--------------- W4d & W4dm ----------------------------------------
function loadTheme_w4d(options){
	var bgImage = (options.showDate)? "w4d.jpg" : "w3.jpg";
	return {
		width : 250,
		height : 250,
		background :  null,
		backgroundColor :  null,
		backgroundImage : "url('" + urlStart + "pfa-pocket-watch-themes/" + bgImage + "')",
		initMethod : w4dClockInit,
		renderMethod : w4dClockRender,
		startSound : genericStartSound,
		stopSound : genericStopSound
	};
}
function loadTheme_w4dm(options){
	var bgImage = (options.showDate)? "w4dm.jpg" : "w3.jpg";
	return {
		width : 250,
		height : 250,
		background :  null,
		backgroundColor :  null,
		backgroundImage : "url('" + urlStart + "pfa-pocket-watch-themes/" + bgImage + "')",
		initMethod : w4dmClockInit,
		renderMethod : w4dmClockRender,
		startSound : genericStartSound,
		stopSound : genericStopSound
	};
}
/**
 * Init the clock for this theme.
 * @param theClock - the clock object
 */
function w4dClockInit(theClock){
	w34ClockBaseInit(theClock);
	// make the watch display the time
	w4dClockRenderClock(theClock);
}
/**
 * Init the clock for this theme.
 * @param theClock - the clock object
 */
function w4dmClockInit(theClock){
	w34ClockBaseInit(theClock);
	// make the watch display the time
	w4dmClockRenderClock(theClock);
}
/**
 * Render the time on clock. 
 * @param clockIndex the index of the clock
 */
function w4dClockRender(clockIndex){	
	var theClock = pfaAllianceClocks[clockIndex];
	w4dClockRenderClock(theClock);
}
/**
 * Render the time on clock. 
 * @param clockIndex the index of the clock
 */
function w4dmClockRender(clockIndex){	
	var theClock = pfaAllianceClocks[clockIndex];
	w4dmClockRenderClock(theClock);
}

function w4dClockRenderClock(theClock){	
	var ctx = theClock.canvasContext;
	var now = new Date();
	
	ctx.clearRect(-125, -125, 250, 250);
    
    // draw date
    if (theClock.options.showDate) {
	    ctx.textAlign = 'center';
	    ctx.fillStyle = 'black';
	    ctx.font = 'bold 14px Calibri';
	    var dateString = now.getDate();
	    ctx.fillText(dateString, 78, 4);
    }
    
    // draw the hands
    w34ClockRenderHands(theClock, now);
}

function w4dmClockRenderClock(theClock){	
	var ctx = theClock.canvasContext;
	var now = new Date();
	
	ctx.clearRect(-125, -125, 250, 250);
    
    // draw date
    if (theClock.options.showDate) {
	    ctx.textAlign = 'center';
	    ctx.fillStyle = 'black';
	    ctx.font = 'bold 14px Calibri';
	    var dateString = theClock.options.monthsAbbr[now.getMonth()] + " " + now.getDate();
	    ctx.fillText(dateString, 62, 4);
    }
    
    // draw the hands
    w34ClockRenderHands(theClock, now);
}
// --------------- W3 -----------------------------------------------
/**
 * Load the theme specific options.
 * @return the theme specific options (size, background, border, etc.)
 */
function loadTheme_w3(){
	return {
		width : 250,
		height : 250,
		background :  null,
		backgroundColor :  null,
		backgroundImage : "url('" + urlStart + "pfa-pocket-watch-themes/w3.jpg')",
		initMethod : w3ClockInit,
		renderMethod : w3ClockRender,
		startSound : genericStartSound,
		stopSound : genericStopSound
	};
}
/**
 * Init the clock for this theme.
 * @param theClock - the clock object
 */
function w3ClockInit(theClock){
	w34ClockBaseInit(theClock);
	// make the watch display the time
	w3ClockRenderClock(theClock);
}
function w34ClockBaseInit(theClock){
	var clockCanvas = document.createElement("canvas");
	clockCanvas.width = 250;
	clockCanvas.height = 250;

	clockCanvas.style.position = "absolute";
	clockCanvas.style.top = "0px";
	clockCanvas.style.left = "0px";
	
	theClock.div.style.padding = "0px";
	theClock.div.style.margin = "0px";
	
	theClock.div.appendChild(clockCanvas);
	theClock.canvasContext = clockCanvas.getContext('2d');
	theClock.canvasContext.translate(125, 125);
	
	// handle sound DIV + audio
	var soundOption = theClock.options.sound;
	if (soundOption == "onStart" || soundOption == "onSoundOn") {
		theDiv = document.createElement("DIV");
		theDiv.id = "soundDiv" + theClock.clockIndex;
		theDiv.className = "w3ClockSound fimUnselectable";
		
		var theImage = document.createElement("IMG")
		theImage.id = "soundImg" + theClock.clockIndex;
		theImage.src = urlStart + "pfa-pocket-watch-themes/speaker_off_32.png";
		theImage.style.cursor = "pointer";
		theImage.addEventListener('click', theClock.toogleSound);
		theClock["soundImg"] = theImage;
		theDiv.appendChild(theImage);
		
		theClock.div.appendChild(theDiv);
	}
	if (soundOption == "onStart" || soundOption == "onSoundOn" || soundOption == "onHover") {
		var theSound = document.createElement("AUDIO");
		theSound.style.display = "none";
		theSound.loop = true;
		theSound.src= urlStart + "pfa-pocket-watch-themes/clock-ticking-2.mp3";
		theClock.div.appendChild(theSound);
		theClock["sound"] = theSound;
	}
}
/**
 * Render the time on clock. 
 * @param clockIndex the index of the clock
 */
function w3ClockRender(clockIndex){	
	var theClock = pfaAllianceClocks[clockIndex];
	w3ClockRenderClock(theClock);
}
function w3ClockRenderClock(theClock){	
	var ctx = theClock.canvasContext;
	
	ctx.clearRect(-125, -125, 250, 250);
	var now = new Date();
    
    // draw date
    if (theClock.options.showDate) {
	    ctx.textAlign = 'center';
	    ctx.fillStyle = 'yellow';
	    ctx.font = '16pt Calibri';
	    var dateString = theClock.options.monthsAbbr[now.getMonth()] + " " + now.getDate() + ", " + now.getFullYear();
	    ctx.fillText(dateString, 0, 50);
    }
    
    // draw the hands
    w34ClockRenderHands(theClock, now);
}

function w34ClockRenderHands(theClock, now){	
	var ctx = theClock.canvasContext;
	
	var radius = 110;
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    
    // draw hour
    hour = hour % 12;
    hour = (hour*Math.PI/6)+(minute*Math.PI/(6*60))+(second*Math.PI/(360*60));
    drawHand(ctx, hour, radius*0.5, radius*0.07, 'white');
    // draw minute
    minute = (minute*Math.PI/30)+(second*Math.PI/(30*60));
    drawHand(ctx, minute, radius*0.8, radius*0.07, 'white');
    // draw second
    if (theClock.options.showSeconds) {
	    second=(second*Math.PI/30);
	    drawHand(ctx, second, radius*0.9, radius*0.02, 'red');
    }
    
    // draw inner dot (10px)
	ctx.beginPath();
	ctx.arc(0, 0, 10, 0, 2*Math.PI);
	ctx.fillStyle = 'white';
	ctx.fill();
	
	// add inner dot (4px)
	ctx.beginPath();
	ctx.arc(0, 0, 4, 0, 2*Math.PI);
	ctx.fillStyle = 'black';
	ctx.fill();
}

function drawHand(ctx, pos, length, width, color) {
    ctx.beginPath();
    ctx.strokeStyle = color;
    ctx.lineWidth = width;
    ctx.lineCap = "round";
    ctx.moveTo(0,0);
    ctx.rotate(pos);
    ctx.lineTo(0, -length);
    ctx.stroke();
    ctx.rotate(-pos);
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
		backgroundImage : "url('" + urlStart + "pfa-pocket-watch-themes/analog-digital.png')",
		initMethod : analogDigitalClockInit,
		renderMethod : analogDigitalClockRender,
		startSound : genericStartSound,
		stopSound : genericStopSound
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
		theDiv.id = "dayNameDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockDoW fimUnselectable';
		var dayName = theClock.options.days[nowIs.getDay()];
		theDiv.innerHTML = dayName;  
		theClock.div.appendChild(theDiv);
		theClock["dayName"] = theDiv;
		theClock["dayName.value"] = nowIs.getDay();
		
		// the year
		theDiv = document.createElement("DIV");
		theDiv.id = "yearDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockYear fimUnselectable';
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

		// the month
		theDiv = document.createElement("DIV");
		theDiv.id = "monthDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockMonth fimUnselectable';
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
		
		// the day
		theDiv = document.createElement("DIV");
		theDiv.id = "dayDiv" + theClock.clockIndex;
		theDiv.className = 'analogDigitalClockDay fimUnselectable';
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
		theClock["day.value"] = "";
		analogDigitalClockSetDayProgress(nowIs, theClock);
		// the progressbar sets the position: relative and make all looks wrong
		theDiv.style.position = "absolute";
	} else {
		// we add this in order to make time updating easier. We can check if this value > -1 => we have day div
		theClock["dayName.value"] = -1;
	}	
	console.log("dayNameDiv: ", theDiv);

	// the time
	theDiv = document.createElement("DIV");
	theDiv.id = "timeDiv" + theClock.clockIndex;
	theDiv.className = ((theClock.options.showDate)? "analogDigitalClockTimeWithDoW" : "analogDigitalClockTimeWithoutDoW") + " fimUnselectable";
	var dayName = analogDigitalClockFormatTime(nowIs, theClock.options.showSeconds);
	theDiv.innerHTML = dayName;  
	theClock.div.appendChild(theDiv); 
	theClock[theDiv.id] = theDiv;
	
	// handle sound DIV + audio
	var soundOption = theClock.options.sound;
	if (soundOption == "onStart" || soundOption == "onSoundOn") {
		theDiv = document.createElement("DIV");
		theDiv.id = "soundDiv" + theClock.clockIndex;
		theDiv.className = "analogDigitalClockSound fimUnselectable";
		
		var theImage = document.createElement("IMG")
		theImage.id = "soundImg" + theClock.clockIndex;
		theImage.src = urlStart + "pfa-pocket-watch-themes/speaker_off_32.png";
		theImage.style.cursor = "pointer";
		theImage.addEventListener('click', theClock.toogleSound);
		theClock["soundImg"] = theImage;
		theDiv.appendChild(theImage);
		
		theClock.div.appendChild(theDiv);
	}
	if (soundOption == "onStart" || soundOption == "onSoundOn" || soundOption == "onHover") {
		var theSound = document.createElement("AUDIO");
		theSound.style.display = "none";
		theSound.loop = true;
		theSound.src= urlStart + "pfa-pocket-watch-themes/clock-ticking-2.mp3";
		theClock.div.appendChild(theSound);
		theClock["sound"] = theSound;
	}
}
/**
 * Render the time on clock. 
 * @param clockIndex the index of the clock
 */
function analogDigitalClockRender(clockIndex){	
	// preparation
	var theClock = pfaAllianceClocks[clockIndex];
	var timeDiv = theClock["timeDiv" + clockIndex];
	var dayIndexValue = theClock["dayName.value"];
	// get current time
	var nowIs = new Date();
	// set the new time
	timeDiv.innerHTML = analogDigitalClockFormatTime(nowIs, theClock.options.showSeconds);
	// change day name if necessary
	if (dayIndexValue > -1){
		if (dayIndexValue != nowIs.getDay()) {
			theClock["dayName.value"] = nowIs.getDay();
			theClock["dayName"].innerHTML = theClock.options.days[nowIs.getDay()];
		}
		analogDigitalClockSetDayProgress(nowIs, theClock);
	}
}
/**
 * This method returns a formated time
 * @param currentTime - Date object representing curent time
 * @param addSeconds  - boolean flag indicating to add or not the seconds
 * @return the formated time
 */
function analogDigitalClockFormatTime(currentTime, addSeconds){
	return twoDigits(currentTime.getHours()) + " : " + twoDigits(currentTime.getMinutes()) + ((addSeconds)? " : " + twoDigits(currentTime.getSeconds()) : "");
}
function analogDigitalClockSetDayProgress(nowIs, theClock){
	var dayValue = nowIs.getHours() * 6 + nowIs.getMinutes() / 10;
	var fullDayValue = nowIs.getDate() + ":" + dayValue;
	//console.log("Current day value: ", theClock["day.value"], ", calculated value: ", fullDayValue);
	if (fullDayValue != theClock["day.value"]) {
		var days = theClock["day"];
		days.animate(dayValue / (24 * 6));
		days.setText(nowIs.getDate());
		theClock["day.value"] = fullDayValue;
		console.log("Changing current day value: ", fullDayValue);
		// update the other values too from progress bar
		analogDigitalClockSetMonthProgress(nowIs, theClock["month"], theClock.options.monthsAbbr);
		analogDigitalClockSetYearProgress(nowIs, theClock["year"]);
	}
}
/**
 * Configure the MONTH progressbar.
 * @param nowIs - Date object representing the current time
 * @param years - the MONTH progress bar
 */
function analogDigitalClockSetMonthProgress(nowIs, months, monthsNames){
	months.animate((nowIs.getDate() - 1) / getLastDayOfMonth(nowIs.getMonth(), nowIs.getFullYear()));
	months.setText(monthsNames[nowIs.getMonth()]);
}
/**
 * Configure the YEAR progressbar.
 * @param nowIs - Date object representing the current time
 * @param years - the YEAR progress bar
 */
function analogDigitalClockSetYearProgress(nowIs, years){
	years.animate((getDaysSinceBeginningOfYear(nowIs) - 1) / getNumberOfDaysFromYear(nowIs.getFullYear()));
	years.setText(nowIs.getFullYear());
}
