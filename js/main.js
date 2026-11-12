(() => {
 const $=id=>document.getElementById(id);
 const screens=['menuScreen','gameScreen','howScreen','settingsScreen'];
 const show=id=>screens.forEach(s=>$(s).classList.toggle('active',s===id));
 const canvas=$('gameCanvas');let game;
 const best=Number(localStorage.getItem('nr_best')||0);
 const pad=n=>String(Math.floor(n)).padStart(6,'0');
 $('menuBest').textContent=pad(best);$('bestValue').textContent=pad(best);
 const audio=window.audioEngine;
 function setSoundUI(){ $('soundIcon').textContent=audio.enabled?'♫':'♪';$('soundSetting').checked=audio.enabled;}
 setSoundUI();$('shakeSetting').checked=localStorage.getItem('nr_shake')!=='false';
 function toast(msg){const el=$('toast');el.textContent=msg;el.classList.add('show');setTimeout(()=>el.classList.remove('show'),900);}
 function startGame(){audio.init();audio.click();show('gameScreen');$('pauseOverlay').classList.add('hidden');$('gameOverOverlay').classList.add('hidden');game.resize();game.start();$('bestValue').textContent=pad(game.best);}
 function pause(){if(!game||!game.running)return;game.pause();$('pauseOverlay').classList.remove('hidden');audio.click();}
 function resume(){ $('pauseOverlay').classList.add('hidden');game.resume();audio.click();}
 function backHome(){game?.stop();$('pauseOverlay').classList.add('hidden');$('gameOverOverlay').classList.add('hidden');show('menuScreen');$('menuBest').textContent=pad(game?.best||Number(localStorage.getItem('nr_best')||0));}
 function gameOver(result){$('finalScore').textContent=pad(result.score);$('finalTime').textContent=game.formatTime(result.time);$('finalOrbs').textContent=result.orbs;$('finalNear').textContent=result.near;$('newRecord').classList.toggle('hidden',!result.isNew);$('gameOverOverlay').classList.remove('hidden');$('menuBest').textContent=pad(result.best);$('bestValue').textContent=pad(result.best);if(result.isNew)audio.record();}
 function updateHUD(g){$('scoreValue').textContent=pad(g.score);$('timeValue').textContent=g.formatTime(g.elapsed);$('bestValue').textContent=pad(g.best);$('levelValue').innerHTML=`0${g.level} <small>/ ${['LOW','RISING','ELEVATED','SEVERE','CRITICAL'][g.level-1]}</small>`;$('hearts').innerHTML=[0,1,2].map(i=>`<i class="${i>=g.health?'lost':''}">◆</i>`).join('');$('powerValue').textContent=g.shield>0?`MK-${g.weaponLevel} • SHIELD ${g.shield.toFixed(1)}s`:g.weaponLevel?`AUTO GUN • MK-${g.weaponLevel}`:g.powerTimer>0?'BOOST ACTIVE':'STANDBY';const boss=g.entities.find(e=>e.type==='alien'&&e.kind==='boss');$('statusMessage').textContent=boss?'BOSS HULL '+Math.ceil(boss.hp/boss.maxHp*100)+'%':g.bossTimer<28?'BOSS APPROACH IN '+Math.ceil(g.bossTimer)+'s':g.elapsed<30?'ALIEN CONTACT IN '+Math.ceil(30-g.elapsed)+'s':'HOSTILE CONTACTS ACTIVE';}
 game=new NeonRushGame(canvas,{pause,gameOver, hud:updateHUD});
 $('playBtn').onclick=startGame;$('manualPlayBtn').onclick=startGame;$('againBtn').onclick=startGame;
 $('howBtn').onclick=()=>{show('howScreen');audio.click();};$('closeHow').onclick=()=>show('menuScreen');
 $('pauseBtn').onclick=pause;$('resumeBtn').onclick=resume;$('restartBtn').onclick=startGame;$('quitBtn').onclick=backHome;
 $('homeBtn').onclick=backHome;$('closeSettings').onclick=()=>show('menuScreen');
 $('soundToggle').onclick=()=>{audio.toggle(!audio.enabled);setSoundUI();if(audio.enabled)audio.click();};
 $('soundSetting').onchange=e=>{audio.toggle(e.target.checked);setSoundUI();};
 $('shakeSetting').onchange=e=>{game.shakeEnabled=e.target.checked;localStorage.setItem('nr_shake',String(e.target.checked));};
 // Settings accessible from the brand by keyboard shortcut; add a discreet menu action.
 const settingsBtn=document.createElement('button');settingsBtn.className='text-btn settings-link';settingsBtn.textContent='SYSTEM SETTINGS';settingsBtn.style.cssText='position:absolute;right:0;bottom:53px;margin:0';settingsBtn.onclick=()=>{show('settingsScreen');audio.click();};$('menuScreen').appendChild(settingsBtn);
 window.addEventListener('keydown',e=>{if(e.key==='Escape'&&$('howScreen').classList.contains('active'))show('menuScreen');});
 $('statusMessage').textContent='STAY SHARP, PILOT.';
})();
