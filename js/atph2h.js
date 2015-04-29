var dataset = [];
var dict = {};
var data = [];
var $chart = $('#chart-top');
var w = $chart.width();
var h = $chart.height();
hpadding = h/10;
wpadding = w/10;
var metrics = ['gsm','surface','level', 'player', 'year','round','location'];
var active_metrics = {'gsm': "matches", 'surface': "all-surface", 'level':'all-level', 'player':'1', 'year': "all-year",'round':'all-round','location':'all-location'};
var players = {1: "Djokovic", 2: "Federer", 3: "Wawrinka", 4: "Nishikori", 5: "Murray", 6: "Berdych", 7: "Raonic", 8: "Cilic"};

var svg = d3.select("#chart-top")
	    .append("svg")
	    .attr("width","100%")
	    .attr("height","100%")
	    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
	    .attr('preserveAspectRatio','xMinYMin')
	    .append("g")
	    .attr("transform", "translate(" + wpadding/2 + "," + hpadding/2 + ")");

var svg2 = d3.select("#chart-bottom")
	    .append("svg")
	    .attr("width","100%")
	    .attr("height","100%")
	    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
	    .attr('preserveAspectRatio','xMinYMin')
	    .append("g")
	    .attr("transform", "translate(" + wpadding/2 + "," + 0 + ")");

var svg3 = d3.select("#chart-middle")
	    .append("svg")
	    .attr("width","100%")
	    .attr("height","1200%")
	    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
	    .attr('preserveAspectRatio','xMinYMin')
	    .append("g")
	    .attr("transform", "translate(" + wpadding/2 + "," + 0 + ")");

var xScale, yScale, yScale2, xAxis, yAxis, yAxis2;

String.prototype.capitalize = function() {
    return this.charAt(0).toUpperCase() + this.slice(1);
}

var title = $('#chart-title').text();

$('#chart-title').hover(function() {
	$(this).text("Data from atpworldtour.com");
	$('#options-player').css("display","table");
}, function() { 
	$(this).text(title);
	$('#options-player').css("display","none");
});

$('.button-metrics.button').hover(function() {
	type = this.id;
	$('#options-'+type).css("display","table");
}, function() { $('#options-'+type).css("display","none");
});


$('.options-dropdown').hover(function() {
	$(this).css("display","table");
}, function() { $(this).css("display","none");
});


//functions for each metric that call update
var funcs = [];

function createfunc(i) {
	return function() { 
		$(".button-dropdown-"+metrics[i]).on("click", function() {
		$(".button-dropdown-"+metrics[i]).removeClass("active");
		$(this).addClass("active");
		if (metrics[i] == 'player') {
			active_metrics[metrics[i]] = $(this).attr("value");
			title = "2014 ATP Championship H2H: "+this.id.capitalize();
			$('#chart-title').text(title);
		} else {
			active_metrics[metrics[i]] = this.id;
			$('#'+metrics[i]).text($(this).text());
		}
		$("#options-"+metrics[i]).css('display','none');
		update_dataset(data);
		
	});
	};
}

for (var i = 0; i < metrics.length; i++) {
    funcs[i] = createfunc(i);
}

for (var j = 0; j < metrics.length; j++) {
    funcs[j]();
}

//create filters
function filter_criteria(data) {
	var filter = "d.winner_number > 0";

	switch(active_metrics['surface']) {
		case "all-surface":
			break;
		case "hard":
			filter = filter + " && d.surface == 'Hard'";
			break;
		case "clay":
			filter = filter + " && d.surface == 'Clay'";
			break;
		case "grass":
			filter = filter + " && d.surface == 'Grass'";
			break;
		case "carpet":
			filter = filter + " && d.surface == 'Carpet'";
			break;
		default:
			break;
	}

	switch(active_metrics['level']) {
		case "all-level":
			break;
		case "grand-slam":
			filter = filter + " && d.level == 'Grand Slam'";
			break;
		case "world-tour-finals":
			filter = filter + " && d.level == 'World Tour Finals'";
			break;
		case "masters-1000":
			filter = filter + " && d.level == 'Masters 1000'";
			break;
		case "olympics-dc":
			filter = filter + " && d.level == 'Olympics/DC'";
			break;
		case "other-level":
			filter = filter + " && (d.level != 'Grand Slam') && (d.level != 'World Tour Finals') && (d.level != 'Masters 1000') && (d.level != 'Olympics/DC')";
			break;
		default:
			break;
	}

	filter = filter + " && (d.player1_num == " + active_metrics['player'] + " || d.player2_num == " + active_metrics['player'] + ")";

	switch(active_metrics['year']) {
		case "all-year":
			break;
		case "2010-before":
			filter = filter + " && d.year <= 2010";
			break;
		default:
			filter = filter + " && d.year == "+active_metrics['year'];
			break;
	}

	switch(active_metrics['round']) {
		case "all-round":
			break;
		case "final":
			filter = filter + " && d.round == 'F'";
			break;
		case "semifinal":
			filter = filter + " && d.round == 'S'";
			break;
		case "quarterfinal":
			filter = filter + " && d.round == 'Q'";
			break;
		case "round-robin":
			filter = filter + " && d.round == 'RR'";
			break;
		case "other-round":
			filter = filter + " && (d.round != 'F') && (d.round != 'S') && (d.round != 'Q') && (d.round != 'RR')";
			break;
		default:
			break;
	}

	switch(active_metrics['location']) {
		case "all-location":
			break;
		case "europe":
			filter = filter + " && d.location == 'Europe'";
			break;
		case "america":
			filter = filter + " && d.location == 'Americas'";
			break;
		case "asia-australia":
			filter = filter + " && d.location == 'Asia'";
			break;
		case "middle-east":
			filter = filter + " && d.location == 'Middle East'";
			break;
		default:
			break;
	}

	var result = data.filter(function (d) { return eval(filter); });
	return result;
}

//get max of both home and away
function get_range() {
	home_max = Math.max.apply(Math,dataset.map(function(d){return eval("d.home_"+active_metrics['gsm']);}));
	away_max = Math.max.apply(Math,dataset.map(function(d){return eval("d.away_"+active_metrics['gsm']);}));
	overall_max = Math.max(home_max,away_max);
	return overall_max;
}

//main function for drawing chart
function update_chart() {

	y_max = get_range();

	xScale = d3.scale.ordinal().domain(dataset.map(function(d) { return players[d.away]; })).rangeBands([0,w],.5);
	yScale = d3.scale.linear().domain([0,y_max]).range([h,0]);
	yScale2 = d3.scale.linear().domain([0,y_max]).range([0,h]);
	
	xAxis = d3.svg.axis().scale(xScale).orient("bottom").tickSize(0,0);
	yAxis = d3.svg.axis().scale(yScale).orient("left").tickSize(0,0);
	yAxis2 = d3.svg.axis().scale(yScale2).orient("left").tickSize(0,0);

/*
	svg.append("g")
		.attr("class","axis")
		.attr("transform", "translate("+ 0 + "," + h + ")")
		.call(xAxis);
*/
    var key = function(d) {
		return d.away;
	}

	bars_home = svg.selectAll(".bar")
    	.data(dataset, key);

        bars_home.enter()
    	.append("rect")
    	.attr("fill", "#ffffff")
    	.transition()
    	.duration(500)
    	.ease("linear")
    	.attr("class", function(d) { return "bar bar" + players[d.away]; })
    	.attr("id", function(d) { return "bar-home-" + players[d.away]; })
    	.attr("x", function(d) { return xScale(players[d.away]); })
		.attr("width", xScale.rangeBand())
		.attr("y", function(d) { return yScale(eval("d.home_"+active_metrics['gsm'])); })
		.attr("height", function(d) { return h - yScale(eval("d.home_"+active_metrics['gsm'])); })
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); });

        bars_home
        .transition()
        .duration(500)
        .ease("linear")
        .attr("class", function(d) { return "bar bar" + players[d.away]; })
    	.attr("id", function(d) { return "bar-home-" + players[d.away]; })
    	.attr("x", function(d) { return xScale(players[d.away]); })
		.attr("width", xScale.rangeBand())
		.attr("y", function(d) { return yScale(eval("d.home_"+active_metrics['gsm'])); })
		.attr("height", function(d) { return h - yScale(eval("d.home_"+active_metrics['gsm'])); })
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); });

		bars_home
		.on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); })
        .on('mouseout', function(d) { $('.chart-label.label-' + players[d.away]).hide(); });

        bars_home.exit()
        .transition()
        .duration(500)
        .ease("linear")
        .remove();

    labels_home = svg.selectAll("text")
    	.data(dataset, key);
    
    	labels_home.enter()
    	.append("text")
    	.attr("class", function(d) { return "chart-label label-" + players[d.away]; })
    	.attr("id", function(d) { return "label-home-" + players[d.away]; })
    	.text(function(d) { if (eval("d.home_"+active_metrics['gsm']) != 0) {return eval("d.home_"+active_metrics['gsm']); } })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length;  })
		.attr("y", function(d) { return eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7 ? yScale(eval("d.home_"+active_metrics['gsm'])) - 8 : yScale(eval("d.home_"+active_metrics['gsm'])) + 20; })
		.attr("font-size", "2rem")
		.attr("fill", function(d) { 
			if (eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.attr("stroke", function(d) { 
			if (eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); });

		labels_home
		.attr("class", function(d) { return "chart-label label-" + players[d.away]; })
    	.attr("id", function(d) { return "label-home-" + players[d.away]; })
    	.text(function(d) { if (eval("d.home_"+active_metrics['gsm']) != 0) {return eval("d.home_"+active_metrics['gsm']); } })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length;  })
		.attr("y", function(d) { return eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7 ? yScale(eval("d.home_"+active_metrics['gsm'])) - 8 : yScale(eval("d.home_"+active_metrics['gsm'])) + 20; })
		.attr("font-size", "2rem")
		.attr("fill", function(d) { 
			if (eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.attr("stroke", function(d) { 
			if (eval("d.home_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); });

		labels_home.exit().remove();

    labels_middle = svg3.selectAll("text")
    	.data(dataset, key);
    
    	labels_middle.enter()
    	.append("text")
    	.transition()
    	.duration(500)
    	.ease("linear")
    	.attr("class", function(d) { return "chart-label-middle label-middle-" + players[d.away]; })
    	.attr("id", function(d) { return "label-middle-" + players[d.away]; })
    	.text(function(d) { return players[d.away]; })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length;  })
		.attr("y", 12)
		.attr("font-size", "2rem")
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); })
		.attr("stroke", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); });

		labels_middle
		.transition()
    	.duration(500)
    	.ease("linear")
		.attr("class", function(d) { return "chart-label-middle label-middle-" + players[d.away]; })
    	.attr("id", function(d) { return "label-middle-" + players[d.away]; })
    	.text(function(d) { return players[d.away]; })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length;  })
		.attr("y", 12)
		.attr("font-size", "2rem")
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); })
		.attr("stroke", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); });

		labels_middle.exit()
		.transition()
    	.duration(500)
    	.remove();

	bars_away = svg2.selectAll(".bar")
    	.data(dataset, key);

    	bars_away.enter()
    	.append("rect")
    	.attr("fill", "#ffffff")
    	.transition()
    	.duration(500)
    	.ease("linear")
    	.attr("class", function(d) { return "bar bar" + players[d.away]; })
    	.attr("id", function(d) { return "bar-away-" + players[d.away]; })
    	.attr("x", function(d) { return xScale(players[d.away]); })
		.attr("width", xScale.rangeBand())
		.attr("y", 0)
		.attr("height", function(d) { return yScale2(eval("d.away_"+active_metrics['gsm'])); })
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); })
		
        bars_away
        .transition()
    	.duration(500)
    	.ease("linear")
    	.attr("class", function(d) { return "bar bar" + players[d.away]; })
    	.attr("id", function(d) { return "bar-away-" + players[d.away]; })
    	.attr("x", function(d) { return xScale(players[d.away]); })
		.attr("width", xScale.rangeBand())
		.attr("y", 0)
		.attr("height", function(d) { return yScale2(eval("d.away_"+active_metrics['gsm'])); })
		.attr("fill", function(d) { return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62"); })

        bars_away
        .on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); })
        .on('mouseout', function(d) { $('.chart-label.label-' + players[d.away]).hide(); });

        bars_away.exit()
        .transition()
    	.duration(500)
    	.ease("linear")
    	.remove();

    labels_away = svg2.selectAll("text")
    	.data(dataset, key);

    	labels_away.enter()
    	.append("text")
    	.attr("class", function(d) { return "chart-label label-" + players[d.away]; })
    	.attr("id", function(d) { return "label-away-" + players[d.away]; })
    	.text(function(d) { if (eval("d.away_"+active_metrics['gsm']) != 0) {return eval("d.away_"+active_metrics['gsm']); } })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length; })
		.attr("y", function(d) { return eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7 ? yScale2(eval("d.away_"+active_metrics['gsm'])) + 16 : yScale2(eval("d.away_"+active_metrics['gsm'])) - 16; })
		.attr("font-size", "2rem")
		.attr("fill", function(d) { 
			if (eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.attr("stroke", function(d) { 
			if (eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62")
			} else {
				return "#ffffff";
			}; })
		.on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); });


		labels_away
    	.attr("class", function(d) { return "chart-label label-" + players[d.away]; })
    	.attr("id", function(d) { return "label-away-" + players[d.away]; })
    	.text(function(d) { if (eval("d.away_"+active_metrics['gsm']) != 0) {return eval("d.away_"+active_metrics['gsm']); } })
    	.attr("text-anchor","middle")
    	.attr("x", function(d) { return xScale(players[d.away]) + 0.25 * (w-wpadding)/dataset.length; })
		.attr("y", function(d) { return eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7 ? yScale2(eval("d.away_"+active_metrics['gsm'])) + 16 : yScale2(eval("d.away_"+active_metrics['gsm'])) - 16; })
		.attr("font-size", "2rem")
		.attr("fill", function(d) { 
			if (eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62");
			} else {
				return "#ffffff";
			}; })
		.attr("stroke", function(d) { 
			if (eval("d.away_"+active_metrics['gsm'])/y_max <= 1/7) {
				return (eval("d.home_"+active_metrics['gsm']) >= eval("d.away_"+active_metrics['gsm']) ? "#00401E" : "#3A8F62");
			} else {
				return "#ffffff";
			}; })
		.on('mouseover', function(d) { $('.chart-label.label-' + players[d.away]).show(); });

		labels_away.exit().remove();

}

//first call to dataset on load
d3.csv("data/atph2h.csv", function(error, all_data) {

	data = all_data;

	//first load
	update_dataset(data);

});

function update_dataset(data) {
	dataset = [];

	//dict to be put into dataset
	dict = {
		1: {home: parseInt(active_metrics['player']), away: 1, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		2: {home: parseInt(active_metrics['player']), away: 2, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		3: {home: parseInt(active_metrics['player']), away: 3, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		4: {home: parseInt(active_metrics['player']), away: 4, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		5: {home: parseInt(active_metrics['player']), away: 5, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		6: {home: parseInt(active_metrics['player']), away: 6, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		7: {home: parseInt(active_metrics['player']), away: 7, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0},
		8: {home: parseInt(active_metrics['player']), away: 8, home_matches: 0, home_sets: 0, home_games: 0, away_matches: 0, away_sets: 0, away_games: 0}
	}
	var relevant = filter_criteria(data);

	for (var i = 0;i<relevant.length;i++) {
		entry = relevant[i];
		var players = [entry.player1_num,entry.player2_num];

		var index = players.indexOf(active_metrics['player']);

		//get number of opponent
		players.splice(index,1);
		var away_player = players[0];

		if (entry.winner_number == active_metrics['player']) {
			dict[away_player].home_matches = dict[away_player].home_matches + 1;
			dict[away_player].home_sets = dict[away_player].home_sets + parseInt(entry.winner_sets);
			dict[away_player].home_games = dict[away_player].home_games + parseInt(entry.winner_games);
			dict[away_player].away_sets = dict[away_player].away_sets + parseInt(entry.loser_sets);
			dict[away_player].away_games = dict[away_player].away_games + parseInt(entry.loser_games);
		} else {
			dict[away_player].away_matches = dict[away_player].away_matches + 1;
			dict[away_player].away_sets = dict[away_player].away_sets + parseInt(entry.winner_sets);
			dict[away_player].away_games = dict[away_player].away_games + parseInt(entry.winner_games);
			dict[away_player].home_sets = dict[away_player].home_sets + parseInt(entry.loser_sets);
			dict[away_player].home_games = dict[away_player].home_games + parseInt(entry.loser_games);
		}
	}

	for (var i = 0;i<8;i++) {
		if (i+1 != active_metrics['player']) {
			dataset.push(dict[i+1]);
		}
	}

	//with updated dataset, call drawing function
	update_chart();
}
