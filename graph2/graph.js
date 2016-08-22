var node_number = 0;
var width = 960,
   	height = 500;
	
var is_directed_array = true;

var	force = d3.layout.force()
    .charge(-3000)
	.linkStrength(0.5)
    .linkDistance(100)
    .size([width, height])
	.links([])	
	.nodes([])
	.start();

var	nodes = force.nodes();
var	links =	force.links();

var svgContainer = d3.select("body")
	.append("svg")
	.attr("width", width)
	.attr("height", height);
	
var getID = function(val) { 
	return document.getElementById(val);
};
		
function redraw() { 
	/* make link part */
	var link;
	
	link = svgContainer.selectAll('g')
	.data(links);
		
	link
	.enter()
	.insert('path', '.node')
	.attr("class", "link")
	.attr("id", function(d) { return d.id ; });
	
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
	.attr("r", 30)
	.call(force.drag)

	nodetext = svgContainer.selectAll(".nodetext")
	.data(nodes);
	
	nodetext
	.enter()
	.insert("text")
	.attr("class", "nodetext")
	.text(function(d) { return d.node_number; });
		
	force
	.on("tick", function() {	
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
			
			node.attr("transform", function(d) { return 'translate(' + [d.x , d.y] + ')' ; })
				.attr("x", function(d) { return d.x })
				.attr("y", function(d) { return d.y});
			
			nodetext.attr("transform", function(d) { return 'translate(' + [d.x, d.y + 5] + ')' ; });
		})
	.start();	
	
}




var makeNode = function(id){
	if(getID("node_"+id) === null) {
		node_number = node_number + 1;
		nodes.push({ id : "node_" + (id), node_number : id});
		redraw();
	}
}

var makeEdge = function(source, target){
	var i;
	var s_node, t_node;
	
	for(i = 0; i < node_number; i++) {
		if(nodes[i].node_number === source) s_node = nodes[i];
		if(nodes[i].node_number === target) t_node = nodes[i];
	}
	
	links.push({ id : "link_" + source + "_" + target, source : s_node, target : t_node, is_directed_array : false });
	
	redraw();
}

var makeDirectEdge = function(source, target){
	var i;
	var s_node, t_node;
	
	for(i = 0; i < node_number; i++) {
		if(nodes[i].node_number === source) s_node = nodes[i];
		if(nodes[i].node_number === target) t_node = nodes[i];
	}
	
	links.push({ id : "link_" + source + "_" + target, source : s_node, target : t_node, is_directed_array : true });
	redraw();
}

var highLightNode = function(id){ 
	var node = getID("node_" + id);
	node.style.fill = "red";
}

var highLightEdge = function(source, target){
	var edge = getID("link_" + source + "_" + target);
	console.log(edge);
	edge.style.stroke = "red";
}

makeNode(1);
makeNode(2);
makeNode(3);
makeNode(4);
highLightNode(4);
makeDirectEdge(1, 2);
makeEdge(2, 3);
makeEdge(3, 4);
highLightEdge(3, 4);
makeNode(1);
makeNode(2);
