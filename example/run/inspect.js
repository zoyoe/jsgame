/** Quick html user interface to inspect the clips structure 


    It will require inspect.css to work properly.

    It only shows the standard callback of each clip track, it will not show clip actions at the moment.


    The main usage of this lib is the inspectClip function.

*/


function inspectClip(div,clip){
    var container = div;
    //container.html = ("");
    var basic_info = $("<div></div>").addClass("inspect-basic-info");
    var frames_line = $("<div></div>").addClass("inspect-frames-line");
    var object_list = $("<ul></ul>").addClass("inspect-frame-objects");
    for (var i = 0;i<clip.length();i++){
       var frame = clip.getFrame(i);
       var frame_btn = $("<div></div>").addClass("inspect-frame-basic");
       if(frame.keyframe()){
         frame_btn.addClass("inspect-frame-key");
       }
       /* No fun and luck here, this function might be buggy */
       frame_btn.click(function(){
          inspectFrame(object_list,frame);
       } ,false);
       frames_line.append(frame_btn);
    }
    container.append(basic_info);
    container.append(frames_line);
    container.append(object_list);
    container.append($("<div>build path ...</div>").addClass("foot"));

    /* all clips must have at least 1 frame */
    inspectFrame(object_list,clip.getFrame(0));
    prepareBasicInfo(basic_info,clip)
}

function prepareBasicInfo (basic_info,clip){
    basic_info.append($("<div>" + clip.name() + "</div>"));
}

function inspectFrame(object_list,frame){
   var tracks = frame.getClips();
   for (t in tracks){
     var clip = tracks[t];
     object_list.append($("<li>" + clip.name() + "</li>"));
   }
}


/* To run the test function we need to make sure it is running under escape.game environement */
function inspectTest(){
   var clip = game.actor.main('mainactor');
   inspectClip($("body #inspect"),clip);

}
