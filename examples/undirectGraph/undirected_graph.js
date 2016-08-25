var node_number = 0;
var link_number = 0;

var width = 960,
   	height = 500;

var radius = 30;

var is_directed_array = true;

var	force = d3.layout.force()
    .charge(-3000)
	.linkStrength(0.5)
    .linkDistance(100)
    .size([width, height])
	.links([])	
	.nodes([])
	.start();

	
var nodes = [];
var links = [];
//var	nodes = force.nodes();
//var	links =	force.links();

var svgContainer = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);

var infoContainer = d3.select("body")
	.append("svg")
	.attr("class", "info")
	.attr("width", width)
	.attr("height", 100);
	
var getID = function(val) { 
	return document.getElementById(val);
};
		
function redraw() { 
	/* make link part */
	var link;
	var linktext;
	
	link = svgContainer.selectAll('path')
	.data(links);
		
	link
	.enter()
	.insert('path', '.node')
	.attr("class", "link")
	.attr("id", function(d) { return d.id ; });
	
	linktext = svgContainer.selectAll(".linktext")
	.data(links);
	
	linktext
	.enter()
	.insert("text")
	.attr("class", "linktext")
	.text(function(d) {
		if(d.link_value != null) { return d.link_value; }
		else return 0;
	});

//		directed_link.enter().insert('path', '.node').attr("class", "link");

	/* make node part */
	var node;
	var nodetext;
	node = svgContainer.selectAll(".node")
	.data(nodes);
	
	node
	.enter()
	.insert("circle")
	.attr("class", "node")
	.attr("id", function(d) {return d.id;})
	.attr("r", radius)
	.call(force.drag)

			
	nodetext = svgContainer.selectAll(".nodetext")
	.data(nodes);
	
	nodetext
	.enter()
	.insert("text")
	.attr("class", "nodetext")
	.text(function(d) { return d.node_number; });
		
	force
	.nodes(nodes)
	.links(links)
	.on("tick", function() {	
			link.attr("d", function(d) {
				var dx = d.target.x - d.source.x,
					dy = d.target.y - d.source.y,
					dx = dx * 3, dy = dy * 3,
					dr = Math.sqrt(dx * dx + dy * dy),
					theta = Math.atan2(dy, dx) + Math.PI / 26.55,
					d90 = Math.PI / 2,
					dtxs = d.target.x - 1.22 * radius * Math.cos(theta),
					dtys = d.target.y - 1.22 * radius * Math.sin(theta);
					var val1 = 3.5, val2 = 10.5;
					return "M" + d.source.x + "," + d.source.y + "L" + d.target.x + "," + d.target.y;
				});
			linktext.attr("transform", function(d){ 
				var dx = d.target.x - d.source.x,
				dy = d.target.y - d.source.y,
				dx = dx * 3, dy = dy * 3,
				dr = Math.sqrt(dx * dx + dy * dy),
				theta = Math.atan2(dy, dx) + Math.PI / 15,	
				d90 = Math.PI / 2,
				dtxs = d.target.x - 3 * radius * Math.cos(theta),
				dtys = d.target.y - 3 * radius * Math.sin(theta);
				return 'translate(' + [dtxs, dtys] + ')' ; 
			});
			node.attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ; })
				.attr("x", function(d) { return d.x })
				.attr("y", function(d) { return d.y});
			
			nodetext.attr("transform", function(d) { return 'translate(' + [d.x, d.y + 10] + ')' ; });
		})
	.start();	
	
	link.exit().remove();
	linktext.exit().remove();
	node.exit().remove();
	nodetext.exit().remove();
}




var makeNode = function(id){
	if(getID("node_"+id) === null) {
		node_number = node_number + 1;
		nodes.push({ id : "node_" + (id), node_number : id});
		redraw();
	}
}

var makeEdge = function(source, target, value){
	var i;
	var s_node, t_node;
	
	if(source > target) {
		var t = source;
		source = target;
		target = t;
	}
	
	for(i = 0; i < node_number; i++) {
		if(nodes[i].node_number === source) s_node = nodes[i];
		if(nodes[i].node_number === target) t_node = nodes[i];
	}
	
	
	var edge = getID("link_" + source + "_" + target);
	if(edge === null){
		links.push({ id : "link_" + source + "_" + target, source : s_node, target : t_node, link_value : value, is_directed_array : false });
		link_number++;
		redraw();
	}
	else{
		for(i=0;i<link_number;i++){
			if(links[i].source.node_number === source && links[i].target.node_number === target){
				links[i].link_value = value;
				var _links = links;
				links = [];
				redraw();
				links = _links;
				redraw();
			}
		}
	}
}

/* 
removeNode Function
Description : remove "id" node, and remove adjecent edge near "id" node
*/

var removeNode = function(id){
	var i ;
	
	for(i = 0; i < node_number; i++){
		if(nodes[i].node_number === id){
			nodes.splice(i, 1);
			break;
		}
	}
	for(i=0;i<link_number; i++){
		if(links[i].source.node_number === id) { links.splice(i, 1); i--; link_number--; }
		else if(links[i].target.node_number === id) { links.splice(i, 1); i--; link_number--; } 
	}

	var _nodes = nodes;
	var _links = links;
	
	nodes = [];
	links = [];
	redraw();

	nodes = _nodes;
	links = _links;
	redraw();
	node_number--;
	

}

var removeEdge = function(source, target){
	var i;
	
	if(source > target) {
		var t = source;
		source = target;
		target = t;
	}
	
	for (i = 0; i < link_number; i++){
		if(links[i].id === "link_" + source + "_" + target){
			links.splice(i, 1);
			break;
		}
	}

	var _links = links;
	links = [];
	redraw();
	
	links = _links;
	redraw();
	link_number--;
}



var highLightNode = function(id){ 
	var node = d3.select("#node_" + id);
	if(node != null) { 
		node.transition().duration(500).style("fill", "red");
	}
}

var highLightEdge = function(source, target){

	if(source > target) {
		var t = source;
		source = target;
		target = t;
	}
	
	var edge = d3.select("#link_" + source +"_"+target);
	if(edge != null) { 
		edge.transition().duration(500).style("stroke", "red");
	}
}

var unHighLightNode = function(id) { 
	var node = d3.select("#node_" + id);
	if(node != null) { 
		node.transition().duration(500).style("fill", "black");
	}
}
var unHighLightEdge = function(source, target){
	
	if(source > target) {
		var t = source;
		source = target;
		target = t;
	}
	
	var edge = d3.select("#link_" + source +"_"+target);
	if(edge != null) { 
		edge.transition().duration(500).style("stroke", "#999");
	}
}

var unHighLightAll = function(){
	var i;
	for(i=0;i<node_number;i++){
		unHighLightNode(nodes[i].node_number);
	}

	for(i=0;i<link_number;i++){
		unHighLightEdge(links[i].source.node_number, links[i].target.node_number);
	}
}


makeNode(1);
makeNode(2);
makeNode(3);
makeNode(4);
highLightNode(4);
makeEdge(1, 2, '');
makeEdge(2, 3, 2);
makeEdge(2, 4, 3);
makeEdge(4, 2, 4);
highLightEdge(3, 4);
highLightEdge(2, 4);

