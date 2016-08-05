Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


angular.module('algorithms.view', 
  ['ui.bootstrap', 'ngAnimate', 'ui.codemirror'])

.controller('ViewCtrl', function($scope, $http) {

  $scope.data = {};
  $scope.page = "input";

  $scope.inputEdit = undefined;
  $scope.outputEdit = undefined;
  $scope.mode = 'text/x-csrc';
  $scope.breakp = [];

  var scheduler = new this_play.Scheduler();

  scheduler.on('step', function () {
    markLine(scheduler.getLine() - 1);
    onStep(scheduler);
  });

  scheduler.on('change', function (info) {
    onChange(scheduler, info);
  });

  scheduler.on('end', function () {
    onFinish(scheduler);
  });

  function readFile (path) {
    var fso = new ActiveXObject('Scripting.FileSystemObject');
    var iStream = fso.OpenTextFile(path, 1, false);
    var data = "";
    while(!iStream.AtEndOfStream) {
      data += iStream.ReadLine() + "\n";
    }   
    iStream.Close();
    return data;
  }

  function initInputEdit() {
    $scope.inputEdit = CodeMirror.fromTextArea(document.getElementById("inputEdit"), {
      indentWithTabs: true,
      mode: $scope.mode,
      styleActiveLine: true,
      autoCloseBrackets: true,
      lineNumbers: true,
      lineWrapping: true,
      gutters: ["CodeMirror-linenumbers", "breakpoints"]
    });

    $scope.inputEdit.on("gutterClick", function(cm, n) {
      var info = cm.lineInfo(n);
      
      if (!info) {
        return;
      }

      if (info.gutterMarkers) {
        cm.setGutterMarker(n, "breakpoints", null);  
        var pos = $scope.breakp.indexOf(n + 1);
        $scope.breakp.remove(pos, pos);
      }
      else {
        var marker = document.createElement("div");
        marker.style.color = "#933";
        marker.innerHTML = "●";
        cm.setGutterMarker(n, "breakpoints", marker);  
        $scope.breakp.push(n + 1);
      }
    });

    $scope.data.inputData = readFile(window.location.pathname.replace("index.html", "").substring(1) + "test/input.txt").trim();
    $scope.data.targets = readFile(window.location.pathname.replace("index.html", "").substring(1) + "test/targets.txt").trim();
    $scope.inputEdit.setValue(
    	readFile(window.location.pathname.replace("index.html", "").substring(1) + "test/source.txt").trim()
    )
  }

  function initOutputEdit() {
    $scope.outputEdit = CodeMirror.fromTextArea(document.getElementById("outputEdit"), {
      indentWithTabs: true,
      mode: $scope.mode,
      lineNumbers: true,
      lineWrapping: true,
      styleSelectedText: true,
      readOnly: true,
      gutters: ["CodeMirror-linenumbers", "breakpoints"]
    });

    $scope.outputEdit.on("gutterClick", function(cm, n) {
      var info = cm.lineInfo(n);
      
      if (!info) {
        return;
      }

      if (info.gutterMarkers) {
        cm.setGutterMarker(n, "breakpoints", null);  
        var pos = $scope.breakp.indexOf(n + 1);
        $scope.breakp.remove(pos, pos);
      }
      else {
        var marker = document.createElement("div");
        marker.style.color = "#933";
        marker.innerHTML = "●";
        cm.setGutterMarker(n, "breakpoints", marker);  
        $scope.breakp.push(n + 1);
      }
    });
    
    $scope.outputEdit.setValue($scope.data.code);
    markLine(scheduler.getLine() - 1);

    $scope.breakp.forEach(function (bp) {
      var marker = document.createElement("div");
      marker.style.color = "#933";
      marker.innerHTML = "●";
      $scope.outputEdit.setGutterMarker(bp - 1, "breakpoints", marker);
    });
  }

  function initCanvas() {
    onBind(scheduler);
  }
  
  function btnUploadClk() {
    $scope.data.code = $scope.inputEdit.getValue();

    var dataObject = {
      "targets": $scope.data.targets.split(' '),
      "input": $scope.data.inputData,
      "code": $scope.data.code
      // "bps": $scope.breakp 
    };

    $http({
      method: 'POST',
      url: 'http://10.241.22.66:3000/api/execute',
      data: dataObject,
      headers: {'Content-Type': 'application/json; charset=utf-8'}
    })
    .success(function(data, status) {
      if (status == 201) {
        $scope.page = "view";
        $scope.data.code = data.code;
        scheduler.bind(data.data);
        scheduler.breaks = $scope.breakp;
      }
      else {
        alert('error!! (' + status + ')')
      }
    })
    .error(function(data, status) {
    	console.log("error!!");
    	console.log(data);
    	console.log(status);
      // TODO: error handler
    });
  }

  function btnStepClk() {
    scheduler.step();
  }

  function btnNextClk() {
    scheduler.next();
  }

  var markText;
  function markLine(n) {
    if (markText) markText.clear();
    markText = $scope.outputEdit.markText({line: n, ch: 0}, {line: n}, {className: "styled-background"});
  }


  $scope.btnUploadClk = btnUploadClk;
  $scope.initInputEdit = initInputEdit;
  $scope.initOutputEdit = initOutputEdit;
  $scope.initCanvas = initCanvas;
  $scope.btnStepClk = btnStepClk;
  $scope.btnNextClk = btnNextClk;

});