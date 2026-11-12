class AudioEngine {
  constructor(){this.ctx=null;this.enabled=localStorage.getItem('nr_sound')!=='false';}
  init(){if(!this.ctx){const C=window.AudioContext||window.webkitAudioContext;if(C)this.ctx=new C();}if(this.ctx?.state==='suspended')this.ctx.resume();}
  tone(freq=440,duration=.08,type='sine',volume=.035,slide=0){
    if(!this.enabled)return;this.init();if(!this.ctx)return;
    const o=this.ctx.createOscillator(),g=this.ctx.createGain(),now=this.ctx.currentTime;
    o.type=type;o.frequency.setValueAtTime(freq,now);if(slide)o.frequency.exponentialRampToValueAtTime(Math.max(30,freq+slide),now+duration);
    g.gain.setValueAtTime(volume,now);g.gain.exponentialRampToValueAtTime(.001,now+duration);
    o.connect(g);g.connect(this.ctx.destination);o.start(now);o.stop(now+duration);
  }
  pickup(){this.tone(620,.08,'sine',.035,250);setTimeout(()=>this.tone(920,.12,'sine',.025,120),55)}
  evolve(level=1){this.tone(380,.14,'triangle',.04,220);setTimeout(()=>this.tone(650+level*90,.22,'sine',.035,300),100)}
  shoot(){this.tone(760,.055,'square',.014,-350)}
  alien(){this.tone(240,.22,'sawtooth',.025,180)}
  ram(){this.tone(180,.18,'sawtooth',.025,260)}
  boss(){this.tone(110,.45,'sawtooth',.05,-45);setTimeout(()=>this.tone(165,.4,'triangle',.04,-70),170)}
  blast(){this.tone(190,.12,'triangle',.025,-100)}
  hit(){this.tone(150,.22,'sawtooth',.06,-90)}
  shield(){this.tone(320,.25,'triangle',.04,550)}
  click(){this.tone(420,.045,'square',.018,80)}
  over(){this.tone(260,.5,'sawtooth',.045,-190)}
  record(){this.tone(540,.13,'triangle',.035,280);setTimeout(()=>this.tone(810,.2,'triangle',.035,300),130)}
  toggle(v){this.enabled=v;localStorage.setItem('nr_sound',String(v));}
}
window.audioEngine=new AudioEngine();
