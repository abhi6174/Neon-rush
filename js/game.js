class NeonRushGame {
  constructor(canvas,callbacks={}){
    this.canvas=canvas;this.ctx=canvas.getContext('2d');this.cb=callbacks;this.running=false;this.last=0;this.elapsed=0;this.score=0;this.health=3;this.orbs=0;this.near=0;this.level=1;this.spawnTimer=0;this.orbTimer=0;this.powerTimer=0;this.invuln=0;this.shield=0;this.shake=0;this.weaponLevel=0;this.fireTimer=0;this.alienTimer=30;this.bossTimer=120;this.bossesDefeated=0;this.entities=[];this.particles=[];this.stars=[];this.keys={};this.pointer=null;this.best=Number(localStorage.getItem('nr_best')||0);this.shakeEnabled=localStorage.getItem('nr_shake')!=='false';this.width=800;this.height=500;this.dpr=1;
    this.player={x:400,y:250,r:12,vx:0,vy:0,speed:270,angle:-Math.PI/2,trail:[]};this.resize();window.addEventListener('resize',()=>this.resize());
    this.bindInput();this.seedStars();
  }
  resize(){const rect=this.canvas.getBoundingClientRect();if(!rect.width||!rect.height)return;this.dpr=Math.min(2,window.devicePixelRatio||1);this.width=rect.width;this.height=rect.height;this.canvas.width=Math.floor(rect.width*this.dpr);this.canvas.height=Math.floor(rect.height*this.dpr);this.ctx.setTransform(this.dpr,0,0,this.dpr,0,0);if(this.player){this.player.x=Math.min(this.width-25,Math.max(25,this.player.x));this.player.y=Math.min(this.height-25,Math.max(25,this.player.y));}}
  seedStars(){this.stars=Array.from({length:100},()=>({x:Math.random()*this.width,y:Math.random()*this.height,z:.3+Math.random()*1.7,tw:Math.random()*6.28}));}
  bindInput(){
    window.addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright',' '].includes(k))e.preventDefault();this.keys[k]=true;if(k==='escape'||k==='p')this.cb.pause?.();});
    window.addEventListener('keyup',e=>this.keys[e.key.toLowerCase()]=false);
    this.canvas.addEventListener('pointerdown',e=>{this.pointer=this.point(e);this.canvas.setPointerCapture?.(e.pointerId);});
    this.canvas.addEventListener('pointermove',e=>{if(this.pointer)this.pointer=this.point(e);});
    this.canvas.addEventListener('pointerup',()=>this.pointer=null);this.canvas.addEventListener('pointercancel',()=>this.pointer=null);
  }
  point(e){const r=this.canvas.getBoundingClientRect();return{x:e.clientX-r.left,y:e.clientY-r.top};}
  start(){this.elapsed=0;this.score=0;this.health=3;this.orbs=0;this.near=0;this.level=1;this.spawnTimer=.3;this.orbTimer=2;this.powerTimer=0;this.invuln=0;this.shield=0;this.shake=0;this.weaponLevel=0;this.fireTimer=0;this.alienTimer=30;this.bossTimer=120;this.bossesDefeated=0;this.entities=[];this.particles=[];this.player={x:this.width/2,y:this.height*.72,r:12,vx:0,vy:0,speed:270,angle:-Math.PI/2,trail:[]};this.running=true;this.last=performance.now();this.loop(this.last);}
  pause(){this.running=false;}
  resume(){if(this.running)return;this.running=true;this.last=performance.now();this.loop(this.last);}
  stop(){this.running=false;}
  loop=t=>{if(!this.running)return;const dt=Math.min((t-this.last)/1000,.033);this.last=t;this.update(dt);this.draw();requestAnimationFrame(this.loop);};
  update(dt){
    this.elapsed+=dt;this.score+=dt*2;this.level=Math.min(5,1+Math.floor(this.elapsed/22));this.spawnTimer-=dt;this.orbTimer-=dt;this.alienTimer-=dt;this.bossTimer-=dt;this.fireTimer-=dt;this.invuln=Math.max(0,this.invuln-dt);this.shield=Math.max(0,this.shield-dt);this.powerTimer=Math.max(0,this.powerTimer-dt);this.shake=Math.max(0,this.shake-dt*2.5);
    const interval=Math.max(.22,1.05-(this.level-1)*.15);if(this.spawnTimer<=0){this.spawnAsteroid();this.spawnTimer=interval*(.7+Math.random()*.7);}
    if(this.orbTimer<=0){this.spawnOrb();this.orbTimer=5+Math.random()*4;}
    if(this.alienTimer<=0){this.spawnAlien();this.alienTimer=Math.max(11,19-Math.floor(this.elapsed/45)*2)+Math.random()*4;}
    if(this.bossTimer<=0){this.spawnBoss();this.bossTimer=105;}
    this.movePlayer(dt);this.fireWeapons();this.updateEntities(dt);this.updateParticles(dt);this.checkCollisions();this.score=Math.floor(this.score);
    this.cb.hud?.(this);
  }
  movePlayer(dt){
    const p=this.player;let dx=0,dy=0;
    if(this.keys.a||this.keys.arrowleft)dx--;if(this.keys.d||this.keys.arrowright)dx++;if(this.keys.w||this.keys.arrowup)dy--;if(this.keys.s||this.keys.arrowdown)dy++;
    if(this.pointer){const vx=this.pointer.x-p.x,vy=this.pointer.y-p.y,len=Math.hypot(vx,vy);if(len>8){dx=vx/len;dy=vy/len;}}
    const mag=Math.hypot(dx,dy);if(mag>0){dx/=mag;dy/=mag;p.angle=Math.atan2(dy,dx)+Math.PI/2;}
    const boost=this.powerTimer>0?1.35:1;const targetX=dx*p.speed*boost,targetY=dy*p.speed*boost;
    p.vx+=(targetX-p.vx)*Math.min(1,dt*9);p.vy+=(targetY-p.vy)*Math.min(1,dt*9);p.x=Math.max(20,Math.min(this.width-20,p.x+p.vx*dt));p.y=Math.max(24,Math.min(this.height-20,p.y+p.vy*dt));
    if(Math.random()<.8){this.particles.push({x:p.x+(Math.random()-.5)*5,y:p.y+13,vx:(Math.random()-.5)*22-p.vx*.08,vy:50+Math.random()*70,life:.28,max:.28,size:1+Math.random()*2,color:Math.random()>.5?'#00f5ff':'#a855f7'});}
  }
  spawnAsteroid(){
    const side=Math.floor(Math.random()*4);let x,y;if(side===0){x=-35;y=Math.random()*this.height}else if(side===1){x=this.width+35;y=Math.random()*this.height}else if(side===2){x=Math.random()*this.width;y=-35}else{x=Math.random()*this.width;y=this.height+35}
    const tx=this.player.x-x,ty=this.player.y-y,a=Math.atan2(ty,tx)+(Math.random()-.5)*.85,speed=(65+Math.random()*65)+(this.level-1)*21,size=10+Math.random()*18+(this.level>3?Math.random()*7:0);
    const points=Array.from({length:10},(_,i)=>.72+Math.random()*.3),craters=Array.from({length:3},()=>({x:(Math.random()-.5)*.9,y:(Math.random()-.5)*.9,r:.1+Math.random()*.09}));
    this.entities.push({type:'asteroid',x,y,vx:Math.cos(a)*speed,vy:Math.sin(a)*speed,r:size,rot:Math.random()*6,spin:(Math.random()-.5)*2.2,points,craters,passed:false,nearChecked:false,hp:size>23?2:1});
  }
  spawnAlien(){
    const side=Math.floor(Math.random()*4);let x,y;if(side===0){x=-35;y=Math.random()*this.height}else if(side===1){x=this.width+35;y=Math.random()*this.height}else if(side===2){x=Math.random()*this.width;y=-35}else{x=Math.random()*this.width;y=this.height+35;}
    const roll=Math.random(),kind=this.elapsed<65?'scout':roll<.27?'bruiser':roll<.56?'rammer':roll<.78?'sniper':'scout';
    const stats={scout:{r:15,hp:5,speed:55},bruiser:{r:23,hp:12,speed:32},rammer:{r:17,hp:7,speed:42},sniper:{r:16,hp:6,speed:25}}[kind];
    this.entities.push({type:'alien',kind,x,y,vx:0,vy:0,...stats,maxHp:stats.hp,fireTimer:1.1+Math.random(),shotCooldown:2.4,phase:Math.random()*6.28,chargeState:'approach',chargeCooldown:1.5,chargeTimer:0,aim:0,lockTimer:0});window.audioEngine?.alien();this.popText(x,y-28,kind==='bruiser'?'ARMORED BRUISER':kind==='rammer'?'RAMMER INBOUND':kind==='sniper'?'SNIPER CONTACT':'ALIEN CONTACT','#ff3cac');
  }
  spawnBoss(){const x=this.width/2,y=-70;this.entities.push({type:'alien',kind:'boss',x,y,vx:0,vy:42,r:42,hp:100+this.bossesDefeated*30,maxHp:100+this.bossesDefeated*30,fireTimer:2,phase:0,attackTimer:1.8,attackMode:0});this.popText(this.width/2,this.height*.3,'BOSS INBOUND','#ff4057');window.audioEngine?.boss();}
  spawnOrb(){const x=45+Math.random()*(this.width-90),y=45+Math.random()*(this.height-90);this.entities.push({type:Math.random()<.22?'shield':'orb',x,y,vx:0,vy:0,r:9,phase:Math.random()*6.28,life:9});}
  fireWeapons(){if(!this.weaponLevel||this.fireTimer>0)return;const targets=this.entities.filter(e=>e.type==='asteroid'||e.type==='alien');if(!targets.length)return;const p=this.player;targets.sort((a,b)=>Math.hypot(a.x-p.x,a.y-p.y)-Math.hypot(b.x-p.x,b.y-p.y));const target=targets[0],angle=Math.atan2(target.y-p.y,target.x-p.x),count=this.weaponLevel===1?1:this.weaponLevel===2?2:3;
    for(let i=0;i<count;i++){const spread=(i-(count-1)/2)*.2,a=angle+spread;this.entities.push({type:'bullet',x:p.x+Math.cos(a)*15,y:p.y+Math.sin(a)*15,vx:Math.cos(a)*480,vy:Math.sin(a)*480,r:3,life:1.35,damage:1,hostile:false});}
    this.fireTimer=[0,.58,.48,.4][this.weaponLevel];window.audioEngine?.shoot();
  }
  updateEntities(dt){for(const e of this.entities){
    if(e.type==='asteroid'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.rot+=e.spin*dt;}
    else if(e.type==='alien'){
      e.phase+=dt*4;
      if(e.kind==='boss'){
        const targetX=this.width/2+Math.sin(e.phase*.42)*this.width*.28,targetY=Math.min(105,this.height*.22);e.vx+=(targetX-e.x)*dt*1.4;e.vy+=(targetY-e.y)*dt*1.4;e.vx*=.94;e.vy*=.94;e.x+=e.vx*dt;e.y+=e.vy*dt;e.attackTimer-=dt;
        if(e.attackTimer<=0){this.fireBossVolley(e);e.attackMode++;e.attackTimer=e.hp<e.maxHp*.5?1.65:2.25;}
      }else{
        const dx=this.player.x-e.x,dy=this.player.y-e.y,d=Math.hypot(dx,dy)||1,a=Math.atan2(dy,dx);let tx=0,ty=0;
        if(e.kind==='rammer'){
          if(e.chargeState==='approach'){e.chargeCooldown-=dt;tx=Math.cos(a)*e.speed;ty=Math.sin(a)*e.speed;if(d<310&&e.chargeCooldown<=0){e.chargeState='tell';e.chargeTimer=.8;e.aim=a;e.vx=0;e.vy=0;}}
          else if(e.chargeState==='tell'){e.chargeTimer-=dt;if(e.chargeTimer<=0){e.chargeState='charge';e.chargeTimer=.62;e.vx=Math.cos(e.aim)*440;e.vy=Math.sin(e.aim)*440;window.audioEngine?.ram();}}
          else if(e.chargeState==='charge'){e.chargeTimer-=dt;if(e.chargeTimer<=0){e.chargeState='recover';e.chargeCooldown=2.5;e.vx*=.2;e.vy*=.2;}}
          else {e.chargeCooldown-=dt;e.vx*=.94;e.vy*=.94;if(e.chargeCooldown<=0)e.chargeState='approach';}
        }else if(e.kind==='sniper'){
          const move=d>330?1:d<230?-1:0;tx=Math.cos(a)*e.speed*move;ty=Math.sin(a)*e.speed*move;e.shotCooldown-=dt;
          if(e.lockTimer>0){e.lockTimer-=dt;if(e.lockTimer<=0){this.spawnEnemyBullet(e,e.aim,355,5);e.shotCooldown=2.2;}}
          else if(e.shotCooldown<=0){e.aim=a;e.lockTimer=.9;}
        }else{
          const desired=e.kind==='bruiser'?105:155,approach=Math.max(-.5,Math.min(1,(d-desired)/90));tx=Math.cos(a)*e.speed*approach;ty=Math.sin(a)*e.speed*approach;e.fireTimer-=dt;
          if(e.fireTimer<=0){const aim=Math.atan2(this.player.y-e.y,this.player.x-e.x),shots=e.kind==='bruiser'?3:1;for(let i=0;i<shots;i++)this.spawnEnemyBullet(e,aim+(i-(shots-1)/2)*.24,e.kind==='bruiser'?170:205,e.kind==='bruiser'?5:4);e.fireTimer=e.kind==='bruiser'?2.6:2.15+Math.random()*.5;}
        }
        if(e.chargeState!=='tell'&&e.chargeState!=='charge'){e.vx+=(tx-e.vx)*Math.min(1,dt*1.6);e.vy+=(ty-e.vy)*Math.min(1,dt*1.6);}e.x+=e.vx*dt;e.y+=e.vy*dt;
      }
    }else if(e.type==='bullet'){e.x+=e.vx*dt;e.y+=e.vy*dt;e.life-=dt;}else{e.phase+=dt*3;e.life-=dt;}}
    this.entities=this.entities.filter(e=>e.type==='asteroid'?e.x>-90&&e.x<this.width+90&&e.y>-90&&e.y<this.height+90:e.type==='alien'?e.kind==='boss'||(e.x>-65&&e.x<this.width+65&&e.y>-65&&e.y<this.height+65):e.type==='bullet'?e.life>0&&e.x>-20&&e.x<this.width+20&&e.y>-20&&e.y<this.height+20:e.life>0);}
  spawnEnemyBullet(e,angle,speed=190,r=4){this.entities.push({type:'bullet',x:e.x+Math.cos(angle)*(e.r+5),y:e.y+Math.sin(angle)*(e.r+5),vx:Math.cos(angle)*speed,vy:Math.sin(angle)*speed,r,life:4,hostile:true});}
  fireBossVolley(e){if(e.attackMode%2===0){const n=12,offset=e.phase*.8;for(let i=0;i<n;i++)this.spawnEnemyBullet(e,offset+i*Math.PI*2/n,155,5);}else{const aim=Math.atan2(this.player.y-e.y,this.player.x-e.x);for(let i=0;i<5;i++)this.spawnEnemyBullet(e,aim+(i-2)*.18,225,5);}window.audioEngine?.alien();}
  checkCollisions(){const p=this.player;for(const e of this.entities){if(e.dead)continue;const d=Math.hypot(e.x-p.x,e.y-p.y);
    if(e.type==='bullet'&&!e.hostile){for(const target of this.entities){if(target.dead||!['asteroid','alien'].includes(target.type)||Math.hypot(e.x-target.x,e.y-target.y)>target.r+e.r)continue;target.hp-=e.damage||1;e.dead=true;this.explode(e.x,e.y,'#00f5ff',3);if(target.hp<=0){target.dead=true;if(target.type==='alien'&&target.kind==='boss'){this.bossesDefeated++;this.score+=250;this.shield=5;this.popText(target.x,target.y-48,'BOSS DOWN • SHIELD ONLINE','#ffb020');window.audioEngine?.record();}else this.score+=target.type==='alien'?35:8;this.explode(target.x,target.y,target.type==='alien'?'#ff3cac':'#ffb020',target.kind==='boss'?36:target.type==='alien'?20:14);window.audioEngine?.blast();}break;}continue;}
    if(e.type==='bullet'&&e.hostile){if(d<e.r+p.r+2){e.dead=true;if(this.shield>0){this.popText(p.x,p.y-20,'SHIELD BLOCK','#a855f7');}else if(this.invuln<=0){this.damagePlayer();if(this.health<=0)return;}}continue;}
    if(e.type==='asteroid'){if(!e.nearChecked&&d<e.r+p.r+17&&d>e.r+p.r+2){e.nearChecked=true;this.near++;this.score+=5;this.popText(e.x,e.y-12,'NEAR MISS +5','#ffb020');}
      if(d<e.r+p.r){if(this.shield>0){e.dead=true;this.explode(e.x,e.y,'#a855f7',13);window.audioEngine?.shield();}else if(this.invuln<=0){this.damagePlayer();if(this.health<=0)return;}}}
    else if(e.type==='alien'&&d<e.r+p.r){if(this.shield>0){e.dead=true;this.explode(e.x,e.y,'#a855f7',16);}else if(this.invuln<=0){this.damagePlayer();if(this.health<=0)return;}}
    else if((e.type==='orb'||e.type==='shield')&&d<e.r+p.r+5){e.dead=true;if(e.type==='orb'){this.orbs++;this.score+=10;this.popText(e.x,e.y-12,'+10 ENERGY','#00f5ff');window.audioEngine?.pickup();const newLevel=Math.min(3,Math.floor((this.orbs+1)/2));if(newLevel>this.weaponLevel){this.weaponLevel=newLevel;this.popText(p.x,p.y-30,`WEAPON MK-${newLevel} ONLINE`,'#ffb020');window.audioEngine?.evolve(newLevel);}}else{this.shield=5;this.popText(e.x,e.y-12,'SHIELD ONLINE','#a855f7');window.audioEngine?.shield();}}
  }this.entities=this.entities.filter(e=>!e.dead);}
  damagePlayer(){if(this.health<=0)return;this.health--;this.invuln=1.15;this.shake=this.shakeEnabled?.35:0;this.explode(this.player.x,this.player.y,'#ff4057',22);this.popText(this.player.x,this.player.y-24,this.health>0?'HULL DAMAGED':'HULL BREACHED',this.health>0?'#ff4057':'#ffb020');window.audioEngine?.hit();if(this.health<=0)this.end();}
  explode(x,y,color,count){for(let i=0;i<count;i++){const a=Math.random()*Math.PI*2,s=35+Math.random()*190,life=.25+Math.random()*.55;this.particles.push({x,y,vx:Math.cos(a)*s,vy:Math.sin(a)*s,life,max:life,size:1+Math.random()*3,color});}}
  popText(x,y,text,color){this.particles.push({text,x,y,vx:0,vy:-27,life:.8,max:.8,size:12,color});}
  updateParticles(dt){for(const p of this.particles){p.x+=p.vx*dt;p.y+=p.vy*dt;p.life-=dt;}this.particles=this.particles.filter(p=>p.life>0);if(this.particles.length>500)this.particles.splice(0,this.particles.length-500);}
  end(){this.running=false;const final={score:this.score,time:this.elapsed,orbs:this.orbs,near:this.near};const isNew=this.score>this.best;if(isNew){this.best=this.score;localStorage.setItem('nr_best',String(this.best));}window.audioEngine?.over();this.cb.gameOver?.({...final,best:this.best,isNew});}
  draw(){
    const c=this.ctx,w=this.width,h=this.height;c.save();if(this.shake>0){const s=this.shake*8;c.translate((Math.random()-.5)*s,(Math.random()-.5)*s);}
    c.clearRect(-20,-20,w+40,h+40);const bg=c.createLinearGradient(0,0,w,h);bg.addColorStop(0,'#080e20');bg.addColorStop(1,'#070a16');c.fillStyle=bg;c.fillRect(0,0,w,h);
    // subtle grid
    c.strokeStyle='rgba(65,105,160,.07)';c.lineWidth=1;for(let x=0;x<w;x+=42){c.beginPath();c.moveTo(x,0);c.lineTo(x,h);c.stroke()}for(let y=0;y<h;y+=42){c.beginPath();c.moveTo(0,y);c.lineTo(w,y);c.stroke()}
    for(const s of this.stars){s.tw+=.025;c.globalAlpha=.25+.5*(.5+.5*Math.sin(s.tw));c.fillStyle='#b9dfff';c.fillRect(s.x,s.y,s.z,s.z);s.y+=s.z*.12;if(s.y>h)s.y=0;}c.globalAlpha=1;
    // faint nebula
    const neb=c.createRadialGradient(w*.72,h*.35,5,w*.72,h*.35,w*.55);neb.addColorStop(0,'rgba(112,44,170,.11)');neb.addColorStop(1,'rgba(10,15,35,0)');c.fillStyle=neb;c.fillRect(0,0,w,h);
    for(const e of this.entities){if(e.type==='asteroid')this.drawAsteroid(e);else if(e.type==='alien')this.drawAlien(e);else if(e.type==='bullet')this.drawBullet(e);else this.drawCollectible(e);}
    for(const p of this.particles){const a=Math.max(0,p.life/p.max);if(p.text){c.globalAlpha=a;c.font='700 11px Orbitron, sans-serif';c.textAlign='center';c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=12;c.fillText(p.text,p.x,p.y);c.shadowBlur=0;}else{c.globalAlpha=a;c.fillStyle=p.color;c.shadowColor=p.color;c.shadowBlur=10;c.beginPath();c.arc(p.x,p.y,p.size*a,0,Math.PI*2);c.fill();c.shadowBlur=0;}}c.globalAlpha=1;
    this.drawPlayer();c.restore();
  }
  drawAsteroid(e){const c=this.ctx;c.save();c.translate(e.x,e.y);c.rotate(e.rot);c.shadowColor='#ff9b54';c.shadowBlur=9;c.beginPath();for(let i=0;i<e.points.length;i++){const a=i/e.points.length*Math.PI*2,r=e.r*e.points[i];const x=Math.cos(a)*r,y=Math.sin(a)*r;if(i===0)c.moveTo(x,y);else c.lineTo(x,y);}c.closePath();const rock=c.createRadialGradient(-e.r*.35,-e.r*.4,1,e.r*.15,e.r*.18,e.r*1.35);rock.addColorStop(0,'#82766e');rock.addColorStop(.38,'#514d50');rock.addColorStop(1,'#191d2c');c.fillStyle=rock;c.fill();c.strokeStyle='#c5a38a';c.lineWidth=1.4;c.stroke();c.shadowBlur=0;
    for(const pit of e.craters){const x=pit.x*e.r,y=pit.y*e.r,r=pit.r*e.r;const shade=c.createRadialGradient(x-r*.35,y-r*.4,1,x,y,r*1.5);shade.addColorStop(0,'#171b29');shade.addColorStop(.72,'#39383d');shade.addColorStop(1,'#a28b7d');c.fillStyle=shade;c.beginPath();c.arc(x,y,r,0,Math.PI*2);c.fill();}
    c.strokeStyle='rgba(255,190,137,.35)';c.lineWidth=1;c.beginPath();c.moveTo(-e.r*.58,-e.r*.28);c.lineTo(-e.r*.25,-e.r*.53);c.lineTo(e.r*.02,-e.r*.43);c.stroke();c.restore();}
  drawAlien(e){const c=this.ctx,color=e.kind==='boss'?'#ff4057':e.kind==='bruiser'?'#ffb020':e.kind==='rammer'?'#ff7b42':e.kind==='sniper'?'#ae7bff':'#ff63cf';c.save();
    if(e.kind==='rammer'&&e.chargeState==='tell'){c.globalAlpha=.3+.25*Math.sin(this.elapsed*24);c.strokeStyle='#ff7b42';c.lineWidth=2;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+Math.cos(e.aim)*260,e.y+Math.sin(e.aim)*260);c.stroke();c.globalAlpha=1;}
    if(e.kind==='sniper'&&e.lockTimer>0){c.globalAlpha=.25+.25*Math.sin(this.elapsed*30);c.strokeStyle='#ff4057';c.lineWidth=1.5;c.beginPath();c.moveTo(e.x,e.y);c.lineTo(e.x+Math.cos(e.aim)*Math.max(this.width,this.height),e.y+Math.sin(e.aim)*Math.max(this.width,this.height));c.stroke();c.globalAlpha=1;}
    c.translate(e.x,e.y+(e.kind==='boss'?0:Math.sin(e.phase)*2));c.shadowColor=color;c.shadowBlur=e.kind==='boss'?28:16;c.fillStyle=e.kind==='boss'?'#42162d':e.kind==='bruiser'?'#423224':'#301b42';c.strokeStyle=color;c.lineWidth=e.kind==='boss'?3:1.5;c.beginPath();c.ellipse(0,2,e.kind==='boss'?48: e.r,e.kind==='boss'?28:Math.max(8,e.r*.55),0,0,Math.PI*2);c.fill();c.stroke();
    if(e.kind==='boss'){c.fillStyle='#9b234c';c.beginPath();c.ellipse(0,-7,25,20,0,Math.PI,Math.PI*2);c.fill();c.stroke();c.fillStyle='#fff0ce';c.beginPath();c.ellipse(0,0,8,5,0,0,Math.PI*2);c.fill();c.fillStyle='#ff4057';c.beginPath();c.arc(0,0,3,0,Math.PI*2);c.fill();c.strokeStyle=color;c.lineWidth=3;c.beginPath();c.moveTo(-31,-5);c.lineTo(-48,-25);c.lineTo(-19,-18);c.moveTo(31,-5);c.lineTo(48,-25);c.lineTo(19,-18);c.stroke();}
    else {c.fillStyle=e.kind==='bruiser'?'#92714a':e.kind==='sniper'?'#6943a0':'#9d52d4';c.beginPath();c.ellipse(0,-3,e.kind==='bruiser'?14:9,e.kind==='bruiser'?11:8,0,Math.PI,Math.PI*2);c.fill();c.stroke();c.fillStyle='#ffb020';c.beginPath();c.ellipse(-6,2,2.2,1.4,0,0,Math.PI*2);c.ellipse(6,2,2.2,1.4,0,0,Math.PI*2);c.fill();if(e.kind==='bruiser'){c.strokeStyle='#d7b579';c.lineWidth=2;c.beginPath();c.moveTo(-e.r+4,3);c.lineTo(-e.r-5,-4);c.moveTo(e.r-4,3);c.lineTo(e.r+5,-4);c.stroke();}}
    c.restore();
    if(e.kind==='boss'&&e.attackTimer<.55){c.globalAlpha=.25+.35*Math.sin(this.elapsed*24);c.strokeStyle='#ff4057';c.lineWidth=2;c.beginPath();c.arc(e.x,e.y,e.r+9,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
    if(e.kind==='boss'||e.hp<e.maxHp){const w=e.kind==='boss'?104:34,y=e.y-e.r-(e.kind==='boss'?18:9);c.fillStyle='#140d1b';c.fillRect(e.x-w/2,y,w,4);c.fillStyle=color;c.fillRect(e.x-w/2,y,w*Math.max(0,e.hp/e.maxHp),4);}
  }
  drawBullet(e){const c=this.ctx;c.save();c.fillStyle=e.hostile?'#ff3cac':'#00f5ff';c.shadowColor=c.fillStyle;c.shadowBlur=13;c.beginPath();c.arc(e.x,e.y,e.r,0,Math.PI*2);c.fill();c.restore();}
  drawCollectible(e){const c=this.ctx,pulse=1+Math.sin(e.phase)*.13;c.save();c.translate(e.x,e.y);c.scale(pulse,pulse);const color=e.type==='orb'?'#00f5ff':'#a855f7';c.shadowColor=color;c.shadowBlur=18;c.strokeStyle=color;c.lineWidth=2;c.beginPath();if(e.type==='orb'){c.arc(0,0,e.r,0,Math.PI*2);}else{c.moveTo(0,-12);c.lineTo(11,0);c.lineTo(0,12);c.lineTo(-11,0);c.closePath();}c.stroke();c.fillStyle=color+'33';c.fill();c.shadowBlur=0;c.fillStyle='#fff';c.beginPath();c.arc(0,0,2.5,0,Math.PI*2);c.fill();c.restore();}
  drawPlayer(){const c=this.ctx,p=this.player;if(this.invuln>0&&Math.floor(this.invuln*12)%2===0)return;c.save();c.translate(p.x,p.y);c.rotate(p.angle);c.shadowColor='#00f5ff';c.shadowBlur=20;
    if(this.shield>0){c.strokeStyle='#a855f7';c.lineWidth=2;c.globalAlpha=.45+.3*Math.sin(this.elapsed*8);c.beginPath();c.arc(0,0,23,0,Math.PI*2);c.stroke();c.globalAlpha=1;}
    // engine
    c.fillStyle='#a855f7';c.shadowColor='#00f5ff';c.beginPath();c.moveTo(-4,10);c.lineTo(0,24+Math.random()*5);c.lineTo(4,10);c.fill();
    c.fillStyle='#baffff';c.strokeStyle='#00f5ff';c.lineWidth=1.5;c.beginPath();c.moveTo(0,-17);c.lineTo(11,12);c.lineTo(0,7);c.lineTo(-11,12);c.closePath();c.fill();c.stroke();
    c.fillStyle='#00b9cf';c.beginPath();c.moveTo(-8,8);c.lineTo(-17,14);c.lineTo(-8,13);c.fill();c.beginPath();c.moveTo(8,8);c.lineTo(17,14);c.lineTo(8,13);c.fill();
    if(this.weaponLevel){c.shadowColor='#ffb020';c.shadowBlur=12;c.fillStyle='#52566d';c.strokeStyle='#ffcf69';c.lineWidth=1;c.fillRect(-16,-2,5,13);c.strokeRect(-16,-2,5,13);c.fillRect(11,-2,5,13);c.strokeRect(11,-2,5,13);c.fillStyle='#ffb020';c.fillRect(-15,-6,3,7);c.fillRect(12,-6,3,7);if(this.weaponLevel>=2){c.fillStyle='#d7faff';c.fillRect(-21,3,5,11);c.fillRect(16,3,5,11);}if(this.weaponLevel>=3){c.fillStyle='#a855f7';c.fillRect(-5,-12,10,5);}}c.shadowBlur=0;c.restore();}
  formatTime(t){const m=Math.floor(t/60),s=Math.floor(t%60);return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}`;}
}
window.NeonRushGame=NeonRushGame;
