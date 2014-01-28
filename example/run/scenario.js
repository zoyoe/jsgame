/* The glue file to configure different instances */

var scenario1 = (function createInstance(){
   var cm1 = [3,"m1",{vt:2,vl:0}];
   var cm2 = [4,"mc2",{vt:0,vl:2}];
   var cm3 = [4,"mc3",{vt:0,vl:2}];
   var cmain = [2,"main"];
   var dog = [5,"dog",{vt:0,vl:2}];
   var bone = [6,"bone",{}];
   var cells = 
   [
    [1,1,  bone  ,0,1,0,    0,dog,1],
    [0,0,  0  ,1,0,cm2,  0,0,1],
    [1,0,  1  ,0,0,1,    1,1,0],
    [0,cm1,cm3,0,1,cmain,0,0,0],
    [0,0,  1,  0,0,0,    0,1,1],
    [1,1,  0,  0,0,0,    0,0,1],
   ]
   var path = 
   [
    [1,1,0,0,1,0,0,0,1],
    [0,0,0,1,0,1,0,0,1],
    [1,0,1,0,0,1,1,1,0],
    [0,0,1,0,1,0,0,0,0],
    [0,0,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,1],
   ];
   return (new labescape.game.instance(cells,path));
})();

var scenario2 = (function createInstance(){
   var cm1 = [3,"m1",{vt:2,vl:0}];
   var cm2 = [4,"mc2",{vt:0,vl:2}];
   var cm3 = [4,"mc3",{vt:0,vl:2}];
   var cmain = [2,"main"];
   var cells = 
   [
    [1,1,  0  ,0,1,0,    0,0,1],
    [0,0,  0  ,1,0,cm2,  0,0,1],
    [1,0,  1  ,0,0,1,    1,1,0],
    [0,cm1,cm3,0,1,cmain,0,0,0],
    [0,0,  1,  0,0,0,    0,1,1],
    [1,1,  0,  0,0,0,    0,0,1],
   ]
   var path = 
   [
    [1,1,0,0,1,0,0,0,1],
    [0,0,0,1,0,1,0,0,1],
    [1,0,1,0,0,1,1,1,0],
    [0,0,1,0,1,0,0,0,0],
    [0,0,1,0,0,0,0,1,1],
    [1,1,0,0,0,0,0,0,1],
   ];
   return (new labescape.game.instance(cells,path));
})();

var scenarios = {basic:[scenario1,scenario2]}

function getScenario(set,idx){
  return scenarios[set][idx]
}

$.fn.extend({ 
        disableSelection : function() { 
                this.each(function() { 
                        this.onselectstart = function() { return false; }; 
                        this.unselectable = "on"; 
                        $(this).css('-moz-user-select', 'none'); 
                        $(this).css('-webkit-user-select', 'none'); 
                }); 
        } 
});

function buildInfo(inst){
  $("#panel .bomb .number").html(inst.bombs.length);
}

/* This is a really tricky function.

   Cause it will detects whether we use touch or click to play the game

*/
function bindTargetHandler(element,handler){
  if(typeof window.orientation !== 'undefined'){
    element.addEventListener("touchstart",handler,false);
  }else{
    element.addEventListener("click",handler,false)
  }
}

var currentScenario = null;

function getUrlVars()
{
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for(var i = 0; i < hashes.length; i++)
    {
        hash = hashes[i].split('=');
        vars.push(hash[0]);
        vars[hash[0]] = hash[1];
    }
    return vars;
}

function resetScenario(){
   /* we simply reset the location at the moment,
      but it is not decent at all */
   window.location.reload();
}

function pauseScenario(){
  currentScenario.pause();
}

function continueScenario(){
  currentScenario.run();
}

function loadScenario(){
    var singleton = {};
    var sc = getUrlVars();
    singleton.inst = getScenario(sc.set,sc.idx);
    var jq_root = $('#root');
	currentScenario = new zoyoe.game.env($('#root').get(0),30,40,0,singleton.inst);
    bindTargetHandler($("#root").get(0),function(e){
        var touch = e;
        if(e.type == "touchstart"){
          touch = e.touches[0];
        }
        e.stopPropagation();
        e.cancelBubble = true;
        e.preventDefault();
        var p = jq_root.offset();
        currentScenario.onMouseClick(touch.pageY - p.top,touch.pageX - p.top);
    });
    $("body").get(0).ontouchmove = function(e){
      e.preventDefault();
    }
    $("#panel .bombtouch").click(function(e){
      singleton.inst.plantBomb();
    });
    $("#panel .replay").click(function(e){
      resetScenario();
    });
    var root = currentScenario.root();
    var clip = new zoyoe.game.clip('move',$("<div></div>").get(0));
    singleton.inst.initialize(clip);
    root.insertClip(clip);
    root.trackClip(root.getFrame(0),clip);
    buildInfo(singleton.inst);
    currentScenario.run();
}

function dialogConfirm(message,cb){
  vex.dialog.confirm({
    message: message,
    callback: cb
  });
}
function dialogAlert(message,cb){
  vex.dialog.alert({
    message: message,
    callback: cb
  });
}
