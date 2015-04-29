var $chart = $('#chart');
var w = $chart.width();
var h = $chart.height();
hpadding = h/10;
wpadding = w/10;

var title = $('#chart-title').text();
var startyear;
var endyear;
var metrics = ['continent','tour', 'surface', 'prize','startyear','endyear'];
var active_metrics = {'continent': "asia", 'tour': "all-tour", 'surface':'all-surface', 'prize':'tournaments', 'startyear': 2010, 'endyear': 2014};

var continent_mapping = {'asia': 'Asia'};

$('#chart-title').hover(function() {
  $(this).text("Data from atpworldtour.com and wikipedia.com");
}, function() { 
  $(this).text(title);
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

var startdateparent = $('#options-start-year');

for (i=10; i>0; i--) {
  $('#options-start-year')
  .append($('<div></div>')
  .addClass('options-dropdown-row options-dropdown-5-row options-start-year-row')
  .attr('data',i));

  $('#options-end-year')
  .append($('<div></div>')
  .addClass('options-dropdown-row options-dropdown-6-row options-end-year-row')
  .attr('data',i));
}

$('.options-dropdown-row.options-dropdown-5-row.options-start-year-row').each(function() {
  for (i=0; i<5; i++) {
    var year = 1968 + 1 + (parseInt($(this).attr('data'))-1)*5 - i;
    if (year >= 1968) {
      $(this)
      .append($('<div></div>')
      .addClass('button-dropdown-metrics button button-dropdown-5 button-dropdown-start-year')
      .attr('id','start-year-'+String(year))
      .text(year));
    }
  }
})

$('.options-dropdown-row.options-dropdown-6-row.options-end-year-row').each(function() {
  for (i=0; i<5; i++) {
    var year = 1968 + 1 + (parseInt($(this).attr('data'))-1)*5 - i;
    if (year >= 1968) {
      $(this)
      .append($('<div></div>')
      .addClass('button-dropdown-metrics button button-dropdown-6 button-dropdown-end-year')
      .attr('id','end-year-'+String(year))
      .text(year));
    }
  }
})

$('#start-year-2010').addClass('active');
$('#end-year-2014').addClass('active');

disable_year();

function disable_year() {
    startyear = parseInt($('.button-dropdown-start-year.active').text());
    endyear = parseInt($('.button-dropdown-end-year.active').text());
    console.log(startyear);
    console.log(endyear);

    for (i=1968; i<startyear; i++) {
      $('#end-year-'+String(i)).removeClass('active');
      $('#end-year-'+String(i)).addClass('disabled');
    }

    for (i=endyear+1; i<2015; i++) {
      $('#start-year-'+String(i)).removeClass('active');
      $('#start-year-'+String(i)).addClass('disabled');
    }
}

//create filters
function filter_criteria(data) {
  //filler filter
  var filter = "d.country != ''";

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

var svg = d3.select("#chart")
    .append("svg")
    .attr("width","100%")
    .attr("height","100%")
    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
    .attr('preserveAspectRatio','xMinYMin')
    .append("g");
    //.attr("transform", "translate(" + wpadding/2 + "," + hpadding/2 + ")");

var file = 'asia';

queue()
  .defer(d3.json, "data/map/" + file + "_topo.json")
  .defer(d3.csv, "data/alltournaments_final.csv")
  .await(ready);

function ready(error, continent, tournaments) {
  console.log(continent);
  console.log(tournaments);

  var tournamentsById = d3.nest()
    .key(function(d) { return d.country; })
    .map(tournaments,d3.map);

  console.log(tournamentsById);

  var tournaments_in_continent = tournaments.filter(function(d) {return d.continent == continent_mapping[file]; });

  console.log(tournaments_in_continent);

  //make map of tourmanets in continent, then d3.map.get(country) for each country

/*
d3.json("data/map/" + file + "_topo.json", function(error, continent) {
  if (error) return console.error(error);
  console.log(continent);
*/
  var countries = topojson.feature(continent, eval("continent.objects." + file + "_geo"));

  //start with unit projection
  var projection = d3.geo.equirectangular()
  	.scale(1);

  //create new path generator
  var path = d3.geo.path()
    .projection(projection);

  /*
  //centroid method - doesn't work! not looking for centroids
  var centroids = [];
  var x = 0;
  var y = 0;

  //get list of centroids and overall centroid as average
  for (i = 0; i < topojson.feature(uk, uk.objects.asia_geo).features.length; i++) {
    centroids.push(d3.geo.centroid(topojson.feature(uk, uk.objects.asia_geo).features[i]));
    x = x + d3.geo.centroid(topojson.feature(uk, uk.objects.asia_geo).features[i])[0]/topojson.feature(uk, uk.objects.asia_geo).features.length;
    y = y + d3.geo.centroid(topojson.feature(uk, uk.objects.asia_geo).features[i])[1]/topojson.feature(uk, uk.objects.asia_geo).features.length;
  }
  */

  //box method (path -> for scaling) - get most extreme corners of each constituent
  //leftcornerp = [], bottomcornerp = [], rightcornerp = [], topcornerp = [];
  var leftcp, bottomcp, rightcp, topcp;

  leftcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[0][0];
  bottomcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[0][1];
  rightcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[1][0];
  topcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[1][1];

  //get list of 4 corners
  /*
  for (i = 0; i < topojson.feature(uk, uk.objects.asia_geo).features.length; i++) {
    leftcornerp.push(path.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[0][0]);
    bottomcornerp.push(path.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[0][1]);
    rightcornerp.push(path.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[1][0]);
    topcornerp.push(path.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[1][1]);
  }
  */

  for (i = 1; i < topojson.feature(continent, eval("continent.objects." + file + "_geo")).features.length; i++) {
    if (path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][0] < leftcp) {
      leftcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][0]
    }
    if (path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][1] < bottomcp) {
      bottomcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][1]
    }
    if (path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][0] > rightcp) {
      rightcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][0]
    }
    if (path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][1] > topcp) {
      topcp = path.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][1]
    }
  }

  console.log(leftcp, bottomcp, rightcp, topcp);
  //europe cp 479.57552838533854 248.5922809027009 480.6997026542199 249.39047106129206
  //europe c -24.320432043204306 34.92343567905359 40.090009000900096 80.65636301520415



  //get most extreme
  /*
  leftcp = Math.min.apply(Math,leftcornerp);
  bottomcp = Math.min.apply(Math,bottomcornerp);
  rightcp = Math.max.apply(Math,rightcornerp);
  topcp = Math.max.apply(Math,topcornerp);
  */
  
  //scaling factor
  var s = .90 / Math.max((rightcp-leftcp) / (w+wpadding), (topcp-bottomcp) / (h+hpadding));

  //box method (geo -> for center)
  //leftcorner = [], bottomcorner = [], rightcorner = [], topcorner = [];
  var leftc, bottomc, rightc, topc;

  //get list of 4 corners
  /*
  for (i = 0; i < topojson.feature(uk, uk.objects.asia_geo).features.length; i++) {
    leftcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[0][0]);
    bottomcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[0][1]);
    rightcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[1][0]);
    topcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.asia_geo).features[i])[1][1]);
  }
  */

  leftc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[0][0];
  bottomc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[0][1];
  rightc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[1][0];
  topc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[0])[1][1];

  for (i = 1; i < topojson.feature(continent, eval("continent.objects." + file + "_geo")).features.length; i++) {
    if (d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][0] < leftc) {
      leftc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][0]
    }
    if (d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][1] < bottomc) {
      bottomc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[0][1]
    }
    if (d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][0] > rightc) {
      rightc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][0]
    }
    if (d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][1] > topc) {
      topc = d3.geo.bounds(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features[i])[1][1]
    }
  }

  //get most extreme
  /*
  leftc = Math.min.apply(Math,leftcorner);
  bottomc = Math.min.apply(Math,bottomcorner);
  rightc = Math.max.apply(Math,rightcorner);
  topc = Math.max.apply(Math,topcorner);
  */

  console.log(leftc, bottomc, rightc, topc);

  //europe cp 479.57552838533854 248.5922809027009 480.6997026542199 249.39047106129206
  //europe c -24.320432043204306 34.92343567905359 40.090009000900096 80.65636301520415

  //center, translate, scale projection
  if (file != 'europe') {
    projection.center([(leftc+rightc)/2, (topc+bottomc)/2]);
    projection.translate([(w+wpadding)/2, (h+hpadding)/2]);
    projection.scale(s);
  } else {
    console.log('europe');
    projection.center([(-24.320432043204306+40.090009000900096)/2, (34.92343567905359+80.65636301520415)/2]);
    projection.translate([(w+wpadding)/2, (h+hpadding)/2]);
    projection.scale(.90 / Math.max((480.6997026542199-479.57552838533854) / (w+wpadding), (249.39047106129206-248.5922809027009) / (h+hpadding)));
  }
  

  //draw path on svg
  svg.append("path")
    .datum(countries)
    .attr("d", path);

  //draw subunits
  svg.selectAll(".countries")
    .data(topojson.feature(continent, eval("continent.objects." + file + "_geo")).features)
    .enter().append("path")
    .attr("class", function(d) { return "country " + d.id; })
    .attr("id", function(d) { return d.id; })
    .attr("d", path);
    //.on('mouseover', function(d) { tip.show(d);})
    //.on('mouseout', function(d) { });

  /*

  //draw dots for places (note datum)
  svg.append("path")
    .datum(topojson.feature(uk, uk.objects.places_ger))
    .attr("d", path)
    .attr("class", "place")
    .attr("d",path.pointRadius(1));

  //draw labels
  svg.selectAll(".place-label")
    .data(topojson.feature(uk, uk.objects.places_ger).features)
    .enter().append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.properties.name; });

  //style labels
  svg.selectAll(".place-label")
    .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
    .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });
  
  */
};