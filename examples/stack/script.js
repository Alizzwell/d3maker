var container;
var text;
var rect;
var rectWidth = 40;
var rectHeight = 20;
var padding = 5;

function onBind(scheduler) {
	container = d3.select("#canvas")
		.append("svg")
		.attr("width",1000)
		.attr("height",500)
		.append("g");

	var value = scheduler.getTarget('stack').data;
	var top = scheduler.getTarget('top').data;
		
	drawStack(value, top);
	drawArray(value, top);
}

function onStep(scheduler) {
	// console.log(scheduler.getLine());
}

function onChange(scheduler, info) {
	var value = scheduler.getTarget('stack').data;
	
	if (info['top']) {
		var top = info['top'].data;
		if (top > info['top'].before) {
			push_animation(value, top, function () {
				// TODO: animation end
			});
		}
		else if (top < info['top'].before) {
			pop_animation(value, top, function () {
				// TODO: animation end
			});
		}
	}
	else {
		var top = scheduler.getTarget('top').data;
		drawStack(value, top);
		drawArray(value, top);
	}
}


function push_animation(value, top, done) {
	var duration = 500;
	var newElem = container.append("g");

	newElem.append("rect")
		.attr("x",300)
		.attr("y",100)
		.attr("width",rectWidth)
		.attr("height",rectHeight)
		.attr("fill","#f8bbd0")
		.attr("rx",2)
		.attr("ry",2);

	newElem.append("text")
		.text(value[top - 1])
		.attr("x",315)
		.attr("y",115)
		.attr("fill","black")
		.attr("font-size","12px");
		
	var distance = (300-(rectHeight+padding)*(top - 1))-100;
	newElem.transition()
		.attr("transform","translate(0,"+distance+")")
		.duration(duration)
		.ease(d3.easeElasticOut);

	setTimeout(function(){
		newElem.remove().exit();
		drawStack(value, top);
		drawArray(value, top);
		done();
	}, duration);
}

function pop_animation(value, top, done) {
	drawStack(value, top);
	drawArray(value, top);

	var duration = 500;
	var newElem = container.append("g");
	newElem.append("rect")
		.attr("x",300)
		.attr("y",300-(rectHeight+padding)*(top+1))
		.attr("width",rectWidth)
		.attr("height",rectHeight)
		.attr("fill","#f8bbd0")
		.attr("rx",2)
		.attr("ry",2);

	newElem.append("text")
		.text(value[top])
		.attr("x",315)
		.attr("y",315-(rectHeight+padding)*(top+1))
		.attr("fill","black")
		.attr("font-size","12px");
		
	var distance = -(300-(rectHeight+padding)*top-100);
	newElem.transition()
		.attr("transform","translate(0,"+distance+")")
		.duration(duration)
		.ease(d3.easeCubicOut);
		
	setTimeout(function(){
		newElem.remove().exit();
		done();
	}, duration);
}

function drawArray(value, top) {
	if( text !== undefined ){
		text.remove().exit();
	}

	text = container.selectAll("text.arr")
		.data(value.slice(0, top))
		.enter()
		.append("text")
		.text(function(d){return d;})
		.attr("id", function(d,i){return "Idx" +  i;})
		.attr("x",315)
		.attr("y",function(d,i){return 300-(rectHeight+padding)*i+15;})
		.attr("font-size","12px");

}

function drawStack(value, top) {
	if( rect !== undefined) {
		rect.remove().exit();
	}

	rect = container.selectAll("rect.stack")
		.data(value.slice(0, top))
		.enter()
		.append("rect")
		.attr("id",function(d,i){return "rectIdx"+i;})
		.attr("x",300)
		.attr("y",function(d,i){return 300-(rectHeight+padding)*i;})
		.attr("width",rectWidth)
		.attr("height",rectHeight)
		.attr("fill","#f8bbd0")
		.attr("opacity",1.0)
		.attr("rx",2)
		.attr("ry",2);
}