var x, y;
var svg;
var width;
var height;
var duration = 500;

function onBind(scheduler) {
	var margin = {top: 40, right: 20, bottom: 30, left: 40};
							
	width = 800 - margin.left - margin.right,
	height = 500 - margin.top - margin.bottom;

	x = d3.scale
		.ordinal()
		.rangeRoundBands([0, width], .1);
	y = d3.scale
		.linear()
		.range([height, 0]);
								
	var xAxis = d3.svg.axis()
		.scale(x)
		.orient("bottom");

	var tip = d3.tip()
		.attr('class', 'd3-tip')
		.offset([-12, 0])
		.html(function(d) {
			return "<span style='color:red'>" + d + "</span>";
		});

	svg = d3.select("#canvas").append("svg")
		.attr("width", width + margin.left + margin.right)
		.attr("height", height + margin.top + margin.bottom)
		.append("g")
		.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

	svg.call(tip);

	var data;
	var i = 1;
	var indexes;
	var arr;
	var intervalId;
	var active = true;

	var arr = scheduler.getTarget('A').data;

	indexes = [];
	for (var i = 0; i < arr.length; i++) {
		indexes.push(i);
	}
								    
	x.domain(indexes);
	y.domain([0, d3.max(arr)]);
							    
	svg.append("g")
		.attr("class", "x axis")
		.attr("transform", "translate(0," + height + ")")
		.call(xAxis);
								    
	svg.selectAll(".bar")
		.data(arr)
		.enter().append("rect")
		.attr("class", "bar")
		.attr("x", function(d, i) { return x(i); })
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d); })
		.attr("height", function(d) { return height - y(d); })
		.on('mouseover', tip.show)
		.on('mouseout', tip.hide);
								    
	svg.select(".x.axis")
		.selectAll("text")
		.style("font-size", "10px");
}

function onStep(scheduler) {
	console.log(scheduler.getLine());
	// update(scheduler.getTarget('A').data);
}

function onChange(scheduler, info) {
	console.log(scheduler.getTargets());
	if (info['s1'] || info['s2']) {
		swap(scheduler.getTarget('A').data, 
			scheduler.getTarget('s1').data, 
			scheduler.getTarget('s2').data);
	}
	else if (info['A']) {
		update(info['A'].data);
	}
}

function onFinish() {
	svg.selectAll(".bar")
		.style("fill", function(d, idx) {
			return "orange";
		});
}

function update(arr) {
	y.domain([0, d3.max(arr)]);
							    
	svg.selectAll(".bar")
		.data(arr)
		.transition()
		.duration(duration)
		.attr("width", x.rangeBand())
		.attr("y", function(d) { return y(d); })
		.attr("height", function(d) { return height - y(d); });
}

function swap(arr, i, j) {
	svg.selectAll(".bar")
		.data(arr)
		.style("fill", function(d, idx) {
			if (idx == i || idx == j)
				return "orchid";
		})
		.transition()
		.duration(duration)
		.attr("x", function(d, idx) { 
			if (idx == i)
				return x(j);
			else if (idx == j)
				return x(i);
			else
				return x(idx);
		})
		.each("end", function(d, idx) {
				svg.selectAll(".bar")
					.attr("x", function(d, idx) { return x(idx); })
					.attr("y", function(d) { return y(d); })
			        .attr("height", function(d) { return height - y(d); });
		});
}