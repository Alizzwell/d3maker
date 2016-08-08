var container;
 var text;
 var rect;
 var rectWidth = 40;
 var rectHeight = 40;
 var padding = 10;
 var top;

 function onBind(scheduler){
   container = d3.select("body")
     .append("svg")
     .attr("width",1000)
     .attr("height",500)
     .append("g");
 }

 function onStep(scheduler){

 }

 function onChange(scheduler, info){
   var value = scheduler.getTarget('arr').data;

   var mid = scheduler.getTarget('m').data;
   var low = scheduler.getTarget('l').data;
   var high = scheduler.getTarget('h').data;

   if(info['m']){
      if (mid == -1) {
        top = high + 1;
        drawArray(value,low,high);
        return;
      }
      highlight_mid(value,mid,function(){
        unhighlight_mid(value,mid,function(){
          highlight_mid(value,mid,function(){
            unhighlight_mid(value,mid,function(){
            });            
          });   
        });
      });
   }
   
   if(info['l']){
       translate_low_animation(value,low,mid,function(){
          drawArray(value,low,high);
       });
   }
   if(info['h']){
       translate_high_animation(value,mid,high,function(){
          drawArray(value,low,high);
       });
   }  
}

function translate_low_animation(value, low, mid, done){
  var duration = (mid-low)*100;

  for(var i = low; i < mid; i++){
      d3.select("#rectIdx"+i)
      .transition()
      .attr("fill","#DCC7AA")
      .attr("opacity",0.5)
      .delay((i-low)*50)
      .duration(duration);
  }

  setTimeout(function () {
    done(); 
  },duration);
}

function translate_high_animation(value, mid, high, done){
  var duration = (high-mid)*100;
    
  for(var i = high; i >= mid + 1; i--){
      d3.select("#rectIdx"+i)
      .transition()
      .attr("fill","#DCC7AA")
      .attr("opacity",0.5)
      .delay((high-i)*50)
      .duration(duration);
  }
    
  setTimeout(function(){
    done(); 
  },duration);
}

function highlight_mid(value, mid, done){

  var arrow = container.append("g");
  var duration = 200;

  arrow.append("svg:path")
  .attr("d","M0,10L5,4L10,10")
  .attr("fill","#6B7A8F");
    
  
  arrow.append("text")
  .text("mid")
  .attr("x",function(){return -rectWidth/5;})
  .attr("y",30)
  .attr("fill","#6B7A8F");

    
  arrow.attr("transform","translate("+ (100+(padding+rectWidth)*mid + rectWidth/3)+","+(rectHeight+100)+")");
    
  d3.select("#rectIdx"+mid)
    .transition()
    .attr("fill","#F7882F");

  setTimeout(function(){
    arrow.remove().exit();
    done();
  },duration);
}

function unhighlight_mid(value, mid, done){

    var arrow = container.append("g");
    var duration = 200;

    arrow.append("svg:path")
    .attr("d","M0,10L5,4L10,10")
    .attr("fill","#6B7A8F");
    
  
    arrow.append("text")
    .text("mid")
    .attr("x",function(){return -rectWidth/5;})
    .attr("y",30)
    .attr("fill","#6B7A8F");

    
    arrow.attr("transform","translate("+ (100+(padding+rectWidth)*mid + rectWidth/3)+","+(rectHeight+100)+")");
    
    d3.select("#rectIdx"+mid)
      .transition()
      .attr("fill","#F7C331");

    setTimeout(function(){
      arrow.remove().exit();
      done();
    },duration);

    
  }

  function drawArray(value, low, high){
    if( text !== undefined ){
      text.remove().exit();
      rect.remove().exit();
    }

    
    rect = container
        .selectAll("g.queue.rect")
        .data(value.slice(0, top))
        .enter().append("rect")
        .attr("id",function(d, i){ return "rectIdx"+ i ; }  )
        .attr("x",function(d,i){return 100+(padding+rectWidth)*i;})
        .attr("y",100)
        .attr("fill",function(d,i){
          if( i >= low && i <= high)
            return "#F7C331";
          else return "#DCC7AA";
        })
        .attr("width",rectWidth)
        .attr("height",rectHeight)
        .attr("rx",2)
        .attr("ry",2)
        .attr("opacity",function(d,i){
          if( i >= low && i <= high)
            return 1.0;
          else return 0.5;
        })
        


    text = container
        .selectAll("g.queue.text")
        .data(value.slice(0, top))
        .enter().append("text")
        .attr("id",function(d, i){ return "textIdx"+ i ; }  )
        .text(function(d){return d;})
        .attr("x",function(d,i){return 100+(padding+rectWidth)*i+rectWidth/4;})
        .attr("y",100+rectHeight/3*2)
        .attr("fill","black")
        .attr("font-size", "12px");
        
}