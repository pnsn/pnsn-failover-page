$(function(){
    var MAX_LAT = 51, 
    	MIN_LAT = 39.3,
    	MAX_LON = -116,
		MIN_LON = -131.7;
		nowTime = Date.now();
		//Only Grab events in last two weeks
		var howManyDays = 14;
		var newDate = nowTime - howManyDays * 24 * 3600 * 1000;
		var starttime = (new Date(newDate)).toISOString();
			starttime = starttime.replace(/T(.)*$/mg, "");

	var url = "https://earthquake.usgs.gov/fdsnws/event/1/query?format=geojson&minlatitude="+MIN_LAT+"&maxlatitude=" + MAX_LAT + "&maxlongitude=" + MAX_LON + "&minlongitude=" + MIN_LON + "&starttime=" + starttime;
	$("#last-updated span").text(new Date(nowTime));
	$.ajax({
		dataType: "json", 
		url: url
	}).done(function(data){
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
			if(event.mag > 2 || event.net === "uw" || event.net === "cc") {
			
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
				
				var daysAgo = (nowTime - event.time.getTime())/(1000 * 60 * 60 * 24);
				var daysAgoString;
				if (Math.floor(daysAgo) == 0){
					if(daysAgo * 24 < 1) {
						daysAgoString = "about " + Math.floor(daysAgo * 24 * 60) + " minutes"
					} else {
						daysAgoString = "about " + Math.floor(daysAgo * 24)+ " hours";
					}
					
				} else if (Math.floor(daysAgo) == 1) {
					daysAgoString = "1 day"
				} else {
					daysAgoString = Math.floor(daysAgo) + " days"
				}
			
				//javascript date handling sucks
				//what is even happening here
				var local = fixDate([event.time.getFullYear(), event.time.getMonth(), event.time.getDate(), event.time.getHours(), event.time.getMinutes(), event.time.getSeconds()]) + " " + event.time.toString().match(/\(([A-Za-z\s].*)\)/)[1];
				var utc = fixDate([event.time.getUTCFullYear(), event.time.getUTCMonth(), event.time.getUTCDate(), event.time.getUTCHours(), event.time.getUTCMinutes(), event.time.getUTCSeconds()]) + " UTC";

				var left = $("<td><div class='mag "+klass+"'<p>" + round(event.mag , 1) + "</p></div></td>");
				var middle = $("<td><div class='top'>"+event.place+"</div><div class='bottom'> <div class='time toggleable'>"+ local + "</div> <div class='time toggleable off'>"+  utc + "</div></div></div></td>");
				var right = $("<td><div class='top'>"+daysAgoString+"</div><div class='bottom'><div class='depth toggleable off'>" + round(event.depth * 0.621371, 1) + " mi </div> <div class='depth toggleable'>"+ round(event.depth , 1 ) + " km</div></td>")
				row.append(left, middle, right);
				tbody.append(row);
			}

		});
		
	});
	
	function fixDate(date){
		date[1] = parseInt(date[1]) + 1;
		
		$.each(date, function(i, datestuff){
			if(parseInt(datestuff) < 10){
				date[i] = "0" + datestuff;
			}
		});
		return date[0] + "/" + date[1] + "/" + date[2] + " " + date[3] + ":" + date[4] + ":" + date[5];
	}
	
	function round(value, fixed){
		return parseFloat(Math.round(value * 10.0) / 10.0).toFixed(fixed);
	}


    $(".toggler").click(function(){
      var target = $(this).attr("toggle");
      if($(target).hasClass("toggleable")){
          $(target).toggleClass("off");
      }
    });
	
});