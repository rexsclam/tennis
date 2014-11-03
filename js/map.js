var $chart = $('#chart');
var w = $chart.width();
var h = $chart.height();
hpadding = h/10;
wpadding = w/10;

console.log(w);
console.log(h);

var svg = d3.select("#chart")
    .append("svg")
    .attr("width","100%")
    .attr("height","100%")
    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
    .attr('preserveAspectRatio','xMinYMin')
    .append("g");
    //.attr("transform", "translate(" + wpadding/2 + "," + hpadding/2 + ")");


d3.json("data/uk.json", function(error, uk) {
  if (error) return console.error(error);
  console.log(uk);

  var subunits = topojson.feature(uk, uk.objects.subunits);

  //start with unit projection
  var projection = d3.geo.mercator()
  	.scale(1);

  //create new path generator
  var path = d3.geo.path()
    .projection(projection);

  //centroid method - doesn't work! not looking for centroids
  var centroids = [];
  var x = 0;
  var y = 0;

  //get list of centroids and overall centroid as average
  for (i = 0; i < topojson.feature(uk, uk.objects.subunits).features.length; i++) {
    centroids.push(d3.geo.centroid(topojson.feature(uk, uk.objects.subunits).features[i]));
    x = x + d3.geo.centroid(topojson.feature(uk, uk.objects.subunits).features[i])[0]/topojson.feature(uk, uk.objects.subunits).features.length;
    y = y + d3.geo.centroid(topojson.feature(uk, uk.objects.subunits).features[i])[1]/topojson.feature(uk, uk.objects.subunits).features.length;
  }

  //box method (path -> for scaling) - get most extreme corners of each constituent
  leftcornerp = [], bottomcornerp = [], rightcornerp = [], topcornerp = [];

  //get list of 4 corners
  for (i = 0; i < topojson.feature(uk, uk.objects.subunits).features.length; i++) {
    leftcornerp.push(path.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[0][0]);
    bottomcornerp.push(path.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[0][1]);
    rightcornerp.push(path.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[1][0]);
    topcornerp.push(path.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[1][1]);
  }

  //get most extreme
  leftcp = Math.min.apply(Math,leftcornerp);
  bottomcp = Math.min.apply(Math,bottomcornerp);
  rightcp = Math.max.apply(Math,rightcornerp);
  topcp = Math.max.apply(Math,topcornerp);
  
  //scaling factor
  var s = .80 / Math.max((rightcp-leftcp) / (w+wpadding), (topcp-bottomcp) / (h+hpadding));

  //box method (geo -> for center)
  leftcorner = [], bottomcorner = [], rightcorner = [], topcorner = [];

  //get list of 4 corners
  for (i = 0; i < topojson.feature(uk, uk.objects.subunits).features.length; i++) {
    leftcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[0][0]);
    bottomcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[0][1]);
    rightcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[1][0]);
    topcorner.push(d3.geo.bounds(topojson.feature(uk, uk.objects.subunits).features[i])[1][1]);
  }

  //get most extreme
  leftc = Math.min.apply(Math,leftcorner);
  bottomc = Math.min.apply(Math,bottomcorner);
  rightc = Math.max.apply(Math,rightcorner);
  topc = Math.max.apply(Math,topcorner);
  
  //center, translate, scale projection
  projection.center([(leftc+rightc)/2, (topc+bottomc)/2]);
  projection.translate([(w+wpadding)/2, (h+hpadding)/2]);
  projection.scale(s);

  //draw path on svg
  svg.append("path")
    .datum(subunits)
    .attr("d", path);

  //draw subunits
  svg.selectAll(".subunit uk")
    .data(topojson.feature(uk, uk.objects.subunits).features)
    .enter().append("path")
    .attr("class", function(d) { return "subunit " + d.id + " uk"; })
    .attr("d", path);

  //draw dots for places (note datum)
  svg.append("path")
    .datum(topojson.feature(uk, uk.objects.places))
    .attr("d", path)
    .attr("class", "place")
    .attr("d",path.pointRadius(1));

  //draw labels
  svg.selectAll(".place-label")
    .data(topojson.feature(uk, uk.objects.places).features)
    .enter().append("text")
    .attr("class", "place-label")
    .attr("transform", function(d) { return "translate(" + projection(d.geometry.coordinates) + ")"; })
    .attr("dy", ".35em")
    .text(function(d) { return d.properties.name; });

  //style labels
  svg.selectAll(".place-label")
    .attr("x", function(d) { return d.geometry.coordinates[0] > -1 ? 6 : -6; })
    .style("text-anchor", function(d) { return d.geometry.coordinates[0] > -1 ? "start" : "end"; });

});