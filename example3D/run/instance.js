/* To finally construct an example, we need 3 layers,

  1. bottom layer which is logic.js

  2. element layer which is element.js

  3. instance layer which is this file. It defines the game logic and actions for cliptracks in key frames.

*/

labescape.game.sign = function(n){
  if (n >0){return 1;}
  else if (n < 0){return -1;}
  else{return 0;}
}

var cbsz = labescape.game.BLOCK_SZ;
var cbszhalf = cbsz/2;

labescape.game.instance = function(cells,path){
   var instance = this;
   var parent = null;
   this.cells = cells;
   this.path = path;
   var ns = neighbours(this.cells);
   var monsterkilled = 0;
   this.getZIndex = function(ps){
     return ps.x * this.cells.length + ps.y;
   }
   this.acquire = function(ps){
     for(var i=0;i<ps.length;i++){
       if (ps[i].x < 0 || this.cells.length <= ps[i].x
            || ps[i].y < 0 || this.cells[0].length <= ps[i].y
            || this.path[ps[i].x][ps[i].y] == 1){return false;}
     }
     return true;
   }; 

   this.cell2pixel = function(x,y){
     return {top:x*cbsz,left:y*cbsz};
   };
   this.pixel2cell = function(top,left){
     return {x:Math.floor(top/cbsz),y:Math.floor(left/cbsz)}
   };
   this.pixel2cells = function(top,left){
     return [{x:Math.floor(top/cbsz),y:Math.floor(left/cbsz)},
             {x:Math.floor(top/cbsz),y:Math.floor((left + cbsz - 1)/cbsz)},
             {x:Math.floor((top + cbsz-1)/cbsz),y:Math.floor(left/cbsz)},
             {x:Math.floor((top + cbsz - 1)/cbsz),y:Math.floor((left+cbsz-1)/cbsz)}]
   };
   this.pixel2targets = function(top,left,vtop,vleft){
     var vt = labescape.game.sign(vtop); 
     var vl = labescape.game.sign(vleft); 
     return [{x:Math.floor((top+(cbszhalf)+(cbszhalf)*vt)/cbsz),
              y:Math.floor((left+cbszhalf+cbszhalf*vl)/cbsz)}]
   };
   this.pathExtractor = function(x,y){
     var cells = this.path;
     var es = edges(cells);
     var idx = this.cells[0].length * x + y;
     var path = shortestPath(es,cells[0].length * cells.length,idx);
     return function(x,y){
       var idx = cells[0].length * x + y;
       return constructPath(path,idx);
     }
   }
   this.actors = {};
   this.itemInit = function(info){
    var idx = info
    if(isNaN(info)){
      idx = info[0];
    }
    switch(idx){
    case 0: return game.path.normal();
    case 1: return (new game.obstcal.tree());
    case 2: {
        var main = new game.actor.main(info[1]);
        main.energy = 100;
        this.actors['main'] = main;
        main.is_actor = true;
        main.speed_top = 0;
        main.speed_left = 0;
        main.targets = [];
        main.moveLeft = function(e){
          main.targets.push({bound:20,remain:20,vtop:0,vleft:-5,ele:e});
        }
        main.moveRight = function(e){
          main.targets.push({bound:20,remain:20,vtop:0,vleft:5,ele:e});
        }
        main.moveTop = function(e){
          main.targets.push({bound:20,remain:20,vtop:-5,vleft:0,ele:e});
        }
        main.moveBottom = function(e){
          main.targets.push({bound:20,remain:20,vtop:5,vleft:0,ele:e});
        }
        return main;
      }
    case 3: 
       var monster = new game.actor.monster(info[1],info[2]);
       this.actors[info[1]] = monster;
       return monster;
    case 4: 
       var monster_container = new game.obstcal.mstc(info[1],info[2]);
       this.actors[info[1]] = monster_container;
       return monster_container;
    case 5: /* this is the dog */ 
       var dog = new game.actor.dog(info[1],info[2]);
       this.actors[info[1]] = dog;
       return dog;
    case 6: /* this is the bone */ 
       var bone = new game.actor.bone(info[1],info[2]);
       this.actors[info[1]] = bone;
       return bone;
    }

  }
  this.plantBomb = function(idx){
    var self = this;
    var main = this.actors['main']; 
    if(main.targets.length > 0){
      return;
    }
    var p = main.position();
    var actcell = this.pixel2cell(p.top,p.left);
    var pos = this.cell2pixel(actcell.x,actcell.y);
    var bomb = this.bombs.pop();
    if(bomb){
      bomb.position(pos.top,pos.left);
      var frame = parent.getFrame(0);
      var track = parent.trackClip(frame,bomb);
      track.counting = 120; 
      $("#panel .bomb .number").html(this.bombs.length);
      this.path[actcell.x][actcell.y] = 1;
      track.action = function(){
        var fame = parent.getFrame(0);
        if(track.counting == 0){
          var tracks = frame.getClips();
          var srcidx = self.cells[0].length * actcell.x + actcell.y;
          for( t in tracks){
            var cell = self.pixel2cell(tracks[t].top + cbsz/2,tracks[t].left 
              + cbsz/2);
            var cellidx = self.cells[0].length * cell.x + cell.y;
            if(ns(srcidx,cellidx)){
              if(tracks[t].bomb!=undefined){
                tracks[t].bomb();
              }
            }
          }
          frame.untrackClip(track);
          self.path[actcell.x][actcell.y] = 0;
        }else if(track.counting == 20){
          bomb.play();
          track.counting -= 1;
        }else{
          track.counting -= 1;
        } 
      }
    }
  }
  this.route_eles = [];
  this.bombs = [];
  this.onMouseClick = function(top,left){
    var cell = this.pixel2cell(top,left);
    var main = this.actors['main'];
    var p = parent.getFrame(0).getTrack(this.actors['main'].name()).clearTailTargets();
    var actcell = this.pixel2cell(p.top,p.left); 
    var path = instance.pathExtractor(actcell.x,actcell.y)(cell.x,cell.y);
    var st = '';
    var acy = actcell.y
    var acx = actcell.x
    for(var i=0;i<path.length;i++){
      var r = Math.floor(path[i]/this.cells[0].length);
      var l = path[i] % this.cells[0].length;
      var block = $("<div class='route'><div></div></div>");
      block.css({"top":n2px(r*cbsz),"left":n2px(l*cbsz)});
      //$("#root").append(block);
      var x = Math.floor(path[i]/this.cells[0].length);
      var y = path[i] % this.cells[0].length;
      var v = acy - y;
      var h = acx - x;
      if(v < 0){
        main.moveRight(block);
      }else if (0 < v){
        main.moveLeft(block);
      }else if (h < 0){
        main.moveBottom(block);
      }else if (0 < h){
        main.moveTop(block);
      }
      acy = y;
      acx = x;
    }
  }
  this.costEnergy = function(per){
    var ma = this.actors['main'];
    ma.energy -= per;
    if(ma.energy < 0){
      ma.energy = 0;
    }
    $("#panel .energy div").css('width',n2px(ma.energy*4));
    if(ma.energy == 0){
      this.fail();
    } 
  }
  
  this.fail = function(){
    pauseScenario();
    dialogAlert("You have used all your energe. Now you are too tired to move !",
        function(){resetScenario();});
  }

  this.success = function(){
    dialogAlert("Congratuations, you have completed this !!! Press Ok to continue"
      + "<p>monster killed: " + monsterkilled+ " </p>",
    function(){
      window.location.href = "./adventure.html";
     });
  }


  /* this is the entry function that prepares all required clips in zoyoe.game.env */
  this.initialize = function(clip){
    var cells = this.cells;
    for(var r=0;r<cells.length;r++){
      for (var l=0;l<cells[r].length;l++){
        var cell = this.itemInit(cells[r][l]);
        if(cell){
          clip.insertClip(cell);
          var pos = this.cell2pixel(r,l);
          var p = cell.position(pos.top,pos.left);
          var frame = clip.getFrame(0);
          var cliptrack = clip.trackClip(frame,cell);
          cell.zidx(r * cells.length + l);
        }
      }
    }
    this.initStage(clip);
  }
  this.initStage = function(p){
    parent = p;
    var frame = parent.getFrame(0);
    var self = this;
    var maintrack = frame.getTrack(this.actors['main'].name());
    var stop_if_no_targets = true;
    var hasbone = false;
    maintrack.action = function(){
      if(this.clip.targets.length == 0){
         /* Nothing to Do */
        if(stop_if_no_targets){
          this.clip.stop();
        }
      }else{
        //this.clip.play()
        if(this.clip.targets[0].remain >0){
          if(this.clip.targets[0].remain == this.clip.targets[0].bound){
            if(this.clip.targets[0].vtop>0){
              this.clip.towardsBottom();
            }else if(this.clip.targets[0].vtop<0){
              this.clip.towardsTop();
            }else if(this.clip.targets[0].vleft<0){
              this.clip.towardsLeft();
            }else if(this.clip.targets[0].vleft>0){
              this.clip.towardsRight();
            }
          }
          var rt = this.clip.targets[0].vtop * this.clip.targets[0].remain;
          var rl = this.clip.targets[0].vleft * this.clip.targets[0].remain;
          var ps = self.pixel2cells(this.top+rt,this.left+rl);
          if(self.acquire(ps)){
            this.clip.zidx(self.getZIndex(self.pixel2cell(this.top+rt,this.left+rl)));
            this.top += this.clip.targets[0].vtop;
            this.left += this.clip.targets[0].vleft;
            this.clip.targets[0].remain -= 1;
          }else{
            this.clip.targets[0].ele.remove();
            this.clip.targets.shift();
            instance.costEnergy(2);
          }
        }else{
          this.clip.targets[0].ele.remove();
          this.clip.targets.shift();
          instance.costEnergy(2);
        }
      }
    }
    maintrack.clearTailTargets = function(){
      var main = this.clip;
      while(main.targets.length > 1){
        var target = main.targets.pop();
        target.ele.remove();
      }
      var rt = 0;
      var rl = 0;
      if(main.targets.length > 0){
        rt = main.targets[0].vtop*main.targets[0].remain;
        rl = main.targets[0].vleft*main.targets[0].remain;
      }
      return {top:this.top+rt,left:this.left+rl};
    } 
    maintrack.bomb = function(){
      stop_if_no_targets = false;
      var main = this.clip;
      main.bomb(function (){
        main.stop();
        pauseScenario();
        dialogAlert("You have bombed yourself !!! Press Ok to restart",
        function(){resetScenario();});
      });
    }

    maintrack.caughtByMonster = function(){
      pauseScenario();
      dialogAlert("Yum Yum. You got killed !!! Press Ok to restart",
        function(){resetScenario();});
    }
    maintrack.caughtByDog = function(){
      pauseScenario();
      if(hasbone){
        self.success();
      }else{
        dialogAlert("If you bring me my bone, I will lead you out of here !!! Press Ok to continue",
        function(){continueScenario();});
      }
    }
    maintrack.pickBone = function(){
      pauseScenario();
      dialogAlert("You have picked the bone for the dog !!! Press Ok to continue",
        function(){
          hasbone = true;
          continueScenario();
        }
      );
    }
    function move(clip){
      if(clip.targets[0].vtop > 0){
        clip.towardsBottom();
      }else if(clip.targets[0].vtop < 0){
        clip.towardsTop();
      }else if(clip.targets[0].vleft < 0){
        clip.towardsLeft();
      }else if(clip.targets[0].vleft > 0){
        clip.towardsRight();
      }
    }
    function initMonster(mtrack,v){
      mtrack.clip.targets = [{vtop:v.vt,vleft:v.vl}];
      move(mtrack.clip);
      /* the following is an indicator of whether the monster is still alive */
      var active = true;
      mtrack.action = function(){
        if(active){
          var top = this.top + this.clip.targets[0].vtop;
          var left = this.left + this.clip.targets[0].vleft;
          var ps = self.pixel2targets(top,left,this.clip.targets[0].vtop,this.clip.targets[0].vleft);
          if(self.acquire(ps)){
            this.left += this.clip.targets[0].vleft;
            this.top += this.clip.targets[0].vtop;
          }else{
            this.clip.targets[0].vtop = 0 - this.clip.targets[0].vtop;
            this.clip.targets[0].vleft = 0 - this.clip.targets[0].vleft;
            move(this.clip);
          }

          var fame = parent.getFrame(0);
          var actcell = self.pixel2cell(this.top,this.left);

          /* we are goint to get the frame that tracks this clip */
 
          var tracks = frame.getClips();
          for( t in tracks){
            if (tracks[t].caughtByMonster){
              var cell = self.pixel2cell(tracks[t].top + cbsz/2,tracks[t].left 
                + cbsz/2);
              if(cell.x == actcell.x && cell.y == actcell.y){
                tracks[t].caughtByMonster();
              }
            }
          }

        }
      }
      mtrack.bomb = function(){
        monsterkilled += 1;
        active = false;
        mtrack.clip.bomb(function(){
          frame.untrackClip(mtrack);
          mtrack.clip.stop();
        }); 
      }
    }

    function initBone(mtrack,v){
      /* the following is an indicator of whether the monster is still alive */
      mtrack.action = function(){
        var fame = parent.getFrame(0);
        var actcell = self.pixel2cell(this.top,this.left);

        /* we are goint to get the frame that tracks this clip */

        var tracks = frame.getClips();
        for( t in tracks){
          if (tracks[t].pickBone){
            var distance = Math.max(Math.abs(tracks[t].top - this.top),
                                    Math.abs(tracks[t].left-this.left));
            if(distance == 0){
               tracks[t].pickBone();
               frame.untrackClip(mtrack);
            }
          }
        }
      }
    }


    function initDog(mtrack,v){
      mtrack.clip.targets = [{vtop:v.vt,vleft:v.vl}];
      move(mtrack.clip);
      /* the following is an indicator of whether the monster is still alive */
      var active = true;
      var attempt = 0;
      mtrack.action = function(){
        if(active){
          var top = this.top + this.clip.targets[0].vtop;
          var left = this.left + this.clip.targets[0].vleft;
          var ps = self.pixel2targets(top,left,this.clip.targets[0].vtop,this.clip.targets[0].vleft);
          if(self.acquire(ps)){
            this.left += this.clip.targets[0].vleft;
            this.top += this.clip.targets[0].vtop;
          }else{
            this.clip.targets[0].vtop = 0 - this.clip.targets[0].vtop;
            this.clip.targets[0].vleft = 0 - this.clip.targets[0].vleft;
            move(this.clip);
          }

          var fame = parent.getFrame(0);
          var actcell = self.pixel2cell(this.top,this.left);

          /* we are goint to get the frame that tracks this clip */
 
          var tracks = frame.getClips();
          for( t in tracks){
            if (tracks[t].caughtByDog){
              var distance = Math.max(Math.abs(tracks[t].top - this.top),
                                      Math.abs(tracks[t].left-this.left));
              if(distance < 10){
                if (attempt == 0){
                  attempt = 10;
                  tracks[t].caughtByDog();
                }else{
                  attempt -= 1;
                }
              }
            }
          }

        }
      }
      mtrack.bomb = function(){
        var dog = this.clip;
        dog.bomb(function (){
          dog.stop();
          pauseScenario();
          dialogAlert("You have bombed the innocent dog !!! Press Ok to restart",
          function(){resetScenario();});
        });
      }
    }



    function initMContainer(name,mname,v){
      var mctrack = frame.getTrack(name); 
      var cell = self.pixel2cell(mctrack.top,mctrack.left);
      mctrack.clip.targets = [{vtop:v.vt,vleft:v.vl}];
      mctrack.bomb = function(){
        var m = new game.actor.monster(mname,v);
        self.actors['mname'] = m;
        parent.insertClip(m);
        var frame = parent.getFrame(0);
        m.position(this.top,this.left);
        var track = frame.trackClip(m);
        mctrack.action = function(){
          frame.untrackClip(mctrack);
          initMonster(track,v);
          self.path[cell.x][cell.y] = 0;
          mctrack.action = function(){return;};
        }
      }
    }
    for (var n in this.actors){
      if (this.actors[n].type == game.actortype.GENERAL_MONSTER){
         var mtrack = frame.getTrack(this.actors[n].name()); 
         initMonster(mtrack,this.actors[n].para);
      }else if(this.actors[n].type == game.actortype.GENERAL_DOG){
         var mtrack = frame.getTrack(this.actors[n].name()); 
         initDog(mtrack,this.actors[n].para);
      }else if(this.actors[n].type == game.actortype.GENERAL_BONE){
         var mtrack = frame.getTrack(this.actors[n].name()); 
         initBone(mtrack,this.actors[n].para);
      }else if(this.actors[n].type == game.actortype.GENERAL_MONSTER_CONTAINER){
         initMContainer(this.actors[n].name(),zoyoe.game.newName(),this.actors[n].para);
      }
    }
    for(var i=0;i<3;i++){
      var b = new game.actor.bomb();
      this.bombs.push(b);
      parent.insertClip(b);
    }
  } 
}


