var vis;
var force;

var link, links;
var node, nodes;
var selected_nodes = [],
    selected_link = null;

var width = 960,
   	height = 500;

function tick() {
  link.attr("x1", function(d) { return d.source.x; })
      .attr("y1", function(d) { return d.source.y; })
      .attr("x2", function(d) { return d.target.x; })
      .attr("y2", function(d) { return d.target.y; });

  node.attr("cx", function(d) { return d.x; })
  	  .attr("cy", function(d) { return d.y; });
}

// rescale g
function rescale() {
  trans = d3.event.translate;
  scale = d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

// redraw force layout
function redraw() {
  link = link.data(links);

  link.enter().insert("line", ".node")
      .attr("class", "link");

  link.exit().remove();

  link
    .classed("link_selected", function(d) { return d === selected_link; });

  node = node.data(nodes);

  node.enter().insert("circle")
      .attr("class", "node")
      .attr("r", 5)
      .transition()
      .duration(750)
      .ease("elastic")
      .attr("r", 6.5);

  node.exit().transition()
      .attr("r", 0)
      .remove();

  node
    .classed("node_selected", function(d) { 
    	for (var i = 0; i < selected_nodes.length; i++) {
    		if (d === selected_nodes[i]) {
    			return true;
    		}
    	}
    	return false; 
    });

  force.start();
}

function onBind(scheduler) {
	// init svg
	var outer = d3.select("#canvas")
	  	.append("svg:svg")
	  	.attr("width", width)
	  	.attr("height", height)
	  	.attr("pointer-events", "all");

	vis = outer
		.append('svg:g')
		.call(d3.behavior.zoom().on("zoom", rescale))
		.on("dblclick.zoom", null)
		.append('svg:g');

	vis.append('svg:rect')
		.attr('width', width)
		.attr('height', height)
		.attr('fill', 'white');

	// init force layout
	force = d3.layout.force()
	    .size([width, height])
	    .nodes([]) // initialize with a single node
	    .linkDistance(50)
	    .charge(-200)
	    .on("tick", tick);

	// get layout properties
	nodes = force.nodes();
	links = force.links();
	node = vis.selectAll(".node");
	link = vis.selectAll(".link");

	redraw();
}

function onStep(scheduler) {
	var v1 = scheduler.getTarget('v1').data;
	var v2 = scheduler.getTarget('v2').data;

	if (v1 && v2) {
		var n1 = nodes[v1 - 1];
		var n2 = nodes[v2 - 1];

		links.forEach(function (link) {
			if ((link.source === n1 && link.target === n2) || 
				(link.source === n2 && link.target === n1)) {
				selected_link = link;
			}
		});
	}
	redraw();
}

function onChange(scheduler, info) {
	var vertex = scheduler.getTarget('vertex').data;

	if (info['vertex']) {
		for (var i = nodes.length; i < info['vertex'].data; i++) {
			nodes.push({});	
		}	

		for (var i = nodes.length; i > info['vertex'].data; i--) {
			nodes.pop();
		}	
	}

	if (info['map']) {
		var _links = [];
		for (var i = 1; i <= vertex - 1; i++) {
			for (var j = i + 1; j <= vertex; j++) {
				if (info['map'].data[i][j]) {
					_links.push({ source: nodes[i - 1], target: nodes[j - 1] });
				}
			}
		}

		while (links.length > 0) {
			links.pop();
		}

		_links.forEach(function (item) {
			links.push(item);
		});
	}

	if (info['visit']) {
		selected_nodes = [];
		for (var i in info['visit'].data) {
			if (info['visit'].data[i]) {
				selected_nodes.push(nodes[i - 1]);
			}
		}
	}

	redraw();
}

function onFinish(scheduler) {
	selected_nodes = [];
	selected_link = null;
	redraw();
}