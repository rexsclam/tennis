
var dataset = { nodes: [], edges:[], alledges: []};
var $chart = $('#chart');
var w = $chart.width();
var h = $chart.height();
hpadding = h/10;
wpadding = w/10;
padding = 10;
radius = 50;

var title = $('#chart-title').text();

$('#chart-title').hover(function() {
	$(this).text("Data from wtatennis.com");
}, function() { $(this).text(title);
});

var svg = d3.select("#chart")
    .append("svg")
    .attr("width","100%")
    .attr("height","100%")
    .attr('viewBox','0 0 '+ Math.max(w+wpadding,h+hpadding)+' '+Math.min(w+wpadding,h+hpadding))
    .attr('preserveAspectRatio','xMinYMin')
    .append("g")
    .attr("transform", "translate(" + wpadding/2 + "," + hpadding/2 + ")");

d3.csv("data/wtah2hfinal.csv", function(error, data) {
	data.forEach(function(d) {
		//check for blank because head to head list is longer
		if (d.name != "")
			dataset.nodes.push({id: parseInt(d.id), fullname: d.fullname, name: d.name, williams: parseInt(d.williams), sharapova: parseInt(d.sharapova), kvitova: parseInt(d.kvitova), halep: parseInt(d.halep), bouchard: parseInt(d.bouchard), radwanska: parseInt(d.radwanska), ivanovic: parseInt(d.ivanovic), wozniacki: parseInt(d.wozniacki)});
		//get all possible edges (each visualization will have a subset)
		dataset.alledges.push({edgeid: parseInt(d.edgeid), source: parseInt(d.source), target: parseInt(d.target), home: parseInt(d.home), away: parseInt(d.away)});
	})

	//default to williams
	var startplayer = "williams";
	var startrank;
	//get startrank based on startplayer
	for (i=0;i<dataset.nodes.length;i++) {
		if (dataset.nodes[i].name == startplayer)
			startrank = parseInt(dataset.nodes[i].id)
	}

	//draw chart based on player chosen
	drawchart(startplayer,startrank);

	//when another player is clicked, change active player and update chart based on new active player
	$(".button-player").on("click", function() {
		$(".button-player").removeClass("active");
		$(this).addClass("active");
		var activeplayer = this.id;
		var activerank = $(this).attr('value');

		updatechart(activeplayer,activerank);
	});

});

//helper for data join
var key = function(d) {
	return d.id;
}

//helper for data join
var edgekey = function(d) {
	return d.edgeid;
}

function updatechart(player, rank) {

	//remove everything in chart
	$('.gnode').remove();
	$('.label').remove();
	$('.node').remove();

	//get new edges based on rank of new player, more conditions because a previously used edge gets changed by d3
	dataset.edges = [];

	for (i=0; i < dataset.alledges.length; i++) {
		if (dataset.alledges[i].source == rank || dataset.alledges[i].target == rank || dataset.alledges[i].source.id == rank || dataset.alledges[i].target.id == rank)
			dataset.edges.push(dataset.alledges[i]);
	}

	//hover text using outside script
    var tip = d3.tip().html(function(d) { return d.fullname });

    svg.call(tip);

    //get list of colors
    var colors = d3.scale.category20();

    //initiate forced layout with subset of edges
	var force = d3.layout.force()
    	.nodes(dataset.nodes)
    	.links(dataset.edges)
		.charge([-1000])
		.alpha(0.1)
		.gravity(0.15)
		.linkDistance(function(d) { return 50+ 30* (Math.abs(d.home-d.away))})
		.size([w, h])
		.start();

	//define edges, keeping track of key
	var edges = svg.selectAll("line")
        .data(dataset.edges, edgekey);

    //new edges
    edges    
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 0);

    //old edges
    edges.exit().remove();

    //define group nodes, keeping track of key
    var gnodes = svg.selectAll('g.gnode')
    	.data(dataset.nodes, key);

    //new group nodes
    gnodes
    	.enter()
    	.append('g')
    	.classed('gnode',true)
    	//on hover, change active player from average to specific H2H
    	.on('mouseover', function(d) { if(d.id != rank) {$('.label.'+rank).text(dataset.nodes[rank][d['name']]); document.getElementsByClassName('node '+rank)[0].setAttribute("r", 10*(dataset.nodes[rank][d['name']]+2)  );} })
       	.on('mouseout', function(d) {$('.label.'+rank).text(average); document.getElementsByClassName('node '+rank)[0].setAttribute("r", 10*(dataset.nodes[rank][player]+2)  ); tip.hide(d); });

    //define labels
    var labels = gnodes.append("text")
		.attr("text-anchor","middle")
		.attr("class", function(d) {return "label "+d.id})
		.attr("fill","none")
		.text(function(d) { return d[player]; });

	//manually add "Avg" to active player
	$('.label.'+rank).text("Avg. " + $('.label.'+rank).text());

	//define nodes
    var nodes = gnodes.append("circle")
    	.attr("class", function(d) {return "node "+d.id})
    	//radius based on record
    	.attr("r", function(d) { return 10*(d[player]+2)})
        .style("fill", function(d) {
        	if (d.name == player) {
        		return "#3A8F62";
        	} else {
        		return "#c38080";
        	}
        })
        //active player has border
        .attr("stroke", function(d) {
        	if (d.name == player) {return "#0a5c2f"};
        })
        .attr("stroke-width", 3)
        .attr("fill-opacity", 0.5)
        //link to force
        .call(force.drag)
        .on('mouseover', function(d) { tip.show(d);})
       	.on('mouseout', function(d) { });

    //reset active player
	var average = $('.label.'+rank).text();

	//define positions
    force.on("tick", function() {
		edges.attr("x1", function(d) { return d.source.x; })
		     .attr("y1", function(d) { return d.source.y; })
		     .attr("x2", function(d) { return d.target.x; })
		     .attr("y2", function(d) { return d.target.y; });

		gnodes
			.each(collide(.5))
			.attr("transform", function(d) { 
	        return 'translate(' + [d.x, d.y] + ')'; 
    	});

	});

    //outside script for collision
	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(gnodes);
	  return function(d) {
	    var rb = 2*radius + padding,
	        nx1 = d.x - rb,
	        nx2 = d.x + rb,
	        ny1 = d.y - rb,
	        ny2 = d.y + rb;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y);
	          if (l < rb) {
	          l = (l - rb) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}

}

//called only once at the beginning
function drawchart(player, rank) {

	//should not be necessary, but just in case
	$(".button-player").removeClass("active");
    $("#"+player).addClass("active");

	for (i=0; i < dataset.alledges.length; i++) {
		if (dataset.alledges[i].source == rank || dataset.alledges[i].target == rank)
			dataset.edges.push(dataset.alledges[i]);
	}

    var tip = d3.tip().html(function(d) { return d.fullname });

    svg.call(tip);

    var colors = d3.scale.category20();

    var force = d3.layout.force()
    	.nodes(dataset.nodes)
    	.links(dataset.edges)
		.charge([-1000])
		.alpha(0.1)
		.gravity(0.15)
		.linkDistance(function(d) { return 50+ 30* (Math.abs(d.home-d.away))})
		.size([w, h])
		.start();

    var edges = svg.selectAll("line")
        .data(dataset.edges, edgekey)
        .enter()
        .append("line")
        .style("stroke", "#ccc")
        .style("stroke-width", 0);

    var gnodes = svg.selectAll('g.gnode')
    	.data(dataset.nodes, key)
    	.enter()
    	.append('g')
    	.classed('gnode',true)
    	.on('mouseover', function(d) { if(d.id != rank) {$('.label.'+rank).text(dataset.nodes[rank][d['name']]); document.getElementsByClassName('node '+rank)[0].setAttribute("r", 10*(dataset.nodes[rank][d['name']]+2)  );} })
       	.on('mouseout', function(d) { $('.label.'+rank).text(average); document.getElementsByClassName('node '+rank)[0].setAttribute("r", 10*(dataset.nodes[rank][player]+2)  ); tip.hide(d); });

    //use text() instead of html() or innerHTML
    
    var labels = gnodes.append("text")
		.attr("text-anchor","middle")
		.attr("class", function(d) {return "label "+d.id})
		.attr("fill","none")
		.text(function(d) { return d[player]; });

	$('.label.'+rank).text("Avg. " + $('.label.'+rank).text());

    var nodes = gnodes.append("circle")
    	.attr("class", function(d) {return "node "+d.id})
    	.attr("r", function(d) { return 10*(d[player]+2)})
        .style("fill", function(d) {
        	if (d.name == player) {
        		return "#3A8F62";
        	} else {
        		return "#c38080";
        	}
        })
        //active player has border
        .attr("stroke", function(d) {
        	if (d.name == player) {return "#0a5c2f"};
        })
        .attr("stroke-width", 3)
        .attr("fill-opacity", 0.5)
        .call(force.drag)
        .on('mouseover', function(d) { tip.show(d);})
       	.on('mouseout', function(d) { });

	var average = $(".label."+rank).text();

    force.on("tick", function() {
		edges.attr("x1", function(d) { return d.source.x; })
		     .attr("y1", function(d) { return d.source.y; })
		     .attr("x2", function(d) { return d.target.x; })
		     .attr("y2", function(d) { return d.target.y; });

		gnodes
			.each(collide(.5))
			.attr("transform", function(d) { 
	        return 'translate(' + [d.x, d.y] + ')'; 
    	});

	});

	function collide(alpha) {
	  var quadtree = d3.geom.quadtree(gnodes);
	  return function(d) {
	    var rb = 2*radius + padding,
	        nx1 = d.x - rb,
	        nx2 = d.x + rb,
	        ny1 = d.y - rb,
	        ny2 = d.y + rb;
	    quadtree.visit(function(quad, x1, y1, x2, y2) {
	      if (quad.point && (quad.point !== d)) {
	        var x = d.x - quad.point.x,
	            y = d.y - quad.point.y,
	            l = Math.sqrt(x * x + y * y);
	          if (l < rb) {
	          l = (l - rb) / l * alpha;
	          d.x -= x *= l;
	          d.y -= y *= l;
	          quad.point.x += x;
	          quad.point.y += y;
	        }
	      }
	      return x1 > nx2 || x2 < nx1 || y1 > ny2 || y2 < ny1;
	    });
	  };
	}
}

