var vis;
var force;

var link, links;
var node, nodes, node_text;
var selected_nodes = [],
    selected_link = null;

var width = 960,
   	height = 500;

var svg = d3.select("body").append("svg")
	.attr("width", width)
	.attr("height", height);	

var force, gnodes, labels;
var defs; 
var is_directed_array = true;

// rescale g
function rescale() {
  trans = d3.event.translate;
  scale = d3.event.scale;

  vis.attr("transform",
      "translate(" + trans + ")"
      + " scale(" + scale + ")");
}

function redraw() { 

	link = vis.selectAll(".link")
		.data(links);
		

	var edge;
	if(is_directed_array === true){
		edge = link.enter().insert("path", ".node");
	}
	
	else {
		edge = link.enter().insert("line", ".node")
	}
	edge
	.attr("class", "link")
	.attr("id", function(d) { console.log(d.id); return d.id; });	
	
	link
	.classed("link_selected", function(d) { return d === selected_link; });

	gnodes = vis.selectAll('.node')
		 .data(nodes);
	
	node = gnodes.enter()
		 .insert("circle")
		  .attr("class", "node")
		  .attr("id", function(d) { return d.id ; })
		  .attr("r", 30)
		  .call(force.drag);
	gnodes
		.classed("node_selected", function(d) { 
			for (var i = 0; i < selected_nodes.length; i++) {
				if (d === selected_nodes[i]) {
					return true;
				}
			}
			return false; 
		});

	
	labels = vis.selectAll('.nodetext')
		.data(nodes);
	
	nodetext = labels.enter()
		.insert("text")
		.attr("class", "nodetext")
		.text(function(d) { return d.node_number; })
	
	labels
	.classed("nodetext_selected", function(d) { 
			for (var i = 0; i < selected_nodes.length; i++) {
				if (d === selected_nodes[i]) {
					return true;
				}
			}
			return false; 
		});
		
	
	force
		.on("tick", function() {	
			if(is_directed_array === true) {
				link.attr("d", function(d) {
				var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dx = dx * 2, dy = dy * 2,
					dr = Math.sqrt(dx * dx + dy * dy),
					theta = Math.atan2(dy, dx) + Math.PI / 17.85,
					d90 = Math.PI / 2,
					dtxs = d.target.x - 30 * Math.cos(theta),
					dtys = d.target.y - 30 * Math.sin(theta);
				return "M" + d.source.x + "," + d.source.y + "A" + dr + "," + dr + " 0 0 1," + d.target.x + "," + d.target.y + "A" + dr + "," + dr + " 0 0 0," + d.source.x + "," + d.source.y + "M" + dtxs + "," + dtys +  "l" + (3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (-3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "L" + (dtxs - 3.5 * Math.cos(d90 - theta) - 10 * Math.cos(theta)) + "," + (dtys + 3.5 * Math.sin(d90 - theta) - 10 * Math.sin(theta)) + "z";
			  });
			}
			else {
				link.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
			}
			gnodes.attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ; })	;
			labels.attr("transform", function(d) { return 'translate(' + [d.x , d.y+10] + ')' ; })	;
		})
		.start();
	
	link.exit().remove();
	gnodes.exit().remove();
	labels.exit().remove();
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

	vis.append("defs")    // This section adds in the arrows
    .attr("id", "arrow")
	.attr("viewBox", "0 -5 10 10")
    .attr("refX", 15)
    .attr("refY", -1.5)
    .attr("markerWidth", 6)
    .attr("markerHeight", 6)
    .attr("orient", "auto")
	.append("svg:path")
    .attr("d", "M0,-5L10,0L0,5");
	
	force = d3.layout.force()
    .charge(-3000)
	.linkStrength(0.5)
    .linkDistance(100)
    .size([width, height])
	.links([])	
	.nodes([])
	.start();

	nodes = force.nodes();
	links =	force.links();
	redraw();
}

function onStep(scheduler) {
	var v1 = scheduler.getTarget('v1').data;
	var v2 = scheduler.getTarget('v2').data;

	if (v1 && v2) {
		var n1 = nodes[v1 - 1];
		var n2 = nodes[v2 - 1];

		links.forEach(function (link) {
			if ((link.source === n1 && link.target === n2)) {
				selected_link = link;
			}
		});
	}
	redraw();
}

function onChange(scheduler, info) {
	var vertex = scheduler.getTarget('vertex').data;
	var getID = function(val){
		return document.getElementById(val);
	};
	
	if (info['vertex']) {
		for (var i = nodes.length; i < info['vertex'].data; i++) {
			nodes.push({ id : "node_" + (i+1), node_number : i + 1});	
		}	
		
		for (var i = nodes.length; i > info['vertex'].data; i--) {
			nodes.pop();
		}	
	}
	
	if (info['map']) {
		var _links = [];
		var i, j;
		for (i = 1; i <= vertex; i++) {
			for (j = 1; j <= vertex; j++) {
				if (getID("link_" + i + "_" + j) === null && info['map'].data[i][j]) {
					links.push({ id : "link_" + i + "_" + j,  source: nodes[i - 1], target: nodes[j - 1] });
				}
			}
		}
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