$(function(){
	//Set the bounds of what we want to grab
    var maxLat = 51, 
    	minLat = 39.3,
    	maxLon = -116,
		minLon = -131.7;
		
		//Current Time
		nowTime = Date.now();
		
		//Only Grab events in last two weeks
		var howManyDays = 14;
		var newDate = nowTime - howManyDays * 24 * 3600 * 1000;
		var starttime = (new Date(newDate)).toISOString();
			starttime = starttime.replace(/T(.)*$/mg, "");
			
	$("#last-updated span").text(new Date(nowTime));
	
	//Fill in header subtext
	$(".header-text small").text(funPhraseGenerator());
	
	//Get events from USGS	
	var url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude=" 
		+ minLat + "&maxlatitude=" + maxLat + "&maxlongitude="
		+ maxLon + "&minlongitude=" + minLon + "&starttime="
		+ starttime;

	$.ajax({
		dataType: "json", 
		url: url
	}).done(function(data){
		
		//Add events to table
		var tbody = $("#event-list tbody");
		$.each(data.features, function(i, e){
			row = $("<tr>");
			var event = {
				mag: e.properties.mag,
				net: e.properties.net,
				place: e.properties.place,
				time: new Date(e.properties.time),
				type: e.properties.type,
				depth: e.geometry.coordinates[2]
			}
			
			//Only add UW events and CC events, or other events if they are > 2
			if(event.mag > 2 || event.net === "uw" || event.net === "cc") {
			
				//Add correct css class to row
				var klass;
				if(event.mag < 2){
					klass = "tiny";
				} else if (event.mag < 3){
					klass = "medium";
				} else if(event.mag < 4){
					klass = "large";
				} else {
					klass = "x-large";
				}
				
				// calculate how long ago the event was
				//Rails has a nice way to do this. Too bad we're not using rails.
				var daysAgo = (nowTime - event.time.getTime())/(1000 * 60 * 60 * 24);
				var daysAgoString;
				
				
				if (Math.floor(daysAgo) == 0){
					if(daysAgo * 24 < 1) {
						daysAgoString = "about " + Math.floor(daysAgo * 24 * 60) + " minutes";
					} else {
						daysAgoString = "about " + Math.floor(daysAgo * 24)+ " hours";
					}
					
				} else if (Math.floor(daysAgo) == 1) {
					daysAgoString = "1 day";
				} else {
					daysAgoString = Math.floor(daysAgo) + " days";
				}
			
				//This disaster is brought to you by javascript date handling.
				var local = formatDate(event.time, "local");
				var utc = formatDate(event.time, "UTC");
				
				//Make the table data
				var left = $("<td><div class='mag "+klass+"'<p>" + round(event.mag , 1) + "</p></div></td>");
				
				var middle = $("<td><div class='top'>" + event.place + "</div>" + 
									"<div class='bottom'>" + 
										"<div class='time toggleable'>"+ local + "</div>" + 
										"<div class='time toggleable off'>" + utc + "</div>" + 
									"</div>" + 
								"</td>");
								
				var right = $("<td><div class='top'>"+daysAgoString+"</div>"+
								"<div class='bottom'>"+
									"<div class='depth toggleable off'>" + round(event.depth * 0.621371, 1) + " mi </div>"+
									"<div class='depth toggleable'>"+ round(event.depth , 1 ) + " km</div>"+
								"</td>");
								
				//There is an additional column on the normal events list
				
				//Add to the table
				row.append(left, middle, right);
				tbody.append(row);
			}

		});
		
	});
	
	// Takes in date and desired timezone
	// Returns YYYY/MM/DD HH:MM:SS Z
	function formatDate(d, z){
		var fixed = [];
		var z = z;
		if(z==="local") {
			fixed = fixDate([d.getFullYear(), d.getMonth(), d.getDate(), d.getHours(), d.getMinutes(), d.getSeconds()]);
			z = d.toString().match(/\(([A-Za-z\s].*)\)/)[1];
		} else {
			fixed = fixDate([d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate(), d.getUTCHours(), d.getUTCMinutes(), d.getUTCSeconds()]);
		}

		return fixed[0] + "/" + fixed[1] + "/" + fixed[2] + " " + fixed[3] + ":" + fixed[4] + ":" + fixed[5] + " " + z;
	}
	
	// Adds 0 to numbers so they look nice
	function fixDate(values){
		
		$.each(values, function(i, value){
			if(parseInt(value) < 10){
				values[i]= "0" + value;
			}
		});

		return values;
	}
	
	//Rounds to some decimal place
	function round(value, fixed){
		return parseFloat(Math.round(value * 10.0) / 10.0).toFixed(fixed);
	}

	//Enables toggling of the toggleable divs
    $(".toggler").click(function(){
      var target = $(this).attr("toggle");
      if($(target).hasClass("toggleable")){
          $(target).toggleClass("off");
      }
    });
	
	function funPhraseGenerator(){
		var phrases = 
			["PNSN: It's not our fault.",
			"Don't worry, we have our best people on the case.",
			"Looks like we got a little bit crowded.",
			"Uh oh, we're all shook up!"
			];
		var max = phrases.length;
		var min = 0;
		return phrases[ Math.floor(Math.random() * (max - min)) + min];
	}
	
});