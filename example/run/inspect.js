/** Quick html user interface to inspect the clips structure 


    It will require inspect.css to work properly.

    It only shows the standard callback of each clip track, it will not show clip actions at the moment.


    The main usage of this lib is the inspectClip function.

*/


function inspectClip(div,clip){
    var container = div;
    container.html("");
    var basic_info = $("<div></div>").addClass("inspect-basic-info");
    var frames_line = $("<div></div>").addClass("inspect-frames-line");
    var action_txt = $("<div></div>").addClass("inspect-frames-line");
    var object_list = $("<ul><div class='title'>tracked clips</div></ul>").addClass("inspect-frame-objects");
    container.append(basic_info);
    container.append(frames_line);
    container.append(action_txt);
    container.append(object_list);
    var curfocus;
    var clo = new Array();
    for (var i = 0;i<clip.length();i++){
       var frame = clip.getFrame(i);
       var frame_btn = $("<div></div>").addClass("inspect-frame-basic");
       if(frame.keyframe()){
         frame_btn.addClass("inspect-frame-key");
       }
       frames_line.append(frame_btn);
       if (i==0){
         curfocus = frame_btn;
       }
      /* No fun and luck here, this function might be buggy */
       clo[i] = new function(){
          this.ele = frame_btn;
          this.frame = frame;
          var self = this;
          this.cb = function(){
            inspectFrame(container,object_list,action_txt,self.frame);
            curfocus.removeClass('inspect-frame-focus');
            self.ele.addClass('inspect-frame-focus');
            curfocus = self.ele;
          }
       }
       frame_btn.on('click',clo[i].cb);
    }
    clo[0].cb();
    var b2p = $("<div>parent clip ...</div>").addClass("foot");
    container.append(b2p);

    /* clip always has a parent 
       if clip.parent = clip , then it is the top element */
    b2p.on('click',function(){
     inspectClip(container,clip.getParent());
    });

    /* all clips must have at least 1 frame */
    prepareBasicInfo(basic_info,clip)
}

function prepareBasicInfo (basic_info,clip){
    basic_info.append($("<div>clipname : " + clip.name() + "</div>"));
}


function inspectFrame(container,object_list,action_txt,frame){
   var tracks = frame.getClips();
   var clo = {};
   for (t in tracks){
     var clip = tracks[t];
     var libtn = $("<li>" + clip.clip.name() + "</li>");
     object_list.append(libtn);
     /* No fun and luck here, this function might be buggy */
     clo[t] = new function(){
          this.clip = clip.clip;
          var self = this;
          this.cb = function(){
            inspectClip(container,self.clip);
          }
       }
     libtn.on('click',clo[t].cb);
   }
   action_txt.html(frame.action.toString());
}


/* To run the test function we need to make sure it is running under escape.game environement */
function inspectTest(){
   var clip = new zoyoe.game.clip('main stage',$("<div></div>").get(0));
   var inst = getScenario('basic',0);
   inst.initialize(clip);
   inspectClip($("body #inspect"),clip);

}
