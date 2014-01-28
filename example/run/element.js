var labescape = {}
var game = {}
game.VOID = 0;
game.PATH = 1;
game.OBSTCAL = 2;
game.ITEM = 2;
game.BLOCK_SZ = 100;
game.ACTOR_HEIGHT = 120;
game.path = {};
game.obstcal = {};
game.actor = {};
game.actortype = {};
game.path.NORMAL_IMG = "res/path/normal.png";
game.path.NORMAL_CENTER = {top:0,left:0};
game.obstcal.TREE_IMG = "res/obstcals/tree.png";
game.obstcal.TREECUT_IMG = "res/obstcals/treecut.png";
game.actor.MAIN_IMG = "res/actors/main.png";
game.actor.MONSTER_IMG = "res/actors/mob4.png";
game.actor.DOG_IMG = "res/actors/dog.png";
game.actor.BONE_IMG = "res/actors/bone.png";
game.actor.BOMB_IMG = function(idx){
  return "res/actors/bomb/bomb" + idx + ".png";
}
game.actortype.GENERAL_MONSTER = 1;
game.actortype.GENERAL_MONSTER_CONTAINER = 2;
game.actortype.GENERAL_DOG = 3;
game.actortype.GENERAL_BONE = 4;

game.path.normal = function(dec){
  var decoration = Math.floor(Math.random()*21); 
  if(decoration <= 2) {
    var ele = $("<div class='block-normal'><img src='res/ground/flower1.png'></image></div>").get(0);
    ele.style.width = n2px(game.BLOCK_SZ);
    ele.style.height = n2px(game.BLOCK_SZ);
    var img = ele.getElementsByTagName("img")[0];
    img.style.width = n2px(game.BLOCK_SZ);
    var clip = (new zoyoe.game.clip(name,ele));
    clip.zidxLock(0);
    return clip;
  }else if(decoration <= 4){
    var ele = $("<div class='block-normal'><img src='res/ground/flower2.png'></image></div>").get(0);
    ele.style.width = n2px(game.BLOCK_SZ);
    ele.style.height = n2px(game.BLOCK_SZ);
    var img = ele.getElementsByTagName("img")[0];
    img.style.width = n2px(game.BLOCK_SZ);
    var clip = (new zoyoe.game.clip(name,ele));
    clip.zidxLock(0);
    return clip;
  }else if(decoration == 5){
    var ele = $("<div class='block-normal'><img src='res/ground/stone.png'></image></div>").get(0);
    ele.style.width = n2px(game.BLOCK_SZ);
    ele.style.height = n2px(game.BLOCK_SZ);
    var img = ele.getElementsByTagName("img")[0];
    img.style.width = n2px(game.BLOCK_SZ);
    var clip = (new zoyoe.game.clip(name,ele));
    clip.zidxLock(0);
    return clip;
  }else{
    return null;
  }
}
game.obstcal.mstc = function(name,para){
  var ele = $("<div class='block-normal'><img src='"+game.obstcal.TREECUT_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.BLOCK_SZ);
  var img = ele.getElementsByTagName("img")[0];
  img.style.width = n2px(game.BLOCK_SZ);
  var clip = (new zoyoe.game.clip(name,ele));
  clip.para = para;
  clip.type = game.actortype.GENERAL_MONSTER_CONTAINER;
  return clip;
}
game.obstcal.tree = function(){
  var ele = $("<div class='block-normal'><img src='"+game.obstcal.TREE_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.BLOCK_SZ);
  var img = ele.getElementsByTagName("img")[0];
  img.style.width = n2px(game.BLOCK_SZ);
  img.style.position = "relative";
  img.style.top = n2px(game.BLOCK_SZ - 127);
  var clip = (new zoyoe.game.clip(zoyoe.game.newName(),ele));
  return clip;
}
game.actor.BuildBombAction = function(clip){
  var ele = clip.element();
  var img = ele.getElementsByTagName("img")[0];
  function genAction(index){
    var idx = index;
    return (function(){
      img.src = game.actor.BOMB_IMG(idx);
    });
  }
  function createStep(number,gap){
    var first = clip.length();
    for(var i=0;i<number;i++){
      var start = clip.appendFrames(gap);
      var frame = clip.getFrame(start);
      frame.setKeyframe(true);
      frame.action = genAction(i);
      if(i+1 == number){
        var tailframe = clip.getFrame(clip.length() - 1);
        tailframe.setKeyframe(true);
        tailframe.next = first;
        tailframe.action = function(){
          clip.gotoAndPlay(this.next);
        }
      }
    }
    return first;
  }
  createStep(4,5);
}


game.actor.bomb = function(){
  var ele = $("<div class='block-normal'><img src='"+game.actor.BOMB_IMG(0)+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.BLOCK_SZ);
  var img = ele.getElementsByTagName("img")[0];
  img.style.position = "relative";
  img.style.width = "300px";
  img.style.height = "300px";
  var clip = (new zoyoe.game.clip(zoyoe.game.newName(),ele));
  clip.stop();
  game.actor.BuildBombAction(clip);
  clip.center(100,100);
  return clip;
}
game.actor.BuildMoveAction = function(clip){
  var ele = clip.element();
  var img = ele.getElementsByTagName("img")[0];
  clip.center(17,0);
  function createStep(number,gap,offset,stop){
    var first = clip.length();
    for(var i=0;i<number;i++){
      var start = clip.appendFrames(gap);
      var frame = clip.getFrame(start);
      frame.setKeyframe(true);
      frame.tmp = offset;
      frame.action = function(){
        img.style.top = "-"+this.tmp+"px";
      }
      offset = offset + 120;
      if(i+1 == number){
        var tailframe = clip.getFrame(clip.length() - 1);
        tailframe.setKeyframe(true);
        tailframe.next = first;
        if(stop){
          tailframe.action = function(){
            clip.stop();
          }
        }
        else{
          tailframe.action = function(){
            clip.gotoAndPlay(this.next);
          }
        }
      }
    }
    return offset;
  }
  var offset = 120;
  for(var i = 0;i<4;i++){
    offset = createStep(4,5,offset);
  }
  createStep(3,5,offset,true)
  clip.towardsTop = function(){
    clip.gotoAndPlay(1);
  }
  clip.towardsBottom = function(){
    clip.gotoAndPlay(21);
  }
  clip.towardsRight = function(){
    clip.gotoAndPlay(41);
  }
  clip.towardsLeft = function(){
    clip.gotoAndPlay(61);
  }
  clip.stand = function(){
    clip.gotoAndStop(0);
  }
  clip.bomb = function(cb){
    clip.gotoAndPlay(81);
    /* The convention is that the last frame is the ash frame after bomb */
    var tailframe = clip.getFrame(clip.length() - 1);
    tailframe.setKeyframe(true);
    tailframe.action = function(){
      clip.stop();
      cb();
      tailframe.action = function(){return;};
    }
  }
  clip.stop();
}
game.actor.main = function(name){
  var ele = $("<div class='block-actor'><img src='"+game.actor.MAIN_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.ACTOR_HEIGHT);
  var img = ele.getElementsByTagName("img")[0];
  img.style.position = "relative";
  img.style.width = n2px(game.BLOCK_SZ);
  img.style.left = "0px";
  img.style.top = "0px";
  var clip = (new zoyoe.game.clip(name,ele));
  game.actor.BuildMoveAction(clip);
  return clip;
}
game.actor.monster = function(name,para){
  var ele = $("<div class='block-actor'><img src='"+game.actor.MONSTER_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.ACTOR_HEIGHT);
  var img = ele.getElementsByTagName("img")[0];
  img.style.position = "relative";
  img.style.width = n2px(game.BLOCK_SZ);
  img.style.left = "0px";
  img.style.top = "0px";
  var clip = (new zoyoe.game.clip(name,ele));
  clip.para = para;
  clip.type = game.actortype.GENERAL_MONSTER;
  game.actor.BuildMoveAction(clip);
  return clip;
}
game.actor.dog = function(name,para){
  var ele = $("<div class='block-actor'><img src='"+game.actor.DOG_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.ACTOR_HEIGHT);
  var img = ele.getElementsByTagName("img")[0];
  img.style.position = "relative";
  img.style.width = n2px(game.BLOCK_SZ);
  img.style.left = "0px";
  img.style.top = "0px";
  var clip = (new zoyoe.game.clip(name,ele));
  clip.para = para;
  clip.type = game.actortype.GENERAL_DOG;
  game.actor.BuildMoveAction(clip);
  return clip;
}

game.actor.bone = function(name,para){
  var ele = $("<div class='block-actor'><img src='"+game.actor.BONE_IMG+"'></image></div>").get(0);
  ele.style.width = n2px(game.BLOCK_SZ);
  ele.style.height = n2px(game.ACTOR_HEIGHT);
  var img = ele.getElementsByTagName("img")[0];
  img.style.position = "relative";
  img.style.width = n2px(game.BLOCK_SZ);
  img.style.left = "0px";
  img.style.top = "0px";
  var clip = (new zoyoe.game.clip(name,ele));
  clip.para = para;
  clip.type = game.actortype.GENERAL_BONE;
  return clip;
}

labescape.game = game;
