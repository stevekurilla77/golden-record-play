// Pale Blue: Crystal Defenders (repo: golden-record). (c) 2026 Backline Vintage. PRIVATE. Original art drawn in code.
(()=>{
'use strict';
const W=640,H=360,cv=document.getElementById('c');let g=cv.getContext('2d');
const Q=new URLSearchParams(location.search),AUTO=Q.has('auto');
let scale=1,isPad=false;
function resize(){const w=innerWidth,h=innerHeight;scale=Math.min(w/W,h/H);const dpr=Math.min(devicePixelRatio||1,2);
 cv.width=Math.round(W*scale*dpr);cv.height=Math.round(H*scale*dpr);cv.style.width=W*scale+'px';cv.style.height=H*scale+'px';
 cv.style.left=(w-W*scale)/2+'px';cv.style.top=(h-H*scale)/2+'px';isPad=Math.min(w,h)>=700;}
addEventListener('resize',resize);resize();
// ---------- audio: original procedural score + SFX (Web Audio) ----------
let AC=null,master=null,musG=null,sfxG=null,NOISE=null,music=null,curTheme=null,wantTheme=null;
const VOL={mus:1,sfx:1};try{const v=JSON.parse(localStorage.getItem('gr_vol')||'{}');if(v.mus!=null)VOL.mus=v.mus;if(v.sfx!=null)VOL.sfx=v.sfx;}catch(e){}
function saveVol(){try{localStorage.setItem('gr_vol',JSON.stringify(VOL));}catch(e){}if(musG){musG.gain.value=VOL.mus*.55;sfxG.gain.value=VOL.sfx*.9;}}
function unlock(){if(!AC){try{AC=new (window.AudioContext||window.webkitAudioContext)();master=AC.createGain();master.gain.value=.6;
  const comp=AC.createDynamicsCompressor();master.connect(comp);comp.connect(AC.destination);musG=AC.createGain();sfxG=AC.createGain();musG.connect(master);sfxG.connect(master);saveVol();
  NOISE=AC.createBuffer(1,AC.sampleRate,AC.sampleRate);const d=NOISE.getChannelData(0);for(let i=0;i<d.length;i++)d[i]=Math.random()*2-1;
  const b=AC.createBufferSource();b.buffer=AC.createBuffer(1,1,22050);b.connect(AC.destination);b.start(0);// iOS unlock
 }catch(e){}}
 if(AC&&AC.state!=='running'&&!BGP){try{AC.resume().catch(()=>{});}catch(e){}silentTick();}htmlKeepAlive();if(AC&&wantTheme&&!music&&!BGP)startMusic(...wantTheme);if(AC&&!AC._sc){AC._sc=1;AC.onstatechange=()=>{if(AC&&AC.state!=='running'&&!document.hidden&&!BGP)setTimeout(audioResume,300);};}}
// iOS Safari unlock helpers: 1-sample silent buffer on every unlock attempt; 'playback' audio session so the
// ring/silent switch doesn't mute the game; a silent looping <audio> started on the first gesture keeps the
// media channel alive (skipped inside the Capacitor app, which already plays through the app's audio session).
function silentTick(){try{const b=AC.createBufferSource();b.buffer=AC.createBuffer(1,1,22050);b.connect(AC.destination);b.start(0);}catch(e){}}
try{if(navigator.audioSession)navigator.audioSession.type='playback';}catch(e){}
let SIL=null;function htmlKeepAlive(){if(BGP||window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())return;try{if(!SIL){const n=4410,buf=new ArrayBuffer(44+n*2),v=new DataView(buf),w=(o,s)=>{for(let i=0;i<s.length;i++)v.setUint8(o+i,s.charCodeAt(i));};
 w(0,'RIFF');v.setUint32(4,36+n*2,true);w(8,'WAVE');w(12,'fmt ');v.setUint32(16,16,true);v.setUint16(20,1,true);v.setUint16(22,1,true);v.setUint32(24,44100,true);v.setUint32(28,88200,true);v.setUint16(32,2,true);v.setUint16(34,16,true);w(36,'data');v.setUint32(40,n*2,true);
 SIL=new Audio(URL.createObjectURL(new Blob([buf],{type:'audio/wav'})));SIL.loop=true;SIL.setAttribute('playsinline','');SIL.volume=.01;}if(SIL.paused){const pr=SIL.play();pr&&pr.catch&&pr.catch(()=>{});}}catch(e){}}
let AUDTRY=0,NEEDREB=false;window.__aud={ev:'',n:0,reb:0,err:''};
function gestureAudio(e){__aud.ev=e.type;__aud.n++;if(BGP&&!document.hidden){BGP=false;}if(BGP)return;
 const real=e.type==='touchend'||e.type==='pointerup'||e.type==='click'||e.type==='keydown';
 // iOS only honours resume()/new AudioContext() on a gesture END; if a context is stuck (created on touchstart, interrupted, or flagged by the resume watchdog) recreate it right here, inside the gesture
 if(real&&AC&&(NEEDREB||(AC.state!=='running'&&AUDTRY>=1))){NEEDREB=false;AUDTRY=0;__aud.reb++;const old=AC;AC=null;master=musG=sfxG=NOISE=null;if(music){clearInterval(music);music=null;}curTheme=null;try{old.close&&old.close();}catch(x){}}
 if(real||!AC)unlock();if(real&&AC&&AC.state!=='running')AUDTRY++;else if(AC&&AC.state==='running')AUDTRY=0;}
['touchend','pointerup','click','keydown','touchstart','pointerdown'].forEach(ev=>addEventListener(ev,gestureAudio,{capture:true,passive:true}));
function tone(f,t0,d,type='square',v=.12,f2,dest){if(!AC)return;const o=AC.createOscillator(),a=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);
 if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);a.gain.setValueAtTime(.0001,t0);a.gain.linearRampToValueAtTime(v,t0+.008);a.gain.exponentialRampToValueAtTime(.0005,t0+d);o.connect(a);a.connect(dest||sfxG);o.start(t0);o.stop(t0+d+.03);}
function noise(t0,d,v,fType='lowpass',f=1200,f2,dest){if(!AC)return;const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),a=AC.createGain();s.buffer=NOISE;fl.type=fType;fl.frequency.setValueAtTime(f,t0);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+d);
 a.gain.setValueAtTime(v,t0);a.gain.exponentialRampToValueAtTime(.0005,t0+d);s.connect(fl);fl.connect(a);a.connect(dest||sfxG);s.start(t0,Math.random()*.5);s.stop(t0+d+.02);}
const mf=n=>440*Math.pow(2,(n-69)/12);
let lastSfx={};
function sfx(n){if(n==='boom'||n==='bigboom')SHAKE=Math.max(SHAKE,n==='bigboom'?.5:.3);if(n==='hurt')SHAKE=Math.max(SHAKE,.18);if(!AC||!VOL.sfx)return;const t=AC.currentTime;
 if(lastSfx[n]&&t-lastSfx[n]<.035)return;lastSfx[n]=t;// throttle for performance
 if(n==='shot'){tone(1400,t,.09,'square',.07,320);tone(700,t,.07,'sawtooth',.045,200);noise(t,.04,.05,'highpass',3000);}
 else if(n==='charge'){tone(300,t,.35,'sawtooth',.07,1200);tone(1800,t+.05,.25,'square',.04,400);}
 else if(n==='hit'){tone(240,t,.08,'square',.06,80);noise(t,.05,.06,'highpass',2000);}
 else if(n==='jump')tone(280,t,.2,'triangle',.12,760);
 else if(n==='land'){tone(110,t,.12,'sine',.18,50);noise(t,.1,.08,'lowpass',500);}
 else if(n==='boom'){noise(t,.45,.22,'lowpass',1800,120);tone(110,t,.4,'sine',.2,30);}
 else if(n==='bigboom'){noise(t,1.1,.3,'lowpass',2400,80);tone(80,t,1,'sine',.25,22);noise(t+.12,.6,.15,'bandpass',600,150);}
 else if(n==='pick'){[0,4,7,12].forEach((k,i)=>tone(mf(76+k),t+i*.055,.12,'square',.06));}
 else if(n==='power'){[0,7,12,16,19].forEach((k,i)=>tone(mf(72+k),t+i*.05,.16,'triangle',.09));tone(mf(96),t+.25,.3,'sine',.05);}
 else if(n==='blip')tone(620,t,.05,'square',.04);
 else if(n==='hurt'){tone(420,t,.25,'sawtooth',.1,90);noise(t,.15,.08,'bandpass',900);}
 else if(n==='ramp'){tone(160,t,1.3,'sawtooth',.035,330);tone(162,t,1.3,'square',.02,335);noise(t+1.25,.12,.08,'lowpass',400);}
 else if(n==='beep')tone(1046,t,.14,'sine',.12);else if(n==='beep2')tone(1568,t,.5,'sine',.14);
 else if(n==='ignite'){noise(t,3.2,.3,'lowpass',200,1400);noise(t,3,.12,'bandpass',90,300);tone(55,t,3,'sawtooth',.06,40);}
 else if(n==='rumble')noise(t,2.2,.18,'lowpass',300,120);
 else if(n==='warn'){for(let i=0;i<3;i++){tone(880,t+i*.3,.14,'square',.06);tone(660,t+i*.3+.15,.14,'square',.06);}}
 else if(n==='near')noise(t,.18,.08,'bandpass',3000,800);
 else if(n==='whoosh')noise(t,.6,.12,'bandpass',400,3000);
 else if(n==='stinger'){[0,7,12].forEach(k=>tone(mf(55+k),t,1.2,'sawtooth',.05));noise(t,.4,.12,'lowpass',3000,200);tone(mf(43),t,1.2,'sine',.15);}}
// Captain motif hits for the comic: each pilot gets an original 4-note figure
const CAPMOTIF=[[0,4,7,11],[0,7,9,14],[0,3,7,10],[0,5,9,12]];
function capHit(i){if(!AC||!VOL.mus)return;const t=AC.currentTime,r=[62,64,57,60][i];CAPMOTIF[i].forEach((k,j)=>{tone(mf(r+k),t+j*.09,.5,j%2?'square':'triangle',.07,null,musG);});tone(mf(r-24),t,.8,'sine',.16,null,musG);noise(t,.25,.1,'highpass',5000,null,musG);}
// Themes: all motifs are original. Steps are 16ths; lead uses scale degrees (null = rest).
const SC={min:[0,2,3,5,7,8,10],maj:[0,2,4,5,7,9,11],dor:[0,2,3,5,7,9,10],phr:[0,1,3,5,7,8,10],lyd:[0,2,4,6,7,9,11],mix:[0,2,4,5,7,9,10]};
const _=null;
// v7 score (all original). style 'hero' = triumphant major-key action (opening, flight, space bosses, victory);
// style 'spook' = per-planet surface music: minor/modal, drones, eerie pads, echoing sparse lead, but a driving 120-140 BPM pulse.
// lead: scale degrees per 16th (null = rest). mod: semitones added on each 8-bar section (key changes / build-ups).
const THEMES={
 title:{style:'hero',bpm:140,root:50,sc:'maj',prog:[0,4,5,3],mod:[0,0,2,2],lead:[0,_,_,4,_,_,7,_,_,_,9,_,7,_,_,_,8,_,_,7,_,4,_,_,5,_,7,_,_,_,_,_]},
 comic:{style:'hero',cine:1,bpm:138,root:46,sc:'maj',prog:[0,5,3,4],mod:[0,2,4,5],lead:[0,_,_,_,4,_,_,_,7,_,_,_,_,_,_,_,8,_,_,_,7,_,_,_,9,_,_,_,11,_,_,_]},
 launch:{style:'hero',cine:1,bpm:150,root:48,sc:'maj',prog:[0,3,4,4],mod:[0,2,2,5],lead:[0,_,4,_,7,_,_,_,11,_,9,_,7,_,_,_,8,_,9,_,11,_,_,_,14,_,_,_,11,_,_,_]},
 space:{style:'hero',bpm:148,root:45,sc:'maj',prog:[0,5,3,4],mod:[0,0,2,0],lead:[0,_,_,4,7,_,_,_,6,_,4,_,7,_,_,_,0,_,_,4,7,_,11,_,9,_,7,_,_,_,_,_],alt:[[7,_,_,6,4,_,_,_,5,_,7,_,9,_,_,_,11,_,9,_,7,_,4,_,7,_,_,_,_,_,_,_],[0,_,4,_,7,_,11,_,12,_,_,_,11,_,9,_,7,_,_,8,9,_,_,_,11,_,12,_,14,_,_,_]]},
 boss:{style:'hero',boss:1,bpm:160,root:44,sc:'mix',prog:[0,6,5,6],mod:[0,1,0,3],lead:[0,_,0,4,_,7,_,_,6,_,7,_,4,_,3,_,0,_,0,4,_,7,_,11,_,10,_,9,7,_,_,_]},
 victory:{style:'hero',fan:1,bpm:138,root:50,sc:'maj',prog:[0,3,4,0],mod:[0,0,2,2],lead:[0,_,0,_,4,_,7,_,_,_,11,_,12,_,_,_,9,_,9,_,11,_,12,_,14,_,_,_,_,_,_,_]},
 moon:{style:'spook',bpm:126,root:45,sc:'phr',prog:[0,0,1,6],drone:0,tex:'ghost',lead:[7,_,_,_,_,_,8,_,_,_,_,_,_,_,_,_,4,_,_,_,3,_,_,_,_,_,_,_,1,_,_,_]},
 moonboss:{style:'spook',boss:1,bpm:138,root:44,sc:'phr',prog:[0,1,0,6],drone:0,tex:'ghost',lead:[0,_,7,_,8,_,7,_,_,_,4,_,3,_,1,_,0,_,7,_,8,_,10,_,_,_,8,_,7,_,_,_]},
 mars:{style:'spook',bpm:130,root:46,sc:'min',prog:[0,5,6,4],drone:7,tex:'wind',lead:[0,_,_,_,6,_,_,_,_,_,5,_,_,_,_,_,3,_,_,_,_,_,2,_,_,_,_,_,0,_,_,_]},
 jupiter:{style:'spook',bpm:122,root:41,sc:'dor',prog:[0,3,0,6],drone:0,tex:'storm',lead:[4,_,_,_,_,_,_,_,5,_,_,_,9,_,_,_,_,_,_,_,7,_,_,_,6,_,_,_,_,_,_,_]},
 asteroid:{style:'spook',bpm:132,root:43,sc:'min',prog:[0,6,5,6],drone:0,tex:'ghost',lead:[0,_,_,_,3,_,_,_,_,_,7,_,_,_,6,_,_,_,_,_,3,_,_,_,_,_,_,_,_,_,_,_]}};
const MUS={intensity:0};
function brass(f,t,d,v,D){tone(f,t,d,'sawtooth',v,null,D);tone(f*1.006,t,d,'sawtooth',v*.8,null,D);tone(f/2,t,d,'triangle',v*1.4,null,D);}
function startMusic(kind,v=0){if(kind==='game')kind=S==='moon'?(mission===4?'mars':'moon'):'space';if(kind==='boss'&&S==='moon'&&mission!==4)kind='moonboss';wantTheme=[kind,v];if(!AC)return;if(music&&curTheme===kind+v)return;stopMusic();curTheme=kind+v;wantTheme=[kind,v];
 const th=THEMES[kind]||THEMES.space,sc=SC[th.sc],base=th.root+(th.style==='hero'&&!th.cine?[0,2,5,3][v%4]:0),spd=60/(th.bpm+(th.style==='hero'?v*4:0))/4;let step=0,next=AC.currentTime+.06;
 const deg=d=>sc[((d%7)+7)%7]+12*Math.floor(d/7),lead=v&&th.alt?th.alt[(v-1)%th.alt.length]:th.lead;
 music=setInterval(()=>{if(!AC||AC.state!=='running')return;while(next<AC.currentTime+.25){const D=musG,lvl=th.cine?Math.max(1,MUS.intensity):3,t=next;
  const bar=Math.floor(step/16),s16=step%16,sec=Math.floor(bar/8),c=th.prog[bar%th.prog.length],root=base+(th.mod?th.mod[sec%th.mod.length]:0),L=lead[step%lead.length],b8=bar%8;
  if(th.style==='hero'){
   // pad + big chord stabs
   if(s16===0)[0,2,4].forEach(k=>tone(mf(root+12+deg(c+k)),t,spd*16,'triangle',.03,null,D));
   if(lvl>=2&&(s16===0||s16===6||(th.boss&&s16===10)||(b8===7&&s16===12)))[0,2,4,7].forEach(k=>tone(mf(root+12+deg(c+k)),t,spd*1.6,'sawtooth',.022,null,D));
   // punchy bass ostinato on 8ths
   if(lvl>=1&&s16%2===0){const o=[0,0,12,0,7,0,12,10][(s16>>1)];tone(mf(root-12+deg(c)+o),t,spd*1.5,'square',.05,null,D);tone(mf(root-24+deg(c)),t,spd*1.6,'triangle',.12,null,D);}
   // heroic brass lead (only on its notes; cine scenes bring it in as intensity rises)
   if(L!==null&&lvl>=2&&!(th.fan&&bar%4===3))brass(mf(root+24+deg(L)),t,spd*2.4,.022,D);
   if(v>=2&&step%2===1&&lvl>=3)tone(mf(root+36+deg(c+[0,2,4,7][(step>>1)%4])),t,spd*.9,'square',.01,null,D);
   // drums: kick/snare backbeat, 16th hats, tom fill on bar 4, snare roll build-up before each key change
   const k=s16===0||s16===8||(th.boss&&(s16===3||s16===11))||(s16===10&&bar%2);if(k)tone(110,t,.16,'sine',lvl>=1?.3:.2,38,D);
   if(lvl>=2&&(s16===4||s16===12)){noise(t,.14,.13,'bandpass',1900,null,D);tone(190,t,.08,'triangle',.08,120,D);}
   if(lvl>=3)noise(t,.025,s16%4===2?.035:.02,'highpass',8500,null,D);
   if(lvl>=2&&bar%4===3&&s16>=12)tone([220,180,150,120][s16-12],t,.14,'sine',.16,70,D);
   if(lvl>=2&&b8===7&&s16>=8)noise(t,.06,.04+.01*(s16-8),'bandpass',2200,null,D);
   if(lvl>=2&&bar%8===0&&s16===0)noise(t,1.2,.06,'highpass',5000,null,D);
  }else{
   // spooky surface: low drone + eerie detuned pad
   if(bar%2===0&&s16===0){tone(mf(root-24+deg(th.drone)),t,spd*32,'sine',.09,null,D);tone(mf(root-12+deg(th.drone)),t,spd*32,'triangle',.02,null,D);}
   if(s16===0){[0,2,4].forEach(k=>{const f=mf(root+12+deg(c+k));tone(f,t,spd*16,'triangle',.014,null,D);tone(f*1.012,t,spd*16,'sine',.012,null,D);});if(bar%4===2)tone(mf(root+18),t,spd*12,'sine',.01,null,D);}
   // muted driving bass ostinato on 8ths (never a slow pulse)
   if(s16%2===0){const o=[0,0,12,0,1,0,12,7][(s16>>1)];tone(mf(root-12+deg(c)+o),t,spd*.9,'triangle',.11,null,D);}
   // sparse echoing lead: note + two quieter dotted-8th repeats
   if(L!==null)for(let e=0;e<3;e++)tone(mf(root+24+deg(L)),t+e*spd*3,spd*2.5,'sine',.045/(1+e*1.6),null,D);
   // tight hats / toms / light kick
   noise(t,.018,s16%4===2?.022:.012,'highpass',9000,null,D);
   if(s16===0||s16===10||(th.boss&&(s16===6||s16===13)))tone(95,t,.13,'sine',.2,40,D);
   if(s16===4||s16===12)noise(t,.06,th.boss?.08:.045,'bandpass',2600,null,D);
   if(s16===7||s16===15&&bar%2)tone(s16===7?150:120,t,.12,'sine',.08,90,D);
   if(th.boss&&s16%4===0)[0,1].forEach(k=>tone(mf(root+deg(c)+k*6),t,spd*.8,'sawtooth',.012,null,D));
   // occasional unsettling textures
   if(bar%8===5&&s16===0){if(th.tex==='ghost'){tone(mf(root+40),t,spd*12,'sine',.012,mf(root+33),D);tone(mf(root+41),t+spd*2,spd*10,'sine',.008,mf(root+34),D);}else if(th.tex==='wind')noise(t,spd*14,.03,'bandpass',300,1800,D);else noise(t,spd*10,.05,'lowpass',200,80,D);}
   if(bar%16===11&&s16===8)noise(t,spd*6,.03,'bandpass',4000,500,D);
  }
  step++;next+=spd;}},90);}
function stopMusic(){if(music)clearInterval(music);music=null;curTheme=null;}
let BGP=false,PAUSEBG=false;
function audioSuspend(){try{SIL&&SIL.pause();}catch(e){}if(S==='space'||S==='moon')PAUSEBG=true;BGP=true;if(music){clearInterval(music);music=null;curTheme=null;}if(AC&&AC.state==='running')AC.suspend().catch(()=>{});}
function rebuildAudio(){const old=AC;AC=null;master=musG=sfxG=NOISE=null;music=null;curTheme=null;try{old&&old.close&&old.close();}catch(e){}unlock();}
function audioResume(){BGP=false;if(!AC)return;const after=()=>{if(wantTheme&&!music){curTheme=null;startMusic(...wantTheme);}};if(AC.state==='running'){after();return;}
 let done=false;const fail=()=>{if(done)return;done=true;if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())rebuildAudio();else NEEDREB=true;};
 try{AC.resume().then(()=>{setTimeout(()=>{if(done)return;if(AC&&AC.state==='running'){done=true;after();}else fail();},250);}).catch(fail);}catch(e){fail();}setTimeout(()=>{if(!done&&AC&&AC.state!=='running')fail();},1500);}
document.addEventListener('visibilitychange',()=>{document.hidden?audioSuspend():audioResume();});
addEventListener('pagehide',audioSuspend);addEventListener('pageshow',()=>{if(!document.hidden)audioResume();});addEventListener('focus',()=>{if(!document.hidden)audioResume();});
try{const CA=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;if(CA&&CA.addListener){CA.addListener('pause',audioSuspend);CA.addListener('resume',audioResume);}}catch(e){}
// ---------- input ----------
const K={};let pressedA=false,pressedAny=false;
addEventListener('keydown',e=>{unlock();if(!K[e.code]){if(['Space','KeyZ','ArrowUp','KeyW'].includes(e.code))pressedA=true;pressedAny=true;}K[e.code]=true;
 if(['Space','ArrowUp','ArrowDown','ArrowLeft','ArrowRight'].includes(e.code))e.preventDefault();});
addEventListener('keyup',e=>{K[e.code]=false;});addEventListener('keydown',e=>{if((e.code==='KeyP'||e.code==='Escape')&&!e.repeat&&!PAUSEM&&inLevel()&&!GOVER){PAUSEREQ=1;K.Escape=false;}});
const touches=new Map();let tapQueued=null;
function btns(){const s=isPad?1.35:1,r=34*s,m=14;return{
 left:{x:m+r,y:H-m-r,r},right:{x:m+r*3.2,y:H-m-r,r},
 jump:{x:W-m-r,y:H-m-r-r*.3,r},shoot:{x:W-m-r*3.3,y:H-m-r,r},
 up:{x:m+r*2.1,y:H-m-r*3.1,r:r*.75},sl:{x:m+r*.95,y:H-m-r*2.2,r:r*.72},sr:{x:m+r*3.75,y:H-m-r*2.2,r:r*.72},su:{x:m+r*2.35,y:H-m-r*3.6,r:r*.72},sd:{x:m+r*2.35,y:H-m-r*.8,r:r*.72},skip:{x:W-50,y:22,r:20}};}
function toGame(t){const b=cv.getBoundingClientRect();return{x:clamp((t.clientX-b.left)/scale,0,W),y:clamp((t.clientY-b.top)/scale,0,H)};}
function onT(e){e.preventDefault();unlock();for(const t of e.changedTouches){const p=toGame(t);
 if(e.type==='touchstart'){p.z=onPauseBtn(p)?'pause':moonZone(p);if(p.z==='pause'){touches.set(t.identifier,p);TST[t.identifier]=performance.now();PAUSEREQ=1;continue;}touches.set(t.identifier,p);TST[t.identifier]=performance.now();pressedAny=true;const b=btns();if(p.z!=null?p.z==='jump':Math.hypot(p.x-b.jump.x,p.y-b.jump.y)<b.jump.r*1.3)pressedA=true;}
 else if(e.type==='touchmove'){const o=touches.get(t.identifier);{const oz=o&&o.z;if(oz==='shoot'||oz==='jump'||oz==='pause'){p.z=oz;}else{const z=moonZone(p);p.z=z!=null&&z!=='shoot'&&z!=='jump'&&(z||S==='space')?z:oz;}}/* buttons stay anchored to where the finger landed; only arrows/D-pad slide */touches.set(t.identifier,p);}
 else{touches.delete(t.identifier);p.st=TST[t.identifier]||performance.now();delete TST[t.identifier];tapQueued=p;}}}
const TST={};
['touchstart','touchmove','touchend','touchcancel'].forEach(n=>document.addEventListener(n,onT,{passive:false}));// whole screen incl. letterbox bars, so a thumb just off the canvas still counts
// mouse for desktop (pointer, not click)
let mouse=null;cv.addEventListener('pointerdown',e=>{if(e.pointerType==='touch')return;unlock();mouse=toGame(e);pressedAny=true;});
addEventListener('pointerup',e=>{if(e.pointerType==='touch')return;if(mouse)tapQueued=mouse;mouse=null;});
let showTouch='ontouchstart' in window||Q.has('touch');
const VK={};// virtual keys set by autopilot
// Moon platformer: big invisible zones (left third split into ◀/▶ with ▲ above, right side split shoot/jump with jump the larger lower-right). Each finger is anchored per identifier.
// Space flight: whole left side is a virtual D-pad around the drawn pad (8-way, small deadzone); whole lower-right is FIRE.
function spaceZone(p){const b=btns();if(p.y<H*.3)return null;if(p.x>W*.55)return 'shoot';if(p.x>W*.45)return null;
 const cx=b.sd.x,cy=(b.su.y+b.sd.y)/2,dx=p.x-cx,dy=p.y-cy,d=Math.hypot(dx,dy);if(d<b.sd.r*.35)return '';let z='';if(dx<-d*.38)z+=' sl';if(dx>d*.38)z+=' sr';if(dy<-d*.38)z+=' su';if(dy>d*.38)z+=' sd';return z;}
// ---- in-level PAUSE button (top bar, between progress/tips and score; clear of notch, controls and HUD text) ----
let PAUSEM=null,PAUSEREQ=0;const PB={x:508,y:17,r:12};
function inLevel(){return (S==='space'&&sp&&!sp.cut)||(S==='moon'&&M&&!M.cut);}
function onPauseBtn(p){return inLevel()&&!GOVER&&!PAUSEM&&!CRY&&Math.hypot(p.x-PB.x,p.y-PB.y)<PB.r+8;}
function drawPauseBtn(){if(!inLevel()||PAUSEM||GOVER)return;circ(PB.x,PB.y,PB.r+1.5,OL);circ(PB.x,PB.y,PB.r,'rgba(28,42,106,.9)');g.fillStyle='#fff';g.fillRect(PB.x-5,PB.y-6,3.5,12);g.fillRect(PB.x+1.5,PB.y-6,3.5,12);}
function openPause(){PAUSEM={t:0,how:0,conf:0,at:performance.now()};if(musG&&AC)musG.gain.setTargetAtTime(VOL.mus*.55*.25,AC.currentTime,.05);sfx('blip');}
function closePause(){PAUSEM=null;saveVol();}
function pauseMenu(){const P=PAUSEM;P.t+=DT;g.fillStyle='rgba(6,4,20,.8)';g.fillRect(0,0,W,H);const bx=W/2-130,bw=260;
 panel(bx-10,40,bw+20,282,'#45d6ff');sfxText('PAUSED',W/2,62,24,P.t,-.04);
 const rows=P.how?[]:P.conf?[['QUIT TO TITLE?',0],['YES, QUIT','yes'],['NO, KEEP PLAYING','no']]:[['RESUME ▶','res'],['MUSIC '+vlab(VOL.mus),'mus'],['SOUND FX '+vlab(VOL.sfx),'sfx'],[(VOL.mus||VOL.sfx)?'MUTE ALL':'UNMUTE','mute'],['HOW TO PLAY','how'],['QUIT TO TITLE','quit']];
 rows.forEach((r,i)=>{const y=96+i*36;if(r[1]){panel(bx,y-14,bw,28,r[1]==='res'||r[1]==='no'?'#5fe36a':r[1]==='quit'||r[1]==='yes'?'#ff4f7b':'#3a4180');}txt(r[0],W/2,y,11,'#ffffff');});
 if(P.how){const L=S==='space'?['Left side of the screen steers Pale Blue.','FIRE: hold the lower right to blast.','Tokens: S shield, F force field, R rapid, W spread.','Beat the last boss to win its Crystal Key.']:['Left side walks. Up arrow climbs.','JUMP: lower right. Hold for a higher jump.','FIRE: next to JUMP. Blast the blobs.','Bosses guard Crystal Keys. 5 gems = 1-up!'];
  L.forEach((l,i)=>txt(l,W/2,104+i*30,9.5,'#ffffff'));panel(bx,252,bw,28,'#5fe36a');txt('BACK',W/2,266,11,'#ffffff');}
 {const tx=546;panel(tx-44,40,88,282,'#b04aff');txt('CRYSTAL',tx,54,8,'#e8d0ff');txt('TRACKER',tx,66,8,'#e8d0ff');for(let i=1;i<=6;i++){const y=88+(i-1)*36,on=!!SHARDS[i];g.fillStyle='rgba(10,12,40,.85)';g.strokeStyle=on?SHCOL[i]:'#4a4a7a';g.lineWidth=2;g.beginPath();g.arc(tx-14,y,13,0,TAU);g.fill();g.stroke();if(on)heartShard(tx-14,y,.42,SHCOL[i],.5);else txt('?',tx-14,y+1,10,'#6a6a9a');txt(i<=4?'M'+i:'??',tx+18,y,8,on?'#ffe066':'#6a6a9a');}txt(Object.keys(SHARDS).length+' FOUND',tx,306,8,'#ffffff');}
 const tp=tapped();if(K.Escape&&!P.esc){P.esc=1;}if(!K.Escape&&P.esc===1){P.esc=0;closePause();return;}
 if(!tp||P.t<.25||(tp.st&&tp.st<P.at))return;sfx('blip');
 if(P.how){if(tp.y>238&&tp.y<294)P.how=0;return;}
 const i=Math.round((tp.y-96)/36);if(tp.x<bx||tp.x>bx+bw||i<0||i>=rows.length||Math.abs(tp.y-(96+i*36))>15)return;const k=rows[i][1];
 const nx=v=>VSTEP[(VSTEP.indexOf(v)+1)%VSTEP.length]??1;
 if(k==='res'||k==='no'){if(k==='no')P.conf=0;else closePause();}else if(k==='mus'){VOL.mus=nx(VOL.mus);saveVol();if(musG&&AC)musG.gain.value=VOL.mus*.55*.25;}else if(k==='sfx'){VOL.sfx=nx(VOL.sfx);saveVol();sfx('shot');}
 else if(k==='mute'){toggleMute();if(musG&&AC)musG.gain.value=VOL.mus*.55*.25;}else if(k==='how')P.how=1;else if(k==='quit')P.conf=1;else if(k==='yes'){PAUSEM=null;saveVol();stopMusic();go('title');}}
function moonZone(p){if(S==='space')return spaceZone(p);if(S!=='moon')return null;const b=btns();if(p.y<H*.3)return null;
 if(p.x<W*.42){if(Math.hypot(p.x-b.up.x,p.y-b.up.y)<b.up.r*1.6)return 'up';if(p.y<H*.42)return null;return p.x<(b.left.x+b.right.x)/2?'left':'right';}
 if(p.x>W*.55){const dS=Math.hypot(p.x-b.shoot.x,p.y-b.shoot.y),dJ=Math.hypot(p.x-b.jump.x,p.y-b.jump.y);if(Math.abs(dS-dJ)<b.jump.r*.35)return null;/* dead gap between FIRE and JUMP */return dS<dJ?'shoot':'jump';}return null;}
function held(name){const b=btns()[name];let on=false;if(S==='space'&&['sl','sr','su','sd','shoot'].includes(name)){for(const p of touches.values())if(p.z&&(p.z===name||p.z.split(' ').includes(name)))on=true;return on;}if(S==='moon'&&['left','right','up','jump','shoot'].includes(name)){for(const p of touches.values())if(p.z===name)on=true;return on;}for(const p of touches.values())if(Math.hypot(p.x-b.x,p.y-b.y)<b.r*1.3)on=true;return on;}
const I={get L(){return K.ArrowLeft||K.KeyA||(S==='space'?held('sl'):held('left'))||VK.L},get R(){return K.ArrowRight||K.KeyD||(S==='space'?held('sr'):held('right'))||VK.R},
 get U(){return K.ArrowUp||K.KeyW||(S==='space'?held('su'):held('up'))||VK.U},get D(){return K.ArrowDown||K.KeyS||(S==='space'&&held('sd'))||VK.D},
 get J(){return K.Space||K.KeyZ||K.ArrowUp||K.KeyW||held('jump')||VK.J},get F(){return K.KeyX||K.KeyJ||K.Enter||held('shoot')||VK.F}};
// ---------- helpers ----------
const rnd=(a,b)=>a+Math.random()*(b-a),clamp=(v,a,b)=>v<a?a:v>b?b:v;
function rr(x,y,w,h,r,fill,stroke){g.beginPath();g.roundRect(x,y,w,h,r);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
function ell(x,y,rx,ry,fill,stroke){g.beginPath();g.ellipse(x,y,Math.max(.1,rx),Math.max(.1,ry),0,0,7);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
// ---------- captains ----------
const CAPS=[
 {name:'RILEY VANCE',skin:'#c8956a',hair:'#3a2618',suit:'#2f7bff',trim:'#ff8a2a',style:'short',bio:'Test pilot. Steady hands, big heart.'},
 {name:'NOVA REYES',skin:'#f6d7c0',hair:'#b5502a',suit:'#ff4f7b',trim:'#ffd23d',style:'pony',freck:1,bio:'Ace flyer. Never misses a jump.'},
 {name:'JAX OKORO',skin:'#5b3622',hair:'#1a1210',suit:'#3fae5a',trim:'#e33a2e',style:'goggles',bio:'Scrappy. Goggles on, scarf flying.'},
 {name:'QUINN PATEL',skin:'#b07a50',hair:'#5a3a22',suit:'#8a5cff',trim:'#ffc53d',style:'glasses',bio:'Engineer. Builds gadgets, solves puzzles.'}];
// ---------- game state ----------
let S='title',T=0,cap=0,stateT=0,score=0,secretFound=false,stats={kills:0,time:0};
function go(s){S=s;stateT=0;GOVER=null;CRY=null;if(PAUSEM){PAUSEM=null;saveVol();}if(s==='victory'){saveUnlock(3);const o=loadSave()||{};writeSave({cp:null,next:2,done:1,secrets:Math.max(o.secrets||0,M?M.secrets||0:0)});}touches.clear();tapQueued=null;
 if(s==='title')startMusic('title');else if(s==='space'){initSpace();if(PEND){applyCP(PEND);PEND=null;}startMusic('game');}else if(s==='moon'){initMoon();if(PEND){applyCP(PEND);PEND=null;}startMusic('game');}
 else if(s==='victory'){startMusic('victory');saveUnlock(mission===4?4:3);if(mission===4)writeSave({cp:null,next:4});}else if(s==='missions'){startMusic('title');}else if(s==='launchcut'){startMusic('launch');}else if(s==='comic'){comicI=0;comicT=0;MUS.intensity=0;startMusic(CB===MOONWIN||CB===INTER1||CB===MARSARR||CB===MARSWIN?'victory':'comic');}else if(s==='landing')startMusic('moon');else if(s==='intro'||s==='select')startMusic('title');
 window.GR.state=s;}
function tapped(){const t=tapQueued;tapQueued=null;return t;}
// ---------- TITLE ----------
// ---------- INTRO ----------
const LINES=[{who:'MISSION CONTROL',t:'ALERT! The 1977 signal is back. Vorr ships detected past Neptune.'},
 {who:'MISSION CONTROL',t:'The Moon outpost has gone dark. Blob minions everywhere.'},
 {who:'COMMANDER HAYES',t:'We have one ship left, and a crew of four captains.'}];
let line=0;
// ---------- SELECT ----------
let selK=false;function launch(){sfx('pick');window.GR.captain=CAPS[cap].name;mSel=1;go('missions');}
let unlocked=1,mission=1,mSel=1,mDone=1,bLine=0;try{unlocked=Math.max(1,+localStorage.getItem('gr_unlocked')||1);}catch(e){}
function saveUnlock(n){unlocked=Math.max(unlocked,n);try{localStorage.setItem('gr_unlocked',unlocked);}catch(e){}window.GR&&(window.GR.unlocked=unlocked);}
let LIVES=3,SAVET=0,GOVER=null,GOT=0,PEND=null,CONF=false;
// ---- gem pieces: 5 per level, saved forever (survive New Game); all 5 = crystal = permanent upgrade ----
let GEMS={1:[0,0,0,0,0],2:[0,0,0,0,0],3:[0,0,0,0,0],4:[0,0,0,0,0]},CRY=null;try{const o=JSON.parse(localStorage.getItem('gr_gems')||'null');if(o)GEMS={1:o[1]||GEMS[1],2:o[2]||GEMS[2],3:o[3]||GEMS[3],4:o[4]||GEMS[4]};}catch(e){}
let SHARDS={};try{SHARDS=JSON.parse(localStorage.getItem('gr_shards')||'{}')||{};}catch(e){}
const gemN=l=>GEMS[l].filter(Boolean).length,UPG=l=>!!SHARDS[l];
const UPNAME={1:['CRYSTAL BLASTER','Your blaster fires 25% faster. For good.'],2:['CRYSTAL ARMOR','+3 max energy on foot and a longer, tougher force field. For good.'],3:['CRYSTAL HULL','Pale Blue gets +1 hull in every space flight. For good.'],4:['CRYSTAL BOOTS','Higher jumps and a faster run on every planet. For good.']};
function gotGem(l,i,msgs){if(GEMS[l][i]){msgs.push({t:'GEM PIECE (ALREADY FOUND) '+gemN(l)+'/5',l:1.8});return;}GEMS[l][i]=1;try{localStorage.setItem('gr_gems',JSON.stringify(GEMS));}catch(e){}sfx('stinger');
 msgs.push({t:'GEM PIECE! '+gemN(l)+'/5',l:2});if(gemN(l)>=5){LIVES=Math.min(9,LIVES+1);CRY={t:0,l};}}
function gemShard(x,y,i,old,sc=1){g.save();g.translate(x,y);g.scale(sc,sc);g.rotate(Math.sin(T*2+i)*.25);if(!old)dglow(0,0,22,'#ff7ae0',.7);g.globalAlpha=old?.45:1;
 g.fillStyle=OL;g.beginPath();g.moveTo(0,-13);g.lineTo(9,-2);g.lineTo(4,12);g.lineTo(-5,11);g.lineTo(-9,-3);g.closePath();g.fill();
 g.fillStyle=lg(g,0,-11,0,10,['#ffd6ff','#ff7ae0','#7a3ae8']);g.beginPath();g.moveTo(0,-10.5);g.lineTo(6.8,-2);g.lineTo(2.8,9.6);g.lineTo(-3.8,9);g.lineTo(-6.8,-2.6);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(0,-9);g.lineTo(-4.5,-2.5);g.lineTo(-1,-1);g.closePath();g.fill();g.restore();}

// ===== Heart Crystal shards: one per mission, guarded by its boss. Big pickup moment + Crystal Tracker (pause menu)
const SHARDINFO={1:['ACE KREEL\'S CRYSTAL KEY','Kreel drops it as he flees!'],2:['THE MOON CRYSTAL KEY','Big Blorp was sitting on it!'],3:['THE MARS GATE CRYSTAL KEY','Krool dropped it in his escape!'],4:['THE MARS CRYSTAL KEY','The Dust Whale coughs it up!']};
const SHCOL={1:'#7ae8ff',2:'#e8f0ff',3:'#ff9a3a',4:'#ff5a3a'};
let SHM=null;
function shardMoment(l,cb){if(SHM)return;SHM={l,t:0,cb,ph:0};sfx('stinger');try{fanfare();}catch(e){}}
function fanfare(){if(!AC||!sfxG)return;const t0=AC.currentTime;[[0,523],[.14,659],[.28,784],[.46,1047],[.46,784],[.46,659]].forEach(([d,f])=>{const o=AC.createOscillator(),gg=AC.createGain();o.type='sawtooth';o.frequency.value=f;gg.gain.setValueAtTime(0,t0+d);gg.gain.linearRampToValueAtTime(.09,t0+d+.02);gg.gain.exponentialRampToValueAtTime(.001,t0+d+(d>.4?1.2:.3));o.connect(gg);gg.connect(sfxG);o.start(t0+d);o.stop(t0+d+1.3);});}
function heartShard(x,y,sc,col,gl){dglow(x,y,46*sc,col,.9*gl);g.save();g.translate(x,y);g.scale(sc,sc);g.rotate(Math.sin(T*2)*.12);g.fillStyle=OL;g.beginPath();g.moveTo(0,-28);g.lineTo(16,-4);g.lineTo(8,26);g.lineTo(-10,24);g.lineTo(-16,-6);g.closePath();g.fill();
 g.fillStyle=lg(g,0,-24,0,22,['#ffffff',col,'#3a1a6a']);g.beginPath();g.moveTo(0,-24);g.lineTo(12.5,-4);g.lineTo(6,22);g.lineTo(-8,20);g.lineTo(-12.5,-5);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.moveTo(0,-20);g.lineTo(-8,-5);g.lineTo(-2,-3);g.closePath();g.fill();g.restore();}
function trackerSlots(x0,y,sz,hiL,k){// 4 shards found so far + more out there
 for(let i=1;i<=6;i++){const x=x0+(i-1)*sz*1.25;g.fillStyle='rgba(10,12,40,.85)';g.strokeStyle=SHARDS[i]&&!(i===hiL&&k<1)?SHCOL[i]:'#4a4a7a';g.lineWidth=2;g.beginPath();g.arc(x,y,sz*.55,0,TAU);g.fill();g.stroke();
  if(SHARDS[i]&&!(i===hiL&&k<1))heartShard(x,y,sz/70,SHCOL[i],.5);else txt('?',x,y+1,sz*.4,'#6a6a9a');}}
function shardCut(){const S2=SHM,t=S2.t+=DT,l=S2.l,inf=SHARDINFO[l];
 if(S2.ph===0){// slow-motion white flash
  const k=clamp(t/1.1,0,1);g.fillStyle=`rgba(255,255,255,${Math.sin(k*Math.PI)*.95})`;g.fillRect(0,0,W,H);heartShard(W/2,H/2,.6+k*1.6,SHCOL[l],k);if(t>1.1){S2.ph=1;S2.t=0;SHARDS[l]=1;try{localStorage.setItem('gr_shards',JSON.stringify(SHARDS));}catch(e){}}return;}
 g.fillStyle='rgba(6,4,20,.9)';g.fillRect(0,0,W,H);
 if(S2.ph===1){// full-screen comic panel: captains holding the shard up
  g.fillStyle=OL;g.fillRect(16,36,W-32,H-70);g.save();g.beginPath();g.rect(22,42,W-44,H-82);g.clip();g.fillStyle=lg(g,0,42,0,H-40,['#3a1a6a','#7a3ae8','#ff7ae0']);g.fillRect(22,42,W-44,H-82);speedLines(W/2,110,'rgba(255,255,255,.28)');
  for(let i=0;i<4;i++)captain(150+i*112,300,CAPS[i],{sc:1.5,t:T+i,shoot:0,face:i<2?1:-1});
  for(let k=0;k<10;k++){const a=k/10*TAU+T;g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;g.beginPath();g.moveTo(W/2+Math.cos(a)*50,118+Math.sin(a)*50);g.lineTo(W/2+Math.cos(a)*64,118+Math.sin(a)*64);g.stroke();}
  heartShard(W/2,118,1.4+Math.sin(T*4)*.05,SHCOL[l],1);g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(22,42,W-44,H-82);g.globalAlpha=1;g.restore();
  caption(inf[1],30,50,240);sfxText('CRYSTAL KEY RECOVERED!',W/2-70,22,18,t,-.04);txt(inf[0],W/2,H-50,12,'#ffe066');txt('POWER: '+UPNAME[l][0]+' · '+UPNAME[l][1],W/2,H-24,8,'#ffffff');
  if(cutAdv(t,AUTO&&t>1.8)){S2.ph=2;S2.t=0;}return;}
 // shard flies into the Crystal Tracker
 const k=clamp(t/1.1,0,1),e=1-Math.pow(1-k,3),tx=W/2-150+(l-1)*30*1.25,ty=88;panel(W/2-190,58,380,60,'#b04aff');txt('CRYSTAL TRACKER',W/2,70,10,'#e8d0ff');trackerSlots(W/2-150,96,30,l,k);
 heartShard(W/2+(tx-W/2)*e,200+(ty+8-200)*e,1.4-e*1.0,SHCOL[l],1);if(k>=1)txt(Object.keys(SHARDS).length+' CRYSTAL KEYS FOUND · THE HEART CRYSTAL GLOWS',W/2,150,10,'#ffe066');
 if(t>(AUTO?1.4:2.4)){const cb=S2.cb;SHM=null;cb&&cb();}}
function crystalCut(){const t=CRY.t+=DT,e=1-Math.pow(1-clamp(t/.4,0,1),3);g.fillStyle='rgba(6,4,20,.82)';g.fillRect(0,0,W,H);
 g.save();g.translate(0,(1-e)*H);g.fillStyle=OL;g.fillRect(110,50,420,250);g.save();g.beginPath();g.rect(116,56,408,238);g.clip();g.fillStyle=lg(g,0,56,0,294,['#3a1a6a','#7a3ae8','#ff7ae0']);g.fillRect(116,56,408,238);speedLines(320,160,'rgba(255,255,255,.25)');
 const k=clamp(t/1,0,1);for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2,r=70*(1-k)+6;gemShard(320+Math.cos(a)*r,150+Math.sin(a)*r,i,false,2.2);}if(k>=1)dglow(320,150,70,'#ffffff',.5+.3*Math.sin(T*6));
 g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(116,56,408,238);g.globalAlpha=1;g.restore();
 caption('ALL 5 GEM PIECES FOUND',124,64,190);txt('BONUS: +1 LIFE!',320,238,16,'#ffe066');txt('Gem pieces glow brighter in the Crystal Tracker.',320,262,9,'#ffffff');g.restore();
 sfxText('GEMS COMPLETE!',W/2,30,22,t,-.06);if(cutAdv(t,AUTO&&t>2))CRY=null;}
function loadSave(){try{return JSON.parse(localStorage.getItem('gr_save')||'null');}catch(e){return null;}}
function writeSave(o,quiet){const old=loadSave()||{};const sv={...old,...o,cap,unlocked,score,lives:LIVES,v:1,at:Date.now()};try{localStorage.setItem('gr_save',JSON.stringify(sv));localStorage.setItem('gr_unlocked',unlocked);}catch(e){}if(!quiet)SAVET=1.8;}
function saveCP(m,k){writeSave({cp:{m,k},next:m});}
function loseLife(rs){if(AUTO){rs();return;}LIVES--;if(LIVES>0){rs();}else{GOVER=rs;GOT=0;sfx('stinger');}}
function newGame(){try{localStorage.removeItem('gr_save');localStorage.setItem('gr_unlocked','1');}catch(e){}unlocked=1;score=0;LIVES=3;CONF=false;if(seenComic)go('select');else{comicFrom='title';go('comic');}}
function resumeSave(sv){cap=sv.cap??0;unlocked=Math.max(unlocked,sv.unlocked||1);score=sv.score||0;LIVES=sv.lives>0?sv.lives:3;
 if(sv.cp&&sv.cp.m){mission=sv.cp.m;PEND=sv.cp;go(sv.cp.m===2||sv.cp.m===4?'moon':'space');}else{mSel=Math.min(4,sv.next||unlocked);go('missions');}}
function applyCP(c){if((c.m===1||c.m===3)&&sp){const s=sp,k=Math.min(STG[2].a,c.k||0);s.cp=k;s.dist=k;s.bossI=STG.filter(st=>st.b<k).length;s.ha=HEAD[s.bossI].a;s.hr=HEAD[s.bossI].r;setDims(s.bossI);s.x=120;s.y=SH/2;s.waves.forEach(w=>{w.go=w.d<k?1:0;});s.msgs.push({t:'RESUMED AT CHECKPOINT',l:2.5});}
 if(c.m===2&&M){const m=M,k=clamp(c.k|0,0,m.cps.length-1);for(let i=0;i<=k;i++)m.cps[i].on=true;const cc=m.cps[k];m.px=cc.x+(cc.x===140?95:0);m.py=GROUND;m.best=m.px;m.safe=m.px;m.msgs.push({t:'RESUMED AT CHECKPOINT',l:2.5});}}
function drawGameOver(){GOT+=DT;g.fillStyle='rgba(8,4,24,.72)';g.fillRect(0,0,W,H);txt('GAME OVER',W/2,120,34,'#ff4f7b');txt('All three lives lost.',W/2,158,11,'#ffffff');
 panel(W/2-160,172,150,40,'#5fe36a');txt('RETRY FROM CHECKPOINT',W/2-85,192,9,'#ffffff');panel(W/2+10,172,150,40,'#ffc53d');txt('MISSION MENU',W/2+85,192,10,'#ffffff');txt('Retry refills all 3 lives',W/2,228,8,'#c6cbef');
 const tp=tapped();if(GOT<.8)return;if(tp&&tp.y>162&&tp.y<222&&tp.x>W/2){GOVER=null;LIVES=3;go('missions');return;}
 if(tp&&tp.y>162&&tp.y<222&&tp.x<W/2||K.Enter||K.Space){const r=GOVER;GOVER=null;LIVES=3;sfx('pick');r();}}
function oneUp(x,y,nl){dglow(x,y,22,'#ff4f7b',.8);circ(x,y,11,OL);g.fillStyle=ballG(g,x,y,9.5,9.5,'#ff4f7b');g.beginPath();g.arc(x,y,9.5,0,TAU);g.fill();if(!nl)txt('1UP',x,y+.5,7,'#ffffff');}
function startMission(n){LIVES=3;mission=n;bLine=0;sfx('pick');go('card');}
function completeMission(n){saveUnlock(Math.min(4,n+1));writeSave({cp:null,next:Math.min(4,n+1)});mDone=n;if(n===1)playComic(INTER1,()=>go('mdone'));else if(n===3)playComic(MARSARR,()=>{mSel=4;go('missions');});else go('mdone');}
// ---------- SPACE FLIGHT ----------
let sp;
let SW=640,SH=360;const HEAD=[{a:0,r:0,n:'HEADING: OUTBOUND'},{a:-Math.PI/2,r:0,n:'HEADING: CLIMB'},{a:-Math.PI,r:Math.PI,n:'HEADING: MOON APPROACH'}];
function headI(s){return s.phase==='jump'?Math.max(0,s.bossI-1):Math.min(2,s.bossI);}
function setDims(i){if(i===1){SW=360;SH=640;}else{SW=640;SH=360;}}
function toS(x,y){const s=sp,c=Math.cos(s.hr),ca=Math.cos(s.ha),sa=Math.sin(s.ha),dx=x-SW/2,dy=(y-SH/2)*c;return[W/2+dx*ca-dy*sa,H/2+dx*sa+dy*ca];}
const GEMSP1=[[0,2400,22],[1,4900,-22],[2,8600,26],[3,11500,-26],[4,16800,22]],GEMSP3=[[0,1900,-20],[1,4300,20],[2,7900,-24],[3,10600,24],[4,16300,-20]];let GEMSP=GEMSP1,SPM=1;// M1 gem pieces hug the screen edges
const STG1=[{n:'EARTH ORBIT',a:0,b:5600,boss:'carrier',jump:7000,iv:700},{n:'VORR PICKET LINE',a:7000,b:12600,boss:'turret',jump:14000,iv:620},{n:'LUNAR APPROACH',a:14000,b:19600,boss:'ace',jump:21000,iv:560}],STG3=[{n:'LEAVING THE MOON',a:0,b:5200,boss:'grubb',jump:6600,iv:680},{n:'THE RING ROUTE',a:6600,b:11800,boss:'twins',jump:13200,iv:620},{n:'MARS GATE',a:13200,b:18400,boss:'krool',jump:19800,iv:580}];let SP_LEN=21000,STG=STG1,BREATHER=18300;const 
 BOSSNAME={carrier:'VORR SHIELD CARRIER',turret:'SPINNING TURRET GUNSHIP',ace:'AMBUSH! ACE KREEL',grubb:'FUEL DEPOT ALPHA: CAPTAIN GRUBB',twins:'RING STATION BETA: VEXA & VOXA',krool:'MARS GATE: WARDEN KROOL'},
 FACTS=[];
function genWaves(){const out=[],pools=SPM===3?[['swoop2','taxi','bubb','swoop2','twin','divers','sdrone','taxi'],['twin','sdrone','swoop2','bubb','taxi','V','twin','sdrone','snake'],['sdrone','twin','bubb','swoop2','taxi','twin','pincer','sdrone','bubb']]:[['divers','scouts','sat','spread','behind','divers','shieldU','pods'],['V','spread','shieldU','behind','mines','divers','pincer','pods','snake'],['spread','pods','shieldB','behind','circle','divers','snake','pincer','shieldU']];
 STG.forEach((st,si)=>{let i=0;const end=si===2?BREATHER:st.b-600;for(let d=st.a+600;d<end;d+=st.iv,i++)out.push({d,p:pools[si][i%pools[si].length]});});return out;}
function initSpace(){SPM=mission===3?3:1;STG=SPM===3?STG3:STG1;GEMSP=SPM===3?GEMSP3:GEMSP1;SP_LEN=SPM===3?19800:21000;BREATHER=SPM===3?17200:18300;SW=640;SH=360;const mh=5+(UPG(3)?1:0);sp={x:120,y:SH/2,vx:0,vy:0,hp:mh,maxhp:mh,inv:0,dist:0,len:SP_LEN,shots:[],foes:[],rocks:[],eshots:[],booms:[],picks:[],pops:[],cool:0,ccool:0,killed:0,msgs:[],boss:null,bossI:0,phase:'fly',endT:0,cp:0,sec:-1,fact:null,factI:0,banner:null,
 ha:0,hr:0,cut:null,pw:{spread:0,rapid:0,charge:0},shield:0,waves:genWaves(),rt:0,combo:0,ct:0,mult:1,jumpTo:0,breathe:false};}
// ================= MISSION 3: TRIP TO MARS (new enemies, bosses, refuel comics) =================
function M3WAVE(p,F,msg,cy){const s=sp;
 if(p==='swoop2'){const top=Math.random()<.5;for(let i=0;i<5;i++)F({pat:'loop',kind:'swooper',del:i*.3,cy:top?90:SH-150});msg('SWOOPERS!');}
 if(p==='twin'){for(let i=0;i<2;i++)F({pat:'drift',kind:'twin',del:i*1.6,cy:SH/2-30+(i?70:-70),sv:70,pa:1,pb:1,life:22});msg('TWIN-POD CRUISERS! ONE BLAST PER COCKPIT!');}
 if(p==='bubb'){for(let i=0;i<2;i++)F({pat:'drift',kind:'bomber',del:i*1.4,cy:i?SH-130:70,sv:55,life:24});msg('BUBBLE BOMBERS! POP THE MINES!');}
 if(p==='sdrone'){for(let k=0;k<2;k++){const yy=SH/2-30+(k?80:-80),a=F({pat:'pair',kind:'sdrone',side:-1,del:k*1.2,cy:yy,life:16}),b=F({pat:'pair',kind:'sdrone',side:1,del:k*1.2,cy:yy,life:16});if(a.kind&&b.kind){a.mate=b;b.mate=a;}}msg('SHIELD DRONES! HIT EITHER DRONE!');}
 if(p==='taxi'){for(let i=0;i<2;i++)F({pat:'drift',kind:'taxi',del:i*1.2,cy:rnd(70,SH-130),sv:95,life:18});msg('ZIBBIT TAXI! WATCH FOR BAIL-OUTS!');}}
function twinHit(f,kill){const s=sp;for(const b of s.shots){if(b.dead||f.dead)continue;for(const k of['pa','pb']){if(!f[k])continue;const cy=f.y+(k==='pa'?-15:15);if(Math.abs(b.x-f.x)<14&&Math.abs(b.y-cy)<11){if(!b.pierce)b.dead=1;f[k]=0;f.hit=.1;sfx('boom');boomAt(s.booms,f.x,cy,8);s.pops.push({x:f.x,y:cy-10,t:f.pa+f.pb?'SPIN OUT!':'POP!',l:.7,comic:1,sz:14});if(!f.pa&&!f.pb)kill(f,f.x,f.y,250);break;}}}}
const DRAWK={
 swooper:f=>{g.save();g.translate(f.x,f.y);g.rotate(Math.sin(f.age*4)*.4);dglow(14,0,10,'#ffc53d',.6);circ(0,0,13,OL);g.fillStyle=ballG(g,0,0,11.5,11.5,'#ffb03a');g.beginPath();g.arc(0,0,11.5,0,TAU);g.fill();for(const d of[-1,1]){g.fillStyle=OL;g.beginPath();g.ellipse(4,d*12,9,4.5,d*.5,0,TAU);g.fill();g.fillStyle='#ff6a3a';g.beginPath();g.ellipse(4,d*12,7.4,3,d*.5,0,TAU);g.fill();}circ(-4,-2,4.6,OL);circ(-4,-2,3.6,'#fff');circ(-5,-2,1.6,OL);g.restore();},
 twin:f=>{g.save();g.translate(f.x,f.y);if(f.pa+f.pb===1)g.rotate(f.spin||0);g.fillStyle=OL;g.beginPath();g.roundRect(-7,-12,14,24,6);g.fill();g.fillStyle='#7a5a9a';g.beginPath();g.roundRect(-5,-10,10,20,5);g.fill();
  for(const[k,cy]of[['pa',-15],['pb',15]]){if(!f[k]){circ(0,cy,6,'#3a2a4a');continue;}circ(0,cy,13,OL);g.fillStyle=ballG(g,0,cy,11.5,11.5,f.hit>0?'#ffffff':'#b04aff');g.beginPath();g.arc(0,cy,11.5,0,TAU);g.fill();g.fillStyle='rgba(190,240,255,.6)';g.beginPath();g.arc(-3,cy,6,0,TAU);g.fill();circ(-3,cy,3,'#9cff7a');circ(-4,cy-.6,1,OL);}g.restore();},
 bomber:f=>{const y=f.y+Math.sin(f.age*2)*3;dglow(f.x,y,26,'#7ae8ff',.35);circ(f.x,y,23,OL);g.fillStyle=ballG(g,f.x,y,21,21,f.hit>0?'#ffffff':'#4aa0ff');g.beginPath();g.arc(f.x,y,21,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(f.x-6,y-9,8,4,-.4,0,TAU);g.fill();
  circ(f.x-6,y-2,6,OL);circ(f.x-6,y-2,4.8,'#fff');circ(f.x-8,y-2,2,OL);g.fillStyle=OL;g.beginPath();g.ellipse(f.x-2,y+9,6,3,0,0,Math.PI);g.fill();for(const d of[-12,0,12]){circ(f.x+d,y+21,3.4,OL);circ(f.x+d,y+21,2.2,'#7ae8ff');}},
 bubble:f=>{g.save();g.globalAlpha=.9;g.strokeStyle='#bff6ff';g.lineWidth=2;g.fillStyle='rgba(150,230,255,.25)';g.beginPath();g.arc(f.x,f.y,11,0,TAU);g.fill();g.stroke();g.fillStyle='#fff';g.beginPath();g.arc(f.x-4,f.y-4,2.6,0,TAU);g.fill();circ(f.x,f.y,3.4,'#ff4f7b');g.restore();},
 sdrone:f=>{if(f.side<0&&f.mate&&!f.mate.dead){g.save();g.globalCompositeOperation='lighter';const my=(f.y+f.mate.y)/2,ry=Math.abs(f.mate.y-f.y)/2;g.strokeStyle=f.shHit>0?'#ffffff':`rgba(110,230,255,${.55+.2*Math.sin(T*6)})`;g.fillStyle='rgba(110,230,255,.12)';g.lineWidth=3;g.beginPath();g.ellipse(f.x,my,18,ry,0,0,TAU);g.fill();g.stroke();g.restore();}
  circ(f.x,f.y,14,OL);g.fillStyle=ballG(g,f.x,f.y,12.5,12.5,f.hit>0?'#ffffff':'#5fe36a');g.beginPath();g.arc(f.x,f.y,12.5,0,TAU);g.fill();circ(f.x-3,f.y,5,OL);circ(f.x-3,f.y,3.6,'#ffe14d');},
 taxi:f=>{const y=f.y+Math.sin(f.age*3)*3;g.fillStyle=OL;g.beginPath();g.ellipse(f.x,y+3,28,10,0,0,TAU);g.fill();g.fillStyle=f.hit>0?'#ffffff':lg(g,0,y-6,0,y+10,['#ffe066','#e0a020']);g.beginPath();g.ellipse(f.x,y+3,26,8.5,0,0,TAU);g.fill();
  for(let i=0;i<4;i++){g.fillStyle=(i+(f.age*4|0))%2?OL:'#fff';g.fillRect(f.x-18+i*9,y+1,8,3.6);}g.fillStyle='rgba(190,240,255,.55)';g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.arc(f.x,y-2,14,Math.PI,TAU);g.fill();g.stroke();
  for(const d of[-6,6]){g.save();g.translate(f.x+d,y-6);g.scale(.32,.32);goofFlyer(0,0,f.age+d,1,false);g.restore();}},
 zib:f=>{g.save();g.translate(f.x,f.y);g.scale(.62,.62);goofFlyer(0,0,f.age*1.5,f.vx>0?1:-1,f.hit>0);g.restore();}};
function M3BOSSINIT(B){if(B.type==='twins')B.ships=[{a:0,hp:B.max/2,n:0,f:1.2},{a:Math.PI,hp:B.max/2,n:1,f:2}];if(B.type==='krool'){B.ks=1;B.plates=[0,1,2,3].map(i=>({a:i*TAU/4,hp:AUTO?1:4}));B.hp=B.max=B.plates.reduce((a,p)=>a+p.hp,0);B.cx=SW+140;}}
const M3BOSS={
 grubb:(B,dt,hpF)=>{const s=sp;B.x+=(SW-130-B.x)*Math.min(1,dt*1.2);B.y=SH/2-30+Math.sin(B.t*.6)*70;B.f-=dt;if(B.f<=0){B.f=hpF<.5?1.7:2.3;for(let k=0;k<4;k++)s.eshots.push({x:B.x-60,y:B.y+rnd(-10,10),vx:-rnd(95,150),vy:rnd(-130,130),bo:2,goo:1});sfx('whoosh');}
  B.l-=dt;if(B.l<=0){B.l=7;const top=Math.random()<.5;for(let i=0;i<3;i++)s.foes.push({pat:'loop',kind:'swooper',age:0,del:i*.3,cy:top?80:SH-140,hp:1,life:9,pers:'rookie'});s.msgs.push({t:'GRUBB CALLS SWOOPERS!',l:1.5});}return[86,38,false];},
 twins:(B,dt,hpF)=>{const s=sp,live=B.ships.filter(q=>q.hp>0),rage=live.length===1;B.x=SW-170;B.y=SH/2-30;
  for(const q of B.ships){if(q.hp<=0)continue;q.a+=dt*(rage?2.3:1.2);q.x=B.x+Math.cos(q.a)*90;q.y=B.y+Math.sin(q.a)*95;q.f-=dt;if(q.f<=0){q.f=rage?.75:1.5;const a=Math.atan2(s.y-q.y,s.x-q.x);for(const k of rage?[-.2,0,.2]:[0])s.eshots.push({x:q.x-14,y:q.y,vx:Math.cos(a+k)*(rage?220:180),vy:Math.sin(a+k)*(rage?220:180)});sfx('hit');}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-q.x,b.y-q.y)<26){if(!b.pierce)b.dead=1;q.hp-=b.dmg||1;q.hit=.08;B.hit=.08;sfx('hit');if(q.hp<=0){boomAt(s.booms,q.x,q.y,16,'#ff7ae0');sfx('bigboom');SHAKE=.5;s.pops.push({x:q.x,y:q.y-30,t:q.n?'VOXA DOWN!':'VEXA DOWN!',l:1.1,comic:1,sz:20});if(B.ships.some(o=>o.hp>0))s.pops.push({x:B.x,y:B.y-70,t:'SHE\'S FURIOUS!',l:1.3,comic:1,sz:22});}}
   if(Math.hypot(s.x-q.x,s.y-q.y)<30)hurtShip();q.hit=(q.hit||0)-dt;}
  B.hp=B.ships.reduce((a,q)=>a+Math.max(0,q.hp),0);const t2=live.find(q=>q.hp>0);if(t2){B.x=t2.x;B.y=t2.y;}else{B.x=SW-170;}return[-1,-1,false];},
 krool:(B,dt,hpF)=>{const s=sp;B.cx+=(SW-150-B.cx)*Math.min(1,dt*1.2);const cy=SH/2-30+Math.sin(B.t*.5)*50;B.rot=(B.rot||0)+dt*1.3;
  if(B.ks===1){for(const p of B.plates){if(p.hp<=0)continue;const a=p.a+B.rot;p.x=B.cx+Math.cos(a)*48;p.y=cy+Math.sin(a)*48;for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-p.x,b.y-p.y)<17){if(!b.pierce)b.dead=1;p.hp-=b.dmg||1;p.hit=.08;sfx('hit');if(p.hp<=0){boomAt(s.booms,p.x,p.y,10,'#ff9a3a');sfx('boom');s.pops.push({x:p.x,y:p.y-16,t:'CLANG!',l:.8,comic:1,sz:16});}}p.hit=(p.hit||0)-dt;}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-B.cx,b.y-cy)<30){b.dead=1;}
   B.f-=dt;if(B.f<=0){B.f=2.6;for(let k=0;k<10;k++){const a=k*TAU/10+B.t;s.eshots.push({x:B.cx,y:cy,vx:Math.cos(a)*110,vy:Math.sin(a)*110,tb:1});}sfx('hit');}
   B.hp=B.plates.reduce((a,p)=>a+Math.max(0,p.hp),0);if(B.hp<=0){B.ks=2;B.hp=B.max=AUTO?6:34;B.f=1;sfx('stinger');SHAKE=.5;s.pops.push({x:B.cx,y:cy-60,t:'CORE EXPOSED!',l:1.3,comic:1,sz:24});}}
  else if(B.ks===2){B.f-=dt;if(B.f<=0){B.f=hpF<.5?1:1.35;const a=Math.atan2(s.y-cy,s.x-B.cx);for(const k of[-.32,-.16,0,.16,.32])s.eshots.push({x:B.cx-20,y:cy,vx:Math.cos(a+k)*170,vy:Math.sin(a+k)*170,tb:1});sfx('hit');}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-B.cx,b.y-cy)<34){if(!b.pierce)b.dead=1;B.hp-=b.dmg||1;B.hit=.08;sfx('hit');}
   if(B.hp<=0){B.ks=3;B.hp=B.max=AUTO?4:12;B.pod={x:B.cx,y:cy,t:0,f:1};boomAt(s.booms,B.cx,cy,24,'#ff9a3a');sfx('bigboom');SHAKE=.8;s.pops.push({x:B.cx,y:cy-50,t:'KROOL BAILS OUT!',l:1.4,comic:1,sz:24});s.msgs.push({t:'CATCH HIS POD BEFORE IT REACHES MARS!',l:2.4});}}
  else{const P=B.pod;P.t+=dt;P.x+=48*dt;P.y=SH/2-30+Math.sin(P.t*2.1)*110;P.f-=dt;if(P.f<=0){P.f=1.1;const a=Math.atan2(s.y-P.y,s.x-P.x);s.eshots.push({x:P.x,y:P.y,vx:Math.cos(a)*170,vy:Math.sin(a)*170});}
   if(P.x>SW-30){P.x=SW*.45;s.msgs.push({t:'HE DOUBLED BACK! GET HIM!',l:1.6});}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-P.x,b.y-P.y)<18){if(!b.pierce)b.dead=1;B.hp-=b.dmg||1;B.hit=.08;sfx('hit');}
   if(Math.hypot(s.x-P.x,s.y-P.y)<24)hurtShip();}
  B.ky=cy;if(B.ks<3){B.x=B.cx;B.y=cy;if(Math.hypot(s.x-B.cx,s.y-cy)<50)hurtShip();}else{B.x=B.pod.x;B.y=B.pod.y;}return[-1,-1,false];}};
function grubbArt(x,y,sc,hit){g.save();g.translate(x,y);g.scale(sc,sc);g.fillStyle=OL;g.beginPath();g.ellipse(0,10,96,34,0,0,TAU);g.fill();g.fillStyle=hit?'#ffffff':lg(g,0,-20,0,40,['#9ad070','#4a8a3a']);g.beginPath();g.ellipse(0,10,92,30,0,0,TAU);g.fill();
 for(const[tx,r]of[[-46,20],[0,24],[46,20]]){circ(tx,-14,r+3,OL);g.fillStyle=ballG(g,tx,-14,r,r,'#ffc53d');g.beginPath();g.arc(tx,-14,r,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.ellipse(tx-r*.35,-14-r*.45,r*.35,r*.18,-.4,0,TAU);g.fill();}
 for(let i=0;i<5;i++)circ(-72+i*36,22,5,'#2a4a2a');g.fillStyle='rgba(190,255,220,.5)';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.arc(-70,0,22,Math.PI*.9,TAU*1.02);g.fill();g.stroke();blob(-70,10,T,{r:15,face:-1,angry:1,col:'#c8a040'});
 for(let i=0;i<3;i++){circ(-96,8+i*8,4,'#9cff4a');}g.restore();}
function twinShip(x,y,col,sc,hit,rage){g.save();g.translate(x,y);g.scale(sc,sc);if(rage)dglow(0,0,40,'#ff3a8a',.5);g.fillStyle=OL;g.beginPath();g.ellipse(0,4,34,13,0,0,TAU);g.fill();g.fillStyle=hit?'#ffffff':lg(g,0,-6,0,14,[col,'#3a1a5a']);g.beginPath();g.ellipse(0,4,31,10.5,0,0,TAU);g.fill();
 g.fillStyle='rgba(190,240,255,.55)';g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.arc(0,-2,15,Math.PI,TAU);g.fill();g.stroke();g.fillStyle=ballG(g,0,-6,7,7,'#7ae8ff');g.beginPath();g.arc(0,-6,7,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1.4;g.stroke();
 g.strokeStyle=OL;g.lineWidth=1.3;g.beginPath();g.moveTo(-4.5,-8);g.lineTo(-1,-7);g.moveTo(1,-7);g.lineTo(4.5,-8);g.stroke();for(const d of[-22,0,22])circ(d,7,2.6,'#ffe14d');g.restore();}
function kroolArt(B,x,y,sc,stage){g.save();g.translate(x,y);g.scale(sc,sc);const r=B?B.rot:T;circ(0,0,40,OL);g.fillStyle=lg(g,0,-38,0,38,['#8a5a3a','#3a2018']);g.beginPath();g.arc(0,0,37,0,TAU);g.fill();
 const open=stage>=2;dglow(0,0,open?40:20,'#ff4f2a',open?.9:.4);circ(0,0,open?16:11,OL);g.fillStyle=ballG(g,0,0,open?14:9,open?14:9,open?'#ff7a29':'#7a3a2a');g.beginPath();g.arc(0,0,open?14:9,0,TAU);g.fill();
 if(stage<=1)for(let i=0;i<4;i++){const p=B?B.plates[i]:{hp:1};if(p.hp<=0)continue;const a=(B?p.a:i*TAU/4)+r;g.save();g.rotate(a);g.translate(48,0);g.fillStyle=OL;g.beginPath();g.arc(0,0,16,0,TAU);g.fill();g.fillStyle=p.hit>0?'#ffffff':ballG(g,0,0,14,14,'#c0c8d8');g.beginPath();g.arc(0,0,14,0,TAU);g.fill();circ(0,0,4,'#5a6278');g.restore();}
 g.fillStyle='rgba(255,180,90,.5)';g.beginPath();g.arc(0,-26,12,Math.PI,TAU);g.fill();blob(0,-20,T,{r:9,face:-1,angry:1,col:'#d06a3a'});g.restore();}
function kroolPod(x,y,hit){g.save();g.translate(x,y);g.rotate(Math.sin(T*6)*.2);dglow(-16,0,12,'#ff9a3a',.8);circ(0,0,15,OL);g.fillStyle=ballG(g,0,0,13,13,hit?'#ffffff':'#d0703a');g.beginPath();g.arc(0,0,13,0,TAU);g.fill();g.fillStyle='rgba(190,240,255,.6)';g.beginPath();g.arc(3,-2,7,0,TAU);g.fill();blob(3,2,T,{r:5,face:1,scared:1,col:'#d06a3a'});g.restore();}
const M3DRAW={grubb:B=>{dglow(B.x+90,B.y,30,'#9cff4a',.6);grubbArt(B.x,B.y,1,B.hit>0);},
 twins:B=>{for(const q of B.ships){if(q.hp<=0||q.x==null)continue;twinShip(q.x,q.y,q.n?'#3ad6c0':'#ff7ae0',1,q.hit>0,B.ships.some(o=>o.hp<=0));}},
 krool:B=>{if(B.ks<3)kroolArt(B,B.cx,B.ky??B.y,1,B.ks);else kroolPod(B.pod.x,B.pod.y,B.hit>0);}};
function M3CUTART(type){if(type==='grubb')grubbArt(174,175,1.2,false);else if(type==='twins'){twinShip(120,140,'#ff7ae0',1.8,false);twinShip(230,220,'#3ad6c0',1.8,false);}else kroolArt(null,174,170,1.8,1);}
// refuel comic scenes after each freed station (paused, tap to advance with the input delay)
const REFUEL=[
 [['cap','FUEL DEPOT ALPHA: FREED!','Tanks filling up! Pale Blue lives to fly another day.'],['hayes','Hayes checks in.','Nice work. Grubb was hauling fuel for Malakar\'s fleet.'],['cap','Refueled.','Every station we free slows the Vorr down. On to the next!']],
 [['cap','RING STATION BETA: FREED!','Two sisters down, one station closer to Mars.'],['hayes','Hayes checks in.','Those twins were tracking Voyager\'s signal. The Vorr are getting close to it.'],['mal','Aboard the Vorr flagship...','Two stations lost? Then FLY FASTER! Those Crystal Keys must be MINE!']],
 [['cap','MARS GATE: OPEN!','Krool\'s pod spins off. He dropped the third Crystal Key!'],['hayes','Hayes checks in.','Krool dropped his star charts. Voyager\'s trail runs right past Mars.'],['cap','Full tanks.','Then that\'s where we\'re going. Hang on, crew!']]];
function stationArt(i,t){g.fillStyle=lg(g,0,50,0,290,['#140c34','#2a1a5a']);g.fillRect(30,50,288,238);starfield(T*4);const cx=150,cy=170;
 circ(cx,cy,52,OL);g.fillStyle=ballG(g,cx,cy,49,49,['#5fe36a','#ff7ae0','#ff9a3a'][i]);g.beginPath();g.arc(cx,cy,49,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.ellipse(cx,cy,78,20,-.2,0,TAU);g.stroke();g.strokeStyle='#ffe066';g.lineWidth=2.5;g.stroke();
 for(let k=0;k<6;k++){const u=((t*.8+k/6)%1),bx=cx+40+u*90,by=cy+10-u*30;circ(bx,by,4.5,OL);circ(bx,by,3.4,'#ffe066');}ship(270,140,T,.85);}
function refuelCut(s){const c=s.cut,beat=REFUEL[c.i][c.b],t=c.t;g.fillStyle='rgba(6,4,20,.82)';g.fillRect(0,0,W,H);const e1=1-Math.pow(1-clamp(t/.3,0,1),3);
 g.save();g.translate(-(1-e1)*W*.5,0);g.fillStyle=OL;g.fillRect(24,44,300,250);g.save();g.beginPath();g.rect(30,50,288,238);g.clip();stationArt(c.i,t);g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(30,50,288,238);g.globalAlpha=1;g.restore();caption(beat[1],36,56,200);g.restore();
 if(t>.25){g.fillStyle=OL;g.fillRect(338,64,278,230);if(beat[0]==='cap')capCard(cap,346,72,130,214);else if(beat[0]==='mal'&&IMG.comic_c07)drawCover(IMG.comic_c07,344,70,266,218);else{g.fillStyle='#1c2458';g.fillRect(344,70,266,218);dsp(portrait('hayes'),410,280,4.2);}
  if(t>.45)bubble(beat[2],beat[0]==='cap'?470:350,beat[0]==='cap'?96:200,beat[0]==='cap'?140:250,beat[0]==='cap'?440:430,beat[0]==='cap'?170:180);if(beat[0]!=='mal')txt(beat[0]==='cap'?CAPS[cap].name:'HAYES',beat[0]==='cap'?546:470,270,10,'#ffe066');}
 sfxText(c.b===0?'REFUELED!':'',W/2,30,22,t,-.08);for(let k=0;k<3;k++)circ(W/2-10+k*10,52,2.6,k===c.b?'#ffc53d':'#4a4a6a');
 if(cutAdv(t,AUTO&&t>1.6)){c.b++;c.t=0;if(c.b>=REFUEL[c.i].length){s.cut=null;startMusic('space',Math.min(2,s.bossI));}}}
function boomAt(arr,x,y,n=14,col='#ffc53d'){for(let i=0;i<n;i++)arr.push({x,y,vx:rnd(-120,120),vy:rnd(-120,120),l:rnd(.3,.7),c:Math.random()<.5?col:'#fff'});}
const PERS={rookie:{n:'ROOKIE ZIB',skin:'#9cff7a',say:['Is this thing on?!','Mom said I could fly today!','Uh... formation, guys?','I got this. I got this!'],panic:['AAAH!','Not the face!','I want my mom!','Mayday!!']},
 ace:{n:'SKRIIL, KREEL SQUAD',skin:'#c58bff',say:['Too slow, Earthling!','Kreel sends his regards.','Watch this, rookies.','Nice ship. Mine now.'],panic:['Lucky shot!','Hey! My paint!','Impossible!']},
 brute:{n:'GORRK THE BRUTE',skin:'#ff9a6a',say:['GORRK SMASH TIN CAN!','Big ship. Big gun.','You squishy!'],panic:['OW!','Gorrk... mad now!','HNNGH!']},
 sneak:{n:'VEXA THE SNEAK',skin:'#7ae8ff',say:['Peekaboo...','Didn\'t see me, did you?','Behind you, hero~'],panic:['Eep! Found me!','Rude!','Ow ow ow!']}};
const CHAT=['KREEL SQUAD: Box that Earth ship in!','GORRK: Gorrk hungry for metal.','ZIB: Guys, it\'s shooting back!','VEXA: I\'ll take the long way around...','SKRIIL: Leave the pilot to me.','KREEL: Nobody reaches that Moon.'];
function persOf(o){if(o.pers)return o.pers;if(o.kind==='saucer'||o.kind==='pod')return 'rookie';if(o.kind==='spreader'||o.kind==='shield')return 'brute';if(o.pat==='pincer'||o.pat==='uturn'||o.pat==='behind'||o.pat==='snake'||o.pat==='drift')return 'sneak';return 'ace';}
function sayF(f,list){f.say={t:list[Math.random()*list.length|0],l:1.8};}
function spawnWave(p){const s=sp,cy=rnd(100,SH-150),F=o=>{s.fc=(s.fc||0)+1;if(s.fc%9===2||s.fc%9===4||s.fc%9===6||s.fc%9===8)return {};const f={age:0,del:0,kind:'vorr',...o,hp:o.big?3:1};/* every regular alien ship dies in one hit */f.pers=persOf(f);s.foes.push(f);return f;},msg=t=>s.msgs.push({t,l:1.8}),n0=s.foes.length;
 if(p==='V'){for(let i=0;i<7;i++)F({pat:'V',ox:Math.abs(i-3)*30,oy:(i-3)*24,cy});msg('VORR V-FORMATION!');}
 if(p==='circle'){for(let i=0;i<8;i++)F({pat:'circle',a0:i*Math.PI/4,cy:SH/2-30});msg('CIRCLE FORMATION!');}
 if(p==='scouts'){for(let i=0;i<5;i++)F({pat:'swoop',kind:'saucer',del:i*.35,cy,up:i%2==0,hp:1});msg('MINION SCOUTS!');}
 if(p==='divers'){const top=Math.random()<.5;for(let i=0;i<5;i++)F({pat:'dive',kind:'saucer',del:i*.45,top,sx:SW*.55+i*40,hp:1});msg(top?'DIVERS FROM ABOVE!':'DIVERS FROM BELOW!');}
 if(p==='behind'){for(let i=0;i<5;i++)F({pat:'behind',del:i*.4,cy:rnd(60,SH-110),dir:1});msg('BEHIND YOU!');sfx('warn');}
 if(p==='spread'){for(let i=0;i<3;i++)F({pat:'hold',kind:'spreader',del:i*.6,cy:SH/2-30+(i-1)*85,tx:SW-90-i*45,oy:i,hp:3,life:16});msg('SPREAD-SHOT FIGHTERS!');}
 if(p==='shieldU'){for(let i=0;i<3;i++)F({pat:'uturn',kind:'shield',del:i*.7,cy:SH/2-30+(i-1)*80,dir:-1,hp:2,life:18});msg('FRONT SHIELDS! HIT THEM FROM BEHIND!');}
 if(p==='shieldB'){for(let i=0;i<4;i++)F({pat:'behind',kind:'shield',del:i*.5,cy:rnd(60,SH-110),dir:1,hp:2});msg('SHIELD SHIPS BEHIND! SHOOT THEIR BACKS!');}
 if(p==='sat'){for(let i=0;i<3;i++)F({pat:'drift',pers:'sneak',cloak:1,del:i*1.1,cy:rnd(60,SH-110),sv:rnd(80,110),hp:2,life:30});msg('VEXA\'S CLOAKED SNEAKS!');}
 if(p==='pincer'){for(let i=0;i<6;i++)F({pat:'pincer',ox:(i%3)*40,top:i<3});msg('PINCER ATTACK!');}
 if(p==='snake'){for(let i=0;i<8;i++)F({pat:'snake',del:i*.22,cy});msg('SNAKE FORMATION!');}
 if(p==='mines'){for(let i=0;i<2;i++)F({pat:'hold',kind:'spreader',pers:'brute',big:1,del:i*.9,cy:SH/2-30+(i?70:-70),tx:SW-100-i*50,oy:i*2,hp:6,life:16});msg('GORRK\'S HEAVIES INCOMING!');}
 if(p==='pods'){for(let i=0;i<5;i++)F({pat:'home',kind:'pod',del:i*.6,cy:rnd(50,SH-100),hp:1,life:10});msg('KAMIKAZE DRONES!');}
 M3WAVE(p,F,msg,cy);
 if(p==='rocks'){for(let i=0;i<3;i++)spawnRock();msg('DEBRIS! DODGE IT - LURE THEM INTO IT!');}
 }
function foePos(f){const t=f.age-f.del;if(f.pat==='V'){f.x=SW+40+f.ox-t*110;f.y=f.cy+f.oy+Math.sin(t*1.5)*10;}
 else if(f.pat==='swoop'){f.x=SW+30-t*190;f.y=f.cy+(f.up?-1:1)*Math.sin(t*2.2)*100;}
 else if(f.pat==='dive'){if(f.ty===undefined)f.ty=clamp(sp.y,60,SH-90);const y0=f.top?-20:SH+20;if(t<1.1){f.x=f.sx-t*40;f.y=y0+(f.ty-y0)*Math.sin(t/1.1*Math.PI/2);}else{f.x=f.sx-44-(t-1.1)*280;f.y=f.ty+Math.sin((t-1.1)*3)*20;}}
 else if(f.pat==='behind'){f.x=-30+t*170;f.y=f.cy+Math.sin(t*2)*30;if(f.x>SW+40)f.dead=1;}
 else if(f.pat==='uturn'){if(f.dir<0){f.x=(f.x??SW+30)-130*DT;if(f.x<70){f.dir=1;}}else f.x+=170*DT;f.y=f.cy+Math.sin(t*1.8)*36;if(f.x>SW+50)f.dead=1;}
 else if(f.pat==='pincer'){f.x=SW+40+f.ox-t*150;const k=Math.min(1,t/2.2);f.y=f.top?40+k*(SH/2-80):SH-90-k*(SH/2-80);}
 else if(f.pat==='snake'){f.x=SW+30-t*150;f.y=f.cy+Math.sin(t*3)*80;}
 else if(f.pat==='drift'){f.x=SW+40-t*f.sv;f.y=f.cy+Math.sin(t*.8+f.cy)*14;}
 else if(f.pat==='hold'){f.x=t<12?Math.max(f.tx,SW+40-t*120):f.tx-(t-12)*200;f.y=f.cy+Math.sin(t*1.6+f.oy)*40;}
 else if(f.pat==='loop'){f.x=SW+30-t*175+(t>1&&t<2.6?Math.sin((t-1)/1.6*TAU)*60:0);f.y=f.cy+Math.sin(t*2.4)*70+(t>1&&t<2.6?-Math.cos((t-1)/1.6*TAU)*50+50:0);}
 else if(f.pat==='float'){f.x-=40*DT;f.y+=Math.sin(f.age*2.2)*22*DT;}
 else if(f.pat==='pair'){f.x=SW+40-t*80;f.y=f.cy+f.side*34+Math.sin(t*1.4)*24;}
 else if(f.pat==='home'){if(f.vx===undefined){f.x=SW+30;f.y=f.cy;f.vx=-60;f.vy=0;}const a=Math.atan2(sp.y-f.y,sp.x-f.x),vm=f.spd||170;f.vx+=Math.cos(a)*220*DT;f.vy+=Math.sin(a)*220*DT;const v=Math.hypot(f.vx,f.vy);if(v>vm){f.vx*=vm/v;f.vy*=vm/v;}f.x+=f.vx*DT;f.y+=f.vy*DT;}
 else{const hold=t<4?0:t<11?1:2,cx=hold===0?SW+90-t*(260/4):hold===1?SW-170:SW-170-(t-11)*180,a=f.a0+t*1.7;f.x=cx+Math.cos(a)*62;f.y=f.cy+Math.sin(a)*62;}}
function spawnRock(){return;const r=[8,13,19][Math.random()*3|0];sp.rocks.push({x:SW+40,y:rnd(30,SH-90),vx:-rnd(110,200),vy:rnd(-25,25),r,hp:r>15?5:r>10?3:1,rot:rnd(0,6),vr:rnd(-2,2),junk:sp.sec===0||Math.random()<.25,v:Math.random()*3|0});}
function addCombo(x,y,pts){const s=sp;s.combo++;s.ct=2.6;s.mult=Math.min(5,1+Math.floor(s.combo/6));score+=pts*s.mult;if(pts)s.pops.push({x,y,t:'+'+pts*s.mult,l:.8,c:'#ffc53d'});}
function spawnBoss(type){if(!sp.cut)sp.cut={type,t:0};const s=sp,hpM={carrier:AUTO?24:40,turret:AUTO?30:100,ace:AUTO?26:70,grubb:AUTO?20:45,twins:AUTO?16:60,krool:AUTO?8:16}[type];
 s.boss={type,x:type==='ace'?-80:SW+140,y:type==='ace'?s.y:SH/2-30,t:0,hp:hpM,max:hpM,hit:0,f:2,l:4,mt:3,mode:'spiral',rot:0,warn:0,dash:0,dvx:0,dt:4,sd:1,wp:0,wpn:0,p2:0,tr:0,al:0,pods:type==='carrier'?[{a:0,hp:3,rt:0},{a:Math.PI,hp:3,rt:0}]:null};
 M3BOSSINIT(s.boss);if(type==='turret')s.picks.push({x:SW*.62,y:SH/2+40,k:'fshield'});s.phase='boss';s.banner={t:BOSSNAME[type],l:2.6,big:1};sfx('warn');startMusic('boss',s.bossI);}
function updSpace(dt){const s=sp;if(s.cut){s.cut.t+=dt*(AUTO?3:1);return;}setDims(headI(s));{const h=HEAD[Math.min(2,s.bossI)],k=Math.min(1,dt*(s.phase==='jump'?1.6:6));s.ha+=(h.a-s.ha)*k;s.hr+=(h.r-s.hr)*k;}if(AUTO)autoSpace();
 let ax=(I.R?1:0)-(I.L?1:0),ay=(I.D?1:0)-(I.U?1:0);if(!AUTO){const ca=Math.cos(s.ha),sa=Math.sin(s.ha),lx=ax*ca+ay*sa,ly=(-ax*sa+ay*ca)*(Math.cos(s.hr)>=0?1:-1);ax=lx;ay=ly;}
 if(s.phase==='jump'){s.vx+=(SW/2-s.x)*2*dt;s.vy+=(SH/2-s.y)*2*dt;}
 {const n=Math.hypot(ax,ay)||1,k=Math.min(1,dt*(ax||ay?18:26)),tv=360;s.vx+=(ax/n*tv-s.vx)*k;s.vy+=(ay/n*tv-s.vy)*k;}/* snappy: ~0.1s to top speed, quick stop */
 s.x=clamp(s.x+s.vx*dt,40,SW-80);s.y=clamp(s.y+s.vy*dt,30,SH-60);
 if(s.phase==='fly')s.dist=Math.min(STG[Math.min(2,s.bossI)].b,s.dist+140*(AUTO?8:1)*dt);
 if(s.phase==='jump'){s.dist+=(s.jumpTo-s.dist)*Math.min(1,dt*1.6)+60*dt;if(s.dist>=s.jumpTo-5){s.dist=s.jumpTo;if(s.bossI>=3){s.phase='arrive';s.endT=0;}else{const ox=s.x-SW/2,oy=s.y-SH/2;s.phase='fly';setDims(headI(s));s.x=SW/2+ox;s.y=SH/2+oy;s.ha=HEAD[s.bossI].a;s.hr=HEAD[s.bossI].r;s.x=clamp(s.x,40,SW-80);s.y=clamp(s.y,30,SH-60);s.banner={t:SPM===3&&s.bossI===2?'HEADING: MARS APPROACH':HEAD[s.bossI].n,l:2.2};startMusic('space',s.bossI);}}}
 if(s.shT>0){s.shT-=dt;if(s.shT<=0)s.shield=0;}s.cool-=dt;s.ccool-=dt;s.inv-=dt;s.pw.spread-=dt;s.pw.rapid-=dt;s.pw.charge-=dt;s.ct-=dt;if(s.ct<=0){s.combo=0;s.mult=1;}
 const si=Math.min(2,s.bossI);
 if(si!==s.sec){s.sec=si;s.cp=STG[si].a;s.banner={t:'STAGE '+(si+1)+': '+STG[si].n,l:2.6};if(si>0){s.msgs.push({t:'CHECKPOINT',l:1.6});saveCP(SPM,s.cp);}s.picks.push({x:SW+20,y:rnd(80,SH-120),k:['shield','rapid','charge'][si]});}
 if(si===2&&s.phase==='fly'&&s.dist>BREATHER&&!s.breathe){s.breathe=true;s.msgs.push({t:'HAYES: Quiet out here... too quiet. Stay sharp.',l:3.5});s.picks.push({x:SW+20,y:SH/2-40,k:'shield'},{x:SW+80,y:SH/2+20,k:'spread'},{x:SW+160,y:70,k:'life'});}
 if(s.factI<FACTS.length&&s.dist>=FACTS[s.factI][0]){s.fact={t:FACTS[s.factI][1],l:7};s.factI++;}if(s.fact&&(s.fact.l-=dt)<=0)s.fact=null;if(s.banner&&(s.banner.l-=dt)<=0)s.banner=null;
 if(I.F&&s.cool<=0&&s.phase!=='arrive'){s.shots.push({x:s.x+28,y:s.y-6,vy:0},{x:s.x+28,y:s.y+8,vy:0});if(s.pw.spread>0)s.shots.push({x:s.x+28,y:s.y,vy:-170},{x:s.x+28,y:s.y,vy:170});s.cool=(s.pw.rapid>0?.09:.18)*(UPG(1)?.75:1);sfx('shot');
  if(s.pw.charge>0&&s.ccool<=0){s.ccool=.9;s.shots.push({x:s.x+34,y:s.y,vy:0,big:1,dmg:4,pierce:1,hs:new Set()});sfx('charge');}}
 if(s.phase==='fly')for(const q of GEMSP)if(!(s.gs||(s.gs={}))[q[0]]&&s.dist>=q[1]&&s.dist<q[1]+400){s.gs[q[0]]=1;s.picks.push({x:SW+20,y:q[2]<0?SH+q[2]:q[2],k:'gem',gi:q[0],old:GEMS[SPM][q[0]]});}
 if(s.phase==='fly')for(const w of s.waves)if(!w.go&&s.dist>=w.d){w.go=1;spawnWave(w.p);}
 const rate=[[1.4,2.4],[1.6,2.6],[.7,1.2]][si];if(s.phase==='fly'&&!(si===2&&s.dist>BREATHER)){s.rt-=dt;if(s.rt<=0){s.rt=rnd(rate[0],rate[1]);spawnRock();}}
 if(s.phase==='fly'&&s.bossI<3&&s.dist>=STG[s.bossI].b)spawnBoss(STG[s.bossI].boss);
 for(const b of s.shots){b.x+=(b.big?600:520)*dt;b.y+=(b.vy||0)*dt;}
 const dmgShot=b=>{if(!b.pierce)b.dead=1;return b.dmg||1;};
 const kill=(f,x,y,pts)=>{f.dead=1;if(f.kind==='taxi'){for(let i=0;i<3;i++)s.foes.push({kind:'zib',pat:'home',age:0,del:i*.12,x:f.x,y:f.y,vx:rnd(-40,60),vy:rnd(-90,90),spd:105,hp:1,life:7,pers:'rookie'});s.pops.push({x,y:y-20,t:'BAIL OUT!',l:.9,comic:1,sz:16});}s.pops.push({x,y:y-4,t:['BLAM!','ZAP!','KRAK!','POW!','FWOOM!'][Math.random()*5|0],l:.7,comic:1,rot:rnd(-.3,.2)});s.killed++;stats.kills++;addCombo(x,y,pts);boomAt(s.booms,x,y);sfx('boom');if(Math.random()<.012)s.picks.push({x,y,k:'life'});else if(Math.random()<.09)s.picks.push({x,y,k:['spread','rapid','shield','charge'][Math.random()*4|0]});};
 for(const f of s.foes){f.age+=dt;if(f.age<f.del){f.x=-999;continue;}foePos(f);if(f.dead)continue;if(f.pers==='ace'){const b=s.shots.find(b=>b.x<f.x&&f.x-b.x<110&&Math.abs(b.y-f.y)<20);if(b)f.dg=(f.dg||0)+(f.y>=b.y?1:-1)*260*dt;f.dg=clamp((f.dg||0)*.97,-60,60);f.y+=f.dg;}if(f.panic>0){f.panic-=dt;f.y+=Math.sin(f.age*38)*4;}if(f.say&&(f.say.l-=dt)<=0)f.say=null;f.hit=(f.hit||0)-dt;f.shHit=(f.shHit||0)-dt;const onS=f.x>-10&&f.x<SW+10;
  if(f.kind==='mine'){f.ft=(f.ft??rnd(1,2.5))-dt;if(f.ft<=0&&onS){f.ft=2.6;for(let a=0;a<6;a++)s.eshots.push({x:f.x,y:f.y,vx:Math.cos(a*1.047+f.age)*120,vy:Math.sin(a*1.047+f.age)*120});}}
  else if(f.kind==='spreader'){f.ft=(f.ft??rnd(.8,1.6))-dt;if(f.ft<=0&&onS){f.ft=2.9;const a=Math.atan2(s.y-f.y,s.x-f.x);for(const k of[-.22,0,.22])s.eshots.push({x:f.x-14,y:f.y,vx:Math.cos(a+k)*135,vy:Math.sin(a+k)*135});}}
  else if(f.kind==='bomber'){f.ft=(f.ft??1.4)-dt;if(f.ft<=0&&onS){f.ft=2.5;s.foes.push({kind:'bubble',pat:'float',age:0,del:0,x:f.x-6,y:f.y+18,hp:1,life:10,pers:'rookie'});sfx('blip');}}
  else if(f.kind==='twin'){if(f.pa+f.pb===1){f.spin=(f.spin||0)+dt*5;f.ft=(f.ft??.3)-dt;if(f.ft<=0&&onS){f.ft=.32;s.eshots.push({x:f.x,y:f.y,vx:Math.cos(f.spin)*120,vy:Math.sin(f.spin)*120});}}else if(onS&&Math.random()<dt*.3){const a=Math.atan2(s.y-f.y,s.x-f.x);s.eshots.push({x:f.x-16,y:f.y,vx:Math.cos(a)*140,vy:Math.sin(a)*140});}}
  else if(!['sat','pod','bubble','zib','taxi','sdrone'].includes(f.kind)&&onS&&Math.random()<dt*.25){const a=Math.atan2(s.y-f.y,s.x-f.x);s.eshots.push({x:f.x,y:f.y,vx:Math.cos(a)*145,vy:Math.sin(a)*145});}
  const R={mine:17,sat:22,shield:22,bubble:13,bomber:22,taxi:22,zib:12,sdrone:14,swooper:16}[f.kind]||18;
  if(f.kind==='twin')twinHit(f,kill);else if(f.kind==='sdrone'&&f.side<0&&f.mate&&!f.mate.dead&&!f.dead){for(const b of s.shots)if(!b.dead&&Math.abs(b.x-f.x)<14&&b.y>f.y+12&&b.y<f.mate.y-12){b.dead=1;f.shHit=.15;s.pops.push({x:f.x-20,y:(f.y+f.mate.y)/2,t:'BLOCKED',l:.5,c:'#7ae8ff'});}}
  if(f.kind!=='twin')for(const b of s.shots)if(!b.dead&&!f.dead&&(!b.hs||!b.hs.has(f))&&Math.abs(b.x-f.x)<R+(b.big?8:0)&&Math.abs(b.y-f.y)<(b.big?22:15)){if(b.hs)b.hs.add(f);f.hit=.1;sfx('hit');f.panic=.6;f.cloak=0;
   if(f.kind==='shield'&&(f.dir??-1)<0&&!b.big){b.dead=1;f.shHit=.15;s.pops.push({x:f.x-20,y:f.y-14,t:'BLOCKED',l:.5,c:'#7ae8ff'});continue;}
   f.hp-=dmgShot(b);if(f.hp<=0)kill(f,f.x,f.y,f.kind==='shield'?250:f.kind==='mine'?150:f.kind==='spreader'?200:100);}
  if(!f.dead&&Math.abs(f.x-s.x)<28&&Math.abs(f.y-s.y)<18){hurtShip();kill(f,f.x,f.y,0);}
  if(f.x>30&&f.x<SW)f.seen=1;if(!f.dead&&f.seen&&f.x<-40&&(f.dir??-1)<0&&f.pat!=='behind'&&f.kind!=='bubble'&&f.kind!=='zib'){f.dead=1;breach(f);}if(f.age-f.del>(f.life||18)||f.x<-80)f.dead=1;}
 for(const r of s.rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;r.hit=(r.hit||0)-dt;
  if(!r.dead)for(const f of s.foes)if(!f.dead&&f.age>=f.del&&f.kind!=='sat'&&Math.hypot(f.x-r.x,f.y-r.y)<r.r+14){f.hp-=3;f.hit=.1;r.hp--;if(f.hp<=0){kill(f,f.x,f.y,150);s.pops.push({x:f.x,y:f.y-16,t:'DEBRIS KILL!',l:.9,c:'#5fe36a'});}if(r.hp<=0){r.dead=1;boomAt(s.booms,r.x,r.y,8,'#b8bccc');break;}}
  if(!r.dead&&Math.hypot(r.x-s.x,r.y-s.y)<r.r+14){r.dead=1;hurtShip();boomAt(s.booms,r.x,r.y,8,'#b8bccc');}if(r.x<-40)r.dead=1;}
 for(const q of s.picks){q.x-=70*dt;if(Math.hypot(q.x-s.x,q.y-s.y)<26){q.got=1;sfx('power');if(q.k==='life'){LIVES=Math.min(9,LIVES+1);s.msgs.push({t:'1-UP! EXTRA LIFE',l:1.8});sfx('stinger');}else if(q.k==='fshield'){s.shield=UPG(2)?4:3;s.shT=UPG(2)?12:8;}else if(q.k==='gem'){score+=500;gotGem(SPM,q.gi,s.msgs);}else if(q.k==='shield'){s.shield=3;s.msgs.push({t:'SHIELD BUBBLE!',l:1.4});}else{s.pw[q.k]=20;s.msgs.push({t:{rapid:'RAPID FIRE!',spread:'SPREAD SHOT!',charge:'CHARGE SHOT!'}[q.k],l:1.4});}}}s.picks=s.picks.filter(q=>!q.got&&q.x>-20);
 const B=s.boss;if(B&&!B.dead){B.t+=dt;B.hit-=dt;const hpF=B.hp/B.max;let bx=60,by=34,shieldUp=false;
  if(B.type==='carrier'){B.x+=(SW-130-B.x)*Math.min(1,dt*1.2);B.y=SH/2-30+Math.sin(B.t*.7)*60;
   for(const p of B.pods){p.a+=dt*1.4;p.x=B.x+Math.cos(p.a)*72;p.y=B.y+Math.sin(p.a)*58;if(p.hp<=0){p.rt-=dt;if(p.rt<=0){p.hp=3;}}else shieldUp=true;}
   B.f-=dt;if(B.f<=0){B.f=hpF<.5?1.9:2.5;const a=Math.atan2(s.y-B.y,s.x-B.x);for(let k=-1;k<=1;k++)s.eshots.push({x:B.x-56,y:B.y,vx:Math.cos(a+k*.16)*175,vy:Math.sin(a+k*.16)*175});sfx('hit');}
   B.l-=dt;if(B.l<=0){B.l=5.5;for(let i=0;i<2;i++)s.foes.push({pat:'home',kind:'pod',age:0,del:i*.3,cy:B.y,hp:1,life:9});}
   for(const p of B.pods)if(p.hp>0)for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-p.x,b.y-p.y)<16){p.hp-=dmgShot(b);sfx('hit');if(p.hp<=0){p.rt=11;boomAt(s.booms,p.x,p.y,12,'#7ae8ff');sfx('boom');s.pops.push({x:p.x,y:p.y,t:'SHIELD NODE DOWN',l:.9,c:'#7ae8ff'});}}
   shieldUp=B.pods.every(p=>p.hp>0);bx=62;by=36;}/* one node down drops the shield */
  else if(M3BOSS[B.type]){const r=M3BOSS[B.type](B,dt,hpF);bx=r[0];by=r[1];shieldUp=r[2];}
  else if(B.type==='turret'){B.x+=(SW-120-B.x)*Math.min(1,dt*1.5);B.y=SH/2-30+Math.sin(B.t*.9)*70;B.rot+=dt*(hpF<.5?2.4:1.7)*B.sd;B.mt-=dt;
   if(B.wp<=0&&B.wpn<2&&hpF<(B.wpn?.33:.66)){B.wpn++;B.wp=6;s.picks.push({x:B.x-60,y:clamp(B.y+50,40,SH-80),k:'fshield'});B.mode='core';B.f=.4;sfx('warn');SHAKE=.3;s.pops.push({x:B.x-10,y:B.y-50,t:'KLANG!',l:.9,comic:1,sz:22});}
   if(B.wp>0){B.wp-=dt;B.f-=dt;if(B.f<=0){B.f=1.1;for(let k=0;k<12;k++){const a=k*TAU/12+B.t;s.eshots.push({x:B.x-10,y:B.y,vx:Math.cos(a)*115,vy:Math.sin(a)*115,tb:1});}sfx('hit');}if(B.wp<=0){B.mode='spiral';B.mt=3;}}
   else if(B.mode==='spiral'){B.f-=dt;if(B.f<=0){B.f=.11;const arms=hpF<.5?4:2;for(let k=0;k<arms;k++){const a=B.rot+k*TAU/arms;s.eshots.push({x:B.x-10+Math.cos(a)*30,y:B.y+Math.sin(a)*30,vx:Math.cos(a)*100,vy:Math.sin(a)*100,tb:1});}}if(B.mt<=0){B.mode='missiles';B.mt=2.6;B.f=.2;B.sd=-B.sd;}}
   else if(B.mode==='missiles'){B.f-=dt;if(B.f<=0){B.f=.85;for(const d of[-1,1])s.eshots.push({x:B.x-30,y:B.y+d*26,vx:-90,vy:d*70,ms:1,hm:2.6});sfx('whoosh');}if(B.mt<=0){B.mode='aim';B.mt=2;B.f=.3;}}
   else if(B.mode==='aim'){B.f-=dt;if(B.f<=0){B.f=.6;const a=Math.atan2(s.y-B.y,s.x-B.x);for(const k of[-.2,0,.2])s.eshots.push({x:B.x-60,y:B.y,vx:Math.cos(a+k)*220,vy:Math.sin(a+k)*220,tb:1});sfx('hit');}if(B.mt<=0){B.mode='rest';B.mt=1.2;}}
   else if(B.mt<=0){B.mode='spiral';B.mt=3;}bx=72;by=40;}
  else{if(B.t<2.6){B.al-=dt;if(B.al<=0){B.al=.65;sfx('warn');}}
   if(!B.p2&&hpF<.5){B.p2=1;B.tr=1.8;B.dash=0;B.warn=0;s.eshots=[];sfx('stinger');sfx('bigboom');SHAKE=.8;s.pops.push({x:B.x,y:B.y-60,t:'KRRRSSHH!',l:1.3,comic:1,sz:30});}
   if(B.tr>0){B.tr-=dt;SHAKE=Math.max(SHAKE,.15);B.x+=(SW-150-B.x)*Math.min(1,dt*2);bx=100;by=38;}
   else{if(B.p2){B.cr=(B.cr??1.5)-dt;if(B.cr<=0){B.cr=2.4;for(let k=0;k<10;k++){const a=k*TAU/10+B.t*.5;s.eshots.push({x:B.x-10,y:B.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120});}sfx('hit');}}
   if(B.dash>0){B.dash-=dt;B.x+=B.dvx*(B.p2?1.25:1)*dt;if(B.x<110)B.dvx=Math.abs(B.dvx);}
   else{B.x+=(SW-130-B.x)*Math.min(1,dt*2);B.y+=((s.y+Math.sin(B.t*2.3)*90)-B.y)*Math.min(1,dt*1.8);
    B.f-=dt;if(B.f<=0&&B.warn<=0&&B.t>1.5){B.f=hpF<.5?.8:1.1;for(const d of[-1,0,1]){const a=Math.atan2(s.y-B.y,s.x-B.x)+d*.18;s.eshots.push({x:B.x-24,y:B.y,vx:Math.cos(a)*250,vy:Math.sin(a)*250});}sfx('hit');}
    B.dt-=dt;if(B.dt<=0&&B.warn<=0){B.dt=4.2;B.warn=.8;}}
   if(B.warn>0){B.warn-=dt;if(B.warn<=0){B.dash=1.6;B.dvx=-520;sfx('whoosh');}}B.y=clamp(B.y,50,SH-90);bx=100;by=38;}}
  for(const b of s.shots)if(!b.dead&&(!b.hs||!b.hs.has(B))&&Math.abs(b.x-B.x)<bx&&Math.abs(b.y-B.y)<by){if(b.hs)b.hs.add(B);if(shieldUp){b.dead=1;continue;}let mul=1;if(B.type==='turret'&&B.wp>0)mul=Math.hypot(b.x-(B.x-10),b.y-B.y)<26?2:0;if(B.type==='ace'&&(B.t<2.6||B.tr>0))mul=0;if(!mul){b.dead=1;continue;}B.hp-=dmgShot(b)*mul;B.hit=.08;sfx('hit');if(Math.random()<.15)boomAt(s.booms,b.x,b.y,4);}
  if(!(B.type==='ace'&&B.t<2.6)&&Math.abs(B.x-s.x)<bx&&Math.abs(B.y-s.y)<by)hurtShip();
  if(B.hp<=0){B.dead=1;s.pops.push({x:B.x,y:B.y,t:'KRAKOOM!',l:1.2,comic:1,sz:34});stats.kills++;addCombo(B.x,B.y,3000);for(let i=0;i<8;i++)boomAt(s.booms,B.x+rnd(-50,50),B.y+rnd(-30,30),14);sfx('bigboom');
   s.bossI++;s.cp=STG[s.bossI-1].jump;s.jumpTo=STG[s.bossI-1].jump;s.phase='jump';s.eshots=[];s.banner={t:s.bossI>=3?(SPM===3?'MARS GATE CLEARED!':'KREEL RETREATS!'):(SPM===3?'STATION FREED!':'BOSS DOWN! FULL THRUST!'),l:2.4};s.msgs.push({t:SPM===3?'CLOSER TO MARS!':'CLOSER TO THE MOON!',l:2});if(s.bossI<3)saveCP(SPM,s.cp);if(SPM===3){s.cut={type:'refuel',i:s.bossI-1,t:0,b:0};}}}
 if(s.phase==='arrive'){s.endT+=dt;if(s.endT>(AUTO?1.5:3.5)&&!s.done){s.done=1;shardMoment(SPM,()=>completeMission(SPM));}}
 s.shots=s.shots.filter(b=>!b.dead&&b.x<SW+20&&b.y>-10&&b.y<SH+10);s.foes=s.foes.filter(f=>!f.dead);s.rocks=s.rocks.filter(r=>!r.dead);
 for(const e of s.eshots)if(e.tb&&!e.ms){for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-e.x,b.y-e.y)<9){if(!b.pierce)b.dead=1;e.dead=1;boomAt(s.booms,e.x,e.y,3,'#ff7ab0');score+=10;break;}}
 for(const e of s.eshots)if(e.ms){if(e.hm>0){e.hm-=dt;const cur=Math.atan2(e.vy,e.vx);let d=Math.atan2(s.y-e.y,s.x-e.x)-cur;d=Math.atan2(Math.sin(d),Math.cos(d));const a=cur+clamp(d,-2.3*dt,2.3*dt);e.vx=Math.cos(a)*150;e.vy=Math.sin(a)*150;}
  for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-e.x,b.y-e.y)<12){if(!b.pierce)b.dead=1;e.dead=1;boomAt(s.booms,e.x,e.y,6,'#ff9a3a');sfx('boom');addCombo(e.x,e.y,40);if(Math.random()<.12)s.picks.push({x:e.x,y:e.y,k:'fshield'});break;}}
 for(const e of s.eshots){if(e.dead)continue;e.x+=e.vx*dt;e.y+=e.vy*dt;if(e.bo>0&&(e.y<12&&e.vy<0||e.y>SH-12&&e.vy>0)){e.vy=-e.vy;e.bo--;}if(Math.abs(e.x-s.x)<20&&Math.abs(e.y-s.y)<12){e.dead=1;hurtShip();}
  else if(!e.nm&&Math.abs(e.x-s.x)<34&&Math.abs(e.y-s.y)<26){e.nm=1;s.combo++;s.ct=2.6;s.mult=Math.min(5,1+Math.floor(s.combo/6));score+=50*s.mult;s.pops.push({x:s.x,y:s.y-24,t:'NEAR MISS +'+50*s.mult,l:.7,c:'#ff7ae0'});sfx('near');}}
 s.eshots=s.eshots.filter(e=>!e.dead&&e.x>-10&&e.x<SW+20&&e.y>-10&&e.y<SH+10);
 for(const p of s.booms){p.x+=p.vx*dt;p.y+=p.vy*dt;p.l-=dt;}s.booms=s.booms.filter(p=>p.l>0);
 for(const p of s.pops){p.y-=30*dt;p.l-=dt;}s.pops=s.pops.filter(p=>p.l>0);
 for(const m of s.msgs)m.l-=dt;s.msgs=s.msgs.filter(m=>m.l>0);}
function hurtShip(){const s=sp;if(s.inv>0||AUTO)return;s.combo=0;s.mult=1;if(s.shield>0){s.shield--;s.inv=.8;sfx('hit');return;}s.hp--;s.inv=1.2;sfx('hurt');if(s.hp<=0)loseLife(spaceRespawn);}
function breach(f){const s=sp;s.breachT=1;SHAKE=Math.max(SHAKE,.25);sfx('warn');s.pops.push({x:46,y:clamp(f.y,50,SH-70),t:'BREACH!',l:1,c:'#ff4f7b'});s.combo=0;s.mult=1;if(AUTO||(s.brCD||0)>T)return;s.brCD=T+.5;if(s.shield>0){s.shield--;return;}s.hp--;sfx('hurt');if(s.hp<=0)loseLife(spaceRespawn);}
function spaceRespawn(){const s=sp;s.hp=s.maxhp||5;s.inv=2;s.foes=[];s.rocks=[];s.eshots=[];s.pw={spread:0,rapid:0,charge:0};s.shield=0;
 if(s.phase==='boss'){s.boss.hp=s.boss.max;if(s.boss.pods)s.boss.pods.forEach(p=>{p.hp=6;});}
 else{s.dist=s.cp;s.waves.forEach(w=>{if(w.d>=s.cp)w.go=0;});s.breathe=false;s.factI=FACTS.findIndex(f=>f[0]>=s.cp);if(s.factI<0)s.factI=FACTS.length;}
 s.msgs.push({t:'SHIP REBUILT AT CHECKPOINT - LIVES x'+LIVES,l:2.5});}
const GRAV=520,GROUND=300;let M;
const MSECT=[[0,'LANDING SITE'],[1600,'CLIFFS & CRATERS'],[3700,'OUTPOST EXTERIOR'],[5480,'AIRLOCK B'],[5820,'RESEARCH LABS'],[7000,'REACTOR ROOM'],[7880,'LOW-G DROP SHAFT'],[8740,'SERVICE CORRIDOR'],[9200,'LAVA TUBE'],[12650,'CRATER RIM']];
const INTS=[[5480,5820,68,'air'],[5820,7000,68,'lab'],[7000,7880,-130,'reactor'],[7880,8740,-440,'shaft'],[8740,9200,68,'corr']];
function initMoon(){const G0=GROUND,P=(x,y,w)=>[x,y,w,12],MR=mission===4;
 M={px:235,py:G0,vx:0,vy:0,on:true,face:1,hp:UPG(2)?11:8,maxhp:UPG(2)?11:8,inv:0,cool:0,spread:0,run:0,cam:0,camY:0,shots:[],foes:[],eshots:[],booms:[],picks:[],msgs:[],
 lv:MR?4:2,mars:MR,boss:null,arena:13800,lock:false,shooting:0,safe:235,tipI:0,tip:null,time:0,mv:null,secrets:0,best:0,stuck:0,
 gaps:[[1320,1400],[2150,2260],[2700,3100],[3300,3500],[5000,5080],[9600,9700],[10300,10420],[11400,11800]],
 plats:[P(300,230,100),P(480,180,90),P(650,220,110),P(900,200,90),P(1050,150,100),P(1150,60,60),P(1230,-30,70),P(1250,210,120),P(1440,170,80),
  P(1650,220,90),P(2000,60,70),P(2100,-40,70),P(2300,220,80),P(2550,200,90),P(3150,210,100),P(3550,220,90),
  P(3900,220,100),P(4050,170,100),P(4300,200,100),P(4410,95,100),P(4290,-10,100),P(4410,-115,100),P(4290,-220,100),P(4430,-320,120),P(4610,-330,110),P(4780,-300,110),P(4950,-340,120),P(5120,-380,140),
  P(5900,220,120),P(6100,170,100),P(6300,220,140),P(6550,180,100),P(6750,140,120),
  P(7150,230,100),P(7300,150,100),P(7550,230,100),P(7700,170,90),
  P(7900,200,90),P(8000,95,90),P(7900,-10,90),P(8010,-115,90),P(7920,-220,90),P(8040,-330,140),P(8180,-330,200),P(8640,-150,60),P(8950,220,100),
  P(9450,220,100),P(9800,180,90),P(10000,220,100),P(10550,200,100),P(10750,150,100),P(11000,210,100),P(11200,170,90),P(12000,220,100),P(12200,170,100),
  P(12900,220,100),P(13150,180,100)],
 walls:[[820,G0-60,40,60],[1850,G0-110,100,110],[1950,G0-140,140,140],[2400,G0-130,120,130],[4700,G0-60,40,60],[6450,G0-50,40,50],[8380,-40,40,340],[9900,G0-70,50,70],[10900,G0-110,60,110],[12350,G0-100,50,100]],
 movers:[{x0:2710,y0:250,dx:290,dy:0,w:90,sp:.55,ph:0},{x0:3310,y0:230,dx:100,dy:0,w:80,sp:.8,ph:1},{x0:7420,y0:250,dx:0,dy:-120,w:80,sp:.7,ph:0},{x0:11410,y0:240,dx:260,dy:0,w:90,sp:.5,ph:2}],
 craters:[[700,80],[1150,90],[1750,70],[2600,90],[3620,80],[4550,70],[12900,90],[13300,80]],
 lowg:[[8420,8740]],dark:[9200,12650],lamps:[],
 cps:[140,1700,3750,5600,7050,8800,9260,11000,12700].map(x=>({x,on:x===140}))};
 for(let x=9330;x<12650;x+=320)M.lamps.push(x);
 if(MR)marsLayout(M,P);
 const m=M,gf=[600,760,950,1100,1480,1800,2350,2560,3200,3600,3950,4150,4600,4900,5150,5300,5700,6000,6400,6900,7200,7600,7800,8550,8900,9050,9500,9850,10100,10650,11100,12100,12450,12950,13100,13300,13500];
 const pf=[[700,220],[1300,210],[2030,160],[2460,170],[4100,170],[4665,-330],[4835,-300],[5010,-340],[6150,170],[6360,220],[7350,150],[10600,200],[11040,210],[13200,180]];
 const blk=x=>m.gaps.some(q=>x>q[0]-20&&x<q[1]+20)||m.walls.some(w=>w[3]>40&&x>w[0]-20&&x<w[0]+w[2]+20);
 for(const x of gf)if(!blk(x))m.foes.push({x,y:G0,vx:0,t:rnd(0,9),hp:3,face:-1,mode:'walk',mt:rnd(1,3),flee:Math.random()<.3});
 for(const[x,y]of pf)if(!MR||m.plats.some(q=>x>q[0]&&x<q[0]+q[2]&&Math.abs(q[1]-y)<3))m.foes.push({x,y,vx:0,t:rnd(0,9),hp:3,face:-1,mode:'walk',mt:rnd(1,3),flee:false});
 for(const[x,y]of[[2580,110],[6200,90],[6650,80],[7500,110],[10200,110],[11600,130],[4000,100]])m.foes.push({type:'squid',x,y,x0:x,y0:y,hp:4,t:rnd(0,9),face:-1,ft:rnd(1,2.5)});
 for(const[x,y]of[[1300,150],[2850,160],[3400,140],[7300,90],[7650,120],[7800,150],[9700,150],[10800,110],[12250,110],[13000,150]])m.foes.push({type:'bug',x,y,x0:x,y0:y,hp:2,t:rnd(0,9),face:-1});
 m.picks=[{x:1080,y:130,k:'hp'},{x:1265,y:-60,k:'gem',gi:0},{x:1300,y:-60,k:'life'},{x:10760,y:62,k:'gem',gi:1},{x:5230,y:-410,k:'life'},{x:2135,y:-70,k:'gem',gi:2},{x:2460,y:140,k:'spread'},{x:3600,y:G0-20,k:'hp'},{x:4460,y:75,k:'hp'},{x:5190,y:-410,k:'gem',gi:3},
  {x:6790,y:120,k:'hp'},{x:8670,y:-180,k:'gem',gi:4},{x:10030,y:190,k:'hp'},{x:11230,y:140,k:'hp'},{x:12230,y:140,k:'hp'},{x:13180,y:150,k:'hp'}];
 if(MR)marsify(m);if(!MR)m.tips=[[40,'Welcome to the Moon, Captain. The outpost is ahead. The Vorr overran it, so let\'s take it back.'],[300,'Tap JUMP to hop. Up here you\'ll float!'],[560,'Blob minions! Tap FIRE to blast them.'],
  [880,'HOLD JUMP for a high jump. High ledges often hide goodies.'],[1060,'Pink capsules restore energy. Gold tanks raise your max energy for good.'],[1290,'Zibbits! Those flappy-eared flyers swoop at you. Shoot them down.'],
  [1690,'See that beacon? It\'s a checkpoint. If you go down, we\'ll rebuild you there.'],[2120,'Pit ahead. Fall in and I\'ll beam you back, but it costs energy.'],[2650,'Moving platforms! Time your jump and ride them across.'],
  [3760,'There\'s the outpost. Those ledges climb high. I bet there\'s a gem piece up top...'],[5520,'Airlock B. Careful inside, the Vorr have been busy in the labs.'],[6100,'Squid gunners fire spreads. Keep moving and jump their shots.'],
  [7060,'Reactor room. It\'s still running, so don\'t loiter.'],[7880,'The drop shaft is low-gravity. Climb up, hop in and steer as you float down.'],
  [9230,'A dark tunnel. The Vorr dug in deep here. Stay near the lights.'],[11300,'Another platform ride in the dark. Steady, Captain.'],[12680,'Big Blorp is in the crater ahead. Top up your energy first!']];
 if(MR)m.boss={whale:1,x:m.arena+W/2,y:G0+80,hp:AUTO?24:150,max:AUTO?24:150,stage:1,state:'under',st:1.5,t:0,tel:0,active:false,face:-1,tanks:[0,1,2,3].map(i=>({x:m.arena+90+i*150,y:G0-30,hp:3}))};else m.boss={x:m.arena+260,y:G0,hp:AUTO?20:110,max:AUTO?20:110,state:'idle',st:2,face:-1,t:0,trip:0,active:false,p2:0,tr:0,jy:0,tel:0,cool:{},marks:[]};m.plats.push(P(m.arena+70,196,96),P(m.arena+272,142,96),P(m.arena+474,196,96));}

// ================= MISSION 4: MARS LANDING (colony robots, leader, Dust Whale) =================
const MSECT4=[[0,'LANDING ZONE'],[1600,'RED CANYON'],[3700,'MOUNTAIN COLONY'],[5480,'COLONY GATE'],[5820,'GREENHOUSE LABS'],[7000,'PUMP ROOM'],[7880,'DROP SHAFT'],[8740,'MAINTENANCE TUNNEL'],[9200,'DEEP TUNNELS'],[12650,'WATER CAVERN']];

function marsLayout(m,P){const G0=GROUND,keep=m.plats.filter(q=>q[0]>=3850&&q[0]<=9000);
 m.gaps=[[1100,1190],[1900,2010],[2600,2950],[3350,3470],[5000,5080],[9500,9620],[10450,10570],[11500,11880]];
 m.plats=[P(260,220,100),P(430,170,90),P(600,210,110),P(820,180,90),P(980,130,80),P(1080,210,130),P(1300,220,90),P(1420,150,80),P(1500,75,70),P(1440,-10,90),
  P(1700,200,90),P(1880,140,80),P(2040,200,90),P(2250,220,90),P(2420,190,90),P(2980,210,100),P(3200,170,90),P(3520,220,90),...keep,
  P(9300,220,100),P(9650,190,90),P(9820,220,100),P(10100,170,90),P(10280,210,90),P(10600,200,90),P(10700,130,80),P(10780,60,70),P(11000,210,100),P(11250,170,90),
  P(11950,220,100),P(12150,170,100),P(12400,120,90),P(12900,220,100),P(13150,180,100)];
 m.walls=[[700,G0-60,40,60],[1600,G0-110,100,110],[2150,G0-120,110,120],[4700,G0-60,40,60],[6450,G0-50,40,50],[8380,-40,40,340],[9950,G0-70,50,70],[10850,G0-110,60,110],[12300,G0-100,50,100]];
 m.movers=[{x0:2610,y0:250,dx:250,dy:0,w:90,sp:.55,ph:0},{x0:3345,y0:230,dx:60,dy:0,w:80,sp:.8,ph:1},{x0:7420,y0:250,dx:0,dy:-120,w:80,sp:.7,ph:0},{x0:11510,y0:240,dx:280,dy:0,w:90,sp:.5,ph:2}];
 m.craters=[[520,70],[1250,80],[2300,60],[3100,80],[4550,70],[12700,90],[13300,80]];}
// Mars scenery: canyon spires, the mountain colony face with its door, greenhouse gardens, dust haze
function marsGardens(cx){const G0=GROUND,m=M;
 // greenhouse gardens (5820-7000): rounded glass domes with wilted or blooming plants
 for(const[gx,r]of[[5900,60],[6250,46],[6650,64]]){const X=gx-cx;if(X<-r-20||X>W+r+20)continue;const bloom=m.ldr;
  for(let k=-2;k<=2;k++){const px=X+k*r*.32;g.fillStyle=bloom?'#4ab83a':'#7a6a3a';g.beginPath();g.ellipse(px,G0-14,8,bloom?16:8,bloom?0:.6*k,0,TAU);g.fill();if(bloom){circ(px,G0-30,4,['#ff7ae0','#ffe066','#7ae8ff'][(k+3)%3]);}}
  g.fillStyle='rgba(200,240,255,.18)';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.ellipse(X,G0-6,r,r*.85,0,Math.PI,TAU);g.closePath();g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.45)';g.lineWidth=1.2;for(let i=1;i<4;i++){g.beginPath();g.ellipse(X,G0-6,r*i/4,r*.85,0,Math.PI,TAU);g.stroke();}}
 const sg=5860-cx;if(sg>-150&&sg<W){panel(sg-60,G0-150,120,22,'#5fe36a');txt(m.ldr?'GARDENS: THIRSTY':'GARDENS: NO WATER',sg,G0-139,8,'#e8ffe0');}}
function marsBack(cx){const G0=GROUND,m=M;
 for(const sx of[900,1750,2500,3150]){const X=sx-cx*1;if(X<-120||X>W+120)continue;g.fillStyle=OL;g.beginPath();g.moveTo(X-60,G0);g.quadraticCurveTo(X-50,G0-150,X-14,G0-170);g.quadraticCurveTo(X+30,G0-180,X+46,G0-120);g.quadraticCurveTo(X+60,G0-60,X+66,G0);g.fill();g.fillStyle=lg(g,0,G0-180,0,G0,['#c8643a','#8a3a22']);g.beginPath();g.moveTo(X-56,G0);g.quadraticCurveTo(X-46,G0-146,X-14,G0-166);g.quadraticCurveTo(X+26,G0-176,X+42,G0-120);g.quadraticCurveTo(X+56,G0-60,X+62,G0);g.fill();g.fillStyle='rgba(255,200,150,.25)';g.fillRect(X-40,G0-120,60,6);g.fillRect(X-44,G0-70,80,5);}
 // colony mountain face (3700-5480)
 const A=3660-cx;if(A<W+40&&A+1900>-40){g.fillStyle=OL;g.beginPath();g.moveTo(A,G0);g.lineTo(A+120,G0-260);g.quadraticCurveTo(A+400,G0-560,A+800,G0-620);g.quadraticCurveTo(A+1300,G0-640,A+1650,G0-380);g.lineTo(A+1860,G0);g.fill();
  g.fillStyle=lg(g,0,G0-640,0,G0,['#9a4a2a','#6a2a1a','#4a1a12']);g.beginPath();g.moveTo(A+6,G0);g.lineTo(A+124,G0-254);g.quadraticCurveTo(A+402,G0-552,A+800,G0-612);g.quadraticCurveTo(A+1296,G0-632,A+1644,G0-376);g.lineTo(A+1852,G0);g.fill();
  for(let i=0;i<14;i++){const wx=A+260+(i%7)*170,wy=G0-160-Math.floor(i/7)*150-(i%3)*20;circ(wx,wy,11,OL);circ(wx,wy,8.5,(T*1.5+i|0)%5?'#ffd27a':'#7a4a2a');}
  const dx=A+1800;g.fillStyle=OL;g.beginPath();g.arc(dx,G0,58,Math.PI,TAU);g.fill();g.fillStyle=m.ldr?'#5fe36a':'#3a1a12';g.beginPath();g.arc(dx,G0,50,Math.PI,TAU);g.fill();g.fillStyle='#ffc53d';for(let k=0;k<5;k++)g.fillRect(dx-48+k*20,G0-6,10,6);
  panel(A+150,G0-120,130,22,'#ff7a29');txt('MARS COLONY ONE',A+215,G0-109,8,'#ffc53d');}}

function marsify(m){const G0=GROUND;
 // every other ground walker is a hijacked colony robot; flyers stay goofy Vorr Zibbits
 let k=0;for(const f of m.foes)if(!f.type&&(k++%2===0)){f.bot=1;f.hp=3;f.flee=false;}
 m.gates=[[1600,'A'],[4700,'B'],[9950,'C'],[10850,'D'],[12300,'E']];
 // gem pieces moved to new hiding spots for Mars
 const gp=[[1480,-50],[4330,-250],[8100,-360],[10800,30],[12450,90]];let gi=0;for(const p of m.picks)if(p.k==='gem'){p.gi=gi;[p.x,p.y]=gp[gi];gi++;}
 m.tips=[[40,'Mars, Captain. The colony is built right into that mountain. Something down there has gone very quiet.'],[300,'Same moves as the Moon: JUMP to hop, hold it to go higher.'],
  [560,'Those are our colony robots, with Vorr crystals stuck on them! Zap them to set them free. Don\'t worry, they won\'t break.'],[1290,'Zibbits again. Malakar sent his flyers ahead.'],
  [1700,'Checkpoint beacon. The colony built these too.'],[1900,'A sealed door. Free a robot nearby and it might open a shortcut for you.'],[2650,'Moving platforms. Ride them across the canyon.'],
  [3760,'The colony entrance. Keep your eyes open for gem pieces. And for that Crystal Key.'],[5300,'The colony gate. The leader robot should be just inside.'],
  [6100,'Squid gunners! The Vorr really did move in.'],[7060,'The pump room. Bone dry. Somebody took all the water.'],[7880,'Drop shaft. Float down slowly.'],
  [9230,'Deep tunnels. Stay near the lamps. Something big is swimming through the rock...'],[11300,'Hear that rumble? It\'s getting closer.'],[12680,'The water cavern. Get ready, Captain!']];}
function freeBot(f){const m=M;f.freed=1;f.hp=0;f.vx=0;f.mode='walk';stats.kills++;score+=150;boomAt(m.booms,f.x,f.y-24,10,'#7ae8ff');sfx('power');
 (m.cfx||(m.cfx=[])).push({x:f.x,y:f.y-50,t:['FREE!','YAY!','THANKS!','BEEP BOOP!'][Math.random()*4|0],l:1,rot:rnd(-.2,.2),sz:16});
 const gi=m.gates.findIndex(q=>q[0]>f.x-120&&q[0]<f.x+520);if(gi>=0){const gx=m.gates[gi][0];m.gates.splice(gi,1);const wi=m.walls.findIndex(w=>w[0]===gx);if(wi>=0){m.walls.splice(wi,1);m.msgs.push({t:'ROBOT OPENED A SHORTCUT!',l:2});boomAt(m.booms,gx+30,GROUND-40,14,'#ffe066');}}}
function colonyBot(x,y,t,face,o){g.save();g.translate(x,y);g.scale(face,1);const fr=o.freed,arm=fr?Math.sin(t*10)*.6-1.2:Math.sin(t*4)*.3;
 for(const d of[-8,8]){g.fillStyle=OL;g.beginPath();g.roundRect(d-5,-14,10,14,4);g.fill();g.fillStyle='#8a94b0';g.beginPath();g.roundRect(d-3.5,-12,7,11,3);g.fill();}
 g.fillStyle=OL;g.beginPath();g.roundRect(-17,-44,34,32,10);g.fill();g.fillStyle=o.flash?'#ffffff':lg(g,0,-44,0,-12,fr?['#e8f4ff','#7ab8e8']:['#c8ccd8','#7a8098']);g.beginPath();g.roundRect(-15,-42,30,28,8);g.fill();
 g.fillStyle=fr?'#5fe36a':'#ff9a3a';g.beginPath();g.ellipse(0,-28,6,5,0,0,TAU);g.fill();// chest leaf / warning light
 for(const d of[-1,1]){g.save();g.translate(d*16,-36);g.rotate(d*arm);g.fillStyle=OL;g.beginPath();g.roundRect(-4,-2,8,16,4);g.fill();g.fillStyle='#9aa4c4';g.beginPath();g.roundRect(-2.5,-.5,5,13,3);g.fill();circ(0,15,4,OL);circ(0,15,2.8,'#c8ccd8');g.restore();}
 circ(0,-56,15,OL);g.fillStyle=ballG(g,0,-56,13.5,13.5,o.flash?'#ffffff':fr?'#dff0ff':'#b0b6c8');g.beginPath();g.arc(0,-56,13.5,0,TAU);g.fill();
 g.fillStyle=OL;g.beginPath();g.roundRect(-10,-62,20,10,5);g.fill();const ec=fr?'#7ae8ff':'#ff4f7b';circ(-4,-57,2.6,ec);circ(4,-57,2.6,ec);if(!fr){dglow(0,-57,10,'#ff4f7b',.4);}
 if(fr){g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.arc(0,-51,4,.2,Math.PI-.2);g.stroke();}
 if(!fr){// Vorr crystal stuck on its head
  g.fillStyle=OL;g.beginPath();g.moveTo(-6,-68);g.lineTo(0,-82);g.lineTo(6,-68);g.closePath();g.fill();g.fillStyle='#b04aff';g.beginPath();g.moveTo(-4,-69);g.lineTo(0,-79);g.lineTo(4,-69);g.closePath();g.fill();dglow(0,-74,9,'#d04aff',.5);}
 else{circ(0,-72,3.4,OL);circ(0,-72,2.4,'#5fe36a');g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,-70);g.lineTo(0,-68);g.stroke();}
 g.restore();}
function leaderBot(x,y,t,trapped){g.save();g.translate(x,y);
 if(trapped){dglow(0,-50,50,'#b04aff',.3);g.strokeStyle='#b04aff';g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*10,-100);g.stroke();}}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,-30,26,30,0,0,TAU);g.fill();g.fillStyle=lg(g,0,-60,0,0,['#fff6d8','#d8b060']);g.beginPath();g.ellipse(0,-30,23,27,0,0,TAU);g.fill();
 circ(0,-30,8,OL);circ(0,-30,6,'#5fe36a');
 circ(0,-72,19,OL);g.fillStyle=ballG(g,0,-72,17,17,'#fff0c0');g.beginPath();g.arc(0,-72,17,0,TAU);g.fill();g.fillStyle=OL;g.beginPath();g.roundRect(-12,-80,24,12,6);g.fill();circ(-5,-74,3,'#7ae8ff');circ(5,-74,3,'#7ae8ff');
 g.fillStyle='#5fa040';g.beginPath();g.ellipse(0,-92,22,6,0,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=2;g.stroke();g.fillStyle='#7ad04a';g.beginPath();g.ellipse(0,-97,12,8,0,Math.PI,TAU);g.fill();g.stroke();// gardener hat
 g.fillStyle='#ff7ae0';circ(9,-101,4,OL);circ(9,-101,3,'#ff7ae0');
 g.restore();}
const LEADER=[['Inside the colony gate...','Who\'s there? Oh! Earthlings! Thank you! I am PIP-7, the colony leader. The Vorr turned my robots against us.'],
 ['PIP-7 explains.','We came to Mars to find water and grow gardens. Then a giant DUST WHALE came and gulped ALL our water tanks!'],
 ['PIP-7 explains.','It swallowed a glowing Crystal Key, too. It sleeps in the water cavern, deep in the tunnels. Please save our gardens!'],
 ['cap','A Crystal Key? Then that\'s where we\'re going. Hang tight, PIP-7.']];
function leaderCut(m){const c=m.cut,t=c.t,L=LEADER[c.b];g.fillStyle='rgba(6,4,20,.82)';g.fillRect(0,0,W,H);
 g.fillStyle=OL;g.fillRect(24,44,300,250);g.save();g.beginPath();g.rect(30,50,288,238);g.clip();g.fillStyle=lg(g,0,50,0,288,['#3a1a2a','#7a3020']);g.fillRect(30,50,288,238);
 for(let i=0;i<5;i++){g.fillStyle='#4a8a3a';g.beginPath();g.ellipse(60+i*55,280,18,10+Math.sin(i)*3,0,Math.PI,TAU);g.fill();g.fillStyle='#8a6a3a';g.fillRect(52+i*55,280,16,8);}
 leaderBot(174,272,T,false);g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(30,50,288,238);g.globalAlpha=1;g.restore();caption(L[0]==='cap'?'Captain '+CAPS[cap].name:L[0],36,56,220);
 g.fillStyle=OL;g.fillRect(338,64,278,230);if(L[0]==='cap'){capCard(cap,346,72,130,214);if(t>.3)bubble(L[1],470,96,140,440,170);}else{g.fillStyle='#1c2458';g.fillRect(344,70,266,218);if(t>.3)bubble(L[1],354,90,250,300,250);txt('PIP-7',476,272,11,'#ffe066');}
 sfxText(c.b===0?'RESCUE!':'',W/2,30,22,t,-.08);panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');
 if(cutAdv(t,AUTO&&t>1.6)){c.b++;c.t=0;if(c.b>=LEADER.length){m.cut=null;m.hp=m.maxhp;m.msgs.push({t:'PIP-7 JOINS THE COLONY CHEER! ENERGY FULL',l:2.4});for(const f of m.foes)if(f.bot&&Math.abs(f.x-5650)<700&&!f.freed)freeBot(f);}}}
// ----- Dust Whale: 1) swims through the cavern walls among the hoarded water tanks, 2) sprays water, 3) bursts from the ground; crack its shell
function whaleCut(m){const t=m.cut.t;g.fillStyle='rgba(6,4,20,.8)';g.fillRect(0,0,W,H);g.fillStyle=OL;g.fillRect(24,44,300,250);g.save();g.beginPath();g.rect(30,50,288,238);g.clip();g.fillStyle=lg(g,0,50,0,288,['#5a2a1a','#2a0e0a']);g.fillRect(30,50,288,238);speedLines(174,170,'rgba(255,200,140,.2)');
 dustWhale(174,190,.9,T,{});g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(30,50,288,238);g.globalAlpha=1;g.restore();caption('THE DUST WHALE',36,56,200);if(t>.4)bubble('GLUB GLUB! My water! My shiny crystal! Mine mine MINE!',40,214,250,170,200,true);
 if(t>.5){g.fillStyle=OL;g.fillRect(338,64,278,230);capCard(cap,346,72,130,214);if(t>.9)bubble('Those tanks belong to the colony. Time to give them back!',470,96,140,440,170);txt(CAPS[cap].name,546,260,10,'#ffe066');}
 sfxText('BOSS!',W/2,30,22,t,-.08);panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');if(cutAdv(t,AUTO&&t>2.4))m.cut=null;}
const WST={2:['STAGE 2!','SPLOOSH! Have a bath, Earthling!','It\'s spraying the water. Dodge the arcs!'],3:['STAGE 3!','GRRRUMBLE! You can\'t catch me underground!','Watch the ground shake, then crack that shell!']};
function whaleStageCut(m){const t=m.cut.t,L=WST[m.cut.s];g.fillStyle='rgba(6,4,20,.8)';g.fillRect(0,0,W,H);g.fillStyle=OL;g.fillRect(70,60,500,220);g.save();g.beginPath();g.rect(76,66,488,208);g.clip();g.fillStyle=lg(g,0,66,0,274,['#6a2a1a','#2a0e0a']);g.fillRect(76,66,488,208);speedLines(320,170,'rgba(255,220,160,.2)');
 dustWhale(220,200,.75,T,{angry:1,crack:m.cut.s-1});g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(76,66,488,208);g.globalAlpha=1;g.restore();if(t>.3)bubble(L[1],350,90,200,300,170,true);if(t>.6)caption(L[2],86,240,280);
 sfxText(L[0],W/2,34,26,t,-.08);if(cutAdv(t,AUTO&&t>1.6))m.cut=null;}
function dustWhale(x,y,sc,t,o){g.save();g.translate(x,y);g.scale(sc*(o.face||-1)*-1,sc);const sw=Math.sin(t*3)*.08;g.rotate(sw);
 // tail fin (rounded)
 g.fillStyle=OL;g.beginPath();g.ellipse(112,-6,30,22,.5,0,TAU);g.fill();g.fillStyle='#c08a5a';g.beginPath();g.ellipse(112,-6,26,18,.5,0,TAU);g.fill();
 // body
 g.fillStyle=OL;g.beginPath();g.ellipse(0,0,108,72,0,0,TAU);g.fill();g.fillStyle=o.flash?'#ffffff':lg(g,0,-70,0,70,['#e8b080','#a8683a','#6a3a1a']);g.beginPath();g.ellipse(0,0,103,67,0,0,TAU);g.fill();
 g.fillStyle='#f4dcb8';g.beginPath();g.ellipse(-10,34,80,28,0,0,Math.PI);g.fill();
 // shell plates on its back
 for(let i=0;i<5;i++){const a=Math.PI*1.1+i*.2,px=Math.cos(a)*86,py=Math.sin(a)*56;g.fillStyle=OL;g.beginPath();g.ellipse(px,py,24,15,a+Math.PI/2,0,TAU);g.fill();g.fillStyle=o.flash?'#ffffff':'#7a6a8a';g.beginPath();g.ellipse(px,py,20,12,a+Math.PI/2,0,TAU);g.fill();
  if((o.crack||0)>i*.6){g.strokeStyle='#fff6c0';g.lineWidth=2;g.beginPath();g.moveTo(px-8,py-4);g.lineTo(px,py+2);g.lineTo(px+6,py-6);g.stroke();dglow(px,py,12,'#7ae8ff',.5);}}
 // glowing water belly window + crystal shard
 dglow(10,8,30,'#7ae8ff',.5);circ(10,8,20,OL);g.fillStyle='rgba(120,220,255,.75)';g.beginPath();g.arc(10,8,17,0,TAU);g.fill();g.fillStyle='#b04aff';g.beginPath();g.moveTo(10,-2);g.lineTo(16,8);g.lineTo(10,18);g.lineTo(4,8);g.closePath();g.fill();
 // face
 circ(-64,-18,15,OL);circ(-64,-18,12,'#ffffff');circ(-68,-17,6,OL);circ(-70,-19,2,'#ffffff');
 if(o.angry){g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.moveTo(-80,-38);g.lineTo(-52,-30);g.stroke();}
 g.fillStyle=OL;g.beginPath();g.ellipse(-80,18,20,10,0,0,Math.PI);g.fill();g.fillStyle='#ff6a8a';g.beginPath();g.ellipse(-80,22,12,5,0,0,Math.PI);g.fill();
 // blowhole spout cap and little fins
 circ(-30,-62,7,OL);circ(-30,-62,5,'#5a3a2a');g.fillStyle=OL;g.beginPath();g.ellipse(-10,52,24,10,.4,0,TAU);g.fill();g.fillStyle='#c08a5a';g.beginPath();g.ellipse(-10,52,20,7,.4,0,TAU);g.fill();
 g.restore();}
function waterTank(x,y,full,hit){circ(x,y,23,OL);g.fillStyle=hit?'#ffffff':ballG(g,x,y,21,21,'#a8b4cc');g.beginPath();g.arc(x,y,21,0,TAU);g.fill();g.fillStyle=full?'rgba(90,200,255,.85)':'rgba(40,60,90,.6)';g.beginPath();g.arc(x,y+4,15,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(x-6,y-10,6,3,-.4,0,TAU);g.fill();g.fillStyle=OL;g.fillRect(x-10,y+20,20,8);}
function updWhale(dt){const m=M,b=m.boss,A=m.arena,CF=(x,y,t,sz)=>(m.cfx||(m.cfx=[])).push({x,y,t,l:.9,sz:sz||18,rot:rnd(-.25,.15)});b.t+=dt;b.st-=dt;b.tel-=dt;b.hit=(b.hit||0)-dt;
 const f3=b.hp/b.max;if(b.stage===1&&f3<=2/3){b.stage=2;b.state='spray';b.st=1.2;m.eshots=[];sfx('stinger');m.cut={t:0,k:'wst',s:2};}else if(b.stage===2&&f3<=1/3){b.stage=3;b.state='dig';b.st=1;m.eshots=[];sfx('stinger');m.cut={t:0,k:'wst',s:3};}
 let vul=false;
 if(b.stage===1){// swims in an arc through the cavern walls, visible mid-swim
  if(b.state==='under'){b.y=GROUND+200;if(b.st<=0){b.state='swim';b.st=AUTO?2.4:3.6;b.dir=Math.random()<.5?1:-1;b.face=b.dir;sfx('whoosh');CF(A+W/2,60,'WHOOOSH!',22);}}
  else{const u=1-b.st/(AUTO?2.4:3.6);b.x=A+W/2+b.dir*(u-.5)*(W+260);b.y=GROUND-70-Math.sin(u*Math.PI)*120;vul=u>.12&&u<.88;
   b.sf=(b.sf||0)-dt;if(b.sf<=0&&vul){b.sf=.7;m.eshots.push({x:b.x,y:b.y+30,vx:0,vy:40,g:1,wat:1});}
   if(b.st<=0){b.state='under';b.st=1.2;}}}
 else if(b.stage===2){// surfaces at one side and sprays arcs of water
  const side=b.side||1;b.x+=(A+W/2+side*190-b.x)*Math.min(1,dt*2);b.y+=(GROUND-40-b.y)*Math.min(1,dt*3);b.face=m.px<b.x?-1:1;vul=true;
  b.sf=(b.sf||0)-dt;if(b.sf<=0){b.sf=b.hp/b.max<.5?.9:1.2;const n=AUTO?3:4;for(let i=0;i<n;i++){const vx=b.face*rnd(110,260);m.eshots.push({x:b.x-30*side,y:b.y-70,vx,vy:-rnd(260,360),g:1,wat:1});}sfx('whoosh');if(Math.random()<.4)CF(b.x,b.y-110,'SPLOOSH!',18);}
  b.sw=(b.sw||5)-dt;if(b.sw<=0){b.sw=5;b.side=-side;CF(b.x,b.y-90,'GLUB!',16);}}
 else{// digs underground (rumble trail), bursts out at the player
  if(b.state==='dig'){b.y=GROUND+120;b.x+=clamp(m.px-b.x,-1,1)*190*dt;if((b.t*10|0)%2)addFx(b.x,GROUND,'dust',1);SHAKE=Math.max(SHAKE,.1);if(b.st<=0){b.state='tell';b.st=.7;}}
  else if(b.state==='tell'){if((b.t*14|0)%2)addFx(b.x+rnd(-30,30),GROUND,'dust',1.3);if(b.st<=0){b.state='burst';b.st=AUTO?2.4:2.8;b.vy=-520;b.y=GROUND+60;sfx('bigboom');SHAKE=.6;CF(b.x,GROUND-60,'KA-BLOOSH!',28);for(const d of[-1,1])m.eshots.push({x:b.x+d*60,y:GROUND-6,vx:d*200,vy:0,wave:1});}}
  else if(b.state==='burst'){b.vy+=500*dt;b.y=Math.min(GROUND-50,b.y+b.vy*dt);vul=true;if(b.st<=0){b.state='dig';b.st=AUTO?1:1.8;}}}
 b.x=clamp(b.x,A-200,A+W+200);b.vul=vul;
 for(const q of b.tanks){if(q.hp<=0)continue;for(const s2 of m.shots)if(!s2.dead&&Math.hypot(s2.x-q.x,s2.y-q.y)<22){s2.dead=1;q.hp--;q.hit=.1;if(q.hp<=0){m.hp=Math.min(m.maxhp,m.hp+2);m.msgs.push({t:'WATER TANK SAVED! ENERGY +2',l:1.6});sfx('pick');boomAt(m.booms,q.x,q.y,10,'#7ae8ff');}}q.hit=(q.hit||0)-dt;}
 for(const s2 of m.shots){if(s2.dead||!vul)continue;if(Math.hypot((s2.x-b.x)/1.2,s2.y-b.y)<70){s2.dead=1;b.hp-=b.stage===3?1.5:1;b.hit=.08;sfx('hit');if(Math.random()<.25)CF(b.x+rnd(-40,40),b.y-rnd(20,60),b.stage===3?['CRACK!','KRAK!'][Math.random()*2|0]:['WHAP!','SPLAT!'][Math.random()*2|0],16);}}
 if(vul&&Math.hypot((m.px-b.x)/1.3,m.py-24-b.y)<66)hurt(b.x);
 for(const e of m.eshots)if(e.wave)e.y=GROUND-6;
 if(b.hp<=0&&!b.dead){b.dead=1;b.active=false;m.eshots=[];CF(b.x,b.y-60,'SPLOOOSH!',34);for(let i=0;i<10;i++)boomAt(m.booms,b.x+rnd(-60,60),b.y-rnd(0,80),14,'#7ae8ff');sfx('bigboom');SHAKE=1;score+=4000;setTimeout(()=>shardMoment(4,()=>playComic(MARSWIN,()=>go('victory'))),AUTO?800:2200);}}
function drawWhale(b,cx){if(M.lock){const w=220,x0=W/2-w/2,y0=48,f=clamp(b.hp/b.max,0,1);g.fillStyle=OL;g.fillRect(x0-3,y0-3,w+6,14);g.fillStyle='#3a1a1a';g.fillRect(x0,y0,w,8);g.fillStyle='#7ae8ff';g.fillRect(x0,y0,w*f,8);for(const k of[1/3,2/3]){g.fillStyle=OL;g.fillRect(x0+w*k-1,y0,2,8);}txt('DUST WHALE · STAGE '+b.stage+'/3',W/2,y0+20,9,'#ffe066');}for(const q of b.tanks)waterTank(q.x-cx,q.y,q.hp>0,q.hit>0);
 if(b.stage===1&&b.state==='under')return;if(b.stage===3&&b.state!=='burst'){if(b.state==='tell'){sfxText('!',b.x-cx,GROUND-70,26,.3,0,'#ffe14d','#ff3a3a');}return;}
 g.save();if(b.stage===3){g.beginPath();g.rect(-50,-2000,W+100,GROUND+2000+6);g.clip();}dustWhale(b.x-cx,b.y,b.stage===3?.95:.8,b.t,{face:b.face,flash:b.hit>0,angry:b.stage>1,crack:b.stage===3?(1-b.hp/(b.max/3))*3:0});g.restore();
 if(b.stage===2&&(b.t*2|0)%2===0){dglow(b.x-cx-(b.side||1)*30,b.y-80,18,'#7ae8ff',.6);}}
function solidAt(x,y0,y1){M._mv=null;// returns platform top if falling through between y0..y1
 for(const p of M.movers)if(x>p.x-4&&x<p.x+p.w+4&&y0<=p.y+4&&y1>=p.y-2){M._mv=p;return p.y;}
 for(const p of M.plats)if(x>p[0]-4&&x<p[0]+p[2]+4&&y0<=p[1]+1&&y1>=p[1])return p[1];
 for(const w of M.walls)if(x>w[0]&&x<w[0]+w[2]&&y0<=w[1]+1&&y1>=w[1])return w[1];return null;}
function updMoon(dt){const m=M;if(m.cut){m.cut.t+=dt*(AUTO?3:1);return;}if(AUTO)autoMoon();m.time+=dt;
 for(const p of m.movers){const u=.5-.5*Math.cos(m.time*p.sp+p.ph),nx=p.x0+p.dx*u;p.ddx=p.x===undefined?0:nx-p.x;p.x=nx;p.y=p.y0+p.dy*u;}
 if(m.on&&m.mv){m.px+=m.mv.ddx;m.py=m.mv.y;}
 const ax=(I.R?1:0)-(I.L?1:0);m.vx+=ax*900*dt;if(!ax)m.vx*=m.on?.75:.95;m.vx=clamp(m.vx,-(UPG(4)?160:140),UPG(4)?160:140);if(ax)m.face=ax;if(AUTO&&m.lock&&Math.abs(m.px-(m.boss.x+(m.px<m.boss.x?-100:100)))<20)m.face=m.px<m.boss.x?1:-1;
 if(pressedA)m.jb=.15;else m.jb=(m.jb||0)-dt;if(m.on)m.co=.1;else m.co=(m.co||0)-dt;if(m.jb>0&&m.co>0&&m.vy>=-1){m.vy=UPG(4)?-350:-330;m.on=false;m.jb=0;m.co=0;sfx('jump');}pressedA=false;
 const lowG=m.lowg.some(z=>m.px>z[0]&&m.px<z[1]),g2=(I.J&&m.vy<0?GRAV*.55:GRAV)*(lowG?.3:1);m.vy+=g2*dt;if(lowG)m.vy=Math.min(m.vy,85);// floaty low-gravity, hold to go higher
 let nx=m.px+m.vx*dt;for(const w of m.walls)if(nx+8>w[0]&&nx-8<w[0]+w[2]&&m.py>w[1]+2){nx=m.px;m.vx=0;}
 const minX=m.lock?m.arena:0,maxX=m.lock?m.arena+W-10:m.arena+W-10;m.px=clamp(nx,minX+10,maxX);
 const ny=m.py+m.vy*dt;m.on=false;m.mv=null;if(m.vy>=0){const top=solidAt(m.px,m.py,ny);if(top!==null&&!(I.D&&top<GROUND-1&&!m.walls.some(w=>w[1]===top))){m.py=top;m.vy=0;m.on=true;m.mv=M._mv;}else m.py=ny;}else m.py=ny;
 const inGap=x=>m.gaps.some(q=>x>q[0]&&x<q[1]);
 if(m.py>=GROUND&&m.py<GROUND+14&&!inGap(m.px)){m.py=GROUND;m.vy=0;m.on=true;}
 if(m.py>GROUND+2){const q=m.gaps.find(q=>m.px>q[0]-12&&m.px<q[1]+12);if(q)m.px=clamp(m.px,q[0]+6,q[1]-6);}
 if(m.on&&m.py>=GROUND-1&&!m.gaps.some(q=>m.px>q[0]-60&&m.px<q[1]+60))m.safe=m.px;
 if(m.py>GROUND+150){m.px=m.safe;m.py=GROUND;m.vx=0;m.vy=0;m.on=true;m.inv=1.5;if(!AUTO)m.hp=Math.max(1,m.hp-1);m.msgs.push({t:'BEAMED BACK!',l:1.5});sfx('pick');}
 for(const c of m.cps)if(!c.on&&m.px>c.x-10){c.on=true;m.msgs.push({t:'CHECKPOINT',l:1.6});saveCP(m.lv,m.cps.indexOf(c));sfx('pick');m.hp=Math.min(m.maxhp,m.hp+2);}
 while(m.tipI<m.tips.length&&m.px>m.tips[m.tipI][0]){m.tip={t:m.tips[m.tipI][1],l:5.5};m.tipI++;}if(m.tip&&(m.tip.l-=dt)<=0)m.tip=null;
 m.run+=Math.abs(m.vx)*dt*.12;m.cool-=dt;m.inv-=dt;m.shooting-=dt;
 if(I.F&&m.cool<=0){const y=m.py-24,base={x:m.px+m.face*20,y,vx:m.face*420,vy:0};m.shots.push(base);
  if(m.spread>0){m.shots.push({...base,vy:-110},{...base,vy:110});}m.cool=UPG(1)?.15:.2;m.shooting=.15;sfx('shot');}
 const tc=m.lock?m.arena:clamp(m.px-W*.4,0,m.arena);m.cam+=(tc-m.cam)*Math.min(1,dt*6);
 {const sy=m.py-m.camY,lo=H*.36,hi=H*.70;let ty=m.camY;if(sy<lo)ty=m.py-lo;else if(sy>hi)ty=m.py-hi;if(m.vy>260)ty+=60;else if(m.vy<-200)ty-=30;
  if(m.lock)ty=0;ty=clamp(ty,-720,0);m.camY+=(ty-m.camY)*Math.min(1,dt*(m.vy>260?8:5));}
 if(m.mars&&!m.ldr&&m.px>5560){m.ldr=1;m.cut={t:0,k:'leader',b:0};m.tip=null;}
 if(!m.lock&&m.px>m.arena+120){m.lock=true;m.boss.active=true;m.cut={t:0};m.tip=null;startMusic('boss');}
 for(const b of m.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;}m.shots=m.shots.filter(b=>Math.abs(b.x-m.px)<W);
 // foes
 for(const f of m.foes){f.t+=dt;f.mt-=dt;const d=m.px-f.x,dist=Math.abs(d);
  if(f.type){if(dist>W*1.2){continue;}f.face=Math.sign(d)||1;
   if(f.type==='squid'){f.x+=(clamp(m.px,f.x0-90,f.x0+90)-f.x)*dt*.5;f.y=f.y0+Math.sin(f.t*1.8)*14;f.ft-=dt;if(f.ft<=0&&dist<340&&Math.abs(m.py-f.y)<300){f.ft=2.3;const a=Math.atan2(m.py-24-f.y,d);for(const k of[-.22,0,.22])m.eshots.push({x:f.x+f.face*16,y:f.y,vx:Math.cos(a+k)*170,vy:Math.sin(a+k)*170});sfx('hit');}}
   else{if(dist<240&&Math.abs(m.py-f.y)<200){f.x+=Math.sign(d)*80*dt;f.y+=clamp(m.py-30-f.y,-1,1)*55*dt;}else{f.x+=(f.x0-f.x)*dt*.6;f.y+=(f.y0+Math.sin(f.t*2)*20-f.y)*dt*1.5;}}
   for(const b of m.shots)if(!b.dead&&!f.dead&&Math.abs(b.x-f.x)<22&&Math.abs(b.y-f.y)<22){b.dead=1;f.hp--;f.hit=.12;sfx('hit');if(f.hp<=0){f.dead=1;stats.kills++;score+=f.type==='squid'?120:80;boomAt(m.booms,f.x,f.y,12,f.type==='squid'?'#c070ff':'#d0ff40');(M.cfx||(M.cfx=[])).push({x:f.x,y:f.y-10,t:['SPLAT!','BLAM!','ZAP!','SPLORCH!'][Math.random()*4|0],l:.7,rot:rnd(-.3,.2)});sfx('boom');}}
   f.hit=(f.hit||0)-dt;if(!f.dead&&Math.abs(f.x-m.px)<24&&Math.abs(f.y-(m.py-24))<30)hurt(f.x);continue;}
  if(f.freed){f.vx=0;f.cj=(f.cj||0)-dt;if(f.cj<=0&&f.y>=GROUND-1){f.cj=rnd(.6,1.4);f.jy=1;}continue;}
  if(f.mode==='walk'){if(dist<300){f.face=Math.sign(d)||1;f.vx=f.face*(40+Math.sin(f.t*3)*20);}else f.vx=Math.sin(f.t*.7)*25;
   if(f.flee&&dist<110){f.mode='flee';f.mt=2.5;f.scared=1;}
   if(dist<260&&Math.random()<dt*.35)m.eshots.push({x:f.x,y:f.y-30,vx:f.face*150,vy:-40,g:1,zap:f.bot});
   if(f.mt<=0){f.mt=rnd(2,4);if(Math.random()<.3){f.mode='trip';f.mt=.9;}}}
  else if(f.mode==='flee'){f.face=-Math.sign(d)||1;f.vx=f.face*110;if(f.mt<=0)f.mode='walk',f.scared=0;}
  else if(f.mode==='trip'){f.vx*=.9;if(f.mt<=0)f.mode='walk';}
  const nx2=f.x+f.vx*dt;if(f.y<GROUND){if(!m.plats.some(p=>nx2>p[0]&&nx2<p[0]+p[2]&&Math.abs(p[1]-f.y)<2)&&!m.walls.some(w=>nx2>w[0]+6&&nx2<w[0]+w[2]-6&&Math.abs(w[1]-f.y)<2))f.vx=0;else f.x=nx2;}else if(!m.walls.some(w=>nx2>w[0]-8&&nx2<w[0]+w[2]+8)&&!m.gaps.some(q=>nx2>q[0]-10&&nx2<q[1]+10))f.x=nx2;
  f.x=Math.min(f.x,m.arena-20);
  for(const b of m.shots)if(!b.dead&&Math.abs(b.x-f.x)<26&&b.y>f.y-56&&b.y<f.y){b.dead=1;f.hp--;f.hit=.12;sfx('hit');if(f.hp<=0){if(f.bot){freeBot(f);break;}f.dead=1;stats.kills++;score+=50;boomAt(m.booms,f.x,f.y-12,12,'#5fe36a');(M.cfx||(M.cfx=[])).push({x:f.x,y:f.y-24,t:['BLORP!','POW!','KRAK!'][Math.random()*3|0],l:.7,rot:rnd(-.3,.2)});sfx('boom');}}
  f.hit=(f.hit||0)-dt;if(!f.dead&&!f.freed&&Math.abs(f.x-m.px)<28&&Math.abs(f.y-m.py)<36)hurt(f.x);}
 m.shots=m.shots.filter(b=>!b.dead);m.foes=m.foes.filter(f=>!f.dead);
 for(const e of m.eshots){e.x+=e.vx*dt;if(e.g)e.vy+=200*dt;e.y+=e.vy*dt;if(Math.abs(e.x-m.px)<(e.big?15:10)&&e.y>m.py-34&&e.y<m.py){e.dead=1;hurt(e.x);}if(e.y>GROUND||e.y<m.py-500)e.dead=1;}m.eshots=m.eshots.filter(e=>!e.dead&&Math.abs(e.x-m.px)<W);
 for(const p of m.picks)if(!p.got&&Math.abs(p.x-m.px)<16&&Math.abs(p.y-(m.py-16))<26){p.got=1;sfx(p.k==='hp'?'pick':'power');
  if(p.k==='life'){LIVES=Math.min(9,LIVES+1);m.msgs.push({t:'1-UP! EXTRA LIFE',l:2});}else if(p.k==='hp'){m.hp=Math.min(m.maxhp,m.hp+3);m.msgs.push({t:'ENERGY +3',l:1.5});}else if(p.k==='spread'){m.spread=1;m.msgs.push({t:'SPREAD SHOT!',l:2});}
  else if(p.k==='gem'){m.secrets++;score+=500;m.maxhp+=1;m.hp=m.maxhp;gotGem(m.lv,p.gi,m.msgs);}
  else if(p.k==='tank'){m.secrets++;score+=500;m.maxhp+=2;m.hp=m.maxhp;m.msgs.push({t:'SECRET ENERGY TANK! MAX ENERGY UP',l:2.5});}
  else{m.secrets++;secretFound=true;score+=1000;m.maxhp+=2;m.hp=m.maxhp;m.msgs.push({t:'SECRET: KOSMOS CLUE FOUND! MAX ENERGY UP',l:3});}}
 for(const q of m.booms){q.x+=q.vx*dt;q.y+=q.vy*dt;q.vy+=100*dt;q.l-=dt;}m.booms=m.booms.filter(q=>q.l>0);
 for(const s of m.msgs)s.l-=dt;m.msgs=m.msgs.filter(s=>s.l>0);
 if(m.boss.active)updBoss(dt);}
function hurt(fromX){const m=M;if(m.inv>0||AUTO)return;(M.cfx||(M.cfx=[])).push({x:m.px,y:m.py-40,t:['OOF!','OUCH!'][Math.random()*2|0],l:.7,rot:rnd(-.3,.2)});m.hp--;m.inv=1.2;m.vx=(m.px<fromX?-1:1)*160;m.vy=-150;sfx('hurt');
 if(m.hp<=0&&!m.lock){m.hp=1;loseLife(()=>{const c=[...m.cps].reverse().find(c=>c.on);m.px=c.x+(c.x===140?95:0);m.py=GROUND;m.vx=m.vy=0;m.hp=m.maxhp;m.inv=2;m.eshots=[];m.mv=null;m.msgs.push({t:'REBUILT AT CHECKPOINT',l:2});});}
 if(m.hp<=0){m.hp=1;loseLife(()=>{m.hp=m.maxhp;m.inv=2;m.px=m.arena+40;m.py=GROUND-200;m.msgs.push({t:'TRY AGAIN, CAPTAIN!',l:2});if(m.boss.active){if(m.boss.pl)m.boss.pl.hp=Math.min(m.boss.pl.max,m.boss.pl.hp+4);else m.boss.hp=Math.min(m.boss.max,m.boss.hp+8);}});}}
function updBoss(dt){const b=M.boss,m=M;if(b.whale){updWhale(dt);return;}if(b.pl){updPilot(dt);return;}b.t+=dt;b.st-=dt;b.tel-=dt;const cr=m.arena+330,sp2=b.p2?.7:1,CF=(x,y,t,sz)=>(m.cfx||(m.cfx=[])).push({x,y,t,l:.9,sz:sz||18,rot:rnd(-.25,.15)});
 b.face=b.state==='walk'||b.state==='idle'?(m.px<b.x?-1:1):b.face;
 if(!b.p2&&b.hp<=b.max/2&&b.state!=='leap'&&b.jy===0){b.p2=1;b.state='transform';b.st=2.2;m.eshots=[];sfx('stinger');sfx('bigboom');SHAKE=.9;CF(b.x,b.y-200,'GRAAAWRR!',34);}
 const go2=(st,t,tel)=>{b.state=st;b.st=t;b.tel=tel||0;b.sh=0;b.n=0;};
 if(b.state==='idle'&&b.st<=0){const minions=m.foes.filter(f=>f.bm&&!f.dead).length,opts=['walk','pound','volley','rain'];if(minions<(b.p2?4:2))opts.push('summon');if(b.p2)opts.push('leap','leap','pound');
  let st=opts[Math.random()*opts.length|0];if(st===b.last&&Math.random()<.7)st=opts[Math.random()*opts.length|0];b.last=st;
  if(st==='walk')go2('walk',2*sp2);else if(st==='pound')go2('pound',b.p2?2.7:1.9,.8*sp2);else if(st==='volley')go2('volley',1.6+(b.p2?1:0),.6*sp2);else if(st==='rain'){go2('rain',2.2,1*sp2);b.marks=[m.arena+118,m.arena+320,m.arena+522,clamp(m.px,m.arena+40,m.arena+W-40)];if(b.p2)b.marks.push(m.arena+rnd(40,W-40),m.arena+rnd(40,W-40));}
  else if(st==='summon')go2('summon',1.4,.6);else if(st==='leap'){go2('leap',2,.9);b.lx=clamp(m.px,m.arena+100,m.arena+W-100);b.lx0=b.x;}}
 if(b.state==='transform'){SHAKE=Math.max(SHAKE,.2);if(b.st<=0)go2('idle',.6);}
 else if(b.state==='walk'){b.x+=b.face*(b.p2?115:75)*dt;
  if(Math.abs(b.x-cr)<10&&!b.tripped){b.state='trip';b.st=2.2;b.tripped=1;sfx('boom');CF(b.x,b.y-160,'WHOOPS!',20);}
  if(b.st<=0){go2('idle',.6*sp2);b.tripped=0;}}
 else if(b.state==='pound'){if(b.tel<=0){const u=clamp(-b.tel/.55,0,1);b.jy=-Math.sin(u*Math.PI)*90;if(u>=1&&b.sh<(b.p2?2:1)){b.sh++;b.jy=0;b.tel=b.sh<(b.p2?2:1)?.35:-99;sfx('bigboom');SHAKE=.5;CF(b.x,b.y-40,'KA-THOOM!',24);const v=b.p2?250:200;[-1,1].forEach(d=>m.eshots.push({x:b.x+d*70,y:GROUND-6,vx:d*v,vy:0,wave:1}));}}if(b.st<=0){b.jy=0;go2('idle',.8*sp2);}}
 else if(b.state==='volley'){if(b.tel<=0){b.vf=(b.vf||0)-dt;if(b.vf<=0){b.vf=b.p2?.45:.6;const ox=b.x+b.face*60,oy=b.y-150,a=Math.atan2(m.py-20-oy,m.px-ox);for(const k of(b.p2?[-.24,-.12,0,.12,.24]:[-.16,0,.16]))m.eshots.push({x:ox,y:oy,vx:Math.cos(a+k)*210,vy:Math.sin(a+k)*210,big:0});sfx('hit');CF(ox,oy-20,'PEW!',14);}}if(b.st<=0)go2('idle',.8*sp2);}
 else if(b.state==='rain'){if(b.tel<=0&&!b.sh){b.sh=1;sfx('whoosh');for(const x of b.marks)for(let k=0;k<2;k++)m.eshots.push({x:x+rnd(-8,8),y:-60-k*60,vx:0,vy:60,g:1,cr:1,big:1});CF(m.arena+W/2,40,'KRRAK-A-KRAK!',22);}if(b.st<=0){b.marks=[];go2('idle',.8*sp2);}}
 else if(b.state==='summon'){if(b.tel<=0&&!b.sh){b.sh=1;sfx('warn');CF(b.x,b.y-210,'BLORP BLORP!',20);for(const ex of[m.arena+30,m.arena+W-30])m.foes.push({x:ex,y:GROUND,vx:0,t:rnd(0,9),hp:3,face:ex<b.x?1:-1,mode:'walk',mt:1,flee:false,bm:1});}if(b.st<=0)go2('idle',.6*sp2);}
 else if(b.state==='leap'){if(b.tel<=0){const u=clamp(-b.tel/.8,0,1);b.x=b.lx0+(b.lx-b.lx0)*u;b.jy=-Math.sin(u*Math.PI)*170;if(u>=1&&!b.sh){b.sh=1;b.jy=0;sfx('bigboom');SHAKE=.7;CF(b.x,b.y-40,'KRA-KOOM!',28);[-1,1].forEach(d=>m.eshots.push({x:b.x+d*70,y:GROUND-6,vx:d*230,vy:0,wave:1}));}}if(b.st<=0){b.jy=0;go2('idle',.7);}}
 else if(b.state==='trip'){if(b.st<=0){go2('idle',1);b.tripped=0;}}
 b.x=clamp(b.x,m.arena+100,m.arena+W-100);
 const inv=b.state==='transform';
 for(const s of m.shots)if(!s.dead&&Math.abs(s.x-b.x)<74&&s.y>b.y+b.jy-185&&s.y<b.y+b.jy){s.dead=1;if(inv){CF(s.x,s.y,'TINK!',12);continue;}b.hp-=b.state==='trip'?2:1;if(Math.random()<.3)CF(b.x+rnd(-20,20),b.y-rnd(40,90),['WHAM!','THWACK!','ZAP!'][Math.random()*3|0],16);b.hit=.1;sfx('hit');}
 b.hit=(b.hit||0)-dt;if(Math.abs(m.px-b.x)<62&&m.py>b.y+b.jy-150&&m.py<b.y+b.jy+10)hurt(b.x);
 for(const e of m.eshots)if(e.wave)e.y=GROUND-6;
 if(b.hp<=0&&!b.pl){b.hp=0;m.foes.forEach(f=>{if(f.bm)f.dead=1;});m.eshots=[];CF(b.x,b.y-70,'KRAKOOM!',34);for(let i=0;i<8;i++)boomAt(m.booms,b.x+rnd(-50,50),b.y-rnd(20,130),18);sfx('bigboom');SHAKE=1;score+=3000;
  // two-tier fight: the mech blows apart and the pilot ejects to fight on foot
  b.pl={x:b.x,y:b.y-120,vx:(m.px<b.x?1:-1)*60,vy:-380,hp:AUTO?8:40,max:AUTO?8:40,state:'eject',st:1.6,tel:0,t:0,face:m.px<b.x?-1:1,on:false,sh:0,hit:0,last:''};m.cut={t:0,k:'pilot',d:1.3};}}
function updPilot(dt){const m=M,b=m.boss,p=b.pl;p.t+=dt;p.st-=dt;p.tel-=dt;p.hit-=dt;const CF=(x,y,t,sz)=>(m.cfx||(m.cfx=[])).push({x,y,t,l:.8,sz:sz||16,rot:rnd(-.25,.15)});
 const L=m.arena+40,Rr=m.arena+W-40,low=p.hp<=p.max/2,sp=low?.8:1;
 p.vy+=GRAV*1.25*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.y>=GROUND){if(!p.on&&p.vy>200){addFx(p.x,GROUND,'dust',1.4);}p.y=GROUND;p.vy=0;p.on=true;}else p.on=false;
 if(p.x<L||p.x>Rr){p.x=clamp(p.x,L,Rr);p.vx*=-.5;}if(p.on&&p.state!=='hop')p.vx*=Math.max(0,1-dt*8);
 if(p.state!=='stomp')p.face=m.px<p.x?-1:1;
 const go2=(st,t,tel)=>{p.state=st;p.st=t;p.tel=tel||0;p.sh=0;p.n=0;};
 if(p.state==='eject'&&p.on&&p.st<=0)go2('idle',.6);
 if(p.state==='idle'&&p.st<=0&&p.on){const mn=m.foes.filter(f=>f.bm&&!f.dead).length,o=['hop','hop','ray','ray','stomp'];if(mn<(low?2:1))o.push('summon');let st=o[Math.random()*o.length|0];if(st===p.last)st=o[Math.random()*o.length|0];p.last=st;
  if(st==='hop'){go2('hop',1.6*sp);p.n=low?3:2;}else if(st==='ray')go2('ray',1.4,.45*sp);else if(st==='stomp'){go2('stomp',2.2,.55*sp);p.tx=clamp(m.px,L,Rr);}else go2('summon',1.1,.5);}
 if(p.state==='hop'){if(p.on&&p.n>0&&p.tel<=0){p.n--;p.tel=.18;const dir=Math.random()<.65?(m.px<p.x?-1:1):(Math.random()<.5?-1:1);p.vx=dir*rnd(150,230);p.vy=-rnd(260,360);sfx('jump');}if(p.n<=0&&p.on&&p.tel<=0)go2('idle',.55*sp);}
 else if(p.state==='ray'){if(p.tel<=0&&p.on){p.vf=(p.vf||0)-dt;if(p.vf<=0&&p.sh<(low?4:3)){p.sh++;p.vf=.22;const ox=p.x+p.face*18,oy=p.y-22,a=Math.atan2(m.py-18-oy,m.px-ox);m.eshots.push({x:ox,y:oy,vx:Math.cos(a)*240,vy:Math.sin(a)*240});sfx('hit');}}if(p.st<=0)go2('idle',.7*sp);}
 else if(p.state==='stomp'){if(p.tel<=0&&!p.sh){p.sh=1;p.vy=-470;p.vx=(p.tx-p.x)/1.2;sfx('whoosh');}if(p.sh===1&&p.on&&p.tel<-.15){p.sh=2;p.vx=0;sfx('bigboom');SHAKE=.45;CF(p.x,p.y-30,'STOMP!',22);[-1,1].forEach(d=>m.eshots.push({x:p.x+d*18,y:GROUND-6,vx:d*190,vy:0,wave:1}));}if(p.sh===2&&p.st<=0)go2('idle',.8*sp);if(p.st<=-1)go2('idle',.5);}
 else if(p.state==='summon'){if(p.tel<=0&&!p.sh){p.sh=1;sfx('warn');CF(p.x,p.y-60,'BLORP!',18);for(const ex of[m.arena+30,m.arena+W-30])m.foes.push({x:ex,y:GROUND,vx:0,t:rnd(0,9),hp:2,face:ex<p.x?1:-1,mode:'walk',mt:1,flee:false,bm:1});}if(p.st<=0)go2('idle',.6);}
 for(const s2 of m.shots)if(!s2.dead&&Math.abs(s2.x-p.x)<20&&s2.y>p.y-42&&s2.y<p.y+2){s2.dead=1;if(p.state==='eject')continue;p.hp--;p.hit=.1;sfx('hit');if(Math.random()<.25)CF(p.x+rnd(-14,14),p.y-rnd(30,50),['BONK!','ZAP!','EEP!'][Math.random()*3|0],14);}
 if(p.state!=='eject'&&Math.abs(m.px-p.x)<22&&m.py>p.y-40&&m.py<p.y+8)hurt(p.x);
 for(const e of m.eshots)if(e.wave)e.y=GROUND-6;
 if(p.hp<=0&&!b.dead){b.dead=1;b.active=false;m.foes.forEach(f=>{if(f.bm)f.dead=1;});m.eshots=[];CF(p.x,p.y-40,'KA-BLORP!',30);for(let i=0;i<5;i++)boomAt(m.booms,p.x+rnd(-20,20),p.y-rnd(10,40),12,'#5fe36a');sfx('boom');score+=3000;setTimeout(()=>shardMoment(2,()=>playComic(MOONWIN,()=>go('victory'))),AUTO?800:2200);}}
const MCUT={b:'BLORRRP! You squish my minions? Big Blorp squish YOU!',c:'Big Blorp. This outpost belongs to Earth.'};
function moonCut(m){const t=m.cut.t;if(m.cut.k==='pilot')return pilotCut(m);if(m.cut.k==='leader')return leaderCut(m);if(m.cut.k==='wst')return whaleStageCut(m);if(m.mars)return whaleCut(m);g.fillStyle='rgba(6,4,20,.78)';g.fillRect(0,0,W,H);const e1=1-Math.pow(1-clamp(t/.35,0,1),3),e2=1-Math.pow(1-clamp((t-.5)/.35,0,1),3);
 g.save();g.translate(-(1-e1)*W*.6,0);g.fillStyle=OL;g.fillRect(24,44,300,250);g.save();g.beginPath();g.rect(30,50,288,238);g.clip();g.fillStyle=lg(g,0,50,0,288,['#1a5a2a','#06200e']);g.fillRect(30,50,288,238);speedLines(174,170,'rgba(160,255,140,.2)');
 g.save();g.translate(174,280);g.scale(1.25,1.25);dsp(bossSpr('angry'),0,0);blob(0,-100,T,{r:20,face:-1,angry:1,col:'#4fd65c'});dsp(domeSpr(),0,-100);g.restore();g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(30,50,288,238);g.globalAlpha=1;g.restore();
 caption('BIG BLORP, WARDEN OF THE OUTPOST',36,56,220);if(t>.4)bubble(MCUT.b,40,200,250,170,190,true);g.restore();
 if(t>.5){g.save();g.translate((1-e2)*W*.6,0);g.fillStyle=OL;g.fillRect(338,64,278,230);capCard(cap,346,72,130,214);if(t>.9)bubble(MCUT.c,470,96,140,440,170);txt(CAPS[cap].name,546,260,10,'#ffe066');g.restore();}
 sfxText('BOSS!',W/2,30,22,t,-.08);panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');if(cutAdv(t,AUTO&&t>3.4))m.cut=null;}
function pilotCut(m){const t=m.cut.t,e1=1-Math.pow(1-clamp(t/.35,0,1),3);g.fillStyle='rgba(6,4,20,.8)';g.fillRect(0,0,W,H);
 g.save();g.translate(0,(1-e1)*H);g.fillStyle=OL;g.fillRect(70,40,500,262);g.save();g.beginPath();g.rect(76,46,488,250);g.clip();g.fillStyle=lg(g,0,46,0,296,['#ffd23d','#ff7a29','#c8203a']);g.fillRect(76,46,488,250);speedLines(320,190,'rgba(255,255,255,.28)');
 for(let i=0;i<7;i++){const a=i/7*TAU+T*.3;g.fillStyle=OL;g.beginPath();g.moveTo(320,190);g.lineTo(320+Math.cos(a)*400,190+Math.sin(a)*400);g.lineTo(320+Math.cos(a+.18)*400,190+Math.sin(a+.18)*400);g.fill();}
 for(const[dx,dy,r]of[[-150,40,26],[160,30,22],[-110,-60,16],[130,-70,18]])dsp(bossSpr('trip'),320+dx,190+dy,.28,1,dx*.01);
 g.save();g.translate(320,280);g.scale(3.2,3.2);pilotFig(0,0,T,-1,'idle',false);g.restore();g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(76,46,488,250);g.globalAlpha=1;g.restore();
 caption('THE PILOT EJECTS!',82,52,200);if(t>.5)bubble('You BROKE my robot?! Fine. Big Blorp fight you with FEET!',360,64,190,300,170,true);g.restore();
 sfxText('PHASE 2!',W/2,30,24,t,-.08);if(cutAdv(t,AUTO&&t>2.6))m.cut=null;}
// =================== ART (visual only): smooth hi-res vector style ===================
const RS=3;let DT=1/60,SHAKE=0;const FX=[];const OL='#140c1c',TAU=Math.PI*2;
const _hx={};function hx(c){if(_hx[c])return _hx[c];const s=c.slice(1);return _hx[c]=[parseInt(s.slice(0,2),16),parseInt(s.slice(2,4),16),parseInt(s.slice(4,6),16)];}
function mix(a,b,t){const A=hx(a),B=hx(b);const h=v=>Math.round(v).toString(16).padStart(2,'0');return '#'+h(A[0]+(B[0]-A[0])*t)+h(A[1]+(B[1]-A[1])*t)+h(A[2]+(B[2]-A[2])*t);}
const LT=c=>mix(c,'#ffffff',.5),DK=c=>mix(c,'#1a1030',.45);
function mkc(w,h){const c=document.createElement('canvas');c.width=Math.max(1,w);c.height=Math.max(1,h);return c;}
const SPR=new Map();
function pre(key,w,h,ax,ay,fn){let s=SPR.get(key);if(s)return s;const c=mkc(Math.ceil(w*RS),Math.ceil(h*RS)),x=c.getContext('2d');x.scale(RS,RS);x.translate(ax,ay);x.lineJoin='round';x.lineCap='round';fn(x);s={c,w,h,ax,ay};SPR.set(key,s);return s;}
const WHT=new WeakMap();function white(c){let w=WHT.get(c);if(!w){w=mkc(c.width,c.height);const x=w.getContext('2d');x.drawImage(c,0,0);x.globalCompositeOperation='source-atop';x.fillStyle='#fff';x.fillRect(0,0,c.width,c.height);WHT.set(c,w);}return w;}
function dsp(s,x,y,sc=1,flip=1,rot=0,flash=false,alpha=1){g.save();g.translate(x,y);if(rot)g.rotate(rot);g.scale(sc*flip,sc);if(alpha<1)g.globalAlpha=alpha;g.drawImage(flash?white(s.c):s.c,-s.ax,-s.ay,s.w,s.h);g.restore();}
// vector helpers
function E(x,cx,cy,rx,ry,rot=0){x.beginPath();x.ellipse(cx,cy,Math.max(.1,rx),Math.max(.1,ry),rot,0,TAU);}
function RR(x,a,b,w,h,r){x.beginPath();x.roundRect(a,b,w,h,r);}
function lg(x,x0,y0,x1,y1,st){const q=x.createLinearGradient(x0,y0,x1,y1);st.forEach((c,i)=>q.addColorStop(i/(st.length-1),c));return q;}
function ballG(x,cx,cy,rx,ry,col){const q=x.createRadialGradient(cx-rx*.35,cy-ry*.45,0,cx,cy,Math.max(rx,ry)*1.2);q.addColorStop(0,LT(col));q.addColorStop(.5,col);q.addColorStop(1,DK(col));return q;}
function vG(x,y0,y1,col){return lg(x,0,y0,0,y1,[LT(col),col,DK(col)]);}
function fo(x,fill,lw=1.4){x.fillStyle=fill;x.fill();x.strokeStyle=OL;x.lineWidth=lw;x.stroke();}
function gloss(x,cx,cy,rx,ry,a=.6,rot=-.5){E(x,cx,cy,rx,ry,rot);x.fillStyle=`rgba(255,255,255,${a})`;x.fill();}
function limb(x,x0,y0,x1,y1,w,col){x.lineCap='round';x.strokeStyle=OL;x.lineWidth=w+2.6;x.beginPath();x.moveTo(x0,y0);x.lineTo(x1,y1);x.stroke();x.strokeStyle=col;x.lineWidth=w;x.stroke();
 x.strokeStyle='rgba(255,255,255,.45)';x.lineWidth=w*.28;x.beginPath();x.moveTo(x0-w*.2,y0);x.lineTo(x1-w*.2,y1);x.stroke();}
function smooth(x,pts){x.beginPath();const n=pts.length,m=(a,b)=>[(a[0]+b[0])/2,(a[1]+b[1])/2];let s=m(pts[n-1],pts[0]);x.moveTo(s[0],s[1]);for(let i=0;i<n;i++){const e=m(pts[i],pts[(i+1)%n]);x.quadraticCurveTo(pts[i][0],pts[i][1],e[0],e[1]);}x.closePath();}
// main-canvas shapes
function circ(x,y,r,fill,stroke){g.beginPath();g.arc(x,y,r,0,TAU);if(fill){g.fillStyle=fill;g.fill();}if(stroke){g.strokeStyle=stroke;g.lineWidth=2;g.stroke();}}
const GLOW={};function glow(col){return GLOW[col]||(GLOW[col]=(()=>{const c=mkc(64,64),x=c.getContext('2d'),q=x.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,col);q.addColorStop(.3,col+'99');q.addColorStop(1,col+'00');x.fillStyle=q;x.fillRect(0,0,64,64);return c;})());}
function dglow(x,y,r,col,a=1){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glow(col),x-r,y-r,r*2,r*2);g.restore();}
// ---------- text ----------
const FONTF='"Arial Black","Arial Bold",Gadget,"Helvetica Neue",Arial,sans-serif';
function setF(size){g.font=`900 ${Math.round(size*1.1)}px ${FONTF}`;}
function txt(s,x,y,size=12,col='#fff',al='center'){s=String(s);setF(size);g.textAlign=al;g.textBaseline='middle';g.lineJoin='round';g.lineWidth=Math.max(2.2,size*.3);g.strokeStyle=OL;g.strokeText(s,x,y);g.fillStyle=col;g.fillText(s,x,y);}
function wrap(s,x,y,maxw,size,col,lh){setF(size);const words=s.split(' ');let line='',yy=y;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxw&&line){txt(line,x,yy,size,col);setF(size);line=w;yy+=lh;}else line=t;}if(line)txt(line,x,yy,size,col);}
function panel(x,y,w,h,acc='#45d6ff'){g.save();g.beginPath();g.roundRect(x,y,w,h,10);g.fillStyle=lg(g,0,y,0,y+h,['#1c2a6a','#0c1236','#080c28']);g.fill();
 g.lineWidth=4;g.strokeStyle=OL;g.stroke();g.lineWidth=2;g.strokeStyle=acc;g.beginPath();g.roundRect(x+2,y+2,w-4,h-4,8);g.stroke();
 g.fillStyle='rgba(255,255,255,.07)';g.beginPath();g.roundRect(x+4,y+4,w-8,Math.min(14,h/3),6);g.fill();g.restore();}
// ---------- space backdrop ----------
const stars=[...Array(90)].map(()=>({x:rnd(0,W),y:rnd(0,H),z:rnd(.3,1),c:['#ffffff','#bcd0ff','#ffefc0','#ffc8e0'][Math.random()*4|0]}));
function nebula(){return pre('neb',W,H,0,0,x=>{x.fillStyle=lg(x,0,0,0,H,['#05061c','#0d0b34','#160c3c']);x.fillRect(0,0,W,H);
 const cl=[[120,90,170,'#5a1f8a'],[380,250,210,'#2a1a7a'],[560,80,150,'#8a2470'],[250,300,140,'#1a4a8a'],[620,300,120,'#4a1a7a'],[20,250,120,'#6a1a6a']];
 for(const [a,b,r,c] of cl){const q=x.createRadialGradient(a,b,0,a,b,r);q.addColorStop(0,c+'90');q.addColorStop(.5,c+'40');q.addColorStop(1,c+'00');x.fillStyle=q;x.fillRect(0,0,W,H);}
 for(let i=0;i<420;i++){const a=Math.random()*W,b=Math.random()*H,r=Math.random()*.7+.2;x.fillStyle=`rgba(220,230,255,${Math.random()*.7+.2})`;x.beginPath();x.arc(a,b,r,0,TAU);x.fill();}
 for(let i=0;i<12;i++){const a=Math.random()*W,b=Math.random()*H;const q=x.createRadialGradient(a,b,0,a,b,6);q.addColorStop(0,'#ffffffff');q.addColorStop(1,'#ffffff00');x.fillStyle=q;x.fillRect(a-6,b-6,12,12);x.strokeStyle='rgba(255,255,255,.6)';x.lineWidth=.6;x.beginPath();x.moveTo(a-7,b);x.lineTo(a+7,b);x.moveTo(a,b-7);x.lineTo(a,b+7);x.stroke();}});}
function starfield(off=0){const s=nebula(),o=((off*.15)%(2*W)+2*W)%(2*W);
 for(const ox of[-o,2*W-o]){g.drawImage(s.c,ox,0,W,H);g.save();g.translate(ox+2*W,0);g.scale(-1,1);g.drawImage(s.c,0,0,W,H);g.restore();}
 for(const s2 of stars){const x=((s2.x-off*s2.z)%W+W)%W,r=s2.z>.75?1.4:.8;g.fillStyle=s2.c;g.beginPath();g.arc(x,s2.y,r,0,TAU);g.fill();if(s2.z>.9&&Math.sin(T*3+s2.x)>.7)dglow(x,s2.y,6,'#bcd0ff',.8);}}
// ---------- planets ----------
const CONT=[[[-.55,-.7],[-.25,-.78],[-.08,-.52],[-.3,-.28],[-.18,0],[-.04,.16],[-.14,.46],[-.3,.78],[-.44,.52],[-.46,.2],[-.66,-.04],[-.78,-.4]],
 [[.18,-.66],[.46,-.72],[.62,-.5],[.5,-.3],[.62,-.08],[.56,.26],[.4,.58],[.28,.36],[.18,.06],[.08,-.2],[.24,-.36]],[[.64,.44],[.8,.38],[.88,.6],[.7,.72]]];
function planetSpr(kind){return pre('pl_'+kind,260,260,130,130,x=>{const R=118;
 x.save();E(x,0,0,R,R);x.clip();
 if(kind==='earth'){x.fillStyle=ballG(x,0,0,R,R,'#2a6ad8');x.fillRect(-R,-R,2*R,2*R);
  for(const c of CONT){smooth(x,c.map(p=>[p[0]*R,p[1]*R]));x.fillStyle=lg(x,0,-R,0,R,['#7ad060','#3a9a40','#a08a50']);x.fill();x.strokeStyle='rgba(20,60,30,.5)';x.lineWidth=2;x.stroke();}
  E(x,0,-R*.97,R*.6,R*.13);x.fillStyle='#f4f8ff';x.fill();E(x,0,R*.98,R*.5,R*.1);x.fill();
  x.strokeStyle='rgba(255,255,255,.75)';x.lineCap='round';[[-.2,-.42,.5,.07,-.2,9],[.35,.1,.42,.06,.3,7],[-.45,.3,.35,.05,.4,7],[.1,.62,.45,.05,-.1,6],[.55,-.32,.25,.05,.6,5]].forEach(([a,b,rx,ry,r,w])=>{x.lineWidth=w;x.beginPath();x.ellipse(a*R,b*R,rx*R,ry*R,r,Math.PI*1.1,Math.PI*1.9);x.stroke();});}
 else{x.fillStyle=ballG(x,0,0,R,R,'#a4a8b8');x.fillRect(-R,-R,2*R,2*R);
  [[-.3,-.2,.32,.24],[.25,.25,.28,.2],[.35,-.4,.18,.14]].forEach(([a,b,rx,ry])=>{E(x,a*R,b*R,rx*R,ry*R,.4);x.fillStyle='rgba(70,72,92,.45)';x.fill();});
  [[.3,-.25,.16],[-.38,.32,.13],[.05,.5,.09],[-.15,-.55,.08],[.58,.3,.1],[-.6,-.05,.07],[.1,.05,.06]].forEach(([a,b,r])=>{E(x,a*R,b*R,r*R,r*R*.9);x.fillStyle='#6a6e84';x.fill();E(x,a*R+r*R*.12,b*R+r*R*.12,r*R*.8,r*R*.7);x.fillStyle='#878ba0';x.fill();
   x.strokeStyle='rgba(255,255,255,.35)';x.lineWidth=2;x.beginPath();x.arc(a*R,b*R,r*R,.2,1.9);x.stroke();});}
 const sh=x.createRadialGradient(-R*.45,-R*.45,R*.3,0,0,R*1.15);sh.addColorStop(0,'rgba(0,0,20,0)');sh.addColorStop(.7,'rgba(0,0,20,.15)');sh.addColorStop(1,'rgba(0,0,20,.75)');x.fillStyle=sh;x.fillRect(-R,-R,2*R,2*R);
 gloss(x,-R*.42,-R*.5,R*.28,R*.14,.18);x.restore();
 E(x,0,0,R,R);x.lineWidth=3;x.strokeStyle=kind==='earth'?'rgba(140,210,255,.9)':'rgba(30,30,50,.8)';x.stroke();});}
function earth(x,y,r){if(r<2)return;dglow(x,y,r*1.35,'#3a7aff',.35);dsp(planetSpr('earth'),x,y,r/118);}
function moonBall(x,y,r){if(r<2)return;dsp(planetSpr('moon'),x,y,r/118);}
// ---------- Pale Blue (Bug) ----------
function pilotBust(x,ci){const c=CAPS[ci],sk=c.skin,hr=c.hair,ARM='#8fb8e8';x.save();x.beginPath();x.ellipse(14,-7,14.2,12.2,0,0,TAU);x.clip();
 if(c.style==='pony'){x.beginPath();x.moveTo(11,-12);x.quadraticCurveTo(5,-9,6,-3);x.quadraticCurveTo(9,-6,12,-9);fo(x,hr,.7);}
 RR(x,8,-3.5,15,7,3.4);fo(x,lg(x,0,-3.5,0,4,['#d8ecff',ARM,'#4a78b8']),.9);x.strokeStyle='#ee8a2a';x.lineWidth=.9;x.beginPath();x.moveTo(9.5,-2.2);x.lineTo(21.5,-2.2);x.stroke();
 if(ci===2){RR(x,12,-5,8,2.6,1.2);fo(x,'#e33a2e',.6);}
 limb(x,19,-1,25,1.5,2.6,ARM);E(x,25.6,1.6,1.7,1.5);fo(x,'#9aa0b4',.6);RR(x,22,2.6,8,2.4,1);fo(x,'#3a4660',.6);x.fillStyle='#5fe36a';x.fillRect(24,3.2,1.2,1);x.fillStyle='#ff4f7b';x.fillRect(26.5,3.2,1.2,1);
 RR(x,15,-6,3,3,1);x.fillStyle=sk;x.fill();
 E(x,16.4,-9.6,4.6,5.2);fo(x,ballG(x,16.4,-9.6,4.6,5.2,sk),.8);
 x.fillStyle=hr;x.strokeStyle=OL;x.lineWidth=.6;x.beginPath();
 if(c.style==='goggles'){for(const[a,b,r]of[[13,-13,2.6],[15.5,-14.6,2.8],[18.5,-14.2,2.6],[20.6,-12.4,2],[12,-10.5,2.4],[12.4,-8,2]]){x.moveTo(a+r,b);x.arc(a,b,r,0,TAU);}x.fill();x.stroke();}
 else if(c.style==='short'){x.moveTo(11.6,-7.5);x.lineTo(11.2,-12);x.lineTo(12.4,-15.6);x.lineTo(13.6,-13.6);x.lineTo(15,-16.6);x.lineTo(16.4,-14);x.lineTo(18.4,-16.2);x.lineTo(18.8,-13.6);x.lineTo(21.4,-14.2);x.lineTo(20.6,-11.6);x.quadraticCurveTo(17,-12.6,14.4,-10.6);x.lineTo(13.4,-7.6);x.closePath();x.fill();x.stroke();}
 else{x.moveTo(11.6,-7.5);x.quadraticCurveTo(11,-15,16.4,-15);x.quadraticCurveTo(20.6,-15,21,-11.4);x.quadraticCurveTo(17,-12.4,14.4,-10.4);x.lineTo(13.4,-7.6);x.closePath();x.fill();x.stroke();}
 RR(x,12.6,-13,8.6,1.6,.8);fo(x,'#5a6078',.5);E(x,19.4,-12.3,1.5,1.2);fo(x,'#7fe0ff',.5);E(x,16.4,-12.5,1.1,1);fo(x,'#7fe0ff',.5);
 E(x,12.6,-8.6,2,2.4);fo(x,'#8a92a4',.6);E(x,12.6,-8.6,1,1.3);x.fillStyle='#ee8a2a';x.fill();
 E(x,18.9,-9.2,.95,1.1);x.fillStyle='#1a1030';x.fill();x.fillStyle='#fff';x.fillRect(19,-9.8,.5,.5);E(x,20.6,-9.1,.5,.8);x.fillStyle='#1a1030';x.fill();
 x.strokeStyle=hr;x.lineWidth=.6;x.beginPath();x.moveTo(17.8,-10.8);x.lineTo(19.8,-11);x.stroke();
 if(c.style==='glasses'){x.strokeStyle='#2a1a10';x.lineWidth=.55;x.beginPath();x.arc(19,-9.2,1.7,0,TAU);x.stroke();}
 x.strokeStyle='#7a3a2a';x.lineWidth=.55;x.beginPath();x.moveTo(18.8,-6.8);x.quadraticCurveTo(19.8,-6.2,20.6,-7);x.stroke();
 x.restore();}
function shipSpr(){const ci=cap;return pre('ship2_'+ci,104,72,54,36,x=>{const WB='#a9cdf2',W1='#f2f6fb';
 // wings (behind)
 x.beginPath();x.moveTo(-4,-9);x.quadraticCurveTo(-22,-20,-40,-26);x.quadraticCurveTo(-34,-17,-18,-4);x.closePath();fo(x,lg(x,0,-26,0,-4,['#e8f2ff',WB,'#6a98d0']),1.4);
 x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.4;x.beginPath();x.moveTo(-6,-10);x.quadraticCurveTo(-22,-20,-38,-25);x.stroke();
 // engine pods
 for(const [py,s] of[[-9,.9],[11,1]]){RR(x,-38,py-6*s,22,12*s,6*s);fo(x,lg(x,0,py-6*s,0,py+6*s,['#d0d6e0','#8a92a4','#4a5266']),1.3);
  for(let i=-34;i<-20;i+=4){x.strokeStyle='rgba(20,12,28,.45)';x.lineWidth=.6;x.beginPath();x.moveTo(i,py-5*s);x.lineTo(i,py+5*s);x.stroke();}
  E(x,-38,py,2.6,5*s);fo(x,'#3a4054',1);E(x,-38.5,py,1.6,3.6*s);x.fillStyle='#7fe0ff';x.fill();}
 // hull
 E(x,0,3,31,19);fo(x,lg(x,0,-16,0,22,['#ffffff',W1,'#c8d6ea','#7a90b4']),1.8);
 x.save();E(x,0,3,31,19);x.clip();
 for(const [a,b,c] of[[-26,-16,WB],[-8,4,WB],[10,22,'#dfe9f6']]){x.beginPath();x.ellipse(0,3,31,19,0,0,TAU);x.fillStyle='rgba(0,0,0,0)';x.beginPath();x.moveTo(a,-20);x.quadraticCurveTo(a-4,3,a,24);x.lineTo(b,24);x.quadraticCurveTo(b-4,3,b,-20);x.closePath();x.fillStyle=lg(x,0,-16,0,22,[LT(c),c,DK(c)]);x.globalAlpha=.85;x.fill();x.globalAlpha=1;}
 x.strokeStyle='rgba(30,40,70,.55)';x.lineWidth=.7;for(const a of[-26,-16,-8,4,10,22]){x.beginPath();x.moveTo(a,-20);x.quadraticCurveTo(a-4,3,a,24);x.stroke();}
 x.beginPath();x.moveTo(-31,6);x.quadraticCurveTo(0,12,31,5);x.stroke();
 for(const [a,b] of[[-12,-8],[-2,-10],[-20,-4]]){RR(x,a,b,4,2.2,1);x.fillStyle='#2a3a5a';x.fill();}
 for(const [a,b] of[[-4,10],[14,13]]){RR(x,a,b,7,4,1.2);x.fillStyle='#3a4660';x.fill();x.strokeStyle='#8a96b0';x.lineWidth=.5;for(let i=0;i<3;i++){x.beginPath();x.moveTo(a+1,b+1+i*1.1);x.lineTo(a+6,b+1+i*1.1);x.stroke();}}
 E(x,0,22,30,8);x.fillStyle='rgba(20,30,60,.25)';x.fill();x.restore();
 // white nose cap
 x.beginPath();x.moveTo(20,2);x.quadraticCurveTo(34,0,32,10);x.quadraticCurveTo(28,20,16,18);x.quadraticCurveTo(14,10,20,2);fo(x,lg(x,0,0,0,20,['#ffffff','#e4ecf6','#a8b8d0']),1.3);RR(x,24,9,4,2,1);x.fillStyle='#3a4660';x.fill();
 // bubble cockpit + blue seat
 E(x,14,-7,15,13);x.fillStyle=lg(x,0,-20,0,6,['rgba(170,230,255,.75)','rgba(60,150,220,.6)']);x.fill();
 RR(x,6,-14,9,15,3);fo(x,lg(x,0,-14,0,1,['#5a9aff','#2a5ab8']),1);RR(x,8,-2,12,4,2);fo(x,'#2a5ab8',.9);pilotBust(x,ci);E(x,14,-7,15,13);x.fillStyle='rgba(170,230,255,.16)';x.fill();
 E(x,14,-7,15,13);x.strokeStyle=OL;x.lineWidth=1.6;x.stroke();x.strokeStyle=WB;x.lineWidth=2;x.beginPath();x.ellipse(14,-7,15,13,0,Math.PI*.15,Math.PI*.95);x.stroke();
 gloss(x,9,-14,6,2.6,.85);gloss(x,21,-12,1.6,.9,.9);
 // dish antenna on top
 limb(x,-8,-15,-9,-22,1.6,'#8a92a4');x.save();x.translate(-10,-24);x.rotate(-.3);E(x,0,0,7,3);fo(x,ballG(x,0,0,7,3,'#e8eef8'),1.2);E(x,0,-.4,1.4,1);x.fillStyle='#8a92a4';x.fill();x.restore();
 // bottom wing (front)
 x.beginPath();x.moveTo(-4,12);x.quadraticCurveTo(-24,24,-42,32);x.quadraticCurveTo(-34,22,-16,8);x.closePath();fo(x,lg(x,0,8,0,32,['#e8f2ff',WB,'#5a88c4']),1.4);
 x.strokeStyle='rgba(255,255,255,.85)';x.lineWidth=1.4;x.beginPath();x.moveTo(-6,13);x.quadraticCurveTo(-24,24,-40,31);x.stroke();
 x.strokeStyle='rgba(30,40,70,.45)';x.lineWidth=.6;x.beginPath();x.moveTo(-14,13);x.lineTo(-26,25);x.stroke();});}
function ship(x,y,t,sc=1,flame=1){const s=shipSpr(),f=(1+Math.sin(t*40)*.3)*flame;g.save();g.translate(x,y);g.rotate(Math.sin(t*2)*.04);g.scale(sc,sc);
 for(const o of[-9,11]){dglow(-42-8*f,o,10+7*f,'#3f8cff',.95);g.fillStyle='rgba(200,235,255,.95)';g.beginPath();g.ellipse(-40-4*f,o,4+5*f,2.6,0,0,TAU);g.fill();}
 g.drawImage(s.c,-s.ax,-s.ay,s.w,s.h);const bl=(t*4|0)%2;g.fillStyle=bl?'#ffc53d':'#ff4f7b';g.beginPath();g.arc(-10,-27,1.6,0,TAU);g.fill();if(bl)dglow(-10,-27,6,'#ffc53d',.7);g.restore();}

// ---------- captains: armored suit + glass bubble helmet ----------
const IRIS=['#5a3418','#2f8a4a','#3a2010','#6a5a20'];
const AR='#7cb0ec',AR2='#4f80c4',UND='#5f8fd0',ORG='#ee8a2a',BOOT='#a4a8b2';
const LEGP={idle:[[.08,0],[-.08,0]],run0:[[.62,-.25],[-.5,-.35]],run1:[[.2,-1.0],[-.15,-.2]],run2:[[-.5,-.35],[.62,-.25]],run3:[[-.15,-.2],[.2,-1.0]],jump:[[.55,-1.25],[-.3,-.6]],fall:[[.25,-.4],[-.5,-.3]],hurt:[[-.2,-.3],[-.45,-.1]]};
function plate(x,fill,lw=1.3){fo(x,fill,lw);}
function rivet(x,a,b,r=.7){E(x,a,b,r,r);x.fillStyle='#e8eef8';x.fill();x.strokeStyle='rgba(20,12,28,.6)';x.lineWidth=.4;x.stroke();}
function face(x,c,ci,hx2,hy,hurt,expr,sw){x.save();x.translate(hx2,hy+8);x.scale(1.32,1.32);x.translate(-hx2,-hy-8);const sk=c.skin,hr=c.hair,HG=ballG(x,hx2,hy-5,10,7,hr);
 // back hair layers
 if(c.style==='goggles'){for(let i=0;i<16;i++){const a=i/16*TAU,rr=10.5+Math.sin(i*2.3)*1.2;E(x,hx2-1+Math.cos(a)*rr*.85,hy-3+Math.sin(a)*rr*.8,3.6,3.6);x.fillStyle=HG;x.fill();x.strokeStyle=OL;x.lineWidth=.9;x.stroke();}E(x,hx2-1,hy-3,10,9);x.fillStyle=HG;x.fill();}
 if(c.style==='pony'){const w=(sw-1)*1.6;x.beginPath();x.moveTo(hx2-4,hy-8);x.quadraticCurveTo(hx2-15,hy-12+w,hx2-17,hy+4+w*1.5);x.quadraticCurveTo(hx2-13,hy+1+w,hx2-11,hy+8+w*2);x.quadraticCurveTo(hx2-9,hy-2,hx2-3,hy-4);x.closePath();fo(x,ballG(x,hx2-11,hy-3,7,9,hr),1.1);
  x.strokeStyle=DK(hr);x.lineWidth=.6;x.beginPath();x.moveTo(hx2-6,hy-8);x.quadraticCurveTo(hx2-13,hy-8+w,hx2-15,hy+3+w);x.moveTo(hx2-6,hy-6);x.quadraticCurveTo(hx2-11,hy-4,hx2-12,hy+5+w);x.stroke();E(x,hx2-5,hy-7.5,1.8,2.2);fo(x,ORG,.7);}
 // neck + head
 RR(x,hx2-3,hy+5,6,5,2);fo(x,lg(x,0,hy+5,0,hy+10,[DK(sk),sk]),1);
 E(x,hx2+.5,hy,8,8.6);fo(x,ballG(x,hx2+.5,hy,8,8.6,sk),1.3);x.beginPath();x.moveTo(hx2+8.2,hy+.4);x.quadraticCurveTo(hx2+10.2,hy+2.6,hx2+8.4,hy+3.4);x.fillStyle=sk;x.fill();x.strokeStyle=OL;x.lineWidth=1;x.stroke();
 x.beginPath();x.moveTo(hx2+5,hy+3);x.quadraticCurveTo(hx2+7,hy+8,hx2+2,hy+8.6);x.lineTo(hx2-3,hy+7);fo(x,sk,0);E(x,hx2+5.5,hy+4,1.6,.9);x.fillStyle='rgba(255,120,110,.35)';x.fill();
 // front hair
 x.fillStyle=HG;x.strokeStyle=OL;x.lineWidth=1.1;
 if(c.style==='short'){x.beginPath();x.moveTo(hx2-8,hy+3);x.quadraticCurveTo(hx2-10,hy-10,hx2+1,hy-10.5);x.lineTo(hx2+3,hy-12);x.lineTo(hx2+4.5,hy-10);x.lineTo(hx2+8,hy-10.5);x.lineTo(hx2+7,hy-8);x.quadraticCurveTo(hx2+10,hy-4,hx2+8.5,hy-1);x.lineTo(hx2+6,hy-4.5);x.lineTo(hx2+5,hy-2);x.lineTo(hx2+3,hy-5.5);x.lineTo(hx2+1,hy-3);x.lineTo(hx2-1,hy-6);x.quadraticCurveTo(hx2-4,hy-3,hx2-4.5,hy+3);x.closePath();x.fill();x.stroke();}
 else if(c.style==='pony'){x.beginPath();x.moveTo(hx2-8,hy+4);x.quadraticCurveTo(hx2-10,hy-10,hx2+1,hy-10.5);x.quadraticCurveTo(hx2+10,hy-9,hx2+9,hy+1);x.quadraticCurveTo(hx2+6,hy-6,hx2+1,hy-5.5);x.quadraticCurveTo(hx2+3,hy-3,hx2+2,hy-.5);x.quadraticCurveTo(hx2-2,hy-5,hx2-4,hy-4);x.quadraticCurveTo(hx2-5,hy,hx2-4.5,hy+5);x.closePath();x.fill();x.stroke();}
 else if(c.style==='goggles'){for(let i=0;i<6;i++){E(x,hx2-5+i*2.6,hy-8.5+(i%2)*1.2,2.8,2.8);x.fill();x.stroke();}}
 else{x.beginPath();x.moveTo(hx2-8,hy+2);x.quadraticCurveTo(hx2-10,hy-10,hx2+1,hy-10.5);x.quadraticCurveTo(hx2+10,hy-10,hx2+8.5,hy-1);x.lineTo(hx2+6.5,hy-5);x.lineTo(hx2+4.5,hy-3.5);x.lineTo(hx2+3,hy-6.5);x.lineTo(hx2+.5,hy-4);x.lineTo(hx2-1.5,hy-6.5);x.lineTo(hx2-3,hy-4);x.quadraticCurveTo(hx2-5,hy-1,hx2-4.5,hy+2);x.closePath();x.fill();x.stroke();}
 x.strokeStyle='rgba(255,255,255,.3)';x.lineWidth=.6;x.beginPath();x.moveTo(hx2-5,hy-7);x.quadraticCurveTo(hx2,hy-10,hx2+4,hy-8.5);x.stroke();
 // face
 const ex=hx2+2.4,ey=hy+.6,ir=IRIS[ci];
 if(hurt){x.strokeStyle=OL;x.lineWidth=1.3;for(const a of[ex,ex+4.6]){x.beginPath();x.moveTo(a-1.6,ey-1.8);x.lineTo(a+1.2,ey);x.lineTo(a-1.6,ey+1.8);x.stroke();}E(x,ex+3.4,ey+4.6,1.6,1.5);fo(x,'#6a1428',.8);}
 else{for(const [a,w] of[[ex,2.5],[ex+4.7,1.25]]){E(x,a,ey,w,2.9);x.fillStyle='#fff';x.fill();E(x,a+.5,ey+.3,w*.75,2.3);x.fillStyle=lg(x,0,ey-2,0,ey+2.6,[DK(ir),ir,LT(ir)]);x.fill();E(x,a+.7,ey+.3,w*.38,1.2);x.fillStyle=OL;x.fill();
   E(x,a-.2,ey-1,.65,.75);x.fillStyle='#fff';x.fill();E(x,a+1,ey+1.4,.35,.35);x.fill();
   x.strokeStyle=OL;x.lineWidth=1.3;x.beginPath();x.moveTo(a-w-.4,ey-2.5);x.quadraticCurveTo(a,ey-3.6,a+w+.6,ey-2.2);x.stroke();
   if(c.style==='pony'){x.lineWidth=.8;x.beginPath();x.moveTo(a+w+.4,ey-2.3);x.lineTo(a+w+1.4,ey-3.1);x.stroke();}
   x.strokeStyle=DK(hr);x.lineWidth=1.2;x.beginPath();const bt=expr==='det'?.8:0;x.moveTo(a-w,ey-4.6+(a===ex?bt:0));x.quadraticCurveTo(a,ey-5.6,a+w+.4,ey-4.4+(a===ex?-bt:bt));x.stroke();}
  x.strokeStyle=mix(sk,'#200808',.55);x.lineWidth=.8;x.beginPath();x.moveTo(ex+6.6,ey+1.2);x.lineTo(ex+7.4,ey+2.7);x.lineTo(ex+6.4,ey+3);x.stroke();
  x.strokeStyle='#5a1a20';x.lineWidth=1;x.beginPath();if(expr==='det'){x.moveTo(ex+2.6,ey+5);x.lineTo(ex+5.8,ey+4.6);x.stroke();}else{x.moveTo(ex+2.4,ey+4.6);x.quadraticCurveTo(ex+4.4,ey+5.9,ex+6,ey+4.3);x.stroke();}}
 if(c.freck){x.fillStyle='#a0583a';[[ex-1.6,ey+2.9],[ex-.2,ey+3.3],[ex+1.2,ey+2.9],[ex+4.4,ey+2.8],[ex+5.4,ey+3.1]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,.42,0,TAU);x.fill();});}
 if(c.style==='glasses'&&!hurt){x.strokeStyle='#3a2a20';x.lineWidth=1;E(x,ex,ey,3.1,3.1);x.stroke();E(x,ex+4.8,ey,1.6,2.9);x.stroke();x.beginPath();x.moveTo(ex+3.1,ey-.6);x.lineTo(ex+3.3,ey-.6);x.stroke();x.beginPath();x.moveTo(ex-3.1,ey-.4);x.lineTo(ex-6.5,ey-1.2);x.stroke();gloss(x,ex-1,ey-1.6,1.1,.5,.6);}
 // headset earmuffs + band, goggles on forehead
 x.strokeStyle=OL;x.lineWidth=2.6;x.beginPath();x.arc(hx2-.5,hy-1,9.6,Math.PI*1.05,Math.PI*1.62);x.stroke();x.strokeStyle='#8a90a0';x.lineWidth=1.4;x.stroke();
 E(x,hx2-4.5,hy+.5,2.7,3.4);fo(x,ballG(x,hx2-4.5,hy+.5,2.7,3.4,'#b8bcc8'),1.1);E(x,hx2-4.5,hy+.5,1.3,1.8);fo(x,ORG,.5);
 RR(x,hx2-8.5,hy-8.6,17.5,2.4,1);fo(x,'#3a3a44',.8);
 for(const [a,w] of[[hx2+4.5,3.6],[hx2-1.6,3]]){RR(x,a-w,hy-11.4,w*2,4.6,2.2);fo(x,lg(x,0,hy-11.4,0,hy-6.8,['#cfd6e4','#8a96b0']),1.1);RR(x,a-w+.9,hy-10.6,w*2-1.8,3,1.4);x.fillStyle=lg(x,0,hy-10.6,0,hy-7.6,['#9ad8ff','#2a4a7a']);x.fill();gloss(x,a-w*.4,hy-9.8,w*.35,.5,.8,0);}
 if(c.style==='goggles'){const w=(sw-1)*1.8;x.beginPath();x.moveTo(hx2-5,hy+8);x.quadraticCurveTo(hx2-14,hy+7+w,hx2-21,hy+14-w);x.lineTo(hx2-19,hy+17-w);x.quadraticCurveTo(hx2-12,hy+12,hx2-5,hy+12);x.closePath();fo(x,lg(x,0,hy+6,0,hy+17,['#ff6a5a','#d8302a','#8a1414']),1.1);
  RR(x,hx2-6,hy+7.5,13,4.5,2.2);fo(x,lg(x,0,hy+7.5,0,hy+12,['#ff6a5a','#c8282a']),1.1);x.strokeStyle='#8a1414';x.lineWidth=.5;x.beginPath();x.moveTo(hx2-4,hy+9.5);x.lineTo(hx2+5,hy+10);x.stroke();}}
function capSpr(ci,pose,shoot,ph,sw){return pre(`cap${ci}_${pose}_${shoot}_${ph}_${sw}`,84,84,38,80,x=>{const c=CAPS[ci],hurt=pose==='hurt';
 const run=pose.startsWith('run')?+pose[3]:-1,by=(ph?.8:0)+(run===1||run===3?-1.2:0)+(pose==='jump'?-1.5:0);
 if(hurt){x.translate(0,-2);x.rotate(-.18);}
 const hipY=-21+by,LP=LEGP[pose]||LEGP.idle;
 const leg=(hx,a,k,front)=>{const dk=front?0:.25,kx=hx+Math.sin(a)*9,ky=hipY+Math.cos(a)*9,fx=kx+Math.sin(a+k)*9,fy=ky+Math.cos(a+k)*9,sh=v=>mix(v,'#1a1030',dk);
  limb(x,hx,hipY,kx,ky,7.8,sh(AR));limb(x,kx,ky,fx,fy-2,8.4,sh(AR));x.strokeStyle=sh('#b8c0cc');x.lineWidth=3;x.beginPath();x.moveTo(kx+Math.sin(a+k)*3+1.5,ky+Math.cos(a+k)*3);x.lineTo(fx+1.5,fy-3);x.stroke();
  x.strokeStyle=sh(ORG);x.lineWidth=1.6;x.beginPath();const mx=(kx+fx)/2,my=(ky+fy)/2;x.moveTo(mx-3.5,my);x.lineTo(mx+3.5,my);x.stroke();
  E(x,kx+1,ky,4,3.6);fo(x,ballG(x,kx+1,ky,4,3.6,sh(ORG)),1.1);E(x,kx+1,ky,2,1.7);x.fillStyle=sh(AR);x.fill();
  x.save();x.translate(fx,fy);x.rotate((a+k)*.25);RR(x,-5.5,-6.5,14,8.5,3.8);fo(x,lg(x,0,-6.5,0,2,[LT(sh(BOOT)),sh(BOOT),DK(sh(BOOT))]),1.3);
  RR(x,-6,1,15,2.6,1.2);fo(x,sh(ORG),1);RR(x,-4,-6,5,3,1.2);x.fillStyle=sh(AR);x.fill();rivet(x,5,-3,.6);x.restore();};
 // backpack
 RR(x,-19,-46+by,12,24,6);fo(x,lg(x,-19,0,-7,0,['#d8dde6','#a8b0bc','#6a7282']),1.5);RR(x,-17,-41+by,8,3,1);x.fillStyle=UND;x.fill();x.strokeStyle='rgba(20,12,28,.5)';x.lineWidth=.6;x.beginPath();x.moveTo(-17,-33+by);x.lineTo(-9,-33+by);x.moveTo(-17,-30+by);x.lineTo(-9,-30+by);x.stroke();
 for(const yy of[-47,-23]){E(x,-13,yy+by,5,2.6);fo(x,ballG(x,-13,yy+by,5,2.6,ORG),1.2);}
 rivet(x,-17,-36+by);rivet(x,-9,-36+by);
 // back arm
 const sw2=run>=0?Math.sin(run*Math.PI/2)*.5:0;limb(x,-3,-35+by,-6-sw2*6,-26+by,5.6,mix(UND,'#1a1030',.25));limb(x,-6-sw2*6,-27+by,-6-sw2*7,-23+by,6.2,mix(AR,'#1a1030',.25));E(x,-6-sw2*7,-21.5+by,3.2,3);fo(x,ballG(x,-6,-21.5,3.2,3,'#5a5e6a'),1);
 leg(-2,LP[1][0],LP[1][1],0);
 // torso: undersuit + chest armor + belt
 RR(x,-8.5,-41+by,17,21,6);fo(x,lg(x,-8,0,8,0,[LT(UND),UND,DK(UND)]),1.4);
 x.beginPath();x.moveTo(-7.5,-40+by);x.quadraticCurveTo(0,-43+by,8,-40+by);x.lineTo(8.5,-31+by);x.quadraticCurveTo(0,-27+by,-7,-31+by);x.closePath();fo(x,lg(x,0,-43+by,0,-28+by,[LT(AR),AR,AR2]),1.4);
 x.beginPath();x.moveTo(-1,-39+by);x.lineTo(5,-39+by);x.lineTo(5.5,-33+by);x.lineTo(-.5,-32+by);x.closePath();fo(x,lg(x,0,-39+by,0,-32+by,['#ffb060',ORG,'#b05a10']),1);
 x.strokeStyle='rgba(20,12,28,.45)';x.lineWidth=.6;x.beginPath();x.moveTo(-6,-35+by);x.lineTo(-2,-35+by);x.moveTo(6.5,-36+by);x.lineTo(8,-36+by);x.stroke();rivet(x,-5,-38+by);rivet(x,2,-34.5+by,.6);
 RR(x,-4,-43.5+by,9,3,1.4);fo(x,ORG,1);
 RR(x,-9,-24.5+by,18,4,1.5);fo(x,lg(x,0,-24.5+by,0,-20.5+by,['#8a7a64','#5a4a3a']),1.1);RR(x,-1.5,-24+by,4,3,.8);fo(x,'#c8ccd4',.7);
 for(const px of[-8,4.5]){RR(x,px,-23+by,4,5.5,1.2);fo(x,lg(x,0,-23+by,0,-17.5+by,['#9a9286','#6a6258']),.9);}
 leg(2,LP[0][0],LP[0][1],1);
 // front shoulder pad (kept below the chin)
 E(x,-.5,-36.5+by,7.6,5,-.15);fo(x,lg(x,0,-41.5+by,0,-31.5+by,[LT(AR),AR,AR2]),1.5);x.strokeStyle=ORG;x.lineWidth=1.4;x.beginPath();x.ellipse(-.5,-36.5+by,6.3,3.8,-.15,.3,Math.PI-.3);x.stroke();rivet(x,-3,-38.5+by);gloss(x,-3,-39+by,2.6,1.1,.65);
 // head
 face(x,c,ci,1.5,-55+by,hurt,shoot?'det':'n',sw);x.restore();
 // arm cannon (right arm)
 if(hurt){limb(x,1,-36,5,-44,5.5,UND);E(x,6,-46,4,3.5);fo(x,ballG(x,6,-46,4,3.5,'#5a5e6a'),1);}
 else{const ay=shoot?0:3,rc=shoot?-1.2:0,X0=7+rc,Y0=-39.5+by+ay;limb(x,1,-35+by,X0+1,Y0+6,5.6,UND);
  RR(x,X0,Y0,19,13,6);fo(x,lg(x,0,Y0,0,Y0+13,[LT(AR),AR,AR2,DK(AR2)]),1.5);
  RR(x,X0+3,Y0-.5,4,14,1.6);fo(x,lg(x,0,Y0,0,Y0+13,['#d8dce6','#8a90a0']),.9);RR(x,X0+10,Y0+1,2.2,11,1);x.fillStyle=ORG;x.fill();
  x.strokeStyle='rgba(20,12,28,.5)';x.lineWidth=.6;x.beginPath();x.moveTo(X0+8,Y0+4);x.lineTo(X0+16,Y0+4);x.stroke();rivet(x,X0+14,Y0+9,.6);
  RR(x,X0+16,Y0+1.5,5,10,2.5);fo(x,lg(x,0,Y0,0,Y0+12,['#c8ccd4','#6a7080']),1.2);E(x,X0+21,Y0+6.5,2.4,3.6);fo(x,ballG(x,X0+21,Y0+6.5,2.4,3.6,shoot?'#d8ffff':'#45d6ff'),1);
  gloss(x,X0+6,Y0+2.6,5,1.2,.6,0);}});}
function captain(x,y,c,o={}){const ci=CAPS.indexOf(c),sc=(o.sc||1)*1.22;let pose='idle';
 if(o.hurt)pose='hurt';else if(o.air)pose=o.vy>0?'fall':'jump';else if(o.run)pose='run'+(Math.floor(o.run/1.4)%4);
 const ph=pose==='idle'&&(T*2.5|0)%2?1:0,sh=!!o.shoot&&!o.hurt,sw=(c.style==='pony'||c.style==='goggles')?((T*6+ci)|0)%3:1;const s=capSpr(ci,pose,sh,ph,sw),f=o.face||1;
 if(!o.air){g.fillStyle='rgba(0,0,0,.28)';g.beginPath();g.ellipse(x,y,12*sc,2.5*sc,0,0,TAU);g.fill();}
 dsp(s,x,y,sc,f,0,!!o.flash);
 const by=(ph?.8:0),lx=x+f*-19.5*sc,ly=y+(-41+by)*sc;if(!o.hurt&&(T*2|0)%2)dglow(lx,ly,5*sc,'#7fffa0',.9);
 if(sh){const tx=x+f*28*sc,ty=y-33*sc;dglow(tx,ty,14*sc,'#7fffff',1);g.fillStyle='#fff';g.beginPath();g.ellipse(tx,ty,5*sc,2.2*sc,0,0,TAU);g.fill();g.beginPath();g.ellipse(tx,ty,1.8*sc,5*sc,0,0,TAU);g.fill();}}
const IMG={};function loadImg(k,src){const i=new Image();i.onload=()=>{IMG[k]=i;};i.onerror=()=>{};i.src=src;}
['riley','nova','jax','quinn'].forEach(n=>loadImg(n,'assets/captains/'+n+'.png'));loadImg('title','assets/title.png');loadImg('ship','assets/concept/ship-pale-blue.jpg');
const CAPKEY=['riley','nova','jax','quinn'];
function drawCover(img,x,y,w,h){const s=Math.max(w/img.width,h/img.height),sw=w/s,sh=h/s;g.drawImage(img,(img.width-sw)/2,0,sw,sh,x,y,w,h);}
// ---------- blob minion ----------
function blobSpr(k,sw,eye,col){return pre(`blob${k}_${sw}_${eye}_${col}`,44,52,22,50,x=>{const rx=11+k*.9,ry=10.5-k*.9,cy=-ry-1.5;
 x.strokeStyle=OL;x.lineWidth=3.4;x.beginPath();x.moveTo(0,cy-ry+2);x.quadraticCurveTo(sw*3,cy-ry-6,sw*5,cy-ry-12);x.stroke();x.strokeStyle=DK(col);x.lineWidth=1.6;x.stroke();
 E(x,sw*5,cy-ry-12.5,2.8,2.8);fo(x,ballG(x,sw*5,cy-ry-12.5,2.8,2.8,'#ffc53d'),1);dglowX(x,sw*5,cy-ry-12.5);
 for(const s of[-1,1]){E(x,s*6.5,-1.8,4.5,2.4);fo(x,ballG(x,s*6.5,-1.8,4.5,2.4,DK(col)),1.1);}
 E(x,0,cy,rx,ry);fo(x,ballG(x,0,cy,rx,ry,col),1.8);x.save();E(x,0,cy,rx,ry);x.clip();E(x,rx*.3,cy+ry*.9,rx*1.1,ry*.5);x.fillStyle='rgba(0,40,0,.18)';x.fill();x.restore();gloss(x,-rx*.45,cy-ry*.55,rx*.3,ry*.18,.7);
 const ex=2,ey=cy-1.5,er=eye==='scared'?6:5.2;
 if(eye==='blink'){x.strokeStyle=OL;x.lineWidth=1.6;x.beginPath();x.moveTo(ex-er,ey);x.quadraticCurveTo(ex,ey+2.5,ex+er,ey);x.stroke();}
 else{E(x,ex,ey,er,er);fo(x,ballG(x,ex,ey,er,er,'#f4f6ff'),1.4);const pr=eye==='scared'?1.6:2.6,px=eye==='scared'?ex:ex+1.6;E(x,px,ey,pr*1.25,pr*1.25);x.fillStyle=eye==='angry'?'#c02040':'#3a8a2a';x.fill();E(x,px+.3,ey,pr*.7,pr*.7);x.fillStyle=OL;x.fill();E(x,px-.8,ey-1.2,.9,.9);x.fillStyle='#fff';x.fill();}
 if(eye==='angry'){x.strokeStyle=OL;x.lineWidth=2;x.beginPath();x.moveTo(ex-er,ey-er-.5);x.lineTo(ex+er,ey-er+2.5);x.stroke();}
 if(eye==='scared'){E(x,ex+1,cy+ry*.55,2,2.6);fo(x,'#5a0a18',1);E(x,-rx*.85,cy-ry*.5,1.4,2.2);x.fillStyle='#8fe0ff';x.fill();}
 else{x.strokeStyle=OL;x.lineWidth=1.3;x.beginPath();x.arc(ex+1,cy+ry*.35,3.2,.25,2.9);x.stroke();}});}
function dglowX(x,a,b){const q=x.createRadialGradient(a,b,0,a,b,6);q.addColorStop(0,'rgba(255,220,100,.6)');q.addColorStop(1,'rgba(255,220,100,0)');x.fillStyle=q;x.fillRect(a-6,b-6,12,12);}
function blob(x,y,t,o={}){const sc=(o.r||12)/12,k=clamp(Math.round((Math.sin(t*10)+1)*1.5),0,3),sw=Math.round(Math.sin(t*5)*2)/2,
 eye=o.scared?'scared':o.angry?'angry':((t*.8)%1<.07?'blink':'n'),col=o.col||'#5fe36a';dsp(blobSpr(k,sw,eye,col),x,y,sc,o.face||1,0,!!o.flash);}
function blobFighter(x,y,t){blob(x,y+3,t,{r:6,face:-1});
 const s=pre('saucer',56,26,28,13,c=>{E(c,0,3,24,7);fo(c,ballG(c,0,3,24,7,'#a0a8c8'),1.5);E(c,0,4.5,24,1.8);c.fillStyle='#ff4f7b';c.fill();RR(c,-8,7,16,5,2.5);fo(c,vG(c,7,12,'#5a6280'),1);
  E(c,-4,-3,9,9.5);c.fillStyle='rgba(160,255,190,.22)';c.fill();c.strokeStyle='rgba(20,40,40,.9)';c.lineWidth=1.2;c.beginPath();c.arc(-4,-3,9,Math.PI*1.03,Math.PI*1.97);c.stroke();gloss(c,-8,-8,2.6,1.2,.8);});
 dsp(s,x,y+9,1);const b=(t*6|0)%2;dglow(x-20,y+12,5,b?'#ffc53d':'#ffffff',.9);dglow(x+20,y+12,5,b?'#ffffff':'#ffc53d',.9);}
// ---------- portraits ----------
function portrait(key){return pre('por_'+key,40,40,20,40,x=>{const hay=key==='hayes',c=hay?null:CAPS[+key],skin=hay?'#6b4228':c.skin,uni=hay?'#1f2f6a':'#7fa6d6',tr=hay?'#ffc53d':'#ee8a2a';
 x.save();RR(x,-20,-40,40,40,4);x.clip();x.fillStyle=lg(x,0,-40,0,0,['#2a3a8a','#121a4a']);x.fillRect(-20,-40,40,40);
 x.beginPath();x.moveTo(-19,0);x.quadraticCurveTo(-18,-11,-6,-12);x.lineTo(6,-12);x.quadraticCurveTo(18,-11,19,0);x.closePath();fo(x,lg(x,0,-12,0,0,[LT(uni),uni,DK(uni)]),1.2);
 if(!hay){E(x,-13,-9,7,4.5,-.2);fo(x,ballG(x,-13,-9,7,4.5,uni),1);E(x,13,-9,7,4.5,.2);fo(x,ballG(x,13,-9,7,4.5,uni),1);}
 RR(x,-5,-14,10,4,2);fo(x,tr,1);RR(x,-3.5,-18,7,6,2);fo(x,skin,.9);
 if(c&&c.style==='pony'){x.beginPath();x.moveTo(6,-30);x.quadraticCurveTo(15,-26,12,-14);x.quadraticCurveTo(9,-22,4,-26);fo(x,ballG(x,10,-24,5,7,c.hair),1);}
 E(x,0,-25,8.2,9.2);fo(x,ballG(x,0,-25,8.2,9.2,skin),1.1);
 const hr=hay?'#1c1410':c.hair;x.fillStyle=ballG(x,0,-31,9,6,hr);
 if(hay){x.beginPath();x.moveTo(-8.4,-24);x.quadraticCurveTo(-9,-34,0,-34);x.quadraticCurveTo(9,-34,8.4,-24);x.lineTo(7,-28);x.lineTo(-7,-28);x.closePath();fo(x,x.fillStyle,1);
  x.fillStyle='#c0c4cc';x.fillRect(-8.3,-27,1.8,5);x.fillRect(6.5,-27,1.8,5);RR(x,-10,-38.5,20,8,3);fo(x,vG(x,-38.5,-30.5,'#1f2f6a'),1);RR(x,-11.5,-31.5,23,2.5,1);fo(x,'#121a40',1);E(x,0,-35,2.2,2);fo(x,ballG(x,0,-35,2.2,2,'#ffc53d'),.8);}
 else if(c.style==='glasses'){for(let i=0;i<7;i++){E(x,-8+i*2.7,-32+(i%2),3,3);x.fill();}x.strokeStyle=OL;x.lineWidth=.8;for(let i=0;i<7;i++){x.beginPath();x.arc(-8+i*2.7,-32+(i%2),3,Math.PI,TAU);x.stroke();}}
 else{x.beginPath();x.moveTo(-8.6,-22);x.quadraticCurveTo(-10,-35,0,-35);x.quadraticCurveTo(10,-35,8.6,-22);x.lineTo(6,-28);x.lineTo(3,-26);x.lineTo(1,-29);x.lineTo(-2,-26.5);x.lineTo(-5,-29);x.lineTo(-6.5,-23);x.closePath();fo(x,x.fillStyle,1);
  if(c.style==='goggles'){RR(x,-8.5,-31,17,2.4,1);x.fillStyle='#2a2a2a';x.fill();for(const a of[-3.5,3.5]){E(x,a,-31.5,3,2.5);fo(x,ballG(x,a,-31.5,3,2.5,'#45d6ff'),.8);}}}
 for(const s of[-1,1]){const a=s*3.6;E(x,a,-24,2.5,3);x.fillStyle='#fff';x.fill();E(x,a+s*.2,-23.6,1.9,2.5);x.fillStyle=hay?'#3a2010':IRIS[+key];x.fill();E(x,a,-23.4,.9,1.2);x.fillStyle=OL;x.fill();E(x,a-.7,-24.6,.6,.7);x.fillStyle='#fff';x.fill();
  x.strokeStyle=OL;x.lineWidth=1.1;x.beginPath();x.moveTo(a-2.8,-26.6);x.quadraticCurveTo(a,-27.8,a+2.8,-26.6);x.stroke();
  x.lineWidth=hay?1.4:.9;x.strokeStyle=hay?OL:DK(hr);x.beginPath();x.moveTo(a-2.6,hay?-28.8+s*.0:-29);x.lineTo(a+2.6,hay?(s<0?-28:-29.6)+(s<0?0:1.6):-29.4);x.stroke();}
 x.strokeStyle=mix(skin,'#200808',.5);x.lineWidth=.8;x.beginPath();x.moveTo(-.4,-21.5);x.lineTo(.4,-20.3);x.stroke();x.beginPath();x.moveTo(-2,-18.3);x.quadraticCurveTo(0,hay?-18.4:-17.3,2,-18.3);x.stroke();
 if(c&&c.freck){x.fillStyle='#a0583a';[[-5,-20.5],[-3.6,-20],[3.6,-20],[5,-20.5]].forEach(([a,b])=>{x.beginPath();x.arc(a,b,.45,0,TAU);x.fill();});}
 if(c&&c.style==='glasses'){x.strokeStyle=OL;x.lineWidth=.9;for(const a of[-3.6,3.6]){RR(x,a-3,-26.8,6,5.4,1.6);x.stroke();}x.beginPath();x.moveTo(-.6,-24.5);x.lineTo(.6,-24.5);x.stroke();}
 if(!hay){x.strokeStyle=OL;x.lineWidth=2.6;x.beginPath();x.arc(0,-27,10.5,Math.PI*1.05,Math.PI*1.95);x.stroke();x.strokeStyle='#8a90a0';x.lineWidth=1.4;x.stroke();for(const s2 of[-1,1]){E(x,s2*9,-24,3.2,4.4);fo(x,ballG(x,s2*9,-24,3.2,4.4,'#b8bcc8'),1);}
  RR(x,-9,-34.5,18,2.2,1);fo(x,'#3a3a44',.7);for(const a2 of[-3.8,3.8]){RR(x,a2-3.6,-37.5,7.2,4.6,2.2);fo(x,lg(x,0,-37.5,0,-33,['#cfd6e4','#8a96b0']),1);RR(x,a2-2.7,-36.8,5.4,3,1.4);x.fillStyle=lg(x,0,-36.8,0,-33.8,['#9ad8ff','#2a4a7a']);x.fill();}
  if(c.style==='goggles'){RR(x,-7,-15,14,4.5,2);fo(x,'#d8302a',1);}}
 if(hay){E(x,-12,-6,1.6,1.6);fo(x,'#ffc53d',.6);E(x,-8.5,-6,1.6,1.6);fo(x,'#ffc53d',.6);}
 x.restore();RR(x,-20,-40,40,40,4);x.strokeStyle=OL;x.lineWidth=1.4;x.stroke();});}
// ---------- FX ----------
function addFx(x,y,kind,sz=1){FX.push({x,y,kind,f:0,sz});}
function drawFx(cx){for(const f of FX){f.f+=DT*(f.kind==='dust'?10:14);const k=f.f,x=f.x-cx,y=f.y;
  if(f.kind==='expl'){if(k>7)continue;const r=(6+k*4)*f.sz,a=Math.max(0,1-k/7);
   if(k<2.5)dglow(x,y,r*2.2,'#ffb040',.9*a+.1);
   const q=g.createRadialGradient(x,y,0,x,y,r);q.addColorStop(0,`rgba(255,255,240,${a})`);q.addColorStop(.35,`rgba(255,210,80,${a})`);q.addColorStop(.7,`rgba(255,110,40,${a*.85})`);q.addColorStop(1,'rgba(120,40,60,0)');
   g.fillStyle=q;g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle=`rgba(255,240,200,${a*.7})`;g.lineWidth=2*f.sz;g.beginPath();g.arc(x,y,r*1.25,0,TAU);g.stroke();
   if(k>3){g.fillStyle=`rgba(70,60,80,${a*.7})`;for(let i=0;i<4;i++){g.beginPath();g.arc(x+Math.cos(i*1.7)*r*.6,y+Math.sin(i*1.7)*r*.5-k,r*.35,0,TAU);g.fill();}}}
  else{if(k>5)continue;const s=(3+k*2)*f.sz;g.fillStyle=`rgba(215,218,230,${.55-k*.1})`;g.beginPath();g.ellipse(x,y-s*.4,s*1.2,s*.6,0,0,TAU);g.fill();g.beginPath();g.arc(x+s*.5,y-s*.8,s*.5,0,TAU);g.fill();}}
 for(let i=FX.length-1;i>=0;i--)if(FX[i].f>7.2)FX.splice(i,1);}
function debris(arr,cx){for(const q of arr){if(!q._s){q._s=1;q.rt=rnd(0,6);if(!FX.some(f=>f.kind==='expl'&&f.f<1&&Math.abs(f.x-q.x)<26&&Math.abs(f.y-q.y)<26))addFx(q.x,q.y,'expl',1.2);}
  const s=q.l>.4?4:2.5;g.save();g.translate(q.x-cx,q.y);g.rotate(q.rt+T*6);g.fillStyle=OL;g.fillRect(-s/2-1,-s/2-1,s+2,s+2);g.fillStyle=q.l>.45?'#fff2a0':q.c==='#fff'?'#ff8a3a':q.c;g.fillRect(-s/2,-s/2,s,s);g.restore();}}
function bolt(x,y,big){dglow(x,y,big?16:13,'#40e0ff',.9);g.fillStyle='#7ff0ff';g.beginPath();g.roundRect(x-8,y-3,16,6,3);g.fill();g.fillStyle='#ffffff';g.beginPath();g.roundRect(x-5,y-1.5,10,3,1.5);g.fill();}
function orb(x,y,col,r){dglow(x,y,r*2.8,col,.75);const s=pre('orb'+col+r,r*2+4,r*2+4,r+2,r+2,c=>{E(c,0,0,r,r);fo(c,ballG(c,0,0,r,r,col),1.1);gloss(c,-r*.35,-r*.4,r*.3,r*.18,.8);});dsp(s,x,y);}
// ---------- TITLE ----------
function logoSpr(){return pre('logo2',560,92,280,46,x=>{x.textAlign='center';x.textBaseline='middle';x.lineJoin='round';
 const L=(s,sz,y)=>{x.font=`900 ${sz}px ${FONTF}`;let w=x.measureText(s).width;if(w>520){sz=sz*520/w;x.font=`900 ${sz}px ${FONTF}`;}const k=sz/64;
  x.lineWidth=16*k;x.strokeStyle='#ff4f7b';x.strokeText(s,4*k,y+6*k);x.lineWidth=10*k;x.strokeStyle=OL;x.strokeText(s,4*k,y+6*k);x.strokeText(s,0,y);
  x.fillStyle=lg(x,0,y-sz*.4,0,y+sz*.4,['#fffbe0','#ffe36a','#ffc53d','#ff8a2a','#ffc53d','#ffe9a0']);x.fillText(s,0,y);
  x.save();x.beginPath();x.rect(-280,y-sz*.62,560,sz*.53);x.clip();x.fillStyle='rgba(255,255,255,.35)';x.fillText(s,0,y);x.restore();};
 L('PALE BLUE',50,-20);L('CRYSTAL DEFENDERS',26,20);});}
function recordSpr(){return pre('rec',52,52,26,26,x=>{E(x,0,0,23,23);fo(x,ballG(x,0,0,23,23,'#d9a520'),1.6);x.strokeStyle='rgba(120,80,10,.55)';x.lineWidth=.8;for(let r=8;r<22;r+=2.5){x.beginPath();x.arc(0,0,r,0,TAU);x.stroke();}
 E(x,0,0,6,6);fo(x,ballG(x,0,0,6,6,'#8a6a18'),1);gloss(x,-9,-10,7,3,.5);});}

// ===== Title redraw: captains + Pale Blue + allies (left) + villains (right), logo area kept clear =====
function spaceDog(x,y,sc,t){g.save();g.translate(x,y);g.scale(sc,sc);const bob=Math.sin(t*3)*1.5;
 // tail
 g.strokeStyle=OL;g.lineWidth=7;g.lineCap='round';g.beginPath();g.moveTo(-14,22);g.quadraticCurveTo(-30,14+Math.sin(t*8)*6,-30,0);g.stroke();g.strokeStyle='#c98a4a';g.lineWidth=4;g.stroke();
 // suit body + legs
 for(const d of[-9,9]){g.fillStyle=OL;g.beginPath();g.roundRect(d-8,26,16,22,7);g.fill();g.fillStyle='#e8eef8';g.beginPath();g.roundRect(d-6,28,12,18,6);g.fill();circ(d,46,6,'#45d6ff');}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,18,22,20,0,0,TAU);g.fill();g.fillStyle=lg(g,0,0,0,36,['#ffffff','#b8c4d8']);g.beginPath();g.ellipse(0,18,19.5,17.5,0,0,TAU);g.fill();
 g.fillStyle='#ff9a3a';g.beginPath();g.roundRect(-8,12,16,10,3);g.fill();circ(-3,17,2,'#ffe066');circ(3,17,2,'#45d6ff');
 // saluting paw
 g.fillStyle=OL;g.beginPath();g.ellipse(17,-2,7,14,-.9,0,TAU);g.fill();g.fillStyle='#e8eef8';g.beginPath();g.ellipse(17,-2,5,12,-.9,0,TAU);g.fill();circ(24,-12,5.5,OL);circ(24,-12,4,'#c98a4a');
 // head
 g.translate(0,-14+bob);g.fillStyle=OL;g.beginPath();g.ellipse(-15,2,8,14,.35,0,TAU);g.ellipse(15,2,8,14,-.35,0,TAU);g.fill();g.fillStyle='#8a5a2a';g.beginPath();g.ellipse(-15,2,6,12,.35,0,TAU);g.ellipse(15,2,6,12,-.35,0,TAU);g.fill();
 circ(0,0,15,OL);g.fillStyle=ballG(g,0,0,13.5,13.5,'#d89a5a');g.beginPath();g.arc(0,0,13.5,0,TAU);g.fill();g.fillStyle='#fff3e0';g.beginPath();g.ellipse(0,7,9,7,0,0,TAU);g.fill();
 circ(-5,-3,3.4,OL);circ(5,-3,3.4,OL);circ(-4,-4,1.2,'#fff');circ(6,-4,1.2,'#fff');circ(0,4,3,OL);g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.arc(0,7,4,.2,Math.PI-.2);g.stroke();g.fillStyle='#ff6a8a';g.beginPath();g.ellipse(1.5,11.5,2.4,3,0,0,TAU);g.fill();
 // helmet bubble
 g.fillStyle='rgba(180,235,255,.22)';g.strokeStyle='#e8f8ff';g.lineWidth=2.5;g.beginPath();g.arc(0,1,23,0,TAU);g.fill();g.stroke();g.strokeStyle=OL;g.lineWidth=1.2;g.beginPath();g.arc(0,1,24.4,0,TAU);g.stroke();
 g.fillStyle='rgba(255,255,255,.7)';g.beginPath();g.ellipse(-10,-11,6,3,-.6,0,TAU);g.fill();g.restore();}
let TART=null;
function titleArt(){if(TART)return TART;if(!IMG.title||!IMG.comic_c07)return null;const c=mkc(W*2,H*2),og=g;g=c.getContext('2d');g.scale(2,2);
 // Mars dusk sky, distant mountains
 g.fillStyle=lg(g,0,0,0,H,['#1a0c2a','#5a1a2a','#b8442a','#7a2a1a']);g.fillRect(0,0,W,H);for(let i=0;i<90;i++){const sx=(i*137.5)%W,sy=(i*71.3)%210;g.globalAlpha=.3+(i%5)*.12;circ(sx,sy,i%7?0.8:1.6,'#ffffff');}g.globalAlpha=1;
 g.fillStyle='#5a2016';g.beginPath();g.moveTo(0,250);for(let x=0;x<=W;x+=40)g.lineTo(x,220+Math.sin(x*.05)*18+((x/40)%3)*8);g.lineTo(W,H);g.lineTo(0,H);g.fill();
 g.fillStyle=lg(g,0,240,0,H,['#8a3420','#4a160e']);g.fillRect(0,252,W,H-252);
 // King Malakar looming top-right (from the comic panel), comic frame circle
 g.save();g.beginPath();g.arc(560,72,50,0,TAU);g.clip();drawCover(IMG.comic_c07,480,12,160,130);g.fillStyle='rgba(120,40,200,.18)';g.fillRect(500,15,120,120);g.restore();g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.arc(560,72,50,0,TAU);g.stroke();g.strokeStyle='#b04aff';g.lineWidth=2;g.stroke();
 // captains, centred and framed
 g.save();g.fillStyle=OL;g.fillRect(197,40,246,152);g.beginPath();g.rect(200,43,240,146);g.clip();drawCover(IMG.title,200,43,240,146);g.restore();
 // villains right
 twinShip(478,128,'#ff7ae0',.62,false);twinShip(618,138,'#3ad6c0',.62,false);grubbArt(515,178,.33,false);kroolArt(null,600,180,.36,1);
 // allies left
 for(const[zx,zy,k]of[[36,36,0],[86,22,1],[136,40,2]]){g.save();g.translate(zx,zy);g.scale(.55,.55);goofFlyer(0,0,k*.7,1,false);g.restore();}
 blob(142,176,1.3,{r:24,face:1,col:'#7ad04a'});spaceDog(66,140,1.05,0);
 // Pale Blue sweeping over the captains
 ship(320,30,0,.75);
 g.globalAlpha=.12;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
 g=og;return TART=c;}
function drawTitle(){if(IMG.title){const ph=(T/7)%2,cur=ph<1?IMG.title:(IMG.ship||IMG.title),nx=ph<1?(IMG.ship||IMG.title):IMG.title,u=ph%1,fade=clamp((u-.85)/.15,0,1);const kb=(im,u2,a)=>{const k=1.03+u2*.08;g.save();g.globalAlpha=a;g.translate(W/2+(u2-.5)*-18,H/2+(u2-.5)*-8);g.scale(k,k);drawCover(im,-W/2,-H/2,W,H);g.restore();};kb(cur,u,1);if(fade>0)kb(nx,0,fade);g.fillStyle=lg(g,0,0,0,H,['rgba(8,6,30,.85)','rgba(8,6,30,.2)','rgba(8,6,30,.1)','rgba(8,6,30,.75)']);g.fillRect(0,0,W,H);}else{starfield(T*12);earth(470,250,120);moonBall(120,80,22);}
 if(!IMG.title){const sx=((T*28)%(W+200))-100;ship(sx,(IMG.title?185:150)+Math.sin(T*1.3)*12,T,1.3);}
 if(!IMG.title){dsp(recordSpr(),560,60,1,1,Math.sin(T)*.2);const gl=(T*.7)%1;if(gl<.3)dglow(548+gl*40,50+gl*30,10,'#ffffff',1-gl*3);}
 dsp(logoSpr(),W/2,(IMG.title?232:92)+Math.sin(T*2)*2,.95);
 txt('A BACKLINE VINTAGE GAME',W/2,IMG.title?276:140,11,'#45d6ff');
 if((T*2|0)%2&&!(loadSave()&&!AUTO))txt(showTouch?'TAP TO START':'PRESS ENTER / TAP TO START',W/2,IMG.title?310:300,16,'#ffffff');
  {const tp=tapped();audioIcon();if(tp&&tp.x>W-60&&tp.y<44){toggleMute();}else{const sv=AUTO?null:loadSave();if(sv){titleMenu(tp,sv);}else if(tp||pressedAny&&!touches.size&&!mouse){pressedAny=false;newGame();}}}}
function titleMenu(tp,sv){const by=IMG.title?296:290;g.fillStyle='rgba(8,6,30,.6)';g.fillRect(0,by-16,W,60);
 if(!CONF){panel(W/2-150,by-6,140,34,'#5fe36a');txt('▶ CONTINUE',W/2-80,by+11,12,'#ffffff');txt(sv.cp?'Mission '+sv.cp.m+' checkpoint':'Next: Mission '+Math.min(2,sv.next||1),W/2-80,by+36,7,'#c6cbef');
  panel(W/2+10,by-6,140,34,'#ffc53d');txt('NEW GAME',W/2+80,by+11,12,'#ffffff');
  if(tp&&tp.y>by-14&&tp.y<by+40){if(tp.x<W/2)resumeSave(sv);else{CONF=true;sfx('blip');}}else if(pressedAny&&!touches.size&&!mouse&&K.Enter){pressedAny=false;resumeSave(sv);}}
 else{g.fillStyle='rgba(8,4,24,.8)';g.fillRect(0,0,W,H);panel(W/2-170,110,340,140,'#ff4f7b');txt('START A NEW GAME?',W/2,138,14,'#ffc53d');wrap('Your saved progress will be overwritten.',W/2,164,300,10,'#ffffff');
  panel(W/2-130,196,110,36,'#ff4f7b');txt('YES, NEW GAME',W/2-75,214,9,'#ffffff');panel(W/2+20,196,110,36,'#5fe36a');txt('CANCEL',W/2+75,214,10,'#ffffff');
  if(tp&&tp.y>186&&tp.y<240){if(tp.x<W/2)newGame();else CONF=false;}}}
// ---------- INTRO ----------
function mcSpr(){return pre('mc',W,H,0,0,x=>{x.fillStyle=lg(x,0,0,0,230,['#1c2458','#2a3470','#1c2458']);x.fillRect(0,0,W,230);x.fillStyle=lg(x,0,230,0,H,['#1a1f4a','#0c0f2a']);x.fillRect(0,230,W,130);
 x.strokeStyle='rgba(120,140,220,.15)';x.lineWidth=1;for(let i=0;i<W;i+=80){x.beginPath();x.moveTo(i,0);x.lineTo(i,230);x.stroke();}
 RR(x,114,18,412,180,10);fo(x,lg(x,0,18,0,198,['#5a64a0','#3a4580']),3);RR(x,124,28,392,160,4);x.fillStyle='#04061a';x.fill();
 for(let i=0;i<6;i++){RR(x,8+i*106,198,98,36,6);fo(x,lg(x,0,198,0,234,['#4a58a0','#2a3470']),2);}});}
function drawIntro(){dsp(mcSpr(),0,0);
 g.save();g.beginPath();g.rect(124,28,392,160);g.clip();g.globalAlpha=.7;starfield(T*5);g.globalAlpha=1;earth(190,110,40);
 for(let i=0;i<5;i++){const a=T*2+i;orb(420+i*14+Math.sin(a)*3,60+i*12,(T*3|0)%2?'#ff4f7b':'#a01040',3);}
 g.fillStyle='rgba(120,200,255,.05)';for(let y=28;y<188;y+=3)g.fillRect(124,y,392,1);g.restore();
 txt('VORR FLEET',460,175,10,'#ff4f7b');
 if((T*4|0)%2){g.fillStyle='rgba(255,40,80,.8)';g.beginPath();g.roundRect(250,40,140,20,6);g.fill();txt('! RED ALERT !',320,50,11,'#ffffff');}
 for(let i=0;i<6;i++)for(let j=0;j<5;j++){const on=((T*5+i+j)|0)%3;circ(24+i*106+j*16,214,3.5,on?'#3fbf5a':'#ffc53d');if(on)dglow(24+i*106+j*16,214,7,'#3fbf5a',.5);}
 const L=LINES[line];panel(28,234,94,114,line===2?'#ffc53d':'#45d6ff');
 dsp(portrait('hayes'),75,342,2.2);
 if(line<2){g.fillStyle='rgba(12,18,54,.6)';g.fillRect(30,236,90,110);txt('COMMS',75,290,10,'#45d6ff');}
 panel(132,250,486,90);txt(L.who,145,264,12,'#ffc53d','left');
 const shown=L.t.slice(0,Math.floor(stateT*40));wrap(shown,375,292,450,13,'#ffffff',20);
 if((T*3|0)%2)txt('▶',600,326,12,'#45d6ff');txt('SKIP ▶▶',W-50,22,10,'#8189c7');
 const tp=tapped();if(tp&&tp.x>W-110&&tp.y<50){go('select');return;}
 if(tp||pressedA){pressedA=false;if(shown.length<L.t.length)stateT=99;else if(++line>=LINES.length){line=0;go('select');}else stateT=0;}}
// ---------- SELECT ----------
function drawSelect(){starfield(T*8);txt('CHOOSE YOUR CAPTAIN',W/2,28,20,'#ffc53d');
 for(let i=0;i<4;i++){const x=80+i*160,sel=i===cap;panel(x-66,52,132,216,sel?'#45d6ff':'#3a4180');
  if(sel)dglow(x,180,70,'#45d6ff',.18);
  const im=IMG[CAPKEY[i]];if(im){g.save();g.beginPath();g.roundRect(x-61,57,122,168,7);g.clip();drawCover(im,x-61,57,122,168);g.restore();g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.roundRect(x-61,57,122,168,7);g.stroke();
   captain(x+42,224,CAPS[i],{sc:.62,t:T,run:sel?T*8:0});}
  else{dsp(portrait(i),x,124,1.6);captain(x,218,CAPS[i],{sc:1.15,t:T,run:sel?T*8:0});}txt(CAPS[i].name,x,234,11,sel?'#ffffff':'#b8bde8');wrap(CAPS[i].bio,x,252,120,7,'#c6cbef',10);}
 txt(showTouch?'TAP A CAPTAIN, THEN TAP LAUNCH':'◀ ▶ TO CHOOSE · ENTER TO LAUNCH',W/2,290,10,'#c6cbef');
 panel(W/2-70,298,140,32,(T*3|0)%2?'#ff7a29':'#ff4f7b');txt('LAUNCH',W/2,314,16,'#ffffff');
 if(K.ArrowLeft&&!selK)cap=(cap+3)%4,sfx('blip');if(K.ArrowRight&&!selK)cap=(cap+1)%4,sfx('blip');selK=K.ArrowLeft||K.ArrowRight;
 const tp=tapped();if(tp){if(tp.y>292&&Math.abs(tp.x-W/2)<80)return launch();if(tp.y>50&&tp.y<275){const i=clamp(Math.floor(tp.x/160),0,3);if(i===cap&&stateT>.3)return launch();cap=i;sfx('blip');}}
 if((K.Enter||K.Space)&&stateT>.4)launch();}
// ---------- SPACE ----------
function vorrSpr(){return pre('vorr',60,42,30,21,x=>{
 for(const s of[-1,1]){x.beginPath();x.moveTo(-2,s*3);x.quadraticCurveTo(12,s*12,26,s*19);x.lineTo(20,s*5);x.closePath();fo(x,lg(x,0,0,0,s*19,['#f0a0ff','#c040f0','#6a1aa0']),1.3);x.strokeStyle='rgba(255,255,255,.5)';x.lineWidth=.8;x.beginPath();x.moveTo(2,s*4);x.lineTo(20,s*15);x.stroke();}
 E(x,0,0,20,8);fo(x,ballG(x,0,0,20,8,'#5a2a8a'),1.6);RR(x,-14,-1,26,2,1);x.fillStyle='#b080ff';x.fill();
 E(x,-17,0,4,4);fo(x,ballG(x,-17,0,4,4,'#ff4f7b'),1);gloss(x,-18,-1.5,1.4,.8,.9);
 RR(x,17,-4,5,8,2.5);fo(x,'#45d6ff',1);
 E(x,3,-6,7.5,6);fo(x,ballG(x,3,-6,7.5,6,'#7fe88a'),1.2);E(x,1.5,-6.5,3.2,3.2);fo(x,'#ffffff',.8);E(x,.5,-6.5,1.5,1.5);x.fillStyle=OL;x.fill();gloss(x,4,-9.5,2.5,1,.7);});}
function rockSpr(r,v,junk){return pre(`ast${r}_${v}_${junk}`,r*2+8,r*2+8,r+4,r+4,x=>{
 if(junk){x.rotate(.3);RR(x,-r,-r*.55,r*2,r*1.1,2);fo(x,lg(x,0,-r*.55,0,r*.55,['#c8d0e8','#8a96b8','#4a5470']),1.4);x.strokeStyle='#3a4058';x.lineWidth=1;for(let i=-r+4;i<r;i+=5){x.beginPath();x.moveTo(i,-r*.5);x.lineTo(i,r*.5);x.stroke();}RR(x,-2,-r*.55,4,r*1.1,1);x.fillStyle='#ffc53d';x.fill();return;}
 const col=['#8a7a6a','#7a7e8d','#9a8a70'][v],pts=[];for(let i=0;i<9;i++){const a=i/9*TAU,rr2=r*(.85+Math.sin(i*2.7+v)*.15);pts.push([Math.cos(a)*rr2,Math.sin(a)*rr2]);}
 smooth(x,pts);fo(x,ballG(x,0,0,r,r,col),1.6);x.save();smooth(x,pts);x.clip();[[.3,.2,.28],[-.35,-.1,.2],[.1,-.45,.14]].forEach(([a,b,s])=>{E(x,a*r,b*r,s*r,s*r*.8);x.fillStyle=DK(col);x.fill();E(x,a*r+s*r*.15,b*r+s*r*.15,s*r*.7,s*r*.55);x.fillStyle=col;x.fill();});
 const q=x.createRadialGradient(-r*.4,-r*.4,0,0,0,r*1.2);q.addColorStop(.6,'rgba(0,0,0,0)');q.addColorStop(1,'rgba(10,5,20,.55)');x.fillStyle=q;x.fillRect(-r,-r,2*r,2*r);x.restore();});}
function gunSpr(){return pre('gunship',176,110,88,55,x=>{
 for(const s of[-1,1]){E(x,14,s*34,15,9);fo(x,ballG(x,14,s*34,15,9,'#8a96b8'),1.4);RR(x,-4,s*34-5,10,10,4);fo(x,vG(x,s*34-5,s*34+5,'#6a7490'),1.2);E(x,-4,s*34,2.5,2.5);x.fillStyle='#ff4fd0';x.fill();}
 x.beginPath();x.moveTo(-80,0);x.quadraticCurveTo(-50,-36,-10,-40);x.lineTo(56,-38);x.quadraticCurveTo(80,-30,80,0);x.quadraticCurveTo(80,30,56,38);x.lineTo(-10,40);x.quadraticCurveTo(-50,36,-80,0);x.closePath();
 fo(x,lg(x,0,-40,0,40,['#9a70d0','#5a3a8a','#2a1a50']),2);
 for(const s of[-1,1]){RR(x,-20,s*22-6,60,12,6);fo(x,vG(x,s*22-6,s*22+6,'#7a5ab0'),1.2);for(let i=-14;i<36;i+=10){E(x,i,s*22,2,2);x.fillStyle='#ffc53d';x.fill();}}
 E(x,-34,0,15,15);fo(x,ballG(x,-34,0,15,15,'#ff4fd0'),1.6);gloss(x,-39,-6,5,2.5,.85);
 E(x,40,-2,17,15);x.fillStyle='rgba(140,255,170,.35)';x.fill();E(x,40,6,13,9);fo(x,ballG(x,40,6,13,9,'#5fe36a'),1.2);E(x,36,2,6,6);fo(x,'#ffffff',1);E(x,34,2,2.8,2.8);x.fillStyle=OL;x.fill();
 x.strokeStyle=OL;x.lineWidth=1.8;x.beginPath();x.moveTo(30,-5);x.lineTo(42,-2);x.stroke();E(x,40,-2,17,15);x.strokeStyle=OL;x.lineWidth=1.6;x.stroke();gloss(x,33,-11,6,2.5,.7);
 RR(x,74,-14,8,28,4);fo(x,'#45d6ff',1.2);gloss(x,-20,-30,30,3,.25,0);});}
function iss(x,y){g.save();g.translate(x,y);g.globalAlpha=.9;g.fillStyle='#2a3050';g.fillRect(-84,-2,168,4);
 for(const ox of[-72,-52,52,72])for(const d of[-1,1]){const y0=d>0?4:-36;g.fillStyle=OL;g.fillRect(ox-7,y0-1,14,34);g.fillStyle=lg(g,ox-6,0,ox+6,0,['#5a4a20','#c8a048','#5a4a20']);g.fillRect(ox-6,y0,12,32);g.fillStyle='rgba(0,0,0,.35)';for(let k=1;k<6;k++)g.fillRect(ox-6,y0+k*5.3,12,.7);}
 g.fillStyle=OL;g.beginPath();g.roundRect(-24,-8,48,16,6);g.fill();g.fillStyle=lg(g,0,-7,0,7,['#e0e4f0','#8a90b0']);g.beginPath();g.roundRect(-22,-6.5,44,13,5);g.fill();
 g.fillStyle=OL;g.beginPath();g.roundRect(-9,-16,18,32,6);g.fill();g.fillStyle=lg(g,-8,0,8,0,['#c8cce0','#f4f6fb','#9aa0c0']);g.beginPath();g.roundRect(-7.5,-14.5,15,29,5);g.fill();
 g.fillStyle='#e8ecf6';g.fillRect(-34,6,10,6);g.globalAlpha=1;if((T*2|0)%2){circ(24,-4,1.8,'#ff4f7b');dglow(24,-4,7,'#ff4f7b',.7);}txt('ISS',0,44,7,'#8189c7');g.restore();}
function satDraw(f){g.save();g.translate(f.x,f.y);g.rotate(f.age*.6);for(const d of[-1,1]){g.fillStyle=OL;g.fillRect(d>0?8:-31,-8,23,16);g.fillStyle=lg(g,0,-6,0,6,['#7ab0ff','#2a50b0']);g.fillRect(d>0?9:-30,-7,21,14);g.fillStyle='rgba(0,0,0,.3)';g.fillRect(d>0?19:-20,-7,1,14);}
 g.fillStyle=OL;g.beginPath();g.roundRect(-10,-10,20,20,4);g.fill();g.fillStyle=f.hit>0?'#fff':lg(g,-9,-9,9,9,['#fff2a0','#d0a030','#806010']);g.beginPath();g.roundRect(-8.5,-8.5,17,17,3);g.fill();circ(0,-12,3.2,'#c8cce0',OL);g.restore();}
function mineDraw(f){const r=12;g.save();g.translate(f.x,f.y);g.rotate(f.age*1.5);g.fillStyle=OL;for(let i=0;i<8;i++){const a=i*TAU/8;g.beginPath();g.moveTo(Math.cos(a-.28)*r,Math.sin(a-.28)*r);g.lineTo(Math.cos(a)*(r+8),Math.sin(a)*(r+8));g.lineTo(Math.cos(a+.28)*r,Math.sin(a+.28)*r);g.fill();}g.restore();
 circ(f.x,f.y,r+1.5,OL);g.fillStyle=f.hit>0?'#fff':ballG(g,f.x,f.y,r,r,'#8a3a5a');g.beginPath();g.arc(f.x,f.y,r,0,TAU);g.fill();const on=(f.age*3|0)%2;circ(f.x,f.y,4.5,on?'#ff4f7b':'#601020');if(on)dglow(f.x,f.y,16,'#ff4f7b',.8);}
function podDraw(f){const a=Math.atan2(f.vy||0,f.vx||-1);g.save();g.translate(f.x,f.y);g.rotate(a);dglow(-16,0,12+Math.sin(T*40)*3,'#ff9a3a',.9);
 g.fillStyle=OL;g.beginPath();g.ellipse(0,0,16,11,0,0,TAU);g.fill();g.fillStyle=f.hit>0?'#fff':lg(g,0,-10,0,10,['#d8c0ff','#8a5ac0','#3a1a6a']);g.beginPath();g.ellipse(0,0,14.5,9.5,0,0,TAU);g.fill();
 circ(5,0,6.5,OL);circ(5,0,5.2,'#5fe36a');circ(6.5,-1.5,1.6,'#fff');circ(7,-1.5,.8,OL);g.restore();}
function carrierSpr(){return pre('carrier',230,150,115,75,x=>{
 for(const sY of[-1,1])for(let i=0;i<5;i++){const bx=-60+i*28;x.beginPath();x.moveTo(bx-10,sY*24);x.lineTo(bx+2,sY*(52+((i*7)%3)*8));x.lineTo(bx+14,sY*24);x.closePath();fo(x,lg(x,0,sY*20,0,sY*60,['#f0b0ff','#b040e0','#5a1a8a']),1.4);}
 E(x,0,0,92,36);fo(x,lg(x,0,-36,0,36,['#9a6ad0','#5a2a8a','#2a1046']),2);
 x.save();E(x,0,0,92,36);x.clip();for(let i=-80;i<90;i+=22){x.strokeStyle='rgba(255,255,255,.12)';x.lineWidth=1.2;x.beginPath();x.moveTo(i,-36);x.lineTo(i-10,36);x.stroke();}x.restore();
 RR(x,-92,-12,40,24,10);fo(x,'#160a24',1.4);for(let i=0;i<4;i++){E(x,-80+i*8,0,2,2);x.fillStyle='#5fe36a';x.fill();}
 E(x,10,-6,22,14);fo(x,ballG(x,10,-6,22,14,'#ff4fd0'),1.4);gloss(x,4,-12,8,3,.8);
 for(const yy of[-18,18]){RR(x,78,yy-6,18,12,5);fo(x,'#3a2a5a',1.2);}});}
function kreelShipSpr(p2){return pre('kws'+(p2?1:0),280,190,140,95,x=>{
 const poly=(pts,fill,lw=2)=>{x.beginPath();x.moveTo(pts[0],pts[1]);for(let i=2;i<pts.length;i+=2)x.lineTo(pts[i],pts[i+1]);x.closePath();fo(x,fill,lw);},cg=(y0,y1,c)=>lg(x,0,y0,0,y1,c);
 const sp=p2?['#ffc0ea','#ff3aa0','#5a0838']:['#e8c0ff','#a050f8','#3a106a'];
 for(const sY of[-1,1])for(let i=0;i<6;i++){const bx=-60+i*28,len=(p2?58:38)+((i*13)%3)*12;poly([bx-11,sY*24,bx+3+i*2,sY*(24+len),bx+13,sY*24],cg(sY*20,sY*(24+len),sp),1.6);}
 for(const sY of[-1,1])poly([30,sY*12,118,sY*64,128,sY*44,74,sY*10],cg(0,sY*64,['#3a2a5a','#140c26']),2);
 poly([-132,0,-66,-32,62,-36,124,-15,124,15,62,36,-66,32],cg(-36,36,['#4a3a72','#221a3c','#0e0a1c']),2.6);
 x.strokeStyle='rgba(200,160,255,.35)';x.lineWidth=1;x.beginPath();x.moveTo(-132,0);x.lineTo(124,0);x.moveTo(-66,-32);x.lineTo(-24,0);x.lineTo(-66,32);x.moveTo(62,-36);x.lineTo(20,0);x.lineTo(62,36);x.stroke();
 for(const sY of[-1,1])poly([-14,sY*28,8,sY*(p2?64:54),36,sY*32,14,sY*22],cg(sY*20,sY*54,sp),1.8);
 if(p2)for(const sY of[-1,1])poly([-100,sY*10,-118,sY*40,-84,sY*20],cg(0,sY*40,sp),1.4);
 poly([-108,-6,-84,-28,-54,-24,-46,-4,-64,6],cg(-28,6,['#a070e0','#5a2a9a','#22103e']),1.8);
 for(const ex of[-80,-64]){x.save();x.shadowColor='#ff4fd0';x.shadowBlur=14;x.fillStyle='#ffa0ea';x.beginPath();x.moveTo(ex-7,-15);x.lineTo(ex+6,-18);x.lineTo(ex+5,-12);x.lineTo(ex-6,-10);x.closePath();x.fill();x.restore();}
 x.save();x.shadowColor='#ff4fd0';x.shadowBlur=22;E(x,24,0,17,13);fo(x,ballG(x,24,0,17,13,p2?'#ff3a8a':'#ff4fd0'),1.8);x.restore();
 x.fillStyle='#ff4fd0';x.beginPath();x.moveTo(-26,-9);x.lineTo(-14,0);x.lineTo(-26,9);x.lineTo(-21,0);x.closePath();x.fill();x.beginPath();x.moveTo(-14,-9);x.lineTo(-2,0);x.lineTo(-14,9);x.lineTo(-9,0);x.closePath();x.fill();
 for(const yy of[-19,19]){RR(x,118,yy-7,16,14,4);fo(x,'#2a1a40',1.4);}
 if(p2){x.strokeStyle='#ff9ae8';x.lineWidth=1.8;x.beginPath();x.moveTo(-34,-22);x.lineTo(-12,-6);x.lineTo(4,-20);x.moveTo(40,22);x.lineTo(60,6);x.lineTo(82,20);x.moveTo(-50,18);x.lineTo(-30,8);x.stroke();}});}
function drawBossS(B){const s=sp;if(B.type==='carrier'){dglow(B.x+100,B.y,30,'#45d6ff',.7);dsp(carrierSpr(),B.x,B.y,1,1,Math.sin(B.t)*.03,B.hit>0);
  const up=B.pods.some(p=>p.hp>0);if(up){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(120,230,255,${.35+Math.sin(T*6)*.12})`;g.lineWidth=4;g.beginPath();g.ellipse(B.x,B.y,104,50,0,0,TAU);g.stroke();g.restore();}
  for(const p of B.pods){if(p.hp<=0)continue;dglow(p.x,p.y,18,'#7ae8ff',.7);g.save();g.translate(p.x,p.y);g.rotate(T*2);g.beginPath();g.moveTo(0,-12);g.lineTo(9,0);g.lineTo(0,12);g.lineTo(-9,0);g.closePath();g.fillStyle=OL;g.fill();g.beginPath();g.moveTo(0,-10);g.lineTo(7,0);g.lineTo(0,10);g.lineTo(-7,0);g.closePath();g.fillStyle=ballG(g,0,0,7,10,'#7ae8ff');g.fill();g.restore();}}
 else if(M3DRAW[B.type])M3DRAW[B.type](B);
 else if(B.type==='turret'){dglow(B.x+80,B.y,30,'#45d6ff',.7);dsp(gunSpr(),B.x,B.y,1,1,0,B.hit>0);const cx=B.x-10;g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.arc(cx,B.y,30,0,TAU);g.stroke();g.strokeStyle='#d04aff';g.lineWidth=3.5;g.stroke();
  const arms=B.hp/B.max<.5?4:2;for(let k=0;k<4;k++){const a=B.rot+k*TAU/4,px=cx+Math.cos(a)*30,py=B.y+Math.sin(a)*30,live=k<arms||k%2===0&&arms===2&&false;circ(px,py,8,OL);g.fillStyle=ballG(g,px,py,6.5,6.5,k%(4/arms)===0?'#ff4f7b':'#7a5a9a');g.beginPath();g.arc(px,py,6.5,0,TAU);g.fill();if(k%(4/arms)===0)dglow(px,py,12,'#ff4f7b',.6);}
  if(B.wp>0){const pr=14+Math.sin(T*12)*3;dglow(cx,B.y,40,'#ff4f7b',.9);circ(cx,B.y,pr+2,OL);g.fillStyle=ballG(g,cx,B.y,pr,pr,'#ff4f7b');g.beginPath();g.arc(cx,B.y,pr,0,TAU);g.fill();g.strokeStyle='#ffe14d';g.lineWidth=2;g.beginPath();g.arc(cx,B.y,pr+8+Math.sin(T*8)*3,0,TAU);g.stroke();}
  else{circ(cx,B.y,12,OL);g.fillStyle=ballG(g,cx,B.y,10,10,'#ffc53d');g.beginPath();g.arc(cx,B.y,10,0,TAU);g.fill();}}
 else{const p2=B.p2&&B.tr<.9,sc=(B.p2?(B.tr>0?1+(.9-Math.abs(B.tr-.9))*.15:1.15):1)*(B.t<2.6?.7+B.t/2.6*.3:1);
  if(B.warn>0){dglow(B.x,B.y,110,'#ff4f7b',.35+Math.sin(T*30)*.2);g.strokeStyle=`rgba(255,79,123,${.4+Math.sin(T*30)*.3})`;g.lineWidth=2;g.setLineDash([8,6]);g.beginPath();g.moveTo(B.x-120,B.y);g.lineTo(0,B.y);g.stroke();g.setLineDash([]);}
  dglow(B.x+120*sc,B.y,26,'#ff4fd0',.9);dglow(B.x+24*sc,B.y,40+Math.sin(T*6)*8,p2?'#ff3a8a':'#ff4fd0',.55);
  dsp(kreelShipSpr(p2),B.x,B.y,sc,1,Math.sin(B.t*2)*.04,B.hit>0);
  for(const ex of[-80,-64])dglow(B.x+ex*sc,B.y-13*sc,9+Math.sin(T*9)*2,'#ff4fd0',.9);
  if(B.tr>0){g.globalAlpha=clamp(Math.sin(B.tr*14)*.5+.2,0,.7);dglow(B.x,B.y,150,'#ffffff',1);g.globalAlpha=1;}}
}
function bossHud(B){const nm={carrier:'SHIELD CARRIER',turret:'TURRET GUNSHIP',ace:'ACE KREEL',grubb:'CAPTAIN GRUBB',twins:'VEXA & VOXA',krool:B.ks===1?'KROOL: ARMOR':B.ks===2?'KROOL: CORE':'KROOL: ESCAPE POD!'}[B.type],col={carrier:'#7ae8ff',turret:'#d04aff',ace:'#ff4f7b',grubb:'#9cff4a',twins:'#ff7ae0',krool:'#ff9a3a'}[B.type];vbar(W-30,70,20,B.hp/B.max,col);txt(nm,W-14,224,9,col,'right');}
function pilot(x,y,pers,f,fl){const P=PERS[pers]||PERS.ace,pan=(f.panic||0)>0||f.hp<=1,hx=x-2*fl,hy=y-9;
 g.save();if(f.cloak&&!f.hit)g.globalAlpha=.35+.15*Math.sin(T*6);
 g.fillStyle=OL;g.beginPath();g.arc(hx,hy,9,Math.PI,TAU);g.fill();g.fillStyle='rgba(180,230,255,.35)';g.beginPath();g.arc(hx,hy,7.6,Math.PI,TAU);g.fill();
 g.fillStyle=ballG(g,hx,hy-2,5.5,5.5,P.skin);g.beginPath();g.arc(hx,hy-1.5,5.4,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1.2;g.stroke();
 const ex=hx-1.8*fl;if(pers==='rookie'){g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(hx-2,hy-6);g.lineTo(hx-4,hy-10);g.moveTo(hx+2,hy-6);g.lineTo(hx+4,hy-10);g.stroke();circ(hx-4,hy-10,1.2,'#ffe14d');circ(hx+4,hy-10,1.2,'#ffe14d');}
 if(pan){for(const d of[-2,2]){circ(ex+d,hy-2.5,1.9,'#ffffff');circ(ex+d,hy-2.5,.7,OL);}circ(ex,hy+1.6,1.3,OL);g.fillStyle='#7ae8ff';g.beginPath();g.arc(hx+4*fl,hy-3,1,0,TAU);g.fill();}
 else if(pers==='ace'){g.fillStyle=OL;g.fillRect(ex-4,hy-3.8,8,2.2);g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.moveTo(ex-2,hy+1);g.quadraticCurveTo(ex,hy+2.4,ex+2.5,hy);g.stroke();}
 else if(pers==='brute'){g.strokeStyle=OL;g.lineWidth=1.4;g.beginPath();g.moveTo(ex-3.5,hy-5);g.lineTo(ex+3.5,hy-4);g.stroke();circ(ex-1.6,hy-2.6,.9,OL);circ(ex+1.8,hy-2.6,.9,OL);g.fillStyle='#ffffff';g.fillRect(ex-2.5,hy+.6,5,1.6);}
 else if(pers==='sneak'){g.strokeStyle=OL;g.lineWidth=1.1;g.beginPath();g.moveTo(ex-3.5,hy-2.6);g.lineTo(ex-.8,hy-2);g.moveTo(ex+.8,hy-2);g.lineTo(ex+3.5,hy-2.6);g.moveTo(ex-2,hy+1);g.lineTo(ex+2.5,hy+.4);g.stroke();}
 else{circ(ex-1.8,hy-2.6,1.6,'#ffffff');circ(ex+1.8,hy-2.6,1.6,'#ffffff');circ(ex-1.5*fl,hy-2.6,.7,OL);circ(ex+2-1.5*fl+1.5,hy-2.6,.7,OL);g.strokeStyle=OL;g.lineWidth=1;g.beginPath();g.arc(ex,hy,1.8,.2,Math.PI-.2);g.stroke();}
 g.restore();}
function sayB(x,y,t){setF(8);const w=g.measureText(t).width+12,bx=clamp(x-w/2,4,W-w-4),by=y-34;g.fillStyle='#ffffff';g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.roundRect(bx,by,w,16,7);g.fill();g.stroke();g.beginPath();g.moveTo(x-3,by+16);g.lineTo(x,by+22);g.lineTo(x+4,by+16);g.closePath();g.fill();g.stroke();g.fillStyle='#1a1020';g.textAlign='center';g.textBaseline='middle';g.fillText(t,bx+w/2,by+8.5);}
function capBox(t,x,y){setF(10);const w=g.measureText(t).width+20;g.fillStyle=OL;g.fillRect(x-w/2-2,y-11,w+4,22);g.fillStyle='#ffe066';g.fillRect(x-w/2,y-9,w,18);g.fillStyle='#1a1020';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y+.5);}
const BTAUNT={grubb:'GRUBB: Goo bath time!',twins:'VEXA: Get him, sis!',krool:'KROOL: The Gate stays shut!',carrier:'GORRK: My carrier! My shields! YOU NO PASS!',turret:'ZIB: It spins! It shoots! I did not build it!',ace:'KREEL: End of the line, Earthling.'};
function bossPanel(s,k){const sl=(1-k)*80;g.save();g.translate(sl,0);g.fillStyle=OL;g.beginPath();g.moveTo(40,118);g.lineTo(W-30,108);g.lineTo(W-46,196);g.lineTo(26,204);g.closePath();g.fill();
 g.fillStyle='#b0122e';g.beginPath();g.moveTo(45,122);g.lineTo(W-35,113);g.lineTo(W-50,191);g.lineTo(31,199);g.closePath();g.fill();g.save();g.clip();g.globalAlpha=.25;g.fillStyle=halftone();g.fillRect(0,100,W,110);g.globalAlpha=1;speedLines(W/2,155,'rgba(255,220,120,.18)');g.restore();
 sfxText(s.banner.t,W/2,150,24,Math.max(0,2.6-s.banner.l*1),-.04);if(s.boss)bubble(BTAUNT[s.boss.type]||'',W/2-120,198,240,W/2+120,190);g.restore();}
const BCUT={grubb:{b:'GRUBB: This fuel is MINE! Have a goo bath, Earthling!',c:'Dodge the bouncing goo and hit that tanker!'},twins:{b:'VEXA & VOXA: Two of us. One of you. Bad odds, hero!',c:'Beat one and the other gets mad. Stay sharp.'},krool:{b:'KROOL: Nobody passes the Mars Gate. NOBODY.',c:'Break his armor plates, then hit the core!'},carrier:{b:'GORRK: My carrier! My shields! You no pass!',c:'Shield nodes are up. Knock them out first!'},turret:{b:'ZIB: It spins! It shoots! Please don\'t hit it!',c:'Time your shots between the spirals.'},ace:{b:'KREEL: End of the line, Earthling.',c:'Kreel. I knew you\'d show up.'}};
function onCtrl(tp){if(Math.hypot(tp.x-PB.x,tp.y-PB.y)<PB.r+8)return true;if(!showTouch)return false;const b=btns();for(const k in b){if(k==='skip')continue;const c=b[k];if(Math.hypot(tp.x-c.x,tp.y-c.y)<c.r*1.35)return true;}return false;}
function cutAdv(t,auto){const tp=tapped();pressedA=false;const ready=t>(AUTO?.4:1.2);if(ready){g.globalAlpha=.55+.45*Math.sin(T*5);txt('TAP TO CONTINUE ▶',W-170,16,10,'#ffe066');g.globalAlpha=1;}
 if(auto)return true;if(!ready){K._cutE=K.Enter;return false;}const enter=K.Enter&&!K._cutE;K._cutE=K.Enter;if(enter)return true;return !!(tp&&!onCtrl(tp)&&(tp.st==null||tp.st>performance.now()-(t-1.2)*1000));}
function bossCut(s){if(s.cut.type==='refuel')return refuelCut(s);const c=s.cut,t=c.t,d=3.4,L=BCUT[c.type];g.fillStyle='rgba(6,4,20,.78)';g.fillRect(0,0,W,H);
 const e1=1-Math.pow(1-clamp(t/.35,0,1),3),e2=1-Math.pow(1-clamp((t-.6)/.35,0,1),3);
 g.save();g.translate(-(1-e1)*W*.6,0);g.fillStyle=OL;g.fillRect(24,44,300,250);g.save();g.beginPath();g.rect(30,50,288,238);g.clip();g.fillStyle=lg(g,0,50,0,288,['#5a0a2a','#1a0420']);g.fillRect(30,50,288,238);speedLines(174,170,'rgba(255,120,160,.2)');
 const ki=IMG.comic_c08;if(c.type==='ace'&&ki)drawCover(ki,30,50,288,238);else if(c.type==='ace')kreel(174,150,1.3);else if(M3DRAW[c.type]){M3CUTART(c.type);}else{dsp(c.type==='carrier'?carrierSpr():gunSpr(),174,190,c.type==='carrier'?1.1:1.4);}g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(30,50,288,238);g.globalAlpha=1;g.restore();
 caption(BOSSNAME[c.type],36,56,200);if(t>.4)bubble(L.b,40,214,250,170,200,true);g.restore();
 if(t>.6){g.save();g.translate((1-e2)*W*.6,0);g.fillStyle=OL;g.fillRect(338,64,278,230);capCard(cap,346,72,130,214);if(t>1)bubble(L.c,470,96,140,440,170);txt(CAPS[cap].name,546,260,10,'#ffe066');g.restore();}
 sfxText('BOSS!',W/2,30,22,t,-.08);panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');
 if(cutAdv(t,AUTO&&t>d))s.cut=null;}
function progressMeter(s){const x0=210,x1=430,y=24,p=clamp(s.dist/s.len,0,1);if(SPM===3){moonBall(x0-14,y,10);marsBall(x1+14,y,9);}else{earth(x0-14,y,10);moonBall(x1+14,y,10);}
 g.fillStyle=OL;g.beginPath();g.roundRect(x0-2,y-5,x1-x0+4,10,5);g.fill();g.fillStyle='#2a335f';g.beginPath();g.roundRect(x0,y-3,x1-x0,6,3);g.fill();
 g.fillStyle=lg(g,0,y-3,0,y+3,['#fff2a0','#ffc53d','#ff8a2a']);g.beginPath();g.roundRect(x0,y-3,Math.max(6,(x1-x0)*p),6,3);g.fill();
 STG.forEach((st,i)=>{const bx=x0+(x1-x0)*st.b/s.len,done=s.bossI>i;g.save();g.translate(bx,y);g.rotate(Math.PI/4);g.fillStyle=OL;g.fillRect(-5,-5,10,10);g.fillStyle=done?'#5fe36a':'#ff4f7b';g.fillRect(-3.5,-3.5,7,7);g.restore();});
 dsp(shipSpr(),x0+(x1-x0)*p,y-1,.32);const nm=s.phase==='boss'?BOSSNAME[s.boss.type]:s.phase==='jump'?'FULL THRUST!':s.phase==='arrive'?(SPM===3?'MARS ARRIVAL':'MOON ARRIVAL'):STG[Math.max(0,s.sec)].n;txt(nm,W/2,42,8,'#45d6ff');}
function drawSpace(){const s=sp,p=s.dist/s.len,warp=s.phase==='jump'?1:0;setDims(headI(s));if(s.sfo==null||s.bossI===0&&s.phase!=='jump')s.sfo=s.dist*.5;starfield(s.sfo);s.vp=s.vp==null?p:s.vp+(p-s.vp)*Math.min(1,DT*2.5);
 const q=s.vp,eE=1-Math.pow(1-Math.min(1,q/.55),2),mQ=Math.pow(q,1.5),dx=Math.cos(s.ha),dy=Math.sin(s.ha),px=-dy,py=dx,Ld=Math.abs(dx)*270+Math.abs(dy)*150;
 {const tx=W/2+dx*Ld*(1-.5*mQ)+px*(-30*(1-mQ)),ty=H/2+dy*Ld*(1-.5*mQ)+py*(-30*(1-mQ)),tr=5+mQ*175+(s.phase==='arrive'?s.endT*30:0),ox2=W/2-dx*(Ld*.85+eE*380)+px*70,oy2=H/2-dy*(Ld*.85+eE*380)+py*70,or2=240*(1-eE)+16;
 if(SPM===3){marsBall(tx,ty,tr);moonBall(ox2,oy2,or2*.8);}else{moonBall(tx,ty,tr);earth(ox2,oy2,or2);}}
 g.globalAlpha=.07;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
 {const k=Math.min(1,s.vp/.3);if(k<1&&SPM!==3){g.save();g.translate(W/2-dx*(-60+k*640)-px*75,H/2-dy*(-60+k*640)-py*75);g.rotate(s.ha);g.scale(1.6-k,1.6-k);iss(0,0);g.restore();}}
 {const B=s.boss;if(B&&B.type==='ace'){B.dk=Math.min(1,(B.dk||0)+DT*(B.dead?-1:.7));if(B.dk>0){g.fillStyle=`rgba(8,0,18,${(B.p2?.6:.45)*B.dk})`;g.fillRect(0,0,W,H);if(B.p2&&!B.dead){g.fillStyle=`rgba(255,30,90,${.08+.06*Math.sin(T*4)})`;g.fillRect(0,0,W,H);}}}}
 g.save();g.translate(W/2,H/2);g.rotate(s.ha);g.scale(1,Math.cos(s.hr)||.001);g.translate(-SW/2,-SH/2);
 {const sp2=warp?1600:220;g.fillStyle='rgba(220,235,255,.75)';g.strokeStyle='rgba(200,230,255,.5)';g.lineWidth=1.5;for(let i=0;i<60;i++){const z=.3+(i%5)*.18,xx=((i*997-s.dist*z*2.2-T*sp2*z*(warp?1:0))%(SW+40)+SW+40)%(SW+40)-20,yy=(i*173.3)%SH;if(warp){g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+60*z,yy);g.stroke();}else g.fillRect(xx,yy,1.6*z+.6,1.6*z+.6);}}
 for(const r of s.rocks)dsp(rockSpr(r.r,r.v,r.junk),r.x,r.y,1,1,r.rot,r.hit>0);
 for(const q of s.picks){if(q.k==='life'){oneUp(q.x,q.y+Math.sin(T*4)*3,1);continue;}if(q.k==='gem'){gemShard(q.x,q.y+Math.sin(T*4)*3,q.gi,q.old);continue;}const c={spread:'#45d6ff',rapid:'#ffc53d',shield:'#5fe36a',charge:'#ff7ae0',fshield:'#7ae8ff'}[q.k],y=q.y+Math.sin(T*4)*3;dglow(q.x,y,22,c,.7);circ(q.x,y,11,OL);g.fillStyle=ballG(g,q.x,y,9.5,9.5,c);g.beginPath();g.arc(q.x,y,9.5,0,TAU);g.fill();}
 for(const b of s.shots){if(b.big){dglow(b.x,b.y,30,'#ff7ae0',.9);circ(b.x,b.y,9,'#ffffff',OL);dglow(b.x,b.y,16,'#ffffff',.8);}else bolt(b.x,b.y);}for(const e of s.eshots){if(e.ms){dglow(e.x-e.vx*.05,e.y-e.vy*.05,10,'#ff7a29',.8);orb(e.x,e.y,'#ff9a3a',5);}else if(e.goo){circ(e.x,e.y,7,OL);g.fillStyle=ballG(g,e.x,e.y,5.6,5.6,'#9cff4a');g.beginPath();g.arc(e.x,e.y,5.6,0,TAU);g.fill();}else orb(e.x,e.y,'#ff4f7b',4);}
 for(const f of s.foes){if(f.age<f.del)continue;if(DRAWK[f.kind]){DRAWK[f.kind](f);continue;}if(f.kind==='saucer')blobFighter(f.x,f.y,f.age);else if(f.kind==='sat')satDraw(f);else if(f.kind==='mine')mineDraw(f);else if(f.kind==='pod')podDraw(f);
  else{const fl=(f.dir??-1)>0?-1:1,gc=f.kind==='shield'?'#5fe36a':f.kind==='spreader'?'#ff9a3a':'#45d6ff';dglow(f.x+22*fl,f.y,10,gc,.7);if(f.kind==='spreader')dglow(f.x,f.y,20,'#ff7a29',.35);if(f.cloak&&!f.hit)g.globalAlpha=.35+.15*Math.sin(T*6);dsp(vorrSpr(),f.x,f.y,f.big?1.45:f.kind==='vorr'?1:1.15,fl,Math.sin(f.age*3)*.1,f.hit>0);g.globalAlpha=1;pilot(f.x,f.y-(f.big?4:0),f.pers,f,fl);
   if(f.kind==='shield'){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=f.shHit>0?'#ffffff':'rgba(110,230,255,.75)';g.lineWidth=3.5;g.beginPath();const a0=fl>0?Math.PI*.6:-Math.PI*.4;g.arc(f.x-4*fl,f.y,26,a0,a0+Math.PI*.8);g.stroke();g.restore();}}}
 if(s.boss&&!s.boss.dead)drawBossS(s.boss);
 debris(s.booms,0);drawFx(0);
 if(s.inv<=0||(T*12|0)%2)ship(s.x,s.y,T,1,1+Math.abs(s.vx)/200+warp);
 if(s.shield>0){g.save();g.globalCompositeOperation='lighter';const fs=s.shT>0;g.strokeStyle=fs?`rgba(122,232,255,${.5+.25*Math.sin(T*8)})`:`rgba(95,227,106,${.3+.15*s.shield})`;g.lineWidth=fs?4:3;if(fs){g.fillStyle='rgba(122,232,255,.12)';g.beginPath();g.ellipse(s.x,s.y,44,28,0,0,TAU);g.fill();}g.beginPath();g.ellipse(s.x,s.y,42,26,0,0,TAU);g.stroke();g.restore();}
 if(s.breachT>0){g.fillStyle=lg(g,0,0,90,0,[`rgba(255,40,80,${.55*s.breachT})`,'rgba(255,40,80,0)']);g.fillRect(0,0,90,SH);}
 g.restore();
 for(const q of s.picks){if(q.k==='gem')continue;const[X,Y]=toS(q.x,q.y+Math.sin(T*4)*3);txt(q.k==='life'?'1UP':{spread:'W',rapid:'R',shield:'S',charge:'C',fshield:'F'}[q.k],X,Y+.5,q.k==='life'?7:9,'#ffffff');}
 for(const q of s.pops){if(!q.comic)continue;const[X,Y]=toS(q.x,q.y);g.globalAlpha=Math.min(1,q.l*2);q.l0=q.l0||q.l;sfxText(q.t,X,Y,q.sz||16,q.l0-q.l,q.rot||-.15);g.globalAlpha=1;}
 if(s.breachT>0){s.breachT-=DT;if((T*10|0)%2)txt('! BREACH !',W/2,H-56,14,'#ff4f7b');}
 if(s.boss&&!s.boss.dead)bossHud(s.boss);
 hud(s.hp,s.maxhp||5);progressMeter(s);txt('◆ GEMS '+gemN(SPM)+'/5',44,46,8,'#ff9af0','left');
 if(s.mult>1||s.combo>2){txt('x'+s.mult,W-14,64,16,s.mult>=4?'#ff4fd0':'#ffc53d','right');txt('COMBO '+s.combo,W-14,80,8,'#ffffff','right');}
 const pw=[];if(s.pw.spread>0)pw.push('SPREAD '+Math.ceil(s.pw.spread));if(s.pw.rapid>0)pw.push('RAPID '+Math.ceil(s.pw.rapid));if(s.pw.charge>0)pw.push('CHARGE '+Math.ceil(s.pw.charge));if(s.shield>0)pw.push((s.shT>0?'FORCE FIELD '+Math.ceil(s.shT)+'s ':'SHIELD ')+'x'+s.shield);if(pw.length)txt(pw.join('  '),44,32,8,'#5fe36a','left');

 if(s.phase==='arrive'){g.globalAlpha=clamp(s.endT/2,0,1);txt(SPM===3?'MARS ARRIVAL':'MOON ARRIVAL',W/2,H/2,26,'#ffffff');g.globalAlpha=1;}
 if(s.cut)bossCut(s);else controls(true);}
// ---------- MOON ART ----------
function ridgeSpr(kind){const MA=M&&M.mars;return pre((MA?'mars':'')+'ridge'+kind,W,kind?150:190,0,0,x=>{const h=kind?150:190,k=TAU/W;
 const f=kind?(X=>30+Math.sin(X*k*3)*10+Math.sin(X*k*7+1)*5+Math.sin(X*k*2+2)*8):(X=>40+Math.sin(X*k*2)*22+Math.sin(X*k*5+1)*10+Math.sin(X*k*9)*4);
 x.beginPath();x.moveTo(0,h);for(let X=0;X<=W;X+=4)x.lineTo(X,f(X));x.lineTo(W,h);x.closePath();
 x.fillStyle=MA?(kind?lg(x,0,10,0,h,['#c8643a','#8a3a22','#4a1a12']):lg(x,0,10,0,h,['#7a2a2a','#4a1a1e','#2a0e14'])):kind?lg(x,0,10,0,h,['#9a9eb8','#6a6e88','#3a3e56']):lg(x,0,10,0,h,['#4a4e6a','#2c2f48','#1c1e34']);x.fill();
 x.strokeStyle=MA?'rgba(255,200,150,.6)':kind?'rgba(230,235,255,.7)':'rgba(170,180,230,.45)';x.lineWidth=2;x.beginPath();for(let X=0;X<=W;X+=4)X?x.lineTo(X,f(X)+1):x.moveTo(X,f(X)+1);x.stroke();
 if(kind&&!MA){for(let i=0;i<6;i++){const cx=50+i*107,cy=f(cx)+26;E(x,cx,cy,18,5);x.fillStyle='rgba(30,30,50,.45)';x.fill();x.strokeStyle='rgba(230,235,255,.5)';x.lineWidth=1.2;x.beginPath();x.ellipse(cx,cy,18,5,0,.1,Math.PI-.1);x.stroke();}
  const dx=320,dy=f(dx)+6;E(x,dx,dy,20,14);fo(x,ballG(x,dx,dy,20,14,'#d8dce8'),1.4);RR(x,dx-22,dy,44,8,2);fo(x,'#8a8ea4',1.2);E(x,dx,dy-14,2,2);x.fillStyle='#ffc53d';x.fill();RR(x,dx-6,dy-4,12,6,3);x.fillStyle='#45d6ff';x.fill();}});}
function groundSpr(){const MA=M&&M.mars;return pre((MA?'mars':'')+'ground',W,64,0,0,x=>{x.fillStyle=lg(x,0,0,0,64,MA?['#d8703e','#b0502c','#8a3a22','#6a2a1a']:['#d8dbe6','#b0b4c4','#8a8ea2','#6e7288']);x.fillRect(0,0,W,64);
 let sd=7;const R=()=>(sd=(sd*9301+49297)%233280)/233280;
 for(let i=0;i<90;i++){const a=R()*W,b=8+R()*54,r=1+R()*3.5;for(const ox of[-W,0,W]){E(x,a+ox,b,r*1.4,r);x.fillStyle=MA?'rgba(90,30,16,.55)':'rgba(80,84,104,.55)';x.fill();E(x,a+ox-r*.3,b-r*.3,r*.7,r*.45);x.fillStyle=MA?'rgba(255,190,140,.6)':'rgba(240,242,250,.6)';x.fill();}}
 for(let i=0;i<10;i++){const a=R()*W,b=20+R()*36;for(const ox of[-W,0,W]){E(x,a+ox,b,14,4);x.fillStyle='rgba(70,74,94,.45)';x.fill();x.strokeStyle='rgba(240,242,250,.5)';x.lineWidth=1;x.beginPath();x.ellipse(a+ox,b,14,4,0,.2,Math.PI-.2);x.stroke();}}
 x.fillStyle=MA?'#ffb080':'#f0f2fa';x.fillRect(0,0,W,2.5);x.fillStyle='rgba(60,64,84,.5)';x.fillRect(0,3,W,1.5);});}
function platSpr(w){const MA=M&&M.mars;return pre((MA?'mars':'')+'plat'+w,w+4,18,2,2,x=>{RR(x,0,0,w,12,4);fo(x,lg(x,0,0,0,12,MA?['#f0a070','#b05a34','#6a2e1a']:['#e0e6ff','#9aa0c4','#5a6088']),1.6);RR(x,3,3,w-6,3,1.5);x.fillStyle='rgba(255,197,61,.9)';x.fill();
 x.save();RR(x,3,3,w-6,3,1.5);x.clip();x.fillStyle='#2a2f55';for(let i=0;i<w;i+=8){x.beginPath();x.moveTo(i,3);x.lineTo(i+3,3);x.lineTo(i+1,6);x.lineTo(i-2,6);x.fill();}x.restore();
 for(let i=6;i<w-4;i+=Math.max(14,(w-12)/Math.round((w-12)/18))){E(x,i,8.5,1.3,1.3);x.fillStyle='#2a2f55';x.fill();}x.fillStyle='rgba(0,0,0,.25)';RR(x,4,12,w-8,4,2);x.fill();});}
function rockSprM(w,h){const MA=M&&M.mars;return pre((MA?'mars':'')+'rockm'+w+'x'+h,w+10,h+8,5,4,x=>{smooth(x,[[0,h],[-2,h*.4],[w*.2,-2],[w*.6,0],[w+2,h*.3],[w+1,h]]);fo(x,ballG(x,w*.45,h*.45,w*.6,h*.6,MA?'#b0583a':'#9a9eb0'),1.8);
 E(x,w*.35,h*.35,w*.14,h*.1);x.fillStyle='rgba(60,64,84,.5)';x.fill();gloss(x,w*.3,h*.15,w*.18,2,.45,0);});}
function craterSpr(w){const MA=M&&M.mars;return pre((MA?'mars':'')+'crat'+w,w+6,16,w/2+3,8,x=>{E(x,0,0,w/2,6);x.fillStyle=lg(x,0,-6,0,6,MA?['#6a2a1a','#9a4a2a']:['#5a5e74','#7a7e94']);x.fill();E(x,0,1,w/2-4,3.6);x.fillStyle='rgba(40,42,60,.6)';x.fill();
 x.strokeStyle='rgba(245,246,252,.8)';x.lineWidth=1.6;x.beginPath();x.ellipse(0,0,w/2,6,0,.15,Math.PI-.15);x.stroke();});}
function flagSpr(){return pre('flag',40,70,4,66,x=>{limb(x,0,0,0,-62,2.6,'#e8ecf6');x.beginPath();x.moveTo(1,-61);x.quadraticCurveTo(14,-63,27,-60);x.lineTo(27,-44);x.quadraticCurveTo(14,-47,1,-45);x.closePath();x.fillStyle='#ffffff';x.fill();
 x.save();x.clip();x.fillStyle='#e8344a';for(let i=0;i<4;i++)x.fillRect(0,-60+i*4.4,28,2.2);x.fillStyle='#2f4fb8';x.fillRect(0,-63,11,9);x.restore();x.strokeStyle=OL;x.lineWidth=1.2;x.stroke();});}
function pickSpr(k){return pre('pk'+k,30,30,15,15,x=>{if(k==='hp'){RR(x,-9,-7,18,14,6);fo(x,lg(x,0,-7,0,7,['#ffa0c0','#ff4f7b','#a01a40']),1.6);RR(x,-1.8,-4.5,3.6,9,1);x.fillStyle='#fff';x.fill();RR(x,-4.5,-1.8,9,3.6,1);x.fill();gloss(x,-4,-4.5,4,1.4,.6,0);}
 else if(k==='spread'){E(x,0,0,10,10);fo(x,ballG(x,0,0,10,10,'#45d6ff'),1.6);x.font=`900 13px ${FONTF}`;x.textAlign='center';x.textBaseline='middle';x.lineWidth=3;x.strokeStyle=OL;x.strokeText('S',0,1);x.fillStyle='#fff';x.fillText('S',0,1);}
 else{x.beginPath();x.moveTo(0,-12);x.lineTo(7,-2);x.lineTo(0,12);x.lineTo(-7,-2);x.closePath();fo(x,lg(x,-7,-12,7,12,['#ffffff','#9af0ff','#3a9ad0']),1.4);x.strokeStyle='rgba(255,255,255,.7)';x.lineWidth=1;x.beginPath();x.moveTo(0,-12);x.lineTo(0,12);x.moveTo(-7,-2);x.lineTo(7,-2);x.stroke();}});}
function bossSpr(fr){return pre('mech'+fr,140,124,70,118,x=>{const step=fr==='walk1'?6:fr==='walk2'?-6:0,M='#a0a8bc',D='#6b7488';
 for(const [lx,s] of[[-26,step],[26,-step]]){RR(x,lx-10+s,-46,20,34,8);fo(x,lg(x,lx-10,0,lx+10,0,[LT(D),D,DK(D)]),1.8);E(x,lx+s,-30,7,6);fo(x,ballG(x,lx+s,-30,7,6,'#ffc53d'),1.3);
  RR(x,lx-16+s,-14,32,14,6);fo(x,lg(x,0,-14,0,0,['#ffe080','#ffc53d','#c08a20']),1.8);RR(x,lx-15+s,-3,30,3,1.5);x.fillStyle=OL;x.fill();}
 const ay=fr==='angry'?-12:0;RR(x,40,-92+ay,18,22,8);fo(x,vG(x,-92+ay,-70+ay,D),1.6);E(x,58,-72+ay,13,14);fo(x,ballG(x,58,-72+ay,13,14,'#5a6278'),1.8);E(x,62,-68+ay,6,7);x.fillStyle='#2a2f44';x.fill();
 RR(x,-62,-82,14,22,5);fo(x,vG(x,-82,-60,D),1.6);
 RR(x,-52,-100,104,56,20);fo(x,lg(x,0,-100,0,-44,['#d0d6e6',M,'#5a6278']),2.2);
 x.save();RR(x,-52,-62,104,14,4);x.clip();x.fillStyle='#ffc53d';x.fillRect(-52,-62,104,14);x.fillStyle=OL;for(let i=-60;i<60;i+=16){x.beginPath();x.moveTo(i,-62);x.lineTo(i+8,-62);x.lineTo(i,-48);x.lineTo(i-8,-48);x.fill();}x.restore();
 x.strokeStyle=OL;x.lineWidth=1.6;RR(x,-52,-62,104,14,4);x.stroke();
 for(const hx of[-30,30]){E(x,hx,-78,9,8);fo(x,'#2a3048',1.6);if(fr==='trip'){x.strokeStyle='#ffc53d';x.lineWidth=2.5;x.beginPath();x.moveTo(hx-4,-82);x.lineTo(hx+4,-74);x.moveTo(hx+4,-82);x.lineTo(hx-4,-74);x.stroke();}
  else{const c2=fr==='angry'?'#ff3a4a':'#fff2a0';E(x,hx,-78,6,5.5);x.fillStyle=ballG(x,hx,-78,6,5.5,c2);x.fill();gloss(x,hx-2,-80,2,1,.9);if(fr==='angry'){x.strokeStyle=OL;x.lineWidth=3;x.beginPath();x.moveTo(hx-9,hx<0?-90:-86);x.lineTo(hx+9,hx<0?-86:-90);x.stroke();}}}
 RR(x,-34,-112,68,16,6);fo(x,vG(x,-112,-96,'#5a6278'),1.6);gloss(x,-20,-94,26,3,.35,0);});}
function domeSpr(){return pre('mdome',96,64,48,62,x=>{E(x,0,-20,40,36);x.fillStyle=lg(x,0,-56,0,16,['rgba(190,255,220,.32)','rgba(120,230,170,.16)','rgba(80,200,140,.28)']);x.fill();x.strokeStyle=OL;x.lineWidth=2;x.beginPath();x.ellipse(0,-20,40,36,0,Math.PI,TAU);x.stroke();
 x.strokeStyle='rgba(255,255,255,.75)';x.lineWidth=3;x.beginPath();x.arc(0,-20,32,Math.PI*1.12,Math.PI*1.42);x.stroke();gloss(x,18,-44,5,2,.6,.5);});}
function vbar(bx,by,n,frac,col){const hpN=Math.ceil(n*Math.max(0,frac));g.fillStyle=OL;g.beginPath();g.roundRect(bx-3,by-3,22,n*6+18,8);g.fill();g.fillStyle=lg(g,bx,0,bx+16,0,['#3a1a4a','#1a0a24']);g.beginPath();g.roundRect(bx,by,16,n*6+12,6);g.fill();
 for(let i=0;i<n;i++){const on=n-1-i<hpN;g.fillStyle=on?lg(g,0,by+3+i*6,0,by+7+i*6,[LT(col),col]):'#40183a';g.beginPath();g.roundRect(bx+3,by+4+i*6,10,4,2);g.fill();}if(hpN)dglow(bx+8,by+n*6-hpN*3+6,16,col,.25);}
function drawBoss(b,cx){const x=b.x-cx,y=b.y+(b.jy||0),t=b.t,trip=b.state==='trip',p2=b.p2&&b.state!=='transform'||b.state==='transform'&&b.st<1.1,K=p2?1.74:1.62;
 if(b.tel>0){const pulse=.4+.4*Math.sin(T*24);sfxText('!',x,y-235*K/1.62,34,.3,0,'#ffe14d','#ff3a3a');dglow(x,y-110,110,'#ff4f7b',pulse*.6);if(b.state==='pound'||b.state==='leap'){const gx=(b.state==='leap'?b.lx:b.x)-cx;g.fillStyle=`rgba(255,60,90,${pulse*.5})`;g.beginPath();g.ellipse(gx,GROUND+2,90,10,0,0,TAU);g.fill();g.strokeStyle=`rgba(255,220,120,${pulse})`;g.lineWidth=2;g.setLineDash([10,7]);g.beginPath();g.moveTo(gx-260,GROUND-4);g.lineTo(gx+260,GROUND-4);g.stroke();g.setLineDash([]);}
  if(b.state==='rain')for(const mx of b.marks){const X=mx-cx;g.fillStyle=`rgba(255,79,123,${.18+pulse*.3})`;g.fillRect(X-14,-200,28,GROUND+200);for(let k=0;k<3;k++){const ay=40+k*26+((T*80)%26);g.fillStyle=`rgba(255,220,240,${pulse})`;g.beginPath();g.moveTo(X-8,ay);g.lineTo(X+8,ay);g.lineTo(X,ay+10);g.closePath();g.fill();}g.strokeStyle=`rgba(255,79,123,${pulse})`;g.lineWidth=2;g.strokeRect(X-14,GROUND-10,28,10);}
  if(b.state==='volley'||b.state==='summon')dglow(x+b.face*30,y-150*K/1.62,26,'#ffe14d',pulse);}
 if(b.state==='transform'){g.globalAlpha=clamp(Math.sin(b.st*16)*.5+.3,0,.8);dglow(x,y-120,170,'#ffffff',1);g.globalAlpha=1;}
 if(p2){dglow(x,y-110,120+Math.sin(T*6)*10,'#ff3a8a',.35);}
 const fr=trip?'trip':b.state!=='walk'&&b.state!=='idle'?'angry':b.state==='walk'?((t*6|0)%2?'walk1':'walk2'):'idle';
 const rot=trip?b.face*.45:0,f=-b.face,lift=b.state==='stomp'&&b.st>.4?-6:0;
 g.save();g.translate(x,y+lift);if(rot)g.rotate(rot),g.translate(0,-6);g.scale(-f*K,K);
 dsp(bossSpr(fr),0,0,1,1,0,b.hit>0);blob(0,-100,t,{r:20,face:-1,scared:trip,angry:p2||fr==='angry',col:p2?'#ff5a8a':'#4fd65c',flash:b.hit>0});dsp(domeSpr(),0,-100);
 if(p2)for(const sx of[-1,1])for(let i=0;i<3;i++){const px=sx*(30+i*14),py=-118-i*8;g.fillStyle=OL;g.beginPath();g.moveTo(px-6,py);g.lineTo(px,py-22-i*4);g.lineTo(px+6,py);g.fill();g.fillStyle=lg(g,0,py-20,0,py,['#ffc0ea','#ff3aa0']);g.beginPath();g.moveTo(px-4,py-1);g.lineTo(px,py-19-i*4);g.lineTo(px+4,py-1);g.fill();}
 g.restore();
 if(trip)for(let i=0;i<3;i++){const a=t*5+i*2.1;txt('★',x+Math.cos(a)*52,y-240+Math.sin(a)*6,12,'#ffc53d');}
 if(b.state==='walk'&&(t*8|0)%4===0)addFx(b.x+rnd(-30,30),y,'dust',1.4);
 if((t*5|0)%3===0&&Math.random()<.3)addFx(b.x+b.face*-90,y-136,'dust',.8);
 if(!M.boss.active)return;vbar(W-30,76,20,b.hp/b.max,b.p2?'#ff3a8a':'#5fe36a');txt(b.p2?'BIG BLORP: ENRAGED':'BIG BLORP',W-14,64,10,b.p2?'#ff3a8a':'#5fe36a','right');}
function pilotFig(x,y,t,face,st,flash){// Big Blorp on foot: the goofy green pilot in a cracked bubble helmet with a ray blaster
 g.save();g.translate(x,y);g.scale(face,1);const sq=st==='stomp'||st==='hop'?1:0,bob=Math.sin(t*14)*1.5;
 g.strokeStyle=OL;g.lineWidth=4;g.lineCap='round';for(const lx of[-6,6]){g.beginPath();g.moveTo(lx,-10);g.lineTo(lx+(sq?lx*.4:Math.sin(t*16+lx)*3),-1);g.stroke();}g.strokeStyle='#3fae4a';g.lineWidth=2.4;for(const lx of[-6,6]){g.beginPath();g.moveTo(lx,-10);g.lineTo(lx+(sq?lx*.4:Math.sin(t*16+lx)*3),-1);g.stroke();}
 g.fillStyle=OL;g.beginPath();g.ellipse(-8,-1,6,3,0,0,TAU);g.ellipse(9,-1,6,3,0,0,TAU);g.fill();
 blob(0,-8+bob,t,{r:17,face:1,angry:1,col:'#5fe36a',flash});
 g.save();g.translate(0,-22+bob);g.strokeStyle=OL;g.lineWidth=2;g.fillStyle='rgba(190,255,220,.25)';g.beginPath();g.arc(0,0,21,Math.PI*1.05,TAU*.99);g.fill();g.stroke();g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.arc(0,0,17,Math.PI*1.2,Math.PI*1.45);g.stroke();
 g.strokeStyle=OL;g.lineWidth=1.4;g.beginPath();g.moveTo(8,-18);g.lineTo(4,-11);g.lineTo(10,-6);g.lineTo(6,0);g.stroke();
 g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,-21);g.quadraticCurveTo(-4,-30,2,-34);g.stroke();circ(2,-35,3.4,OL);circ(2,-35,2.4,'#ffe066');g.restore();
 g.save();g.translate(16,-14+bob);g.fillStyle=OL;g.beginPath();g.roundRect(-4,-5,18,10,4);g.fill();g.fillStyle=lg(g,0,-4,0,4,['#ffb0d8','#ff3a8a']);g.beginPath();g.roundRect(-2.5,-3.5,15,7,3);g.fill();circ(14,0,3.5,OL);circ(14,0,2.4,'#ffe066');g.restore();
 g.restore();}
function drawPilot(b,cx){const p=b.pl,x=p.x-cx;if(p.tel>0&&p.state!=='hop'){const pu=.4+.4*Math.sin(T*24);sfxText('!',x,p.y-70,24,.3,0,'#ffe14d','#ff3a3a');if(p.state==='stomp'){const gx=p.tx-cx;g.fillStyle=`rgba(255,60,90,${pu*.5})`;g.beginPath();g.ellipse(gx,GROUND+2,40,7,0,0,TAU);g.fill();}}
 if(p.state==='eject'){g.save();g.globalAlpha=.6;dglow(x,p.y-20,40,'#ffe066',1);g.restore();}
 pilotFig(x,p.y,p.t,p.face,p.state,p.hit>0);
 if(!b.active)return;vbar(W-30,76,20,p.hp/p.max,'#ffc53d');txt('BIG BLORP: ON FOOT',W-14,64,10,'#ffc53d','right');}
let wasOn=true;
function drawMoon(){const m=M,cx=m.cam,cy=m.camY;if(m.mars){g.fillStyle=lg(g,0,0,0,H,['#2a0c1e','#6a2420','#c0582e']);g.fillRect(0,0,W,H);moonBall(520-cx*.02,60-cy*.08,14);moonBall(140-cx*.015,40-cy*.06,8);}else{starfield(cx*.1);earth(520-cx*.02,70-cy*.08,30);}g.globalAlpha=.07;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
 const r0=ridgeSpr(0),o0=((cx*.15)%W+W)%W,y0=160-cy*.3;g.drawImage(r0.c,-o0,y0,W,190);g.drawImage(r0.c,W-o0,y0,W,190);
 const r1=ridgeSpr(1),o1=((cx*.4)%W+W)%W,y1=180-cy*.55;g.drawImage(r1.c,-o1,y1,W,150);g.drawImage(r1.c,W-o1,y1,W,150);
 g.save();g.translate(0,-cy);baseBack(cx);
 const gs=groundSpr(),og=((cx)%W+W)%W;g.drawImage(gs.c,-og,GROUND,W,64);g.drawImage(gs.c,W-og,GROUND,W,64);
 for(const q of m.gaps){const x=q[0]-cx,w=q[1]-q[0];if(x>W||x+w<0)continue;g.fillStyle=lg(g,0,GROUND-4,0,GROUND+70,['#1a1d38','#05060f']);g.fillRect(x,GROUND-2,w,80);g.fillStyle='#454a6a';g.fillRect(x-3,GROUND-2,4,70);g.fillRect(x+w-1,GROUND-2,4,70);dglow(x+w/2,GROUND+40,30,'#7a3aff',.25);}
 for(const c of m.craters){const x=c[0]-cx;if(m.gaps.some(q=>c[0]+c[1]>q[0]&&c[0]-c[1]<q[1]))continue;if(x>-120&&x<W+120)dsp(craterSpr(c[1]|0),x,GROUND+14);}
 if(m.boss)dsp(craterSpr(68),m.arena+330-cx,GROUND+12);
 const fx=420-cx;if(!m.mars&&fx>-60&&fx<W)dsp(flagSpr(),fx,GROUND);if(m.mars){const sx2=140-cx;if(sx2>-150&&sx2<W+150){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(sx2,GROUND+2,70,7,0,0,TAU);g.fill();landerShip(sx2,GROUND-12*1.4-28,1,1,1.4,0,GROUND);}}
 for(const p of m.movers){const x=p.x-cx;if(x>W||x+p.w<0)continue;dsp(platSpr(p.w),x,p.y);dglow(x+p.w/2,p.y+12,14,'#45d6ff',.6);}
 const ax=m.arena-cx;if(ax>-30&&ax<W+30){g.fillStyle=OL;g.beginPath();g.roundRect(ax-10,GROUND-144,20,146,6);g.fill();g.fillStyle=lg(g,ax-8,0,ax+8,0,['#7a80a8','#454a66','#2a2f48']);g.beginPath();g.roundRect(ax-8,GROUND-142,16,142,5);g.fill();
  for(let j=0;j<7;j++){const on=m.lock?((T*6+j|0)%2):1,c2=m.lock?(on?'#ff4f7b':'#801030'):'#45d6ff';circ(ax,GROUND-130+j*19,3.2,c2);if(on)dglow(ax,GROUND-130+j*19,8,c2,.6);}if(m.lock)dglow(ax,GROUND-70,44,'#ff4f7b',.3);}
 for(const p of m.plats){const x=p[0]-cx;if(x>W||x+p[2]<0)continue;dsp(platSpr(p[2]),x,p[1]);}
 for(const w of m.walls)dsp(rockSprM(w[2],w[3]),w[0]-cx,w[1]);
 for(const p of m.picks){if(p.got)continue;const x=p.x-cx,y=p.y+Math.sin(T*4)*3;if(p.k==='life'){oneUp(x,y);continue;}dglow(x,y,18,p.k==='hp'?'#ff4f7b':p.k==='spread'?'#45d6ff':'#b9f6ff',.7);if(p.k==='gem'){gemShard(x,y,p.gi,GEMS[m.lv][p.gi]);continue;}if(p.k==='tank'){dglow(x,y,26,'#ffc53d',.8);dsp(pickSpr('hp'),x,y,1.3);txt('E',x,y,9,'#fff2a0');}else dsp(pickSpr(p.k==='secret'?'c':p.k),x,y,1,1,p.k==='secret'?Math.sin(T*2)*.3:0);}
 if(m.cfx){for(const q of m.cfx){q.l-=DT;g.globalAlpha=clamp(q.l*2,0,1);sfxText(q.t,q.x-cx,q.y,q.sz||16,.7-q.l,q.rot);g.globalAlpha=1;}m.cfx=m.cfx.filter(q=>q.l>0);}
 for(const f of m.foes){const x=f.x-cx;if(x<-40||x>W+40)continue;g.save();if(f.mode==='trip'){g.translate(x,f.y);g.rotate(f.face*1.2);g.translate(-x,-f.y);}
  if(f.type==='squid')squid(x,f.y,f.t,f.face,f.hit>0);else if(f.type==='bug')goofFlyer(x,f.y,f.t,f.face,f.hit>0);else if(f.bot)colonyBot(x,f.y-(f.jy?Math.abs(Math.sin(f.t*7))*14:0),f.t,f.face,{freed:f.freed,flash:f.hit>0});else blob(x,f.y,f.t,{r:24,face:f.face,scared:f.scared||f.mode==='trip',flash:f.hit>0});g.restore();if(f.mode==='flee'&&(f.t*10|0)%3===0)addFx(f.x-f.face*8,f.y,'dust',.6);}
 if(m.boss&&m.boss.whale){if(!m.boss.dead)drawWhale(m.boss,cx);}else if(m.boss&&(m.boss.hp>0))drawBoss(m.boss,cx);else if(m.boss&&m.boss.pl&&!m.boss.dead)drawPilot(m.boss,cx);
 for(const b of m.shots)bolt(b.x-cx,b.y,m.spread>0);
 for(const e of m.eshots){if(e.wave){dglow(e.x-cx,e.y,18,'#ffb040',.85);g.fillStyle=lg(g,0,e.y-6,0,e.y+4,['#fff6c0','#ff9a3a']);g.beginPath();g.ellipse(e.x-cx,e.y-2,20,8,0,0,TAU);g.fill();}else if(e.cr){const X=e.x-cx;dglow(X,e.y,14,'#ff4fd0',.8);g.fillStyle=OL;g.beginPath();g.moveTo(X,e.y-14);g.lineTo(X+7,e.y);g.lineTo(X,e.y+12);g.lineTo(X-7,e.y);g.closePath();g.fill();g.fillStyle=lg(g,0,e.y-12,0,e.y+10,['#ffd0f0','#ff3aa0','#7a1050']);g.beginPath();g.moveTo(X,e.y-11);g.lineTo(X+5,e.y);g.lineTo(X,e.y+9);g.lineTo(X-5,e.y);g.closePath();g.fill();}else if(e.wat){circ(e.x-cx,e.y,7,OL);g.fillStyle=ballG(g,e.x-cx,e.y,5.8,5.8,'#7ae8ff');g.beginPath();g.arc(e.x-cx,e.y,5.8,0,TAU);g.fill();}else orb(e.x-cx,e.y,e.zap?'#ff9a3a':e.big?'#5fe36a':'#ff4f7b',e.big?9:5);}
 if(m.on&&!wasOn)sfx('land'),addFx(m.px,m.py,'dust',1.2),addFx(m.px-8,m.py,'dust',.8);if(m.on&&Math.abs(m.vx)>100&&(T*12|0)%5===0)addFx(m.px-m.face*8,m.py,'dust',.6);wasOn=m.on;
 const hurtNow=m.inv>.8;if(m.inv<=0||hurtNow||(T*12|0)%2)captain(m.px-cx,m.py,CAPS[cap],{face:m.face,run:m.on&&Math.abs(m.vx)>10?m.run:0,air:!m.on,vy:m.vy,shoot:m.shooting>0,t:T,hurt:hurtNow,flash:hurtNow&&(T*20|0)%2});
 debris(m.booms,cx);drawFx(cx);if(m.mars){if(!m.ldr&&5650-cx>-60&&5650-cx<W+60)leaderBot(5650-cx,GROUND,T,true);g.restore();g.save();g.globalCompositeOperation='multiply';g.fillStyle='#ffe0cc';g.fillRect(0,0,W,H);g.restore();g.save();}g.restore();darkness(cx,cy);
 hud(m.hp,m.maxhp);if(m.tip){panel(150,28,340,46,'#ffc53d');dsp(portrait('hayes'),172,72,.95);wrap('HAYES: '+m.tip.t,332,44,290,9,'#ffffff',13);}if(!m.lock&&!m.tip)txt('M'+m.lv+' · '+(m.lv===4?MSECT4:MSECT).reduce((a,c)=>m.px>=c[0]?c[1]:a,'')+'   ◆ GEMS '+gemN(m.lv)+'/5',W/2,16,10,'#45d6ff');
 m.msgs.slice(-3).forEach((s,i)=>capBox(s.t,W/2,90+i*22));
 if(m.cut)moonCut(m);else controls(false);}
function landerShip(x,y,legK,rampK,sc,flame,gy){const leg=4+24*legK;
 for(const d of[-1,1]){const hx=x+d*24*sc,hy=y+12*sc,fx=x+d*(28*sc+8*legK),fy=hy+leg;g.lineCap='round';g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.moveTo(hx,hy);g.lineTo(fx,fy);g.stroke();g.strokeStyle='#9aa4c4';g.lineWidth=4;g.stroke();
  g.fillStyle=OL;g.beginPath();g.roundRect(fx-10,fy-3,20,7,3);g.fill();g.fillStyle='#ee8a2a';g.beginPath();g.roundRect(fx-8.5,fy-2,17,5,2);g.fill();}
 ship(x,y,0,sc,flame);
 if(rampK>0){const hx=x+8*sc,hy=y+12*sc,len=Math.max(30,Math.hypot(46,gy-hy)),af=Math.asin(clamp((gy-hy)/len,-1,1)),a=-Math.PI/2+(af+Math.PI/2)*rampK;
  g.fillStyle=OL;g.fillRect(hx-9,hy-20,18,21);g.fillStyle='#ffe9a0';g.fillRect(hx-7,hy-18,14,18);dglow(hx,hy-8,22,'#ffc53d',.6*rampK);
  const ex=hx+Math.cos(a)*len,ey=hy+Math.sin(a)*len;g.lineCap='round';g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.moveTo(hx,hy);g.lineTo(ex,ey);g.stroke();g.strokeStyle='#b8bed8';g.lineWidth=6;g.stroke();
  g.strokeStyle='#ee8a2a';g.lineWidth=1.5;g.setLineDash([4,5]);g.stroke();g.setLineDash([]);return{hx,hy,ex,ey};}return null;}
function squid(x,y,t,face,flash){g.save();g.translate(x,y);g.scale(face,1);g.lineCap='round';
 for(let i=0;i<4;i++){const ox=-11+i*7.5;g.strokeStyle=OL;g.lineWidth=6;g.beginPath();g.moveTo(ox,8);g.quadraticCurveTo(ox+Math.sin(t*6+i)*7,20,ox+Math.sin(t*6+i+1)*5,30);g.stroke();g.strokeStyle=flash?'#fff':'#b05ae0';g.lineWidth=3.5;g.stroke();}
 g.fillStyle=OL;g.beginPath();g.moveTo(-6,-22);g.lineTo(0,-34);g.lineTo(8,-22);g.fill();g.beginPath();g.ellipse(0,-4,19,20,0,0,TAU);g.fill();
 g.fillStyle=flash?'#fff':lg(g,0,-24,0,14,['#eab0ff','#a040d0','#5a1a8a']);g.beginPath();g.ellipse(0,-4,17,18,0,0,TAU);g.fill();
 g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(-6,-14,6,3.5,-.4,0,TAU);g.fill();
 g.fillStyle=OL;g.fillRect(12,0,14,8);g.fillStyle='#8a90b0';g.fillRect(13,1.5,12,5);g.fillStyle='#45d6ff';g.fillRect(23,1.5,3,5);
 circ(5,-6,7.5,OL);circ(5,-6,6.2,'#fff');circ(8,-6,3.2,'#1a1030');circ(9,-7.5,1.2,'#fff');g.restore();}
// Moon flyer: "Zibbit", a round purple alien flapping big floppy ears like wings, tiny propeller cap, one huge googly eye, tongue out
function goofFlyer(x,y,t,face,flash){g.save();g.translate(x,y+Math.sin(t*6)*2);g.scale(face,1);const fl=Math.sin(t*22);
 for(const sd of[-1,1]){g.save();g.translate(sd*9,-4);g.rotate(sd*(.5+fl*.55));g.fillStyle=OL;g.beginPath();g.ellipse(sd*12,0,14,6.5,0,0,TAU);g.fill();g.fillStyle=flash?'#fff':lg(g,0,-6,0,6,['#ffc0f0','#e070d0']);g.beginPath();g.ellipse(sd*12,0,12.4,5,0,0,TAU);g.fill();g.restore();}
 g.fillStyle=OL;g.beginPath();g.arc(0,0,14,0,TAU);g.fill();g.fillStyle=flash?'#fff':ballG(g,0,0,12.6,12.6,'#9a5cf0');g.beginPath();g.arc(0,0,12.6,0,TAU);g.fill();
 g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,-13);g.lineTo(0,-19);g.stroke();g.save();g.translate(0,-20);g.scale(Math.cos(t*30),1);g.fillStyle='#ffd23d';g.strokeStyle=OL;g.lineWidth=1.2;g.beginPath();g.ellipse(-6,0,6,2,0,0,TAU);g.ellipse(6,0,6,2,0,0,TAU);g.fill();g.stroke();g.restore();
 circ(4,-3,7.4,OL);circ(4,-3,6.2,'#fff');const px=Math.sin(t*3)*1.6+1.5,py=Math.cos(t*4)*1.6;circ(4+px,-3+py,2.8,OL);circ(4.8+px,-4+py,.9,'#fff');
 g.fillStyle=OL;g.beginPath();g.ellipse(5,7,5,3,0,0,Math.PI);g.fill();g.fillStyle='#ff5a8a';g.beginPath();g.ellipse(7,9.5,2.4,3+Math.max(0,fl)*1.5,0,0,TAU);g.fill();
 g.strokeStyle=OL;g.lineWidth=1.6;for(const lx of[-5,2]){g.beginPath();g.moveTo(lx,12);g.quadraticCurveTo(lx-2,17+fl*2,lx+1,19);g.stroke();}
 g.restore();}
function bugDrone(x,y,t,face,flash){g.save();g.translate(x,y);g.scale(face,1);const fl=Math.sin(t*55)*.5+.5;
 g.fillStyle='rgba(210,245,255,.55)';g.strokeStyle='rgba(20,20,40,.7)';g.lineWidth=1;for(const[o,r]of[[-5,-.5],[3,.4]]){g.beginPath();g.ellipse(o,-12,12,4+fl*5,r,0,TAU);g.fill();g.stroke();}
 g.strokeStyle=OL;g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(-6+i*6,6);g.lineTo(-8+i*6,13);g.stroke();}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,0,16,10.5,0,0,TAU);g.fill();g.fillStyle=flash?'#fff':lg(g,0,-9,0,9,['#f4ff90','#c0e030','#5a8a10']);g.beginPath();g.ellipse(0,0,14.5,9,0,0,TAU);g.fill();
 g.fillStyle='rgba(30,40,10,.6)';for(const o of[-8,-3])g.fillRect(o,-8,2.5,16);
 circ(13,-1,8,OL);circ(13,-1,6.6,flash?'#fff':'#5fe36a');circ(16,-3,3.4,'#ff3a50');circ(16.8,-4,1,'#fff');g.restore();}
function interior(a,b,top,kind,cx){const G0=GROUND,A=a-cx,B=b-cx;if(B<0||A>W)return;const h=G0-top;
 g.fillStyle=lg(g,0,top,0,G0,kind==='reactor'?['#3a2a48','#24183a','#140e28']:kind==='shaft'?['#1a2a50','#1a2244','#10162e']:['#2c3358','#1b2140','#12162e']);g.fillRect(A,top,B-A,h);
 for(let x=A;x<B;x+=62){g.fillStyle='rgba(0,0,0,.35)';g.fillRect(x,top,3,h);g.fillStyle='rgba(255,255,255,.06)';g.fillRect(x+3,top,2,h);}
 if(kind!=='shaft')for(let x=A+20;x<B-60;x+=124){g.fillStyle=OL;g.beginPath();g.roundRect(x,top+30,70,34,8);g.fill();g.fillStyle=lg(g,0,top+32,0,top+62,['#0a1030','#22306a']);g.beginPath();g.roundRect(x+3,top+33,64,28,6);g.fill();circ(x+50,top+42,1.2,'#fff');}
 if(kind==='lab')for(let x=A+40;x<B-80;x+=180){g.fillStyle=OL;g.fillRect(x-2,G0-34,84,8);g.fillRect(x+4,G0-28,6,28);g.fillRect(x+70,G0-28,6,28);g.fillStyle='#9aa0c4';g.fillRect(x,G0-33,80,5);
  ['#5fe36a','#45d6ff','#ff4fd0'].forEach((c,i)=>{g.fillStyle=OL;g.beginPath();g.roundRect(x+12+i*20,G0-50,11,17,4);g.fill();g.fillStyle=c;g.globalAlpha=.8;g.beginPath();g.roundRect(x+13.5+i*20,G0-44,8,10,3);g.fill();g.globalAlpha=1;});
  g.fillStyle=OL;g.fillRect(x+60,G0-62,22,18);g.fillStyle=(T*2+x|0)%3?'#45d6ff':'#1a5070';g.fillRect(x+62,G0-60,18,14);}
 if(kind==='reactor'){const rx=(A+B)/2,ry=top+150,pu=.75+Math.sin(T*4)*.25;dglow(rx,ry,140*pu,'#45d6ff',.45);g.strokeStyle=OL;g.lineWidth=10;g.beginPath();g.arc(rx,ry,70,0,TAU);g.stroke();g.strokeStyle='#ffc53d';g.lineWidth=5;g.stroke();
  circ(rx,ry,48,OL);g.fillStyle=ballG(g,rx,ry,46,46,'#45d6ff');g.beginPath();g.arc(rx,ry,46,0,TAU);g.fill();for(let i=0;i<6;i++){const an=T+i*TAU/6;g.fillStyle=OL;g.fillRect(rx+Math.cos(an)*70-6,ry+Math.sin(an)*70-6,12,12);}
  g.fillStyle=OL;g.fillRect(rx-24,ry+70,48,G0-ry-70);g.fillStyle='#4a5070';g.fillRect(rx-20,ry+70,40,G0-ry-70);txt('REACTOR 1',rx,top+30,10,'#ffc53d');}
 if(kind==='shaft'){g.fillStyle='rgba(69,214,255,.08)';g.fillRect(8420-cx,top,320,h);for(let i=0;i<14;i++){const px=8430-cx+((i*53)%300),py=G0-((T*30+i*61)%h);circ(px,py,1.6,'rgba(185,246,255,.7)');}
  txt('LOW-G SHAFT',8580-cx,top+40,10,'#45d6ff');for(let y=top+70;y<G0-20;y+=60)txt('▼',8580-cx,y,10,'rgba(69,214,255,.5)');}
 if(kind==='air'){for(const dx of[30,B-A-60]){g.fillStyle=OL;g.fillRect(A+dx-4,top+10,38,h-10);g.fillStyle='#5a6088';g.fillRect(A+dx,top+14,30,h-14);g.fillStyle='rgba(255,197,61,.6)';for(let y=top+20;y<G0;y+=24)g.fillRect(A+dx+2,y,26,6);}txt('AIRLOCK B',(A+B)/2,top+18,10,'#ff7a29');}
 for(let x=A;x<B;x+=40){g.fillStyle=((x-A)/40|0)%2?'#ffc53d':'#1a1a1a';g.fillRect(x,G0-12,40,7);}
 g.fillStyle=OL;g.fillRect(A-6,top-16,B-A+12,20);g.fillStyle=lg(g,0,top-14,0,top+2,['#8a90b8','#4a5070']);g.fillRect(A-4,top-14,B-A+8,16);
 for(let x=A+30;x<B;x+=90){const on=((T*2+x/90)|0)%5;g.fillStyle=on?'#b9f6ff':'#405070';g.fillRect(x,top+2,40,4);if(on)dglow(x+20,top+10,26,'#45d6ff',.3);}
 g.fillStyle='#3a4170';g.fillRect(A-14,top-16,14,h+16);}
function baseBack(cx){const G0=GROUND,m=M;if(m.mars)marsBack(cx);
 if(!m.mars)for(const[dx,r]of[[3850,74],[4120,52],[5300,60]]){const x=dx-cx;if(x<-r-20||x>W+r+20)continue;
  g.fillStyle='#2a2f48';g.fillRect(x-r-6,G0-14,r*2+12,14);g.save();g.beginPath();g.ellipse(x,G0-12,r,r*.8,0,Math.PI,TAU);g.closePath();g.fillStyle=lg(g,0,G0-12-r,0,G0,['rgba(185,246,255,.55)','rgba(60,110,180,.35)','rgba(20,30,70,.6)']);g.fill();g.strokeStyle=OL;g.lineWidth=2.5;g.stroke();g.clip();
  g.strokeStyle='rgba(200,230,255,.35)';g.lineWidth=1.2;for(let i=1;i<5;i++){g.beginPath();g.ellipse(x,G0-12,r*i/5,r*.8,0,Math.PI,TAU);g.stroke();}g.restore();
  const on=(T*3+dx|0)%4;circ(x,G0-12-r*.8,3,on?'#ff4f7b':'#601020');if(on)dglow(x,G0-12-r*.8,10,'#ff4f7b',.6);g.fillStyle='rgba(95,227,106,.7)';g.beginPath();g.ellipse(x-r*.5,G0-14,12,5,0,0,TAU);g.fill();}
 const sx=3720-cx;if(!m.mars&&sx>-200&&sx<W){panel(sx,G0-112,116,22,'#ff7a29');txt('TRANQUILITY OUTPOST',sx+58,G0-101,8,'#ffc53d');}
 const[da,db]=m.dark;if(db-cx>0&&da-cx<W){const A=da-cx,B=db-cx;g.fillStyle=lg(g,0,-500,0,G0,m.mars?['#200a08','#3a1610','#4a2014']:['#141020','#221a2a','#2a2230']);g.fillRect(A,-500,B-A,G0+500);
  g.fillStyle=m.mars?'#1a0806':'#0c0a14';g.beginPath();g.moveTo(A,-500);for(let x=0;x<=db-da;x+=40)g.lineTo(A+x,-40+Math.sin((da+x)*.013)*30+((da+x)*7%23));g.lineTo(B,-500);g.fill();
  for(let x=da+80;x<db;x+=260){const X=x-cx;if(X<-40||X>W+40)continue;for(let k=0;k<3;k++){g.fillStyle=m.mars?'#ffb040':'#45d6ff';g.globalAlpha=.8;g.beginPath();g.moveTo(X+k*9,G0-60-k*12);g.lineTo(X+k*9+5,G0-80-k*14);g.lineTo(X+k*9+10,G0-60-k*12);g.fill();g.globalAlpha=1;}dglow(X+10,G0-70,24,'#45d6ff',.4);}
  for(const lx of m.lamps){const X=lx-cx;if(X<-30||X>W+30)continue;g.fillStyle=OL;g.fillRect(X-3,G0-110,6,110);g.fillStyle='#5a6088';g.fillRect(X-1.5,G0-108,3,108);circ(X,G0-114,6,'#fff2c0',OL);dglow(X,G0-114,30,'#ffd27a',.8);}}
 for(const s of INTS)interior(s[0],s[1],s[2],s[3],cx);if(m.mars)marsGardens(cx);
 const k=5120-cx;if(k>-50&&k<W+50)txt(m.mars?'COLONY LOOKOUT':'KOSMOS CACHE',k+70,-440,9,'#b9f6ff');
 const shx=140-cx;if(shx>-150&&shx<W+150&&!m.mars){g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(shx,G0+2,70,7,0,0,TAU);g.fill();landerShip(shx,G0-12*1.4-28,1,1,1.4,0,G0);}
 for(const c of m.cps){const X=c.x-cx;if(c.x===140||X<-20||X>W+20)continue;g.fillStyle=OL;g.fillRect(X-4,G0-60,8,60);g.fillStyle='#8a90b0';g.fillRect(X-2,G0-58,4,58);const col=c.on?'#5fe36a':'#ff4f7b';circ(X,G0-64,7,col,OL);dglow(X,G0-64,c.on?26:14,col,.7);}}
function darkness(cx,cy){const m=M,[a,b]=m.dark,k=clamp(Math.min(m.px-a,b-m.px)/160+.2,0,1);if(m.px<a-200||m.px>b+200||k<=0)return;
 if(!window._dk){window._dk=mkc(W,H);}const c=window._dk,x=c.getContext('2d');x.globalCompositeOperation='source-over';x.clearRect(0,0,W,H);x.fillStyle=`rgba(3,3,12,${.9*k})`;x.fillRect(0,0,W,H);x.globalCompositeOperation='destination-out';
 const hole=(X,Y,r)=>{const q=x.createRadialGradient(X,Y,0,X,Y,r);q.addColorStop(0,'rgba(0,0,0,1)');q.addColorStop(.6,'rgba(0,0,0,.8)');q.addColorStop(1,'rgba(0,0,0,0)');x.fillStyle=q;x.fillRect(X-r,Y-r,r*2,r*2);};
 hole(m.px-cx,m.py-24-cy,150);for(const lx of m.lamps)if(Math.abs(lx-cx-W/2)<W)hole(lx-cx,GROUND-114-cy,120);for(const s of m.shots)hole(s.x-cx,s.y-cy,40);for(let X=a+80;X<b;X+=260)hole(X+10-cx,GROUND-70-cy,50);
 g.drawImage(c,0,0,W,H);}
// ---------- COMIC OPENING (original art, drawn in code) ----------
let comicI=0,comicFrom='title',comicT=0,seenComic=false;try{seenComic=!!localStorage.getItem('gr_comic');}catch(e){}
const PX=16,PY=14,PW=W-32,PH=H-28;
let HALF=null;function halftone(){if(HALF)return HALF;const c=mkc(8,8),x=c.getContext('2d');x.fillStyle='#000';x.beginPath();x.arc(2,2,1.3,0,TAU);x.arc(6,6,1.3,0,TAU);x.fill();HALF=g.createPattern(c,'repeat');return HALF;}
function cText(s,x,y,size,col,maxw,lh,al='left'){setF(size);g.fillStyle=col;g.textAlign=al;g.textBaseline='top';const words=s.split(' ');let line='',yy=y;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxw&&line){g.fillText(line,x,yy);yy+=lh;line=w;}else line=t;}g.fillText(line,x,yy);return yy+lh;}
function fitLines(str,maxw,size,minS){let out;for(let z=size;z>=minS;z-=.5){setF(z);const words=String(str).split(' ');const L=[];let line='';let ok=true;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxw&&line){L.push(line);line=w;}else line=t;if(g.measureText(w).width>maxw)ok=false;}if(line)L.push(line);out={lines:L,size:z};if(ok&&L.length<=4)break;}return out;}
function drawLines(f,cx,y,col,al){setF(f.size);g.fillStyle=col;g.textAlign=al||'center';g.textBaseline='top';const lh=f.size*1.4;f.lines.forEach((l,i)=>g.fillText(l,cx,y+i*lh));return f.lines.length*lh;}
function caption(s,x,y,w){const pad=9,f=fitLines(s,w-pad*2,9.5,7),lh=f.size*1.4,h=f.lines.length*lh+pad*2-f.size*.3;g.fillStyle=OL;g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle='#ffe066';g.fillRect(x,y,w,h);drawLines(f,x+pad,y+pad-1,'#1a1020','left');}
function bubH(s,w,shout){const f=fitLines(s,w*.7-8,10,7),lh=f.size*1.4,th=f.lines.length*lh;return Math.max(34,th*1.45+(shout?22:14))*(shout?1.12:1);}
function capH(s,w){const f=fitLines(s,w-18,9.5,7);return f.lines.length*f.size*1.4+18-f.size*.3;}
function bubble(s,x,y,w,tx,ty,shout){const f=fitLines(s,w*.7-8,10,7),lh=f.size*1.4,th=f.lines.length*lh,h=Math.max(34,th*1.45+(shout?22:14));g.save();g.fillStyle='#fff';g.strokeStyle=OL;g.lineWidth=3;
 g.beginPath();g.moveTo(x+w*.3,y+h-4);g.lineTo(tx,ty);g.lineTo(x+w*.45,y+h-4);g.closePath();g.fill();g.stroke();g.beginPath();if(shout){for(let i=0;i<22;i++){const a=i/22*TAU,r=i%2?1:1.12;g.lineTo(x+w/2+Math.cos(a)*w/2*r,y+h/2+Math.sin(a)*h/2*r);}g.closePath();}else g.ellipse(x+w/2,y+h/2,w/2,h/2,0,0,TAU);g.fill();g.stroke();g.restore();drawLines(f,x+w/2,y+h/2-th/2+1,'#1a1020','center');}
function sfxText(s,x,y,size,t,rot=-.15,c1='#ffe14d',c2='#ff3a3a'){const k=t<.25?.3+t/.25*.9:1.2-Math.min(.2,(t-.25)*.4);g.save();g.translate(x,y);g.rotate(rot);g.scale(k,k);setF(size);g.textAlign='center';g.textBaseline='middle';g.lineJoin='round';
 g.lineWidth=size*.55;g.strokeStyle=OL;g.strokeText(s,3,3);g.strokeText(s,0,0);g.lineWidth=size*.28;g.strokeStyle=c2;g.strokeText(s,0,0);g.fillStyle=c1;g.fillText(s,0,0);g.restore();}
function speedLines(cx,cy,col='rgba(255,255,255,.18)'){g.strokeStyle=col;g.lineWidth=2;for(let i=0;i<40;i++){const a=i/40*TAU+T*.05;g.beginPath();g.moveTo(cx+Math.cos(a)*80,cy+Math.sin(a)*80);g.lineTo(cx+Math.cos(a)*700,cy+Math.sin(a)*700);g.stroke();}}
function kosmosFig(x,y,s,face=1){g.save();g.translate(x,y);g.scale(s*face,s);g.lineJoin='round';
 g.fillStyle=OL;g.beginPath();g.roundRect(-26,0,52,70,16);g.fill();g.fillStyle=lg(g,0,0,0,70,['#8a5a3a','#5a3a24']);g.beginPath();g.roundRect(-23,3,46,66,14);g.fill();
 g.fillStyle='#2a2a3a';g.beginPath();g.moveTo(-10,2);g.lineTo(0,22);g.lineTo(10,2);g.fill();
 g.fillStyle=OL;g.beginPath();g.ellipse(2,-18,19,22,0,0,TAU);g.fill();g.fillStyle='#e8b890';g.beginPath();g.ellipse(2,-18,16.5,19.5,0,0,TAU);g.fill();
 g.fillStyle='#5a3a22';g.beginPath();g.moveTo(-16,-14);g.quadraticCurveTo(-22,-44,4,-42);g.quadraticCurveTo(24,-42,20,-20);g.quadraticCurveTo(14,-32,0,-30);g.quadraticCurveTo(-8,-28,-10,-14);g.closePath();g.fill();g.strokeStyle=OL;g.lineWidth=2;g.stroke();
 g.fillStyle=OL;g.beginPath();g.ellipse(11,-19,2.2,2.8,0,0,TAU);g.fill();g.beginPath();g.ellipse(2,-19,2,2.6,0,0,TAU);g.fill();g.strokeStyle='#5a3a22';g.lineWidth=2;g.beginPath();g.moveTo(7,-25);g.lineTo(14,-26);g.stroke();
 g.strokeStyle='#8a4a3a';g.beginPath();g.moveTo(4,-8);g.quadraticCurveTo(9,-5,13,-9);g.stroke();g.restore();}
function vorrKing(x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=OL;g.beginPath();g.moveTo(-90,110);g.lineTo(-40,-10);g.lineTo(40,-10);g.lineTo(90,110);g.fill();g.fillStyle=lg(g,0,-10,0,110,['#5a1a6a','#2a0a3a']);g.beginPath();g.moveTo(-85,108);g.lineTo(-37,-6);g.lineTo(37,-6);g.lineTo(85,108);g.fill();
 for(const sx of[-1,1]){g.fillStyle=OL;g.beginPath();g.moveTo(sx*20,-6);g.lineTo(sx*62,-22);g.lineTo(sx*44,10);g.fill();g.fillStyle=lg(g,0,-22,0,10,['#ffb0ff','#b040e0']);g.beginPath();g.moveTo(sx*24,-5);g.lineTo(sx*58,-19);g.lineTo(sx*42,6);g.fill();}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,-34,30,34,0,0,TAU);g.fill();g.fillStyle=lg(g,0,-68,0,0,['#c090e0','#6a3a9a','#3a1a5a']);g.beginPath();g.ellipse(0,-34,27,31,0,0,TAU);g.fill();
 for(let i=-2;i<=2;i++){g.fillStyle=OL;g.beginPath();g.moveTo(i*11-7,-58);g.lineTo(i*12,-92+Math.abs(i)*9);g.lineTo(i*11+7,-58);g.fill();g.fillStyle='#ff7ae0';g.beginPath();g.moveTo(i*11-4.5,-60);g.lineTo(i*12,-87+Math.abs(i)*9);g.lineTo(i*11+4.5,-60);g.fill();}
 for(const sx of[-1,1]){g.fillStyle='#ff2a4a';g.beginPath();g.moveTo(sx*4,-38);g.lineTo(sx*20,-44);g.lineTo(sx*18,-34);g.closePath();g.fill();dglow(sx*13,-39,16,'#ff2a4a',.8);}
 g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.moveTo(-10,-16);g.lineTo(-4,-12);g.lineTo(4,-12);g.lineTo(10,-16);g.stroke();g.restore();}
function kreel(x,y,s){g.save();g.translate(x,y);g.scale(s,s);
 g.fillStyle=OL;g.beginPath();g.moveTo(-50,90);g.lineTo(-40,20);g.lineTo(40,20);g.lineTo(50,90);g.fill();g.fillStyle=lg(g,0,20,0,90,['#3a3a5a','#1a1a2a']);g.beginPath();g.moveTo(-46,88);g.lineTo(-37,24);g.lineTo(37,24);g.lineTo(46,88);g.fill();g.fillStyle='#ff4f7b';g.fillRect(-36,40,72,5);
 g.fillStyle=OL;g.beginPath();g.moveTo(0,-62);g.lineTo(34,-24);g.lineTo(24,22);g.lineTo(-24,22);g.lineTo(-34,-24);g.closePath();g.fill();g.fillStyle=lg(g,-30,-60,30,20,['#e0a0ff','#9a40d0','#4a1a7a']);g.beginPath();g.moveTo(0,-57);g.lineTo(30,-23);g.lineTo(21,18);g.lineTo(-21,18);g.lineTo(-30,-23);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(0,-55);g.lineTo(-28,-23);g.lineTo(-6,-20);g.fill();
 g.fillStyle=OL;g.fillRect(-30,-22,60,14);g.fillStyle=lg(g,0,-20,0,-10,['#ff8aa0','#ff1a4a']);g.fillRect(-27,-20,54,10);dglow(0,-15,30,'#ff2a4a',.6);
 g.strokeStyle='#ffe0ff';g.lineWidth=2.5;g.beginPath();g.moveTo(10,-6);g.lineTo(20,8);g.stroke();
 g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.moveTo(-12,4);g.quadraticCurveTo(0,10,14,2);g.stroke();g.restore();}
function voyagerProbe(x,y,s){g.save();g.translate(x,y);g.scale(s,s);g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.moveTo(10,6);g.lineTo(34,16);g.moveTo(-8,8);g.lineTo(-26,22);g.stroke();g.strokeStyle='#c8cce0';g.lineWidth=2;g.stroke();
 g.fillStyle=OL;g.fillRect(-10,0,22,14);g.fillStyle='#d0a030';g.fillRect(-8,2,18,10);circ(-1,7,4,'#ffd84a',OL);
 g.fillStyle=OL;g.beginPath();g.ellipse(0,-8,26,9,0,0,TAU);g.fill();g.fillStyle=lg(g,0,-16,0,0,['#ffffff','#c8cce0']);g.beginPath();g.ellipse(0,-8,23,7,0,0,TAU);g.fill();circ(0,-8,2.5,'#8a90b0');g.restore();}
function bigRecord(x,y,r){circ(x,y,r+3,OL);g.fillStyle=ballG(g,x,y,r,r,'#e0a828');g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.strokeStyle='rgba(110,70,10,.5)';g.lineWidth=1.2;for(let k=r*.35;k<r;k+=4){g.beginPath();g.arc(x,y,k,0,TAU);g.stroke();}circ(x,y,r*.3,'#ffd84a',OL);circ(x,y,3,OL);g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(x-r*.35,y-r*.4,r*.35,r*.12,-.6,0,TAU);g.fill();}
function crystal(x,y,s,gl=1){dglow(x,y,40*s,'#7ae8ff',.9*gl);g.save();g.translate(x,y);g.scale(s,s);g.fillStyle=OL;g.beginPath();g.moveTo(0,-26);g.lineTo(14,0);g.lineTo(0,26);g.lineTo(-14,0);g.closePath();g.fill();
 g.fillStyle=lg(g,-12,-24,12,24,['#e8ffff','#7ae8ff','#2a8ab8']);g.beginPath();g.moveTo(0,-22);g.lineTo(11,0);g.lineTo(0,22);g.lineTo(-11,0);g.closePath();g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.moveTo(0,-20);g.lineTo(-9,0);g.lineTo(0,2);g.fill();g.restore();}
function capCard(i,x,y,w,h){const im=IMG[CAPKEY[i]];g.fillStyle=OL;g.fillRect(x-4,y-4,w+8,h+8);if(im){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();drawCover(im,x,y,w,h);g.restore();}else{g.fillStyle='#1c2a6a';g.fillRect(x,y,w,h);dsp(portrait(i),x+w/2,y+h*.8,h/45);}
 g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(x+3,y+3,w-6,h-6);}
const COMIC=[
 {d:6,int:0,cap:'1977. Late at night, the doctor decodes a strange signal.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#101a40','#1a2a5a']);g.fillRect(0,0,W,H);g.fillStyle='#05081a';g.fillRect(380,40,200,130);for(let i=0;i<30;i++)circ(385+(i*53)%190,45+(i*31)%120,1,'#fff');g.strokeStyle=OL;g.lineWidth=6;g.strokeRect(380,40,200,130);
  g.fillStyle='#2a2238';g.fillRect(0,250,W,110);g.fillStyle=OL;g.fillRect(120,200,200,18);g.fillStyle='#6a5a48';g.fillRect(122,202,196,14);g.fillStyle=OL;g.fillRect(150,120,120,82);g.fillStyle='#062a10';g.fillRect(156,126,108,70);
  g.strokeStyle='#5fe36a';g.lineWidth=2;g.beginPath();for(let i=0;i<108;i++)g.lineTo(156+i,161+Math.sin(i*.3+t*8)*Math.sin(i*.05+t)*24);g.stroke();dglow(210,160,60,'#5fe36a',.3);kosmosFig(380,210,1.4,-1);},
  bub:[{s:'The Vorr... they\'re hunting for something.',x:380,y:60,w:200,tx:390,ty:150,at:1.2}],fx:{s:'BEEP! BEEP!',x:200,y:100,sz:22,at:.3}},
 {d:5.5,int:1,cap:'The Heart Crystal. Long ago it went dark, and its Crystal Keys scattered across the solar system.',draw:t=>{g.fillStyle='#120c24';g.fillRect(0,0,W,H);speedLines(W/2,H/2,'rgba(122,232,255,.12)');
  for(const sx of[-1,1]){g.save();g.translate(W/2+sx*(40+t*6),205);g.rotate(sx*.15);g.fillStyle=OL;g.beginPath();g.ellipse(0,0,95,60,0,sx>0?-Math.PI/2:Math.PI/2,sx>0?Math.PI/2:Math.PI*1.5);g.fill();g.fillStyle=lg(g,0,-60,0,60,['#6a5a6a','#3a2e3a']);g.beginPath();g.ellipse(0,0,90,56,0,sx>0?-Math.PI/2:Math.PI/2,sx>0?Math.PI/2:Math.PI*1.5);g.fill();g.restore();}
  crystal(W/2,190,1.6+Math.sin(t*3)*.05);for(const sx of[-1,1]){g.fillStyle=OL;g.beginPath();g.ellipse(W/2+sx*170,290,48,30,sx*.4,0,TAU);g.fill();g.fillStyle='#e8b890';g.beginPath();g.ellipse(W/2+sx*170,290,44,26,sx*.4,0,TAU);g.fill();}},
  bub:[{s:'Only all the Keys can unlock it and light it up again!',x:60,y:70,w:150,tx:150,ty:250,at:1.4}],fx:{s:'KRRSSHH!',x:470,y:300,sz:26,at:.2}},
 {d:6,int:1,cap:'The Vorr must never get it. So he hides the Heart Crystal inside the Golden Record on Voyager.',draw:t=>{g.fillStyle=lg(g,0,0,W,H,['#2a1a10','#5a3a10']);g.fillRect(0,0,W,H);speedLines(330,200,'rgba(255,210,90,.12)');
  crystal(330+Math.max(0,1-t/3)*-120,200,1.2,1-Math.min(1,t/3)*.5);bigRecord(330,200,120);g.fillStyle=OL;g.beginPath();g.ellipse(130+Math.min(t,3)*30,250,50,30,-.3,0,TAU);g.fill();g.fillStyle='#e8b890';g.beginPath();g.ellipse(130+Math.min(t,3)*30,250,46,26,-.3,0,TAU);g.fill();},
  bub:[{s:'Go far. Keep it safe.',x:430,y:70,w:180,tx:420,ty:200,at:1.8}]},
 {d:5.5,int:1,cap:'Voyager carries the Heart Crystal to the far edge of space.',draw:t=>{starfield(T*4);earth(140,230,90);voyagerProbe(380+t*30,150-t*8,2.2-t*.12);},fx:{s:'WHOOOSH',x:470,y:270,sz:24,at:.4,rot:.1,c1:'#bfe8ff',c2:'#3a7aff'}},
 {d:5,int:2,warn:1,cap:'DECADES LATER.',draw:t=>{const on=(t*4|0)%2;g.fillStyle=on?'#4a0a1a':'#2a0a14';g.fillRect(0,0,W,H);dsp(mcSpr(),0,0,1,1,0,false,.55);g.fillStyle=`rgba(255,30,60,${on?.35:.1})`;g.fillRect(0,0,W,H);
  g.fillStyle=OL;g.fillRect(170,60,300,120);g.fillStyle='#200008';g.fillRect(176,66,288,108);g.strokeStyle='#ff4f7b';g.lineWidth=2;g.beginPath();for(let i=0;i<288;i++)g.lineTo(176+i,120+Math.sin(i*.25+t*10)*30*Math.sin(i*.04));g.stroke();txt('SIGNAL 1977-K',320,80,10,'#ff4f7b');},
  bub:[{s:'The Vorr tracked Voyager\'s signal!',x:330,y:200,w:230,tx:300,ty:330,shout:1,at:.8}],fx:{s:'WHOOP! WHOOP!',x:160,y:240,sz:22,at:.1}},
 {d:5.5,int:2,cap:'Vorr warships, powered by stolen crystal, hunt for the Crystal Keys.',draw:t=>{starfield(T*3);g.fillStyle=OL;g.beginPath();g.arc(120,300,160,0,TAU);g.fill();g.fillStyle=ballG(g,120,300,156,156,'#3a6aff');g.beginPath();g.arc(120,300,156,0,TAU);g.fill();
  dsp(carrierSpr(),470-t*10,120,1.1);for(let i=0;i<9;i++){dglow(300+i*36-t*30+22,200+Math.sin(i*1.7)*60,8,'#45d6ff',.6);dsp(vorrSpr(),300+i*36-t*30,200+Math.sin(i*1.7)*60,1.2);}},fx:{s:'VRRRMMM',x:450,y:290,sz:24,at:.6,rot:-.05,c1:'#e0b0ff',c2:'#8a2ad0'}},
 {d:6,int:2,sting:1,cap:'VORR KING MALAKAR',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#1a0420','#3a0a40']);g.fillRect(0,0,W,H);speedLines(320,170,'rgba(255,80,160,.12)');vorrKing(320,190+Math.sin(t*2)*3,1.15+t*.02);
  g.fillStyle='rgba(255,40,80,.06)';for(let y=0;y<H;y+=4)g.fillRect(0,y+(T*40%4),W,1);},bub:[{s:'Every Crystal Key will be mine. Then the Heart Crystal obeys ME!',x:380,y:200,w:220,tx:360,ty:150,at:1}]},
 {d:5.5,int:3,cap:'ACE KREEL: the Vorr\'s deadliest pilot.',draw:t=>{g.fillStyle='#0a0618';g.fillRect(0,0,W,H);speedLines(220,170,'rgba(255,79,123,.15)');g.fillStyle=OL;g.beginPath();g.ellipse(220,190,190,170,0,0,TAU);g.lineWidth=14;g.strokeStyle='#3a2a5a';g.stroke();kreel(220,190,1.5);
  g.fillStyle=OL;g.fillRect(420,250,190,34);g.fillStyle='#ff4f7b';g.fillRect(424,254,182,26);txt('ACE KREEL',515,267,14,'#ffffff');},bub:[{s:'Kreel flies point. Nothing gets past me.',x:400,y:70,w:200,tx:300,ty:150,at:1}],fx:{s:'SKREEE!',x:520,y:200,sz:20,at:2.2,rot:.12}},
 {d:5,int:3,cap:'The Moon outpost goes dark as blob minions overrun it.',draw:t=>{starfield(0);earth(540,60,30);g.fillStyle=lg(g,0,240,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,240,W,H-240);
  for(const[dx,r]of[[160,80],[380,56]]){g.fillStyle=OL;g.beginPath();g.ellipse(dx,244,r+3,r*.8+3,0,Math.PI,TAU);g.fill();g.fillStyle=(t*3|0)%2&&t<2.5?'#bfe8ff':'#2a3050';g.beginPath();g.ellipse(dx,244,r,r*.8,0,Math.PI,TAU);g.fill();}
  for(let i=0;i<8;i++)blob(60+i*75,262+(i%2)*14,T+i,{r:18+(i%3)*4,face:i%2?1:-1});},fx:{s:'BLORP!',x:480,y:150,sz:30,at:.5,c1:'#a0ff90',c2:'#2a9a3a'}},
 {d:5,int:3,cap:'Mission Control.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#1c2458','#0c0f2a']);g.fillRect(0,0,W,H);speedLines(200,200,'rgba(255,197,61,.1)');dsp(portrait('hayes'),200,330,7);},bub:[{s:'Four captains. Find the Crystal Keys before Malakar does. Each Vorr boss guards one.',x:360,y:90,w:240,tx:300,ty:180,at:.8}]},
 ...[0,1,2,3].map(i=>({d:3.4,int:3,cap:'',capI:i,draw:t=>{const cols=['#2f7bff','#ff4f7b','#3fae5a','#8a5cff'];g.fillStyle=cols[i];g.fillRect(0,0,W,H);speedLines(200,180,'rgba(255,255,255,.22)');
  const sx=Math.max(0,1-t/.35)*-300;capCard(i,60+sx,30,240,300);g.fillStyle=OL;g.fillRect(330,110,270,46);g.fillStyle='#ffe066';g.fillRect(333,113,264,40);txt(CAPS[i].name,465,133,17,'#ffffff');cText(CAPS[i].bio,340,170,11,'#ffffff',250,16);txt('CAPTAIN '+(i+1)+' OF 4',465,90,9,'#ffffff');}})),
 {d:4.5,int:3,sting:1,cap:'The crew of four stands ready. Choose who flies Pale Blue.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#ff9a5a','#5a4a9a','#1a1a4a']);g.fillRect(0,0,W,H);g.fillStyle='#2a2a3a';g.fillRect(0,270,W,90);g.fillStyle=OL;g.fillRect(420,110,26,160);g.strokeStyle='#d04020';g.lineWidth=2;g.strokeRect(422,112,22,156);
  g.save();g.translate(330,190);g.rotate(-Math.PI/2);ship(0,0,0,2.4,0);g.restore();},fx:{s:'GO TIME!',x:180,y:120,sz:28,at:1.2}}];
function comicGo(i){if(!CB)CB=COMIC;comicI=i;comicT=0;const b=CB[i];if(!b)return;MUS.intensity=b.int;if(b.warn)sfx('warn');if(b.sting)sfx('stinger');if(b.capI!==undefined)capHit(b.capI);sfx('whoosh');}
let CB=null,CEND=null;const INTER1=[
 {d:3.6,int:2,cap:'Kreel\'s fighter limps away into the dark...',draw:t=>{starfield(T*30);moonBall(470,170,150);speedLines(200,170,'rgba(255,120,160,.12)');dsp(vorrSpr(),200-t*30,140-t*12,2.4-t*.3,1,-.3);dglow(160-t*30,150,20,'#ff7a29',.8);},bub:[{s:'This isn\'t over, Earthling! Malakar will hear of this!',x:300,y:40,w:250,tx:230,ty:120,at:.5,shout:1}],fx:{s:'FWOOSH!',x:120,y:250,sz:26,at:.3}},
 {d:3.6,int:2,cap:'Mission Control, Earth.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#1c2458','#0c0f2a']);g.fillRect(0,0,W,H);dsp(portrait('hayes'),200,330,7);},bub:[{s:'Great flying, Captain! Pale Blue is in lunar orbit.',x:330,y:80,w:250,tx:300,ty:170,at:.4}]},
 {d:3.8,int:3,sting:1,cap:'Below: the outpost. Dark. Crawling with blobs.',draw:t=>{starfield(0);earth(560,60,26);g.fillStyle=lg(g,0,240,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,240,W,H);for(let i=0;i<6;i++)blob(80+i*90,266+(i%2)*12,T+i,{r:16+(i%3)*4,face:i%2?1:-1});ship(420,120+Math.sin(t*2)*6,T,1.3);},bub:[{s:'Setting her down. Keep the coffee warm, Hayes.',x:60,y:40,w:240,tx:380,ty:110,at:.6}],fx:{s:'BLORP!',x:520,y:220,sz:24,at:1}}];
function marsBall(x,y,r){circ(x,y,r+3,OL);g.fillStyle=ballG(g,x,y,r,r,'#e2603a');g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(120,30,20,.35)';for(const[a,b,c]of[[-.3,-.2,.25],[.25,.15,.18],[-.05,.35,.14]]){g.beginPath();g.ellipse(x+a*r,y+b*r,c*r,c*r*.6,.3,0,TAU);g.fill();}}
const MOONWIN=[
 {d:5,int:3,sting:1,cap:'The Vorr mech lies in pieces. Its pilot has other plans.',draw:t=>{starfield(0);earth(560,60,26);g.fillStyle=lg(g,0,250,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,250,W,H);speedLines(420,230,'rgba(255,255,255,.2)');
   g.save();g.translate(170,300);g.rotate(.5);dsp(bossSpr('trip'),0,0,1.1);g.restore();for(let i=0;i<4;i++)dglow(120+i*40,250-i*12,20,'#ff9a3a',.5);
   g.save();g.translate(430+t*40,300-Math.abs(Math.sin(t*9))*16);g.scale(2.2,2.2);pilotFig(0,0,T*2,1,'hop',false);g.restore();},
  bub:[{s:'You win THIS time! Big Blorp go tell King Malakar!',x:330,y:70,w:240,tx:470,ty:230,at:.6,shout:1}],fx:{s:'SCRAM!',x:560,y:200,sz:26,at:.3}},
 {d:5,int:3,cap:'Something drops from the fleeing pilot.',draw:t=>{starfield(0);g.fillStyle=lg(g,0,240,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,240,W,H);dglow(320,230,90,'#ff7ae0',.5+.2*Math.sin(T*4));gemShard(320,230,0,false,4);
   captain(150,330,CAPS[cap],{sc:1.6,t:T});},
  bub:[{s:'Our second Crystal Key! Feel that? The Heart Crystal\'s waking up!',x:360,y:70,w:230,tx:200,ty:200,at:.6}],fx:{s:'SHIMMER!',x:470,y:290,sz:20,at:.2,c1:'#ffd6ff',c2:'#7a3ae8'}},
 {d:5.5,int:3,img:'c07',cap:'Far away, aboard the Vorr flagship...',bub:[{s:'Two Crystal Keys gone? No matter. I will take the rest, and then I take Voyager!',x:350,y:180,w:250,tx:330,ty:150,at:.6}]},
 {d:5.5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Great work, Captain! Two Crystal Keys safe. Malakar will chase you for them, so keep moving.',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {d:4.5,int:3,sting:1,cap:'The race to Voyager continues.',draw:t=>{starfield(T*30);moonBall(90,290,60);marsBall(520,120,46);speedLines(320,180,'rgba(255,197,61,.18)');ship(220+t*30,200-t*10,T,1.1);},
  fx:{s:'NEXT STOP: MARS!',x:330,y:300,sz:28,at:.5,rot:-.08}}];
const MARSGO=[
 {d:5,int:3,cap:'Leaving the Moon with two Crystal Keys aboard.',draw:t=>{starfield(T*12);moonBall(160,250,110);ship(380+t*20,130,T,1.1);},bub:[{s:'Two Keys safe. Fuel gauge... uh oh. That needle is nearly on empty.',x:330,y:220,w:270,tx:400,ty:160,at:.5}]},
 {d:5,int:3,cap:'Meanwhile, a Zibbit taxi zooms ahead...',draw:t=>{starfield(T*30);speedLines(320,180,'rgba(255,255,255,.15)');g.save();g.translate(380,190);g.scale(2.4,2.4);g.translate(-380,-190);DRAWK.taxi({x:380,y:190,age:T,hit:0});g.restore();g.save();g.translate(380,150);blob(0,0,T,{r:16,face:-1,scared:1,col:'#4fd65c'});g.restore();},bub:[{s:'Faster, taxi! Big Blorp must warn the fuel stations! Earthlings coming!',x:40,y:60,w:260,tx:350,ty:150,at:.4}],fx:{s:'VROOOM!',x:520,y:290,sz:24,at:.3}},
 {d:5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Three Vorr-held fuel stations between you and Mars. Free them, fill up, and go!',x:330,y:70,w:270,tx:300,ty:180,at:.4}]}];
const MARSLAND=[
 {d:5,int:3,cap:'Mars. Ten minutes to touchdown.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#2a0c1e','#8a3020','#d06a3a']);g.fillRect(0,0,W,H);g.fillStyle='#6a2416';g.beginPath();g.moveTo(0,300);g.lineTo(140,190);g.lineTo(260,240);g.lineTo(380,150);g.lineTo(520,250);g.lineTo(W,210);g.lineTo(W,H);g.lineTo(0,H);g.fill();for(let i=0;i<6;i++){circ(330+i*16,200+((i*7)%3)*8,3.4,OL);circ(330+i*16,200+((i*7)%3)*8,2.4,'#ffe066');}ship(150+t*30,90+t*10,T,1);},bub:[{s:'There\'s the colony, built right into the mountain. No lights on. That\'s not good.',x:300,y:56,w:250,tx:200,ty:100,at:.5}]},
 {d:5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'The colony robots stopped answering us. Free them, find the leader, and watch for Vorr.',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {d:5,int:3,cap:'Somewhere in the tunnels...',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#1a0a10','#3a1a10']);g.fillRect(0,0,W,H);g.save();g.translate(200,250);g.scale(1.6,1.6);blob(0,0,T,{r:26,face:1,angry:1,col:'#4fd65c'});dsp(domeSpr(),0,0);g.restore();dustWhale(460,220,.7,T,{});},bub:[{s:'BLORP! Big Blorp is back! Dust Whale guard my water, and Malakar give Blorp a NEW robot!',x:40,y:60,w:270,tx:200,ty:180,at:.4}],fx:{s:'BLORP!',x:520,y:80,sz:26,at:.3}}];
const MARSWIN=[
 {d:4.5,int:3,cap:'Meanwhile, behind a rock...',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#3a1a10','#7a3020']);g.fillRect(0,0,W,H);g.save();g.translate(220+t*60,250);g.scale(1.8,1.8);blob(0,0,T*2,{r:24,face:1,scared:1,col:'#4fd65c'});dsp(domeSpr(),0,0);g.restore();},bub:[{s:'My whale! My water! Big Blorp is NOT having a good week. Run away!',x:330,y:60,w:260,tx:300,ty:200,at:.4}],fx:{s:'SCRAM!',x:520,y:300,sz:26,at:.3}},
 {d:5,int:3,cap:'The Dust Whale lets go...',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#3a1a10','#1a0a08']);g.fillRect(0,0,W,H);for(let i=0;i<40;i++){const u=((t*.6+i/40)%1);circ(100+i*12+Math.sin(i)*20,300-u*260,4+i%3,'#7ae8ff');}dustWhale(320,220,.8,T,{});},bub:[{s:'Hic! Okay okay! Take your water back. Glub.',x:380,y:60,w:220,tx:360,ty:170,at:.5}],fx:{s:'SPLOOOSH!',x:180,y:80,sz:30,at:.2}},
 {d:5.5,int:3,cap:'The colony gardens drink it up.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#ff9a6a','#c0582e']);g.fillRect(0,0,W,H);for(let i=0;i<9;i++){const x=50+i*68,gr=clamp(t*1.4-i*.1,0,1);g.fillStyle='#4a8a3a';g.beginPath();g.ellipse(x,330-gr*20,22*gr+4,30*gr+4,0,Math.PI,TAU);g.fill();if(gr>.6){circ(x,300-gr*30,7,OL);circ(x,300-gr*30,5.5,['#ff7ae0','#ffe066','#7ae8ff'][i%3]);}}leaderBot(320,310,T,false);colonyBot(200,320,T,1,{freed:1});colonyBot(450,320,T+1,-1,{freed:1});},bub:[{s:'Our gardens! They\'re blooming! Thank you, Captain!',x:360,y:60,w:240,tx:330,ty:200,at:.5}],fx:{s:'BLOOM!',x:150,y:80,sz:28,at:.4}},
 {d:5.5,int:3,cap:'The Mars Crystal Key!',draw:t=>{starfield(T*4);dglow(320,180,80+Math.sin(T*3)*8,'#b04aff',.6);g.fillStyle=OL;g.beginPath();g.moveTo(320,100);g.lineTo(360,180);g.lineTo(320,260);g.lineTo(280,180);g.closePath();g.fill();g.fillStyle=lg(g,0,100,0,260,['#f0c0ff','#b04aff','#5a1a8a']);g.beginPath();g.moveTo(320,108);g.lineTo(352,180);g.lineTo(320,252);g.lineTo(288,180);g.closePath();g.fill();},bub:[{s:'That makes four Crystal Keys! The Heart Crystal is starting to glow. Voyager, here we come!',x:30,y:200,w:240,tx:280,ty:180,at:.5}]},
 {d:5.5,int:3,img:'c07',cap:'On the Vorr flagship...',bub:[{s:'FOUR Crystal Keys?! Fine. Collect them all, Earthlings. I will take them at Voyager!',x:340,y:170,w:260,tx:330,ty:150,at:.6}]},
 {d:5.5,int:3,cap:'Then, a crackling signal...',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#0a0a20','#1a1040']);g.fillRect(0,0,W,H);starfield(T*4);moonBall(470,120,46);for(let k=0;k<4;k++){const r=((t*.8+k/4)%1)*90;g.strokeStyle=`rgba(255,224,102,${1-r/90})`;g.lineWidth=3;g.beginPath();g.arc(470,120,46+r,0,TAU);g.stroke();}ship(160,230,T,1);},bub:[{s:'...HELP... trapped... Vorr... moon of Mars... WOOF... I mean, over!',x:40,y:50,w:260,tx:420,ty:130,at:.5}],fx:{s:'SOS!',x:470,y:240,sz:28,at:.3}},
 {d:4.5,int:3,cap:'To be continued...',draw:t=>{starfield(T*14);moonBall(420,200,90);ship(220,160+Math.sin(T*2)*6,T,1.2);},bub:[{s:'Did that signal just... bark?',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'NEXT: THE DISTRESS SIGNAL!',x:320,y:70,sz:24,at:.4,rot:-.05}}];
const MARSARR=[
 {d:4.5,int:3,cap:'Krool\'s pod tumbles away... with a passenger.',draw:t=>{starfield(T*20);g.save();g.translate(320,190);g.rotate(t*2);kroolPod(0,0,false);g.restore();g.save();g.translate(360,170);g.scale(1.2,1.2);blob(0,0,T,{r:12,face:-1,scared:1,col:'#4fd65c'});g.restore();},bub:[{s:'Krool! Move over! Big Blorp needs a ride to Mars too!',x:40,y:200,w:250,tx:340,ty:170,at:.4}],fx:{s:'BONK!',x:480,y:90,sz:26,at:.3}},
 {d:5,int:3,sting:1,cap:'At last: Mars.',draw:t=>{starfield(T*8);marsBall(420,190,150+t*6);speedLines(320,180,'rgba(255,170,120,.15)');ship(160+t*20,150,T,1.3);},bub:[{s:'There it is. The red planet. And the Vorr got here first.',x:40,y:230,w:250,tx:170,ty:170,at:.5}],fx:{s:'MARS!',x:470,y:90,sz:30,at:.3}},
 {d:5.5,int:3,img:'c07',cap:'On the Vorr flagship...',bub:[{s:'Let the Earthlings come. My army is digging on Mars. The path to Voyager will be MINE.',x:340,y:170,w:260,tx:330,ty:150,at:.6}]},
 {d:5.5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Your next mission: land on Mars and find out what Malakar is digging for.',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {d:4.5,int:3,cap:'To be continued...',draw:t=>{starfield(T*20);marsBall(320,420,260);ship(320,150+Math.sin(T*2)*6,T,1.2);},fx:{s:'NEXT: MARS!',x:320,y:90,sz:30,at:.4,rot:-.06}}];
function playComic(beats,onEnd){CB=beats;CEND=onEnd;comicI=0;comicT=0;go('comic');}
function endComic(){if(CEND){const f=CEND;CEND=null;CB=COMIC;f();return;}seenComic=true;try{localStorage.setItem('gr_comic','1');}catch(e){}go(comicFrom==='missions'?'missions':'select');}
function comicArt(){const tag=(arr,p)=>arr.forEach((b,i)=>{b.img=b.img||p+String(i+1).padStart(2,'0');});tag(COMIC,'c');tag(INTER1,'i1_');tag(MOONWIN,'mw_');tag(MARSARR,'ma_');tag(MARSLAND,'ml_');tag(MARSGO,'mg_');tag(MARSWIN,'mx_');
 fetch('assets/comic/manifest.json').then(r=>r.ok?r.json():[]).then(l=>{for(const f of l||[]){const m=String(f).match(/^(.+)\.(png|jpe?g)$/i);if(m)loadImg('comic_'+m[1],'assets/comic/'+f);}}).catch(()=>{});}
function drawComic(){if(!CB)CB=COMIC;if(stateT<.05&&comicT===0&&comicI===0)comicGo(0);const b=CB[comicI];if(!b){endComic();return;}comicT+=DT*(AUTO?4:1);const t=comicT;
 g.fillStyle='#0d0a1e';g.fillRect(0,0,W,H);
 const prev=CB[comicI-1],sl=clamp(t/.45,0,1),e=1-Math.pow(1-sl,3);
 g.save();g.beginPath();const ox=(1-e)*W*.7;g.rect(PX+ox,PY,PW,PH);g.clip();g.translate(ox,0);const z=1+t*.012;g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2);{const im=b.img&&IMG['comic_'+b.img];if(im){drawCover(im,PX,PY,PW,PH);if(b.capI!==undefined){const i=b.capI;g.fillStyle='rgba(10,8,30,.55)';g.fillRect(325,80,285,140);g.fillStyle=OL;g.fillRect(330,110,270,46);g.fillStyle='#ffe066';g.fillRect(333,113,264,40);txt(CAPS[i].name,465,133,17,'#ffffff');cText(CAPS[i].bio,340,170,11,'#ffffff',250,16);txt('CAPTAIN '+(i+1)+' OF 4',465,90,9,'#ffffff');}}else b.draw(t);}
 g.globalAlpha=.08;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;g.restore();
 g.strokeStyle=OL;g.lineWidth=8;g.strokeRect(PX+ox,PY,PW,PH);g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(PX+ox+5,PY+5,PW-10,PH-10);
 if(b.cap&&t>.4)caption(b.cap,PX+14+ox,PY+14,Math.min(330,60+b.cap.length*6.2));
 {const cw=b.cap?Math.min(330,60+b.cap.length*6.2):0,ch=b.cap?capH(b.cap,cw):0,cr=[PX+14,PY+14,PX+14+cw+4,PY+14+ch+4],skip=[W-170,0,W,32],placed=[];
  const hit=(a,r)=>a[0]<r[2]+6&&a[2]>r[0]-6&&a[1]<r[3]+6&&a[3]>r[1]-6;
  for(const q of b.bub||[]){if(t<=q.at)continue;const h=bubH(q.s,q.w,q.shout),pad=q.shout?q.w*.06:0;let x=clamp(q.x,PX+10+pad,PX+PW-10-q.w-pad),y=clamp(q.y,PY+10,PY+PH-10-h);
   for(let k=0;k<12;k++){const r=[x-pad,y-pad,x+q.w+pad,y+h+pad];if(!(b.cap&&hit(r,cr))&&!hit(r,skip)&&!placed.some(o=>hit(r,o)))break;if(b.cap&&hit(r,cr)&&x<cr[2]+10&&k<6)x=Math.min(cr[2]+12+pad,PX+PW-10-q.w-pad);else y=Math.min(y+18,PY+PH-10-h);}
   placed.push([x-pad,y-pad,x+q.w+pad,y+h+pad]);bubble(q.s,x+ox,y,q.w,q.tx+ox,q.ty,q.shout);}}
 if(b.fx&&t>b.fx.at)sfxText(b.fx.s,b.fx.x+ox,b.fx.y,b.fx.sz,t-b.fx.at,b.fx.rot??-.15,b.fx.c1,b.fx.c2);
 for(let i=0;i<CB.length;i++)circ(W/2-CB.length*5+i*10,7,2.6,i===comicI?'#ffc53d':'#4a4a6a');
 panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');if(t>.4){g.globalAlpha=.55+.45*Math.sin(T*5);txt('TAP ▶',W-136,16,10,'#ffe066');g.globalAlpha=1;}
 const tp=tapped();if(tp&&tp.x>W-110&&tp.y<34){endComic();return;}
 const rd=CEND?1:.4,fresh=!tp||!CEND||!tp.st||tp.st>performance.now()-(t-rd)*1000;
 if(tp||pressedA||(AUTO&&t>b.d)){const pa=pressedA;pressedA=false;if(AUTO&&t>b.d){comicGo(comicI+1);if(comicI>=CB.length)endComic();return;}if(t<rd||(CEND&&pa&&!tp)||!fresh)return;comicGo(comicI+1);if(comicI>=CB.length)endComic();}}
function toggleMute(){const on=VOL.mus>0||VOL.sfx>0;if(on){VOL._m=VOL.mus;VOL._s=VOL.sfx;VOL.mus=0;VOL.sfx=0;}else{VOL.mus=VOL._m||1;VOL.sfx=VOL._s||1;}saveVol();}
function audioIcon(){const on=VOL.mus>0||VOL.sfx>0,x=W-30,y=22;circ(x,y,15,OL);circ(x,y,13,'#1c2a6a');g.fillStyle='#fff';g.beginPath();g.moveTo(x-8,y-3);g.lineTo(x-4,y-3);g.lineTo(x+1,y-8);g.lineTo(x+1,y+8);g.lineTo(x-4,y+3);g.lineTo(x-8,y+3);g.closePath();g.fill();
 g.strokeStyle=on?'#fff':'#ff4f7b';g.lineWidth=2;g.beginPath();if(on){g.arc(x+2,y,5,-.9,.9);g.stroke();g.beginPath();g.arc(x+2,y,9,-.9,.9);}else{g.moveTo(x+4,y-5);g.lineTo(x+11,y+5);g.moveTo(x+11,y-5);g.lineTo(x+4,y+5);}g.stroke();}
const VSTEP=[1,.5,0],vlab=v=>v>=1?'100%':v>0?'50%':'OFF';
function audioBtns(){panel(W-232,4,110,24,'#45d6ff');txt('MUSIC '+vlab(VOL.mus),W-177,16,9,'#ffffff');panel(W-116,4,104,24,'#45d6ff');txt('SFX '+vlab(VOL.sfx),W-64,16,9,'#ffffff');}
function audioTap(tp){if(tp.y>34)return false;const nx=v=>VSTEP[(VSTEP.indexOf(v)+1)%3]??1;if(tp.x>W-232&&tp.x<W-122){VOL.mus=nx(VOL.mus);saveVol();if(VOL.mus&&!music)startMusic('title');return true;}if(tp.x>W-116){VOL.sfx=nx(VOL.sfx);saveVol();sfx('pick');return true;}return false;}
// ---------- MISSIONS ----------
const MIS=[null,{name:'LAUNCH',sub:'Earth  ▶  The Moon',brief:['Captain, the Vorr have overrun our Moon outpost. Tranquility Base has gone dark.','Launch Pale Blue and punch through their fleet. Ace Kreel carries a Crystal Key. Take it back!']},
 {name:'MOON BASE',sub:'Retake Tranquility Outpost',brief:['You made it! The outpost is crawling with blob minions.','Big Blorp is guarding the Moon Crystal Key. I\'ll talk you through it. Send him packing and grab that Crystal Key!']},
 {name:'TRIP TO MARS',sub:'The Moon  ▶  Mars',brief:['Captain, Pale Blue is running low on fuel, and the Vorr have captured all three refueling stations on the way to Mars.','Free each station and fill the tanks. Warden Krool holds the third Crystal Key at the Mars Gate.']},
 {name:'MARS LANDING',sub:'Save the Colony',brief:['Captain, the Earth colony on Mars went silent. Their robots came to find water and grow gardens. Now the Vorr control them.','Don\'t wreck those robots: zap them to break the Vorr hold and set them free. Find the colony leader. Somewhere down there is the Mars Crystal Key.']}];
let misK=false;
function drawMissions(){starfield(T*8);txt('SELECT MISSION',W/2,30,20,'#ffc53d');
 for(let n=1;n<=4;n++){const x=[0,90,247,404,561][n],sel=mSel===n,lock=n>unlocked;panel(x-76,60,152,200,sel?'#45d6ff':'#3a4180');if(sel)dglow(x,160,80,'#45d6ff',.15);
  txt('MISSION '+n,x,84,16,lock?'#6a70a0':'#ffc53d');
  if(n===4){marsBall(x,180,40);captain(x+20,236,CAPS[cap],{sc:.8,t:T});}else if(n===3){moonBall(x-50,180,20);marsBall(x+40,150,34);ship(x-10,186+Math.sin(T*2)*6,T,.5);}else if(n===1){earth(x-44,170,30);moonBall(x+52,140,14);ship(x,174+Math.sin(T*2)*6,T,.5);}else{moonBall(x,175,40);g.fillStyle='rgba(185,246,255,.7)';g.beginPath();g.ellipse(x+14,140,9,6,0,Math.PI,TAU);g.fill();}
  txt('◆ GEMS '+gemN(n)+'/5',x,104,9,'#ff9af0');if(UPG(n))txt('★ '+UPNAME[n][0],x,118,8,'#ffe066');txt(MIS[n].name,x,226,14,lock?'#6a70a0':'#ffffff');txt(MIS[n].sub,x,246,9,'#c6cbef');
  if(lock){g.fillStyle='rgba(8,12,40,.6)';g.fillRect(x-72,64,144,192);txt('LOCKED',x,165,16,'#ff4f7b');}}
 txt(showTouch?'TAP A MISSION TO START':'◀ ▶ TO CHOOSE · ENTER TO START',W/2,290,10,'#c6cbef');txt('CAPTAIN '+CAPS[cap].name,W/2,316,11,'#45d6ff');
 if(K.ArrowLeft&&!misK&&mSel>1)mSel--,sfx('blip');if(K.ArrowRight&&!misK&&unlocked>mSel)mSel++,sfx('blip');misK=K.ArrowLeft||K.ArrowRight;
 audioBtns();panel(14,300,112,30,'#ff7a29');txt('▶ WATCH INTRO',70,315,9,'#ffffff');const tp=tapped();if(tp&&audioTap(tp))return;if(tp&&tp.x<130&&tp.y>295){comicFrom='missions';go('comic');return;}if(tp&&tp.y>60&&tp.y<260){const n=tp.x<168?1:tp.x<325?2:tp.x<482?3:4;if(n<=unlocked){if(mSel===n||showTouch)return startMission(n);mSel=n;}}
 if(((K.Enter||K.Space)&&stateT>.4)||(AUTO&&stateT>1))startMission(mSel);}
function drawCard(){const L=MIS[mission];starfield(T*14);if(mission===1)earth(520,250,90);else if(mission>=3)marsBall(520,250,80);else moonBall(520,250,90);
 const a=clamp(stateT*2,0,1);g.globalAlpha=a;txt('MISSION '+mission,W/2,70,34,'#ffc53d');txt(L.name,W/2,112,24,'#ffffff');txt(L.sub,W/2,140,11,'#45d6ff');g.globalAlpha=1;
 if(stateT<.8)return;const ln=L.brief[bLine],tt=stateT-.8;panel(28,234,94,114,'#ffc53d');dsp(portrait('hayes'),75,342,2.2);panel(132,250,486,90);txt('COMMANDER HAYES',145,264,12,'#ffc53d','left');
 {const TA=[0,'Run home, Earthlings. Every Crystal Key will be MINE.','Big Blorp will squash you flat, little captain!','Every fuel station is mine. Enjoy drifting!','Mars belongs to the Vorr now. Turn back!'][mission];if(TA&&IMG.comic_c07){g.save();g.beginPath();g.arc(586,62,34,0,TAU);g.clip();drawCover(IMG.comic_c07,540,20,92,84);g.restore();g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.arc(586,62,34,0,TAU);g.stroke();g.strokeStyle='#b04aff';g.lineWidth=2;g.stroke();bubble(TA,452,108,170,560,92,true);txt('KING MALAKAR',586,104,7,'#d0a0ff');}}
 const shown=ln.slice(0,Math.floor(tt*45));wrap(shown,375,292,450,12,'#ffffff',19);if((T*3|0)%2)txt('▶',600,326,12,'#45d6ff');
 const tp=tapped();if(tp||pressedA||(AUTO&&tt>1.4)){pressedA=false;if(shown.length<ln.length&&!AUTO)stateT=99;else if(++bLine>=L.brief.length)(mission===4?playComic(MARSLAND,()=>go('moon')):mission===3?playComic(MARSGO,()=>go('space')):go(mission===1?'launchcut':mission===3?'space':'landing'));else stateT=.8;}}
let launchFx=[];
function drawLaunchCut(){const t=stateT*(AUTO?3:1),ign=8,lift=Math.max(0,t-9.5),alt=lift*lift*55;
 if(!window._lc||stateT<.05){window._lc={n:-1,ig:0,lo:0,orb:0};MUS.intensity=0;}const L=window._lc;
 const cd=Math.ceil(ign-t);if(t>3&&t<ign&&cd!==L.n){L.n=cd;sfx(cd<=2?'beep2':'beep');MUS.intensity=cd<=2?3:cd<=4?2:1;}
 if(t>=ign&&!L.ig){L.ig=1;sfx('ignite');sfx('stinger');SHAKE=.6;}if(t>=9.5&&!L.lo){L.lo=1;sfx('bigboom');sfx('rumble');}if(t>=18&&!L.orb){L.orb=1;sfx('power');}
 const k=clamp(alt/1800,0,1),mix=(c1,c2)=>{const p=n=>parseInt(n,16);let o='#';for(let i=1;i<7;i+=2)o+=Math.round(p(c1.substr(i,2))*(1-k)+p(c2.substr(i,2))*k).toString(16).padStart(2,'0');return o;};
 g.fillStyle=lg(g,0,0,0,H,[mix('#3a7ad8','#020414'),mix('#9cd0ff','#0a1030'),mix('#ffd7a0','#1a2050')]);g.fillRect(0,0,W,H);if(k>.4){g.globalAlpha=(k-.4)/.6;starfield(0);g.globalAlpha=1;}
 if(t>15){const er=clamp((t-15)/4,0,1);earth(W/2,H+520-er*120,560);}
 for(let i=0;i<8;i++){const cy2=((i*97+alt*.9)%(H+300))-150,cx2=(i*173)%W;g.fillStyle='rgba(255,255,255,'+(.75*(1-k))+')';for(let j=0;j<4;j++){g.beginPath();g.ellipse(cx2+j*26,cy2+Math.sin(j)*6,30,13,0,0,TAU);g.fill();}}
 const gy=300+alt;if(gy<H+80){g.fillStyle=lg(g,0,gy-40,0,gy,['#5a7aa8','#7a9a6a']);g.fillRect(0,gy-40,W,40);g.fillStyle='#2a8acf';g.fillRect(0,gy-60,W,20);g.fillStyle=lg(g,0,gy,0,gy+70,['#8a8f9a','#4a4f5a']);g.fillRect(0,gy,W,70);
  const tx=W/2+56;g.strokeStyle=OL;g.lineWidth=4;g.strokeRect(tx,gy-170,30,170);g.strokeStyle='#d04020';g.lineWidth=2.5;g.strokeRect(tx,gy-170,30,170);for(let y=gy-170;y<gy;y+=20){g.beginPath();g.moveTo(tx,y);g.lineTo(tx+30,y+20);g.moveTo(tx+30,y);g.lineTo(tx,y+20);g.stroke();}
  const arm=clamp((t-4.5)/2,0,1);g.save();g.translate(tx,gy-110);g.rotate(-arm*1.2);g.fillStyle=OL;g.fillRect(-34,-4,34,8);g.fillStyle='#d04020';g.fillRect(-32,-2.5,30,5);g.restore();
  for(const lx of[80,W-80]){g.fillStyle='#3a3f50';g.fillRect(lx-3,gy-90,6,90);circ(lx,gy-94,6,'#fff8d0');dglow(lx,gy-94,26,'#fff8d0',.6);}g.fillStyle='#2a2f3a';g.fillRect(W/2-60,gy-10,120,10);}
 const shY=260-clamp(lift*45,0,80),rot=-Math.PI/2*(1-clamp((t-16)/3,0,1)),rumble=t>ign-.5&&t<14?rnd(-2,2):0;
 if(t>4&&t<ign&&Math.random()<.3)launchFx.push({x:W/2+rnd(-30,30),y:shY+40,vx:rnd(-40,40),vy:rnd(-10,10),l:1.5,r:rnd(6,10)});
 if(t>ign-.3&&Math.random()<.9)launchFx.push({x:W/2+rnd(-12,12)+(rot>-1?-50:0),y:shY+(rot>-1?0:50),vx:rnd(-90,90),vy:rnd(20,90),l:1.6,r:rnd(10,18)});
 for(const p of launchFx){p.x+=p.vx*DT;p.y+=(p.vy+(lift>0?Math.min(600,lift*160):0))*DT;p.r+=24*DT;p.l-=DT;circ(p.x,p.y,p.r,'rgba(230,230,240,'+Math.max(0,p.l*.45*(1-k))+')');}launchFx=launchFx.filter(p=>p.l>0);
 g.save();g.translate(W/2+rumble,shY);g.rotate(rot);if(t>ign)dglow(-60,0,40+Math.sin(T*40)*8,'#ffb040',.9);ship(0,0,T,1.3,t>ign?1.9:0);g.restore();
 if(t>ign&&t<ign+2.5)sfxText('IGNITION!',W/2,120,34,t-ign,-.12);else if(t>9.5&&t<12.5)sfxText('LIFTOFF!',W/2,100,36,t-9.5,-.1,'#ffe14d','#ff7a29');
 if(t<3)panel(110,290,420,50,'#45d6ff'),txt('HAYES: All systems go, Captain '+CAPS[cap].name.split(' ')[0]+'. Godspeed.',W/2,315,10,'#ffffff');
 if(t>=3&&t<ign){txt('T-MINUS',W/2,40,14,'#ffc53d');txt(String(cd),W/2,84,52,cd<=2?'#ff4f7b':'#ffffff');if(t>4.5&&t<6.5)txt('GANTRY ARM RETRACTING',W/2,124,10,'#45d6ff');}
 if(t>12.5&&t<15)txt('MAX Q · THROTTLE UP',W/2,60,13,'#ffc53d');
 
 if(t>19)sfxText('ORBIT ACHIEVED',W/2,90,24,t-19,-.06,'#bfe8ff','#3a7aff');
 txt('MISSION 1 · LAUNCH',W/2,14,10,'#45d6ff');panel(W-104,4,96,24,'#ff7a29');txt('SKIP ▶▶',W-56,16,10,'#ffffff');
 const tp=tapped();if(t>22.5||(tp&&tp.x>W-110&&tp.y<34)||(K.Enter&&stateT>.5)){pressedA=false;launchFx=[];go('space');}}
function drawMDone(){starfield(T*20);const r=40+stateT*14;moonBall(W/2+150,180,Math.min(r,120));ship(W/2-140+Math.sin(T)*8,200,T,1);
 txt('MISSION '+mDone+' COMPLETE!',W/2,56,26,'#ffc53d');txt('Kreel retreats! Pale Blue reaches the Moon...',W/2,90,11,'#ffffff');
 txt('SCORE '+score+'  ·  KILLS '+stats.kills,W/2,290,11,'#45d6ff');txt('MISSION '+(mDone+1)+' UNLOCKED',W/2,312,11,'#5fe36a');if((T*2|0)%2)txt('TAP TO CONTINUE',W/2,322,12,'#ffffff');
 if((stateT>1.2&&(tapped()||pressedA))||(AUTO&&stateT>2)){pressedA=false;startMission(mDone+1);}}
// ---------- LANDING ----------
function drawLanding(){const t=stateT,gy=280,sc=1.6,sx0=W/2-70;starfield(0);earth(540,60,26);
 g.drawImage(ridgeSpr(0).c,0,gy-70,W,190);const gs=groundSpr();g.drawImage(gs.c,0,gy,W,64);g.drawImage(gs.c,0,gy+56,W,64);
 dsp(craterSpr(80),90,gy+30);dsp(craterSpr(60),520,gy+40);
 const yF=gy-12*sc-28,k=clamp(t/4.5,0,1),e=1-Math.pow(1-k,3);let y=-60+e*(yF+60);const sx=sx0+(1-e)*160;
 if(t>4.5&&t<5.3)y+=Math.sin((t-4.5)*14)*5*(5.3-t);
 const legK=clamp((t-2.4)/1.2,0,1),rampK=clamp((t-5.6)/1.4,0,1);if(t>2.4&&!window._lg){window._lg=1;sfx('ramp');}if(t<2.4)window._lg=0;if(t>5.6&&!window._rp){window._rp=1;sfx('ramp');}if(t<5.6)window._rp=0;
 const alt=gy-(y+12*sc+28*legK);g.fillStyle=`rgba(0,0,0,${clamp(.45-alt/600,0,.45)})`;g.beginPath();g.ellipse(sx,gy+2,Math.max(30,80-alt*.1),7,0,0,TAU);g.fill();
 if(k<1){for(let i=0;i<6;i++)dglow(sx+rnd(-4,4),y+30+i*7,14-i,i<2?'#fff2a0':'#ff7a29',.8-i*.1);if(alt<90&&Math.random()<.6)addFx(sx+rnd(-60,60),gy,'dust',1.2);}
 if(t>=4.5&&!window._td){window._td=1;SHAKE=.35;sfx('boom');sfx('land');for(let i=0;i<16;i++)addFx(sx+rnd(-90,90),gy,'dust',rnd(1.4,2.4));}if(t<4.5)window._td=0;
 const r=landerShip(sx,y,legK,rampK,sc,k<1?1.6:0,gy);drawFx(0);
 if(r&&t>7.1){const u=clamp((t-7.2)/2.2,0,1),wk=clamp((t-9.4)/1.4,0,1);let cxp,cyp;if(u<1){cxp=r.hx+(r.ex-r.hx)*u;cyp=r.hy+(r.ey-r.hy)*u;}else{cxp=r.ex+wk*70;cyp=gy;}
  captain(cxp,cyp,CAPS[cap],{face:1,run:(u<1||wk<1)?T*7:0,t:T});if(u>=1&&wk<.1&&!window._st){window._st=1;addFx(cxp,gy,'dust',1);}}else window._st=0;
 txt('LANDING: THE MOON',W/2,24,16,'#ffc53d');
 const cap2=t<2.4?'':t<3.8?'LANDING LEGS DEPLOYED':t<5.5?(t>=4.5?'TOUCHDOWN!':''):t<7.2?'RAMP DOWN':t<9.6?CAPS[cap].name+' DISEMBARKING':'BOOTS ON THE REGOLITH';if(cap2)txt(cap2,W/2,50,12,'#45d6ff');
 
 txt('SKIP ▶▶',W-50,22,10,'#8189c7');
 if(t>11.2||(tapped()&&t>.4)||(pressedA&&t>.4)){pressedA=false;FX.length=0;go('moon');}}
// ---------- HUD ----------
function hud(hp,max){{const ly=34+max*6+8+18;circ(22,ly,9,OL);g.fillStyle=ballG(g,22,ly,7.5,7.5,'#ff4f7b');g.beginPath();g.arc(22,ly,7.5,0,TAU);g.fill();txt('x'+LIVES,34,ly+.5,10,'#ffffff','left');txt('LIVES',22,ly+15,6,'#ffc6d6');}const x=12,y=34,seg=6,h=max*seg+8;g.fillStyle=OL;g.beginPath();g.roundRect(x-3,y-3,24,h+6,8);g.fill();g.fillStyle=lg(g,x,0,x+18,0,['#2a3a8a','#141c4a']);g.beginPath();g.roundRect(x,y,18,h,6);g.fill();
 for(let i=0;i<max;i++){const on=max-1-i<hp;g.fillStyle=on?lg(g,0,y+4+i*seg,0,y+8+i*seg,['#d8fbff','#45d6ff','#1a8ab8']):'#24305e';g.beginPath();g.roundRect(x+3.5,y+4+i*seg,11,4,2);g.fill();}
 dglow(x+9,y+h-hp*3,18,'#45d6ff',.22);
 g.fillStyle=OL;g.beginPath();g.roundRect(x-5,y+h+1,28,28,7);g.fill();dsp(portrait(cap),x+9,y+h+27,.6);
 txt(CAPS[cap].name,40,16,10,'#ffc53d','left');txt('SCORE '+score,W-12,46,10,'#ffffff','right');}
function controls(space){if(!showTouch)return;const b=btns();if(!space&&S==='moon'&&Q.has('zones')){const C={left:'rgba(255,80,80,.28)',right:'rgba(80,255,80,.28)',up:'rgba(80,160,255,.35)',jump:'rgba(255,220,0,.28)',shoot:'rgba(255,0,255,.28)'};for(let y=0;y<H;y+=6)for(let x=0;x<W;x+=6){const z=moonZone({x,y});if(z){g.fillStyle=C[z];g.fillRect(x,y,6,6);}}}
 const draw=(o,label,on)=>{g.globalAlpha=.62;circ(o.x,o.y,o.r+2,OL);g.fillStyle=lg(g,0,o.y-o.r,0,o.y+o.r,on?['#7fe8ff','#2a8ab8']:['#3a4a9a','#141c4a']);g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill();
  g.fillStyle='rgba(255,255,255,.18)';g.beginPath();g.ellipse(o.x,o.y-o.r*.45,o.r*.7,o.r*.35,0,0,TAU);g.fill();g.globalAlpha=.92;txt(label,o.x,o.y,o.r*.45,'#ffffff');g.globalAlpha=1;};
 if(space){draw(b.sl,'◀',held('sl'));draw(b.sr,'▶',held('sr'));draw(b.su,'▲',held('su'));draw(b.sd,'▼',held('sd'));draw(b.shoot,'FIRE',held('shoot'));return;}
 draw(b.left,'◀',held('left'));draw(b.right,'▶',held('right'));draw(b.jump,'JUMP',held('jump'));draw(b.shoot,'FIRE',held('shoot'));}
// ---------- VICTORY ----------
function drawVictory(){const V4=mission===4;starfield(T*10);if(V4)marsBall(590,120,42);else earth(590,120,42);txt(V4?'MISSION 4 COMPLETE!':'MISSION 2 COMPLETE!',W/2,56,26,'#ffc53d');txt(V4?'The Dust Whale is beaten. The colony gardens bloom again.':'Big Blorp is defeated. The Moon outpost is safe.',W/2,90,11,'#ffffff');
 dsp(portrait(cap),170,250,2.4);captain(W/2+60,268,CAPS[cap],{sc:1.55,t:T,shoot:(T*2|0)%2});
 for(let i=0;i<12;i++){const a=T*1.5+i*.52;txt('★',W/2+Math.cos(a)*230,170+Math.sin(a*1.3)*70,9,i%2?'#ffc53d':'#45d6ff');}
 txt('SCORE '+score+'  ·  MINIONS BOPPED '+stats.kills+'  ·  ◆ GEMS '+(V4?'M3 '+gemN(3)+'/5  M4 '+gemN(4):'M1 '+gemN(1)+'/5  M2 '+gemN(2))+'/5',W/2,288,11,'#45d6ff');
 txt(V4?'MISSION 4 · MARS COLONY SAVED  ·  A DISTRESS SIGNAL AWAITS... (COMING SOON)':'MISSION 2 · MOON BASE CLEAR  ·  MISSION 3 UNLOCKED: TRIP TO MARS',W/2,310,10,'#c6cbef');if((T*2|0)%2)txt('TAP TO CONTINUE',W/2,322,12,'#ffffff');
 if(stateT>1.5&&(tapped()||pressedA)){pressedA=false;score=0;stats.kills=0;secretFound=false;go('missions');}}

// ---------- autopilot (testing only, ?auto) ----------
function autoSpace(){const s=sp;VK.F=1;const pod=s.boss&&!s.boss.dead&&s.boss.pods&&s.boss.pods.find(p=>p.hp>0),tgt=pod?pod:s.boss&&!s.boss.dead?s.boss:s.foes.filter(f=>f.age>=f.del&&f.x<SW&&f.x>s.x).sort((a,b)=>a.x-b.x)[0]||s.rocks[0];VK.U=tgt&&tgt.y<s.y-8;VK.D=tgt&&tgt.y>s.y+8;VK.R=s.x<200;VK.L=0;}
function autoMoon(){const m=M;VK.F=1;VK.R=1;VK.L=0;if(m.boss&&m.boss.whale&&m.lock&&!m.boss.dead){const d=m.boss.x-m.px;VK.R=d>170?1:0;VK.L=d<-170?1:0;if(!VK.R&&!VK.L)m.face=d>0?1:-1;}if(m.boss&&m.boss.pl&&!m.boss.dead){const d=m.boss.pl.x-m.px;VK.R=d>30?1:0;VK.L=d<-30?1:0;if(Math.abs(d)<=30){m.face=d>0?1:-1;}}if(m.px>m.best+5){m.best=m.px;m.stuck=0;}else m.stuck+=DT;if(m.stuck>3&&!m.lock){const c=m.cps.find(c=>c.x>m.px+20);m.px=c?c.x:m.arena-60;m.py=GROUND;m.vy=0;m.mv=null;m.stuck=0;m.best=m.px;}if(m.on&&m.gaps.some(q=>q[0]-m.px<50&&q[0]-m.px>0))pressedA=true,VK.J=1;if(m.lock){const b=m.boss;let side=m.px<b.x?-1:1;let tx=b.x+side*100;if(tx<m.arena+20||tx>m.arena+W-20)tx=b.x-side*100;VK.R=m.px<tx-15;VK.L=m.px>tx+15;}
 if(m.on&&(Math.random()<.02||Math.abs(m.vx)<20||m.walls.some(w=>w[0]-m.px<40&&w[0]-m.px>0)))pressedA=true,VK.J=1;if(m.vy>0)VK.J=0;}
// ---------- loop: capped 60fps, nothing drawn while hidden ----------
let last=performance.now(),acc=0;const STEP=1/60;
function frame(now){requestAnimationFrame(frame);if(document.hidden){last=now;return;}
 let dt=(now-last)/1000;if(dt<STEP*.9)return;// cap (120Hz screens)
 last=now;dt=Math.min(dt,.05);T+=dt;stateT+=dt;stats.time+=dt;
 DT=dt;SHAKE=Math.max(0,SHAKE-dt);const shx=SHAKE>0?rnd(-4,4)*SHAKE/.3:0,shy=SHAKE>0?rnd(-3,3)*SHAKE/.3:0;
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.setTransform(cv.width/W,0,0,cv.height/H,shx*cv.width/W,shy*cv.height/H);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 try{if(S==='title')drawTitle();else if(S==='intro')drawIntro();else if(S==='select')drawSelect();
  else if(S==='space'){if(PAUSEREQ){PAUSEREQ=0;if(inLevel()&&!PAUSEM)openPause();}if(!GOVER&&!PAUSEBG&&!CRY&&!PAUSEM&&!SHM)updSpace(dt);drawSpace();if(SHM)shardCut();else if(CRY)crystalCut();else if(PAUSEM)pauseMenu();else drawPauseBtn();}else if(S==='landing')drawLanding();else if(S==='moon'){if(PAUSEREQ){PAUSEREQ=0;if(inLevel()&&!PAUSEM)openPause();}if(!GOVER&&!PAUSEBG&&!CRY&&!PAUSEM&&!SHM)updMoon(dt);drawMoon();if(SHM)shardCut();else if(CRY)crystalCut();else if(PAUSEM)pauseMenu();else drawPauseBtn();}else if(S==='victory')drawVictory();else if(S==='missions')drawMissions();else if(S==='card')drawCard();else if(S==='launchcut')drawLaunchCut();else if(S==='mdone')drawMDone();else if(S==='comic')drawComic();}
 catch(e){console.error(e);}
 if(Q.has('debug')){const l='AC:'+(AC?AC.state:'none')+' sr:'+(AC?AC.sampleRate:0)+' master:'+(master?master.gain.value.toFixed(2):'-')+' mus:'+(musG?musG.gain.value.toFixed(2):'-')+' sfx:'+(sfxG?sfxG.gain.value.toFixed(2):'-')+' VOL:'+VOL.mus+'/'+VOL.sfx+' music:'+(music?curTheme:'off')+' want:'+(wantTheme?wantTheme.join(''):'-')+' BGP:'+BGP+' hid:'+document.hidden+' sess:'+(navigator.audioSession?navigator.audioSession.type:'n/a')+' silEl:'+(SIL?(SIL.paused?'paused':'playing'):'none')+' ev:'+__aud.ev+'#'+__aud.n+' reb:'+__aud.reb;g.fillStyle='rgba(0,0,0,.75)';g.fillRect(60,46,W-120,16);txt(l,W/2,54,6.5,'#7dff8a');}
 try{if(PAUSEBG&&!(S==='space'||S==='moon'))PAUSEBG=false;if(PAUSEBG){g.fillStyle='rgba(8,4,24,.7)';g.fillRect(0,0,W,H);txt('PAUSED',W/2,150,30,'#ffc53d');if((T*2|0)%2)txt('TAP TO RESUME',W/2,192,12,'#ffffff');const tp=tapped();if(tp||K.Enter){PAUSEBG=false;unlock();}}else if(GOVER&&(S==='space'||S==='moon'))drawGameOver();if(SAVET>0&&!(S==='space'&&sp&&sp.cut)&&S!=='comic'){SAVET-=dt;g.globalAlpha=Math.min(1,SAVET*2);panel(8,128,100,22,'#5fe36a');txt('GAME SAVED',58,139,9,'#5fe36a');g.globalAlpha=1;}}catch(e){console.error(e);}
 if(S!=='moon')pressedA=false;pressedAny=false;}
window.GR={shard:l=>shardMoment(l,()=>{}),openPause:()=>openPause(),comicJump:i=>{comicI=i;comicT=0;},get SHM(){return SHM},get SHARDS(){return SHARDS},startMission:n=>startMission(n),play:a=>playComic(a==='MOONWIN'?MOONWIN:INTER1,()=>go('victory')),mz:moonZone,get pm(){return !!PAUSEM},get GEMS(){return GEMS},get CRY(){return CRY},state:S,go,get M(){return M},get sp(){return sp},setCap:i=>cap=i,get comicI(){return comicI},VK,unlocked,get t(){return stateT},flashSaved:()=>{SAVET=1.8;},setGO:()=>{GOVER=()=>{};GOT=1;}};
comicArt();go('title');requestAnimationFrame(frame);
})();
