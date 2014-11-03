var dataset;
var $chart = $('#chart');
var w = $chart.width();
var h = $chart.height();
hpadding = h/10;
wpadding = w/10;

var title = $('#chart-title').text();

$('#chart-title').hover(function() {
	$(this).text("Data from wikipedia.com");
}, function() { $(this).text(title);
});

d3.csv("data/usopenseries.csv", function(error, data) {
	dataset = data;

	draw();
});

//key for data join
var key = function(d) {
	return d.id;
}

function draw() {
	//var xScale = d3.scale.linear().domain([d3.min(dataset, function(d) { return d.year-1 }),d3.max(dataset, function(d) { return parseInt(d.year)+1 })]).range([padding,w-padding*2]);
	var xScale = d3.scale.linear().domain([d3.min(dataset, function(d) { return d.year-1 }),d3.max(dataset, function(d) { return parseInt(d.year)+1 })]).range([0,w]);
	//var yScale = d3.scale.log().base(2).domain([d3.min(dataset, function(d) { return d.open }),d3.max(dataset, function(d) { return parseInt(d.open)+1 })]).range([h-padding,padding]);
	//var yScale = d3.scale.log().domain([0,128]).range([h-padding,padding]);
	var yScale = d3.scale.ordinal().domain(["1st Round", "2nd Round", "3rd Round", "4th Round", "Quarterfinals", "Semifinals", "Runner Up", 
	"Champion"]).rangeBands([h,0]);
	var rScale = d3.scale.linear().domain([d3.min(dataset, function(d) { return d.place }),d3.max(dataset, function(d) { return d.place })]).range([20,5]);

	var xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickFormat(d3.format("d")).tickValues(["",2004,2005,2006,2007,2008,2009,2010,2011,2012,2013,2014,""]).tickSize(0,0);
	var yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0,0);

	var svg = d3.select("#chart")
        .append("svg")
        .attr("width","100%")
        .attr("height","100%")
        .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
        .attr('preserveAspectRatio','xMinYMin')
        .append("g")
        .attr("transform", "translate(" + wpadding/2 + "," + hpadding/3 + ")");

    var tip = d3.tip().html(function(d) { return d.player; });

    svg.call(tip);
	
    svg.selectAll("circle")
	   .data(dataset, key)
	   .enter()
	   .append("circle")
	   .attr("cx", function(d) {
	   	//male left, female right, use hpadding because of mobile
	   	cx = parseInt(d.year) - .25 + parseInt(d.gender)*.5;
	   	return xScale(cx)+hpadding/2;
	   })
	   .attr("cy", function(d) {
	   	return yScale(d.open)+h/16;
	   })
	   .attr("r", function(d) {
	   	return rScale(d.place);
	   })
	   .attr("fill", function(d) {
	   	return "rgba(" + ((100+d.place*50)*0.9*d.gender) + ", 0" + ", " + ((100+d.place*50)*(1-d.gender)) + ", " + 1/(d.place) + ")";
	   })
	   .on('mouseover', tip.show)
       .on('mouseout', tip.hide);
	
    d3.selectAll(".button_gender").on("click", function() {
    	$('.button_gender').each(function(i, obj) {
    		//check all buttons for previous active, remove active, flip colors, no border
    		if($(this).hasClass("active")) {
    			bg = $(this).css("color");
		    	$(this).css("color",$(this).css("background-color"));
		    	$(this).css("background-color",bg);
		    	$(this).css("border","none");
		    	$(this).removeClass("active");
    		}
    	});

    	//make current selection active, flip colors, add border
    	$(this).addClass("active");

    	bg = $(this).css("color");
    	$(this).css("color",$(this).css("background-color"));
    	$(this).css("background-color",bg);
    	$(this).css("border","3px solid "+$(this).css("color"));

    	//get gender of current selection and place from active place button
    	var gender = this.id;
    	var place = $(".button_place.active").attr("id");

    	d3.csv("data/usopenseries.csv", function(error, data) {

    		//filter based on active selections
			if (gender == "all-genders") {
				if(place == "all-places") {
				} else {
					data = data.filter(function(row) {
	                return row['place'] == place_dict[place];
	            	}); 
				}
			} else {
				if(place == "all-places") {
					data = data.filter(function(row) {
	                return row['gender'] == gender_dict[gender];
	            	}); 
				} else {
					data = data.filter(function(row) {
                	return (row['gender'] == gender_dict[gender] & row['place'] == place_dict[place]);
					});
				}
			}

			dataset = data;

			//define new data
			var new_data = svg.selectAll("circle")
				.data(dataset, key);

			//new nonexisting data
			new_data
				.enter()
				.append("circle")
				.attr("cx", function(d) {
				cx = parseInt(d.year) -.25 + parseInt(d.gender)*.5;
					return xScale(cx)+hpadding/2;
				})
				.attr("cy", function(d) {
					return yScale(d.open)+h/16;
				})
				.attr("r", function(d) {
					return rScale(d.place);
				})
				.attr("fill", function(d) {
					return "rgba(" + ((100+d.place*50)*0.9*d.gender) + ", 0" + ", " + ((100+d.place*50)*(1-d.gender)) + ", " + 1/(d.place) + ")";
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

			//old data
			new_data
				.exit()
				.remove();
	    })
	});

    d3.selectAll(".button_place").on("click", function() {
    	
    	$('.button_place').each(function(i, obj) {
    		if($(this).hasClass("active")) {
    			bg = $(this).css("color");
		    	$(this).css("color",$(this).css("background-color"));
		    	$(this).css("background-color",bg);
		    	$(this).css("border","none");
		    	$(this).removeClass("active");
    		}
    	});

    	$(this).addClass("active");

    	bg = $(this).css("color");
    	$(this).css("color",$(this).css("background-color"));
    	$(this).css("background-color",bg);
    	$(this).css("border","3px solid "+$(this).css("color"));
    	
    	var place = this.id;
    	var gender = $(".button_gender.active").attr("id");

    	d3.csv("data/usopenseries.csv", function(error, data) {

			if (gender == "all-genders") {
				if(place == "all-places") {
				} else {
					data = data.filter(function(row) {
	                return row['place'] == place_dict[place];
	            	}); 
				}
			} else {
				if(place == "all-places") {
					data = data.filter(function(row) {
	                return row['gender'] == gender_dict[gender];
	            	}); 
				} else {
					data = data.filter(function(row) {
                	return (row['gender'] == gender_dict[gender] & row['place'] == place_dict[place]);
					});
				}
			}

			dataset = data;

			var new_data = svg.selectAll("circle")
				.data(dataset, key);

			new_data
				.enter()
				.append("circle")
				.attr("cx", function(d) {
				cx = parseInt(d.year) - .25 + parseInt(d.gender)*.5;
					return xScale(cx)+hpadding/2;
				})
				.attr("cy", function(d) {
					return yScale(d.open)+h/16;
				})
				.attr("r", function(d) {
					return rScale(d.place);
				})
				.attr("fill", function(d) {
					return "rgba(" + ((100+d.place*50)*0.9*d.gender) + ", 0" + ", " + ((100+d.place*50)*(1-d.gender)) + ", " + 1/(d.place) + ")";
				})
				.on('mouseover', tip.show)
				.on('mouseout', tip.hide);

			new_data
				.exit()
				.remove();
	    })
	});

	//dictionaries for gender and place
    var gender_dict = {
    	"atp": 0,
    	"wta": 1
    }

    var place_dict = {
    	"one": 1,
    	"two": 2,
    	"three": 3
    }

    //draw axes and translate them
	svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate("+ hpadding/2 + "," + h + ")")
		.call(xAxis);

	svg.append("g")
	    .attr("class", "axis")
	    .attr("transform", "translate(" + hpadding/2 + "," + 0 + ")")
	    .call(yAxis);
}

