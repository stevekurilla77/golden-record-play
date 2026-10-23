// Pale Blue: Crystal Defenders (repo: golden-record). (c) 2026 Backline Vintage. PRIVATE. Original art drawn in code.
(()=>{
'use strict';
const W=640,H=360,cv=document.getElementById('c');let g=cv.getContext('2d');
const Q=new URLSearchParams(location.search),AUTO=Q.has('auto');
let scale=1,isPad=false;
let _vk='';function vpDims(){const vv=window.visualViewport,de=document.documentElement;let w=vv&&vv.width>0?vv.width:(de.clientWidth||innerWidth),h=vv&&vv.height>0?vv.height:(de.clientHeight||innerHeight);
 if(innerWidth>0)w=Math.min(w,innerWidth);if(innerHeight>0)h=Math.min(h,innerHeight);return{w:Math.max(1,w),h:Math.max(1,h),x:vv?vv.offsetLeft||0:0,y:vv?vv.offsetTop||0:0};}
function resize(){const d=vpDims(),w=d.w,h=d.h,key=[w,h,d.x,d.y,devicePixelRatio].join(',');if(key===_vk)return;_vk=key;scale=Math.min(w/W,h/H);const dpr=Math.min(devicePixelRatio||1,2);
 cv.width=Math.round(W*scale*dpr);cv.height=Math.round(H*scale*dpr);cv.style.position='fixed';cv.style.width=W*scale+'px';cv.style.height=H*scale+'px';
 cv.style.left=(d.x+(w-W*scale)/2)+'px';cv.style.top=(d.y+(h-H*scale)/2)+'px';isPad=Math.min(w,h)>=700;if(typeof g!=='undefined'&&g&&g.setTransform)g.setTransform(1,0,0,1,0,0);}
const _rs=()=>{_vk='';resize();setTimeout(()=>{_vk='';resize();},120);setTimeout(()=>{_vk='';resize();},500);};
addEventListener('resize',_rs);addEventListener('orientationchange',_rs);addEventListener('pageshow',_rs);addEventListener('load',_rs);
if(window.visualViewport){visualViewport.addEventListener('resize',_rs);visualViewport.addEventListener('scroll',_rs);}
document.addEventListener('DOMContentLoaded',_rs);setInterval(resize,400);resize();
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
 if(real&&AC&&(NEEDREB||(AC.state!=='running'&&AUDTRY>=1))){NEEDREB=false;AUDTRY=0;__aud.reb++;lastSfx={};const old=AC;AC=null;master=musG=sfxG=NOISE=null;if(music){clearInterval(music);music=null;}curTheme=null;try{old.close&&old.close();}catch(x){}}
 if(real||!AC)unlock();if(real&&AC&&AC.state!=='running')AUDTRY++;else if(AC&&AC.state==='running')AUDTRY=0;}
['touchend','pointerup','click','keydown','touchstart','pointerdown'].forEach(ev=>addEventListener(ev,gestureAudio,{capture:true,passive:true}));
function tone(f,t0,d,type='square',v=.12,f2,dest){if(!AC)return;const o=AC.createOscillator(),a=AC.createGain();o.type=type;o.frequency.setValueAtTime(f,t0);
 if(f2)o.frequency.exponentialRampToValueAtTime(f2,t0+d);a.gain.setValueAtTime(.0001,t0);a.gain.linearRampToValueAtTime(v,t0+.008);a.gain.exponentialRampToValueAtTime(.0005,t0+d);o.connect(a);a.connect(dest||sfxG);o.start(t0);o.stop(t0+d+.03);}
function noise(t0,d,v,fType='lowpass',f=1200,f2,dest){if(!AC)return;const s=AC.createBufferSource(),fl=AC.createBiquadFilter(),a=AC.createGain();s.buffer=NOISE;fl.type=fType;fl.frequency.setValueAtTime(f,t0);if(f2)fl.frequency.exponentialRampToValueAtTime(f2,t0+d);
 a.gain.setValueAtTime(v,t0);a.gain.exponentialRampToValueAtTime(.0005,t0+d);s.connect(fl);fl.connect(a);a.connect(dest||sfxG);s.start(t0,Math.random()*.5);s.stop(t0+d+.02);}
const mf=n=>440*Math.pow(2,(n-69)/12);
let lastSfx={};
function sfx(n){if(n==='boom'||n==='bigboom')SHAKE=Math.max(SHAKE,n==='bigboom'?.5:.3);if(n==='hurt')SHAKE=Math.max(SHAKE,.18);if(!AC||!VOL.sfx)return;const t=AC.currentTime;
 {const lt=lastSfx[n];if(lt!==undefined&&t>=lt&&t-lt<.035)return;}lastSfx[n]=t;// (a recreated AudioContext restarts its clock at 0, so never compare against an older context's time)// throttle for performance
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
 space3:{style:'hero',bpm:134,root:52,sc:'lyd',prog:[0,1,5,4],mod:[0,0,3,3],lw:'square',bw:'sawtooth',arp:1,lead:[4,_,_,_,6,_,7,_,_,_,11,_,_,_,9,_,7,_,_,_,6,_,4,_,2,_,_,_,4,_,_,_]},
 space6:{style:'hero',bpm:156,root:49,sc:'dor',prog:[0,3,6,4],mod:[0,3,0,5],lw:'triangle',bw:'sawtooth',four:1,arp:1,lead:[0,_,2,_,3,_,_,_,4,_,3,_,2,_,0,_,6,_,_,_,4,_,_,_,3,_,4,_,7,_,_,_]},
 boss3:{style:'hero',boss:1,bpm:172,root:50,sc:'phr',prog:[0,1,0,5],mod:[0,1,3,1],lw:'square',bw:'sawtooth',lead:[0,_,1,_,0,_,4,_,3,_,1,_,0,_,_,_,7,_,8,_,7,_,4,_,3,_,1,_,0,_,_,_]},
 boss6:{style:'hero',boss:1,bpm:150,root:41,sc:'min',prog:[0,5,3,6],mod:[0,2,0,5],lw:'triangle',four:1,arp:1,lead:[7,_,_,6,7,_,9,_,_,_,7,_,6,_,4,_,3,_,_,4,6,_,_,_,4,_,3,_,2,_,_,_]},
 marsboss:{style:'spook',boss:1,bpm:146,root:46,sc:'min',prog:[0,5,6,5],drone:0,tex:'wind',lw:'square',lead:[0,_,3,_,4,_,3,_,7,_,_,_,6,_,4,_,0,_,3,_,4,_,6,_,7,_,8,_,7,_,_,_]},
 volkboss:{style:'hero',boss:1,bpm:164,root:40,sc:'phr',prog:[0,1,6,1],mod:[0,0,1,3],bw:'sawtooth',four:1,lead:[0,0,_,1,_,0,_,_,7,_,6,_,4,_,1,_,0,0,_,1,_,3,_,_,4,_,6,_,7,_,_,_]},
 vesta:{style:'spook',bpm:118,root:48,sc:'lyd',prog:[0,1,4,5],drone:4,tex:'storm',lw:'triangle',arp:1,lead:[4,_,_,_,_,_,6,_,_,_,7,_,_,_,_,_,11,_,_,_,9,_,_,_,7,_,_,_,6,_,_,_]},
 vestaboss:{style:'hero',boss:1,bpm:154,root:43,sc:'dor',prog:[0,6,3,4],mod:[0,2,5,2],lw:'square',bw:'sawtooth',arp:1,lead:[0,_,4,_,7,_,_,9,_,7,_,4,3,_,_,_,0,_,4,_,7,_,10,_,_,9,_,7,4,_,_,_]},
 jupiter:{style:'hero',bpm:128,root:50,sc:'lyd',prog:[0,4,5,3],mod:[0,2,4,2],lw:'triangle',bw:'square',arp:1,lead:[4,_,7,_,9,_,7,4,_,2,_,4,7,_,_,_,9,_,11,_,9,7,_,4,_,7,_,9,4,_,_,_]},
 stormboss:{style:'hero',boss:1,bpm:160,root:42,sc:'min',prog:[0,5,3,6],mod:[0,3,1,4],lw:'square',bw:'sawtooth',four:1,arp:1,lead:[0,_,0,3,_,5,_,7,_,6,5,_,3,_,_,_,0,_,0,3,_,5,_,10,_,8,7,_,5,_,_,_]},
 junk:{style:'hero',bpm:138,root:45,sc:'dor',prog:[0,3,6,4],mod:[0,2,0,5],lw:'triangle',bw:'square',arp:1,lead:[0,_,2,4,_,2,0,_,7,_,6,4,_,2,_,_,0,_,2,4,_,7,9,_,7,_,4,_,2,_,_,_]},
 jysat:{style:'hero',boss:1,bpm:156,root:47,sc:'min',prog:[0,6,5,4],mod:[0,1,3,1],lw:'square',arp:1,lead:[0,_,7,_,0,_,6,_,0,_,5,_,3,_,_,_,0,_,7,_,8,_,7,_,5,_,3,_,2,_,_,_]},
 jyrocket:{style:'hero',boss:1,bpm:176,root:42,sc:'phr',prog:[0,1,0,6],mod:[0,0,3,1],bw:'sawtooth',four:1,lead:[0,0,_,3,_,0,_,1,_,0,_,_,7,_,6,_,0,0,_,3,_,4,_,3,_,1,_,0,_,_,_,_]},
 jyclaw:{style:'hero',boss:1,bpm:150,root:38,sc:'min',prog:[0,5,3,4],mod:[0,2,5,2],lw:'sawtooth',bw:'square',four:1,arp:1,lead:[0,_,_,3,_,_,7,_,6,_,_,4,_,3,_,_,0,_,_,3,_,_,10,_,9,_,7,_,6,_,_,_]},
 asteroid:{style:'spook',bpm:132,root:43,sc:'min',prog:[0,6,5,6],drone:0,tex:'ghost',lead:[0,_,_,_,3,_,_,_,_,_,7,_,_,_,6,_,_,_,_,_,3,_,_,_,_,_,_,_,_,_,_,_]}};
const MUS={intensity:0};
function brass(f,t,d,v,D){tone(f,t,d,'sawtooth',v,null,D);tone(f*1.006,t,d,'sawtooth',v*.8,null,D);tone(f/2,t,d,'triangle',v*1.4,null,D);}
function startMusic(kind,v=0){if(kind==='game')kind=S==='moon'?(mission===9?'jupiter':mission===4?'mars':'moon'):'space';if(kind==='boss'&&S==='moon'&&mission===9){kind='stormboss';}else if(kind==='boss'&&S==='moon'&&mission!==4)kind='moonboss';
 if(kind==='boss'&&S==='moon'&&mission===4)kind='marsboss';if(kind==='space'&&(mission===3||mission===6))kind='space'+mission;if(kind==='boss'&&S==='space'&&(mission===3||mission===6))kind='boss'+mission;
 if(kind==='boss'&&S==='cart')kind=mission===7?'vestaboss':'volkboss';if(kind==='asteroid'&&mission===7)kind='vesta';if(mission===8&&S==='space'){if(kind==='space')kind='junk';if(kind==='boss')kind=['jysat','jyrocket','jyclaw'][Math.min(2,v)];}wantTheme=[kind,v];if(!AC)return;if(music&&curTheme===kind+v)return;stopMusic();curTheme=kind+v;wantTheme=[kind,v];
 const th=THEMES[kind]||THEMES.space,sc=SC[th.sc],base=th.root+(th.style==='hero'&&!th.cine?[0,2,5,3][v%4]:0),spd=60/(th.bpm+(th.style==='hero'?v*4:0))/4;let step=0,next=AC.currentTime+.06;
 const deg=d=>sc[((d%7)+7)%7]+12*Math.floor(d/7),lead=v&&th.alt?th.alt[(v-1)%th.alt.length]:th.lead;
 music=setInterval(()=>{if(!AC||AC.state!=='running')return;while(next<AC.currentTime+.25){const D=musG,lvl=th.cine?Math.max(1,MUS.intensity):3,t=next;
  const bar=Math.floor(step/16),s16=step%16,sec=Math.floor(bar/8),c=th.prog[bar%th.prog.length],root=base+(th.mod?th.mod[sec%th.mod.length]:0),L=lead[step%lead.length],b8=bar%8;
  if(th.style==='hero'){
   // pad + big chord stabs
   if(s16===0)[0,2,4].forEach(k=>tone(mf(root+12+deg(c+k)),t,spd*16,'triangle',.03,null,D));
   if(lvl>=2&&(s16===0||s16===6||(th.boss&&s16===10)||(b8===7&&s16===12)))[0,2,4,7].forEach(k=>tone(mf(root+12+deg(c+k)),t,spd*1.6,'sawtooth',.022,null,D));
   // punchy bass ostinato on 8ths
   if(lvl>=1&&s16%2===0){const o=[0,0,12,0,7,0,12,10][(s16>>1)];tone(mf(root-12+deg(c)+o),t,spd*1.5,th.bw||'square',th.bw?.035:.05,null,D);tone(mf(root-24+deg(c)),t,spd*1.6,'triangle',.12,null,D);}
   // heroic brass lead (only on its notes; cine scenes bring it in as intensity rises)
   if(L!==null&&lvl>=2&&!(th.fan&&bar%4===3)){if(th.lw){tone(mf(root+24+deg(L)),t,spd*2.2,th.lw,th.lw==='triangle'?.06:.024,null,D);tone(mf(root+12+deg(L)),t,spd*2.2,'sawtooth',.012,null,D);}else brass(mf(root+24+deg(L)),t,spd*2.4,.022,D);}
   if(th.arp&&lvl>=2)tone(mf(root+24+deg(c+[0,2,4,2,7,4][step%6])),t,spd*.7,th.style==='hero'?'square':'triangle',.012,null,D);
   if(v>=2&&step%2===1&&lvl>=3)tone(mf(root+36+deg(c+[0,2,4,7][(step>>1)%4])),t,spd*.9,'square',.01,null,D);
   // drums: kick/snare backbeat, 16th hats, tom fill on bar 4, snare roll build-up before each key change
   const k=th.four?s16%4===0:s16===0||s16===8||(th.boss&&(s16===3||s16===11))||(s16===10&&bar%2);if(k)tone(110,t,.16,'sine',lvl>=1?.3:.2,38,D);
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
   if(L!==null)for(let e=0;e<3;e++)tone(mf(root+24+deg(L)),t+e*spd*3,spd*2.5,th.lw||'sine',(th.lw==='square'?.02:.045)/(1+e*1.6),null,D);
   if(th.arp&&s16%2===1)tone(mf(root+12+deg(c+[0,2,4,6][(step>>1)%4])),t,spd*1.2,'triangle',.018,null,D);
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
function clearInput(){try{touches.clear();for(const k in K)delete K[k];pressedA=pressedAny=false;tapQueued=null;mouse=null;PAUSEREQ=0;}catch(e){}}
function audioSuspend(){try{SIL&&SIL.pause();}catch(e){}clearInput();if((S==='space'||S==='moon'||S==='cart')&&!GOVER){if(!PAUSEM)openPause();}BGP=true;if(music){clearInterval(music);music=null;curTheme=null;}if(AC&&AC.state==='running')AC.suspend().catch(()=>{});}
function rebuildAudio(){lastSfx={};const old=AC;AC=null;master=musG=sfxG=NOISE=null;music=null;curTheme=null;try{old&&old.close&&old.close();}catch(e){}unlock();}
function audioResume(){BGP=false;clearInput();try{last=performance.now();if(PAUSEM)PAUSEM.at=performance.now();}catch(e){}if(!AC)return;const after=()=>{if(wantTheme&&!music){curTheme=null;startMusic(...wantTheme);}};if(AC.state==='running'){after();return;}
 let done=false;const fail=()=>{if(done)return;done=true;if(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())rebuildAudio();else NEEDREB=true;};
 try{AC.resume().then(()=>{setTimeout(()=>{if(done)return;if(AC&&AC.state==='running'){done=true;after();}else fail();},250);}).catch(fail);}catch(e){fail();}setTimeout(()=>{if(!done&&AC&&AC.state!=='running')fail();},1500);}
document.addEventListener('visibilitychange',()=>{document.hidden?audioSuspend():audioResume();});
addEventListener('pagehide',audioSuspend);addEventListener('pageshow',()=>{if(!document.hidden)audioResume();});addEventListener('focus',()=>{if(!document.hidden)audioResume();});addEventListener('blur',()=>clearInput());
try{const CA=window.Capacitor&&window.Capacitor.Plugins&&window.Capacitor.Plugins.App;if(CA&&CA.addListener){CA.addListener('pause',audioSuspend);CA.addListener('resume',audioResume);CA.addListener('appStateChange',st=>{st&&st.isActive?audioResume():audioSuspend();});}}catch(e){}
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
function inLevel(){return (S==='space'&&sp&&!sp.cut)||(S==='moon'&&M&&!M.cut)||(S==='cart'&&CT&&!CT.puz);}
function onPauseBtn(p){return inLevel()&&!GOVER&&!PAUSEM&&!CRY&&Math.hypot(p.x-PB.x,p.y-PB.y)<PB.r+8;}
function drawPauseBtn(){if(!inLevel()||PAUSEM||GOVER)return;circ(PB.x,PB.y,PB.r+1.5,OL);circ(PB.x,PB.y,PB.r,'rgba(28,42,106,.9)');g.fillStyle='#fff';g.fillRect(PB.x-5,PB.y-6,3.5,12);g.fillRect(PB.x+1.5,PB.y-6,3.5,12);}
function openPause(){PAUSEM={t:0,how:0,conf:0,at:performance.now()};if(musG&&AC)musG.gain.setTargetAtTime(VOL.mus*.55*.25,AC.currentTime,.05);sfx('blip');}
function closePause(){PAUSEM=null;saveVol();}
function pauseMenu(){const P=PAUSEM;P.t+=DT;g.fillStyle='rgba(6,4,20,.8)';g.fillRect(0,0,W,H);const bx=W/2-130,bw=260;
 panel(bx-10,40,bw+20,P.conf||P.how?282:300,'#45d6ff');sfxText('PAUSED',W/2,62,24,P.t,-.04);
 const rows=P.how?[]:P.conf===2?[['LEAVE THIS LEVEL?',0],['YES, TO MISSIONS','exit'],['NO, KEEP PLAYING','no']]:P.conf?[['QUIT TO TITLE?',0],['YES, QUIT','yes'],['NO, KEEP PLAYING','no']]:[['RESUME ▶','res'],['MUSIC '+vlab(VOL.mus),'mus'],['SOUND FX '+vlab(VOL.sfx),'sfx'],[(VOL.mus||VOL.sfx)?'MUTE ALL':'UNMUTE','mute'],['HOW TO PLAY','how'],['EXIT TO MISSIONS','tomis'],['QUIT TO TITLE','quit']];
 rows.forEach((r,i)=>{const y=96+i*36;if(r[1]){panel(bx,y-14,bw,28,r[1]==='res'||r[1]==='no'?'#5fe36a':r[1]==='quit'||r[1]==='yes'?'#ff4f7b':r[1]==='tomis'||r[1]==='exit'?'#ff7a29':'#3a4180');}txt(r[0],W/2,y,11,'#ffffff');});
 if(P.how){const L=S==='space'?['Left side of the screen steers Pale Blue.','FIRE: hold the lower right to blast.','Tokens: S shield, F force field, R rapid, W spread.','Beat the last boss to win its Crystal Key.']:['Left side walks. Up arrow climbs.','JUMP: lower right. Hold for a higher jump.','FIRE: next to JUMP. Blast the blobs.','Bosses guard Crystal Keys. 5 gems = 1-up!'];
  L.forEach((l,i)=>txt(l,W/2,104+i*30,9.5,'#ffffff'));panel(bx,252,bw,28,'#5fe36a');txt('BACK',W/2,266,11,'#ffffff');}
 {const tx=546;panel(tx-44,40,88,282,'#b04aff');txt('HEART',tx,54,9,'#e8d0ff');txt('CRYSTAL LOCK',tx,67,7.5,'#e8d0ff');const nk=Object.keys(SHARDS).length;dglow(tx,92,16+nk*4,'#bff8ff',.3+nk*.1);crystal(tx,94,.32,1);
 for(let i=1;i<=6;i++){const y=124+(i-1)*30,on=!!SHARDS[i];keyhole(tx-16,y,10,SHCOL[i],on);if(on)heartShard(tx+14,y,.33,SHCOL[i],.4);else txt(i<=4?'M'+i:'??',tx+16,y,8,'#6a6a9a');}txt(nk+' KEYS IN',tx,306,8,'#ffffff');}
 const tp=tapped();if(K.Escape&&!P.esc){P.esc=1;}if(!K.Escape&&P.esc===1){P.esc=0;closePause();return;}
 if(!tp||P.t<.25||(tp.st&&tp.st<P.at))return;sfx('blip');
 if(P.how){if(tp.y>238&&tp.y<294)P.how=0;return;}
 const i=Math.round((tp.y-96)/36);if(tp.x<bx||tp.x>bx+bw||i<0||i>=rows.length||Math.abs(tp.y-(96+i*36))>15)return;const k=rows[i][1];
 const nx=v=>VSTEP[(VSTEP.indexOf(v)+1)%VSTEP.length]??1;
 if(k==='res'||k==='no'){if(k==='no')P.conf=0;else{closePause();clearInput();PAUSEBG=false;BGP=false;try{if(!AC||AC.state!=='running'){NEEDREB=NEEDREB||(AC&&AC.state==='closed');unlock();audioResume();}}catch(e){}}}else if(k==='mus'){VOL.mus=nx(VOL.mus);saveVol();if(musG&&AC)musG.gain.value=VOL.mus*.55*.25;}else if(k==='sfx'){VOL.sfx=nx(VOL.sfx);saveVol();sfx('shot');}
 else if(k==='mute'){toggleMute();if(musG&&AC)musG.gain.value=VOL.mus*.55*.25;}else if(k==='how')P.how=1;else if(k==='quit')P.conf=1;else if(k==='tomis')P.conf=2;else if(k==='exit'){PAUSEM=null;saveVol();stopMusic();CT=null;CRY=null;SHM=null;LIVES=Math.max(LIVES,3);mSel=Math.max(1,mission||1);go('missions');}else if(k==='yes'){PAUSEM=null;saveVol();stopMusic();go('title');}}
function moonZone(p){if(S==='cart')return cartZone(p);if(S==='space')return spaceZone(p);if(S!=='moon')return null;const b=btns();if(p.y<H*.3)return null;
 if(p.x<W*.42){if(Math.hypot(p.x-b.up.x,p.y-b.up.y)<b.up.r*1.6)return 'up';if(p.y<H*.42)return null;return p.x<(b.left.x+b.right.x)/2?'left':'right';}
 if(p.x>W*.55){const dS=Math.hypot(p.x-b.shoot.x,p.y-b.shoot.y),dJ=Math.hypot(p.x-b.jump.x,p.y-b.jump.y);if(Math.abs(dS-dJ)<b.jump.r*.35)return null;/* dead gap between FIRE and JUMP */return dS<dJ?'shoot':'jump';}return null;}
function held(name){const b=btns()[name];let on=false;if(S==='cart'){if(!(CT&&(CT.foot||CT.bug)?['left','right','jump','shoot']:['duck','jump','shoot']).includes(name))return false;for(const p of touches.values())if(p.z===name)on=true;return on;}if(!b)return false;if(S==='space'&&['sl','sr','su','sd','shoot'].includes(name)){for(const p of touches.values())if(p.z&&(p.z===name||p.z.split(' ').includes(name)))on=true;return on;}if(S==='moon'&&['left','right','up','jump','shoot'].includes(name)){for(const p of touches.values())if(p.z===name)on=true;return on;}for(const p of touches.values())if(Math.hypot(p.x-b.x,p.y-b.y)<b.r*1.3)on=true;return on;}
const I={get L(){return K.ArrowLeft||K.KeyA||(S==='space'?held('sl'):held('left'))||VK.L},get R(){return K.ArrowRight||K.KeyD||(S==='space'?held('sr'):held('right'))||VK.R},
 get U(){return K.ArrowUp||K.KeyW||(S==='space'?held('su'):held('up'))||VK.U},get D(){return K.ArrowDown||K.KeyS||(S==='space'&&held('sd'))||(S==='cart'&&held('duck'))||VK.D},
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
 if(s==='title')startMusic('title');else if(s==='space'){initSpace();if(PEND){applyCP(PEND);PEND=null;}startMusic('game');}else if(s==='cart'){if(PEND&&(PEND.m===5||PEND.m===7)){mission=PEND.m;CT={retry:PEND.k|0};PEND=null;}else if(!CT||CT.retry==null)CT=null;cartInit();}else if(s==='moon'){initMoon();if(PEND){applyCP(PEND);PEND=null;}startMusic('game');}
 else if(s==='victory'){startMusic('victory');saveUnlock(mission===4?5:3);if(mission===4)writeSave({cp:null,next:5});}else if(s==='missions'){startMusic('title');}else if(s==='launchcut'){startMusic('launch');}else if(s==='comic'){comicI=0;comicT=0;MUS.intensity=0;startMusic(CB===MOONWIN||CB===INTER1||CB===MARSARR||CB===MARSWIN?'victory':'comic');}else if(s==='landing')startMusic('moon');else if(s==='intro'||s==='select')startMusic('title');
 window.GR.state=s;}
let NOTAP=false;function tapped(){if(NOTAP)return null;const t=tapQueued;tapQueued=null;return t;}
// ---------- TITLE ----------
// ---------- INTRO ----------
const LINES=[{who:'MISSION CONTROL',t:'ALERT! A strange signal, and the Crystal Keys are glowing. Vorr ships detected!'},
 {who:'MISSION CONTROL',t:'The Moon outpost has gone dark. Blob minions everywhere.'},
 {who:'COMMANDER HAYES',t:'We have one ship left, and a crew of four captains.'}];
let line=0;
// ---------- SELECT ----------
let selK=false;function launch(){sfx('pick');window.GR.captain=CAPS[cap].name;mSel=1;go('missions');}
let unlocked=1,mission=1,mSel=1,mDone=1,bLine=0;try{unlocked=Math.max(1,+localStorage.getItem('gr_unlocked')||1);}catch(e){}
const TESTU=Q.get('unlock')==='1'&&!(window.Capacitor&&window.Capacitor.isNativePlatform&&window.Capacitor.isNativePlatform())&&!/^(capacitor|ionic|file):/.test(location.protocol);const UNL=()=>TESTU?99:unlocked;
function saveUnlock(n){if(TESTU)return;unlocked=Math.max(unlocked,n);try{localStorage.setItem('gr_unlocked',unlocked);}catch(e){}window.GR&&(window.GR.unlocked=unlocked);}
let LIVES=3,SAVET=0,GOVER=null,GOT=0,PEND=null,CONF=false;
// ---- gem pieces: 5 per level, saved forever (survive New Game); all 5 = crystal = permanent upgrade ----
let GEMS={1:[0,0,0,0,0],2:[0,0,0,0,0],3:[0,0,0,0,0],4:[0,0,0,0,0],6:[0,0,0,0,0],7:[0,0,0,0,0],8:[0,0,0,0,0],9:[0,0,0,0,0]},CRY=null;try{const o=JSON.parse(localStorage.getItem('gr_gems')||'null');if(o)GEMS={1:o[1]||GEMS[1],2:o[2]||GEMS[2],3:o[3]||GEMS[3],4:o[4]||GEMS[4],6:o[6]||GEMS[6],7:o[7]||GEMS[7],8:o[8]||GEMS[8],9:o[9]||GEMS[9]};}catch(e){}
let SHARDS={};try{SHARDS=JSON.parse(localStorage.getItem('gr_shards')||'{}')||{};}catch(e){}
const gemN=l=>GEMS[l].filter(Boolean).length,UPG=l=>!!SHARDS[l];
const UPNAME={9:['CLOUD BOOTS','Double jump on Jupiter\'s clouds. For good.'],8:['CRYSTAL PLATING','Pale Blue starts every space flight with a shield bubble. For good.'],1:['CRYSTAL BLASTER','Your blaster fires 25% faster. For good.'],2:['CRYSTAL ARMOR','+3 max energy on foot and a longer, tougher force field. For good.'],3:['CRYSTAL HULL','Pale Blue gets +1 hull in every space flight. For good.'],4:['CRYSTAL BOOTS','Higher jumps and a faster run on every planet. For good.'],6:['CRYSTAL THRUSTERS','Speed ring boosts last longer. For good.'],5:['CRYSTAL MAGNET','Gems and power-ups fly to Pale Blue in space. For good.']};
function gotGem(l,i,msgs){if(GEMS[l][i]){msgs.push({t:'GEM PIECE (ALREADY FOUND) '+gemN(l)+'/5',l:1.8});return;}GEMS[l][i]=1;try{localStorage.setItem('gr_gems',JSON.stringify(GEMS));}catch(e){}sfx('stinger');
 msgs.push({t:'GEM PIECE! '+gemN(l)+'/5',l:2});if(gemN(l)>=5){LIVES=Math.min(9,LIVES+1);CRY={t:0,l};}}
function gemShard(x,y,i,old,sc=1){g.save();g.translate(x,y);g.scale(sc,sc);g.rotate(Math.sin(T*2+i)*.25);if(!old)dglow(0,0,22,'#ff7ae0',.7);g.globalAlpha=old?.45:1;
 g.fillStyle=OL;g.beginPath();g.moveTo(0,-13);g.lineTo(9,-2);g.lineTo(4,12);g.lineTo(-5,11);g.lineTo(-9,-3);g.closePath();g.fill();
 g.fillStyle=lg(g,0,-11,0,10,['#ffd6ff','#ff7ae0','#7a3ae8']);g.beginPath();g.moveTo(0,-10.5);g.lineTo(6.8,-2);g.lineTo(2.8,9.6);g.lineTo(-3.8,9);g.lineTo(-6.8,-2.6);g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(0,-9);g.lineTo(-4.5,-2.5);g.lineTo(-1,-1);g.closePath();g.fill();g.restore();}

// ===== Heart Crystal shards: one per mission, guarded by its boss. Big pickup moment + Crystal Tracker (pause menu)
const SHARDINFO={1:['ACE KREEL\'S CRYSTAL KEY','Kreel drops it as he flees!'],2:['THE MOON CRYSTAL KEY','Big Blorp was sitting on it!'],3:['THE MARS GATE CRYSTAL KEY','Krool dropped it in his escape!'],4:['THE MARS CRYSTAL KEY','The Dust Whale coughs it up!'],6:['THE ASTEROID BELT CRYSTAL KEY','Kreel\'s rock ship cracks open!'],5:['THE VESTA PEAK CRYSTAL KEY','The Stone Golem\'s crystal heart pops it out!']};
const SHCOL={1:'#7ae8ff',2:'#e8f0ff',3:'#ff9a3a',4:'#ff5a3a',5:'#5fe36a',6:'#ff7ae0'};
let SHM=null;
const KEYUSE={1:'Back home, the Key also unlocks the Moon flight gate.',2:'The Key also unlocks the outpost launch gate.',3:'The Key also unlocks the Mars Gate dock.',4:'The Key also unlocks the colony water gate.',6:'The Key also unlocks the belt star gate.',5:'All six keyholes filled! Next stop: Voyager.'};
function shardMoment(l,cb){if(SHM)return;SHM={l,t:0,cb,ph:0};sfx('stinger');try{fanfare();}catch(e){}}
function fanfare(){if(!AC||!sfxG)return;const t0=AC.currentTime;[[0,523],[.14,659],[.28,784],[.46,1047],[.46,784],[.46,659]].forEach(([d,f])=>{const o=AC.createOscillator(),gg=AC.createGain();o.type='sawtooth';o.frequency.value=f;gg.gain.setValueAtTime(0,t0+d);gg.gain.linearRampToValueAtTime(.09,t0+d+.02);gg.gain.exponentialRampToValueAtTime(.001,t0+d+(d>.4?1.2:.3));o.connect(gg);gg.connect(sfxG);o.start(t0+d);o.stop(t0+d+1.3);});}
function heartShard(x,y,sc,col,gl,spin){// a CRYSTAL KEY: gem bow in a gold ring + short chunky toothed blade
 dglow(x,y,46*sc,col,.9*gl);g.save();g.translate(x,y);g.scale(sc,sc);if(spin!==undefined)g.scale(Math.cos(spin)||.05,1);g.rotate(-.45+Math.sin(T*2)*.1);g.lineJoin='round';const GD='#ffc53d';
 g.fillStyle=OL;g.beginPath();g.roundRect(-2,-8,30,16,5);g.fill();g.beginPath();g.roundRect(14,2,6,13,2);g.roundRect(22,2,6,10,2);g.fill();
 g.fillStyle=lg(g,0,-6,0,8,['#fff0b0',GD,'#b07a10']);g.beginPath();g.roundRect(0,-5.5,26,11,4);g.fill();g.fillRect(15.5,3,3,10);g.fillRect(23.5,3,3,7);
 circ(-12,0,19,OL);for(let k=0;k<4;k++){const a=k*Math.PI/2+Math.PI/4;circ(-12+Math.cos(a)*18,Math.sin(a)*18,5,OL);circ(-12+Math.cos(a)*18,Math.sin(a)*18,3.2,GD);}
 g.fillStyle=lg(g,-28,-16,-4,16,['#fff0b0',GD,'#b07a10']);g.beginPath();g.arc(-12,0,16.5,0,TAU);g.fill();
 g.fillStyle=OL;g.beginPath();for(let k=0;k<6;k++){const a=k*TAU/6-Math.PI/2;g.lineTo(-12+Math.cos(a)*12.5,Math.sin(a)*12.5);}g.closePath();g.fill();
 g.fillStyle=lg(g,-12,-11,-12,11,['#ffffff',col,'#2a1a5a']);g.beginPath();for(let k=0;k<6;k++){const a=k*TAU/6-Math.PI/2;g.lineTo(-12+Math.cos(a)*10,Math.sin(a)*10);}g.closePath();g.fill();
 g.fillStyle='rgba(255,255,255,.75)';g.beginPath();g.moveTo(-12,-8);g.lineTo(-18,-2);g.lineTo(-13,-1);g.closePath();g.fill();g.restore();}
function keyhole(x,y,r,col,on){circ(x,y,r+3,OL);g.fillStyle=on?lg(g,0,y-r,0,y+r,['#fff0b0','#ffc53d','#b07a10']):'#2a2a4a';g.beginPath();g.arc(x,y,r,0,TAU);g.fill();
 g.fillStyle=on?col:'#0a0a1a';g.beginPath();g.arc(x,y-r*.22,r*.32,0,TAU);g.fill();g.beginPath();g.moveTo(x-r*.18,y-r*.1);g.lineTo(x+r*.18,y-r*.1);g.lineTo(x+r*.3,y+r*.55);g.lineTo(x-r*.3,y+r*.55);g.closePath();g.fill();if(on)dglow(x,y,r*1.6,col,.5);}
function lockTracker(cx,cy,sc,hiL,k){// the Heart Crystal lock on the Golden Record: one keyhole per Crystal Key
 const n=Object.keys(SHARDS).filter(i=>!(+i===hiL&&k<1)).length;g.save();g.translate(cx,cy);g.scale(sc,sc);
 g.strokeStyle=OL;g.lineWidth=16;g.beginPath();g.arc(0,-40,44,Math.PI,TAU);g.stroke();g.strokeStyle='#c8ccd8';g.lineWidth=9;g.stroke();
 g.fillStyle=OL;g.beginPath();g.roundRect(-110,-44,220,92,20);g.fill();g.fillStyle=lg(g,0,-40,0,46,['#ffd86a','#d0901a','#8a5a10']);g.beginPath();g.roundRect(-105,-39,210,82,16);g.fill();
 dglow(0,0,30+n*8,'#bff8ff',.25+n*.12);crystal(0,2,.55+n*.03,1);
 for(let i=1;i<=6;i++){const on=!!SHARDS[i]&&!(i===hiL&&k<1),x=(i<=3?-1:1)*(40+((i-1)%3)*0)+(i<=3?-(i-1)*0:0);const px=i<=3?-82+((i-1)%3)*0:82,py=-24+((i-1)%3)*24;keyhole(i<=3?-80+((i-1)%3)*14:80-((i-1)%3)*14,py,9,SHCOL[i]||'#ffe066',on);}
 g.restore();}
function keyholePos(cx,cy,sc,i){const py=-24+((i-1)%3)*24,px=i<=3?-80+((i-1)%3)*14:80-((i-1)%3)*14;return[cx+px*sc,cy+py*sc];}
function trackerSlots(x0,y,sz,hiL,k){// 4 shards found so far + more out there
 for(let i=1;i<=6;i++){const x=x0+(i-1)*sz*1.25;g.fillStyle='rgba(10,12,40,.85)';g.strokeStyle=SHARDS[i]&&!(i===hiL&&k<1)?SHCOL[i]:'#4a4a7a';g.lineWidth=2;g.beginPath();g.arc(x,y,sz*.55,0,TAU);g.fill();g.stroke();
  if(SHARDS[i]&&!(i===hiL&&k<1))heartShard(x,y,sz/70,SHCOL[i],.5);else txt('?',x,y+1,sz*.4,'#6a6a9a');}}
function shardCut(){const S2=SHM,t=S2.t+=DT,l=S2.l,inf=SHARDINFO[l];
 if(S2.ph===0){// slow-motion white flash
  const k=clamp(t/1.1,0,1);g.fillStyle=`rgba(255,255,255,${Math.sin(k*Math.PI)*.95})`;g.fillRect(0,0,W,H);heartShard(W/2,H/2,.6+k*1.6,SHCOL[l],k);if(t>1.1){S2.ph=1;S2.t=0;SHARDS[l]=1;try{localStorage.setItem('gr_shards',JSON.stringify(SHARDS));}catch(e){}}return;}
 g.fillStyle='rgba(6,4,20,.9)';g.fillRect(0,0,W,H);
 if(S2.ph===1){// full-screen comic panel: the crew cheers under the Key
  g.fillStyle=OL;g.fillRect(16,36,W-32,H-96);g.save();g.beginPath();g.rect(22,42,W-44,H-108);g.clip();g.fillStyle=lg(g,0,42,0,H-60,['#3a1a6a','#7a3ae8','#ff7ae0']);g.fillRect(22,42,W-44,H-108);speedLines(W/2,112,'rgba(255,255,255,.28)');
  for(let i=0;i<4;i++){const cx=106+i*143,hop=Math.abs(Math.sin(T*5+i*1.3))*8,y=170-hop;g.save();g.translate(cx,y+65);g.rotate((i-1.5)*.05);capCard(i,-56,-62,112,128);g.restore();
   if(((T*1.5+i)|0)%2)sfxText(['YEAH!','WOO!','YES!','WAHOO!'][i],cx,y-8,13,.4,(i-1.5)*.1);}
  for(let k=0;k<12;k++){const a=k/12*TAU+T;g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2.5;g.beginPath();g.moveTo(W/2+Math.cos(a)*70,108+Math.sin(a)*50);g.lineTo(W/2+Math.cos(a)*92,108+Math.sin(a)*64);g.stroke();}
  heartShard(W/2,108,1.75+Math.sin(T*4)*.06,SHCOL[l],1,T*2.2);g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(22,42,W-44,H-108);g.globalAlpha=1;g.restore();
  caption(inf[1],30,50,220);sfxText('CRYSTAL KEY RECOVERED!',W/2-70,22,18,t,-.04);txt(inf[0],W/2,H-46,13,'#ffe066');txt('POWER: '+UPNAME[l][0],W/2,H-28,12,'#7ae8ff');txt(UPNAME[l][1],W/2,H-12,10,'#ffffff');
  window._tapTop=1;const adv=cutAdv(t,AUTO&&t>1.8);window._tapTop=0;if(adv){S2.ph=2;S2.t=0;}return;}
 // the Key spins into its keyhole on the Heart Crystal lock
 const k=clamp(t/1.2,0,1),e=1-Math.pow(1-k,3),LX=W/2,LY=212,LS=1.3;panel(W/2-210,40,420,40,'#b04aff');txt('THE HEART CRYSTAL LOCK',W/2,53,13,'#e8d0ff');txt('Every Key fills a keyhole.',W/2,70,11,'#ffffff');
 lockTracker(LX,LY,LS,l,k);const[tx,ty]=keyholePos(LX,LY,LS,l);heartShard(W/2+(tx-W/2)*e,120+(ty-120)*e,1.3-e*.95,SHCOL[l],1,T*8*(1-e));
 if(k>=1){if(!S2.click){S2.click=1;sfx('power');SHAKE=.15;}sfxText('CLICK!',tx+(l<=3?-44:44),ty-30,24,t-1.2,-.1);const n=Object.keys(SHARDS).length;txt(n+' OF 6 KEYHOLES FILLED · THE HEART CRYSTAL GLOWS BRIGHTER',W/2,286,10.5,'#ffe066');txt(KEYUSE[l]||'',W/2,306,10,'#7ae8ff');}
 if(t>(AUTO?1.4:2.4)){const cb=S2.cb;SHM=null;cb&&cb();}}
function crystalCut(){const t=CRY.t+=DT,e=1-Math.pow(1-clamp(t/.4,0,1),3);g.fillStyle='rgba(6,4,20,.82)';g.fillRect(0,0,W,H);
 g.save();g.translate(0,(1-e)*H);g.fillStyle=OL;g.fillRect(110,50,420,250);g.save();g.beginPath();g.rect(116,56,408,238);g.clip();g.fillStyle=lg(g,0,56,0,294,['#3a1a6a','#7a3ae8','#ff7ae0']);g.fillRect(116,56,408,238);speedLines(320,160,'rgba(255,255,255,.25)');
 const k=clamp(t/1,0,1);for(let i=0;i<5;i++){const a=i/5*TAU-Math.PI/2,r=70*(1-k)+6;gemShard(320+Math.cos(a)*r,150+Math.sin(a)*r,i,false,2.2);}if(k>=1)dglow(320,150,70,'#ffffff',.5+.3*Math.sin(T*6));
 g.globalAlpha=.15;g.fillStyle=halftone();g.fillRect(116,56,408,238);g.globalAlpha=1;g.restore();
 caption('ALL 5 GEM PIECES FOUND',124,64,190);txt('BONUS: +1 LIFE!',320,238,16,'#ffe066');txt('Find all 5 gems on a mission for an extra life!',320,262,9,'#ffffff');g.restore();
 sfxText('GEMS COMPLETE!',W/2,30,22,t,-.06);if(cutAdv(t,AUTO&&t>2))CRY=null;}
function loadSave(){try{return JSON.parse(localStorage.getItem('gr_save')||'null');}catch(e){return null;}}
function writeSave(o,quiet){const old=loadSave()||{};const sv={...old,...o,cap,unlocked,score,lives:LIVES,v:1,at:Date.now()};try{localStorage.setItem('gr_save',JSON.stringify(sv));localStorage.setItem('gr_unlocked',unlocked);}catch(e){}if(!quiet)SAVET=1.8;}
function saveCP(m,k){writeSave({cp:{m,k},next:m});}
function loseLife(rs){if(AUTO){rs();return;}LIVES--;if(LIVES>0){rs();}else{GOVER=rs;GOT=0;sfx('stinger');}}
function newGame(){try{localStorage.removeItem('gr_save');localStorage.setItem('gr_unlocked','1');}catch(e){}unlocked=1;score=0;LIVES=3;CONF=false;if(seenComic&&!TESTU)go('select');else{comicFrom='title';go('comic');}}
function resumeSave(sv){cap=sv.cap??0;unlocked=Math.max(unlocked,sv.unlocked||1);score=sv.score||0;LIVES=sv.lives>0?sv.lives:3;
 if(sv.cp&&sv.cp.m){mission=sv.cp.m;PEND=sv.cp;go(sv.cp.m===5||sv.cp.m===7?'cart':sv.cp.m===2||sv.cp.m===4?'moon':'space');}else{mSel=Math.min(8,sv.next||unlocked);go('missions');}}
function applyCP(c){if(c.m===9&&SK){skRespawn(c.k||0);return;}if((c.m===1||c.m===3||c.m===6||c.m===8)&&sp){const s=sp,k=Math.min(STG[2].a,c.k||0);s.cp=k;s.dist=k;s.bossI=STG.filter(st=>st.b<k).length;s.ha=HEAD[s.bossI].a;s.hr=HEAD[s.bossI].r;setDims(s.bossI);s.x=120;s.y=SH/2;s.waves.forEach(w=>{w.go=w.d<k?1:0;});s.msgs.push({t:'RESUMED AT CHECKPOINT',l:2.5});}
 if(c.m===2&&M){const m=M,k=clamp(c.k|0,0,m.cps.length-1);for(let i=0;i<=k;i++)m.cps[i].on=true;const cc=m.cps[k];m.px=cc.x+(cc.x===140?95:0);m.py=GROUND;m.best=m.px;m.safe=m.px;m.msgs.push({t:'RESUMED AT CHECKPOINT',l:2.5});}}
function drawGameOver(){GOT+=DT;g.fillStyle='rgba(8,4,24,.72)';g.fillRect(0,0,W,H);txt('GAME OVER',W/2,120,34,'#ff4f7b');txt('All three lives lost.',W/2,158,11,'#ffffff');
 panel(W/2-160,172,150,40,'#5fe36a');txt('RETRY FROM CHECKPOINT',W/2-85,192,9,'#ffffff');panel(W/2+10,172,150,40,'#ffc53d');txt('MISSION MENU',W/2+85,192,10,'#ffffff');txt('Retry refills all 3 lives',W/2,228,8,'#c6cbef');
 const tp=tapped();if(GOT<.8)return;if(tp&&tp.y>162&&tp.y<222&&tp.x>W/2){GOVER=null;LIVES=3;go('missions');return;}
 if(tp&&tp.y>162&&tp.y<222&&tp.x<W/2||K.Enter||K.Space){const r=GOVER;GOVER=null;LIVES=3;sfx('pick');r();}}
function oneUp(x,y,nl){dglow(x,y,22,'#ff4f7b',.8);circ(x,y,11,OL);g.fillStyle=ballG(g,x,y,9.5,9.5,'#ff4f7b');g.beginPath();g.arc(x,y,9.5,0,TAU);g.fill();if(!nl)txt('1UP',x,y+.5,7,'#ffffff');}
function startMission(n){LIVES=3;mission=n;bLine=0;sfx('pick');go('card');}
function completeMission(n){saveUnlock(Math.min(NMIS,n+1));writeSave({cp:null,next:Math.min(NMIS,n+1)});mDone=n;const MB=mapBeats(n);if(n===9){playComic([...JUPWIN,...MB],()=>{mSel=9;go('missions');});return;}if(n===8){playComic([...JYWIN,...MB],()=>{mSel=8;go('missions');});return;}if(n===7){playComic([...PEAKWIN,...MB],()=>{mSel=8;go('missions');});return;}if(n===6){playComic([...VESTAARR,...MB],()=>{mSel=7;go('missions');});return;}if(n===5){playComic([...COMETWIN,...MB],()=>{mSel=6;go('missions');});return;}if(n===1)playComic([...INTER1.slice(0,2),...MB,...INTER1.slice(2)],()=>go('mdone'));else if(n===3)playComic([...MB,...MARSARR],()=>{mSel=4;go('missions');});else playComic(MB,()=>go('mdone'));}
// ---------- SPACE FLIGHT ----------
let sp;
let SW=640,SH=360;const HEAD=[{a:0,r:0,n:'HEADING: OUTBOUND'},{a:0,r:0,n:'HEADING: CLIMB'},{a:0,r:0,n:'HEADING: MOON APPROACH'}];
function headI(s){return s.phase==='jump'?Math.max(0,s.bossI-1):Math.min(2,s.bossI);}
function setDims(i){SW=640;SH=360;}
function toS(x,y){const s=sp,c=Math.cos(s.hr),ca=Math.cos(s.ha),sa=Math.sin(s.ha),dx=x-SW/2,dy=(y-SH/2)*c;return[W/2+dx*ca-dy*sa,H/2+dx*sa+dy*ca];}
const GEMSP1=[[0,2400,22],[1,4900,-22],[2,8600,26],[3,11500,-26],[4,16800,22]],GEMSP3=[[0,1900,-20],[1,4300,20],[2,7900,-24],[3,10600,24],[4,16300,-20]];let GEMSP=GEMSP1,SPM=1;// M1 gem pieces hug the screen edges
const STG1=[{n:'EARTH ORBIT',a:0,b:5600,boss:'carrier',jump:7000,iv:700},{n:'VORR PICKET LINE',a:7000,b:12600,boss:'turret',jump:14000,iv:620},{n:'LUNAR APPROACH',a:14000,b:19600,boss:'ace',jump:21000,iv:560}],STG3=[{n:'LEAVING THE MOON',a:0,b:5200,boss:'grubb',jump:6600,iv:680},{n:'THE RING ROUTE',a:6600,b:11800,boss:'twins',jump:13200,iv:620},{n:'MARS GATE',a:13200,b:18400,boss:'krool',jump:19800,iv:580}];let SP_LEN=21000,STG=STG1,BREATHER=18300;const 
 BOSSNAME={carrier:'VORR SHIELD CARRIER',turret:'SPINNING TURRET GUNSHIP',ace:'AMBUSH! ACE KREEL',grubb:'FUEL DEPOT ALPHA: CAPTAIN GRUBB',twins:'RING STATION BETA: VEXA & VOXA',krool:'MARS GATE: WARDEN KROOL',tosser:'ALIEN ROCK TOSSER',smasher:'ALIEN ASTEROID SMASHER',kreel2:'ACE KREEL\'S ROCK SHIP',satboss:'THE SATELLITE BOSS',jrocket:'THE JUNK ROCKET',claw:'THE TRASH COMPACTOR CLAW'},
 FACTS=[];
function genWaves(){const out=[],pools=SPM===8?[['drift','blobs','drones','vorr','riders','big','wall','drift','blobs','drones','spin'],['wall','riders','drones','magnet','faces','spin','vorr','big','blobs','drift','drones','wall'],['magnet','faces','spin','drones','riders','big','wall','blobs','vorr','drones','magnet','faces','spin','big']]:SPM===6?[['rings','scouts','field','tow','rings','big','disg','munch','field'],['rings','sneeze','swoop2','big','rings','disg','munch','field','tow'],['rings','big','sneeze','twin','rings','munch','tow','disg','field']]:SPM===3?[['swoop2','taxi','bubb','swoop2','twin','divers','sdrone','taxi'],['twin','sdrone','swoop2','bubb','taxi','V','twin','sdrone','snake'],['sdrone','twin','bubb','swoop2','taxi','twin','pincer','sdrone','bubb']]:[['divers','scouts','sat','spread','behind','divers','shieldU','pods'],['V','spread','shieldU','behind','mines','divers','pincer','pods','snake'],['spread','pods','shieldB','behind','circle','divers','snake','pincer','shieldU']];
 STG.forEach((st,si)=>{let i=0;const end=si===2?BREATHER:st.b-600;for(let d=st.a+600;d<end;d+=st.iv,i++)out.push({d,p:pools[si][i%pools[si].length]});});return out;}
function initSpace(){SPM=mission===8?8:mission===6?6:mission===3?3:1;STG=SPM===8?STG8:SPM===6?STG6:SPM===3?STG3:STG1;GEMSP=SPM===8?GEMSP8:SPM===6?GEMSP6:SPM===3?GEMSP3:GEMSP1;SP_LEN=SPM===8?23400:SPM===6?22400:SPM===3?19800:21000;BREATHER=SPM===8?21200:SPM===6?20000:SPM===3?17200:18300;SW=640;SH=360;const mh=5+(UPG(3)?1:0);sp={x:120,y:SH/2,vx:0,vy:0,hp:mh,maxhp:mh,inv:0,dist:0,len:SP_LEN,shots:[],foes:[],rocks:[],eshots:[],booms:[],picks:[],pops:[],cool:0,ccool:0,killed:0,msgs:[],boss:null,bossI:0,phase:'fly',endT:0,cp:0,sec:-1,fact:null,factI:0,banner:null,
 ha:0,hr:0,cut:null,pw:{spread:0,rapid:0,charge:0},shield:UPG(8)?1:0,waves:genWaves(),rt:0,combo:0,ct:0,mult:1,jumpTo:0,breathe:false};}
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
function M3BOSSINIT(B){m6Init(B);if(B.type==='twins')B.ships=[{a:0,hp:B.max/2,n:0,f:1.2},{a:Math.PI,hp:B.max/2,n:1,f:2}];if(B.type==='krool'){B.ks=1;B.plates=[0,1,2,3].map(i=>({a:i*TAU/4,hp:AUTO?1:6}));B.hp=B.max=B.plates.reduce((a,p)=>a+p.hp,0);B.cx=SW+140;}}
const M3BOSS={
 grubb:(B,dt,hpF)=>{const s=sp;B.x+=(SW-130-B.x)*Math.min(1,dt*1.2);B.y=SH/2-30+Math.sin(B.t*.6)*70;B.f-=dt;if(B.f<=0){B.f=hpF<.5?1.7:2.3;for(let k=0;k<4;k++)s.eshots.push({x:B.x-60,y:B.y+rnd(-10,10),vx:-rnd(95,150),vy:rnd(-130,130),bo:2,goo:1});sfx('whoosh');}
  B.l-=dt;if(B.l<=0){B.l=7;const top=Math.random()<.5;for(let i=0;i<3;i++)s.foes.push({pat:'loop',kind:'swooper',age:0,del:i*.3,cy:top?80:SH-140,hp:1,life:9,pers:'rookie'});s.msgs.push({t:'GRUBB CALLS SWOOPERS!',l:1.5});}return[86,38,false];},
 twins:(B,dt,hpF)=>{const s=sp,live=B.ships.filter(q=>q.hp>0),rage=live.length===1;B.x=SW-170;B.y=SH/2-30;
  for(const q of B.ships){if(q.hp<=0)continue;q.a+=dt*(rage?2.3:1.2);q.x=B.x+Math.cos(q.a)*90;q.y=B.y+Math.sin(q.a)*95;q.f-=dt;if(q.f<=0){q.f=rage?.75:1.5;const a=Math.atan2(s.y-q.y,s.x-q.x);for(const k of rage?[-.2,0,.2]:[0])s.eshots.push({x:q.x-14,y:q.y,vx:Math.cos(a+k)*(rage?220:180),vy:Math.sin(a+k)*(rage?220:180)});sfx('hit');}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-q.x,b.y-q.y)<26){if(!b.pierce)b.dead=1;q.hp-=b.dmg||1;q.hit=.08;B.hit=.08;sfx('hit');if(q.hp<=0){boomAt(s.booms,q.x,q.y,16,'#ff7ae0');sfx('bigboom');SHAKE=.5;s.pops.push({x:q.x,y:q.y-30,t:q.n?'VOXA DOWN!':'VEXA DOWN!',l:1.1,comic:1,sz:20});if(B.ships.some(o=>o.hp>0))s.pops.push({x:B.x,y:B.y-70,t:'SHE\'S FURIOUS!',l:1.3,comic:1,sz:22});}}
   if(Math.hypot(s.x-q.x,s.y-q.y)<30)hurtShip();q.hit=(q.hit||0)-dt;}
  B.hp=B.ships.reduce((a,q)=>a+Math.max(0,q.hp),0);const t2=live.find(q=>q.hp>0);if(t2){B.x=t2.x;B.y=t2.y;}else{B.x=SW-170;}return[-1,-1,false];},
 krool:(B,dt,hpF)=>{const s=sp;if(!B.chg)B.cx+=(SW-150-B.cx)*Math.min(1,dt*1.2);let cy=B.chg&&B.chg.st>0?B.chg.y:SH/2-30+Math.sin(B.t*.5)*50;B.rot=(B.rot||0)+dt*(B.p3?2.2:1.3);B.dr=B.dr||[];
  const aim=(n,sp2,spr,ox)=>{const a=Math.atan2(s.y-cy,s.x-B.cx);for(let k=0;k<n;k++){const o=(k-(n-1)/2)*spr;s.eshots.push({x:B.cx-(ox||20),y:cy,vx:Math.cos(a+o)*sp2,vy:Math.sin(a+o)*sp2,tb:1});}sfx('hit');};
  // shield drones: orbit Krool, eat your shots, fire slow single shots
  const summon=n=>{for(let i=0;i<n;i++)B.dr.push({a:i*TAU/n,hp:AUTO?1:3,f:1.5+i*.6,hit:0});s.msgs.push({t:'SHIELD DRONES! SHOOT THEM DOWN!',l:1.8});sfx('stinger');};
  for(const d of B.dr){if(d.hp<=0)continue;d.a+=dt*1.6;d.x=B.cx+Math.cos(d.a)*78;d.y=cy+Math.sin(d.a)*70;d.f-=dt;if(d.f<=0){d.f=2.6;const a=Math.atan2(s.y-d.y,s.x-d.x);s.eshots.push({x:d.x,y:d.y,vx:Math.cos(a)*120,vy:Math.sin(a)*120});}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-d.x,b.y-d.y)<15){if(!b.pierce)b.dead=1;d.hp-=b.dmg||1;d.hit=.08;sfx('hit');if(d.hp<=0){boomAt(s.booms,d.x,d.y,9,'#7ae8ff');sfx('boom');s.pops.push({x:d.x,y:d.y-14,t:'ZAP!',l:.7,comic:1,sz:16});}}d.hit-=dt;if(Math.hypot(s.x-d.x,s.y-d.y)<18)hurtShip();}
  B.dr=B.dr.filter(d=>d.hp>0);const shielded=B.dr.length>0;
  // sweeping beam: 1.1s warning line, then a beam that sweeps a little
  const bm=B.beam;if(bm){bm.t+=dt;if(bm.t>bm.w){const k=Math.min(1,(bm.t-bm.w)/bm.d);bm.ang=bm.a0+(bm.a1-bm.a0)*k;if(bm.t-bm.w<dt*1.5){sfx('bigboom');SHAKE=.25;}
    const dx=s.x-B.cx,dy=s.y-cy,ca=Math.cos(bm.ang),sa=Math.sin(bm.ang),al=dx*ca+dy*sa,pd=Math.abs(-dx*sa+dy*ca);if(al>0&&pd<13)hurtShip();if(k>=1)B.beam=null;}else bm.ang=bm.a0;}
  const fireBeam=dur=>{const a=Math.atan2(s.y-cy,s.x-B.cx),dir=s.y<cy?1:-1;B.beam={t:0,w:B.p3?.85:1.1,d:dur,a0:a-dir*.28,a1:a+dir*.28,ang:a};sfx('blip');};
  // charge: flash + dashed lane for 1s, then ram across the screen and fly back
  const C=B.chg;if(C){C.t+=dt;if(C.st===0){if(C.t>1){C.st=1;C.t=0;sfx('whoosh');SHAKE=.3;}}else if(C.st===1){B.cx-=520*dt;if(B.cx<60){C.st=2;}}else{B.cx+=(SW-150-B.cx)*Math.min(1,dt*2.5);if(Math.abs(B.cx-(SW-150))<8)B.chg=null;}}
  const busy=B.beam||B.chg;
  if(B.ks===1){for(const p of B.plates){if(p.hp<=0)continue;const a=p.a+B.rot;p.x=B.cx+Math.cos(a)*48;p.y=cy+Math.sin(a)*48;for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-p.x,b.y-p.y)<17){if(!b.pierce)b.dead=1;p.hp-=b.dmg||1;p.hit=.08;sfx('hit');if(p.hp<=0){boomAt(s.booms,p.x,p.y,10,'#ff9a3a');sfx('boom');s.pops.push({x:p.x,y:p.y-16,t:'CLANG!',l:.8,comic:1,sz:16});}}p.hit=(p.hit||0)-dt;}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-B.cx,b.y-cy)<30){b.dead=1;}
   B.f-=dt;if(B.f<=0){B.n=(B.n||0)+1;B.f=2.2;if(B.n%2)for(let k=0;k<10;k++){const a=k*TAU/10+B.t;s.eshots.push({x:B.cx,y:cy,vx:Math.cos(a)*105,vy:Math.sin(a)*105,tb:1});}else aim(3,150,.22);sfx('hit');}
   const lost=B.plates.filter(p=>p.hp<=0).length;if(lost>=2&&!B.s1){B.s1=1;summon(2);}
   B.hp=B.plates.reduce((a,p)=>a+Math.max(0,p.hp),0);if(B.hp<=0){B.ks=2;B.hp=B.max=AUTO?8:44;B.f=1.4;B.bf=4;B.sf=9;sfx('stinger');SHAKE=.5;s.pops.push({x:Math.min(B.cx,W-140),y:Math.max(96,cy-60),t:'CORE EXPOSED!',l:1.3,comic:1,sz:24});}}
  else if(B.ks===2){if(!B.p3&&B.hp<=B.max*.5){B.p3=1;B.f=1.5;B.bf=2.5;B.cf=3;B.dr=[];SHAKE=.7;sfx('stinger');s.pops.push({x:W*.5,y:Math.max(110,cy-62),t:'KROOL GOES OVERDRIVE!',l:1.6,comic:1,sz:22});s.msgs.push({t:'WATCH FOR THE FLASH: HE WILL CHARGE!',l:2.2});summon(2);}
   if(!busy){B.f-=dt;if(B.f<=0){B.f=B.p3?1.15:1.5;B.p3?aim(5,175,.17):aim(5,155,.18);}}
   B.bf-=dt;if(B.bf<=0&&!busy){B.bf=B.p3?5.5:6.5;fireBeam(B.p3?1:1.3);}
   if(!B.p3){B.sf-=dt;if(B.sf<=0&&B.dr.length===0){B.sf=12;summon(3);}}
   else{B.cf-=dt;if(B.cf<=0&&!busy){B.cf=6.2;B.chg={st:0,t:0,y:Math.max(50,Math.min(SH-110,s.y))};s.pops.push({x:B.cx,y:Math.max(90,cy-56),t:'!!',l:1,comic:1,sz:30});sfx('blip');}}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-B.cx,b.y-cy)<34){if(!b.pierce)b.dead=1;if(shielded){if(!B.tk||B.t-B.tk>1.2){B.tk=B.t;s.pops.push({x:B.cx,y:cy-48,t:'SHIELDED!',l:.7,comic:1,sz:15});}continue;}B.hp-=b.dmg||1;B.hit=.08;sfx('hit');}
   if(B.hp<=0){B.ks=3;B.dr=[];B.beam=null;B.chg=null;B.hp=B.max=AUTO?4:14;B.pod={x:B.cx,y:cy,t:0,f:1};boomAt(s.booms,B.cx,cy,24,'#ff9a3a');sfx('bigboom');SHAKE=.8;s.pops.push({x:B.cx,y:cy-50,t:'KROOL BAILS OUT!',l:1.4,comic:1,sz:24});s.msgs.push({t:'CATCH HIS POD BEFORE IT REACHES MARS!',l:2.4});}}
  else{const P=B.pod;P.t+=dt;P.x+=48*dt;P.y=SH/2-30+Math.sin(P.t*2.1)*110;P.f-=dt;if(P.f<=0){P.f=1;const a=Math.atan2(s.y-P.y,s.x-P.x);for(const k of[-.15,.15])s.eshots.push({x:P.x,y:P.y,vx:Math.cos(a+k)*165,vy:Math.sin(a+k)*165});}
   if(P.x>SW-30){P.x=SW*.45;s.msgs.push({t:'HE DOUBLED BACK! GET HIM!',l:1.6});}
   for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-P.x,b.y-P.y)<18){if(!b.pierce)b.dead=1;B.hp-=b.dmg||1;B.hit=.08;sfx('hit');}
   if(Math.hypot(s.x-P.x,s.y-P.y)<24)hurtShip();}
  B.ky=cy;if(B.ks<3){B.x=B.cx;B.y=cy;if(Math.hypot(s.x-B.cx,s.y-cy)<(B.chg&&B.chg.st===1?46:50))hurtShip();}else{B.x=B.pod.x;B.y=B.pod.y;}return[-1,-1,false];}};
function kroolFx(B){if(B.ks>=3)return;const cy=B.ky??B.y,bm=B.beam;
 if(bm){const L=900,ca=Math.cos(bm.ang),sa=Math.sin(bm.ang);if(bm.t<=bm.w){const bl=Math.sin(bm.t*22)>0;g.save();g.strokeStyle=bl?'#ff3a3a':'#ffe066';g.lineWidth=3;g.setLineDash([12,8]);g.beginPath();g.moveTo(B.cx,cy);g.lineTo(B.cx+ca*L,cy+sa*L);g.stroke();g.setLineDash([]);g.restore();dglow(B.cx-20,cy,22+bm.t*14,'#ff5a3a',.7);}
  else{g.save();g.lineCap='round';g.strokeStyle=OL;g.lineWidth=30;g.beginPath();g.moveTo(B.cx,cy);g.lineTo(B.cx+ca*L,cy+sa*L);g.stroke();g.strokeStyle='#ff5a3a';g.lineWidth=24;g.stroke();g.strokeStyle='#fff3c0';g.lineWidth=9;g.stroke();g.restore();}}
 const C=B.chg;if(C&&C.st===0){const bl=Math.sin(C.t*20)>0;g.save();g.globalAlpha=.35+.25*bl;g.fillStyle='#ff3a3a';g.fillRect(0,C.y-26,B.cx,52);g.globalAlpha=1;g.strokeStyle='#ffe066';g.lineWidth=3;g.setLineDash([14,10]);g.strokeRect(0,C.y-26,B.cx,52);g.setLineDash([]);g.restore();txt('CHARGE! MOVE!',Math.min(B.cx-120,320),C.y,16,'#fff');}
 if(C&&C.st===1){for(let i=1;i<5;i++){g.globalAlpha=.5-i*.1;g.fillStyle='#ff9a3a';g.fillRect(B.cx+20+i*22,C.y-18+i*3,30,36-i*6);}g.globalAlpha=1;}
 for(const d of B.dr||[]){if(d.hp<=0||d.x===undefined)continue;g.save();g.strokeStyle='rgba(122,232,255,.35)';g.lineWidth=2;g.beginPath();g.moveTo(d.x,d.y);g.lineTo(B.cx,cy);g.stroke();g.restore();circ(d.x,d.y,13,OL);g.fillStyle=ballG(g,d.x,d.y,11,11,d.hit>0?'#ffffff':'#4a8ad0');g.beginPath();g.arc(d.x,d.y,11,0,TAU);g.fill();g.fillStyle='#7ae8ff';g.beginPath();g.moveTo(d.x-6,d.y);g.lineTo(d.x,d.y-6);g.lineTo(d.x+6,d.y);g.lineTo(d.x,d.y+6);g.closePath();g.fill();if(Math.sin(T*8+d.a)>0)circ(d.x,d.y-12,2.5,'#ff3a3a');}
 if(B.dr&&B.dr.length&&B.ks===2){g.save();g.globalAlpha=.3+.15*Math.sin(T*6);g.strokeStyle='#7ae8ff';g.lineWidth=4;g.beginPath();g.arc(B.cx,cy,44,0,TAU);g.stroke();g.restore();}
 if(B.p3)dglow(B.cx,cy,40,'#ff3a3a',.35+.2*Math.sin(T*10));}
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
 krool:B=>{if(B.ks<3){kroolFx(B);kroolArt(B,B.cx,B.ky??B.y,1,B.ks);}else kroolPod(B.pod.x,B.pod.y,B.hit>0);}};
function M3CUTART(type){if(type==='grubb')grubbArt(174,175,1.2,false);else if(type==='twins'){twinShip(120,140,'#ff7ae0',1.8,false);twinShip(230,220,'#3ad6c0',1.8,false);}else kroolArt(null,174,170,1.8,1);}
// refuel comic scenes after each freed station (paused, tap to advance with the input delay)
const REFUEL=[
 [['cap','FUEL DEPOT ALPHA: FREED!','Tanks filling up! Pale Blue lives to fly another day.'],['hayes','Hayes checks in.','Nice work. Grubb was hauling fuel for Malakar\'s fleet.'],['cap','Refueled.','Every station we free slows the Vorr down. On to the next!']],
 [['cap','RING STATION BETA: FREED!','Two sisters down, one station closer to Mars.'],['hayes','Hayes checks in.','Those twins were tracking our star map\'s trail. The Vorr are getting close.'],['mal','Aboard the Vorr flagship...','Two stations lost? FLY FASTER! I need those Keys!']],
 [['cap','MARS GATE: OPEN!','Krool\'s pod spins off. He dropped the third Crystal Key!'],['hayes','Hayes checks in.','Krool dropped his star charts. The map\'s trail runs right past Mars.'],['cap','Full tanks.','Then that\'s where we\'re going. Hang on, crew!']]];
function fuelStation(i,x,y,sc,freed,t){const C=['#5fe36a','#ff7ae0','#ff9a3a'][i],C2=['#2a8a3a','#a03a90','#b0581a'][i];g.save();g.translate(x,y);g.scale(sc,sc);g.lineJoin='round';
 const tank=(tx,ty,r)=>{circ(tx,ty,r+3,OL);g.fillStyle=ballG(g,tx,ty,r,r,C);g.beginPath();g.arc(tx,ty,r,0,TAU);g.fill();g.fillStyle='rgba(255,255,255,.35)';g.beginPath();g.ellipse(tx-r*.35,ty-r*.4,r*.3,r*.18,-.5,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.ellipse(tx,ty,r,r*.3,0,0,TAU);g.stroke();};
 if(i===1){g.strokeStyle=OL;g.lineWidth=20;g.beginPath();g.ellipse(0,0,74,48,0,0,TAU);g.stroke();g.strokeStyle=C2;g.lineWidth=13;g.stroke();g.strokeStyle=C;g.lineWidth=4;g.stroke();
  for(let k=0;k<4;k++){const a=k*Math.PI/2+T*.2;g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.moveTo(0,0);g.lineTo(Math.cos(a)*70,Math.sin(a)*45);g.stroke();tank(Math.cos(a)*74,Math.sin(a)*48,13);}}
 const bw=i===2?96:84,bh=i===2?60:52;g.fillStyle=OL;g.beginPath();g.roundRect(-bw/2-3,-bh/2-3,bw+6,bh+6,16);g.fill();g.fillStyle=lg(g,0,-bh/2,0,bh/2,['#c8ccd8','#7a80a0','#454a6a']);g.beginPath();g.roundRect(-bw/2,-bh/2,bw,bh,14);g.fill();
 g.fillStyle=C2;g.fillRect(-bw/2,bh/2-14,bw,7);for(let k=0;k<5;k++){const on=(T*4+k|0)%3===0;circ(-bw/2+12+k*(bw-24)/4,-bh/2+9,3.2,OL);circ(-bw/2+12+k*(bw-24)/4,-bh/2+9,2.3,on?'#ffe066':'#6a5a20');if(on)dglow(-bw/2+12+k*(bw-24)/4,-bh/2+9,8,'#ffe066',.6);}
 if(i===0){tank(-30,-48,18);tank(0,-56,20);tank(30,-48,18);}else if(i===2){tank(-66,0,22);tank(66,0,22);circ(0,-46,14,OL);circ(0,-46,11,C);}
 // FUEL sign + gauge
 g.fillStyle=OL;g.beginPath();g.roundRect(-34,-12,46,22,6);g.fill();g.fillStyle=freed?'#ffe066':'#6a5a20';g.beginPath();g.roundRect(-32,-10,42,18,5);g.fill();if(freed)dglow(-11,-1,30,'#ffe066',.45);txt('FUEL',-11,0,8,freed?'#1a1020':'#3a3010');
 circ(28,2,13,OL);g.fillStyle='#f0f0f8';g.beginPath();g.arc(28,4,10,Math.PI,TAU);g.fill();const lv=freed?clamp((t||0)/3,0,1):.08,na=Math.PI+lv*Math.PI;g.strokeStyle='#ff3a3a';g.lineWidth=2.4;g.beginPath();g.moveTo(28,4);g.lineTo(28+Math.cos(na)*9,4+Math.sin(na)*9);g.stroke();circ(28,4,2,OL);
 // docking arm (two chunky rounded joints)
 g.fillStyle=OL;g.beginPath();g.roundRect(bw/2-4,-9,34,18,9);g.fill();g.fillStyle='#9aa0c0';g.beginPath();g.roundRect(bw/2-2,-7,30,14,7);g.fill();circ(bw/2+30,0,11,OL);circ(bw/2+30,0,8,C);
 // Vorr banners: proud while captured, torn and drifting once freed
 for(const d of[-1,1]){const bx=d*(bw/2-10),by=bh/2+2;g.save();g.translate(bx,by);if(freed){g.translate(d*((t||0)*14),(t||0)*22);g.rotate(d*(.6+(t||0)*.8));g.globalAlpha=clamp(1-(t||0)/3,0,1);}
  g.fillStyle=OL;g.beginPath();g.moveTo(-9,0);g.lineTo(9,0);g.lineTo(freed?3:0,freed?14:26);g.closePath();g.fill();g.fillStyle='#8a2ad0';g.beginPath();g.moveTo(-6,2);g.lineTo(6,2);g.lineTo(freed?2:0,freed?11:21);g.closePath();g.fill();circ(0,6,2.5,'#ff4fd0');g.restore();}
 g.restore();return[x+(bw/2+30)*sc,y];}
function stationArt(i,t){g.fillStyle=lg(g,0,50,0,290,['#140c34','#2a1a5a']);g.fillRect(30,50,288,238);starfield(T*4);
 const[hx,hy]=fuelStation(i,130,180,.95,true,t);const sx=262,sy=150;
 g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.moveTo(hx,hy);g.quadraticCurveTo(hx+30,hy+40,sx-34,sy+8);g.stroke();g.strokeStyle='#ffc53d';g.lineWidth=5;g.stroke();
 for(let k=0;k<5;k++){const u=((t*.9+k/5)%1),q=1-u,bx=q*q*hx+2*q*u*(hx+30)+u*u*(sx-34),by=q*q*hy+2*q*u*(hy+40)+u*u*(sy+8);circ(bx,by,3.6,OL);circ(bx,by,2.6,'#fff6c0');}
 ship(sx,sy,T,.8);sfxText('GLUG GLUG!',200,262,14,t,-.08,'#ffe066','#c08a10');}
function refuelCut(s){const c=s.cut,beat=REFUEL[c.i][c.b],t=c.t,chart=/star charts/.test(beat[2]);const who=beat[0]==='cap'?CAPS[cap].name:beat[0]==='mal'?'MALAKAR':'HAYES';
 const img=beat[0]==='mal'?'c07':beat[0]==='hayes'&&!chart?'c10':'c'+(30+Math.min(2,c.i));
 paintCut(t,img,beat[1],[{who,s:beat[2]}],c.b===0?'REFUELED!':'',chart?()=>{g.fillStyle='rgba(8,12,40,.78)';g.fillRect(PX,PY,PW,PH);routeMap(W/2-150,PY+40,300,150);txt('KROOL\'S STAR CHARTS',W/2,PY+24,13,'#ffe066');}:img==='c10'?()=>routeMap(PX+PW-178,PY+PH-112,160,92):null);
 for(let k=0;k<REFUEL[c.i].length;k++)circ(W/2-10+k*10,PY-6,2.6,k===c.b?'#ffc53d':'#4a4a6a');
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
 M3WAVE(p,F,msg,cy);M6WAVE(p,F,msg,cy);if(SPM===8)M8WAVE(p,F,msg);
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
 else if(f.pat==='munch'){if(f.lunge>0){f.x+=f.lvx*DT;f.y+=f.lvy*DT;}else{f.x=Math.max(SW-170,f.x-60*DT);f.y+=(sp.y-f.y)*Math.min(1,DT*.6);}f.y=clamp(f.y,40,SH-90);if(f.x<-60)f.dead=1;}
 else if(f.pat==='float'){f.x-=40*DT;f.y+=Math.sin(f.age*2.2)*22*DT;}
 else if(f.pat==='pair'){f.x=SW+40-t*80;f.y=f.cy+f.side*34+Math.sin(t*1.4)*24;}
 else if(f.pat==='home'){if(f.vx===undefined){f.x=SW+30;f.y=f.cy;f.vx=-60;f.vy=0;}const a=Math.atan2(sp.y-f.y,sp.x-f.x),vm=f.spd||170;f.vx+=Math.cos(a)*220*DT;f.vy+=Math.sin(a)*220*DT;const v=Math.hypot(f.vx,f.vy);if(v>vm){f.vx*=vm/v;f.vy*=vm/v;}f.x+=f.vx*DT;f.y+=f.vy*DT;}
 else{const hold=t<4?0:t<11?1:2,cx=hold===0?SW+90-t*(260/4):hold===1?SW-170:SW-170-(t-11)*180,a=f.a0+t*1.7;f.x=cx+Math.cos(a)*62;f.y=f.cy+Math.sin(a)*62;}}
function spawnRock(){return;const r=[8,13,19][Math.random()*3|0];sp.rocks.push({x:SW+40,y:rnd(30,SH-90),vx:-rnd(110,200),vy:rnd(-25,25),r,hp:r>15?5:r>10?3:1,rot:rnd(0,6),vr:rnd(-2,2),junk:sp.sec===0||Math.random()<.25,v:Math.random()*3|0});}
function addCombo(x,y,pts){const s=sp;s.combo++;s.ct=2.6;s.mult=Math.min(5,1+Math.floor(s.combo/6));score+=pts*s.mult;if(pts)s.pops.push({x,y,t:'+'+pts*s.mult,l:.8,c:'#ffc53d'});}
function spawnBoss(type){if(!sp.cut)sp.cut={type,t:0};const s=sp,hpM={tosser:AUTO?14:55,smasher:AUTO?16:65,kreel2:AUTO?10:90,carrier:AUTO?24:40,turret:AUTO?30:100,ace:AUTO?26:70,grubb:AUTO?20:45,twins:AUTO?16:60,krool:AUTO?8:16,satboss:AUTO?14:100,jrocket:AUTO?16:95,claw:AUTO?10:90}[type];
 s.boss={type,x:type==='ace'?-80:SW+140,y:type==='ace'?s.y:SH/2-30,t:0,hp:hpM,max:hpM,hit:0,f:2,l:4,mt:3,mode:'spiral',rot:0,warn:0,dash:0,dvx:0,dt:4,sd:1,wp:0,wpn:0,p2:0,tr:0,al:0,pods:type==='carrier'?[{a:0,hp:3,rt:0},{a:Math.PI,hp:3,rt:0}]:null};
 M3BOSSINIT(s.boss);m8Init(s.boss);if(type==='turret')s.picks.push({x:SW*.62,y:SH/2+40,k:'fshield'});s.phase='boss';s.banner={t:BOSSNAME[type],l:2.6,big:1};sfx('warn');startMusic('boss',s.bossI);if(SPM===8)s.msgs.push({t:{satboss:'COMET: BEEP. Shoot when the dish shield drops!',jrocket:'COMET: BEEP. Hatch flashes = bolt spray. Blast the bolts!',claw:'COMET: BEEP. Cockpit opens only when its hands are empty!'}[type],l:3.4});if(SPM===6)s.msgs.push({t:{tosser:'COMET: BEEP. Red lane means a big rock is coming. Move!',smasher:'COMET: BEEP. Shoot the flying pieces after the SMASH!',kreel2:'COMET: BEEP. Only the glowing core can be hurt!'}[type],l:3.4});}
function updSpace(dt){const s=sp;if(s.cut){s.cut.t+=dt*(AUTO?3:1);return;}setDims(headI(s));{const h=HEAD[Math.min(2,s.bossI)],k=Math.min(1,dt*(s.phase==='jump'?1.6:6));s.ha+=(h.a-s.ha)*k;s.hr+=(h.r-s.hr)*k;}if(AUTO)autoSpace();if(SPM===6)m6Upd(s,dt);if(SPM===8)m8Upd(s,dt);
 let ax=(I.R?1:0)-(I.L?1:0),ay=(I.D?1:0)-(I.U?1:0);if(!AUTO){const ca=Math.cos(s.ha),sa=Math.sin(s.ha),lx=ax*ca+ay*sa,ly=(-ax*sa+ay*ca)*(Math.cos(s.hr)>=0?1:-1);ax=lx;ay=ly;}
 if(s.phase==='jump'){s.vx+=(SW/2-s.x)*2*dt;s.vy+=(SH/2-s.y)*2*dt;}
 {const n=Math.hypot(ax,ay)||1,k=Math.min(1,dt*(ax||ay?18:26)),tv=360;s.vx+=(ax/n*tv-s.vx)*k;s.vy+=(ay/n*tv-s.vy)*k;}/* snappy: ~0.1s to top speed, quick stop */
 s.x=clamp(s.x+s.vx*dt,40,SW-80);s.y=clamp(s.y+s.vy*dt,30,SH-60);
 if(s.phase==='fly')s.dist=Math.min(STG[Math.min(2,s.bossI)].b,s.dist+(SPM===6?190*(s.boost>0?1.8:1):SPM===8?165:140)*(AUTO?8:1)*dt);
 if(s.phase==='jump'){s.dist+=(s.jumpTo-s.dist)*Math.min(1,dt*1.6)+60*dt;if(s.dist>=s.jumpTo-5){s.dist=s.jumpTo;if(s.bossI>=3){s.phase='arrive';s.endT=0;}else{const ox=s.x-SW/2,oy=s.y-SH/2;s.phase='fly';setDims(headI(s));s.x=SW/2+ox;s.y=SH/2+oy;s.ha=HEAD[s.bossI].a;s.hr=HEAD[s.bossI].r;s.x=clamp(s.x,40,SW-80);s.y=clamp(s.y,30,SH-60);s.banner={t:SPM===3&&s.bossI===2?'HEADING: MARS APPROACH':HEAD[s.bossI].n,l:2.2};startMusic('space',s.bossI);}}}
 if(s.shT>0){s.shT-=dt;if(s.shT<=0)s.shield=0;}s.cool-=dt;s.ccool-=dt;s.inv-=dt;s.pw.spread-=dt;s.pw.rapid-=dt;s.pw.charge-=dt;s.ct-=dt;if(s.ct<=0){s.combo=0;s.mult=1;}
 const si=Math.min(2,s.bossI);
 if(si!==s.sec){s.sec=si;s.cp=STG[si].a;s.banner={t:'STAGE '+(si+1)+': '+STG[si].n,l:2.6};if(si>0){s.msgs.push({t:'CHECKPOINT',l:1.6});saveCP(SPM,s.cp);}s.picks.push({x:SW+20,y:rnd(80,SH-120),k:['shield','rapid','charge'][si]});}
 if(si===2&&s.phase==='fly'&&s.dist>BREATHER&&!s.breathe){s.breathe=true;s.msgs.push({t:'HAYES: Quiet out here... too quiet. Stay sharp.',l:3.5});s.picks.push({x:SW+20,y:SH/2-40,k:'shield'},{x:SW+80,y:SH/2+20,k:'spread'},{x:SW+160,y:70,k:'life'});}
 if(s.factI<FACTS.length&&s.dist>=FACTS[s.factI][0]){s.fact={t:FACTS[s.factI][1],l:7};s.factI++;}if(s.fact&&(s.fact.l-=dt)<=0)s.fact=null;if(s.banner&&(s.banner.l-=dt)<=0)s.banner=null;
 if(I.F&&s.cool<=0&&s.phase!=='arrive'){s.shots.push({x:s.x+28,y:s.y-6,vy:0},{x:s.x+28,y:s.y+8,vy:0});if(s.pw.spread>0)s.shots.push({x:s.x+28,y:s.y,vy:-170},{x:s.x+28,y:s.y,vy:170});s.cool=(s.pw.rapid>0?.09:.18)*(UPG(1)?.75:1);sfx('shot');
  if(s.pw.charge>0&&s.ccool<=0){s.ccool=.9;s.shots.push({x:s.x+34,y:s.y,vy:0,big:1,dmg:4,pierce:1,hs:new Set()});sfx('charge');}}
 if(s.phase==='fly')for(const q of GEMSP)if(!(s.gs||(s.gs={}))[q[0]]&&s.dist>=q[1]&&s.dist<q[1]+400){s.gs[q[0]]=1;if(SPM===8){jyJunk(SW+50,rnd(70,SH-130),6,24,-85,0,AUTO?1:6,{wreck:1,vr:.4,gem:{gi:q[0],old:GEMS[SPM][q[0]]}});s.msgs.push({t:'COMET: BEEP. A glowing wreck! Blast it open for a gem!',l:2.4});}else s.picks.push({x:SW+20,y:q[2]<0?SH+q[2]:q[2],k:'gem',gi:q[0],old:GEMS[SPM][q[0]]});}
 if(s.phase==='fly')for(const w of s.waves)if(!w.go&&s.dist>=w.d){w.go=1;spawnWave(w.p);}
 const rate=SPM===8?[[.85,1.4],[.65,1.1],[.5,.9]][si]:SPM===6?[[.75,1.25],[.5,.95],[.36,.7]][si]:[[1.4,2.4],[1.6,2.6],[.7,1.2]][si];if(s.phase==='fly'&&!(si===2&&s.dist>BREATHER)){s.rt-=dt;if(s.rt<=0){const pr=clamp((s.dist-STG[si].a)/(STG[si].b-STG[si].a),0,1);s.rt=rnd(rate[0],rate[1])*(SPM===6?1-.3*pr:1);SPM===6?m6Rock():SPM===8?m8Rock():spawnRock();}}
 if(s.phase==='fly'&&s.bossI<3&&s.dist>=STG[s.bossI].b)spawnBoss(STG[s.bossI].boss);
 for(const b of s.shots){b.x+=(b.big?600:520)*dt;b.y+=(b.vy||0)*dt;}
 const dmgShot=b=>{if(!b.pierce)b.dead=1;return b.dmg||1;};
 const kill=(f,x,y,pts)=>{f.dead=1;if(f.kind==='taxi'){for(let i=0;i<3;i++)s.foes.push({kind:'zib',pat:'home',age:0,del:i*.12,x:f.x,y:f.y,vx:rnd(-40,60),vy:rnd(-90,90),spd:105,hp:1,life:7,pers:'rookie'});s.pops.push({x,y:y-20,t:'BAIL OUT!',l:.9,comic:1,sz:16});}s.pops.push({x,y:y-4,t:['BLAM!','ZAP!','KRAK!','POW!','FWOOM!'][Math.random()*5|0],l:.7,comic:1,rot:rnd(-.3,.2)});s.killed++;stats.kills++;addCombo(x,y,pts);boomAt(s.booms,x,y);sfx('boom');if(Math.random()<.012)s.picks.push({x,y,k:'life'});else if(Math.random()<.09)s.picks.push({x,y,k:['spread','rapid','shield','charge'][Math.random()*4|0]});};
 for(const f of s.foes){f.age+=dt;if(f.age<f.del){f.x=-999;continue;}foePos(f);if(f.dead)continue;if(f.pers==='ace'){const b=s.shots.find(b=>b.x<f.x&&f.x-b.x<110&&Math.abs(b.y-f.y)<20);if(b)f.dg=(f.dg||0)+(f.y>=b.y?1:-1)*260*dt;f.dg=clamp((f.dg||0)*.97,-60,60);f.y+=f.dg;}if(f.panic>0){f.panic-=dt;f.y+=Math.sin(f.age*38)*4;}if(f.say&&(f.say.l-=dt)<=0)f.say=null;f.hit=(f.hit||0)-dt;f.shHit=(f.shHit||0)-dt;const onS=f.x>-10&&f.x<SW+10;
  if(f.kind==='mine'){f.ft=(f.ft??rnd(1,2.5))-dt;if(f.ft<=0&&onS){f.ft=2.6;for(let a=0;a<6;a++)s.eshots.push({x:f.x,y:f.y,vx:Math.cos(a*1.047+f.age)*120,vy:Math.sin(a*1.047+f.age)*120});}}
  else if(f.kind==='spreader'){f.ft=(f.ft??rnd(.8,1.6))-dt;if(f.ft<=0&&onS){f.ft=2.9;const a=Math.atan2(s.y-f.y,s.x-f.x);for(const k of[-.22,0,.22])s.eshots.push({x:f.x-14,y:f.y,vx:Math.cos(a+k)*135,vy:Math.sin(a+k)*135});}}
  else if(f.kind==='bomber'){f.ft=(f.ft??1.4)-dt;if(f.ft<=0&&onS){f.ft=2.5;s.foes.push({kind:'bubble',pat:'float',age:0,del:0,x:f.x-6,y:f.y+18,hp:1,life:10,pers:'rookie'});sfx('blip');}}
  else if(f.kind==='twin'){if(f.pa+f.pb===1){f.spin=(f.spin||0)+dt*5;f.ft=(f.ft??.3)-dt;if(f.ft<=0&&onS){f.ft=.32;s.eshots.push({x:f.x,y:f.y,vx:Math.cos(f.spin)*120,vy:Math.sin(f.spin)*120});}}else if(onS&&Math.random()<dt*.3){const a=Math.atan2(s.y-f.y,s.x-f.x);s.eshots.push({x:f.x-16,y:f.y,vx:Math.cos(a)*140,vy:Math.sin(a)*140});}}
  else if(f.kind==='muncher'){m6Munch(f,dt);}
  else if(f.kind==='tow'||f.kind==='sneeze'||f.kind==='disg'){m6Alien(f,dt);}
  else if(!['sat','pod','bubble','zib','taxi','sdrone'].includes(f.kind)&&onS&&Math.random()<dt*.25){const a=Math.atan2(s.y-f.y,s.x-f.x);s.eshots.push({x:f.x,y:f.y,vx:Math.cos(a)*145,vy:Math.sin(a)*145});}
  const R={mine:17,sat:22,shield:22,bubble:13,bomber:22,taxi:22,zib:12,sdrone:14,swooper:16,tow:28,sneeze:22,disg:24,muncher:24*(f.sz||1)}[f.kind]||18;
  if(f.kind==='twin')twinHit(f,kill);else if(f.kind==='sdrone'&&f.side<0&&f.mate&&!f.mate.dead&&!f.dead){for(const b of s.shots)if(!b.dead&&Math.abs(b.x-f.x)<14&&b.y>f.y+12&&b.y<f.mate.y-12){b.dead=1;f.shHit=.15;s.pops.push({x:f.x-20,y:(f.y+f.mate.y)/2,t:'BLOCKED',l:.5,c:'#7ae8ff'});}}
  if(f.kind!=='twin')for(const b of s.shots)if(!b.dead&&!f.dead&&(!b.hs||!b.hs.has(f))&&Math.abs(b.x-f.x)<R+(b.big?8:0)&&Math.abs(b.y-f.y)<(b.big?22:15)){if(b.hs)b.hs.add(f);f.hit=.1;sfx('hit');f.panic=.6;f.cloak=0;
   if(f.kind==='shield'&&(f.dir??-1)<0&&!b.big){b.dead=1;f.shHit=.15;s.pops.push({x:f.x-20,y:f.y-14,t:'BLOCKED',l:.5,c:'#7ae8ff'});continue;}
   f.hp-=dmgShot(b);if(f.hp<=0)kill(f,f.x,f.y,f.kind==='muncher'?400:f.kind==='shield'?250:f.kind==='mine'?150:f.kind==='spreader'?200:100);}
  if(!f.dead&&Math.abs(f.x-s.x)<28&&Math.abs(f.y-s.y)<18){hurtShip();kill(f,f.x,f.y,0);}
  if(f.x>30&&f.x<SW)f.seen=1;if(!f.dead&&f.seen&&f.x<-40&&(f.dir??-1)<0&&f.pat!=='behind'&&f.kind!=='bubble'&&f.kind!=='zib'&&f.kind!=='muncher'&&f.kind!=='disg'&&f.kind!=='tow'&&f.kind!=='sneeze'){f.dead=1;breach(f);}if(f.age-f.del>(f.life||18)||f.x<-80)f.dead=1;}
 for(const r of s.rocks){r.x+=r.vx*dt;r.y+=r.vy*dt;r.rot+=r.vr*dt;r.hit=(r.hit||0)-dt;
  if(!r.dead)for(const f of s.foes)if(!f.dead&&f.age>=f.del&&!['sat','tow','sneeze','disg','muncher'].includes(f.kind)&&Math.hypot(f.x-r.x,f.y-r.y)<r.r+14){f.hp-=3;f.hit=.1;r.hp--;if(f.hp<=0){kill(f,f.x,f.y,150);s.pops.push({x:f.x,y:f.y-16,t:'DEBRIS KILL!',l:.9,c:'#5fe36a'});}if(r.hp<=0){r.dead=1;boomAt(s.booms,r.x,r.y,8,'#b8bccc');break;}}
  if(!r.dead&&(SPM===6||SPM===8))for(const b of s.shots){if(b.dead||Math.hypot(b.x-r.x,b.y-r.y)>r.r+7)continue;if(!b.pierce)b.dead=1;r.hp-=dmgShot(b);r.hit=.12;sfx('hit');boomAt(s.booms,b.x,b.y,4,'#ffe6a0');
   if(r.hp<=0){r.dead=1;if(r.gem){s.picks.push({x:r.x,y:r.y,k:'gem',gi:r.gem.gi,old:r.gem.old});s.pops.push({x:r.x,y:r.y-30,t:'GEM INSIDE!',l:.9,comic:1,sz:16,c:'#ff9af0'});}boomAt(s.booms,r.x,r.y,r.r>15?22:12,'#d8c8a8');boomAt(s.booms,r.x,r.y,8,'#ffb03a');sfx(r.r>22?'bigboom':'boom');addCombo(r.x,r.y,r.r>15?60:25);s.pops.push({x:r.x,y:r.y-r.r-6,t:r.r>15?'KA-BLAM!':'KRAK!',l:.7,comic:1,sz:r.r>15?20:15});
    if(r.r>=17){const nr=Math.max(9,Math.round(r.r*.5));for(const d of[-1,1])s.rocks.push({x:r.x,y:r.y+d*r.r*.4,vx:r.vx*.9,vy:d*rnd(70,110),r:nr,hp:nr>12?2:1,rot:rnd(0,6),vr:rnd(-3,3),junk:r.junk,v:r.v,split:1,jk:r.jk!=null?[0,4,5,3,4,5,4][r.jk]:undefined});s.pops.push({x:r.x,y:r.y+r.r+12,t:'SPLIT!',l:.6,c:'#ffe066'});}}break;}
  if(!r.dead&&Math.hypot(r.x-s.x,r.y-s.y)<r.r+14){r.dead=1;hurtShip();boomAt(s.booms,r.x,r.y,8,'#b8bccc');}if(r.x<-40)r.dead=1;}
 for(const q of s.picks){q.x-=(q.k==='ring'?(s.boost>0?260:170):70)*dt;if(UPG(5)&&q.k!=='ring'){const dx=s.x-q.x,dy=s.y-q.y,dd=Math.hypot(dx,dy);if(dd<170&&dd>1){q.x+=dx/dd*260*dt;q.y+=dy/dd*260*dt;}}if(q.k!=='ring'&&Math.hypot(q.x-s.x,q.y-s.y)<26){q.got=1;sfx('power');if(q.k==='life'){LIVES=Math.min(9,LIVES+1);s.msgs.push({t:'1-UP! EXTRA LIFE',l:1.8});sfx('stinger');}else if(q.k==='fshield'){s.shield=UPG(2)?4:3;s.shT=UPG(2)?12:8;}else if(q.k==='gem'){score+=500;gotGem(SPM,q.gi,s.msgs);}else if(q.k==='shield'){s.shield=3;s.msgs.push({t:'SHIELD BUBBLE!',l:1.4});}else{s.pw[q.k]=20;s.msgs.push({t:{rapid:'RAPID FIRE!',spread:'SPREAD SHOT!',charge:'CHARGE SHOT!'}[q.k],l:1.4});}}}s.picks=s.picks.filter(q=>!q.got&&q.x>-20);
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
   s.bossI++;s.cp=STG[s.bossI-1].jump;s.jumpTo=STG[s.bossI-1].jump;s.phase='jump';s.eshots=[];s.banner={t:s.bossI>=3?(SPM===8?'THE CLAW IS SCRAP!':SPM===6?'KREEL\'S ROCK SHIP CRACKS!':SPM===3?'MARS GATE CLEARED!':'KREEL RETREATS!'):(SPM===3?'STATION FREED!':SPM===8?'JUNK BOSS SCRAPPED!':'BOSS DOWN! FULL THRUST!'),l:2.4};s.msgs.push({t:SPM===8?'CLOSER TO JUPITER!':SPM===6?'CLOSER TO VESTA!':SPM===3?'CLOSER TO MARS!':'CLOSER TO THE MOON!',l:2});if(s.bossI<3)saveCP(SPM,s.cp);if(SPM===3){s.cut={type:'refuel',i:s.bossI-1,t:0,b:0};}}}
 if(s.phase==='arrive'){s.endT+=dt;if(s.endT>(AUTO?1.5:3.5)&&!s.done){s.done=1;if(SPM===8)completeMission(8);else shardMoment(SPM,()=>completeMission(SPM));}}
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
function initMoon(){if(mission===9){initSky();return;}SK=null;const G0=GROUND,P=(x,y,w)=>[x,y,w,12],MR=mission===4;
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
 cps:[140,5600,9260,12700].map(x=>({x,on:x===140}))};
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
 if(MR)marsify(m);else reactorSetup(m);if(!MR)m.tips=[[40,'Welcome to the Moon, Captain. The outpost is ahead. The Vorr overran it, so let\'s take it back.'],[300,'Tap JUMP to hop. Up here you\'ll float!'],[560,'Blob minions! Tap FIRE to blast them.'],
  [880,'HOLD JUMP for a high jump. High ledges often hide goodies.'],[1060,'Pink capsules restore energy. Gems hidden in secret spots raise your max energy for good.'],[1290,'Zibbits! Those flappy-eared flyers swoop at you. Shoot them down.'],
  [1690,'See that beacon? It\'s a checkpoint. If you go down, we\'ll rebuild you there.'],[2120,'Pit ahead. Fall in and I\'ll beam you back, but it costs energy.'],[2650,'Moving platforms! Time your jump and ride them across.'],
  [3760,'There\'s the outpost. Those ledges climb high. I bet there\'s a gem piece up top...'],[5520,'Airlock B. Careful inside, the Vorr have been busy in the labs.'],[6100,'Squid gunners fire spreads. Keep moving and jump their shots.'],
  [7060,'Reactor room! It\'s offline, so the shaft door is shut. Flip the 3 switches on the ledges, and dodge the energy bursts.'],[7880,'The drop shaft is low-gravity. Climb up, hop in and steer as you float down.'],
  [9230,'A dark tunnel. The Vorr dug in deep here. Stay near the lights.'],[11300,'Another platform ride in the dark. Steady, Captain.'],[12680,'Big Blorp is in the crater ahead. Top up your energy first!']];
 if(MR)m.boss={whale:1,x:m.arena+W/2,y:G0+80,hp:AUTO?24:150,max:AUTO?24:150,stage:1,state:'under',st:1.5,t:0,tel:0,active:false,face:-1,tanks:[0,1,2,3].map(i=>({x:m.arena+90+i*150,y:G0-30,hp:3}))};else m.boss={x:m.arena+260,y:G0,hp:AUTO?20:110,max:AUTO?20:110,state:'idle',st:2,face:-1,t:0,trip:0,active:false,p2:0,tr:0,jy:0,tel:0,cool:{},marks:[]};m.plats.push(P(m.arena+70,196,96),P(m.arena+272,142,96),P(m.arena+474,196,96));}

// ================= MISSION 4: MARS LANDING (colony robots, leader, Dust Whale) =================
const MSECT4=[[0,'LANDING ZONE'],[1600,'RED CANYON'],[3700,'MOUNTAIN COLONY'],[5480,'COLONY GATE'],[5820,'GREENHOUSE LABS'],[7000,'TUNNEL MOUTH'],[7700,'THE CHIMNEY'],[8700,'CRYSTAL CAVERNS'],[10400,'DRY RIVERBED'],[12650,'WATER CAVERN']];

function marsLayout(m,P){const G0=GROUND,keep=m.plats.filter(q=>q[0]>=3850&&q[0]<5480);
 m.gaps=[[1100,1190],[1900,2010],[2600,2950],[3350,3470],[5000,5080],[9000,9120],[9600,9760],[10700,10830],[11500,11880]];
 m.plats=[P(260,220,100),P(430,170,90),P(600,210,110),P(820,180,90),P(980,130,80),P(1080,210,130),P(1300,220,90),P(1420,150,80),P(1500,75,70),P(1440,-10,90),
  P(1700,200,90),P(1880,140,80),P(2040,200,90),P(2250,220,90),P(2420,190,90),P(2980,210,100),P(3200,170,90),P(3520,220,90),...keep,
  // colony gate + greenhouse labs: Mars-colony layout (airlock steps, tiered planter beds)
  P(5560,215,90),P(5700,150,80),P(5880,230,130),P(6080,180,110),P(6260,125,90),P(6420,200,120),P(6600,150,100),P(6780,215,120),
  // UNDERGROUND: tunnel mouth
  P(7300,220,90),P(7470,155,80),
  // the Chimney: zig-zag climb, then float down the shaft
  P(7720,220,90),P(7860,140,80),P(7720,60,80),P(7860,-20,80),P(7720,-100,80),P(7880,-180,100),P(8040,-200,150),
  // crystal caverns
  P(8850,210,90),P(9200,190,90),P(9350,120,80),P(9450,50,70),P(9900,220,100),P(10100,160,90),
  // dry riverbed
  P(10600,210,90),P(10900,200,90),P(11100,140,90),P(11250,70,80),P(11950,220,100),P(12150,170,100),P(12400,120,90),P(12900,220,100),P(13150,180,100)];
 m.walls=[[700,G0-60,40,60],[1600,G0-110,100,110],[2150,G0-120,110,120],[4700,G0-60,40,60],[6450,G0-50,40,50],[7150,G0-50,50,50],[8200,-200,300,500],[10300,-400,120,700],[2400,G0-45,60,45],[4860,G0-40,50,40],[5060,G0-40,50,40],[5190,G0-40,50,40]];
 m.movers=[{x0:2610,y0:250,dx:250,dy:0,w:90,sp:.55,ph:0},{x0:3345,y0:230,dx:60,dy:0,w:80,sp:.8,ph:1},{x0:9610,y0:240,dx:100,dy:0,w:80,sp:.7,ph:0},{x0:11510,y0:240,dx:280,dy:0,w:90,sp:.5,ph:2}];
 m.craters=[[520,70],[1250,80],[2300,60],[3100,80],[4550,70],[12700,90],[13300,80]];
 m.lowg=[[8505,8840]];m.dark=[7000,12650];m.lamps=[];for(let x=7100;x<12650;x+=300)m.lamps.push(x);
 m.cps=[140,1700,3750,5600,7050,8800,9300,10500,12700].map(x=>({x,on:x===140}));
 m.picks=m.picks.filter(p=>p.k==='gem'||p.x<7000);
 m.picks.push({x:7320,y:190,k:'hp'},{x:8900,y:180,k:'hp'},{x:10120,y:130,k:'hp'},{x:11960,y:190,k:'hp'},{x:12920,y:190,k:'hp'},
  {x:7500,y:125,k:'water'},{x:8640,y:40,k:"water"},{x:9480,y:18,k:'water'});
 for(const x of[7420,8950,9950,10550,11300,12050])m.foes.push({x,y:G0,vx:0,t:rnd(0,9),hp:3,face:-1,mode:'walk',mt:rnd(1,3),flee:false,bot:1});}
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


function colonyInt(a,b,top,kind,cx){const G0=GROUND,A=a-cx,B=b-cx;if(B<0||A>W)return;const h=G0-top,AIR=kind==='air';
 g.fillStyle=lg(g,0,top,0,G0,AIR?['#5a2418','#3a160e','#24100a']:['#6a3420','#4a2214','#2a140c']);g.fillRect(A,top,B-A,h);
 // rounded rock-cut arches
 for(let x=a+40;x<b;x+=170){const X=x-cx;if(X<-90||X>W+90)continue;g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.arc(X,G0,78,Math.PI,TAU);g.stroke();g.strokeStyle=AIR?'#c8643a':'#d07a4a';g.lineWidth=4;g.beginPath();g.arc(X,G0,78,Math.PI,TAU);g.stroke();}
 if(AIR){for(let x=A;x<B;x+=40){g.fillStyle='#ffc53d';g.beginPath();g.moveTo(x,top);g.lineTo(x+20,top);g.lineTo(x+10,top+14);g.closePath();g.fill();}
  for(const ox of[a+120,b-110]){const X=ox-cx;circ(X,G0-150,26,OL);circ(X,G0-150,22,'#2a1a3a');circ(X,G0-150,22,'rgba(255,140,90,.25)');circ(X-7,G0-157,5,'rgba(255,255,255,.4)');}
  const on=(T*2|0)%2;circ((a+b)/2-cx,top+26,7,OL);circ((a+b)/2-cx,top+26,5,on?'#ff3a3a':'#601010');if(on)dglow((a+b)/2-cx,top+26,16,'#ff3a3a',.6);
  panel((a+b)/2-cx-40,G0-125,80,18,'#ff7a29');txt('AIRLOCK',(a+b)/2-cx,G0-116,8,'#ffc53d');}
 else{for(let x=a+90;x<b;x+=170){const X=x-cx;if(X<-60||X>W+60)continue;g.fillStyle=OL;g.beginPath();g.ellipse(X,top+40,44,26,0,0,TAU);g.fill();g.fillStyle=lg(g,0,top+14,0,top+66,['#ffd8a0','#ff9a5a']);g.beginPath();g.ellipse(X,top+40,40,22,0,0,TAU);g.fill();dglow(X,top+40,50,'#ffb070',.25);}
  for(let x=a+20;x<b;x+=110){const X=x-cx;if(X<-60||X>W+60)continue;g.fillStyle=OL;g.beginPath();g.roundRect(X-30,G0-34,60,34,8);g.fill();g.fillStyle='#8a4a2a';g.beginPath();g.roundRect(X-27,G0-31,54,30,6);g.fill();
   const wet=M.ldr;for(let k=0;k<3;k++){const px=X-16+k*16;g.fillStyle=wet?'#5fc040':'#8a7a3a';g.beginPath();g.ellipse(px,G0-38,7,11,wet?0:.6,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=1.5;g.stroke();}}}
 g.fillStyle=OL;g.fillRect(A,top-6,B-A,8);}
function waterDrop(x,y){dglow(x,y,20,'#7ae8ff',.8);g.fillStyle=OL;g.beginPath();g.moveTo(x,y-14);g.quadraticCurveTo(x+12,y+2,x,y+11);g.quadraticCurveTo(x-12,y+2,x,y-14);g.fill();g.fillStyle=lg(g,0,y-12,0,y+10,['#e8ffff','#7ae8ff','#2a8ad0']);g.beginPath();g.moveTo(x,y-11);g.quadraticCurveTo(x+9,y+2,x,y+8.5);g.quadraticCurveTo(x-9,y+2,x,y-11);g.fill();circ(x-3,y,2,'#ffffff');}
// Underground art: rounded stalactites/stalagmites, amber crystal clusters, glow-bugs (light sources), the Chimney rock column, dry riverbed
function caveArt(cx){const G0=GROUND,m=M,[da,db]=m.dark;
 for(let x=Math.floor((da+cx-da)/90)*90;x<cx+W+90;x+=90){if(x<da||x>db)continue;const X=x-cx,h=30+((x*13)%50);g.fillStyle='#2a0e0a';g.beginPath();g.moveTo(X-22,-60);g.quadraticCurveTo(X-10,-60+h,X,-50+h+16);g.quadraticCurveTo(X+10,-60+h,X+22,-60);g.fill();g.fillStyle='rgba(255,170,100,.18)';g.beginPath();g.ellipse(X-6,-50+h*.6,3,h*.3,0,0,TAU);g.fill();}
 for(let x=da+140;x<db;x+=230){const X=x-cx;if(X<-40||X>W+40)continue;const big=(x/230|0)%2;for(let k=0;k<(big?3:2);k++){const px=X+k*12-8,ph=16+k*7;g.fillStyle=OL;g.beginPath();g.moveTo(px-7,G0);g.lineTo(px,G0-ph-3);g.lineTo(px+7,G0);g.fill();g.fillStyle=k%2?'#ffb040':'#ffd27a';g.beginPath();g.moveTo(px-4.5,G0);g.lineTo(px,G0-ph);g.lineTo(px+4.5,G0);g.fill();}dglow(X,G0-14,22,'#ffb040',.35);}
 for(const lx of m.lamps){const X=lx-cx;if(X<-30||X>W+30)continue;const by=G0-114+Math.sin(T*2+lx)*5,bx=X+Math.cos(T*1.3+lx)*6;dglow(bx,by,30,'#d0ff7a',.8);circ(bx,by,6,OL);circ(bx,by,4.6,'#eaff9a');for(const d of[-1,1]){g.fillStyle='rgba(220,255,240,.7)';g.beginPath();g.ellipse(bx+d*6,by-4,5,2.6,d*(.5+Math.sin(T*30)*.4),0,TAU);g.fill();}circ(bx-1.5,by-1,1.2,OL);circ(bx+1.5,by-1,1.2,OL);}

 for(const[a,b]of[[10400,12650]]){const A=a-cx,B=b-cx;if(B<0||A>W)continue;g.fillStyle='rgba(120,70,40,.5)';for(let x=Math.max(A,-20);x<Math.min(B,W+20);x+=46){g.beginPath();g.ellipse(x,G0+3,20,4,0,0,TAU);g.fill();}}}
function marsify(m){const G0=GROUND;
 // a small, spaced-out cast: one robot type at a time, each introduced on its own
 m.foes=m.foes.filter(f=>(f.type==='bug'&&[1300,3400,9700].includes(f.x))||(f.type==='squid'&&f.x===11600));
 const W0=(x,rt,o={})=>m.foes.push({x,y:G0,x0:x,vx:0,t:rnd(0,9),hp:rt==='hover'||rt==='spray'?3:2,face:-1,mode:'walk',mt:rnd(1,3),flee:false,bot:1,rt,dir:1,ph:0,pt:0,...o});
 W0(620);W0(1250);W0(3150,'scoot');W0(3950,'drill');W0(4400);W0(6000,'spray');W0(6700,'hover',{y:G0-115});W0(7420,'shield');W0(8950,'plug');W0(9850,'drill');W0(10230,'charge');W0(12950,'scoot');
 for(const f of m.foes)if(f.rt===undefined&&f.bot){f.rt=null;}
 m.seen={};m.valves=[[9240,190,0],[10150,160,0]];m.cart={x0:10420,x1:11470,on:0,done:0};m.cartRocks=[10620,10900,11200];m.cg=[11880,11880];m.gaps.push(m.cg);m.chase=0;
 m.bounce=[8570,8710];m.storm=0;m.lightT=0;m.spot=0;
 m.gates=[[1600,'A'],[4700,'B']];
 // gem pieces moved to new hiding spots for Mars
 const gp=[[1480,-50],[4330,-250],[8110,-232],[11285,40],[12445,90]];let gi=0;for(const p of m.picks)if(p.k==='gem'){p.gi=gi;[p.x,p.y]=gp[gi];gi++;}
 m.tips=[[40,'Mars, Captain. The colony is built right into that mountain. Something down there has gone very quiet.'],[300,'Same moves as the Moon: JUMP to hop, hold it to go higher.'],
  [560,'That\'s a colony robot with a Vorr crystal stuck on it! Zap it to set it free.'],[1290,'Zibbits again. Malakar sent his flyers ahead.'],
  [1700,'Checkpoint beacon. The colony built these too.'],[2030,'Sandstorm! When a gust is coming, hide on the left side of a big rock.'],[2650,'Moving platforms. Ride them across the canyon.'],
  [3760,'The colony entrance. Keep your eyes open for gem pieces. And for that Crystal Key.'],[4740,'A Vorr searchlight! Move when the beam is away. Hide right next to a rock.'],[5300,'The colony gate. The leader robot should be just inside.'],
  [7060,'The tunnel mouth. The colony dug down here looking for water. Mind the glow-bugs, they light the way.'],[7700,'The Chimney! Climb the ledges to the top, hop over the rock, then float down slowly.'],
  [8520,'Bouncy spore pads! In low gravity they send you sky high.'],[8800,'Crystal caverns. Look for the two water valves.'],[9300,'Psst! Water pockets hide in high nooks. Find all 3 for PIP-7.'],[10400,'A mine cart! Hop in and JUMP over the boulders on the track.'],[11500,'An old riverbed. The Dust Whale drank it bone dry.'],[11880,'The floor is cracking! RUN!'],[12680,'The water cavern. Get ready, Captain!']];}


// ===== Moon reactor room: 3 switches power the reactor and open the shaft door
function reactorSetup(m){const G0=GROUND;m.rx={x:7440,y:64,sw:[[7350,150,0],[7600,60,0],[7745,170,0]],on:0,t:0,tel:0,n:0};m.plats.push([7560,60,80,12]);
 m.walls.push([7850,-130,44,430,'door']);m.foes=m.foes.filter(f=>f.x<7000||f.x>7880);
 for(const x of[7250,7650])m.foes.push({x,y:G0,vx:0,t:rnd(0,9),hp:3,face:-1,mode:'walk',mt:rnd(1,3),flee:false});}
function reactorUpd(m,dt){const r=m.rx;if(!r||r.on)return;
 for(const s of r.sw)if(!s[2]&&Math.abs(m.px-s[0])<20&&Math.abs(m.py-s[1])<26){s[2]=1;r.n++;sfx('power');SHAKE=.15;boomAt(m.booms,s[0],s[1]-20,12,'#45d6ff');CFX(s[0],s[1]-44,'KA-CHUNK!',16);
  if(r.n<3){m.msgs.push({t:'SWITCH '+r.n+'/3 · RING POWERED',l:1.8});}else{r.on=1;r.flash=1.2;const i=m.walls.findIndex(w=>w[4]==='door');if(i>=0)m.walls.splice(i,1);sfx('stinger');SHAKE=.35;
   m.msgs.push({t:'REACTOR ONLINE!',l:2.6});boomAt(m.booms,r.x,r.y,26,'#7ae8ff');m.tip={t:'Reactor\'s back! The shaft door is open. Go, Captain!',l:5};}}
 if(m.px<7000||m.px>7880)return;r.t+=dt;
 if(!r.tel&&r.t>3.2){r.tel=.9;r.t=0;}
 if(r.tel){r.tel-=dt;if(r.tel<=0){r.tel=0;r.k=(r.k||0)+1;const n=8,off=r.k%2?Math.PI/8:0;for(let i=0;i<n;i++){const a=off+i*TAU/n;m.eshots.push({x:r.x+Math.cos(a)*60,y:r.y+Math.sin(a)*60,vx:Math.cos(a)*115,vy:Math.sin(a)*115,big:1,ener:1});}sfx('boom');CFX(r.x,r.y-80,'VWOOM!',18);}}}
function reactorDraw(cx){const m=M,r=m.rx;if(!r)return;const X=r.x-cx,Y=r.y;if(X<-200||X>W+200)return;
 if(r.flash){r.flash=Math.max(0,r.flash-DT);dglow(X,Y,200,'#bff8ff',r.flash*.6);}
 for(let i=0;i<3;i++){const a0=-Math.PI/2+i*TAU/3+.06,a1=a0+TAU/3-.12,on=r.on||i<r.n;g.strokeStyle=OL;g.lineWidth=16;g.beginPath();g.arc(X,Y,64,a0,a1);g.stroke();g.strokeStyle=on?'#7ae8ff':'#2a3050';g.lineWidth=10;g.beginPath();g.arc(X,Y,64,a0,a1);g.stroke();if(on){g.save();g.shadowColor='#7ae8ff';g.shadowBlur=18;g.strokeStyle='#e8ffff';g.lineWidth=3;g.beginPath();g.arc(X,Y,64,a0,a1);g.stroke();g.restore();}}
 const pu=r.on?.9+Math.sin(T*6)*.1:r.tel?1:.35;circ(X,Y,30,OL);dglow(X,Y,40+pu*30,r.tel?'#ff4f7b':'#45d6ff',.7*pu);circ(X,Y,26,r.tel?'#ff8aa8':r.on?'#bff8ff':'#3a4a7a');if(r.tel&&(T*10|0)%2)sfxText('!',X,Y+2,26,.3,0,'#ffe14d','#ff3a3a');
 for(const s of r.sw){const sx=s[0]-cx,sy=s[1];g.fillStyle=OL;g.beginPath();g.roundRect(sx-13,sy-26,26,26,6);g.fill();g.fillStyle=s[2]?'#3fae5a':'#7a3040';g.beginPath();g.roundRect(sx-10,sy-23,20,20,4);g.fill();
  g.save();g.translate(sx,sy-13);g.rotate(s[2]?.7:-.7);g.fillStyle=OL;g.fillRect(-3,-14,6,14);circ(0,-15,5.5,OL);circ(0,-15,4,s[2]?'#5fe36a':'#ff4f7b');g.restore();if(!s[2])dglow(sx,sy-14,18,'#ffe066',.3+.25*Math.sin(T*5));}
 const dw=m.walls.find(w=>w[4]==='door');if(dw){const dx=dw[0]-cx;g.fillStyle=OL;g.fillRect(dx-3,dw[1],dw[2]+6,dw[3]);g.fillStyle=lg(g,dx,0,dx+dw[2],0,['#5a6088','#3a3f60']);g.fillRect(dx,dw[1]+3,dw[2],dw[3]-3);
  for(let y=dw[1]+20;y<GROUND;y+=40){g.fillStyle='#ffc53d';g.fillRect(dx+4,y,dw[2]-8,8);g.fillStyle=OL;for(let k=0;k<dw[2]-8;k+=10)g.fillRect(dx+4+k,y,5,8);}
  circ(dx+dw[2]/2,GROUND-160,7,OL);circ(dx+dw[2]/2,GROUND-160,5,(T*3|0)%2?'#ff4f7b':'#601020');}}
// ===== Mars variety: robot types and set pieces =====
const BHINT={scoot:'Scooter bot! It zips back and forth. JUMP on it to knock the Vorr rider off.',drill:'The floor is shaking! A drill bot pops up. Zap it while it is out.',
 hover:'A hover bot drops junk. Watch its shadow, then jump and zap it.',shield:'Shield bot! Shots bounce off the front. Jump over it and zap it from behind.',
 spray:'Sprinkler bot! Dodge the water, then zap it between sprays.',charge:'Crystal armor! HOLD FIRE to charge a big blast, then let go.',plug:'See the plug on its back? Sneak behind it and grab the plug.'};
function CFX(x,y,t,sz=16){(M.cfx||(M.cfx=[])).push({x,y,t,l:.8,rot:rnd(-.2,.2),sz});}
function botT(f,m,dt,d,dist){f.hit=(f.hit||0)-dt;const G0=GROUND;
 if(!m.seen[f.rt]&&dist<300&&Math.abs(m.py-f.y)<260){m.seen[f.rt]=1;m.tip={t:BHINT[f.rt],l:6};}
 if(dist>W)return;let H2=60,vuln=true,touch=true;
 const stomp=m.vy>60&&Math.abs(m.px-f.x)<28&&m.py>f.y-H2-22&&m.py<f.y-H2+16;
 const pingAll=()=>{for(const b of m.shots)if(!b.dead&&Math.abs(b.x-f.x)<26&&b.y>f.y-H2&&b.y<f.y+4){b.dead=1;CFX(f.x,f.y-H2-6,'PING!',13);sfx('hit');}};
 const shotHit=(ok,need)=>{for(const b of m.shots)if(!b.dead&&Math.abs(b.x-f.x)<26&&b.y>f.y-H2&&b.y<f.y+4){b.dead=1;if(ok(b)){f.hp-=b.big?3:1;f.hit=.12;sfx('hit');if(f.hp<=0){freeBot(f);return 1;}}else{CFX(f.x,f.y-H2-6,need||'CLANG!',13);sfx('hit');}}return 0;};
 const bounce=()=>{m.vy=-280;m.py=f.y-H2-2;sfx('jump');CFX(f.x,f.y-H2-10,'BOING!',14);};
 if(f.rt==='scoot'){H2=50;f.x+=f.dir*170*dt;if(Math.abs(f.x-f.x0)>130){f.dir=-Math.sign(f.x-f.x0);f.x=f.x0+Math.sign(f.x-f.x0)*130;}f.face=f.dir;
  if(stomp){bounce();CFX(f.x,f.y-80,'BONK!',18);freeBot(f);return;}pingAll();}
 else if(f.rt==='drill'){f.pt-=dt;if(f.ph===0){vuln=touch=false;if(dist<150){f.ph=1;f.pt=.8;}}else if(f.ph===1){vuln=touch=false;if(f.pt<=0){f.ph=2;f.pt=1.8;sfx('boom');CFX(f.x,G0-70,'BRRRZT!',15);}}
  else if(f.ph===2){if(f.pt<=0){f.ph=3;f.pt=1.5;}}else{vuln=touch=false;if(f.pt<=0)f.ph=0;}
  if(f.ph===2){if(stomp){bounce();freeBot(f);return;}if(shotHit(()=>1))return;}}
 else if(f.rt==='hover'){f.y=G0-115+Math.sin(f.t*2)*6;H2=40;const tx=clamp(m.px,f.x0-200,f.x0+200);f.x+=clamp(tx-f.x,-60*dt,60*dt);f.face=Math.sign(d)||1;f.pt-=dt;
  if(dist<170&&f.pt<=0&&!f.tel){f.tel=.7;}if(f.tel){f.tel-=dt;if(f.tel<=0){f.tel=0;f.pt=2.4;m.eshots.push({x:f.x,y:f.y+4,vx:0,vy:30,g:1,junk:1});sfx('warn');}}
  const st=m.vy>60&&Math.abs(m.px-f.x)<26&&m.py>f.y-30&&m.py<f.y+6;if(st){m.vy=-260;freeBot(f);return;}
  for(const b of m.shots)if(!b.dead&&Math.abs(b.x-f.x)<24&&Math.abs(b.y-(f.y-18))<24){b.dead=1;f.hp-=b.big?3:1;f.hit=.12;sfx('hit');if(f.hp<=0){freeBot(f);return;}}
  if(Math.abs(f.x-m.px)<22&&Math.abs((f.y-18)-(m.py-24))<26)hurt(f.x);return;}
 else if(f.rt==='shield'){const want=Math.sign(d)||1;if(want!==f.face){f.tt=(f.tt||0)+dt;if(f.tt>1.2){f.face=want;f.tt=0;}}else f.tt=0;f.x+=f.face*30*dt;f.x=clamp(f.x,f.x0-120,f.x0+120);
  if(stomp){bounce();return;}if(shotHit(b=>Math.sign(b.vx)===f.face,'CLANG!'))return;}
 else if(f.rt==='spray'){f.pt-=dt;f.face=Math.sign(d)||1;if(f.pt<=0&&dist<320){f.pt=2.8;f.spr=.5;sfx('pick');for(const v of[-200,-120,-60,60,120,200])m.eshots.push({x:f.x,y:f.y-62,vx:v,vy:-250,g:1,water:1});CFX(f.x,f.y-90,'SPLISH!',14);}
  if(f.spr)f.spr=Math.max(0,f.spr-dt);if(stomp){bounce();freeBot(f);return;}if(shotHit(()=>1))return;}
 else if(f.rt==='charge'){if(dist<300){f.face=Math.sign(d)||1;f.x+=f.face*32*dt;}f.x=clamp(f.x,f.x0-140,f.x0+60);if(stomp){bounce();return;}if(shotHit(b=>b.big,'TOO TOUGH!'))return;}
 else if(f.rt==='plug'){f.x+=f.face*40*dt;if(Math.abs(f.x-f.x0)>100){f.face=-Math.sign(f.x-f.x0);f.x=f.x0+Math.sign(f.x-f.x0)*100;}
  const px2=f.x-f.face*24;if(Math.abs(m.px-px2)<18&&Math.sign(m.px-f.x)===-f.face&&m.py>f.y-50){CFX(f.x,f.y-80,'UNPLUGGED!',16);freeBot(f);return;}
  if(stomp){bounce();return;}pingAll();if(Math.sign(m.px-f.x)===-f.face)touch=false;}
 if(touch&&!f.freed&&Math.abs(f.x-m.px)<26&&Math.abs(f.y-m.py)<36)hurt(f.x);}
function drawBotT(f,x){const y=f.y-(f.freed&&f.jy?Math.abs(Math.sin(f.t*7))*14:0),fr=f.freed,t=f.t,o={freed:fr,flash:f.hit>0};
 if(f.rt==='scoot'){if(!fr){g.strokeStyle='rgba(255,220,160,.5)';g.lineWidth=2;for(let i=0;i<3;i++){g.beginPath();g.moveTo(x-f.face*(30+i*8),y-14-i*9);g.lineTo(x-f.face*(56+i*8),y-14-i*9);g.stroke();}}
  g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(x,y+2,30,5,0,0,TAU);g.fill();g.fillStyle=OL;g.beginPath();g.ellipse(x,y-8,32,10,0,0,TAU);g.fill();g.fillStyle=lg(g,0,y-16,0,y,['#ffd27a','#e0802a']);g.beginPath();g.ellipse(x,y-9,29,7.5,0,0,TAU);g.fill();
  dglow(x-f.face*26,y-6,10,'#7ae8ff',.8);g.save();g.translate(x,y-12);g.scale(.85,.85);colonyBot(0,0,t,f.face,o);g.restore();
  if(!fr){g.save();g.translate(x-f.face*4,y-76);g.scale(.6,.6);blob(0,0,T*2,{r:16,face:f.face,angry:1,col:'#b04aff'});g.restore();}return;}
 if(f.rt==='drill'){const up=fr?1:f.ph===2?1:f.ph===1?0:f.ph===3?clamp(f.pt/1.5,0,1)*0+0:0;const sh=f.ph===1?Math.sin(T*60)*2:0;
  g.fillStyle=OL;g.beginPath();g.ellipse(x+sh,GROUND,34,10,0,Math.PI,TAU);g.fill();g.fillStyle='#8a3a22';g.beginPath();g.ellipse(x+sh,GROUND,30,7,0,Math.PI,TAU);g.fill();
  if(f.ph===1){for(let i=0;i<4;i++)circ(x+rnd(-24,24),GROUND-4-rnd(0,10),2.5,'#c8643a');sfxText('!',x,GROUND-40,20,.3,0);}
  if(up||fr){g.save();g.beginPath();g.rect(x-60,y-120,120,120-(fr?0:2));g.clip();colonyBot(x,y,t,f.face,o);if(!fr){g.save();g.translate(x,y-84);g.rotate(T*12);for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillStyle=OL;g.fillRect(-3,-15,6,8);}circ(0,0,11,OL);circ(0,0,9,'#c8ccd8');circ(0,0,3,OL);g.restore();}g.restore();}return;}
 if(f.rt==='hover'){if(!fr){const a=f.tel?.6:.25;g.fillStyle=`rgba(255,60,60,${a})`;g.beginPath();g.ellipse(x,GROUND+1,24,5,0,0,TAU);g.fill();dglow(x,y+4,14,'#7ae8ff',.7);
   g.save();g.translate(x,y);g.scale(.8,.8);colonyBot(0,0,t,f.face,o);g.restore();g.fillStyle=OL;g.beginPath();g.ellipse(x,y-70,26*Math.abs(Math.cos(T*20))+6,5,0,0,TAU);g.fill();circ(x,y-66,4,OL);}
  else colonyBot(x,y,t,f.face,o);return;}
 colonyBot(x,y,t,f.face,o);if(fr)return;
 if(f.rt==='shield'){const sx=x+f.face*20;g.fillStyle=OL;g.beginPath();g.ellipse(sx,y-36,10,27,0,0,TAU);g.fill();g.fillStyle=lg(g,sx-8,0,sx+8,0,['#ffe9a0','#c08a2a']);g.beginPath();g.ellipse(sx,y-36,7.5,24,0,0,TAU);g.fill();circ(sx,y-36,3.5,'#b04aff');}
 if(f.rt==='spray'){g.save();g.translate(x,y-72);g.rotate(T*(f.spr?20:4));for(let i=0;i<3;i++){g.rotate(TAU/3);circ(9,0,4.5,OL);circ(9,0,3.2,'#45b8ff');}g.restore();circ(x,y-72,5,OL);circ(x,y-72,3.5,'#7ae8ff');g.fillStyle='rgba(69,184,255,.6)';g.beginPath();g.ellipse(x,y-28,10,8,0,0,TAU);g.fill();}
 if(f.rt==='charge'){g.fillStyle=OL;g.beginPath();g.roundRect(x-20,y-48,40,28,8);g.fill();g.fillStyle=lg(g,0,y-48,0,y-20,['#d0a0ff','#6a2aa0']);g.beginPath();g.roundRect(x-17,y-45,34,22,6);g.fill();dglow(x,y-34,14,'#d070ff',.5+.3*Math.sin(T*5));
  g.fillStyle=OL;g.beginPath();g.moveTo(x,y-44);g.lineTo(x+7,y-34);g.lineTo(x,y-24);g.lineTo(x-7,y-34);g.fill();g.fillStyle='#f0c0ff';g.beginPath();g.moveTo(x,y-41);g.lineTo(x+4.5,y-34);g.lineTo(x,y-27);g.lineTo(x-4.5,y-34);g.fill();}
 if(f.rt==='plug'){const bx=x-f.face*16;g.strokeStyle=OL;g.lineWidth=3;g.beginPath();for(let i=0;i<=12;i++){const u=i/12;g.lineTo(bx-f.face*u*10+Math.cos(u*TAU*2)*4,y-36+u*10+Math.sin(u*TAU*2)*4);}g.stroke();g.strokeStyle='#ffd27a';g.lineWidth=1.5;g.stroke();
  const px=x-f.face*26,py=y-24+Math.sin(T*3)*2;dglow(px,py,10,'#ffe066',.6);circ(px,py,7,OL);circ(px,py,5.5,'#ffc53d');g.fillStyle=OL;g.fillRect(px-f.face*6-1.5,py-4,3,3);g.fillRect(px-f.face*6-1.5,py+1,3,3);}}
function junkDraw(e,cx){const X=e.x-cx;if(e.water){dglow(X,e.y,10,'#7ae8ff',.7);circ(X,e.y,5,OL);circ(X,e.y,3.8,'#7ae8ff');circ(X-1.3,e.y-1.3,1.2,'#fff');return;}
 g.save();g.translate(X,e.y);g.rotate(T*6);g.fillStyle=OL;for(let i=0;i<6;i++){g.rotate(TAU/6);g.fillRect(-2.5,-11,5,5);}circ(0,0,9,OL);circ(0,0,7,'#9aa4c4');circ(0,0,3,OL);g.restore();}
function beamX(m){if(m.cg&&m.safe>m.cg[0]-20&&m.safe<m.cg[1]+80){m.cg[1]=m.cg[0];m.chase=0;return m.cg[0]-40;}if(m.cart&&m.cart.on){m.cart.on=0;return m.cart.x0-30;}return m.safe;}
function marsSet(m,dt){const G0=GROUND,px=m.px;
 // sandstorm (wind blows from the right; hide on a rock's left side)
 if(px>2020&&px<2560){m.storm+=dt;const ph=m.storm%5.4;m.gustW=ph>3&&ph<3.9;m.gust=ph>=3.9;
  if(m.gustW&&!m.gwMsg){m.gwMsg=1;m.msgs=m.msgs.filter(q=>q.t!=='GUST INCOMING! HIDE!');m.msgs.push({t:'GUST INCOMING! HIDE!',l:1});sfx('warn');}
  if(m.gust){m.gwMsg=0;const sh=m.walls.some(w=>w[0]>px&&w[0]-px<72&&m.py>w[1]-4);m.shelter=sh;if(!sh){m.px=Math.max(2030,m.px-120*dt);m.gexp=(m.gexp||0)+dt;if(m.gexp>.6){m.gexp=-9;hurt(px+40);}}}else m.gexp=0;}else{m.gust=m.gustW=0;}
 // Vorr searchlight
 if(px>4740&&px<5280){m.lightT+=dt;const bx=5000+Math.sin(m.lightT*.9)*240;m.beamX=bx;m.spot=Math.max(0,m.spot-dt);
  const hid=m.on&&[4860,5060,5190].some(c=>Math.abs(px-(c+25))<48);m.hid=hid;if(!hid&&Math.abs(px-bx)<38&&m.spot<=0){m.spot=1.6;m.msgs.push({t:'SPOTTED!',l:1.2});sfx('warn');m.eshots.push({x:5000,y:G0-170,vx:(px-5000)/1.1,vy:60,big:1});CFX(px,m.py-70,'ALARM!',18);}}
 // bouncy spore pads in the low-gravity shaft
 for(const b of m.bounce)if(m.on&&m.py>=G0-1&&Math.abs(px-b)<22){m.vy=-300;m.on=false;sfx('jump');CFX(b,G0-30,'BOING!',16);}
 // water valves open the boulder door
 if(m.valves){for(const v of m.valves)if(!v[2]&&Math.abs(px-v[0])<22&&Math.abs(m.py-v[1])<30){v[2]=1;sfx('power');const n=m.valves.filter(q=>q[2]).length;m.msgs.push({t:'VALVE TURNED! '+n+'/2',l:1.6});CFX(v[0],v[1]-40,'SQUEAK!',15);
   if(n===2){const wi=m.walls.findIndex(w=>w[0]===10300);if(wi>=0)m.walls.splice(wi,1);m.doorT=1.5;m.msgs.push({t:'WHOOSH! THE WATER PUSHED THE BOULDER AWAY!',l:2.6});boomAt(m.booms,10360,G0-80,22,'#7ae8ff');SHAKE=.3;}}
  if(m.doorT)m.doorT=Math.max(0,m.doorT-dt);
  if(!m.vdHint&&px>10200&&m.walls.some(w=>w[0]===10300)){m.vdHint=1;m.tip={t:'The boulder will not budge. Turn BOTH water valves to wash it away!',l:6};}}
 // mine cart
 const c=m.cart;if(c&&!c.done){if(!c.on&&m.on&&Math.abs(px-c.x0)<26){c.on=1;sfx('power');m.msgs.push({t:'ALL ABOARD!',l:1.4});}
  if(c.on){if(m.py>=G0-1){m.py=G0;m.vy=Math.min(m.vy,0);m.on=true;}for(const r of m.cartRocks)if(Math.abs(px-r)<22&&m.py>G0-28&&m.inv<=0){hurt(px+30);m.vx=0;m.vy=-160;}
   if(px>=c.x1){c.on=0;c.done=1;m.msgs.push({t:'END OF THE LINE!',l:1.4});m.safe=px+20;}}}
 // collapsing floor chase
 if(m.cg){if(!m.chase&&px>11950&&m.cg[1]<12600){m.chase=1;sfx('warn');CFX(px,m.py-80,'CRRRACK!',20);}if(m.chase){m.cg[1]=Math.min(12620,m.cg[1]+105*dt);SHAKE=Math.max(SHAKE,.06);if(m.cg[1]>=12620)m.chase=0;}}}
function marsSetDraw(cx,post){const m=M,G0=GROUND;
 if(!post){// rails, cart, boulders, valves, spore pads, crates' searchlight drone
  const c=m.cart;if(c){const a=c.x0-20-cx,b=c.x1+20-cx;if(b>0&&a<W){g.fillStyle='#5a2a1a';for(let x=Math.ceil((c.x0-20)/24)*24;x<c.x1+20;x+=24){const X=x-cx;if(X<-20||X>W+20)continue;g.fillStyle=OL;g.fillRect(X-2,G0-4,16,7);g.fillStyle='#8a5a3a';g.fillRect(X-1,G0-3,14,5);}
    for(const q of m.gaps)if(q[1]>c.x0&&q[0]<c.x1){for(let x=q[0];x<q[1];x+=30){const X=x-cx;g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.moveTo(X,G0);g.lineTo(X+15,G0+40);g.lineTo(X+30,G0);g.stroke();g.strokeStyle='#8a5a3a';g.lineWidth=2;g.stroke();}}
    g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.moveTo(a,G0-5);g.lineTo(b,G0-5);g.stroke();g.strokeStyle='#c8ccd8';g.lineWidth=2;g.stroke();
    for(const r of m.cartRocks){const X=r-cx;if(X<-30||X>W+30)continue;circ(X,G0-12,15,OL);g.fillStyle=ballG(g,X,G0-12,13,13,'#b0583a');g.beginPath();g.arc(X,G0-12,13,0,TAU);g.fill();}
    if(!c.on){const X=(c.done?c.x1:c.x0)-cx;cartSpr(X,G0);}}}
  if(m.valves)for(const v of m.valves){const X=v[0]-cx;if(X<-30||X>W+30)continue;g.save();g.translate(X,v[1]-18);g.rotate(v[2]?T*3:0);g.strokeStyle=OL;g.lineWidth=6;g.beginPath();g.arc(0,0,12,0,TAU);g.stroke();g.strokeStyle=v[2]?'#5fe36a':'#ff4f7b';g.lineWidth=3.5;g.stroke();for(let i=0;i<4;i++){g.rotate(TAU/4);g.fillStyle=OL;g.fillRect(-2,-12,4,12);}g.restore();circ(X,v[1]-18,4,OL);if(!v[2])dglow(X,v[1]-18,20,'#7ae8ff',.4+.3*Math.sin(T*4));}
  if(m.walls.some(w=>w[0]===10300)||m.doorT){const X=10360-cx;if(X>-80&&X<W+80&&m.doorT){for(let i=0;i<20;i++)circ(X+rnd(-40,40),G0-rnd(0,200),rnd(3,6),'#7ae8ff');}}
  for(const b of m.bounce){const X=b-cx;if(X<-30||X>W+30)continue;const sq=1+Math.sin(T*6)*.06;g.fillStyle=OL;g.beginPath();g.ellipse(X,G0-8,24*sq,13/sq,0,Math.PI,TAU);g.fill();g.fillStyle=lg(g,0,G0-20,0,G0,['#ffb0ff','#b04aff']);g.beginPath();g.ellipse(X,G0-8,21*sq,10/sq,0,Math.PI,TAU);g.fill();for(const d of[-8,0,8])circ(X+d,G0-13,2.4,'#ffe0ff');g.fillStyle=OL;g.fillRect(X-22,G0-9,44,9);}
  {const X=5000-cx;if(X>-200&&X<W+200&&m.beamX!==undefined){const bx=m.beamX-cx;g.fillStyle=m.spot>0?'rgba(255,80,80,.3)':'rgba(255,250,180,.25)';g.beginPath();g.moveTo(X-6,G0-170);g.lineTo(bx-40,G0);g.lineTo(bx+40,G0);g.lineTo(X+6,G0-170);g.fill();g.fillStyle=m.spot>0?'rgba(255,80,80,.35)':'rgba(255,250,180,.35)';g.beginPath();g.ellipse(bx,G0,42,7,0,0,TAU);g.fill();}
   if(X>-60&&X<W+60){const y=GROUND-178+Math.sin(T*2)*4;dglow(X,y+8,16,'#ff4f7b',.6);g.fillStyle=OL;g.beginPath();g.ellipse(X,y,26,15,0,0,TAU);g.fill();g.fillStyle=lg(g,0,y-14,0,y+14,['#9a5ac0','#4a1a6a']);g.beginPath();g.ellipse(X,y,23,12,0,0,TAU);g.fill();circ(X,y+4,6,OL);circ(X,y+4,4.5,m.spot>0?'#ff4f7b':'#ffe9a0');for(const d of[-1,1]){g.fillStyle=OL;g.beginPath();g.ellipse(X+d*26,y-2,8,3,0,0,TAU);g.fill();}}}
  if(m.cg&&m.cg[1]>m.cg[0]){const X=m.cg[1]-cx;for(let i=0;i<5;i++){const u=(T*3+i/5)%1;circ(X+rnd(-6,10),G0+u*60,3+i%3,'#8a3a22');}}
  if(m.cg&&m.cg[1]<12620&&m.px>11700){for(let x=Math.max(m.cg[1],11880);x<12620;x+=40){const X=x-cx;if(X<-20||X>W+20)continue;g.strokeStyle='rgba(0,0,0,.5)';g.lineWidth=2;g.beginPath();g.moveTo(X,G0+2);g.lineTo(X+10,G0+10);g.lineTo(X+4,G0+20);g.stroke();}}
  if(m.cart&&m.cart.on){} }
 else{if(m.cart&&m.cart.on)cartSpr(m.px-cx,m.py);
  if(m.px>2020&&m.px<2560){const k=m.gust?.55:m.gustW?.3:.18;g.fillStyle=`rgba(200,110,60,${k})`;g.fillRect(-20,-800,W+40,1300);g.strokeStyle=`rgba(255,200,150,${k+.2})`;g.lineWidth=2;for(let i=0;i<(m.gust?40:12);i++){const yy=(i*37+T*30)%H+m.camY,xx=((i*97-T*(m.gust?900:300))%(W+100)+W+100)%(W+100)-50;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+(m.gust?50:20),yy);g.stroke();}
   if(m.gust)sfxText(m.shelter?'SAFE!':'WHOOSH!',m.px-cx,m.py-90,16,.4,-.1);}}}
function cartSpr(X,Y){g.fillStyle=OL;g.beginPath();g.roundRect(X-26,Y-30,52,26,8);g.fill();g.fillStyle=lg(g,0,Y-30,0,Y-4,['#e0a060','#8a4a2a']);g.beginPath();g.roundRect(X-23,Y-27,46,20,6);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.fillRect(X-23,Y-17,46,3);
 for(const d of[-14,14]){circ(X+d,Y-4,7,OL);circ(X+d,Y-4,5,'#c8ccd8');circ(X+d,Y-4,2,OL);}}
function freeBot(f){const m=M;f.freed=1;if(f.rt){f.y=GROUND;f.up=1;}f.hp=0;f.vx=0;f.mode='walk';stats.kills++;score+=150;boomAt(m.booms,f.x,f.y-24,10,'#7ae8ff');sfx('power');
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
 const PI7=IMG.spr_pip7;if(PI7){const h=88,w=h*PI7.width/PI7.height,b=Math.sin(t*2.2)*1.5;g.fillStyle='rgba(0,0,0,.3)';g.beginPath();g.ellipse(0,0,w*.38,5,0,0,TAU);g.fill();g.drawImage(PI7,-w/2,-h+b,w,h);
  if(trapped){g.strokeStyle=OL;g.lineWidth=6;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*20,2);g.lineTo(i*13,-92);g.stroke();}g.strokeStyle='#c46aff';g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*20,2);g.lineTo(i*13,-92);g.stroke();}}
  g.restore();return;}
 if(trapped){dglow(0,-50,50,'#b04aff',.3);g.strokeStyle='#b04aff';g.lineWidth=3;for(let i=-2;i<=2;i++){g.beginPath();g.moveTo(i*16,0);g.lineTo(i*10,-100);g.stroke();}}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,-30,26,30,0,0,TAU);g.fill();g.fillStyle=lg(g,0,-60,0,0,['#fff6d8','#d8b060']);g.beginPath();g.ellipse(0,-30,23,27,0,0,TAU);g.fill();
 circ(0,-30,8,OL);circ(0,-30,6,'#5fe36a');
 circ(0,-72,19,OL);g.fillStyle=ballG(g,0,-72,17,17,'#fff0c0');g.beginPath();g.arc(0,-72,17,0,TAU);g.fill();g.fillStyle=OL;g.beginPath();g.roundRect(-12,-80,24,12,6);g.fill();circ(-5,-74,3,'#7ae8ff');circ(5,-74,3,'#7ae8ff');
 g.fillStyle='#5fa040';g.beginPath();g.ellipse(0,-92,22,6,0,0,TAU);g.fill();g.strokeStyle=OL;g.lineWidth=2;g.stroke();g.fillStyle='#7ad04a';g.beginPath();g.ellipse(0,-97,12,8,0,Math.PI,TAU);g.fill();g.stroke();// gardener hat
 g.fillStyle='#ff7ae0';circ(9,-101,4,OL);circ(9,-101,3,'#ff7ae0');
 g.restore();}
const LEADER=[['Inside the colony gate...','Earthlings! Thank you! I am PIP-7, the colony leader.'],
 ['PIP-7 explains.','The Vorr turned my robots against us!'],
 ['PIP-7 explains.','We came to grow gardens. Then a DUST WHALE gulped all our water!'],
 ['PIP-7 explains.','It swallowed a Crystal Key too. The whale sleeps deep in the tunnels.'],
 ['PIP-7 explains.','Please save our gardens!'],
 ['cap','A Crystal Key? We\'ll get it back. Hang tight, PIP-7!']];

// ---- rich comic backdrops (original art): colony interior, rock tunnel, Mars mountains at dusk
function hsh(i){const x=Math.sin(i*127.1)*43758.5;return x-Math.floor(x);}
function comicBack(k,x,y,w,h,t){g.save();g.beginPath();g.rect(x,y,w,h);g.clip();
 if(k==='colony'){g.fillStyle=lg(g,0,y,0,y+h,['#5a2a1c','#7a3a22','#3a160e']);g.fillRect(x,y,w,h);
  for(let i=0;i<40;i++){g.fillStyle=`rgba(${i%2?255:0},${i%2?190:0},${i%2?140:0},.07)`;g.beginPath();g.ellipse(x+hsh(i)*w,y+hsh(i+9)*h,10+hsh(i+3)*26,6+hsh(i+5)*12,0,0,TAU);g.fill();}
  for(let a=0;a<3;a++){const ax=x+w*(.2+a*.3);g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.arc(ax,y+h,w*.16,Math.PI,TAU);g.stroke();g.strokeStyle='#d07a4a';g.lineWidth=5;g.beginPath();g.arc(ax,y+h,w*.16,Math.PI,TAU);g.stroke();
   const wy=y+h*.32;circ(ax,wy,h*.1+3,OL);g.fillStyle=lg(g,0,wy-h*.1,0,wy+h*.1,['#ffb07a','#c0582e']);g.beginPath();g.arc(ax,wy,h*.1,0,TAU);g.fill();g.fillStyle='#8a3a22';g.beginPath();g.moveTo(ax-h*.1,wy+h*.04);g.lineTo(ax-h*.03,wy-h*.02);g.lineTo(ax+h*.04,wy+h*.03);g.lineTo(ax+h*.1,wy);g.lineTo(ax+h*.1,wy+h*.1);g.lineTo(ax-h*.1,wy+h*.1);g.fill();circ(ax-h*.04,wy-h*.04,h*.025,'rgba(255,255,255,.5)');}
  for(let i=0;i<4;i++){const lx=x+w*(.12+i*.26),ly=y+16;dglow(lx,ly,26,'#ffd27a',.5);circ(lx,ly,7,OL);circ(lx,ly,5,'#ffe9a0');}
  g.fillStyle=OL;g.fillRect(x,y+h-18,w,18);g.fillStyle='#8a4a2a';g.fillRect(x,y+h-15,w,15);for(let i=0;i<w;i+=22){g.fillStyle='rgba(0,0,0,.25)';g.fillRect(x+i,y+h-15,2,15);}}
 else if(k==='cave'){g.fillStyle=lg(g,0,y,0,y+h,['#1a0806','#3a1610','#24100a']);g.fillRect(x,y,w,h);
  for(let i=0;i<60;i++){const rx=x+hsh(i)*w,ry=y+hsh(i+20)*h,r=8+hsh(i+40)*30;g.fillStyle=i%3?'rgba(120,50,30,.25)':'rgba(0,0,0,.3)';g.beginPath();g.ellipse(rx,ry,r,r*.6,hsh(i)*3,0,TAU);g.fill();g.strokeStyle='rgba(0,0,0,.35)';g.lineWidth=1.5;g.stroke();}
  for(let i=0;i<w;i+=44){const X=x+i+10,hh=24+hsh(i)*40;g.fillStyle=OL;g.beginPath();g.moveTo(X-18,y);g.quadraticCurveTo(X-6,y+hh,X,y+hh+10);g.quadraticCurveTo(X+6,y+hh,X+18,y);g.fill();g.fillStyle='#4a1c12';g.beginPath();g.moveTo(X-14,y);g.quadraticCurveTo(X-5,y+hh-4,X,y+hh+4);g.quadraticCurveTo(X+5,y+hh-4,X+14,y);g.fill();}
  for(let i=0;i<5;i++){const cx2=x+w*(.1+i*.2)+hsh(i)*20,cy2=y+h-14;dglow(cx2,cy2-10,30,i%2?'#ffb040':'#7ae8ff',.5);for(let k2=0;k2<3;k2++){const px=cx2+k2*10-10,ph=14+k2*6;g.fillStyle=OL;g.beginPath();g.moveTo(px-6,cy2);g.lineTo(px,cy2-ph-3);g.lineTo(px+6,cy2);g.fill();g.fillStyle=i%2?(k2%2?'#ffb040':'#ffd27a'):(k2%2?'#45b8ff':'#a8f0ff');g.beginPath();g.moveTo(px-4,cy2);g.lineTo(px,cy2-ph);g.lineTo(px+4,cy2);g.fill();}}
  for(let i=0;i<6;i++){const bx=x+hsh(i+70)*w+Math.sin(T*1.5+i)*8,by=y+h*.3+hsh(i+80)*h*.4+Math.cos(T*2+i)*5;dglow(bx,by,14,'#d0ff7a',.7);circ(bx,by,2.6,'#eaff9a');}
  g.fillStyle=OL;g.fillRect(x,y+h-12,w,12);g.fillStyle='#6a2a1a';g.fillRect(x,y+h-9,w,9);}
 else if(k==='mtn'){g.fillStyle=lg(g,0,y,0,y+h,['#1a0a2a','#5a1a2a','#c05a32','#ff9a5a']);g.fillRect(x,y,w,h);
  for(let i=0;i<40;i++)circ(x+hsh(i)*w,y+hsh(i+5)*h*.4,hsh(i+9)*1.4+.4,'rgba(255,255,255,.8)');
  circ(x+w*.82,y+h*.22,16,'#ffe9c0');dglow(x+w*.82,y+h*.22,40,'#ffd0a0',.5);
  const layer=(base,amp,col,sd)=>{g.fillStyle=OL;g.beginPath();g.moveTo(x,y+h);for(let i=0;i<=w;i+=20)g.lineTo(x+i,y+base-amp*(.4+.6*Math.abs(Math.sin(i*.013+sd)))-hsh(i+sd)*10-2);g.lineTo(x+w,y+h);g.fill();g.fillStyle=col;g.beginPath();g.moveTo(x,y+h);for(let i=0;i<=w;i+=20)g.lineTo(x+i,y+base-amp*(.4+.6*Math.abs(Math.sin(i*.013+sd)))-hsh(i+sd)*10+1);g.lineTo(x+w,y+h);g.fill();};
  layer(h*.62,h*.25,'#8a3424',1);layer(h*.78,h*.3,'#6a2416',4);
  for(let i=0;i<9;i++){const on=(T*2+i|0)%4;circ(x+w*.35+i*14,y+h*.72-(i%3)*8,3,on?'#ffd27a':'#7a4a2a');}
  layer(h*.95,h*.12,'#4a1a10',7);g.fillStyle='rgba(255,170,120,.12)';for(let i=0;i<4;i++)g.fillRect(x,y+h*.6+i*14,w,5);}
 g.restore();}
function rim(fn,col='rgba(255,210,150,.7)'){g.save();g.shadowColor=col;g.shadowBlur=14;fn();g.restore();}
// one big painted panel + bottom caption strip (shared by every in-level dialogue scene)
function spk(q,dflt){const m=/^([A-Z0-9 &\-]{2,24}): (.*)$/.exec(q);return m?{who:m[1],s:m[2]}:{who:dflt,s:q};}
function paintCut(t,img,capt,lines,fx,extra){g.fillStyle='rgba(6,4,20,.9)';g.fillRect(0,0,W,H);const e=1-Math.pow(1-clamp(t/.35,0,1),3),ox=(1-e)*W*.5;
 g.save();g.beginPath();g.rect(PX+ox,PY,PW,PH);g.clip();g.translate(ox,0);const z=1+Math.min(t,5)*.002;g.translate(W/2,PY+PH/2);g.scale(z,z);g.translate(-W/2,-(PY+PH/2));const im=IMG['comic_'+img];if(im)drawPanelImg(im,PX,PY,PW,PH);else{g.fillStyle="#1a1030";g.fillRect(PX,PY,PW,PH);}if(extra)extra();g.globalAlpha=.08;g.fillStyle=halftone();g.fillRect(PX,PY,PW,PH);g.globalAlpha=1;g.restore();
 g.strokeStyle=OL;g.lineWidth=8;g.strokeRect(PX+ox,PY,PW,PH);g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(PX+ox+5,PY+5,PW-10,PH-10);
 const col=w=>w==='HAYES'?'#2a5aa0':w==='MALAKAR'?'#7a2ab0':w===CAPS[cap].name?'#c0501a':'#2a7a3a';
 if(t>.3)comicStrip(t>.35?capt:'',lines.filter(L=>t>(L.at||.4)).map(L=>({who:L.who,s:L.s,col:col(L.who)})),PX+ox,STY0,PW,STY1);
 if(fx)sfxText(fx,W/2,PY+26,22,t,-.08);panel(W-116,4,108,28,'#ff7a29');txt('SKIP ▶▶',W-62,18,13,'#ffffff');}
function leaderCut(m){const c=m.cut,t=c.t,L=LEADER[c.b];const me=L[0]==='cap';paintCut(t,'c37',me?'':(c.b===0?L[0]:''),[{who:me?CAPS[cap].name:'PIP-7',s:L[1]}],c.b===0?'RESCUE!':'');
 if(cutAdv(t,AUTO&&t>1.6)){c.b++;c.t=0;if(c.b>=LEADER.length){m.cut=null;m.hp=m.maxhp;m.msgs.push({t:'PIP-7 JOINS THE COLONY CHEER! ENERGY FULL',l:2.4});for(const f of m.foes)if(f.bot&&!f.rt&&Math.abs(f.x-5650)<700&&!f.freed)freeBot(f);}}}
// ----- Dust Whale: 1) swims through the cavern walls among the hoarded water tanks, 2) sprays water, 3) bursts from the ground; crack its shell
function whaleCut(m){const t=m.cut.t;paintCut(t,'c38','THE DUST WHALE',[{who:'DUST WHALE',s:'GLUB GLUB! My water! My shiny Key! Mine mine MINE!'},{who:CAPS[cap].name,s:'Those tanks belong to the colony. Give them back!',at:.9}],'BOSS!');if(cutAdv(t,AUTO&&t>2.4))m.cut=null;}
const WST={2:['STAGE 2!','SPLOOSH! Dodge THIS, Earthling!','It\'s spraying the water. Dodge the arcs!'],3:['STAGE 3!','GRRRUMBLE! You can\'t catch me underground!','Watch the ground shake, then crack that shell!']};
function whaleStageCut(m){const t=m.cut.t,L=WST[m.cut.s];paintCut(t,'c38',L[2],[{who:'DUST WHALE',s:L[1]}],L[0]);if(cutAdv(t,AUTO&&t>1.6))m.cut=null;}
function dustWhale(x,y,sc,t,o){const WI=IMG.spr_dustwhale;if(WI){g.save();g.translate(x,y);g.scale(sc*(o.face>0?-1:1),sc);g.rotate(Math.sin(t*3)*.06);const w=300,h=w*WI.height/WI.width,X=-w*.42,Y=-h*.55;
 for(let i=0;i<22;i++){const a=t*(.6+i%3*.25)+i*1.7,r=150+Math.sin(i*3.1)*30;g.globalAlpha=.35+.25*Math.sin(t*3+i);g.fillStyle=['#e0803a','#b04aff','#ffcf8a','#7ae8ff'][i%4];g.beginPath();g.arc(Math.cos(a)*r,Math.sin(a)*r*.45,1.5+i%3,0,TAU);g.fill();}g.globalAlpha=1;
 for(let i=0;i<4;i++){g.globalAlpha=.25;g.fillStyle=i%2?'#c0602a':'#8a3ab0';g.beginPath();g.arc(X+w*.95+Math.sin(t*2+i)*20+i*14,Y+h*.5+Math.cos(t*3+i*2)*18,10+i*3,0,TAU);g.fill();}g.globalAlpha=1;
 g.drawImage(WI,X,Y,w,h);if(o.flash){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(WI,X,Y,w,h);g.globalCompositeOperation='source-over';g.globalAlpha=1;}
 const cx=X+w*.125,cy=Y+h*.23;dglow(cx,cy,26+Math.sin(t*6)*5,'#b04aff',.7);
 if(o.angry){dglow(X+w*.14,Y+h*.475,10,'#ffb020',.8);}
 for(let i=0;i<5;i++)if((o.crack||0)>i*.6){const px=X+w*(.3+i*.1),py=Y+h*(.12+i*.02);g.strokeStyle='#fff6c0';g.lineWidth=2.5;g.beginPath();g.moveTo(px-8,py-4);g.lineTo(px,py+3);g.lineTo(px+7,py-6);g.stroke();dglow(px,py,12,'#7ae8ff',.5);}
 g.restore();return;}
 g.save();g.translate(x,y);g.scale(sc*(o.face||-1)*-1,sc);const sw=Math.sin(t*3)*.08;g.rotate(sw);
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
function updMoon(dt){if(mission===9&&SK)return updSky(dt);const m=M;if(m.cut){m.cut.t+=dt*(AUTO?3:1);return;}if(AUTO)autoMoon();m.time+=dt;
 for(const p of m.movers){const u=.5-.5*Math.cos(m.time*p.sp+p.ph),nx=p.x0+p.dx*u;p.ddx=p.x===undefined?0:nx-p.x;p.x=nx;p.y=p.y0+p.dy*u;}
 if(m.on&&m.mv){m.px+=m.mv.ddx;m.py=m.mv.y;}
 const ax=(I.R?1:0)-(I.L?1:0);m.vx+=ax*900*dt;if(!ax)m.vx*=m.on?.75:.95;m.vx=clamp(m.vx,-(UPG(4)?160:140),UPG(4)?160:140);if(ax)m.face=ax;if(AUTO&&m.lock&&Math.abs(m.px-(m.boss.x+(m.px<m.boss.x?-100:100)))<20)m.face=m.px<m.boss.x?1:-1;
 if(pressedA)m.jb=.15;else m.jb=(m.jb||0)-dt;if(m.on)m.co=.1;else m.co=(m.co||0)-dt;if(m.jb>0&&m.co>0&&m.vy>=-1){m.vy=UPG(4)?-350:-330;m.on=false;m.jb=0;m.co=0;sfx('jump');}pressedA=false;
 const lowG=m.lowg.some(z=>m.px>z[0]&&m.px<z[1]),g2=(I.J&&m.vy<0?GRAV*.55:GRAV)*(lowG?.3:1);m.vy+=g2*dt;if(lowG)m.vy=Math.min(m.vy,85);// floaty low-gravity, hold to go higher
 let nx=m.px+m.vx*dt;if(m.cart&&m.cart.on){nx=m.px+230*dt;m.vx=0;}else for(const w of m.walls)if(nx+8>w[0]&&nx-8<w[0]+w[2]&&m.py>w[1]+2){nx=m.px;m.vx=0;}
 const minX=m.lock?m.arena:0,maxX=m.lock?m.arena+W-10:m.arena+W-10;m.px=clamp(nx,minX+10,maxX);
 const ny=m.py+m.vy*dt;m.on=false;m.mv=null;if(m.vy>=0){const top=solidAt(m.px,m.py,ny);if(top!==null&&!(I.D&&top<GROUND-1&&!m.walls.some(w=>w[1]===top))){m.py=top;m.vy=0;m.on=true;m.mv=M._mv;}else m.py=ny;}else m.py=ny;
 const inGap=x=>!(m.cart&&m.cart.on)&&m.gaps.some(q=>x>q[0]&&x<q[1]);
 if(m.py>=GROUND&&m.py<GROUND+14&&!inGap(m.px)){m.py=GROUND;m.vy=0;m.on=true;}
 if(m.py>GROUND+2&&!(m.cart&&m.cart.on)){const q=m.gaps.find(q=>m.px>q[0]-12&&m.px<q[1]+12);if(q)m.px=clamp(m.px,q[0]+6,q[1]-6);}
 if(m.on&&m.py>=GROUND-1&&!m.gaps.some(q=>m.px>q[0]-60&&m.px<q[1]+60))m.safe=m.px;
 if(m.py>GROUND+150){m.px=beamX(m);m.py=GROUND;m.vx=0;m.vy=0;m.on=true;m.inv=1.5;if(!AUTO)m.hp=Math.max(1,m.hp-1);m.msgs.push({t:'BEAMED BACK!',l:1.5});sfx('pick');}
 for(const c of m.cps)if(!c.on&&m.px>c.x-10){c.on=true;m.msgs=m.msgs.filter(q=>q.t!=='CHECKPOINT');m.msgs.push({t:'CHECKPOINT',l:1.6});saveCP(m.lv,m.cps.indexOf(c));sfx('pick');m.hp=Math.min(m.maxhp,m.hp+2);}
 while(m.tipI<m.tips.length&&m.px>m.tips[m.tipI][0]){m.tip={t:m.tips[m.tipI][1],l:5.5};m.tipI++;}if(m.tip&&(m.tip.l-=dt)<=0)m.tip=null;
 m.run+=Math.abs(m.vx)*dt*.12;m.cool-=dt;m.inv-=dt;m.shooting-=dt;
 if(m.mars){if(I.F)m.chg=(m.chg||0)+dt;else{if((m.chg||0)>=.8){m.shots.push({x:m.px+m.face*22,y:m.py-26,vx:m.face*480,vy:0,big:1});sfx('charge');SHAKE=.1;}m.chg=0;}}
 if(I.F&&m.cool<=0){const y=m.py-24,base={x:m.px+m.face*20,y,vx:m.face*420,vy:0};m.shots.push(base);
  if(m.spread>0){m.shots.push({...base,vy:-110},{...base,vy:110});}m.cool=UPG(1)?.15:.2;m.shooting=.15;sfx('shot');}
 const tc=m.lock?m.arena:clamp(m.px-W*.4,0,m.arena);m.cam+=(tc-m.cam)*Math.min(1,dt*6);
 {const sy=m.py-m.camY,lo=H*.36,hi=H*.70;let ty=m.camY;if(sy<lo)ty=m.py-lo;else if(sy>hi)ty=m.py-hi;if(m.vy>260)ty+=60;else if(m.vy<-200)ty-=30;
  if(m.lock)ty=0;ty=clamp(ty,-720,0);m.camY+=(ty-m.camY)*Math.min(1,dt*(m.vy>260?8:5));}
 if(m.mars&&!m.ldr&&m.px>5560){m.ldr=1;m.cut={t:0,k:'leader',b:0};m.tip=null;}
 if(!m.lock&&m.px>m.arena+120){m.lock=true;m.boss.active=true;m.cut={t:0};m.tip=null;startMusic('boss');}
 for(const b of m.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;}m.shots=m.shots.filter(b=>Math.abs(b.x-m.px)<W);
 if(m.mars)marsSet(m,dt);else reactorUpd(m,dt);
 // foes
 for(const f of m.foes){f.t+=dt;f.mt-=dt;const d=m.px-f.x,dist=Math.abs(d);
  if(f.type){if(dist>W*1.2){continue;}f.face=Math.sign(d)||1;
   if(f.type==='squid'){f.x+=(clamp(m.px,f.x0-90,f.x0+90)-f.x)*dt*.5;f.y=f.y0+Math.sin(f.t*1.8)*14;f.ft-=dt;if(f.ft<=0&&dist<340&&Math.abs(m.py-f.y)<300){f.ft=2.3;const a=Math.atan2(m.py-24-f.y,d);for(const k of[-.22,0,.22])m.eshots.push({x:f.x+f.face*16,y:f.y,vx:Math.cos(a+k)*170,vy:Math.sin(a+k)*170});sfx('hit');}}
   else{if(dist<240&&Math.abs(m.py-f.y)<200){f.x+=Math.sign(d)*80*dt;f.y+=clamp(m.py-30-f.y,-1,1)*55*dt;}else{f.x+=(f.x0-f.x)*dt*.6;f.y+=(f.y0+Math.sin(f.t*2)*20-f.y)*dt*1.5;}}
   for(const b of m.shots)if(!b.dead&&!f.dead&&Math.abs(b.x-f.x)<22&&Math.abs(b.y-f.y)<22){b.dead=1;f.hp--;f.hit=.12;sfx('hit');if(f.hp<=0){f.dead=1;stats.kills++;score+=f.type==='squid'?120:80;boomAt(m.booms,f.x,f.y,12,f.type==='squid'?'#c070ff':'#d0ff40');(M.cfx||(M.cfx=[])).push({x:f.x,y:f.y-10,t:['SPLAT!','BLAM!','ZAP!','SPLORCH!'][Math.random()*4|0],l:.7,rot:rnd(-.3,.2)});sfx('boom');}}
   f.hit=(f.hit||0)-dt;if(!f.dead&&Math.abs(f.x-m.px)<24&&Math.abs(f.y-(m.py-24))<30)hurt(f.x);continue;}
  if(f.rt&&!f.freed){botT(f,m,dt,d,dist);continue;}
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
  else if(p.k==='water'){m.water=(m.water||0)+1;score+=300;m.maxhp+=1;m.hp=m.maxhp;m.msgs.push({t:'HIDDEN WATER! '+m.water+'/3 · MAX ENERGY UP',l:2.2});(m.cfx||(m.cfx=[])).push({x:p.x,y:p.y-20,t:'SPLISH!',l:.8,rot:-.1,sz:16});}
  else if(p.k==='tank'){m.secrets++;score+=500;m.maxhp+=2;m.hp=m.maxhp;m.msgs.push({t:'SECRET ENERGY TANK! MAX ENERGY UP',l:2.5});}
  else{m.secrets++;secretFound=true;score+=1000;m.maxhp+=2;m.hp=m.maxhp;m.msgs.push({t:'SECRET SPOT FOUND! MAX ENERGY UP',l:3});}}
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
function moonCut(m){const t=m.cut.t;if(m.cut.k==='pilot')return pilotCut(m);if(m.cut.k==='leader')return leaderCut(m);if(m.cut.k==='wst')return whaleStageCut(m);if(m.mars)return whaleCut(m);
 const a=spk(MCUT.b,'BIG BLORP'),b=spk(MCUT.c,CAPS[cap].name);paintCut(t,'c39','BIG BLORP, WARDEN OF THE OUTPOST',[a,{...b,at:.9}],'BOSS!');if(cutAdv(t,AUTO&&t>3.4))m.cut=null;}
function pilotCut(m){const t=m.cut.t;paintCut(t,'c18','THE PILOT EJECTS!',[{who:'BIG BLORP',s:'You BROKE my robot?! Fine. Big Blorp fight you with FEET!'}],'PHASE 2!');if(cutAdv(t,AUTO&&t>2.6))m.cut=null;}
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
const GLOW={};function glow(col){if(/^#[0-9a-f]{3}$/i.test(col))col='#'+col[1]+col[1]+col[2]+col[2]+col[3]+col[3];return GLOW[col]||(GLOW[col]=(()=>{const c=mkc(64,64),x=c.getContext('2d'),q=x.createRadialGradient(32,32,0,32,32,32);q.addColorStop(0,col);q.addColorStop(.3,col+'99');q.addColorStop(1,col+'00');x.fillStyle=q;x.fillRect(0,0,64,64);return c;})());}
function dglow(x,y,r,col,a=1){g.save();g.globalCompositeOperation='lighter';g.globalAlpha=a;g.drawImage(glow(col),x-r,y-r,r*2,r*2);g.restore();}
// ---------- text ----------
const FONTF='"Arial Black","Arial Bold",Gadget,"Helvetica Neue",Arial,sans-serif';
function setF(size){g.font=`900 ${Math.round(size*1.1)}px ${FONTF}`;}
function fitTxt(s,x,y,size,maxw,col){setF(size);while(size>7&&g.measureText(String(s)).width>maxw){size-=.5;setF(size);}txt(s,x,y,size,col);}
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
function shipSpr(){const im=IMG.spr_paleblue;if(im&&im.width)return{c:im,w:104,h:70,ax:54,ay:36};return shipSprOld();}
function shipSprOld(){const ci=cap;return pre('ship2_'+ci,104,72,54,36,x=>{const WB='#a9cdf2',W1='#f2f6fb';
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
 const nw=s.c!==undefined&&s.c===IMG.spr_paleblue;for(const[ox,o]of nw?[[-38,-1],[-6,24]]:[[-42,-9],[-42,11]]){dglow(ox-8*f,o,10+7*f,'#3f8cff',.95);g.fillStyle='rgba(200,235,255,.95)';g.beginPath();g.ellipse(ox+2-4*f,o,4+5*f,2.6,0,0,TAU);g.fill();}
 g.drawImage(s.c,-s.ax,-s.ay,s.w,s.h);if(!nw){const bl=(t*4|0)%2;g.fillStyle=bl?'#ffc53d':'#ff4f7b';g.beginPath();g.arc(-10,-27,1.6,0,TAU);g.fill();if(bl)dglow(-10,-27,6,'#ffc53d',.7);}g.restore();}

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
const IMG={};const AV=((document.currentScript&&document.currentScript.src.match(/[?&]v=([^&]+)/))||[])[1]||'';function loadImg(k,src){const i=new Image();if(AV)src+=(src.includes('?')?'&':'?')+'v='+AV;i.onload=()=>{IMG[k]=i;};i.onerror=()=>{};i.src=src;}
['riley','nova','jax','quinn'].forEach(n=>loadImg(n,'assets/captains/'+n+'.png'));loadImg('title','assets/title.png');loadImg('ship','assets/concept/ship-pale-blue.jpg');loadImg('spr_kreelfighter','assets/sprites/kreelfighter.png');
const CAPKEY=['riley','nova','jax','quinn'];
function hayesP(X,Y,S){const im=IMG.comic_c10,w=40*S,h=40*S,x=X-w/2,y=Y-h;if(!im){dsp(portrait('hayes'),X,Y,S);return;}
 const big=S>3,sw=big?760:420,sh=sw*h/w,sx=clamp(475*im.width/1600-sw*(big?.38:.5),0,im.width-sw),sy=clamp((big?120:40)*im.height/900,0,im.height-sh);
 g.save();g.beginPath();g.roundRect(x,y,w,h,Math.min(10,w*.12));g.clip();g.drawImage(im,sx,sy,sw,sh,x,y,w,h);g.restore();g.strokeStyle=OL;g.lineWidth=Math.max(2,S*.8);g.beginPath();g.roundRect(x,y,w,h,Math.min(10,w*.12));g.stroke();}
function routeMap(x,y,w,h){g.save();g.globalAlpha=.92;g.fillStyle=OL;g.beginPath();g.roundRect(x-3,y-3,w+6,h+6,8);g.fill();g.fillStyle='rgba(8,24,48,.92)';g.beginPath();g.roundRect(x,y,w,h,6);g.fill();
 g.strokeStyle='rgba(69,214,255,.18)';g.lineWidth=1;for(let i=1;i<6;i++){g.beginPath();g.moveTo(x+i*w/6,y);g.lineTo(x+i*w/6,y+h);g.stroke();}for(let i=1;i<4;i++){g.beginPath();g.moveTo(x,y+i*h/4);g.lineTo(x+w,y+i*h/4);g.stroke();}
 const pts=[[.1,.75,'#3a7aff',9],[.32,.35,'#c8ccd8',6],[.6,.62,'#d0582e',8],[.9,.22,'#ffc53d',5]];g.setLineDash([4,4]);g.strokeStyle='#7ae8ff';g.lineWidth=2;g.beginPath();pts.forEach((q,i)=>i?g.lineTo(x+q[0]*w,y+q[1]*h):g.moveTo(x+q[0]*w,y+q[1]*h));g.stroke();g.setLineDash([]);
 for(const q of pts){dglow(x+q[0]*w,y+q[1]*h,q[3]*2.2,q[2],.6);circ(x+q[0]*w,y+q[1]*h,q[3],q[2]);}const u=(T*.15)%1,k=Math.min(2,Math.floor(u*3)),f=u*3-k,a=pts[k],b=pts[k+1];circ(x+(a[0]+(b[0]-a[0])*f)*w,y+(a[1]+(b[1]-a[1])*f)*h,3,'#ffffff');
 txt('DR. VEGA\'S STAR MAP',x+w/2,y+10,7,'#7ae8ff');g.restore();}
function coverAt(im,x,y,w,h,fx){const sh=im.height,sw=sh*w/h,sx=clamp(im.width*fx-sw/2,0,im.width-sw);g.drawImage(im,sx,0,sw,sh,x,y,w,h);}
function drawPanelImg(img,x,y,w,h){if(!img._bl){const c=document.createElement('canvas');c.width=24;c.height=14;c.getContext('2d').drawImage(img,0,0,24,14);img._bl=c;}
 const s=Math.max(w/img.width,h/img.height);g.imageSmoothingEnabled=true;g.drawImage(img._bl,x-(img.width*s-w)/2,y-(img.height*s-h)/2,img.width*s,img.height*s);g.fillStyle='rgba(8,6,20,.35)';g.fillRect(x,y,w,h);
 const f=Math.min(w/img.width,h/img.height),dw=img.width*f,dh=img.height*f,dx=x+(w-dw)/2,dy=y+(h-dh)/2;g.drawImage(img,dx,dy,dw,dh);
 if(dw<w-2){const gl=g.createLinearGradient(dx,0,dx+18,0);gl.addColorStop(0,'rgba(8,6,20,.6)');gl.addColorStop(1,'rgba(8,6,20,0)');g.fillStyle=gl;g.fillRect(dx,y,18,h);const gr=g.createLinearGradient(dx+dw,0,dx+dw-18,0);gr.addColorStop(0,'rgba(8,6,20,.6)');gr.addColorStop(1,'rgba(8,6,20,0)');g.fillStyle=gr;g.fillRect(dx+dw-18,y,18,h);}}
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
function zibTaxi(x,y,sc){g.save();g.translate(x,y);g.scale(sc,sc);g.lineJoin='round';
 for(const d of[-14,14]){dglow(-78,d,16,'#ffb040',.9);g.fillStyle='#ffe9a0';g.beginPath();g.moveTo(-70,d-6);g.lineTo(-96-Math.sin(T*40)*6,d);g.lineTo(-70,d+6);g.fill();circ(-64,d,11,OL);circ(-64,d,8,'#6a7090');circ(-64,d,4,'#ffb040');}
 g.fillStyle=OL;g.beginPath();g.ellipse(0,8,70,30,0,0,TAU);g.fill();g.fillStyle=lg(g,0,-20,0,36,['#fff09a','#ffc53d','#c08a10']);g.beginPath();g.ellipse(0,8,66,26,0,0,TAU);g.fill();
 for(let i=0;i<10;i++){g.fillStyle=i%2?OL:'#ffffff';g.fillRect(-50+i*10,14,10,7);}g.strokeStyle=OL;g.lineWidth=2;g.strokeRect(-50,14,100,7);
 g.fillStyle=OL;g.beginPath();g.ellipse(4,-6,48,32,0,Math.PI,TAU);g.fill();g.fillStyle='rgba(170,230,255,.55)';g.beginPath();g.ellipse(4,-6,44,28,0,Math.PI,TAU);g.fill();
 g.save();g.beginPath();g.ellipse(4,-6,44,28,0,Math.PI,TAU);g.clip();g.save();g.translate(-18,4);blob(0,0,T*2,{r:15,face:1,scared:1,col:'#4fd65c'});g.restore();
 g.save();g.translate(28,-6);goofFlyer(0,0,T,1,false);g.restore();g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.arc(42,-4,7,0,TAU);g.stroke();g.restore();
 g.fillStyle='rgba(255,255,255,.5)';g.beginPath();g.ellipse(-10,-24,14,4,-.2,0,TAU);g.fill();
 g.fillStyle=OL;g.beginPath();g.roundRect(-20,-50,44,16,4);g.fill();g.fillStyle='#ffe066';g.beginPath();g.roundRect(-18,-48,40,12,3);g.fill();txt('TAXI',2,-42,7,'#1a1020');
 circ(64,8,6,OL);circ(64,8,4,'#fff6c0');dglow(70,8,14,'#fff6c0',.6);g.restore();}
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
 hayesP(75,342,2.2);
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
function kreelShipSpr(p2){const KI=IMG.spr_kreelfighter;if(KI)return pre('kwsI'+(p2?1:0),280,190,140,95,x=>{const w=280,h=w*KI.height/KI.width;x.drawImage(KI,-140,-h/2,w,h);
  if(p2){x.globalCompositeOperation='source-atop';x.fillStyle='rgba(255,60,160,.22)';x.fillRect(-140,-95,280,190);x.globalCompositeOperation='source-over';x.strokeStyle='#ffb0ee';x.lineWidth=2.2;x.beginPath();x.moveTo(-40,-30);x.lineTo(-18,-8);x.lineTo(2,-26);x.moveTo(30,20);x.lineTo(52,4);x.lineTo(74,18);x.moveTo(-70,14);x.lineTo(-48,2);x.stroke();}});
 return pre('kws'+(p2?1:0),280,190,140,95,x=>{
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
 else if(M3DRAW[B.type]){if(SPM===3&&sp.bossI<3){g.save();g.globalAlpha=.5;fuelStation(Math.min(2,sp.bossI),W*.6,92,.62,false,0);g.restore();}M3DRAW[B.type](B);}
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
function bossHud(B){const nm={carrier:'SHIELD CARRIER',turret:'TURRET GUNSHIP',ace:'ACE KREEL',grubb:'CAPTAIN GRUBB',twins:'VEXA & VOXA',krool:B.ks===1?'KROOL: ARMOR':B.ks===2?(B.p3?'KROOL: OVERDRIVE!':'KROOL: CORE'):'KROOL: ESCAPE POD!',tosser:'ROCK TOSSER',smasher:'SMASHER',kreel2:B.mc===2?'KREEL: CORE OPEN!':'KREEL: ARMORED',satboss:B.sh?'SATELLITE: SHIELD UP':'SATELLITE BOSS',jrocket:'JUNK ROCKET',claw:B.cs==='empty'?'CLAW: COCKPIT OPEN!':'CLAW: ARMORED'}[B.type],col={satboss:'#5fb0ff',jrocket:'#ff9a3a',claw:'#ffd040',tosser:'#3ab0a0',smasher:'#a070ff',kreel2:'#ff4fd0',carrier:'#7ae8ff',turret:'#d04aff',ace:'#ff4f7b',grubb:'#9cff4a',twins:'#ff7ae0',krool:'#ff9a3a'}[B.type];vbar(W-30,70,20,B.hp/B.max,col);txt(nm,W-14,224,9,col,'right');}
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
function capBox(t,x,y){setF(12);const w=g.measureText(t).width+22;g.fillStyle=OL;g.fillRect(x-w/2-2,y-12,w+4,24);g.fillStyle='#ffe066';g.fillRect(x-w/2,y-10,w,20);g.fillStyle='#1a1020';g.textAlign='center';g.textBaseline='middle';g.fillText(t,x,y+.5);}
const BTAUNT={satboss:'BZZT. INTRUDER.',jrocket:'CATCH THIS!',claw:'KREEL: Crush time!',grubb:'GRUBB: Goo bath time!',twins:'VEXA: Get him, sis!',krool:'KROOL: The Gate stays shut!',carrier:'GORRK: My carrier! My shields! YOU NO PASS!',turret:'ZIB: It spins! It shoots! I did not build it!',ace:'KREEL: End of the line, Earthling.'};
function bossPanel(s,k){const sl=(1-k)*80;g.save();g.translate(sl,0);g.fillStyle=OL;g.beginPath();g.moveTo(40,118);g.lineTo(W-30,108);g.lineTo(W-46,196);g.lineTo(26,204);g.closePath();g.fill();
 g.fillStyle='#b0122e';g.beginPath();g.moveTo(45,122);g.lineTo(W-35,113);g.lineTo(W-50,191);g.lineTo(31,199);g.closePath();g.fill();g.save();g.clip();g.globalAlpha=.25;g.fillStyle=halftone();g.fillRect(0,100,W,110);g.globalAlpha=1;speedLines(W/2,155,'rgba(255,220,120,.18)');g.restore();
 sfxText(s.banner.t,W/2,150,24,Math.max(0,2.6-s.banner.l*1),-.04);if(s.boss)bubble(BTAUNT[s.boss.type]||'',W/2-120,198,240,W/2+120,190);g.restore();}
const BCUT={satboss:{b:'SATELLITE BOSS: BZZT. INTRUDER. SCRAP. INTRUDER.',c:'Wait for the dish to drop, then fire!'},jrocket:{b:'JUNK ROCKET: Bolts! Nuts! Fins! CATCH!',c:'Blast the junk before it hits us.'},claw:{b:'KREEL: My Compactor Claw will crush you into a tiny cube!',c:'Kreel is in the cockpit. Hit it when the hands are empty!'},tosser:{b:'ROCK TOSSER: CATCH!',c:'Watch for the red lane. Then move!'},smasher:{b:'SMASHER: ME SMASH ROCKS. ME SMASH YOU!',c:'Shoot the pieces before they hit us.'},kreel2:{b:'KREEL: My new ship eats Earth ships for lunch!',c:'COMET: BEEP. Hit the glowing core when the mouth opens!'},grubb:{b:'GRUBB: This fuel is MINE! Have a goo bath, Earthling!',c:'Dodge the bouncing goo and hit that tanker!'},twins:{b:'VEXA & VOXA: Two of us. One of you. Bad odds, hero!',c:'Beat one and the other gets mad. Stay sharp.'},krool:{b:'KROOL: Nobody passes the Mars Gate. NOBODY.',c:'Break his armor plates, then hit the core!'},carrier:{b:'GORRK: My carrier! My shields! You no pass!',c:'Shield nodes are up. Knock them out first!'},turret:{b:'ZIB: It spins! It shoots! Please don\'t hit it!',c:'Time your shots between the spirals.'},ace:{b:'KREEL: End of the line, Earthling.',c:'Kreel. I knew you\'d show up.'}};
function onCtrl(tp){if(Math.hypot(tp.x-PB.x,tp.y-PB.y)<PB.r+8)return true;if(!showTouch)return false;const b=btns();for(const k in b){if(k==='skip')continue;const c=b[k];if(Math.hypot(tp.x-c.x,tp.y-c.y)<c.r*1.35)return true;}return false;}
function cutAdv(t,auto){const tp=tapped();pressedA=false;const ready=t>(AUTO?.4:1.2);if(ready){g.globalAlpha=.55+.45*Math.sin(T*5);txt('TAP TO CONTINUE ▶',W-96,window._tapTop?22:H-9,11,'#ffe066');g.globalAlpha=1;}
 if(auto)return true;if(!ready){K._cutE=K.Enter;return false;}const enter=K.Enter&&!K._cutE;K._cutE=K.Enter;if(enter)return true;return !!(tp&&!onCtrl(tp)&&(tp.st==null||tp.st>performance.now()-(t-1.2)*1000));}
const BIMG={satboss:'c66',jrocket:'c67',claw:'c68',carrier:'c40',turret:'c41',ace:'c08',grubb:'c42',twins:'c43',krool:'c44',tosser:'c46',smasher:'c47',kreel2:'c48'},BWHO={satboss:'SATELLITE BOSS',jrocket:'JUNK ROCKET',claw:'ACE KREEL',tosser:'ROCK TOSSER',smasher:'SMASHER',kreel2:'ACE KREEL',carrier:'VORR COMMANDER',turret:'TURRET PILOT',ace:'ACE KREEL',grubb:'GRUBB',twins:'VEXA & VOXA',krool:'KROOL'};
function bossCut(s){if(s.cut.type==='refuel')return refuelCut(s);const c=s.cut,t=c.t,d=3.4,L=BCUT[c.type];const a=spk(L.b,BWHO[c.type]||'VORR'),b=spk(L.c,CAPS[cap].name);
 paintCut(t,BIMG[c.type]||'c05',BOSSNAME[c.type],[a,{...b,at:1}],c.type==='kreel2'?'':'BOSS!');
 if(cutAdv(t,AUTO&&t>d))s.cut=null;}
function progressMeter(s){const x0=210,x1=430,y=24,p=clamp(s.dist/s.len,0,1);if(SPM===8){vestaBall(x0-14,y,9);jupBall(x1+14,y,10);}else if(SPM===6){marsBall(x0-14,y,9);vestaBall(x1+14,y,9);}else if(SPM===3){moonBall(x0-14,y,10);marsBall(x1+14,y,9);}else{earth(x0-14,y,10);moonBall(x1+14,y,10);}
 g.fillStyle=OL;g.beginPath();g.roundRect(x0-2,y-5,x1-x0+4,10,5);g.fill();g.fillStyle='#2a335f';g.beginPath();g.roundRect(x0,y-3,x1-x0,6,3);g.fill();
 g.fillStyle=lg(g,0,y-3,0,y+3,['#fff2a0','#ffc53d','#ff8a2a']);g.beginPath();g.roundRect(x0,y-3,Math.max(6,(x1-x0)*p),6,3);g.fill();
 STG.forEach((st,i)=>{const bx=x0+(x1-x0)*st.b/s.len,done=s.bossI>i;g.save();g.translate(bx,y);g.rotate(Math.PI/4);g.fillStyle=OL;g.fillRect(-5,-5,10,10);g.fillStyle=done?'#5fe36a':'#ff4f7b';g.fillRect(-3.5,-3.5,7,7);g.restore();});
 dsp(shipSpr(),x0+(x1-x0)*p,y-1,.32);const nm=s.phase==='boss'?BOSSNAME[s.boss.type]:s.phase==='jump'?'FULL THRUST!':s.phase==='arrive'?(SPM===8?'JUPITER AHEAD':SPM===6?'VESTA ARRIVAL':SPM===3?'MARS ARRIVAL':'MOON ARRIVAL'):STG[Math.max(0,s.sec)].n;txt(nm,W/2,42,8,'#45d6ff');}
function drawSpace(){const s=sp,p=s.dist/s.len,warp=s.phase==='jump'?1:0;setDims(headI(s));if(s.sfo==null||s.bossI===0&&s.phase!=='jump')s.sfo=s.dist*.5;starfield(s.sfo);s.vp=s.vp==null?p:s.vp+(p-s.vp)*Math.min(1,DT*2.5);
 const q=s.vp,eE=1-Math.pow(1-Math.min(1,q/.55),2),mQ=Math.pow(q,1.5),dx=Math.cos(s.ha),dy=Math.sin(s.ha),px=-dy,py=dx,Ld=Math.abs(dx)*270+Math.abs(dy)*150;
 {const tx=W/2+dx*Ld*(1-.5*mQ)+px*(-30*(1-mQ)),ty=H/2+dy*Ld*(1-.5*mQ)+py*(-30*(1-mQ)),tr=5+mQ*175+(s.phase==='arrive'?s.endT*30:0),ox2=W/2-dx*(Ld*.85+eE*380)+px*70,oy2=H/2-dy*(Ld*.85+eE*380)+py*70,or2=240*(1-eE)+16;
 if(SPM===8){jyBg(s);}else if(SPM===6){vestaBall(tx,ty,tr*.55);marsBall(ox2,oy2,or2*.7);}else if(SPM===3){marsBall(tx,ty,tr);moonBall(ox2,oy2,or2*.8);}else{moonBall(tx,ty,tr);earth(ox2,oy2,or2);}}
 
 g.globalAlpha=.07;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
 {const k=Math.min(1,s.vp/.3);if(k<1&&SPM===1){g.save();g.translate(W/2-dx*(-60+k*640)-px*75,H/2-dy*(-60+k*640)-py*75);g.rotate(s.ha);g.scale(1.6-k,1.6-k);iss(0,0);g.restore();}}
 {const B=s.boss;if(B&&B.type==='ace'){B.dk=Math.min(1,(B.dk||0)+DT*(B.dead?-1:.7));if(B.dk>0){g.fillStyle=`rgba(8,0,18,${(B.p2?.6:.45)*B.dk})`;g.fillRect(0,0,W,H);if(B.p2&&!B.dead){g.fillStyle=`rgba(255,30,90,${.08+.06*Math.sin(T*4)})`;g.fillRect(0,0,W,H);}}}}
 g.save();g.translate(W/2,H/2);g.rotate(s.ha);g.scale(1,Math.cos(s.hr)||.001);g.translate(-SW/2,-SH/2);
 {const sp2=warp?1600:220;g.fillStyle='rgba(220,235,255,.75)';g.strokeStyle='rgba(200,230,255,.5)';g.lineWidth=1.5;for(let i=0;i<60;i++){const z=.3+(i%5)*.18,xx=((i*997-s.dist*z*2.2-T*sp2*z*(warp?1:0))%(SW+40)+SW+40)%(SW+40)-20,yy=(i*173.3)%SH;if(warp){g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+60*z,yy);g.stroke();}else g.fillRect(xx,yy,1.6*z+.6,1.6*z+.6);}}
 if(SPM===6)beltBg(s);if(SPM===8)jyMid(s);for(const r of s.rocks){if(r.jk!=null&&jyDrawRock(r))continue;dsp(rockSpr(r.r,r.v,r.junk),r.x,r.y,1,1,r.rot,r.hit>0);}
 for(const q of s.picks){if(q.k==='ring'){ringDraw(q);continue;}if(q.k==='life'){oneUp(q.x,q.y+Math.sin(T*4)*3,1);continue;}if(q.k==='gem'){gemShard(q.x,q.y+Math.sin(T*4)*3,q.gi,q.old);continue;}const c={spread:'#45d6ff',rapid:'#ffc53d',shield:'#5fe36a',charge:'#ff7ae0',fshield:'#7ae8ff'}[q.k],y=q.y+Math.sin(T*4)*3;dglow(q.x,y,22,c,.7);circ(q.x,y,11,OL);g.fillStyle=ballG(g,q.x,y,9.5,9.5,c);g.beginPath();g.arc(q.x,y,9.5,0,TAU);g.fill();}
 for(const b of s.shots){if(b.big){dglow(b.x,b.y,30,'#ff7ae0',.9);circ(b.x,b.y,9,'#ffffff',OL);dglow(b.x,b.y,16,'#ffffff',.8);}else bolt(b.x,b.y);}for(const e of s.eshots){if(e.ms){dglow(e.x-e.vx*.05,e.y-e.vy*.05,10,'#ff7a29',.8);orb(e.x,e.y,'#ff9a3a',5);}else if(e.dust){for(const[dx,dy,r]of[[0,0,9],[-6,-4,6],[6,-3,6],[-4,5,6],[5,5,5]]){circ(e.x+dx,e.y+dy,r+1.5,OL);circ(e.x+dx,e.y+dy,r,'#a07850');}}else if(e.goo){circ(e.x,e.y,7,OL);g.fillStyle=ballG(g,e.x,e.y,5.6,5.6,'#9cff4a');g.beginPath();g.arc(e.x,e.y,5.6,0,TAU);g.fill();}else orb(e.x,e.y,'#ff4f7b',4);}
 for(const f of s.foes){if(f.age<f.del)continue;if(DRAWK[f.kind]){DRAWK[f.kind](f);continue;}if(f.kind==='saucer')blobFighter(f.x,f.y,f.age);else if(f.kind==='sat')satDraw(f);else if(f.kind==='mine')mineDraw(f);else if(f.kind==='pod')podDraw(f);
  else{const fl=(f.dir??-1)>0?-1:1,gc=f.kind==='shield'?'#5fe36a':f.kind==='spreader'?'#ff9a3a':'#45d6ff';dglow(f.x+22*fl,f.y,10,gc,.7);if(f.kind==='spreader')dglow(f.x,f.y,20,'#ff7a29',.35);if(f.cloak&&!f.hit)g.globalAlpha=.35+.15*Math.sin(T*6);dsp(vorrSpr(),f.x,f.y,f.big?1.45:f.kind==='vorr'?1:1.15,fl,Math.sin(f.age*3)*.1,f.hit>0);g.globalAlpha=1;pilot(f.x,f.y-(f.big?4:0),f.pers,f,fl);
   if(f.kind==='shield'){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=f.shHit>0?'#ffffff':'rgba(110,230,255,.75)';g.lineWidth=3.5;g.beginPath();const a0=fl>0?Math.PI*.6:-Math.PI*.4;g.arc(f.x-4*fl,f.y,26,a0,a0+Math.PI*.8);g.stroke();g.restore();}}}
 if(s.boss&&!s.boss.dead)drawBossS(s.boss);m6Draw(s);m8Draw(s);
 debris(s.booms,0);drawFx(0);
 if(s.inv<=0||(T*12|0)%2)ship(s.x,s.y,T,1,1+Math.abs(s.vx)/200+warp);
 if(s.shield>0){g.save();g.globalCompositeOperation='lighter';const fs=s.shT>0;g.strokeStyle=fs?`rgba(122,232,255,${.5+.25*Math.sin(T*8)})`:`rgba(95,227,106,${.3+.15*s.shield})`;g.lineWidth=fs?4:3;if(fs){g.fillStyle='rgba(122,232,255,.12)';g.beginPath();g.ellipse(s.x,s.y,44,28,0,0,TAU);g.fill();}g.beginPath();g.ellipse(s.x,s.y,42,26,0,0,TAU);g.stroke();g.restore();}
 if(s.breachT>0){g.fillStyle=lg(g,0,0,90,0,[`rgba(255,40,80,${.55*s.breachT})`,'rgba(255,40,80,0)']);g.fillRect(0,0,90,SH);}
 g.restore();
 for(const q of s.picks){if(q.k==='gem'||q.k==='ring')continue;const[X,Y]=toS(q.x,q.y+Math.sin(T*4)*3);txt(q.k==='life'?'1UP':{spread:'W',rapid:'R',shield:'S',charge:'C',fshield:'F'}[q.k],X,Y+.5,q.k==='life'?7:9,'#ffffff');}
 for(const q of s.pops){if(!q.comic)continue;const[X,Y]=toS(q.x,q.y);g.globalAlpha=Math.min(1,q.l*2);q.l0=q.l0||q.l;sfxText(q.t,X,Y,q.sz||16,q.l0-q.l,q.rot||-.15);g.globalAlpha=1;}
 if(s.breachT>0){s.breachT-=DT;if((T*10|0)%2)txt('! BREACH !',W/2,H-56,14,'#ff4f7b');}
 if(s.boss&&!s.boss.dead)bossHud(s.boss);
 hud(s.hp,s.maxhp||5);progressMeter(s);if(SPM===6)txt('TIME '+fmtT(s.time||0)+(s.rings?'   RINGS '+s.rings:''),W/2,58,9,'#5fe36a');txt('◆ GEMS '+gemN(SPM)+'/5',44,46,8,'#ff9af0','left');
 if(s.mult>1||s.combo>2){txt('x'+s.mult,W-14,64,16,s.mult>=4?'#ff4fd0':'#ffc53d','right');txt('COMBO '+s.combo,W-14,80,8,'#ffffff','right');}
 const pw=[];if(s.pw.spread>0)pw.push('SPREAD '+Math.ceil(s.pw.spread));if(s.pw.rapid>0)pw.push('RAPID '+Math.ceil(s.pw.rapid));if(s.pw.charge>0)pw.push('CHARGE '+Math.ceil(s.pw.charge));if(s.shield>0)pw.push((s.shT>0?'FORCE FIELD '+Math.ceil(s.shT)+'s ':'SHIELD ')+'x'+s.shield);if(pw.length)txt(pw.join('  '),44,32,8,'#5fe36a','left');

 if(s.phase==='arrive'){g.globalAlpha=clamp(s.endT/2,0,1);txt(SPM===8?'JUPITER AHEAD!':SPM===6?'VESTA ARRIVAL':SPM===3?'MARS ARRIVAL':'MOON ARRIVAL',W/2,H/2,26,'#ffffff');if(SPM===6&&s.sb!=null)txt('TIME '+fmtT(s.time)+'   SPEED BONUS +'+s.sb,W/2,H/2+34,13,'#5fe36a');g.globalAlpha=1;}
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
function drawMoon(){if(mission===9&&SK)return drawSky();const m=M,cx=m.cam,cy=m.camY;if(m.mars){g.fillStyle=lg(g,0,0,0,H,['#2a0c1e','#6a2420','#c0582e']);g.fillRect(0,0,W,H);moonBall(520-cx*.02,60-cy*.08,14);moonBall(140-cx*.015,40-cy*.06,8);}else{starfield(cx*.1);earth(520-cx*.02,70-cy*.08,30);}g.globalAlpha=.07;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
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
 for(const w of m.walls)if(w[4]!=='door')dsp(rockSprM(w[2],w[3]),w[0]-cx,w[1]);
 for(const p of m.picks){if(p.got)continue;const x=p.x-cx,y=p.y+Math.sin(T*4)*3;if(p.k==='life'){oneUp(x,y);continue;}if(p.k==='water'){waterDrop(x,y);continue;}dglow(x,y,18,p.k==='hp'?'#ff4f7b':p.k==='spread'?'#45d6ff':'#b9f6ff',.7);if(p.k==='gem'){gemShard(x,y,p.gi,GEMS[m.lv][p.gi]);continue;}if(p.k==='tank'){dglow(x,y,26,'#ffc53d',.8);dsp(pickSpr('hp'),x,y,1.3);txt('E',x,y,9,'#fff2a0');}else dsp(pickSpr(p.k==='secret'?'c':p.k),x,y,1,1,p.k==='secret'?Math.sin(T*2)*.3:0);}
 if(m.cfx){for(const q of m.cfx){q.l-=DT;g.globalAlpha=clamp(q.l*2,0,1);sfxText(q.t,q.x-cx,q.y,q.sz||16,.7-q.l,q.rot);g.globalAlpha=1;}m.cfx=m.cfx.filter(q=>q.l>0);}
 for(const f of m.foes){const x=f.x-cx;if(x<-40||x>W+40)continue;g.save();if(f.mode==='trip'){g.translate(x,f.y);g.rotate(f.face*1.2);g.translate(-x,-f.y);}
  if(f.type==='squid')squid(x,f.y,f.t,f.face,f.hit>0);else if(f.type==='bug')goofFlyer(x,f.y,f.t,f.face,f.hit>0);else if(f.rt)drawBotT(f,x);else if(f.bot)colonyBot(x,f.y-(f.jy?Math.abs(Math.sin(f.t*7))*14:0),f.t,f.face,{freed:f.freed,flash:f.hit>0});else blob(x,f.y,f.t,{r:24,face:f.face,scared:f.scared||f.mode==='trip',flash:f.hit>0});g.restore();if(f.mode==='flee'&&(f.t*10|0)%3===0)addFx(f.x-f.face*8,f.y,'dust',.6);}
 if(m.boss&&m.boss.whale){if(!m.boss.dead)drawWhale(m.boss,cx);}else if(m.boss&&(m.boss.hp>0))drawBoss(m.boss,cx);else if(m.boss&&m.boss.pl&&!m.boss.dead)drawPilot(m.boss,cx);
 for(const b of m.shots){if(b.big){dglow(b.x-cx,b.y,26,'#d070ff',.95);circ(b.x-cx,b.y,10,OL);circ(b.x-cx,b.y,8,'#f0c0ff');circ(b.x-cx,b.y,4,'#ffffff');}else bolt(b.x-cx,b.y,m.spread>0);}
 for(const e of m.eshots){if(e.junk||e.water){junkDraw(e,cx);continue;}if(e.wave){dglow(e.x-cx,e.y,18,'#ffb040',.85);g.fillStyle=lg(g,0,e.y-6,0,e.y+4,['#fff6c0','#ff9a3a']);g.beginPath();g.ellipse(e.x-cx,e.y-2,20,8,0,0,TAU);g.fill();}else if(e.cr){const X=e.x-cx;dglow(X,e.y,14,'#ff4fd0',.8);g.fillStyle=OL;g.beginPath();g.moveTo(X,e.y-14);g.lineTo(X+7,e.y);g.lineTo(X,e.y+12);g.lineTo(X-7,e.y);g.closePath();g.fill();g.fillStyle=lg(g,0,e.y-12,0,e.y+10,['#ffd0f0','#ff3aa0','#7a1050']);g.beginPath();g.moveTo(X,e.y-11);g.lineTo(X+5,e.y);g.lineTo(X,e.y+9);g.lineTo(X-5,e.y);g.closePath();g.fill();}else if(e.wat){circ(e.x-cx,e.y,7,OL);g.fillStyle=ballG(g,e.x-cx,e.y,5.8,5.8,'#7ae8ff');g.beginPath();g.arc(e.x-cx,e.y,5.8,0,TAU);g.fill();}else orb(e.x-cx,e.y,e.zap?'#ff9a3a':e.big?'#5fe36a':'#ff4f7b',e.big?9:5);}
 if(m.on&&!wasOn)sfx('land'),addFx(m.px,m.py,'dust',1.2),addFx(m.px-8,m.py,'dust',.8);if(m.on&&Math.abs(m.vx)>100&&(T*12|0)%5===0)addFx(m.px-m.face*8,m.py,'dust',.6);wasOn=m.on;
 if(m.mars)marsSetDraw(cx,0);else reactorDraw(cx);
 const hurtNow=m.inv>.8;if(m.inv<=0||hurtNow||(T*12|0)%2)captain(m.px-cx,m.py,CAPS[cap],{face:m.face,run:m.on&&Math.abs(m.vx)>10?m.run:0,air:!m.on,vy:m.vy,shoot:m.shooting>0,t:T,hurt:hurtNow,flash:hurtNow&&(T*20|0)%2});
 if(m.mars)marsSetDraw(cx,1);if((m.chg||0)>.3){const k=Math.min(1,m.chg/.8);dglow(m.px-cx+m.face*20,m.py-26,10+k*16,k>=1?'#ff7aff':'#b04aff',.9);}
 debris(m.booms,cx);drawFx(cx);if(m.mars){if(!m.ldr&&5650-cx>-60&&5650-cx<W+60)leaderBot(5650-cx,GROUND,T,true);g.restore();g.save();g.globalCompositeOperation='multiply';g.fillStyle='#ffe0cc';g.fillRect(0,0,W,H);g.restore();g.save();}g.restore();darkness(cx,cy);
 hud(m.hp,m.maxhp);if(m.tip){panel(116,26,408,58,'#ffc53d');hayesP(140,76,.95);wrap('HAYES: '+m.tip.t,342,42,350,11.5,'#ffffff',16);}if(!m.lock&&!m.tip)txt('M'+m.lv+' · '+(m.lv===4?MSECT4:MSECT).reduce((a,c)=>m.px>=c[0]?c[1]:a,'')+'   ◆ GEMS '+gemN(m.lv)+'/5',W/2,16,10,'#45d6ff');
 m.msgs.slice(-3).forEach((s,i)=>capBox(s.t,W/2,100+i*25));
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
  g.fillStyle=m.mars?'#1a0806':'#0c0a14';g.beginPath();g.moveTo(A,-500);for(let x=0;x<=db-da;x+=40)g.lineTo(A+x,(m.mars&&da+x>7600&&da+x<8700?-470:-40)+Math.sin((da+x)*.013)*30+((da+x)*7%23));g.lineTo(B,-500);g.fill();
  for(let x=da+80;x<db;x+=260){const X=x-cx;if(X<-40||X>W+40)continue;if(!m.mars)for(let k=0;k<3;k++){g.fillStyle='#45d6ff';g.globalAlpha=.8;g.beginPath();g.moveTo(X+k*9,G0-60-k*12);g.lineTo(X+k*9+5,G0-80-k*14);g.lineTo(X+k*9+10,G0-60-k*12);g.fill();g.globalAlpha=1;}dglow(X+10,G0-70,24,'#45d6ff',.4);}
  if(m.mars)caveArt(cx);else for(const lx of m.lamps){const X=lx-cx;if(X<-30||X>W+30)continue;g.fillStyle=OL;g.fillRect(X-3,G0-110,6,110);g.fillStyle='#5a6088';g.fillRect(X-1.5,G0-108,3,108);circ(X,G0-114,6,'#fff2c0',OL);dglow(X,G0-114,30,'#ffd27a',.8);}}
 for(const s of INTS)if(m.mars){if(s[0]<7000)colonyInt(s[0],s[1],s[2],s[3],cx);}else interior(s[0],s[1],s[2],s[3],cx);if(m.mars)marsGardens(cx);
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
const PX=16,PY=34,PW=W-32,PH=222,STY0=PY+PH+6,STY1=H-16;
let HALF=null;function halftone(){if(HALF)return HALF;const c=mkc(8,8),x=c.getContext('2d');x.fillStyle='#000';x.beginPath();x.arc(2,2,1.3,0,TAU);x.arc(6,6,1.3,0,TAU);x.fill();HALF=g.createPattern(c,'repeat');return HALF;}
function cText(s,x,y,size,col,maxw,lh,al='left'){setF(size);g.fillStyle=col;g.textAlign=al;g.textBaseline='top';const words=s.split(' ');let line='',yy=y;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxw&&line){g.fillText(line,x,yy);yy+=lh;line=w;}else line=t;}g.fillText(line,x,yy);return yy+lh;}
function fitLines(str,maxw,size,minS){let out;for(let z=size;z>=minS;z-=.5){setF(z);const words=String(str).split(' ');const L=[];let line='';let ok=true;for(const w of words){const t=line?line+' '+w:w;if(g.measureText(t).width>maxw&&line){L.push(line);line=w;}else line=t;if(g.measureText(w).width>maxw)ok=false;}if(line)L.push(line);out={lines:L,size:z};if(ok&&L.length<=4)break;}return out;}
function drawLines(f,cx,y,col,al){setF(f.size);g.fillStyle=col;g.textAlign=al||'center';g.textBaseline='top';const lh=f.size*1.4;f.lines.forEach((l,i)=>g.fillText(l,cx,y+i*lh));return f.lines.length*lh;}
function caption(s,x,y,w){const pad=9;for(;w<440;w+=20){const q=fitLines(s,w-pad*2,CAPF,CAPF);if(q.lines.length<=2)break;}w=Math.min(w,W-x-8);const f=fitLines(s,w-pad*2,CAPF,CAPF-3),lh=f.size*1.4,h=f.lines.length*lh+pad*2-f.size*.3;g.fillStyle=OL;g.fillRect(x-2,y-2,w+4,h+4);g.fillStyle='#ffe066';g.fillRect(x,y,w,h);drawLines(f,x+pad,y+pad-1,'#1a1020','left');}
function bubW(s,w){for(let k=w;k<=380;k+=20){const f=fitLines(s,k*.74-10,BUBF,BUBF-3);if(f.size>=BUBF-1&&f.lines.length<=3)return k;}return 380;}
const BUBF=16,CAPF=14;
function bubH(s,w,shout){w=bubW(s,w);const f=fitLines(s,w*.74-10,BUBF,BUBF-4),lh=f.size*1.4,th=f.lines.length*lh;return Math.max(34,th*1.45+(shout?22:14))*(shout?1.12:1);}
function capH(s,w){const f=fitLines(s,w-18,CAPF,CAPF-3);return f.lines.length*f.size*1.4+18-f.size*.3;}
function bubble(s,x,y,w,tx,ty,shout){const w0=w;w=bubW(s,w);x-= (w-w0)/2;const f=fitLines(s,w*.74-10,BUBF,BUBF-4),lh=f.size*1.3,th=f.lines.length*lh,h=Math.max(40,th*1.4+(shout?22:14));x=clamp(x,8,W-8-w);y=clamp(y,36,H-8-h);g.save();g.fillStyle='#fff';g.strokeStyle=OL;g.lineWidth=3;
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
// ===================== TORN STAR MAP + JUPITER COMICS =====================
const MAPROW={1:['@','The path starts at the Moon!','No crystal under ANY rock. I checked 400 rocks.'],2:['@','Next piece points to Mars.','It must be in a fuel tank! ...Nope. Just fuel.'],3:['@','Mars! Getting warmer.','Malakar\'s digging on Mars. It\'s buried. Has to be.'],
 4:['@','Someone is calling for help on the map!','Digging done. Found... a sock.'],5:['COMET','BEEP. Smells like adventure. And asteroids.','Maybe it\'s inside a space potato. Asteroids look like potatoes.'],6:['COMET','BEEP. Path goes UP.','Top of a mountain! Crystals LOVE views.'],
 7:['@','Jupiter... but the end is still missing.','Fine. It\'s in the junkyard. Treasure is ALWAYS in the junk.'],8:['COMET','BEEP. Someone drew a hat?','I\'ll check every piece of junk... again.'],9:['@','Behind the Golden Record. The whole time!','VOYAGER?! I said Voyager! ...Did I say Voyager?']};
const MAPPT=[[78,236],[132,180],[190,226],[246,168],[300,214],[356,150],[414,196],[470,140],[536,176]];
function mapIcon(i,x,y){g.save();g.translate(x,y);g.strokeStyle='#5a3a1a';g.lineWidth=2;g.fillStyle='rgba(90,58,26,.25)';
 if(i===0){g.beginPath();g.arc(0,0,13,0,TAU);g.fill();g.stroke();g.beginPath();g.arc(-4,-3,3,0,TAU);g.arc(5,4,2,0,TAU);g.stroke();}
 else if(i===1){for(let k=0;k<3;k++){g.beginPath();g.roundRect(-16+k*12,-6,8,14,2);g.fill();g.stroke();}}
 else if(i===2){g.beginPath();g.arc(0,0,14,0,TAU);g.fill();g.stroke();g.fillStyle='#5a3a1a';txt('★',8,-10,10,'#c04a2a');}
 else if(i===3){g.beginPath();g.arc(-4,2,8,0,TAU);g.fill();g.stroke();g.beginPath();for(let k=1;k<4;k++)g.arc(6,-6,k*4,-1.2,-.2);g.stroke();}
 else if(i===4){for(let k=0;k<6;k++){g.beginPath();g.ellipse(-16+k*6,Math.sin(k*2)*5,4,3,k,0,TAU);g.fill();g.stroke();}}
 else if(i===5){g.beginPath();g.moveTo(-15,10);g.lineTo(0,-14);g.lineTo(15,10);g.closePath();g.fill();g.stroke();}
 else if(i===6){g.beginPath();g.arc(0,0,15,0,TAU);g.fill();g.stroke();for(const yy of[-6,0,6]){g.beginPath();g.moveTo(-14,yy);g.lineTo(14,yy);g.stroke();}}
 else if(i===7){for(let k=0;k<3;k++){g.beginPath();g.arc(-8+k*8,0,6,Math.PI,TAU);g.stroke();}g.beginPath();g.moveTo(10,-6);g.lineTo(15,-20);g.lineTo(20,-6);g.closePath();g.stroke();}
 else{g.strokeStyle='#5a3a1a';g.beginPath();g.moveTo(-16,-8);g.quadraticCurveTo(-6,-20,4,-8);g.stroke();g.beginPath();g.moveTo(-6,-10);g.lineTo(-6,4);g.stroke();g.fillStyle='#d8a830';g.beginPath();g.arc(-6,10,7,0,TAU);g.fill();g.stroke();g.fillStyle='#fff3c0';g.beginPath();g.arc(-6,10,2,0,TAU);g.fill();txt('VOYAGER',4,26,7,'#5a3a1a');}
 g.restore();}
function drawStarMap(n,t){g.fillStyle=lg(g,0,0,0,H,['#1a1230','#0a0818']);g.fillRect(0,0,W,H);starfield(T*4);
 const kk=PH/272;g.save();g.translate(PX+PW/2,PY+2);g.scale(kk,kk);g.translate(-320,-24);g.save();const x0=40,y0=70,x1=600,y1=290;g.fillStyle=OL;g.beginPath();g.moveTo(x0-4,y0-4);g.lineTo(x1+4,y0-4);g.lineTo(x1+4,y1+4);g.lineTo(x0-4,y1+4);g.fill();
 // parchment; the unrevealed part to the right of piece n is torn away
 const tearX=n>=9?x1:Math.min(x1,MAPPT[Math.min(8,n)][0]-20);g.fillStyle=lg(g,0,y0,0,y1,['#f2dcaa','#e0c082','#caa060']);g.beginPath();g.moveTo(x0,y0);g.lineTo(tearX,y0);
 if(n<9){for(let yy=y0;yy<=y1;yy+=14)g.lineTo(tearX+((yy/14|0)%2?10:-6),yy);}g.lineTo(tearX,y1);g.lineTo(x0,y1);g.closePath();g.fill();g.strokeStyle='#8a6030';g.lineWidth=3;g.stroke();
 // route
 g.setLineDash([6,6]);g.strokeStyle='#2a8ab8';g.lineWidth=3;g.beginPath();for(let i=0;i<Math.min(n,9);i++){const[a,b]=MAPPT[i];i?g.lineTo(a,b):g.moveTo(a-40,b+20);}g.stroke();g.setLineDash([]);
 for(let i=0;i<Math.min(n,9);i++){const[a,b]=MAPPT[i],nw=i===n-1,k=nw?clamp((t-.4)/.6,0,1):1;if(nw){dglow(a,b,40*(1.5-k*.5),'#7ae8ff',.6*(1-k*.4));g.save();g.translate(a,b);g.scale(.6+k*.4,.6+k*.4);g.translate(-a,-b);}mapIcon(i,a,b);if(nw)g.restore();}
 g.restore();txt('DR. VEGA\'S STAR MAP',W/2,44,16,'#ffc53d');g.restore();}
function mapBeats(n){const r=MAPROW[n];if(!r)return[];return[{d:4,int:2,draw:t=>drawStarMap(n,t),cap:n===9?'The map is complete!':'Another piece of the star map glows into place.',bub:[{s:r[1],who:r[0],x:40,y:230,w:240,tx:200,ty:180,at:.9}],fx:{s:'SHINK!',x:500,y:90,sz:26,at:.5,c1:'#bfe8ff',c2:'#3a7aff'}},
 {img:'c08',d:3.6,int:2,cap:n===9?'Hiding in a nearby cloud...':'Meanwhile, in Kreel\'s cockpit...',bub:[{s:r[2],who:'ACE KREEL',x:40,y:230,w:240,tx:200,ty:180,at:.4}]}];}
const JUPGO=[
 {img:'c71',d:4.5,int:3,cap:'Jupiter! Clouds as big as continents.',bub:[{s:'Hayes, these clouds look solid enough to walk on.',who:'@',x:40,y:230,w:240,tx:200,ty:180,at:.5},{s:'Then walk. Carefully, Captain!',who:'HAYES',x:340,y:230,w:220,tx:400,ty:180,at:2.2}],fx:{s:'WHOOSH!',x:470,y:60,sz:28,at:.3}},
 {img:'c72',d:4.5,int:3,sting:1,cap:'Over the giant red storm, something grumbles.',bub:[{s:'WHO DARES HOP ON MY CLOUDS?!',who:'STORM KING',x:40,y:230,w:250,tx:200,ty:180,at:.5}],fx:{s:'KRAKA-BOOM!',x:440,y:60,sz:28,at:.3}},
 {img:'c77',d:4.5,int:3,cap:'Far ahead: a sky city. And a Vorr balloon fortress.',bub:[{s:'BEEP! Kreel\'s goons are already there.',who:'COMET',x:40,y:230,w:240,tx:200,ty:180,at:.5}]}];
const JUPWIN=[
 {img:'c73',d:4.5,int:2,cap:'Deep in the clouds...',bub:[{s:'Hmm? Visitors! Nobody visits. Except that one shiny fellow.',who:'CLOUD WIZARD',x:40,y:230,w:250,tx:200,ty:180,at:.5}]},
 {d:5,int:2,cap:'Decades ago...',draw:t=>{const im=IMG.comic_c04;g.fillStyle='#2a1a0a';g.fillRect(0,0,W,H);if(im){g.filter='sepia(0.85) brightness(0.95)';drawPanelImg(im,PX,PY,PW,PH);g.filter='none';}skPuffy(PX+PW-150,PY+PH-30,120,50,'rgba(250,236,210,.95)','#5a3a1a');},bub:[{s:'A little ship with a golden record. It waved back. Probably.',who:'CLOUD WIZARD',x:40,y:230,w:250,tx:200,ty:180,at:.5}]},
 {img:'c74',d:5,int:3,sting:1,cap:'The Crystal Keys glow with his amulet.',bub:[{s:'Dr. Vega hid the Heart Crystal behind that Golden Record. On Voyager.',who:'CLOUD WIZARD',x:40,y:230,w:260,tx:200,ty:180,at:.5}],fx:{s:'SHIMMER!',x:470,y:60,sz:24,at:.3}},
 {img:'c75',d:4.5,int:2,cap:'The last torn piece!',bub:[{s:'BEEP. Beard storage. Smart.',who:'COMET',x:40,y:230,w:240,tx:200,ty:180,at:.6}],fx:{s:'SHINK!',x:470,y:60,sz:26,at:.3,c1:'#bfe8ff',c2:'#3a7aff'}},
 {d:4,int:3,cap:'',draw:t=>drawStarMap(9,t),bub:[{s:'Follow the path... to Voyager!',who:'@',x:40,y:230,w:240,tx:200,ty:180,at:.5}]},
 {img:'c76',d:4.5,int:2,sting:1,cap:'Not far away...',bub:[{s:'ACHOO! ...I mean, I heard nothing. Racing there now!',who:'ACE KREEL',x:40,y:230,w:250,tx:200,ty:180,at:.5}],fx:{s:'ACHOO!',x:450,y:60,sz:30,at:.3}}];
const OPENING=[
 {img:'o01',d:5,int:0,cap:'A quiet night at Mission Control.',bub:[{s:'Nothing ever happens on the night shift.',who:'HAYES',x:40,y:230,w:240,tx:200,ty:180,at:.8}],fx:{s:'SLURRRP',x:470,y:80,sz:22,at:2.4}},
 {img:'o02',d:5,int:1,cap:'Then...',bub:[{s:'Uh, Hayes? The Keys are GLOWING.',who:'@',x:40,y:230,w:240,tx:200,ty:180,at:1}],fx:{s:'HUMMMM!',x:470,y:80,sz:24,at:.3,c1:'#bfe8ff',c2:'#8a3aff'}},
 {img:'o03',d:4.5,int:1,cap:'A signal. From very, VERY far away.',fx:{s:'BLIP... BLIP...',x:440,y:80,sz:22,at:.4}},
 {img:'o04',d:5,int:2,cap:'',bub:[{s:'The Heart Crystal is out there. Follow the path.',who:'SIGNAL',x:40,y:230,w:250,tx:200,ty:180,at:.6}]},
 {img:'o05',d:5,int:2,cap:'Dr. Vega\'s old star map!',bub:[{s:'She said it would only light up when the Keys did.',who:'HAYES',x:40,y:230,w:250,tx:200,ty:180,at:.6}]},
 {img:'o06',d:5,int:2,cap:'The path is there. The end is not.',bub:[{s:'Who rips the end off a treasure map?!',who:'@',x:40,y:230,w:240,tx:200,ty:180,at:.8}],fx:{s:'RIIIP!',x:480,y:80,sz:28,at:.3}},
 {img:'o07',d:4.5,int:3,warn:1,cap:'',bub:[{s:'Knock knock, Earthlings!',who:'ACE KREEL',x:40,y:230,w:220,tx:200,ty:180,at:.6}],fx:{s:'KRASSH!',x:470,y:80,sz:32,at:.2}},
 {img:'o08',d:4.5,int:3,cap:'ACE KREEL, Malakar\'s deadliest pilot.',bub:[{s:'One Key for me. Thanks for the night light!',who:'ACE KREEL',x:40,y:230,w:250,tx:200,ty:180,at:.6}],fx:{s:'SNATCH!',x:470,y:80,sz:26,at:.3}},
 {img:'c07',d:5,int:3,sting:1,cap:'VORR KING MALAKAR',bub:[{s:'Find the Heart Crystal before they do, Kreel. Or else.',who:'MALAKAR',x:40,y:230,w:250,tx:200,ty:180,at:.6}]},
 {img:'o10',d:4.5,int:3,cap:'',bub:[{s:'Easy! It\'s probably under a big rock. On the Moon!',who:'ACE KREEL',x:40,y:230,w:250,tx:200,ty:180,at:.5}],fx:{s:'FWOOSH!',x:470,y:80,sz:28,at:.3}},
 {img:'c10',d:4.5,int:3,cap:'Mission Control.',bub:[{s:'Each Vorr boss carries a Crystal Key. Get them back!',who:'HAYES',x:40,y:230,w:250,tx:200,ty:180,at:.5}]},
 {img:'o11',d:4.5,int:3,cap:'',bub:[{s:'Hayes, warm up Pale Blue!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.4},{s:'Bring back our Key, Captain!',who:'HAYES',x:340,y:230,w:220,tx:400,ty:180,at:2}]},
 {img:'o12',d:4.5,int:3,sting:1,cap:'The race for the Heart Crystal begins!',fx:{s:'KA-BOOOOM!',x:460,y:80,sz:32,at:.3}}];

const COMIC=[
 ...OPENING,
 ...[0,1,2,3].map(i=>({d:3.4,int:3,cap:'',capI:i,img:'c'+String(11+i),draw:t=>{const cols=['#2f7bff','#ff4f7b','#3fae5a','#8a5cff'];g.fillStyle=cols[i];g.fillRect(0,0,W,H);speedLines(200,180,'rgba(255,255,255,.22)');
  const sx=Math.max(0,1-t/.35)*-300;capCard(i,60+sx,30,240,300);g.fillStyle=OL;g.fillRect(330,110,270,46);g.fillStyle='#ffe066';g.fillRect(333,113,264,40);txt(CAPS[i].name,465,133,17,'#ffffff');cText(CAPS[i].bio,340,166,14,'#ffffff',250,20);txt('CAPTAIN '+(i+1)+' OF 4',465,90,9,'#ffffff');}})),
 {d:4.5,int:3,sting:1,img:'c15',cap:'Choose who flies Pale Blue.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#ff9a5a','#5a4a9a','#1a1a4a']);g.fillRect(0,0,W,H);g.fillStyle='#2a2a3a';g.fillRect(0,270,W,90);g.fillStyle=OL;g.fillRect(420,110,26,160);g.strokeStyle='#d04020';g.lineWidth=2;g.strokeRect(422,112,22,156);
  g.save();g.translate(330,190);g.rotate(-Math.PI/2);ship(0,0,0,2.4,0);g.restore();},fx:{s:'GO TIME!',x:180,y:120,sz:28,at:1.2}}];
function comicGo(i){if(!CB)CB=splitB(COMIC);comicI=i;comicT=0;const b=CB[i];if(!b)return;MUS.intensity=b.int;if(b.warn)sfx('warn');if(b.sting)sfx('stinger');if(b.capI!==undefined)capHit(b.capI);sfx('whoosh');if((b.bub||[]).some(q=>q.who==='COMET'||q.who==='CODED SIGNAL'||q.who==='SIGNAL'))for(let k=0;k<3;k++)setTimeout(()=>sfx('blip'),550+k*130);}
let CB=null,CEND=null;const INTER1=[
 {img:'c16',d:3.6,int:2,cap:'Kreel\'s fighter limps away into the dark...',draw:t=>{starfield(T*30);moonBall(470,170,150);speedLines(200,170,'rgba(255,120,160,.12)');dsp(vorrSpr(),200-t*30,140-t*12,2.4-t*.3,1,-.3);dglow(160-t*30,150,20,'#ff7a29',.8);},bub:[{s:'This isn\'t over, Earthling! Malakar will hear of this!',x:300,y:40,w:250,tx:230,ty:120,at:.5,shout:1}],fx:{s:'FWOOSH!',x:120,y:250,sz:26,at:.3}},
 {d:3.6,int:2,img:'c10',cap:'Mission Control, Earth.',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#1c2458','#0c0f2a']);g.fillRect(0,0,W,H);hayesP(200,330,7);},bub:[{s:'Great flying, Captain! Pale Blue is in lunar orbit.',x:330,y:80,w:250,tx:300,ty:170,at:.4}]},
 {img:'c17',d:3.8,int:3,sting:1,cap:'Below: the outpost. Dark. Crawling with blobs.',draw:t=>{starfield(0);earth(560,60,26);g.fillStyle=lg(g,0,240,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,240,W,H);for(let i=0;i<6;i++)blob(80+i*90,266+(i%2)*12,T+i,{r:16+(i%3)*4,face:i%2?1:-1});ship(420,120+Math.sin(t*2)*6,T,1.3);},bub:[{s:'Setting her down. Keep the coffee warm, Hayes.',x:60,y:40,w:240,tx:380,ty:110,at:.6}],fx:{s:'BLORP!',x:520,y:220,sz:24,at:1}}];
function marsBall(x,y,r){circ(x,y,r+3,OL);g.fillStyle=ballG(g,x,y,r,r,'#e2603a');g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.fillStyle='rgba(120,30,20,.35)';for(const[a,b,c]of[[-.3,-.2,.25],[.25,.15,.18],[-.05,.35,.14]]){g.beginPath();g.ellipse(x+a*r,y+b*r,c*r,c*r*.6,.3,0,TAU);g.fill();}}
const MOONWIN=[
 {img:'c18',d:5,int:3,sting:1,cap:'The Vorr mech lies in pieces. Its pilot has other plans.',draw:t=>{starfield(0);earth(560,60,26);g.fillStyle=lg(g,0,250,0,H,['#c8ccd8','#7a7e90']);g.fillRect(0,250,W,H);speedLines(420,230,'rgba(255,255,255,.2)');
   g.save();g.translate(170,300);g.rotate(.5);dsp(bossSpr('trip'),0,0,1.1);g.restore();for(let i=0;i<4;i++)dglow(120+i*40,250-i*12,20,'#ff9a3a',.5);
   g.save();g.translate(430+t*40,300-Math.abs(Math.sin(t*9))*16);g.scale(2.2,2.2);pilotFig(0,0,T*2,1,'hop',false);g.restore();},
  bub:[{s:'You win THIS time! Big Blorp is telling King Malakar!',x:330,y:70,w:240,tx:470,ty:230,at:.6,shout:1}],fx:{s:'SCRAM!',x:560,y:200,sz:26,at:.3}},
 {d:5.5,int:3,img:'c07',cap:'Far away, aboard the Vorr flagship...',bub:[{s:'Two Crystal Keys gone? No matter. I will take the rest, and then the Heart Crystal!',x:350,y:180,w:250,tx:330,ty:150,at:.6}]},
 {d:5.5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Great work, Captain! Two keyholes filled. Keep moving!',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {img:'c19',d:4.5,int:3,sting:1,cap:'The race for the Heart Crystal continues.',draw:t=>{starfield(T*30);moonBall(90,290,60);marsBall(520,120,46);speedLines(320,180,'rgba(255,197,61,.18)');ship(220+t*30,200-t*10,T,1.1);},
  fx:{s:'NEXT STOP: MARS!',x:330,y:300,sz:28,at:.5,rot:-.08}}];
const MARSGO=[
 {img:'c19',d:5,int:3,cap:'Leaving the Moon with two Crystal Keys aboard.',draw:t=>{starfield(T*12);moonBall(160,250,110);ship(380+t*20,130,T,1.1);},bub:[{s:'Two Keys safe. But our fuel is almost gone!',x:330,y:220,w:270,tx:400,ty:160,at:.5}]},
 {img:'c20',d:5,int:3,cap:'Big Blorp escaped the Moon in a Zibbit taxi!',draw:t=>{starfield(T*30);moonBall(120,250,95);speedLines(420,190,'rgba(255,255,255,.15)');zibTaxi(400+t*10,200+Math.sin(T*3)*5,1.7);},bub:[{s:'Faster! Blorp must warn the fuel stations. The Earthlings have TWO Crystal Keys!',x:330,y:44,w:280,tx:420,ty:150,at:.4}],fx:{s:'VROOOM!',x:200,y:120,sz:24,at:.3}},
 {d:5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Three Vorr-held fuel stations between you and Mars. Free them, fill up, and go!',x:330,y:70,w:270,tx:300,ty:180,at:.4}]}];
const MARSLAND=[
 {img:'c21',d:5,int:3,cap:'Mars. Ten minutes to touchdown.',draw:t=>{comicBack('mtn',0,0,W,H,t);for(let i=0;i<6;i++){circ(330+i*16,200+((i*7)%3)*8,3.4,OL);circ(330+i*16,200+((i*7)%3)*8,2.4,'#ffe066');}ship(150+t*30,90+t*10,T,1);},bub:[{s:'There\'s the colony. No lights on. That\'s not good.',x:300,y:56,w:250,tx:200,ty:100,at:.5}]},
 {d:5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'The colony robots stopped answering us. Free them, find the leader, and watch for Vorr.',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {img:'c22',d:5,int:3,cap:'Somewhere in the tunnels...',draw:t=>{comicBack('cave',0,0,W,H,t);speedLines(320,200,'rgba(255,210,150,.1)');g.save();g.translate(200,250);g.scale(1.6,1.6);blob(0,0,T,{r:26,face:1,angry:1,col:'#4fd65c'});dsp(domeSpr(),0,0);g.restore();rim(()=>dustWhale(460,220,.7,T,{}));},bub:[{s:'Big Blorp is back! My Dust Whale guards all the water now!',x:40,y:60,w:270,tx:200,ty:180,at:.4}],fx:{s:'BLORP!',x:500,y:300,sz:26,at:.3}}];
const MARSWIN=[
 {img:'c23',d:4.5,int:3,cap:'Meanwhile, behind a rock...',draw:t=>{comicBack('cave',0,0,W,H,t);speedLines(320,200,'rgba(255,210,150,.1)');g.save();g.translate(220+t*60,250);g.scale(1.8,1.8);blob(0,0,T*2,{r:24,face:1,scared:1,col:'#4fd65c'});dsp(domeSpr(),0,0);g.restore();},bub:[{s:'My whale! My water! Big Blorp is out of here!',x:330,y:60,w:260,tx:300,ty:200,at:.4}],fx:{s:'SCRAM!',x:520,y:300,sz:26,at:.3}},
 {img:'c24',d:5,int:3,cap:'The Dust Whale lets go...',draw:t=>{comicBack('cave',0,0,W,H,t);speedLines(320,200,'rgba(255,210,150,.1)');for(let i=0;i<40;i++){const u=((t*.6+i/40)%1);circ(100+i*12+Math.sin(i)*20,300-u*260,4+i%3,'#7ae8ff');}rim(()=>dustWhale(320,220,.8,T,{}));},bub:[{s:'Okay, okay! Water back on. Glub.',x:380,y:60,w:220,tx:360,ty:170,at:.5}],fx:{s:'SPLOOOSH!',x:470,y:40,sz:26,at:.2}},
 {img:'c25',d:5.5,int:3,cap:'The water flows back to the colony gardens!',draw:t=>{comicBack('colony',0,0,W,H,t);for(let i=0;i<9;i++){const x=50+i*68,gr=clamp(t*1.4-i*.1,0,1);g.fillStyle='#4a8a3a';g.beginPath();g.ellipse(x,330-gr*20,22*gr+4,30*gr+4,0,Math.PI,TAU);g.fill();if(gr>.6){circ(x,300-gr*30,7,OL);circ(x,300-gr*30,5.5,['#ff7ae0','#ffe066','#7ae8ff'][i%3]);}}leaderBot(320,310,T,false);colonyBot(200,320,T,1,{freed:1});colonyBot(450,320,T+1,-1,{freed:1});},bub:[{s:'The water is back! Our gardens are blooming! Thank you, Captain!',x:360,y:60,w:240,tx:330,ty:200,at:.5}],fx:{s:'BLOOM!',x:150,y:80,sz:28,at:.4}},
 {d:5.5,int:3,img:'c07',cap:'On the Vorr flagship...',bub:[{s:'FOUR keyholes filled?! Fine. Unlock it for me, Earthlings. The Heart Crystal will be MINE!',x:340,y:170,w:260,tx:330,ty:150,at:.6}]},
 {img:'c26',d:5.5,int:3,cap:'Then, a secret coded signal from a tiny transmitter...',draw:t=>{g.fillStyle=lg(g,0,0,0,H,['#0a0a20','#1a1040']);g.fillRect(0,0,W,H);starfield(T*4);moonBall(470,120,46);for(let k=0;k<4;k++){const r=((t*.8+k/4)%1)*90;g.strokeStyle=`rgba(255,224,102,${1-r/90})`;g.lineWidth=3;g.beginPath();g.arc(470,120,46+r,0,TAU);g.stroke();}ship(160,230,T,1);},bub:[{s:'DECODED: HELP. PRISONER. PHOBOS.',who:'CODED SIGNAL',x:40,y:50,w:260,tx:420,ty:130,at:.5}],fx:{s:'BLIP BLIP!',x:470,y:240,sz:28,at:.3}},
 {img:'c51',d:4.5,int:3,cap:'To be continued...',draw:t=>{starfield(T*14);moonBall(420,200,90);ship(220,160+Math.sin(T*2)*6,T,1.2);},bub:[{s:'Someone\'s locked up on Phobos. Let\'s go rescue them!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'NEXT: RESCUE ON PHOBOS!',x:320,y:70,sz:24,at:.4,rot:-.05}}];
const MARSARR=[
 {img:'c28',d:4.5,int:3,cap:'Krool\'s pod tumbles away... with a passenger.',draw:t=>{starfield(T*20);g.save();g.translate(320,190);g.rotate(t*2);kroolPod(0,0,false);g.restore();g.save();g.translate(360,170);g.scale(1.2,1.2);blob(0,0,T,{r:12,face:-1,scared:1,col:'#4fd65c'});g.restore();},bub:[{s:'Krool! Move over! Big Blorp needs a ride to Mars too!',x:40,y:200,w:250,tx:340,ty:170,at:.4}],fx:{s:'BONK!',x:480,y:90,sz:26,at:.3}},
 {img:'c29',d:5,int:3,sting:1,cap:'At last: Mars.',draw:t=>{starfield(T*8);marsBall(420,190,150+t*6);speedLines(320,180,'rgba(255,170,120,.15)');ship(160+t*20,150,T,1.3);},bub:[{s:'There it is. The red planet. And the Vorr got here first.',x:40,y:230,w:250,tx:170,ty:170,at:.5}],fx:{s:'MARS!',x:470,y:90,sz:30,at:.3}},
 {d:5.5,int:3,img:'c07',cap:'On the Vorr flagship...',bub:[{s:'Let the Earthlings come. My army is digging on Mars. The path will be MINE.',x:340,y:170,w:260,tx:330,ty:150,at:.6}]},
 {d:5.5,int:3,img:'c10',cap:'Mission Control, Earth.',bub:[{s:'Your next mission: land on Mars and find out what Malakar is digging for.',x:330,y:70,w:270,tx:300,ty:180,at:.4}]},
 {img:'c52',d:4.5,int:3,cap:'To be continued...',draw:t=>{starfield(T*20);marsBall(320,420,260);ship(320,150+Math.sin(T*2)*6,T,1.2);},fx:{s:'NEXT: MARS!',x:320,y:90,sz:30,at:.4,rot:-.06}}];
function splitB(beats){if(beats._sp)return beats;if(beats._o)return beats._o;const out=[];for(const b of beats){const bl=(b.bub||[]);for(const q of bl)if(!q.who)q.who=whoOf(q,b)===CAPS[cap].name?'@':whoOf(q,b);const i=bl.findIndex(q=>q.s.length>62);if(i<0){out.push(b);continue;}
 const parts=chunk(bl[i].s,58);parts.forEach((ps,k)=>{const nb={...b,bub:bl.map((q,j)=>j===i?{...q,s:ps,at:k?.15:q.at}:(k?{...q,at:-1}:q))};if(k){nb.fx=null;nb.sting=0;nb.warn=0;nb.d=Math.max(3,b.d*.7);}out.push(nb);});}
 out._sp=1;beats._o=out;return out;}
function chunk(str,n){const sen=str.match(/[^.!?]+[.!?]+['"]?\s*|[^.!?]+$/g)||[str];const out=[];let cur='';for(const x of sen){if(cur&&(cur+x).length>n){out.push(cur.trim());cur='';}cur+=x;}if(cur.trim())out.push(cur.trim());return out;}
function playComic(beats,onEnd){beats=splitB(beats);CB=beats;CEND=onEnd;comicI=0;comicT=0;go('comic');}
function endComic(){if(CEND){const f=CEND;CEND=null;CB=splitB(COMIC);f();return;}seenComic=true;try{localStorage.setItem('gr_comic','1');}catch(e){}go('select');}
function comicArt(){const tag=(arr,p)=>arr.forEach((b,i)=>{b.img=b.img||p+String(i+1).padStart(2,'0');});tag(COMIC,'c');tag(INTER1,'i1_');tag(MOONWIN,'mw_');tag(MARSARR,'ma_');tag(MARSLAND,'ml_');tag(MARSGO,'mg_');tag(MARSWIN,'mx_');
 fetch('assets/comic/manifest.json').then(r=>r.ok?r.json():[]).then(l=>{for(const f of l||[]){const m=String(f).match(/^(.+)\.(png|jpe?g)$/i);if(m)loadImg('comic_'+m[1],'assets/comic/'+f);}}).catch(()=>{});}

const WHO=[['It holds the power','DR. VEGA'],['Go far','DR. VEGA'],['Nothing gets','ACE KREEL'],['This isn','ACE KREEL'],['Setting her down','@'],['You win THIS','BIG BLORP'],['Two Keys safe','@'],['Faster! Blorp','BIG BLORP'],['There\'s the colony','@'],['Big Blorp is back','BIG BLORP'],['My whale','BIG BLORP'],['Okay, okay','DUST WHALE'],['The water is back','PIP-7'],['DECODED: HELP','CODED SIGNAL'],['Someone\'s locked','@'],['Krool! Move','BIG BLORP'],['There it is','@'],['Hop in','@'],['BEEP. I am Comet','COMET'],['The prisoner is','@']];
function whoOf(q,b){if(q.who)return q.who==='@'?CAPS[cap].name:q.who;const s=q.s||'';for(const[k,n]of WHO)if(s.startsWith(k))return n==='@'?CAPS[cap].name:n;if(b&&b.img==='c10')return 'HAYES';if(b&&b.img==='c07')return 'MALAKAR';return CAPS[cap].name;}
// comic caption strip along the bottom: yellow caption box, then speaker tag + line. Never over the art.
function comicStrip(cap,lines,x0,y0,w,y1){const hh=y1-y0;g.fillStyle=OL;g.beginPath();g.roundRect(x0,y0,w,hh,8);g.fill();g.fillStyle=lg(g,0,y0,0,y1,['#fffbe8','#f2e6c4']);g.beginPath();g.roundRect(x0+3,y0+3,w-6,hh-6,6);g.fill();
 g.globalAlpha=.12;g.fillStyle=halftone();g.fillRect(x0+3,y0+3,w-6,hh-6);g.globalAlpha=1;let y=y0+7;
 const rows=lines.length+(cap?1:0),room=hh-10;
 if(cap){const f=fitLines(cap,w-28,14,10),ch=Math.min(f.lines.length,lines.length?1:2);const ht=ch*f.size*1.25+8;g.fillStyle=OL;g.fillRect(x0+8,y,w-16,ht+2);g.fillStyle='#ffe066';g.fillRect(x0+10,y+1,w-20,ht-1);
  if(ch===1&&f.lines.length>1){fitTxt(cap,x0+w/2,y+ht/2+1,14,w-28,'#1a1030');}else for(let i=0;i<ch;i++){setF(f.size);g.textAlign='center';g.textBaseline='middle';g.fillStyle='#1a1030';g.fillText(f.lines[i],x0+w/2,y+4+f.size*.62+i*f.size*1.25);}y+=ht+5;}
 const per=lines.length?(y1-6-y)/lines.length:0;
 for(const L of lines){const mono=L.who==='COMET'||L.who==='CODED SIGNAL';if(mono)L.col='#1f8a4a';setF(12);const tw=Math.max(70,g.measureText(L.who).width+18);g.fillStyle=OL;g.beginPath();g.roundRect(x0+8,y,tw,22,5);g.fill();g.fillStyle=L.col||'#2a5aa0';g.beginPath();g.roundRect(x0+10,y+2,tw-4,18,4);g.fill();txt(L.who,x0+8+tw/2,y+11,11.5,'#ffffff');
  if(mono){g.fillStyle='#0c2a1a';g.beginPath();g.roundRect(x0+tw+10,y+1,w-tw-20,Math.min(per,46)-4,5);g.fill();circ(x0+tw+4,y+11,3,(T*4|0)%2?'#5fe36a':'#1f8a4a');}const tx=x0+tw+16,mw=(w-tw-26)*(mono?.8:1),maxL=Math.max(1,Math.floor(per/20)),f=fitLines(L.s,mw,16,10);let fl=f;if(f.lines.length>maxL){for(let z=15.5;z>=9;z-=.5){fl=fitLines(L.s,mw,z,z);if(fl.lines.length<=maxL)break;}}
  setF(fl.size);if(mono)g.font=`bold ${Math.round(fl.size*1.05)}px 'Courier New',Courier,monospace`;g.textAlign='left';g.textBaseline='middle';g.fillStyle=mono?'#7dff9a':'#14102a';const lh=fl.size*1.22,ty=y+Math.max(11,(Math.min(per,lh*fl.lines.length+4))/2)-(fl.lines.length-1)*lh/2;fl.lines.forEach((ln,i)=>g.fillText(ln,tx,ty+i*lh));y+=per;}}
function drawComic(){if(!CB)CB=splitB(COMIC);if(stateT<.05&&comicT===0&&comicI===0)comicGo(0);const b=CB[comicI];if(!b){endComic();return;}comicT+=DT*(AUTO?4:1);const t=comicT;
 g.fillStyle='#0d0a1e';g.fillRect(0,0,W,H);
 const prev=CB[comicI-1],sl=clamp(t/.45,0,1),e=1-Math.pow(1-sl,3);
 g.save();g.beginPath();const ox=(1-e)*W*.7;g.rect(PX+ox,PY,PW,PH);g.clip();g.translate(ox,0);const z=1+Math.min(t,5)*.002;g.translate(W/2,H/2);g.scale(z,z);g.translate(-W/2,-H/2);{const im=b.img&&IMG['comic_'+b.img];if(im){drawPanelImg(im,PX,PY,PW,PH);if(b.img==='c10'){routeMap(PX+PW-178,PY+PH-112,160,92);for(let i=0;i<6;i++){const on=(T*3+i|0)%3;circ(PX+330+i*34,PY+PH-118+(i%2)*6,3,on?'#5fe36a':'#ff4f7b');if(on)dglow(PX+330+i*34,PY+PH-118+(i%2)*6,8,'#5fe36a',.5);}}if(b.capI!==undefined){const i=b.capI;g.fillStyle='rgba(10,8,30,.55)';g.fillRect(325,80,285,140);g.fillStyle=OL;g.fillRect(330,110,270,46);g.fillStyle='#ffe066';g.fillRect(333,113,264,40);txt(CAPS[i].name,465,133,17,'#ffffff');cText(CAPS[i].bio,340,170,11,'#ffffff',250,16);txt('CAPTAIN '+(i+1)+' OF 4',465,90,9,'#ffffff');}}else b.draw(t);}
 g.globalAlpha=.08;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;g.restore();
 g.strokeStyle=OL;g.lineWidth=8;g.strokeRect(PX+ox,PY,PW,PH);g.strokeStyle='#fff';g.lineWidth=2;g.strokeRect(PX+ox+5,PY+5,PW-10,PH-10);
 {const ls=(b.bub||[]).filter(q=>t>q.at).map(q=>({who:whoOf(q,b),s:q.s,col:whoOf(q,b)==='MALAKAR'?'#7a2ab0':whoOf(q,b)==='HAYES'?'#2a5aa0':'#c0501a'}));if((b.cap||ls.length)&&t>.3)comicStrip(t>.4?b.cap:'',ls,PX+ox,STY0,PW,STY1);}
 if(b.fx&&t>b.fx.at)sfxText(b.fx.s,b.fx.x+ox,clamp(PY+30+(b.fx.y-14)*(PH-50)/332,PY+30,PY+PH-24),b.fx.sz,t-b.fx.at,b.fx.rot??-.15,b.fx.c1,b.fx.c2);
 for(let i=0;i<CB.length;i++)circ(W/2-CB.length*5+i*10,7,2.6,i===comicI?'#ffc53d':'#4a4a6a');
 panel(W-116,4,108,28,'#ff7a29');txt('SKIP ▶▶',W-62,18,13,'#ffffff');if(t>.4){g.globalAlpha=.55+.45*Math.sin(T*5);txt('TAP TO GO ON ▶',W-80,H-8,10,'#ffe066');g.globalAlpha=1;}
 const tp=tapped();if(tp&&tp.x>W-120&&tp.y<36){endComic();return;}
 const rd=CEND?1:.4,fresh=!tp||!CEND||!tp.st||tp.st>performance.now()-(t-rd)*1000;
 if(tp||pressedA||(AUTO&&t>b.d)){const pa=pressedA;pressedA=false;if(AUTO&&t>b.d){comicGo(comicI+1);if(comicI>=CB.length)endComic();return;}if(t<rd||(CEND&&pa&&!tp)||!fresh)return;comicGo(comicI+1);if(comicI>=CB.length)endComic();}}
function toggleMute(){const on=VOL.mus>0||VOL.sfx>0;if(on){VOL._m=VOL.mus;VOL._s=VOL.sfx;VOL.mus=0;VOL.sfx=0;}else{VOL.mus=VOL._m||1;VOL.sfx=VOL._s||1;}saveVol();}
function audioIcon(){const on=VOL.mus>0||VOL.sfx>0,x=W-30,y=22;circ(x,y,15,OL);circ(x,y,13,'#1c2a6a');g.fillStyle='#fff';g.beginPath();g.moveTo(x-8,y-3);g.lineTo(x-4,y-3);g.lineTo(x+1,y-8);g.lineTo(x+1,y+8);g.lineTo(x-4,y+3);g.lineTo(x-8,y+3);g.closePath();g.fill();
 g.strokeStyle=on?'#fff':'#ff4f7b';g.lineWidth=2;g.beginPath();if(on){g.arc(x+2,y,5,-.9,.9);g.stroke();g.beginPath();g.arc(x+2,y,9,-.9,.9);}else{g.moveTo(x+4,y-5);g.lineTo(x+11,y+5);g.moveTo(x+11,y-5);g.lineTo(x+4,y+5);}g.stroke();}
const VSTEP=[1,.5,0],vlab=v=>v>=1?'100%':v>0?'50%':'OFF';
function audioBtns(){panel(W-232,4,110,24,'#45d6ff');txt('MUSIC '+vlab(VOL.mus),W-177,16,9,'#ffffff');panel(W-116,4,104,24,'#45d6ff');txt('SFX '+vlab(VOL.sfx),W-64,16,9,'#ffffff');}
function audioTap(tp){if(tp.y>34)return false;const nx=v=>VSTEP[(VSTEP.indexOf(v)+1)%3]??1;if(tp.x>W-232&&tp.x<W-122){VOL.mus=nx(VOL.mus);saveVol();if(VOL.mus&&!music)startMusic('title');return true;}if(tp.x>W-116){VOL.sfx=nx(VOL.sfx);saveVol();sfx('pick');return true;}return false;}
// ---------- MISSIONS ----------
const MIS=[null,{name:'LAUNCH',sub:'Earth  ▶  The Moon',brief:['Captain, the Vorr took our Moon outpost.','Punch through their fleet. Ace Kreel has a Crystal Key. Take it back!']},
 {name:'MOON BASE',sub:'Retake Tranquility Outpost',brief:['You made it! The outpost is crawling with blobs.','Big Blorp guards the Moon Crystal Key. Send him packing!']},
 {name:'TRIP TO MARS',sub:'The Moon  ▶  Mars',brief:['Pale Blue is low on fuel, and the Vorr hold all three fuel stations.','Free each one and fill up. Warden Krool has the third Crystal Key.']},
 {name:'MARS LANDING',sub:'Save the Colony',brief:['The Mars colony went silent. The Vorr took over its garden robots.','Zap the robots to set them free. Find the colony leader and the Mars Crystal Key.']},
 {name:'PHOBOS MINE RUN',sub:'Side Quest: Free the Prisoner',brief:['The coded SOS came from a Vorr prison on Phobos.','Ride the mine rails to the prison. Free the captive!']},
 {name:'ASTEROID DASH',sub:'Phobos  ▶  Vesta',brief:['The star map\'s trail runs through the asteroid belt to Vesta.','Fly fast! Ace Kreel waits near Vesta with a Crystal Key.']},
 {name:'VESTA PEAK',sub:'Climb to the Summit',brief:['The map\'s trail leads up Vesta\'s giant peak.','Jetpack up the peak. The last Crystal Key waits at the top!']},
 {name:'SPACE JUNKYARD',sub:'Journey to Jupiter',brief:['The star map\'s trail runs through a graveyard of old satellites and space junk.','Blast everything they throw at you. Ace Kreel is hiding in there somewhere!']},
 {name:'JUPITER',sub:'Into the Clouds',brief:['Jupiter\'s clouds are big enough to stand on. Some sink, some bounce!','Ride the storm, reach the sky city, and find out who drew that little hat on the map.']}];
let misK=false;
const NMIS=9,CHAP=[{n:'CHAPTER 1',t:'EARTH TO MARS',m:[1,2,3,4]},{n:'CHAPTER 2',t:'THE CRYSTAL BELT',m:[5,6,7,8]},{n:'CHAPTER 3',t:'JUPITER AND BEYOND',m:[9]}];let mPage=0,mPgK=-1;
const MCOV={5:'c36',6:'c49',7:'c56',8:'c63',9:'c71'};
function misArt(n,x,y,w,h){g.save();g.beginPath();g.roundRect(x,y,w,h,6);g.clip();g.fillStyle='#070a24';g.fillRect(x,y,w,h);const cx=x+w/2,cy=y+h/2,im=IMG['comic_'+MCOV[n]];
 if(im)drawCover(im,x,y,w,h);else if(n===1){earth(cx-26,cy+8,26);moonBall(cx+34,cy-26,10);ship(cx+8,cy+6+Math.sin(T*2)*4,T,.45);}
 else if(n===2){moonBall(cx,cy+18,38);ship(cx-4,cy-26+Math.sin(T*2)*4,T,.4);}
 else if(n===3){moonBall(cx-36,cy+22,14);marsBall(cx+30,cy-10,26);ship(cx-10,cy+10+Math.sin(T*2)*4,T,.42);}
 else if(n===4){marsBall(cx-18,cy+8,32);captain(cx+30,cy+34,CAPS[cap],{sc:.6,t:T});}
 else if(n===8)jupBall(cx,cy,30);else vestaBall(cx,cy,30);
 if(n===5&&COMET)cometMini(x+w-16,y+h-16,.9);g.restore();g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.roundRect(x,y,w,h,6);g.stroke();}
function padlock(x,y,sc){g.save();g.translate(x,y);g.scale(sc,sc);g.strokeStyle=OL;g.lineWidth=7;g.beginPath();g.arc(0,-8,9,Math.PI,0);g.lineTo(9,0);g.moveTo(-9,0);g.lineTo(-9,-8);g.stroke();g.strokeStyle='#c8ccd8';g.lineWidth=3.5;g.stroke();
 g.fillStyle=OL;g.beginPath();g.roundRect(-15,-3,30,24,4);g.fill();g.fillStyle='#ffc53d';g.beginPath();g.roundRect(-12.5,-.5,25,19,3);g.fill();circ(0,7,3,OL);g.fillStyle=OL;g.fillRect(-1.3,7,2.6,7);g.restore();}
function drawMissions(){starfield(T*8);txt('SELECT MISSION',24,20,17,'#ffc53d','left');if(TESTU)txt('TEST UNLOCK',24,40,8,'#ff9af0','left');audioBtns();
 const pgOf=n=>CHAP.findIndex(c=>c.m.includes(n));if(mPgK!==mSel){mPage=Math.max(0,pgOf(mSel));mPgK=mSel;}
 const C=CHAP[mPage],CW=128,GAP=14,X0=(W-(CW*4+GAP*3))/2,Y0=66,CH=208;
 txt(C.n+' · '+C.t,W/2,48,12,'#45d6ff');
 C.m.forEach((n,i)=>{const x=X0+(i+(4-C.m.length)/2)*(CW+GAP),lock=n>UNL(),sel=mSel===n&&!lock,side=n===5,acc=lock?'#2a3060':sel?'#45d6ff':side?'#ff9a3a':'#3a4180';
  if(sel)dglow(x+CW/2,Y0+CH/2,90,'#45d6ff',.14);panel(x,Y0,CW,CH,acc);
  txt(side?'SIDE QUEST':'MISSION '+n,x+CW/2,Y0+16,12,lock?'#6a70a0':side?'#ffb060':'#ffc53d');
  misArt(n,x+8,Y0+28,CW-16,96);
  if(lock){g.fillStyle='rgba(6,8,30,.86)';g.beginPath();g.roundRect(x+8,Y0+28,CW-16,96,6);g.fill();padlock(x+CW/2,Y0+70,1.1);
   fitTxt(MIS[n].name,x+CW/2,Y0+142,11,CW-14,'#6a70a0');fitTxt('LOCKED',x+CW/2,Y0+164,12,CW-14,'#ff4f7b');fitTxt('Finish '+(n-1===5?'the Side Quest':'Mission '+(n-1)),x+CW/2,Y0+184,8,CW-14,'#8a90c0');return;}
  fitTxt(MIS[n].name,x+CW/2,Y0+142,12,CW-14,'#ffffff');fitTxt(side?'Free the Prisoner':MIS[n].sub,x+CW/2,Y0+160,9,CW-14,'#c6cbef');
  g.fillStyle='rgba(255,255,255,.12)';g.fillRect(x+14,Y0+172,CW-28,1);
  if(side)fitTxt(COMET?'★ COMET FREED':'◆ NO KEY HERE',x+CW/2,Y0+186,9,CW-14,COMET?'#ffe066':'#ff9af0');
  else{const ky=n===7?5:n,gn=gemN(n);fitTxt('◆ GEMS '+gn+'/5',x+CW/2,Y0+186,9,CW-14,gn>=5?'#ffe066':'#ff9af0');if(UPG(ky))fitTxt('★ '+UPNAME[ky][0],x+CW/2,Y0+199,8,CW-14,'#ffe066');}});
 // page arrows + chapter dots (inside safe area, below header, above footer)
 const np=CHAP.length,ay=Y0+CH/2;const arrow=(x,d,on)=>{circ(x,ay,13,on?'#ff7a29':'#2a3060',OL);txt(d<0?'◀':'▶',x+(d<0?-1:1),ay+1,11,on?'#ffffff':'#6a70a0');};
 arrow(X0-18,-1,mPage>0);arrow(X0+CW*4+GAP*3+18,1,mPage<np-1);
 for(let i=0;i<np;i++){const dx=W/2+(i-(np-1)/2)*18;circ(dx,286,i===mPage?5:3.5,i===mPage?'#ffc53d':'#4a5090',OL);}
 txt(showTouch?'TAP A MISSION TO START':'◀ ▶ TO CHOOSE · ENTER TO START',W/2,304,10,'#c6cbef');txt('CAPTAIN '+CAPS[cap].name,W/2,324,11,'#45d6ff');
 if(K.ArrowLeft&&!misK&&mSel>1)mSel--,sfx('blip');if(K.ArrowRight&&!misK&&UNL()>mSel&&mSel<NMIS)mSel++,sfx('blip');misK=K.ArrowLeft||K.ArrowRight;
 panel(14,300,112,30,'#ff7a29');txt('▶ WATCH INTRO',70,315,9,'#ffffff');const tp=tapped();if(tp&&audioTap(tp))return;if(tp&&tp.x<130&&tp.y>295){comicFrom='missions';go('comic');return;}
 if(tp&&Math.abs(tp.y-ay)<30){if(tp.x<X0-2&&mPage>0){mPage--;mPgK=mSel;sfx('blip');return;}if(tp.x>X0+CW*4+GAP*3+2&&mPage<np-1){mPage++;mPgK=mSel;sfx('blip');return;}}
 if(tp&&tp.y>Y0&&tp.y<Y0+CH){for(let i=0;i<C.m.length;i++){const x=X0+(i+(4-C.m.length)/2)*(CW+GAP);if(tp.x>=x&&tp.x<=x+CW){const n=C.m[i];if(n<=UNL()){if(mSel===n||showTouch)return startMission(n);mSel=n;mPgK=n;}}}}
 if(((K.Enter||K.Space)&&stateT>.4)||(AUTO&&stateT>1))startMission(mSel);}
function drawCard(){const L=MIS[mission];starfield(T*14);if(mission===1)earth(520,250,90);else if(mission>=8)jupBall(520,250,90);else if(mission>=6)vestaBall(520,250,80);else if(mission>=3)marsBall(520,250,80);else moonBall(520,250,90);
 const a=clamp(stateT*2,0,1);g.globalAlpha=a;txt('MISSION '+mission,W/2,70,34,'#ffc53d');txt(L.name,W/2,112,24,'#ffffff');txt(L.sub,W/2,140,11,'#45d6ff');g.globalAlpha=1;if(COMET&&COMHINT[mission]&&stateT>.6){panel(40,170,404,44,'#ff9a3a');cometMini(66,202,1.2);fitTxt('COMET: '+COMHINT[mission],258,192,12,350,'#ffffff');}
 if(stateT<.8)return;const ln=L.brief[bLine],tt=stateT-.8;panel(28,234,94,114,'#ffc53d');hayesP(75,342,2.2);panel(132,250,486,90);txt('COMMANDER HAYES',145,264,12,'#ffc53d','left');
 {const TA=[0,'Run home, Earthlings. Every Crystal Key will be MINE.','My Big Blorp will squash you flat, Captain!','Every fuel station is mine. Enjoy drifting!','Mars belongs to the Vorr now. Turn back!',0,'The belt will crush you, Earthlings!',0,'Kreel will crush you in the junkyard!','Jupiter\'s storms will blow you away, Captain!'][mission];if(TA&&IMG.comic_c07){g.save();g.beginPath();g.arc(586,62,34,0,TAU);g.clip();drawCover(IMG.comic_c07,540,20,92,84);g.restore();g.strokeStyle=OL;g.lineWidth=4;g.beginPath();g.arc(586,62,34,0,TAU);g.stroke();g.strokeStyle='#b04aff';g.lineWidth=2;g.stroke();if(!(COMET&&COMHINT[mission]))bubble(TA,452,108,170,560,92,true);txt('KING MALAKAR',586,104,7,'#d0a0ff');}}
 const shown=ln.slice(0,Math.floor(tt*45));wrap(shown,375,292,450,12,'#ffffff',19);if((T*3|0)%2)txt('▶',600,326,12,'#45d6ff');
 const tp=tapped();if(tp||pressedA||(AUTO&&tt>1.4)){pressedA=false;if(shown.length<ln.length&&!AUTO)stateT=99;else if(++bLine>=L.brief.length)(mission===9?playComic(JUPGO,()=>go('moon')):mission===8?playComic(JYGO,()=>go('space')):mission===7?playComic(VESTALAND,()=>{CT=null;go('cart');}):mission===6?playComic(BELTGO,()=>go('space')):mission===5?playComic(PHOBOSLAND,()=>{CT=null;go('cart');}):mission===4?playComic(MARSLAND,()=>go('moon')):mission===3?playComic(MARSGO,()=>go('space')):go(mission===1?'launchcut':mission===3?'space':'landing'));else stateT=.8;}}
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
 txt('MISSION 1 · LAUNCH',W/2,14,10,'#45d6ff');panel(W-116,4,108,28,'#ff7a29');txt('SKIP ▶▶',W-62,18,13,'#ffffff');
 const tp=tapped();if(t>22.5||(tp&&tp.x>W-110&&tp.y<34)||(K.Enter&&stateT>.5)){pressedA=false;launchFx=[];go('space');}}
function drawMDone(){starfield(T*20);const r=40+stateT*14;moonBall(W/2+150,180,Math.min(r,120));ship(W/2-140+Math.sin(T)*8,200,T,1);
 txt('MISSION '+mDone+' COMPLETE!',W/2,56,26,'#ffc53d');txt('Kreel retreats! Pale Blue reaches the Moon...',W/2,90,11,'#ffffff');
 txt('SCORE '+score+'  ·  KILLS '+stats.kills,W/2,284,11,'#45d6ff');txt('MISSION '+(mDone+1)+' UNLOCKED',W/2,304,11,'#5fe36a');if((T*2|0)%2)txt('TAP TO CONTINUE',W/2,330,12,'#ffffff');
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
 const cap2=t<2.4?'':t<3.8?'LANDING LEGS DEPLOYED':t<5.5?(t>=4.5?'TOUCHDOWN!':''):t<7.2?'RAMP DOWN':t<9.6?CAPS[cap].name+' DISEMBARKING':'BOOTS ON THE MOON';if(cap2)txt(cap2,W/2,50,12,'#45d6ff');
 
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
 txt(V4?'MISSION 4 · MARS COLONY SAVED  ·  MISSION 5 UNLOCKED: PHOBOS MINE RUN':'MISSION 2 · MOON BASE CLEAR  ·  MISSION 3 UNLOCKED: TRIP TO MARS',W/2,302,10,'#c6cbef');if((T*2|0)%2)txt('TAP TO CONTINUE',W/2,330,12,'#ffffff');
 if(stateT>1.5&&(tapped()||pressedA)){pressedA=false;score=0;stats.kills=0;secretFound=false;go('missions');}}

// ---------- autopilot (testing only, ?auto) ----------
function autoSpace(){const s=sp;VK.F=1;const pod=s.boss&&!s.boss.dead&&s.boss.pods&&s.boss.pods.find(p=>p.hp>0),tgt=pod?pod:s.boss&&!s.boss.dead?s.boss:s.foes.filter(f=>f.age>=f.del&&f.x<SW&&f.x>s.x).sort((a,b)=>a.x-b.x)[0]||s.rocks[0];VK.U=tgt&&tgt.y<s.y-8;VK.D=tgt&&tgt.y>s.y+8;VK.R=s.x<200;VK.L=0;}
function autoMoon(){const m=M;VK.F=1;VK.R=1;VK.L=0;if(m.boss&&m.boss.whale&&m.lock&&!m.boss.dead){const d=m.boss.x-m.px;VK.R=d>170?1:0;VK.L=d<-170?1:0;if(!VK.R&&!VK.L)m.face=d>0?1:-1;}if(m.boss&&m.boss.pl&&!m.boss.dead){const d=m.boss.pl.x-m.px;VK.R=d>30?1:0;VK.L=d<-30?1:0;if(Math.abs(d)<=30){m.face=d>0?1:-1;}}if(m.px>m.best+5){m.best=m.px;m.stuck=0;}else m.stuck+=DT;if(m.stuck>3&&!m.lock){const c=m.cps.find(c=>c.x>m.px+20);m.px=c?c.x:m.arena-60;m.py=GROUND;m.vy=0;m.mv=null;m.stuck=0;m.best=m.px;}if(m.on&&m.gaps.some(q=>q[0]-m.px<50&&q[0]-m.px>0))pressedA=true,VK.J=1;if(m.cart&&m.cart.on&&m.on&&m.cartRocks.some(r=>r-m.px<70&&r-m.px>0))pressedA=true,VK.J=1;if(m.lock){const b=m.boss;let side=m.px<b.x?-1:1;let tx=b.x+side*100;if(tx<m.arena+20||tx>m.arena+W-20)tx=b.x-side*100;VK.R=m.px<tx-15;VK.L=m.px>tx+15;}
 if(m.on&&(Math.random()<.02||Math.abs(m.vx)<20||m.walls.some(w=>w[0]-m.px<40&&w[0]-m.px>0)))pressedA=true,VK.J=1;if(m.vy>0)VK.J=0;}
// ---------- loop: capped 60fps, nothing drawn while hidden ----------
let last=performance.now(),acc=0;const STEP=1/60;
function frame(now){requestAnimationFrame(frame);if(document.hidden){last=now;return;}
 let dt=(now-last)/1000;if(dt<STEP*.9)return;// cap (120Hz screens)
 last=now;dt=Math.min(dt,.05);T+=dt;stateT+=dt;stats.time+=dt;
 DT=dt;SHAKE=Math.max(0,SHAKE-dt);const shx=SHAKE>0?rnd(-4,4)*SHAKE/.3:0,shy=SHAKE>0?rnd(-3,3)*SHAKE/.3:0;
 g.setTransform(1,0,0,1,0,0);g.fillStyle='#000';g.fillRect(0,0,cv.width,cv.height);g.setTransform(cv.width/W,0,0,cv.height/H,shx*cv.width/W,shy*cv.height/H);g.imageSmoothingEnabled=true;g.imageSmoothingQuality='high';
 try{NOTAP=!!(PAUSEM||PAUSEBG);if(S==='title')drawTitle();else if(S==='intro')drawIntro();else if(S==='select')drawSelect();
  else if(S==='space'){if(PAUSEREQ){PAUSEREQ=0;if(inLevel()&&!PAUSEM)openPause();}if(!GOVER&&!PAUSEBG&&!CRY&&!PAUSEM&&!SHM)updSpace(dt);drawSpace();if(SHM)shardCut();else if(CRY)crystalCut();else if(PAUSEM){NOTAP=false;pauseMenu();}else drawPauseBtn();}else if(S==='landing')drawLanding();else if(S==='moon'){if(PAUSEREQ){PAUSEREQ=0;if(inLevel()&&!PAUSEM)openPause();}if(!GOVER&&!PAUSEBG&&!CRY&&!PAUSEM&&!SHM)updMoon(dt);drawMoon();if(SHM)shardCut();else if(CRY)crystalCut();else if(PAUSEM){NOTAP=false;pauseMenu();}else drawPauseBtn();}else if(S==='cart'){if(PAUSEREQ){PAUSEREQ=0;if(inLevel()&&!PAUSEM)openPause();}if(!GOVER&&!PAUSEBG&&!CRY&&!PAUSEM&&!SHM)updCart(dt);drawCart();if(SHM)shardCut();else if(CRY)crystalCut();else if(PAUSEM){NOTAP=false;pauseMenu();}else drawPauseBtn();}else if(S==='victory')drawVictory();else if(S==='missions')drawMissions();else if(S==='card')drawCard();else if(S==='launchcut')drawLaunchCut();else if(S==='mdone')drawMDone();else if(S==='comic')drawComic();}
 catch(e){console.error(e);}
 if(Q.has('debug')){const l='AC:'+(AC?AC.state:'none')+' sr:'+(AC?AC.sampleRate:0)+' master:'+(master?master.gain.value.toFixed(2):'-')+' mus:'+(musG?musG.gain.value.toFixed(2):'-')+' sfx:'+(sfxG?sfxG.gain.value.toFixed(2):'-')+' VOL:'+VOL.mus+'/'+VOL.sfx+' music:'+(music?curTheme:'off')+' want:'+(wantTheme?wantTheme.join(''):'-')+' BGP:'+BGP+' hid:'+document.hidden+' sess:'+(navigator.audioSession?navigator.audioSession.type:'n/a')+' silEl:'+(SIL?(SIL.paused?'paused':'playing'):'none')+' ev:'+__aud.ev+'#'+__aud.n+' reb:'+__aud.reb;g.fillStyle='rgba(0,0,0,.75)';g.fillRect(60,46,W-120,16);txt(l,W/2,54,6.5,'#7dff8a');}
 try{NOTAP=false;if(PAUSEBG&&!(S==='space'||S==='moon'))PAUSEBG=false;if(PAUSEBG){g.fillStyle='rgba(8,4,24,.7)';g.fillRect(0,0,W,H);txt('PAUSED',W/2,150,30,'#ffc53d');if((T*2|0)%2)txt('TAP TO RESUME',W/2,192,12,'#ffffff');const tp=tapped();if(tp||K.Enter){PAUSEBG=false;unlock();}}else if(GOVER&&(S==='space'||S==='moon'||S==='cart'))drawGameOver();if(SAVET>0&&!(S==='space'&&sp&&sp.cut)&&S!=='comic'){SAVET-=dt;g.globalAlpha=Math.min(1,SAVET*2);panel(8,128,100,22,'#5fe36a');txt('GAME SAVED',58,139,9,'#5fe36a');g.globalAlpha=1;}}catch(e){console.error(e);}
 if(S!=='moon')pressedA=false;pressedAny=false;}
// ===================== MISSION 5: PHOBOS MINE RUN (side quest) =====================
let CT=null,COMET=false;try{COMET=localStorage.getItem('gr_comet')==='1';}catch(e){}
const CLOW=290,CX0=150,CTEND=30300;
const COMHINT={9:'Follow me! I sniff out the hidden gems. BEEP!',8:'Glowing wrecks hide gems. Everything they throw can be blasted!',1:'Kreel always dives after he fires. Wait, then hit back!',2:'Blob guards hate light. Find the switches!',3:'Krool flashes red before he charges. Move!',4:'Zap the robots. Don\'t wreck them!',5:'Duck under the striped beams. Jump the crates!',6:'Green rings make us fast. Fly through them!'};
// ---- coaster track: smooth hills, lifts, loops, ramp jumps ----
// keypoints [x, y(screen-down), mode]; mode 'l' = straight ramp into this point (launch lip)
const CKP=[[0,290],[700,290],[1600,-40],[1800,-60],[2700,470],[3000,520],[3320,520],[3700,380],[3950,470],[4250,330,'l'],[4480,420],[4900,470],[5400,470],[6200,90],[6400,80],[7200,450],[7720,450],[8000,330],[8300,450],[8600,330],[8900,450],[9400,450],[9750,300,'l'],[10000,390],[10500,450],[11050,450],[11900,20],[12100,10],[13000,520],[13700,520],[14200,430],[15000,430],[15600,330],[16200,450],[16600,320,'l'],[16830,400],[17400,450],[18000,350],[18600,470],[19800,470],[20300,330,'l'],[20530,420],[21400,450],[22350,350,'l'],[22600,420],[23000,430],[23400,470],
 // the deep plunge into Phobos
 [24600,1650],[25000,1700],[25800,1700],[26100,1600],[26400,1700],[27150,1700],[27400,1580,'l'],[27640,1660],[28000,1700],[28900,1250],[29600,560],[29800,450],[31000,450]];
const CLIFT=[[700,1600],[5400,6200],[11050,11900],[28000,29600]],CLOOPS=[3160,7460,13350,25400],CGAPS=[[4250,230],[9750,250],[16600,230],[20300,230],[22350,250],[27400,240]];
const CTR=(()=>{const a=new Float32Array(31400/4|0);let k=0;for(let i=0;i<a.length;i++){const x=i*4;while(k<CKP.length-2&&CKP[k+1][0]<x)k++;const p=CKP[k],q=CKP[k+1]||p,u=q[0]>p[0]?Math.min(1,Math.max(0,(x-p[0])/(q[0]-p[0]))):0;a[i]=q[2]==='l'?p[1]+(q[1]-p[1])*(u<.35?u*u/.7:u-.175)/.825:p[1]+(q[1]-p[1])*(.5-.5*Math.cos(u*Math.PI));}return a;})();
function railAt(x){const i=Math.max(0,Math.min(CTR.length-2,x/4)),i0=i|0,f=i-i0;return CTR[i0]*(1-f)+CTR[i0+1]*f;}
function slopeAt(x){return (railAt(x+6)-railAt(x-6))/12;}
function gapAt(wx){for(const[g0,w]of CGAPS)if(wx>g0+4&&wx<g0+w-4)return{x:g0,w};return null;}
function inLift(x){return CLIFT.some(([a,b])=>x>a&&x<b);}
const CSEC=[{n:'THE MINING CAMP',a:0},{n:'CRATER LOOPS',a:7200},{n:'ORE CANYON',a:14600},{n:'THE DEEP MINE',a:23000}];
function cartBuild(){const H=[],A=o=>H.push(o),beam=x=>A({k:'beam',x,l:'L'}),crate=x=>A({k:'crate',x,l:'L',hp:1}),ore=(x,n,y=-30)=>{for(let i=0;i<n;i++)A({k:'ore',x:x+i*44,y,l:'L'});},
 sign=(x,t)=>A({k:'sign',x,t}),guard=x=>A({k:'guard',x,l:'L',hp:2}),toss=x=>A({k:'toss',x,hp:1}),work=(x,v,bg)=>A({k:'work',x,v,hp:1,bg});
 sign(420,'JUMP!');work(560,0);ore(2100,6,-40);ore(3060,4);work(3500,1);sign(4950,'DUCK!');beam(5150);work(5300,2);ore(6700,5,-40);
 crate(7300);ore(8000,3,-60);ore(8600,3,-60);guard(9100);work(9300,1);ore(10200,5);work(10800,0,1);beam(11000);ore(12400,6,-40);crate(13100);toss(14400);
 crate(15200);beam(17500);crate(19000);beam(19500);work(21000,2,1);
 A({k:'deep',x:23400});work(24800,0,1);work(25100,1,1);ore(25000,4);beam(25950);work(26200,2);work(26600,0,1);guard(26300);work(26900,1,1);crate(27000);work(28200,0,1);work(28600,1,1);ore(28300,6,-40);
 A({k:'exit',x:30300});return H;}
function cartInit(){const r0=CT&&CT.retry!=null?CT.retry:0;if(mission===7){bugInit(r0);return;}if(r0===9){CT={foot:footInit(),cp:9,sec:3,H:[],shots:[],es:[],rocks:[],parts:[],pops:[],msgs:[{t:'BEAT KEYMASTER VOLK TO OPEN THE GATE!',l:3}],t:0,d:0,v:0,ore:0,dig:{on:false},lp:{},hp:3,inv:0};startMusic('boss',2);return;}const s0=r0,d=CSEC[s0].a;CT={d,v:330,lane:'L',wy:railAt(d+CX0),vy:0,y:0,air:false,jb:0,duck:false,hp:3,inv:1.2,cool:0,shots:[],es:[],rocks:[],parts:[],pops:[],msgs:[],cp:s0,sec:s0,ore:0,loop:null,dig:{on:false,x:-260,tx:-40,f:2.5,end:0,fall:0},cave:false,cf:1.5,slow:0,done:0,puz:null,t:0,H:cartBuild(),fall:0,camY:railAt(d+CX0)-215,lp:{}};
 CT.H.forEach(h=>{if(h.x<CT.d+CX0-60)h.gone=1;});CLOOPS.forEach(x=>{if(x<CT.d+CX0)CT.lp[x]=1;});CT.msgs.push({t:CSEC[s0].n,l:2.2});startMusic(CT.dig.on?'boss':'asteroid');}
function updCart(dt){const c=CT;if(!c)return;if(c.bug){updBug(dt);return;}c.t+=dt;if(c.foot&&!c.puz){updFoot(dt);return;}if(AUTO)autoCart();if(c.puz){updPuzzle(dt);return;}
 for(const p of c.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt;}c.parts=c.parts.filter(p=>p.l>0);for(const p of c.pops)p.l-=dt;c.pops=c.pops.filter(p=>p.l>0);for(const m of c.msgs)m.l-=dt;c.msgs=c.msgs.filter(m=>m.l>0);
 const camTo=(y)=>{c.camY+=(y-205-c.camY)*Math.min(1,dt*16);c.camY=Math.max(y-270,Math.min(y-110,c.camY));};
 if(c.loop){const L=c.loop,R=110;const h=R*(1-Math.cos(L.a));L.v=L.v0;L.a+=L.v/R*dt;c.inv=Math.max(c.inv,.3);
  if(L.a>=TAU){c.loop=null;c.v=L.v0;sfx('whoosh');}else{L.px=L.cx+Math.sin(L.a)*R;L.py=L.cy+Math.cos(L.a)*R;camTo(L.cy+60);}return;}
 const wx0=c.d+CX0,lift=inLift(wx0),s=slopeAt(wx0);
 // speed: gravity along the track, chain lifts pull you up slowly, bumps slow you
 if(!c.air){if(lift){c.v+=(290-c.v)*Math.min(1,dt*4);if((c.t*6|0)!==c.lt){c.lt=c.t*6|0;sfx('blip');}}else c.v+=900*s/Math.sqrt(1+s*s)*dt;c.v+=(360-c.v)*dt*.1;}
 if(c.slow>0){c.v=Math.min(c.v,290);c.slow-=dt;}if(c.done){c.v=Math.max(0,c.v-420*dt);if(c.v>20&&Math.random()<.6)c.parts.push({x:CX0+rnd(-20,20),y:c.wy,vx:rnd(-200,-60),vy:rnd(-160,-40),l:.4,c:'#ffe066'});}else c.v=Math.max(260,Math.min(680,c.v));
 c.d+=c.v*dt;c.inv-=dt;c.cool-=dt;const wx=c.d+CX0,rail=railAt(wx);
 for(let i=c.cp+1;i<CSEC.length;i++)if(c.d>=CSEC[i].a){c.cp=i;c.sec=i;c.hp=3;c.msgs.push({t:'CHECKPOINT · '+CSEC[i].n,l:2.2});sfx('pick');cartSave();}
 // ramp lips give a boost so every jump clears
 for(const[g0]of CGAPS)if(!c.air&&wx>g0-140&&wx<g0-20&&c.v<480){c.v=480;if(!c.bst||c.t-c.bst>1){c.bst=c.t;cartPop(CX0+40,c.wy-c.camY-70,'BOOST!',18);sfx('power');}}
 if(pressedA||(I.J&&!c.jhold))c.jb=.14;c.jhold=I.J;pressedA=false;c.jb-=dt;c.duck=!c.air&&(I.D||held('duck'));
 const over=gapAt(wx);
 if(!c.air){const ny=railAt(wx+c.v*dt),vyT=(ny-rail)/dt;
  if(over||(vyT-c.vy)>1100*dt*1.6&&c.vy<vyT-40){c.air=true;if(c.v>380&&!over&&(!c.at||c.t-c.at>2)){c.at=c.t;cartPop(CX0,c.wy-c.camY-70,'AIRTIME!',16);}}else{c.wy=rail;c.vy=c.v*s;}
  if(c.jb>0&&!c.done&&!c.air){c.air=true;c.vy=Math.min(c.vy,0)-560;c.jb=0;sfx('whoosh');}}
 if(c.air){c.vy+=1100*dt;c.wy+=c.vy*dt;const r2=railAt(wx);if(c.wy>=r2&&!gapAt(wx)){c.wy=r2;c.air=false;c.vy=c.v*slopeAt(wx);cartDust(CX0,c.wy);if(c.v>0)SHAKE=Math.max(SHAKE,.08);}
  else if(gapAt(wx)&&c.wy>r2+160){const gp=gapAt(wx);c.d=gp.x+gp.w+30-CX0;c.wy=railAt(c.d+CX0)-80;c.vy=0;c.crane=(c.crane||0)+1;cartHurt();c.msgs.push({t:'WHOA! THE CRANE CAUGHT YOU!',l:1.4});}}
 c.y=c.wy-railAt(wx);camTo(c.wy);
 if(c.v>470&&!c.air&&s>.3&&(!c.wh||c.t-c.wh>3)){c.wh=c.t;cartPop(CX0+60,c.wy-c.camY-80,'WHEEE!',22);}
 // loops
 for(const lx of CLOOPS)if(!c.lp[lx]&&wx>=lx&&!c.air){c.lp[lx]=1;c.loop={a:0,cx:CX0,cy:railAt(lx)-110,v0:Math.max(c.v,560),px:CX0,py:railAt(lx)};c.v=Math.max(c.v,560);sfx('whoosh');score+=100;cartPop(W/2,90,'LOOP-DE-LOOP!',26);break;}
 const cy=c.wy,top=cy-(c.duck?30:60),bot=cy-4;
 if((I.F||held('shoot'))&&c.cool<=0&&!c.done){c.cool=.2;c.shots.push({x:CX0+26,y:cy-(c.duck?22:40),vx:560+c.v*.3});sfx('shot');}
 for(const sh of c.shots){sh.x+=sh.vx*dt;if(sh.x>W+20)sh.dead=1;}
 for(const h of c.H){if(h.gone)continue;const sx=h.x-c.d;if(sx<-260){h.gone=1;continue;}if(sx>W+300)break;const hy=railAt(h.x);
  if(h.k==='beam'){if(Math.abs(sx-CX0)<26&&top<hy-48&&bot>hy-74&&!h.hit){h.hit=1;cartHurt();}}
  else if(h.k==='crate'||h.k==='rock'){if(Math.abs(sx-CX0)<30&&bot>hy-30&&!c.loop){h.gone=1;cartHurt();cartBurst(sx,hy-15,'#c08040');}
   for(const sh of c.shots)if(!sh.dead&&Math.abs(sh.x-sx)<18&&Math.abs(sh.y-(hy-15))<26){sh.dead=1;h.hp--;if(h.hp<=0){h.gone=1;score+=20;cartBurst(sx,hy-15,'#e0a050');sfx('boom');cartPop(sx,hy-40-c.camY,'CRUNCH!',16);}}}
  else if(h.k==='ore'){const oy=hy+h.y;if(Math.abs(sx-CX0)<26&&oy>top-10&&oy<bot+8){h.gone=1;c.ore++;score+=10;sfx('pick');}}
  else if(h.k==='guard'){if(!h.act&&sx<W-40){h.act=1;h.t=0;h.f=1.2;h.px=W-60;c.msgs.push({t:'VORR GUARD CART!',l:1.4});}
   if(h.act){h.t+=dt;h.px+=((h.t>7?W+140:470)-h.px)*Math.min(1,dt*2);h.x=c.d+h.px;const gy=railAt(h.x);h.f-=dt;if(h.f<.6&&!h.aim)h.aim=Math.random()<.5?'hi':'lo';if(h.f<=0&&h.px<W-20){h.f=2;c.es.push({x:h.px-24,y:cy-(h.aim==='hi'?48:16),vx:-260,hi:h.aim==='hi'});h.aim=null;sfx('hit');}
    for(const sh of c.shots)if(!sh.dead&&Math.abs(sh.x-h.px)<26&&Math.abs(sh.y-(gy-30))<36){sh.dead=1;h.hp--;h.fl=.1;sfx('hit');if(h.hp<=0){h.gone=1;score+=60;stats.kills++;cartBurst(h.px,gy-30,'#b04aff');sfx('boom');cartPop(h.px,gy-70-c.camY,'BONK!',20);}}h.fl=(h.fl||0)-dt;if(h.px>W+100&&h.t>7)h.gone=1;}}
  else if(h.k==='toss'){if(!h.thr&&sx<W-90){h.thr=1;const lx=CX0+c.v*1.05+40;c.rocks.push({x:sx,y:hy-50,tx:lx+c.d,t:0,T:1.05,sx});sfx('whoosh');}
   for(const sh of c.shots)if(!sh.dead&&Math.abs(sh.x-sx)<20&&Math.abs(sh.y-(hy-40))<30){sh.dead=1;h.gone=1;score+=40;stats.kills++;cartBurst(sx,hy-40,'#ff5a3a');sfx('boom');}}
  else if(h.k==='work'&&!h.bg){for(const sh of c.shots)if(!sh.dead&&Math.abs(sh.x-sx)<20&&Math.abs(sh.y-(hy-46))<30){sh.dead=1;if(!h.hey){h.hey=1;cartPop(sx,hy-96-c.camY,['HEY! I\'M WORKING!','ON BREAK!','RUDE!'][h.v%3],13);}}}
  else if(h.k==='digon'&&sx<CX0){h.gone=1;c.dig.on=true;c.dig.x=-300;startMusic('boss',2);c.msgs.push({t:'THE BIG DIGGER! KEEP MOVING!',l:2.2});SHAKE=.6;sfx('stinger');}
  else if(h.k==='digend'&&sx<CX0){h.gone=1;c.dig.end=1;}
  else if(h.k==='deep'&&sx<CX0){h.gone=1;c.cave=true;c.msgs.push({t:'DOWN INTO PHOBOS!',l:2.2});sfx('stinger');}
  else if(h.k==='exit'&&sx<CX0){h.gone=1;c.done=1;c.msgs.push({t:'END OF THE LINE!',l:2});cartPop(CX0+40,c.wy-c.camY-80,'SKRRRK!',24);sfx('stinger');SHAKE=.4;}}
 for(const e of c.es){e.x+=e.vx*dt;if(e.x<-20)e.dead=1;if(Math.abs(e.x-CX0)<20&&e.y>top&&e.y<bot+4){e.dead=1;cartHurt();}for(const sh of c.shots)if(!sh.dead&&Math.abs(sh.x-e.x)<10&&Math.abs(sh.y-e.y)<10){sh.dead=1;e.dead=1;}}
 for(const r of c.rocks){r.t+=dt;if(r.t>=r.T){r.dead=1;if(r.tx-c.d>CX0+40&&!gapAt(r.tx))c.H.push({k:'rock',x:r.tx,l:'L',hp:2});sfx('boom');}}
 c.H.sort((a,b)=>a.x-b.x);
 const D=c.dig;if(D.on){D.tx=c.slow>0?CX0-70:-40;if(D.end){D.tx=-500;D.fall+=dt;}D.x+=(D.tx-D.x)*Math.min(1,dt*(c.slow>0?1.4:.8));D.f-=dt;
  if(D.f<=0&&!D.end&&!c.done&&!c.loop){D.f=3.6;c.rocks.push({x:D.x+90,y:c.wy-140,tx:c.d+CX0+c.v*1.1+60,t:0,T:1.1,sx:D.x+90});sfx('whoosh');}
  if(D.x+150>CX0-20&&!D.end){cartHurt();c.slow=0;D.x=CX0-260;}if(D.end&&D.fall>2.2){D.on=false;c.msgs.push({t:'THE DIGGER IS STUCK! WOO!',l:2});startMusic('asteroid');}}
 if(c.cave&&!c.done&&c.d>25600&&c.d<27100){c.cf-=dt;if(c.cf<=0){c.cf=rnd(2.2,3);const lx=CX0+c.v*1.0+rnd(80,170);c.rocks.push({x:lx,y:c.wy-c.camY-300,tx:c.d+lx,t:0,T:.95,sx:lx,fall:1});}}
 c.shots=c.shots.filter(x=>!x.dead);c.es=c.es.filter(e=>!e.dead);c.rocks=c.rocks.filter(r=>!r.dead);
 if(c.done&&c.v<8&&!c.puz&&!c.arr){c.arr=1;CT.retry=9;try{writeSave({cp:{m:5,k:9}});}catch(e){}playComic(PRISONARR,()=>{CT={retry:9};go('cart');});}}
function autoCart(){const c=CT;VK.F=1;VK.J=0;VK.D=0;if(c.puz)return;const wx=c.d+CX0;
 for(const h of c.H){if(h.gone)continue;const dx=h.x-wx;if((h.k==='crate'||h.k==='rock')&&dx>0&&dx<50&&!c.air)VK.J=1,pressedA=true;if(h.k==='beam'&&dx>-30&&dx<80)VK.D=1;}
 for(const e of c.es){const dx=e.x-CX0;if(dx>0&&dx<90){if(e.hi)VK.D=1;else if(!c.air)VK.J=1,pressedA=true;}}}
function trackPath(x0,x1,yf,dy){g.beginPath();let first=1;for(let x=x0;x<=x1+7;x+=8){const xx=Math.min(x,x1);if(first){g.moveTo(xx,yf(xx)+dy);first=0;}else g.lineTo(xx,yf(xx)+dy);}}
function trackSeg(x0,x1,yf,col){const st=22,off=((CT.d%st)+st)%st;for(let x=x0-((x0+off)%st);x<x1;x+=st){if(x<x0)continue;const y=yf(x);g.fillStyle='#4a3020';g.fillRect(x-6,y+2,12,7);}
 for(const dy of[0,4]){g.strokeStyle=OL;g.lineWidth=5;trackPath(x0,x1,yf,dy);g.stroke();g.strokeStyle=col;g.lineWidth=2.5;trackPath(x0,x1,yf,dy);g.stroke();}}
function drawCart(){const c=CT;if(c.bug){drawBug();return;}if(c.puz){drawPuzzle();return;}if(c.foot){drawFoot();return;}const deep=c.d>23200,cy0=c.camY;
 const sk=SHAKE>0?[rnd(-1,1)*SHAKE*8,rnd(-1,1)*SHAKE*8]:[0,0];g.save();g.translate(sk[0],sk[1]);
 const dk=Math.max(0,Math.min(1,(cy0-300)/900));
 g.fillStyle=lg(g,0,0,0,H,['#05040e','#160e1c','#3a2418']);g.fillRect(-10,-10,W+20,H+20);
 if(dk<1){g.globalAlpha=1-dk;starfield(c.d*.05);marsBall(470-((c.d*.01)%60),96-cy0*.05,84);g.globalAlpha=1;}
 if(dk>0){g.globalAlpha=dk;g.fillStyle=lg(g,0,0,0,H,['#140a08','#2a160e','#3a2014']);g.fillRect(-10,-10,W+20,H+20);g.globalAlpha=1;}
 const wall=(par,y0,col,amp,seed)=>{g.fillStyle=col;g.beginPath();g.moveTo(-10,H+10);for(let x=-10;x<=W+10;x+=16){const wx=x+c.d*par;g.lineTo(x,y0-cy0*par-Math.abs(Math.sin(wx*.006+seed))*amp-Math.sin(wx*.021+seed)*amp*.25);}g.lineTo(W+10,H+10);g.closePath();g.fill();};
 wall(.15,240,'#3a2c28',60,1);wall(.35,300,'#4a3830',50,3);
 // deep mine cavern: glowing ore veins, lamps and robots at work in the background
 if(dk>.05){g.globalAlpha=dk;for(let i=0;i<6;i++){const bx=((i*150-c.d*.3)%900+900)%900-120,by=200+((i*97)%120)-((cy0-1400)*.3);dglow(bx,by,40,'#ff9a3a',.35);g.fillStyle='#ffb050';g.beginPath();g.moveTo(bx,by-14);g.lineTo(bx+9,by);g.lineTo(bx,by+14);g.lineTo(bx-9,by);g.closePath();g.fill();
   workerArt(bx+50,by+40,i%3,T+i);}
  g.fillStyle='#1a120e';g.beginPath();g.moveTo(-10,-10);for(let x=-10;x<=W+10;x+=14){const wx=x+c.d*.9;g.lineTo(x,30+Math.abs(Math.sin(wx*.05))*20+Math.sin(wx*.013)*10);}g.lineTo(W+10,-10);g.closePath();g.fill();
  for(let i=0;i<4;i++){const lx=((i*190-c.d*.9)%760+760)%760-60;circ(lx,52,5,'#ffe066');dglow(lx,52,40,'#ffb040',.35);}g.globalAlpha=1;}
 g.globalAlpha=.08;g.fillStyle=halftone();g.fillRect(0,0,W,H);g.globalAlpha=1;
 g.save();g.translate(0,-cy0);const rail=x=>railAt(x+c.d),X0=-20,X1=W+20;
 // rock under the track (pits at gaps)
 g.fillStyle=lg(g,0,cy0+150,0,cy0+H,['#5a4636','#2a1e18']);g.beginPath();g.moveTo(X0,cy0+H+40);for(let x=X0;x<=X1;x+=8){const wx=x+c.d,gp=gapAt(wx);g.lineTo(x,gp?cy0+H+40:rail(x)+60+Math.sin(wx*.02)*10);}g.lineTo(X1,cy0+H+40);g.closePath();g.fill();
 // trestles under high track
 for(let x=X0-((c.d%60)+60)%60;x<X1;x+=60){const wx=x+c.d;if(gapAt(wx))continue;const y=rail(x);g.strokeStyle='#6a4a30';g.lineWidth=3;g.beginPath();g.moveTo(x,y+8);g.lineTo(x,y+60);g.moveTo(x-20,y+8);g.lineTo(x+20,y+56);g.stroke();}
 {let x=X0;const brk=CGAPS.map(([a,w])=>[a-c.d,a+w-c.d]).filter(q=>q[1]>X0&&q[0]<X1);for(const[a,b]of brk){if(a>x)trackSeg(x,a,rail,'#c0c8d8');x=b;}if(x<X1)trackSeg(x,X1,rail,'#c0c8d8');}
 for(const[a]of CLIFT){const sx=a-c.d;if(sx>-80&&sx<W+80){panel(sx-50,rail(sx)-120,100,32,'#ffc53d');txt('CLACK CLACK',sx,rail(sx)-104,11,'#ffe066');}}
 for(const lx of CLOOPS){const sx=lx-c.d;if(sx<-200||sx>W+200)continue;const ly=railAt(lx)-110;g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.arc(sx,ly,110,0,TAU);g.stroke();g.strokeStyle='#ffd080';g.lineWidth=4;g.beginPath();g.arc(sx,ly,110,0,TAU);g.stroke();}
 for(const h of c.H){if(h.gone)continue;const sx=h.k==='guard'&&h.act?h.px:h.x-c.d;if(sx<-80||sx>W+80)continue;const hy=railAt(h.x);
  if(h.k==='beam')beamArt(sx,hy-74);else if(h.k==='crate')crateArt(sx,hy);else if(h.k==='rock')rockArt(sx,hy-16,17,1);else if(h.k==='ore'){const oy=hy+h.y+Math.sin(T*4+h.x)*3;dglow(sx,oy,12,'#ff9a3a',.7);g.fillStyle=OL;g.beginPath();g.moveTo(sx,oy-10);g.lineTo(sx+8,oy);g.lineTo(sx,oy+10);g.lineTo(sx-8,oy);g.closePath();g.fill();g.fillStyle='#ffb050';g.beginPath();g.moveTo(sx,oy-7);g.lineTo(sx+5.5,oy);g.lineTo(sx,oy+7);g.lineTo(sx-5.5,oy);g.closePath();g.fill();}
  else if(h.k==='guard'&&h.act)guardCart(sx,railAt(h.x),h.fl||0,h.aim);else if(h.k==='work'){if(h.bg){g.globalAlpha=.75;workerArt(sx,hy-70,h.v,T+h.x);g.globalAlpha=1;}else workerArt(sx,hy-2,h.v,T+h.x);}else if(h.k==='toss')tosserArt(sx,hy-2,T,h.thr);
  else if(h.k==='sign'){g.fillStyle='#4a3020';g.fillRect(sx-3,hy-70,6,70);panel(sx-46,hy-104,92,36,'#ffc53d');txt(h.t,sx,hy-86,16,'#ffe066');}}
 for(const r of c.rocks){const k=r.t/r.T,lx=r.tx-c.d,gy=railAt(r.tx);g.globalAlpha=.25+k*.5;g.fillStyle='#000';g.beginPath();g.ellipse(lx,gy+2,10+k*14,4,0,0,TAU);g.fill();g.globalAlpha=1;const rx=r.fall?lx:r.sx+(lx-r.sx)*k,ry=r.fall?(gy-320)+(300)*k*k:(gy-90)+70*k-Math.sin(k*Math.PI)*90;rockArt(rx,ry,15);if(k<.6&&(T*8|0)%2)txt('!',lx,gy-26,16,'#ff3a3a');}
 if(c.dig.on)diggerArt(c.dig.x,railAt(c.d+c.dig.x+80)+6,T,c.dig.fall);
 if(c.loop){const L=c.loop;cartArt(L.px,L.py-4,false,false,-L.a);}
 else{if(!(c.inv>0&&(T*14|0)%2&&c.inv<1.4))cartArt(CX0,c.wy,c.duck,false,c.air?Math.max(-.4,Math.min(.4,Math.atan2(c.vy,c.v))):Math.atan(slopeAt(c.d+CX0)));}
 for(const e of c.es){dglow(e.x,e.y,11,'#ff3a8a',.9);circ(e.x,e.y,4.5,'#ffd0f0');}
 for(const sh of c.shots){dglow(sh.x,sh.y,9,'#7fffff',.9);g.fillStyle='#fff';g.fillRect(sh.x-7,sh.y-1.5,14,3);}
 for(const p of c.parts){g.globalAlpha=Math.min(1,p.l*2);circ(p.x,p.y,2.4,p.c);}g.globalAlpha=1;
 g.restore();
 for(const p of c.pops)sfxText(p.t,Math.max(90,Math.min(W-90,p.x)),Math.max(100,Math.min(H-100,p.y))-(1-p.l)*20,p.sz||18,.9-p.l,-.08);
 g.restore();
 panel(14,10,150,40,'#ffc53d');for(let i=0;i<3;i++){const on=i<c.hp;circ(34+i*24,30,9,OL);circ(34+i*24,30,7,on?'#ff4f7b':'#3a2a4a');}txt('x'+LIVES,118,30,12,'#ffffff');
 const pw=200,px=W/2-pw/2;g.fillStyle=OL;g.fillRect(px-2,14,pw+4,10);g.fillStyle='#2a2040';g.fillRect(px,16,pw,6);g.fillStyle='#ffc53d';g.fillRect(px,16,pw*Math.min(1,c.d/30300),6);for(const s of CSEC){circ(px+pw*s.a/30300,19,3,'#5fe36a');}txt(CSEC[c.sec].n,W/2,36,11,'#7ae8ff');
 txt('◆ ORE '+c.ore,20,62,12,'#ffb050','left');
 {let n=0;for(const h of c.H){if(h.gone||n>1)continue;const sx=h.x-c.d;if(sx>W-30&&sx<W+c.v*1.3&&(h.k==='beam'||h.k==='crate'||h.k==='rock')){n++;const y=Math.max(110,Math.min(H-120,railAt(h.x)-c.camY-50));if((T*6|0)%2){panel(W-96,y-16,84,32,'#ff3a4a');txt(h.k==='beam'?'DUCK!':'JUMP!',W-54,y,14,'#ffffff');}}}}
 if(c.msgs.length){const m=c.msgs[0];panel(W/2-170,56,340,30,'#45d6ff');txt(m.t,W/2,71,13,'#ffffff');}
 if(showTouch&&!c.done)cartBtns();}

function cartSave(){try{writeSave({cp:{m:5,k:CT.cp}});}catch(e){}}
function cartHurt(){if(CT.inv>0||AUTO)return;CT.hp--;CT.inv=1.6;CT.slow=.9;sfx('hurt');SHAKE=.35;CT.pops.push({x:CX0,y:CT.wy-CT.camY-70,t:'OOF!',l:.8});if(CT.hp<=0){const k=CT.cp;loseLife(()=>{CT.retry=k;cartInit();});}}
function cartPop(x,y,t,sz=18){CT.pops.push({x,y,t,l:.9,sz});}
function cartDust(x,y){for(let i=0;i<6;i++)CT.parts.push({x:x+rnd(-20,20),y,vx:rnd(-80,30),vy:rnd(-80,-20),l:.4,c:'#a89880'});}
function cartBurst(x,y,col){for(let i=0;i<12;i++)CT.parts.push({x,y,vx:rnd(-160,160),vy:rnd(-200,40),l:rnd(.3,.7),c:Math.random()<.5?col:'#fff'});}
function startPuzzle(){CT.puz={r:[1,2,3],a:[0,0,0],sel:0,t:0,won:0,hint:0};sfx('blip');startMusic('comic');}
function puzRot(i){const P=CT.puz;const d=[[1,-1,0],[-1,1,-1],[0,-1,1]][i];for(let k=0;k<3;k++)P.r[k]=((P.r[k]+d[k])%4+4)%4;sfx('hit');}
function puzSolve(){const P=CT.puz;for(let a=0;a<4;a++)for(let b=0;b<4;b++)for(let c2=0;c2<4;c2++){const r=P.r.slice();for(const[n,i]of[[a,0],[b,1],[c2,2]]){const d=[[1,-1,0],[-1,1,-1],[0,-1,1]][i];for(let j=0;j<n;j++)for(let k=0;k<3;k++)r[k]=((r[k]+d[k])%4+4)%4;}if(r.every(v=>v===0))return[a,b,c2];}return null;}
const GEARX=[262,362,462],GEARY=[180,150,180],GEARR=[44,40,44];
function updPuzzle(dt){const P=CT.puz;P.t+=dt;for(let k=0;k<3;k++){const tgt=-P.r[k]*Math.PI/2;P.a[k]+=(tgt-P.a[k])*Math.min(1,dt*10);}
 if(P.won){P.won+=dt;if(P.won>2.4&&!P.end){P.end=1;try{COMET=true;localStorage.setItem('gr_comet','1');}catch(e){}completeMission(5);}return;}
 if(P.r.every(v=>v===0)&&P.t>.6){P.won=.01;sfx('power');SHAKE=.4;return;}
 if(AUTO&&P.t>.8&&((P.t*3|0)!==P.lt)){P.lt=P.t*3|0;const s=puzSolve();if(s){const i=s.findIndex(n=>n>0);if(i>=0)puzRot(i);}}
 if(P.t>12)P.hint=1;
 const tp=tapped();if(tp){for(let i=0;i<3;i++)if(Math.hypot(tp.x-GEARX[i],tp.y-GEARY[i])<GEARR[i]+14){puzRot(i);P.sel=i;}}
 if(K.ArrowLeft&&!P.kl)P.sel=(P.sel+2)%3;if(K.ArrowRight&&!P.kr)P.sel=(P.sel+1)%3;if((K.Enter||K.Space)&&!P.ke)puzRot(P.sel);P.kl=K.ArrowLeft;P.kr=K.ArrowRight;P.ke=K.Enter||K.Space;}
function gearArt(x,y,r,a,col,ok,sel){g.save();g.translate(x,y);g.rotate(a);const n=10;g.beginPath();for(let i=0;i<n*2;i++){const aa=i/(n*2)*TAU,rr=i%2?r:r+9;g.lineTo(Math.cos(aa)*rr,Math.sin(aa)*rr);}g.closePath();g.fillStyle=OL;g.fill();g.save();g.scale(.92,.92);g.fillStyle=ballG(g,0,0,r,r,col);g.fill();g.restore();
 circ(0,0,r*.38,OL);circ(0,0,r*.3,'#5a4020');g.fillStyle=ok?'#5fe36a':'#ff4f7b';g.strokeStyle=OL;g.lineWidth=3;g.beginPath();g.moveTo(0,-r+2);g.lineTo(-9,-r+20);g.lineTo(9,-r+20);g.closePath();g.fill();g.stroke();g.restore();
 if(sel&&!showTouch){g.strokeStyle='#ffe066';g.lineWidth=3;g.setLineDash([6,5]);g.beginPath();g.arc(x,y,r+16,0,TAU);g.stroke();g.setLineDash([]);}}
function drawPuzzle(){const P=CT.puz;const im=IMG.comic_c54;if(im)drawCover(im,0,0,W,H);else{g.fillStyle='#1a1030';g.fillRect(0,0,W,H);}g.fillStyle='rgba(8,4,24,.45)';g.fillRect(0,0,W,H);
 panel(148,80,344,172,'#ffc53d');for(let i=0;i<3;i++)gearArt(GEARX[i],GEARY[i],GEARR[i],P.a[i],['#d0a040','#e0b850','#c89030'][i],P.r[i]===0,P.sel===i);
 for(let i=0;i<3;i++){const ok=P.r[i]===0;circ(GEARX[i],100,8,OL);circ(GEARX[i],100,6,ok?'#5fe36a':'#ff4f7b');if(ok)dglow(GEARX[i],100,14,'#5fe36a',.6);}
 txt('THE CELL LOCK',W/2,40,22,'#ffe066');txt(showTouch?'TAP A GEAR TO TURN IT':'◀ ▶ PICK A GEAR · ENTER TO TURN',W/2,66,12,'#ffffff');txt('Point every arrow UP. Gears turn their neighbors too!',W/2,264,12,'#7ae8ff');
 if(P.hint&&!P.won){panel(150,282,340,40,'#ff9a3a');txt('TIP: Try the middle gear first!',W/2,302,13,'#ffffff');}
 if(P.won){const k=Math.min(1,P.won*2);g.globalAlpha=k;sfxText('CLICK! CLUNK!',W/2,200,34,P.won,-.08);g.globalAlpha=1;}}
// ---- art ----
function cartArt(x,y,duck,flash,rot){g.save();g.translate(x,y);if(rot)g.rotate(rot);
 captain(0,duck?-4:-22,CAPS[cap],{sc:.78,t:T,shoot:(I.F||held('shoot'))&&(T*8|0)%2,flash});
 g.fillStyle=OL;g.beginPath();g.moveTo(-30,-30);g.lineTo(30,-30);g.lineTo(24,0);g.lineTo(-24,0);g.closePath();g.fill();
 g.fillStyle=flash?'#ffffff':lg(g,0,-28,0,0,['#c87840','#8a4a20','#5a2a10']);g.beginPath();g.moveTo(-27,-27);g.lineTo(27,-27);g.lineTo(21.5,-2.5);g.lineTo(-21.5,-2.5);g.closePath();g.fill();
 g.fillStyle='rgba(255,220,160,.35)';g.fillRect(-26,-27,52,4);for(const rx of[-18,0,18])circ(rx,-15,2,'#ffe0a0');g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(-24,-14);g.lineTo(24,-14);g.stroke();
 if(COMET){g.save();g.translate(-15,duck?-31:-35);cometMini(0,0,.8);g.restore();}// Comet rides up front, always visible over the rim
 for(const wx of[-15,15]){circ(wx,2,8,OL);circ(wx,2,6,'#6a7090');const a=T*20;g.strokeStyle='#c0c8e0';g.lineWidth=1.5;g.beginPath();g.moveTo(wx+Math.cos(a)*5,2+Math.sin(a)*5);g.lineTo(wx-Math.cos(a)*5,2-Math.sin(a)*5);g.stroke();circ(wx,2,2,'#c0c8e0');}
 g.restore();}
function cometMini(x,y,sc){g.save();g.translate(x,y);g.scale(sc,sc);// dachshund head in a glass bubble + harness with a stubby antenna pack (ref: assets/ref/comet.jpg)
 g.fillStyle=OL;g.beginPath();g.roundRect(-17,-2,11,9,3);g.fill();g.fillStyle='#b8bcc4';g.beginPath();g.roundRect(-16,-1,9,7,2);g.fill();circ(-9,3,1.6,(T*3|0)%2?'#5fe36a':'#2a8a3a');g.fillStyle=OL;g.fillRect(-13.5,-7,3,6);circ(-12,-7.5,2,OL);
 g.fillStyle=OL;g.beginPath();g.ellipse(1,6,10,5,0,0,TAU);g.fill();g.fillStyle='#a4521e';g.beginPath();g.ellipse(1,6,8.6,3.8,0,0,TAU);g.fill();g.strokeStyle='#2a5ab8';g.lineWidth=2.6;g.beginPath();g.moveTo(-8,3);g.lineTo(9,8);g.stroke();
 g.fillStyle=OL;g.beginPath();g.ellipse(1,-8,11.5,10.5,0,0,TAU);g.fill();g.fillStyle=ballG(g,0,-10,10,10,'#a4521e');g.beginPath();g.ellipse(1,-8,10,9,0,0,TAU);g.fill();
 g.fillStyle=OL;g.beginPath();g.ellipse(10,-3,8.5,5.5,.1,0,TAU);g.fill();g.fillStyle='#c98a4a';g.beginPath();g.ellipse(10,-3,7.2,4.3,.1,0,TAU);g.fill();circ(16.5,-4,2.6,OL);circ(15.8,-4.8,.8,'#fff');
 g.fillStyle=OL;g.beginPath();g.ellipse(-8,-1,4.6,10,.25,0,TAU);g.fill();g.fillStyle='#6a2e10';g.beginPath();g.ellipse(-8,-1,3.4,8.8,.25,0,TAU);g.fill();
 circ(3,-12,2.4,OL);circ(3.7,-12.7,.8,'#fff');
 g.strokeStyle='rgba(200,240,255,.9)';g.lineWidth=2;g.beginPath();g.arc(2,-7,18,0,TAU);g.stroke();g.fillStyle='rgba(200,240,255,.13)';g.fill();g.fillStyle='rgba(255,255,255,.6)';g.beginPath();g.ellipse(-6,-18,4,2,-.5,0,TAU);g.fill();g.restore();}
function guardCart(x,y,fl,aim){g.save();g.translate(x,y);blob(0,-30,T,{r:14,face:-1,angry:1,col:'#b04aff',flash:fl>0});
 if(aim){const hy=aim==='hi'?-48:-16;dglow(-26,hy,14,'#ff3a3a',.9);txt(aim==='hi'?'▲':'▼',-26,hy-(aim==='hi'?18:-18),12,'#ff3a3a');}
 g.fillStyle=OL;g.beginPath();g.moveTo(-30,-26);g.lineTo(30,-26);g.lineTo(24,0);g.lineTo(-24,0);g.closePath();g.fill();g.fillStyle=fl>0?'#fff':lg(g,0,-24,0,0,['#8a5ad0','#4a2a8a']);g.beginPath();g.moveTo(-27,-23);g.lineTo(27,-23);g.lineTo(21.5,-2.5);g.lineTo(-21.5,-2.5);g.closePath();g.fill();
 g.fillStyle='#ff4fd0';g.beginPath();g.moveTo(0,-20);g.lineTo(6,-12);g.lineTo(0,-5);g.lineTo(-6,-12);g.closePath();g.fill();for(const wx of[-15,15]){circ(wx,2,8,OL);circ(wx,2,6,'#3a3060');}g.restore();}
function workerArt(x,y,v,t){g.save();g.translate(x,y);if(v===0){// drill bot: boxy robot with a spinning round saw, sparks
  g.fillStyle=OL;g.fillRect(-18,-44,36,40);g.fillStyle=lg(g,0,-42,0,-6,['#f0c040','#b08020']);g.fillRect(-16,-42,32,36);circ(-6,-30,4,'#2a2a3a');circ(6,-30,4,'#2a2a3a');circ(-6,-30,2,'#7ae8ff');circ(6,-30,2,'#7ae8ff');
  g.save();g.translate(26,-22);g.rotate(t*14);circ(0,0,13,OL);circ(0,0,11,'#c0c8d8');for(let i=0;i<8;i++){g.rotate(TAU/8);g.fillStyle=OL;g.fillRect(9,-2,6,4);}circ(0,0,3,OL);g.restore();if((t*10|0)%2)for(let i=0;i<3;i++)circ(40+rnd(0,8),-22+rnd(-8,8),1.6,'#ffe066');
  for(const wx of[-10,10])circ(wx,-2,5,OL);}
 else if(v===1){// hauler bot carrying an ore box
  const b=Math.sin(t*6)*2;g.fillStyle=OL;g.fillRect(-16,-40+b,32,30);g.fillStyle='#6a90c8';g.fillRect(-14,-38+b,28,26);circ(0,-46+b,9,OL);circ(0,-46+b,7,'#9ab8e8');circ(0,-46+b,3,'#5fe36a');
  g.fillStyle=OL;g.fillRect(-22,-66+b,44,20);g.fillStyle='#8a5a30';g.fillRect(-20,-64+b,40,16);for(let i=0;i<4;i++)circ(-14+i*9,-66+b,4,'#ff9a3a');for(const wx of[-9,9])circ(wx,-6,5,OL);}
 else{// little alien miner with a hard hat and a short pick
  blob(0,-14,t,{r:14,col:'#7ad0a0'});g.fillStyle=OL;g.beginPath();g.ellipse(0,-30,15,7,0,Math.PI,TAU);g.fill();g.fillStyle='#ffc53d';g.beginPath();g.ellipse(0,-31,13,6,0,Math.PI,TAU);g.fill();circ(0,-34,3,'#fff6a0');dglow(0,-34,8,'#fff6a0',.6);
  g.save();g.translate(16,-14);g.rotate(Math.sin(t*8)*.8-.4);g.fillStyle=OL;g.fillRect(-2,-16,4,16);g.fillStyle='#a0a8c0';g.beginPath();g.moveTo(-10,-16);g.quadraticCurveTo(0,-22,10,-16);g.lineTo(0,-14);g.closePath();g.fill();g.restore();}
 g.restore();}
function tosserArt(x,y,t,thr){g.save();g.translate(x,y);g.fillStyle=OL;g.fillRect(-18,-50,36,46);g.fillStyle=lg(g,0,-48,0,-6,['#c05a4a','#7a2a2a']);g.fillRect(-16,-48,32,42);circ(0,-34,7,OL);circ(0,-34,5,'#ff3a3a');dglow(0,-34,10,'#ff3a3a',.6);
 g.save();g.translate(-14,-40);g.rotate(thr?-1.6:Math.sin(t*3)*.3);g.fillStyle=OL;g.fillRect(-4,-22,8,22);if(!thr){circ(0,-24,9,OL);circ(0,-24,7,'#a08870');}g.restore();for(const wx of[-10,10])circ(wx,-2,5,OL);g.restore();}
function diggerArt(x,y,t,fall){g.save();g.translate(x,y+fall*fall*120);g.rotate(fall*.25);
 g.fillStyle=OL;g.beginPath();g.roundRect(-150,-150,200,140,18);g.fill();g.fillStyle=lg(g,0,-146,0,-14,['#8a7a6a','#4a3a30']);g.beginPath();g.roundRect(-146,-146,192,132,15);g.fill();
 for(let i=0;i<6;i++){circ(-130+i*32,-140,3,'#c0a080');}g.fillStyle='rgba(255,200,80,.5)';g.fillRect(-140,-90,180,6);
 g.fillStyle=OL;g.beginPath();g.ellipse(-60,-150,34,26,0,Math.PI,TAU);g.fill();g.fillStyle='rgba(190,240,255,.55)';g.beginPath();g.ellipse(-60,-150,30,22,0,Math.PI,TAU);g.fill();g.save();g.translate(-60,-158);blob(0,0,t,{r:13,face:1,angry:1,col:'#b04aff'});g.restore();
 g.fillStyle=OL;g.beginPath();g.roundRect(-160,-22,220,30,14);g.fill();g.fillStyle='#3a3040';g.beginPath();g.roundRect(-156,-18,212,22,11);g.fill();for(let i=0;i<8;i++)circ(-140+i*28+((t*60)%28),-7,6,'#6a6070');
 g.save();g.translate(78,-80);g.rotate(t*4);const R=78;g.beginPath();for(let i=0;i<32;i++){const a=i/32*TAU,rr=i%2?R:R+14;g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr);}g.closePath();g.fillStyle=OL;g.fill();g.save();g.scale(.93,.93);g.fillStyle=ballG(g,0,0,R,R,'#b0a090');g.fill();g.restore();
 for(let i=0;i<6;i++){g.rotate(TAU/6);g.fillStyle=OL;g.fillRect(14,-6,R-22,12);g.fillStyle='#8a7a68';g.fillRect(16,-4,R-26,8);}circ(0,0,22,OL);circ(0,0,17,'#ff9a3a');dglow(0,0,24,'#ff9a3a',.5);g.restore();
 for(let i=0;i<4;i++){g.globalAlpha=.35;circ(-170-i*24+Math.sin(t*5+i)*6,-130-i*14,16+i*6,'#8a7a6a');}g.globalAlpha=1;g.restore();}
function rockArt(x,y,r,big){g.fillStyle=OL;g.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,rr=r*(1+.18*Math.sin(i*2.7));g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();g.fillStyle=ballG(g,x,y,r,r,big?'#9a8470':'#a89078');g.beginPath();for(let i=0;i<7;i++){const a=i/7*TAU,rr=(r-2.5)*(1+.18*Math.sin(i*2.7));g.lineTo(x+Math.cos(a)*rr,y+Math.sin(a)*rr);}g.closePath();g.fill();}
function crateArt(x,y){g.fillStyle=OL;g.fillRect(x-16,y-31,32,31);g.fillStyle=lg(g,0,y-29,0,y-2,['#e0a050','#a06020']);g.fillRect(x-14,y-29,28,27);g.strokeStyle='#6a3a10';g.lineWidth=3;g.beginPath();g.moveTo(x-12,y-27);g.lineTo(x+12,y-4);g.moveTo(x+12,y-27);g.lineTo(x-12,y-4);g.stroke();for(const[a,b]of[[-12,-27],[12,-27],[-12,-4],[12,-4]])circ(x+a,y+b,1.6,'#ffe0a0');}
function beamArt(x,y){g.strokeStyle='#6a6070';g.lineWidth=3;for(const dx of[-18,18]){g.beginPath();g.moveTo(x+dx,-10);g.lineTo(x+dx,y);g.stroke();}g.fillStyle=OL;g.fillRect(x-34,y-2,68,28);for(let i=0;i<5;i++){g.fillStyle=i%2?'#ffc53d':'#2a2a3a';g.beginPath();g.moveTo(x-31+i*13,y+1);g.lineTo(x-31+i*13+13,y+1);g.lineTo(x-31+i*13+5,y+23);g.lineTo(x-31+i*13-8,y+23);g.closePath();g.fill();}g.save();g.beginPath();g.rect(x-31,y+1,62,22);g.restore();}
function cartBtns(){const b=btns(),du={x:b.left.x+20,y:b.left.y,r:b.left.r*1.15};const draw=(o,label,on)=>{g.globalAlpha=.62;circ(o.x,o.y,o.r+2,OL);g.fillStyle=lg(g,0,o.y-o.r,0,o.y+o.r,on?['#7fe8ff','#2a8ab8']:['#3a4a9a','#141c4a']);g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill();g.globalAlpha=.92;txt(label,o.x,o.y,o.r*.42,'#ffffff');g.globalAlpha=1;};
 draw(du,'DUCK',held('duck'));draw(b.jump,'JUMP',held('jump'));draw(b.shoot,'FIRE',held('shoot'));}
function cartZone(p){const b=btns();if(p.y<H*.3)return null;if(p.x<W*.45){if(CT&&(CT.foot||CT.bug))return p.x<(b.left.x+b.right.x)/2?'left':'right';return 'duck';}if(p.x>W*.55){const dS=Math.hypot(p.x-b.shoot.x,p.y-b.shoot.y),dJ=Math.hypot(p.x-b.jump.x,p.y-b.jump.y);if(Math.abs(dS-dJ)<b.jump.r*.35)return null;return dS<dJ?'shoot':'jump';}return null;}
const PHOBOSLAND=[
 {img:'c33',d:4,int:3,cap:'Phobos. A Vorr mining camp.',fx:{s:'THUMP!',x:470,y:300,sz:28,at:.3}},
 {img:'c36',d:4,int:3,cap:'The only way in: the mine rails.',bub:[{s:'Hop in. Hang on tight!',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'CLANK!',x:520,y:80,sz:26,at:.3}}];
const COMETWIN=[
 {img:'c35',d:4,int:3,cap:'The cell door slides open...',bub:[{s:'The prisoner is... a DOG?!',who:'@',x:360,y:60,w:220,tx:330,ty:160,at:.5}],fx:{s:'A... DOG?!',x:470,y:40,sz:28,at:.3}},
 {img:'c34',d:4.5,int:3,cap:'His antenna pack beeps to life.',bub:[{s:'BEEP. I am Comet. I sent the code. Thank you!',who:'COMET',x:360,y:120,w:240,tx:300,ty:120,at:.5}],fx:{s:'WAG WAG!',x:200,y:300,sz:26,at:.3}},
 {img:'c19',d:4,int:3,cap:'Pale Blue has a new crew member.',fx:{s:'COMET JOINS THE CREW!',x:320,y:300,sz:22,at:.4,rot:-.04}}];

// ================= MISSION 6: ASTEROID BELT SPEED RUN (Phobos ▶ Vesta) =================
const STG6=[{n:'THE BELT EDGE',a:0,b:6200,boss:'tosser',jump:7600,iv:950},{n:'ROCK RAPIDS',a:7600,b:13600,boss:'smasher',jump:15000,iv:900},{n:'VESTA APPROACH',a:15000,b:21000,boss:'kreel2',jump:22400,iv:860}],
 GEMSP6=[[0,2700,24],[1,5300,-24],[2,9600,26],[3,12400,-26],[4,17600,24]];
['tosser','tosser-throw','smasher','smasher-smash','muncher','muncher-open','kreelship','kreelship-open'].forEach(k=>loadImg('spr_'+k,'assets/sprites/'+k+'.png'));
function sprI(k,x,y,h,fl,flip){const im=IMG['spr_'+k];if(!im)return false;const w=im.width*h/im.height;g.save();g.translate(x,y);if(flip)g.scale(-1,1);g.drawImage(im,-w/2,-h/2,w,h);if(fl){g.globalCompositeOperation='lighter';g.globalAlpha=.45;g.drawImage(im,-w/2,-h/2,w,h);}g.restore();return true;}
function vestaBall(x,y,r){circ(x,y,r+3,OL);g.fillStyle=ballG(g,x,y,r,r,'#a8b0c4');g.beginPath();g.arc(x,y,r,0,TAU);g.fill();g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();
 g.fillStyle='rgba(60,64,90,.35)';g.beginPath();g.ellipse(x+r*.1,y+r*.45,r*.62,r*.36,0,0,TAU);g.fill();g.fillStyle='rgba(230,235,250,.5)';g.beginPath();g.moveTo(x-r*.08,y+r*.42);g.lineTo(x+r*.08,y+r*.12);g.lineTo(x+r*.24,y+r*.42);g.fill();
 for(const[a,b,c]of[[-.45,-.35,.14],[.4,-.15,.11],[-.15,.05,.08],[.5,.45,.1]]){g.fillStyle='rgba(50,52,80,.3)';g.beginPath();g.arc(x+a*r,y+b*r,c*r,0,TAU);g.fill();}g.restore();}
function M6WAVE(p,F,msg,cy){const s=sp;if(SPM!==6)return;
 if(p==='munch'){if(s.foes.some(f=>f.kind==='muncher'))return;s.foes.push({kind:'muncher',pat:'munch',age:0,del:0,x:SW+50,y:rnd(70,SH-130),hp:AUTO?1:5,life:30,sz:1,pers:'rookie'});msg('MUNCHER! IT EATS ROCKS... AND SHIPS!');sfx('warn');}
 if(p==='rings'){const y0=rnd(80,SH-140),dy=rnd(-50,50);for(let i=0;i<4;i++)s.picks.push({x:SW+30+i*120,y:clamp(y0+dy*i*.5,60,SH-110),k:'ring'});msg('SPEED RINGS! FLY THROUGH FOR A BOOST!');}
 if(p==='tow'){s.foes.push({age:0,del:0,pers:'rookie',pat:'hold',kind:'tow',cy:rnd(60,SH-160),tx:SW-110,oy:0,hp:3,life:14,rock:1});msg('TOW SAUCER! IT FLINGS ROCKS!');}
 if(p==='sneeze'){s.foes.push({age:0,del:0,pers:'rookie',pat:'hold',kind:'sneeze',cy:rnd(70,SH-130),tx:SW-100,oy:1,hp:2,life:13});msg('SNEEZER! DODGE THE DUST!');}
 if(p==='disg'){s.foes.push({age:0,del:0,pers:'rookie',pat:'drift',kind:'disg',cy:rnd(70,SH-130),sv:110,hp:3,life:16});}
 if(p==='big'){m6Big(rnd(80,SH-130),34+Math.random()*8);}
 if(p==='field'){for(let i=0;i<5;i++)setTimeout(()=>{if(sp===s&&s.phase==='fly')m6Rock(1);},i*260);msg('ROCK FIELD!');}}
function m6Big(y,r){const s=sp;s.warns=s.warns||[];s.warns.push({y,r,t:AUTO?.4:1.2,k:'rock'});sfx('warn');}
function m6Rock(big){const s=sp,si=Math.min(2,s.bossI),st=STG6[si],pr=clamp((s.dist-st.a)/(st.b-st.a),0,1),lv=si+pr;// 0..3: closer to Vesta = more, bigger rocks
 if(!big&&lv>.8&&Math.random()<.08+lv*.06){m6Big(rnd(70,SH-130),28+lv*4+rnd(0,6));return;}
 const pool=lv<1?[8,13,13,19]:lv<2?[13,19,19,24]:[13,19,24,28],r=pool[Math.random()*pool.length|0];
 s.rocks.push({x:SW+40,y:rnd(30,SH-90),vx:-rnd(150,230)*(s.boost>0?1.3:1),vy:rnd(-25,25),r,hp:r>22?7:r>15?4:r>10?2:1,rot:rnd(0,6),vr:rnd(-2,2),junk:false,v:Math.random()*3|0});}
function m6Upd(s,dt){s.time=(s.time||0)+(s.phase==='fly'||s.phase==='boss'?dt:0);if(s.boost>0)s.boost-=dt;
 for(const w of s.warns||[]){w.t-=dt;if(w.t<=0&&!w.done){w.done=1;if(w.k==='rock')s.rocks.push({x:SW+60,y:w.y,vx:-(w.v||200),vy:0,r:w.r,hp:AUTO?2:12,rot:0,vr:rnd(-1,1),junk:false,v:Math.random()*3|0,big:1});}}
 s.warns=(s.warns||[]).filter(w=>!w.done);
 // munchers eat rocks (and lunge at ships after a clear tell)
 for(const f of s.foes)if(f.kind==='muncher'&&!f.dead){for(const r of s.rocks)if(!r.dead&&Math.hypot(r.x-f.x,r.y-f.y)<r.r+22*f.sz){r.dead=1;f.sz=Math.min(1.6,f.sz+.12);f.chew=.5;s.pops.push({x:f.x,y:f.y-30,t:'CHOMP!',l:.6,comic:1,sz:16});sfx('hit');}}
 // rings
 for(const q of s.picks)if(q.k==='ring'&&!q.got&&Math.abs(q.x-s.x)<22&&Math.abs(q.y-s.y)<34){q.got=1;s.boost=UPG(6)?3.4:2.4;s.rings=(s.rings||0)+1;score+=100;s.pops.push({x:s.x+30,y:s.y-24,t:'BOOST!',l:.7,comic:1,sz:18,c:'#5fe36a'});sfx('power');}}
function m6Draw(s){if(SPM!==6)return;
 if(s.boost>0){g.strokeStyle='rgba(180,255,200,.55)';g.lineWidth=2;for(let i=0;i<26;i++){const yy=(i*61.7+T*30)%SH,xx=((i*211-T*1400)%(SW+200)+SW+200)%(SW+200)-100;g.beginPath();g.moveTo(xx,yy);g.lineTo(xx+90,yy);g.stroke();}}
 for(const w of s.warns||[]){const a=.5+.5*Math.sin(T*16);g.strokeStyle=`rgba(255,70,90,${.35+.4*a})`;g.lineWidth=Math.max(6,w.r*1.6);g.setLineDash([18,14]);g.beginPath();g.moveTo(SW,w.y);g.lineTo(0,w.y);g.stroke();g.setLineDash([]);
  g.fillStyle=OL;g.beginPath();g.moveTo(SW-12,w.y-26);g.lineTo(SW-40,w.y+20);g.lineTo(SW+16,w.y+20);g.fill();g.fillStyle='#ff3a4a';g.beginPath();g.moveTo(SW-12,w.y-20);g.lineTo(SW-34,w.y+16);g.lineTo(SW+10,w.y+16);g.fill();txt('!',SW-12,w.y+4,18,'#ffffff');}
 for(const r of s.rocks)if(r.big&&r.x<SW){g.strokeStyle='rgba(255,90,90,.6)';g.lineWidth=2;g.beginPath();g.arc(r.x,r.y,r.r+6,0,TAU);g.stroke();}
 const B=s.boss;if(B&&!B.dead)m6BossFx(B);
 }
function fmtT(t){return Math.floor(t/60)+':'+String(Math.floor(t%60)).padStart(2,'0');}
function ringDraw(q){const y=q.y+Math.sin(T*4+q.x*.02)*3;dglow(q.x,y,34,'#5fe36a',.45);g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.ellipse(q.x,y,12,30,0,0,TAU);g.stroke();g.strokeStyle='#7dff9a';g.lineWidth=5;g.stroke();g.strokeStyle='#e8fff0';g.lineWidth=1.5;g.beginPath();g.ellipse(q.x,y,12,30,0,-1.2,.2);g.stroke();}
function muncherDraw(f){const open=f.tell>0||f.lunge>0||f.chew>0,h=44*f.sz;if(f.tell>0){dglow(f.x,f.y,40*f.sz,'#ff4f7b',.4+.3*Math.sin(T*20));}if(!sprI(open?'muncher-open':'muncher',f.x,f.y,h,f.hit>0)){circ(f.x,f.y,h/2,'#8a9a5a',OL);}
 if(f.tell>0)txt('!!',f.x,f.y-h/2-10,16,'#ff4f7b');}
// ---- bosses ----
function m6Init(B){if(B.type==='tosser'){B.w=0;B.wf=2.2;B.v=2.6;}if(B.type==='smasher'){B.sm=0;B.sf=2.4;}if(B.type==='kreel2'){B.cx=SW+160;B.mc=0;B.mt=3;B.mo=0;B.lf=4.5;B.cf=7;B.ph=1;}}
const M6BOSS={
 tosser:(B,dt,hpF)=>{const s=sp;B.x+=(SW-110-B.x)*Math.min(1,dt*1.2);B.y=SH/2-30+Math.sin(B.t*.55)*80;const p2=hpF<.5;
  if(p2&&!B.p2){B.p2=1;s.pops.push({x:B.x-20,y:B.y-80,t:'GRRRAAH!',l:1.2,comic:1,sz:26});sfx('stinger');SHAKE=.4;s.msgs.push({t:'HE THROWS FASTER NOW. WATCH THE RED LANES!',l:2.2});}
  if(B.w>0){B.w-=dt;if(B.w<=0){s.rocks.push({x:B.x-50,y:B.ty,vx:-(p2?300:250),vy:0,r:30,hp:AUTO?2:9,rot:0,vr:1.2,junk:false,v:1,big:1});sfx('whoosh');SHAKE=.2;if(p2&&!B.dbl){B.dbl=1;B.w=.55;B.ty=clamp(s.y,50,SH-100);}else B.dbl=0;}}
  else{B.wf-=dt;if(B.wf<=0){B.wf=p2?2.2:3;B.w=p2?.8:1.1;B.ty=clamp(s.y,50,SH-100);(s.warns=s.warns||[]).push({y:B.ty,r:22,t:B.w,k:'lane'});sfx('warn');}
   B.v-=dt;if(B.v<=0){B.v=p2?2.4:3.2;const a=Math.atan2(s.y-B.y,s.x-B.x);for(const k of[-.25,0,.25])s.rocks.push({x:B.x-40,y:B.y,vx:Math.cos(a+k)*190,vy:Math.sin(a+k)*190,r:9,hp:1,rot:0,vr:3,junk:false,v:2});}
   if(p2&&!B.mn&&hpF<.35){B.mn=1;M6WAVE('munch',null,t=>s.msgs.push({t,l:1.8}));}}
  B.pose=B.w>0?'throw':'stand';return[46,64,false];},
 smasher:(B,dt,hpF)=>{const s=sp;const p2=hpF<.5;B.x+=(SW-130-B.x)*Math.min(1,dt*1.4);B.y+=((p2?s.y:SH/2-30+Math.sin(B.t*.7)*70)-B.y)*Math.min(1,dt*(p2?.8:1));
  if(p2&&!B.p2){B.p2=1;s.pops.push({x:B.x,y:B.y-70,t:'ME MAD!',l:1.2,comic:1,sz:26});sfx('stinger');SHAKE=.4;}
  if(B.sm>0){B.sm-=dt;if(B.sm<=0){const n=p2?14:10;for(let k=0;k<n;k++){const a=k*TAU/n+B.t;s.eshots.push({x:B.x-40,y:B.y,vx:Math.cos(a)*(p2?135:115),vy:Math.sin(a)*(p2?135:115),tb:1,rk:1});}const a=Math.atan2(s.y-B.y,s.x-B.x);for(const k of[-.18,.18])s.eshots.push({x:B.x-40,y:B.y,vx:Math.cos(a+k)*190,vy:Math.sin(a+k)*190,tb:1,rk:1});
    s.pops.push({x:B.x-40,y:B.y-40,t:'SMASH!',l:.8,comic:1,sz:28});sfx('bigboom');SHAKE=.45;if(p2&&!B.dbl){B.dbl=1;B.sm=.6;}else B.dbl=0;}}
  else{B.sf-=dt;if(B.sf<=0){B.sf=p2?2.3:3;B.sm=p2?.7:.95;sfx('warn');}}
  B.pose=B.sm>0?'smash':'stand';return[52,50,false];},
 kreel2:(B,dt,hpF)=>{const s=sp;if(!B.chg)B.cx+=(SW-150-B.cx)*Math.min(1,dt*1.1);const cy=B.chg&&B.chg.st>0?B.chg.y:SH/2-30+Math.sin(B.t*.45)*55;B.x=B.cx;B.y=cy;
  const ph=hpF>.6?1:hpF>.3?2:3;if(ph>B.ph){B.ph=ph;SHAKE=.7;sfx('stinger');s.eshots=[];s.pops.push({x:Math.min(B.cx,W-160),y:Math.max(100,cy-110),t:ph===2?'OPEN WIDE!':'FULL POWER!',l:1.5,comic:1,sz:26});s.msgs.push({t:ph===2?'COMET: BEEP. The mouth pulls you in. Stay far left!':'COMET: BEEP. Flash means charge. Change lanes!',l:3});}
  const fast=ph===3;// mouth cycle: closed (armored) -> tell (glow) -> open (core hittable) -> chomp
  B.mt-=dt;if(B.mc===0&&B.mt<=0){B.mc=1;B.mt=.85;s.pops.push({x:B.cx-60,y:cy-90,t:'MOUTH OPENING!',l:.9,comic:1,sz:18});sfx('blip');}
  else if(B.mc===1&&B.mt<=0){B.mc=2;B.mt=fast?2.1:2.7;}else if(B.mc===2&&B.mt<=0){if(ph>=2){B.mc=3;B.mt=.6;s.pops.push({x:B.cx-80,y:cy-70,t:'CHOMP!',l:.8,comic:1,sz:26});sfx('warn');}else{B.mc=0;B.mt=fast?2:3.1;}}
  else if(B.mc===3&&B.mt<=0){B.mc=0;B.mt=fast?2:3;SHAKE=.5;sfx('bigboom');if(s.x>B.cx-190&&Math.abs(s.y-cy)<80)hurtShip();}
  B.mo+=((B.mc===2?1:B.mc===1?.3:0)-B.mo)*Math.min(1,dt*7);
  if(B.mc===2&&ph>=2)s.x=Math.min(SW-80,s.x+70*dt);// suction
  if(B.mc===2){B.sp=(B.sp||0)-dt;if(B.sp<=0){B.sp=fast?1:1.4;const a=Math.atan2(s.y-cy,s.x-B.cx);s.rocks.push({x:B.cx-70,y:cy+10,vx:Math.cos(a)*170,vy:Math.sin(a)*170,r:11,hp:1,rot:0,vr:3,junk:false,v:0});}}
  // eye lasers: 1s dashed warning, then a 0.5s beam along the lane
  for(const L of B.las||[]){L.t+=dt;if(L.t>L.w&&!L.fired){L.fired=1;sfx('bigboom');SHAKE=.25;}if(L.fired&&L.t<L.w+.5&&Math.abs(s.y-L.y)<14&&s.x<B.cx)hurtShip();}
  B.las=(B.las||[]).filter(L=>L.t<L.w+.5);
  B.lf-=dt;if(B.lf<=0&&!B.chg){B.lf=fast?3.6:ph===2?4.6:5.2;const y=clamp(s.y,40,SH-90);B.las.push({y,t:0,w:1});if(fast)B.las.push({y:clamp(y+(y<SH/2?90:-90),40,SH-90),t:0,w:1});sfx('blip');}
  // charge (phase 3): flash + dashed lane, then ram
  const C=B.chg;if(C){C.t+=dt;if(C.st===0){if(C.t>1.05){C.st=1;C.t=0;sfx('whoosh');SHAKE=.35;}}else if(C.st===1){B.cx-=480*dt;if(B.cx<40)C.st=2;}else{B.cx+=(SW-150-B.cx)*Math.min(1,dt*2.4);if(Math.abs(B.cx-(SW-150))<8)B.chg=null;}}
  if(fast){B.cf-=dt;if(B.cf<=0&&!B.chg&&B.mc===0){B.cf=7.5;B.chg={st:0,t:0,y:clamp(s.y,50,SH-110)};s.pops.push({x:B.cx-40,y:Math.max(90,cy-90),t:'!!',l:1,comic:1,sz:32});sfx('warn');}}
  // shots: only the core (inside the open mouth) takes damage
  const kx=B.cx-46,ky=cy+6;for(const b of s.shots){if(b.dead)continue;const dc=Math.hypot(b.x-kx,b.y-ky);if(B.mc===2&&dc<30){if(!b.pierce)b.dead=1;B.hp-=b.dmg||1;B.hit=.08;sfx('hit');if(Math.random()<.2)boomAt(s.booms,b.x,b.y,4,'#ff7ae0');}
   else if(!(B.mc===2&&Math.abs(b.y-ky)<34&&b.x<kx+10)&&Math.hypot(b.x-B.cx,b.y-cy)<86){b.dead=1;if(!B.tk||B.t-B.tk>1){B.tk=B.t;s.pops.push({x:B.cx-60,y:cy-60,t:B.mc===2?'AIM FOR THE CORE!':'CLANG!',l:.7,comic:1,sz:15});}}}
  if(Math.hypot(s.x-B.cx,s.y-cy)<(C&&C.st===1?90:84))hurtShip();
  return[-1,-1,false];}};
function m6BossFx(B){if(B.type==='kreel2'){for(const L of B.las||[]){if(!L.fired){const a=.5+.5*Math.sin(T*18);g.strokeStyle=`rgba(255,50,70,${.4+.4*a})`;g.lineWidth=3;g.setLineDash([14,10]);g.beginPath();g.moveTo(B.cx-60,L.y);g.lineTo(0,L.y);g.stroke();g.setLineDash([]);}
   else{dglow(B.cx-60,L.y,30,'#ff3a4a',.9);g.fillStyle='rgba(255,60,80,.85)';g.fillRect(0,L.y-10,B.cx-60,20);g.fillStyle='rgba(255,240,240,.95)';g.fillRect(0,L.y-4,B.cx-60,8);}}
  const C=B.chg;if(C&&C.st===0){g.globalAlpha=.4+.4*Math.sin(T*20);g.strokeStyle='#ff4f7b';g.lineWidth=4;g.setLineDash([16,12]);g.strokeRect(0,C.y-70,B.cx,140);g.setLineDash([]);g.globalAlpha=1;}}}
const M6DRAW={
 tosser:B=>{if(B.w>0){g.fillStyle='rgba(255,60,80,.18)';}sprI(B.pose==='throw'?'tosser-throw':'tosser',B.x,B.y,150,B.hit>0)||circ(B.x,B.y,40,'#3ab0a0',OL);if(B.pose==='throw')dsp(rockSpr(30,1,false),B.x,B.y-72,.9);},
 smasher:B=>{if(B.sm>0)dglow(B.x-30,B.y,70,'#ffe066',.25+.25*Math.sin(T*24));sprI(B.pose==='smash'?'smasher-smash':'smasher',B.x,B.y,118,B.hit>0,B.pose==='smash')||circ(B.x,B.y,40,'#8a4ad0',OL);},
 kreel2:B=>{const open=B.mo>.5;if(B.mc===1||B.mc===2)dglow(B.cx-46,B.y+6,40+20*B.mo,'#ff4fd0',.5*B.mo+.2);if(B.mc===3){g.save();g.translate(Math.sin(T*60)*3,0);}sprI(open?'kreelship-open':'kreelship',B.cx,B.y,190,B.hit>0)||circ(B.cx,B.y,80,'#6a6050',OL);if(B.mc===3)g.restore();
  if(B.mc===2){g.strokeStyle='rgba(255,255,255,.8)';g.lineWidth=2;g.beginPath();g.arc(B.cx-46,B.y+6,24+3*Math.sin(T*8),0,TAU);g.stroke();}
}};
function m6Munch(f,dt){const s=sp;f.chew=(f.chew||0)-dt;if(f.lunge>0){f.lunge-=dt;return;}if(f.tell>0){f.tell-=dt;if(f.tell<=0){const a=Math.atan2(s.y-f.y,s.x-f.x);f.lvx=Math.cos(a)*330;f.lvy=Math.sin(a)*330;f.lunge=.75;sfx('whoosh');}return;}
 f.lc=(f.lc??3)-dt;if(f.lc<=0&&f.x<SW-20){f.lc=4.5;f.tell=AUTO?.3:1;sfx('warn');}}
function beltBg(s){for(let i=0;i<14;i++){const z=.25+(i%3)*.12,x=((i*157-s.dist*z)%(SW+120)+SW+120)%(SW+120)-60,y=(i*89.7)%SH;g.globalAlpha=.35;dsp(rockSpr([8,13,19][i%3],i%3,false),x,y,.6+z,1,i+T*.1);g.globalAlpha=1;}}
(function(){const _u=m6Upd;m6Upd=function(s,dt){_u(s,dt);if(s.phase==='arrive'&&s.sb==null){s.sb=Math.max(0,Math.round((420-(s.time||0))/5)*50);score+=s.sb;s.msgs.push({t:'SPEED BONUS +'+s.sb,l:3});}};})();
Object.assign(M3BOSS,M6BOSS);Object.assign(M3DRAW,M6DRAW);
// ================= MISSION 8: JOURNEY TO JUPITER — SPACE JUNKYARD (ship flight; everything thrown is blastable) =================
const STG8=[{n:'SATELLITE GRAVEYARD',a:0,b:6400,boss:'satboss',jump:7800,iv:820},{n:'SCRAP RAPIDS',a:7800,b:14200,boss:'jrocket',jump:15600,iv:760},{n:'THE COMPACTOR',a:15600,b:22000,boss:'claw',jump:23400,iv:700}],
 GEMSP8=[[0,2900,0],[1,5600,0],[2,10400,0],[3,12900,0],[4,18700,0]];
['jy-satboss','jy-rocket','jy-claw-open','jy-claw-full','jy-drone','jy-junk0','jy-junk1','jy-junk2','jy-junk3','jy-junk4','jy-junk5','jy-junk6'].forEach(k=>loadImg('spr_'+k,'assets/sprites/'+k+'.png'));loadImg('bg_jyfar','assets/bg/jy-far.jpg');
function jupBall(x,y,r){circ(x,y,r+3,OL);g.save();g.beginPath();g.arc(x,y,r,0,TAU);g.clip();g.fillStyle=ballG(g,x,y,r,r,'#e8b07a');g.fillRect(x-r,y-r,2*r,2*r);
 const B=[['#c46a3a',.18],['#f4dcb0',.12],['#a8542a',.14],['#f0c890',.1],['#b8643a',.16]];let yy=y-r*.8;for(const[c,h]of B){g.fillStyle=c;g.globalAlpha=.75;g.fillRect(x-r,yy,2*r,h*r);yy+=h*r*1.7;}g.globalAlpha=1;
 g.fillStyle='#d0502a';g.beginPath();g.ellipse(x+r*.25,y+r*.28,r*.2,r*.11,0,0,TAU);g.fill();g.fillStyle='rgba(0,0,0,.25)';g.beginPath();g.arc(x+r*.35,y+r*.2,r,0,TAU);g.arc(x+r*.35+r*2,y,r,0,TAU,true);g.fill();g.restore();}
// junk piece kinds: 0 crate,1 solar shard,2 dish,3 nut,4 plate/fin,5 gear,6 old satellite (gem wreck)
function jyJunk(x,y,jk,r,vx,vy,hp,o){const s=sp;s.rocks.push(Object.assign({x,y,vx,vy,r,hp,rot:rnd(0,6),vr:rnd(-2.5,2.5),junk:true,v:0,jk},o||{}));}
function jyDrawRock(r){if(r.goo){dglow(r.x,r.y,14,'#9cf06a',.5);g.save();g.translate(r.x,r.y);const q=1+Math.sin(T*14)*.12;g.scale(q,1/q);circ(0,0,r.r,r.hit>0?'#fff':'#9cf06a',OL);circ(-2,-2,2,'#eaffd0');g.restore();return true;}const im=IMG['spr_jy-junk'+r.jk];if(!im)return false;const sz=r.r*2.3,w=im.width>im.height?sz:sz*im.width/im.height,h=im.width>im.height?sz*im.height/im.width:sz;
 if(r.wreck){dglow(r.x,r.y,r.r+22,'#ff7ae0',.35+.15*Math.sin(T*5));}if(r.big){g.strokeStyle='rgba(255,90,90,.6)';g.lineWidth=2;g.beginPath();g.arc(r.x,r.y,r.r+6,0,TAU);g.stroke();}
 g.save();g.translate(r.x,r.y);g.rotate(r.rot);g.drawImage(im,-w/2,-h/2,w,h);if(r.hit>0){g.globalCompositeOperation='lighter';g.globalAlpha=.5;g.drawImage(im,-w/2,-h/2,w,h);}g.restore();
 if(r.wreck&&r.x<SW)txt('◆',r.x,r.y-r.r-8,10,'#ff9af0');return true;}
function M8WAVE(p,F,msg){const s=sp;if(SPM!==8)return;const lv=Math.min(2,s.bossI);
 const act=s.foes.filter(f=>!f.dead&&f.x>-20).length,busy=(s.warns||[]).some(w=>!w.done)||s.rocks.some(r=>r.orb);if(['drones','blobs','riders','faces','magnet','vorr'].includes(p)&&act>=4)return;if((p==='wall'||p==='spin'||p==='big')&&(busy||act>=3))return;if(p==='magnet'&&s.foes.some(f=>f.kind==='jymag'&&!f.dead))return;
 if(p==='drones'){const n=lv>=1?3:2;for(let i=0;i<n;i++)s.foes.push({kind:'jydrone',pat:'hold',age:0,del:i*.9,cy:clamp(70+i*((SH-180)/(n-1||1))+rnd(-20,20),60,SH-120),tx:SW-90-i*50,oy:i,hp:AUTO?1:3,life:15,pers:'rookie'});msg('SCRAP DRONES! THEY FLASH, THEN THROW BOLTS!');}
 if(p==='drift'){for(let i=0;i<4+lv;i++)jyJunk(SW+40+i*70,rnd(40,SH-100),[0,2,4,5][i%4],rnd(13,19),-rnd(110,160),rnd(-30,30),2);msg('JUNK DRIFT! BLAST A PATH!');}
 if(p==='wall'){const gap=rnd(80,SH-160);for(let y=40;y<SH-60;y+=34){if(Math.abs(y-gap)<46)continue;jyJunk(SW+50,y,[0,4,5][(y/34|0)%3],15,-120,0,2);}msg('SCRAP WALL! FIND THE GAP OR SHOOT ONE!');}
 if(p==='big'){m8Big(rnd(80,SH-130),30+lv*4);}
 if(p==='spin'){const cy=rnd(110,SH-160);for(let i=0;i<6;i++){const a=i*TAU/6;jyJunk(SW+90+Math.cos(a)*46,cy+Math.sin(a)*46,[1,3][i%2],10,-140,0,1,{orb:{cx:SW+90,cy,a,rr:46}});}msg('JUNK RING!');}
 if(p==='blobs'){const n=lv>=1?3:2;for(let i=0;i<n;i++)s.foes.push({kind:'jyblob',pat:'drift',age:0,del:i*1.1,cy:rnd(70,SH-140),sv:rnd(70,95),hp:AUTO?1:2,life:20,pers:'rookie',col:i%3});msg('WOBBLERS! SILLY ALIENS IN THE JUNK!');}
 if(p==='riders'){for(let i=0;i<2;i++)s.foes.push({kind:'jyrider',pat:'drift',age:0,del:i*1.6,cy:i?SH-150:95,sv:85,hp:AUTO?1:3,life:20,pers:'rookie',jk:[0,5][i]});msg('JUNK RIDERS! THEY WAVE... THEN THROW!');}
 if(p==='faces'){const n=lv>=2?2:1;for(let i=0;i<n;i++)s.foes.push({kind:'jyface',pat:'hold',age:0,del:i*1.4,cy:clamp(110+i*(SH-260)+rnd(-20,20),70,SH-130),tx:SW-100-i*40,oy:i*2,hp:AUTO?1:3,life:14,pers:'rookie'});msg('BLEH-BOTS! THEY MAKE FACES, THEN SPIT GOO!');}
 if(p==='magnet'){s.foes.push({kind:'jymag',pat:'hold',age:0,del:0,cy:rnd(80,SH-150),tx:SW-110,oy:2,hp:AUTO?1:6,life:16,pers:'rookie'});msg('JUNK MAGNET! IT PULLS SCRAP AT YOU!');}
 if(p==='vorr'){spawnWave(['divers','spread','pincer','snake','V','sdrone'][(Math.random()*6)|0]);}}
function m8Big(y,r){const s=sp;s.warns=s.warns||[];s.warns.push({y,r,t:AUTO?.4:1.2,k:'junk'});sfx('warn');}
function m8Rock(){const s=sp,si=Math.min(2,s.bossI),st=STG8[si],pr=clamp((s.dist-st.a)/(st.b-st.a),0,1),lv=si+pr;
 if(lv>.7&&Math.random()<.07+lv*.05){m8Big(rnd(70,SH-130),26+lv*4);return;}const r=[10,13,16,19][Math.random()*(lv<1?3:4)|0];
 jyJunk(SW+40,rnd(30,SH-90),[0,1,2,3,4,5][Math.random()*6|0],r,-rnd(140,210),rnd(-25,25),r>15?3:r>11?2:1);}
function m8Drone(f,dt){const s=sp,onS=f.x>-10&&f.x<SW+10;if(!onS)return;f.at=(f.at??rnd(1.2,2.2))-dt;
 if(f.tell>0){f.tell-=dt;if(f.tell<=0){const a=Math.atan2(s.y-f.y,s.x-f.x);for(const k of(s.bossI>=1?[-.2,.2]:[0]))jyJunk(f.x-16,f.y,3,8,Math.cos(a+k)*200,Math.sin(a+k)*200,1);sfx('whoosh');}return;}
 if(f.at<=0){f.at=s.bossI>=2?2.2:2.8;f.tell=AUTO?.25:.75;sfx('blip');}}
function m8Mag(f,dt){const s=sp;if(f.x>SW)return;f.pt=(f.pt??1.2)-dt;if(f.tell>0){f.tell-=dt;if(f.tell<=0){for(let i=0;i<3;i++){const a=rnd(0,TAU);const jx=f.x+Math.cos(a)*120,jy=clamp(f.y+Math.sin(a)*120,30,SH-80),aa=Math.atan2(s.y-jy,s.x-jx);jyJunk(jx,jy,[0,2,5][i],12,Math.cos(aa)*150,Math.sin(aa)*150,2);}sfx('whoosh');}return;}if(f.pt<=0){f.pt=3.4;f.tell=AUTO?.3:1;sfx('warn');}}
DRAWK.jydrone=f=>{if(f.tell>0){dglow(f.x,f.y,30,'#ff9a3a',.5+.3*Math.sin(T*24));}if(!sprI('jy-drone',f.x,f.y+Math.sin(f.age*5)*3,40,f.hit>0))circ(f.x,f.y,16,'#8a8a90',OL);if(f.tell>0)txt('!',f.x,f.y-30,16,'#ff9a3a');};
DRAWK.jymag=f=>{const t=f.tell>0;g.save();g.translate(f.x,f.y);dglow(0,0,36,t?'#ff4f7b':'#7ae8ff',t?.6:.3);g.fillStyle=OL;g.beginPath();g.arc(0,0,22,.6,TAU-.6);g.lineTo(0,0);g.fill();g.fillStyle=f.hit>0?'#fff':'#d84040';g.beginPath();g.arc(0,0,18,.7,TAU-.7);g.lineTo(0,0);g.fill();g.fillStyle='#c8ccd8';g.fillRect(10,-16,10,7);g.fillRect(10,9,10,7);circ(-4,0,6,'#ffe066',OL);
 if(t){g.strokeStyle='rgba(122,232,255,.7)';g.lineWidth=2;for(let k=0;k<3;k++){g.beginPath();g.arc(0,0,40+k*24+(T*60)%24,0,TAU);g.stroke();}}g.restore();if(t)txt('!!',f.x,f.y-34,16,'#ff4f7b');};

function m8Goo(x,y,a,sp0){jyJunk(x,y,'goo',7,Math.cos(a)*sp0,Math.sin(a)*sp0,1,{goo:1,vr:0});}
function m8Alien(f,dt){const s=sp;if(f.x>SW-10||f.x<20)return;f.at=(f.at??rnd(1.8,2.8))-dt;
 if(f.tell>0){f.tell-=dt;if(f.tell<=0){const a=Math.atan2(s.y-f.y,s.x-f.x);
  if(f.kind==='jyblob')m8Goo(f.x-14,f.y,a,150);
  else if(f.kind==='jyrider')jyJunk(f.x-18,f.y-10,3,8,Math.cos(a)*170,Math.sin(a)*170,1);
  else for(const k of[-.22,.22])m8Goo(f.x-18,f.y+6,a+k,160);sfx('blip');}return;}
 if(f.at<=0){f.at=f.kind==='jyblob'?3.6:3.2;f.tell=AUTO?.3:(f.kind==='jyblob'?.7:1.0);}}
function alienEyes(x,y,r,lk){circ(x,y,r,'#fff',OL);circ(x+lk*r*.35,y+r*.1,r*.45,'#1a1030');circ(x+lk*r*.35-r*.15,y-r*.1,r*.15,'#fff');}
DRAWK.jyblob=f=>{const C=[['#9cf06a','#4caa3a'],['#ff9ad8','#c04a98'],['#ffd75a','#d0902a']][f.col||0],t=f.age,wb=Math.sin(t*7)*.12,tel=f.tell>0;g.save();g.translate(f.x,f.y);
 g.scale(1+wb,1-wb);g.lineWidth=2.5;g.strokeStyle=OL;g.fillStyle=f.hit>0?'#fff':C[0];g.beginPath();
 for(let i=0;i<=24;i++){const a=i/24*TAU,rr=17+Math.sin(a*5+t*6)*1.6+(Math.sin(a)>0?Math.sin(a)*3:0);i?g.lineTo(Math.cos(a)*rr,Math.sin(a)*rr*.9):g.moveTo(Math.cos(a)*rr,Math.sin(a)*rr*.9);}g.closePath();g.fill();g.stroke();
 g.fillStyle=C[1];g.globalAlpha=.5;g.beginPath();g.ellipse(4,8,11,5,0,0,TAU);g.fill();g.globalAlpha=1;circ(-6,-8,3,'rgba(255,255,255,.7)');
 // antenna (short, bobbly)
 g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(0,-15);g.quadraticCurveTo(4+Math.sin(t*5)*4,-22,2,-26);g.stroke();circ(2,-27,3.5,C[1],OL);
 alienEyes(-6,-3,5.5,-1);alienEyes(5,-4,4.5,-1);
 if(tel){circ(-2,8,5,'#3a1030',OL);}else{g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.arc(-1,6,5,.2,Math.PI-.2);g.stroke();}
 g.restore();if(tel)txt('BLEP!',f.x,f.y-38,11,'#ffe066');};
DRAWK.jyrider=f=>{const t=f.age,tel=f.tell>0,im=IMG['spr_jy-junk'+f.jk];g.save();g.translate(f.x,f.y+Math.sin(t*3)*3);g.scale(1.25,1.25);
 // alien body sits on top of junk
 const bx=0,by=-16;g.fillStyle=f.hit>0?'#fff':'#8ad8ff';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.ellipse(bx,by,11,13,0,0,TAU);g.fill();g.stroke();
 const wave=tel?-1.9:-.9+Math.sin(t*9)*.6;g.save();g.translate(bx+9,by-2);g.rotate(wave);g.lineWidth=4;g.lineCap='round';g.beginPath();g.moveTo(0,0);g.lineTo(10,0);g.stroke();g.strokeStyle='#8ad8ff';g.lineWidth=2;g.stroke();circ(11,0,3,'#8ad8ff',OL);if(tel)circ(13,-1,4,'#c8ccd8',OL);g.restore();
 alienEyes(bx-3,by-4,6,-1);g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.arc(bx-3,by+5,3.5,0,Math.PI);g.stroke();
 g.strokeStyle=OL;g.beginPath();g.moveTo(bx-4,by-15);g.lineTo(bx-7,by-22);g.moveTo(bx+3,by-15);g.lineTo(bx+5,by-22);g.stroke();circ(bx-7,by-23,2.5,'#ff7ae0',OL);circ(bx+5,by-23,2.5,'#ff7ae0',OL);
 if(im){const w=38,h=w*im.height/im.width;g.rotate(Math.sin(t*2)*.12);g.drawImage(im,-w/2,-h/2+4,w,h);}else{RR(g,-16,-6,32,20,4);g.fillStyle='#a08060';g.fill();g.stroke();}
 g.restore();txt(tel?'CATCH!':(Math.sin(t*1.3+f.cy)>.4?'HIII!':''),f.x,f.y-58,11,tel?'#ff9a3a':'#9ae8ff');};
DRAWK.jyface=f=>{const t=f.age,tel=f.tell>0,sq=tel?1+Math.sin(t*30)*.06:1;g.save();g.translate(f.x,f.y);g.scale(sq,1/sq);
 dglow(0,0,34,tel?'#ff7ae0':'#b08aff',.35);g.fillStyle=f.hit>0?'#fff':'#b08aff';g.strokeStyle=OL;g.lineWidth=2.5;g.beginPath();g.ellipse(0,0,20,18,0,0,TAU);g.fill();g.stroke();
 for(const sx of[-1,1]){g.beginPath();g.ellipse(sx*21,-2,6,9,sx*.3,0,TAU);g.fill();g.stroke();}
 if(tel){g.strokeStyle=OL;g.lineWidth=2.5;for(const sx of[-1,1]){g.beginPath();g.moveTo(sx*11,-8);g.lineTo(sx*5,-4);g.lineTo(sx*11,0);g.stroke();}
  g.fillStyle='#3a1030';g.beginPath();g.ellipse(0,8,8,6,0,0,TAU);g.fill();g.stroke();g.fillStyle='#ff6a8a';g.beginPath();g.ellipse(0,13,5,5+Math.sin(t*20)*1.5,0,0,TAU);g.fill();g.stroke();}
 else{alienEyes(-8,-5,5,Math.sin(t*2));alienEyes(8,-5,5,Math.sin(t*2));g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(-6,8);g.quadraticCurveTo(0,12+Math.sin(t*4)*2,6,8);g.stroke();}
 g.restore();if(tel)txt('BLEHHH!',f.x,f.y-34,11,'#ff9af0');};
function m8Upd(s,dt){for(const e of s.eshots)if(!e.ms)e.tb=1;// every enemy bullet can be shot down
 for(const w of s.warns||[]){w.t-=dt;if(w.t<=0&&!w.done){w.done=1;if(w.k==='junk')jyJunk(SW+60,w.y,[0,6,2][Math.random()*3|0],w.r,-(w.v||210),0,AUTO?2:10,{big:1});}}s.warns=(s.warns||[]).filter(w=>!w.done);
 for(const r of s.rocks)if(r.orb){const o=r.orb;o.cx-=140*dt;o.a+=dt*1.6;r.x=o.cx+Math.cos(o.a)*o.rr;r.y=o.cy+Math.sin(o.a)*o.rr;r.vx=0;r.vy=0;}
 for(const f of s.foes)if(!f.dead&&f.age>=f.del){if(f.kind==='jydrone')m8Drone(f,dt);else if(f.kind==='jymag')m8Mag(f,dt);else if(f.kind==='jyblob'||f.kind==='jyrider'||f.kind==='jyface')m8Alien(f,dt);}
}
function jyBg(s){const im=IMG.bg_jyfar;if(im){const sc=Math.max(W/im.width,H/im.height)*1.12,w=im.width*sc,h=im.height*sc,ox=-(s.dist*.012)%(w-W+1);g.drawImage(im,Math.max(W-w,-((s.dist*.01)%Math.max(1,w-W))),(H-h)/2,w,h);g.fillStyle='rgba(6,4,20,.25)';g.fillRect(0,0,W,H);}}
function jyMid(s){for(let L=0;L<2;L++){const z=L?.55:.25,n=L?6:9;for(let i=0;i<n;i++){const x=((i*211+L*97-s.dist*z)%(SW+200)+SW+200)%(SW+200)-100,y=(i*97.3+L*53)%SH;const im=IMG['spr_jy-junk'+((i+L*3)%7)];if(!im)continue;const sz=(L?38:24)+(i%3)*8;g.save();g.globalAlpha=L?.5:.28;g.translate(x,y);g.rotate(i+T*(L?.25:.12)*(i%2?1:-1));g.filter='brightness(0.45) saturate(0.6)';g.drawImage(im,-sz/2,-sz/2,sz,sz*im.height/im.width);g.filter='none';g.restore();}}g.globalAlpha=1;}
function m8Draw(s){if(SPM!==8)return;
 for(const w of s.warns||[]){const a=.5+.5*Math.sin(T*16);g.strokeStyle=`rgba(255,70,90,${.35+.4*a})`;g.lineWidth=Math.max(6,w.r*1.6);g.setLineDash([18,14]);g.beginPath();g.moveTo(SW,w.y);g.lineTo(0,w.y);g.stroke();g.setLineDash([]);txt('!',SW-16,w.y+4,20,'#ff3a4a');}
 const B=s.boss;if(B&&!B.dead)m8BossFx(B);}
// ---- bosses ----
function m8Init(B){if(B.type==='satboss'){B.sh=0;B.st=3;B.ff=2;B.fan=0;B.las=[];B.lf=6;}if(B.type==='jrocket'){B.bf=2.2;B.bt=0;B.ft=4;B.chg=null;B.cf=7;}if(B.type==='claw'){B.cs='grab';B.ct=1.6;B.cx=SW-150;B.held=0;B.sw=null;B.swf=9;B.df=6;}}
const M8BOSS={
 satboss:(B,dt,hpF)=>{const s=sp,p2=hpF<.5;B.x+=(SW-165-B.x)*Math.min(1,dt*1.2);B.y=SH/2-30+Math.sin(B.t*.6)*80;
  if(p2&&!B.p2){B.p2=1;SHAKE=.5;sfx('stinger');s.pops.push({x:B.x-30,y:B.y-90,t:'PANELS FLARE!',l:1.3,comic:1,sz:24});s.msgs.push({t:'COMET: BEEP. Red lines = solar beams. Change lanes!',l:3});}
  B.st-=dt;if(B.st<=0){B.sh=!B.sh;B.st=B.sh?(p2?2.4:2.8):(p2?3:3.6);if(B.sh){s.pops.push({x:B.x-70,y:B.y-60,t:'DISH SHIELD!',l:.9,comic:1,sz:18});sfx('blip');}else s.pops.push({x:B.x-60,y:B.y-60,t:'SHIELD DOWN! FIRE!',l:.9,comic:1,sz:16,c:'#5fe36a'});}
  if(B.fan>0){B.fan-=dt;if(B.fan<=0){const n=p2?7:5,a0=Math.atan2(s.y-B.y,s.x-B.x);for(let k=0;k<n;k++){const a=a0+(k-(n-1)/2)*.2;jyJunk(B.x-40,B.y,1,10,Math.cos(a)*190,Math.sin(a)*190,1);}sfx('whoosh');}}
  else{B.ff-=dt;if(B.ff<=0){B.ff=p2?2:2.7;B.fan=AUTO?.3:.8;sfx('warn');}}
  if(B.sh){B.ms=(B.ms??1)-dt;if(B.ms<=0){B.ms=1.6;s.eshots.push({x:B.x-70,y:B.y,vx:-90,vy:rnd(-40,40),ms:1,hm:2});}}
  if(p2){for(const L of B.las){L.t+=dt;if(L.t>L.w&&!L.fired){L.fired=1;sfx('bigboom');SHAKE=.2;}if(L.fired&&L.t<L.w+.45&&Math.abs(s.y-L.y)<13&&s.x<B.x)hurtShip();}B.las=B.las.filter(L=>L.t<L.w+.45);B.lf-=dt;if(B.lf<=0){B.lf=4.2;B.las.push({y:clamp(s.y,40,SH-90),t:0,w:1.05});sfx('blip');}}
  // dish shield blocks shots coming at the front
  if(B.sh)for(const b of s.shots)if(!b.dead&&b.x>B.x-110&&b.x<B.x-40&&Math.abs(b.y-B.y)<70){b.dead=1;if(!B.tk||B.t-B.tk>.8){B.tk=B.t;s.pops.push({x:B.x-80,y:B.y-40,t:'BLOCKED',l:.5,c:'#7ae8ff'});}}
  B.pose=B.fan>0?'fan':'idle';return[70,62,false];},
 jrocket:(B,dt,hpF)=>{const s=sp,p2=hpF<.55;const C=B.chg;
  if(p2&&!B.p2){B.p2=1;SHAKE=.5;sfx('stinger');s.pops.push({x:B.x-20,y:B.y-80,t:'FULL BOOST!',l:1.2,comic:1,sz:26});s.msgs.push({t:'COMET: BEEP. When it flashes, it rams. Dodge the red lane!',l:3});}
  if(!C){B.x+=(SW-150-B.x)*Math.min(1,dt*1.4);B.y+=((s.y+Math.sin(B.t*1.3)*60)-B.y)*Math.min(1,dt*.7);B.y=clamp(B.y,60,SH-100);}
  if(B.bt>0){B.bt-=dt;if(B.bt<=0){const n=p2?9:7;for(let k=0;k<n;k++){const a=Math.PI+(k-(n-1)/2)*.28;jyJunk(B.x-20,B.y+30,3,8,Math.cos(a)*175,Math.sin(a)*175,1);}sfx('boom');s.pops.push({x:B.x-40,y:B.y+40,t:'CLANK-A-CLANK!',l:.8,comic:1,sz:18});}}
  else if(!C){B.bf-=dt;if(B.bf<=0){B.bf=p2?2.2:2.9;B.bt=AUTO?.3:.75;sfx('warn');}}
  B.ft-=dt;if(B.ft<=0&&!C){B.ft=p2?4:5;for(const d of[-1,1])jyJunk(B.x-30,B.y+d*30,4,16,-170,d*110,3,{fin:1,vb:-d*150});s.pops.push({x:B.x-40,y:B.y-60,t:'FIN TOSS!',l:.8,comic:1,sz:18});sfx('whoosh');}
  if(C){C.t+=dt;if(C.st===0){if(C.t>1.05){C.st=1;C.t=0;sfx('whoosh');SHAKE=.35;}}else if(C.st===1){B.x-=520*dt;if(B.x<60)C.st=2;}else{B.x+=(SW-150-B.x)*Math.min(1,dt*2.6);if(Math.abs(B.x-(SW-150))<8)B.chg=null;}}
  if(p2){B.cf-=dt;if(B.cf<=0&&!B.chg&&B.bt<=0){B.cf=6.5;B.chg={st:0,t:0};B.y=clamp(s.y,60,SH-100);s.pops.push({x:B.x-40,y:Math.max(90,B.y-80),t:'!!',l:1,comic:1,sz:32});sfx('warn');}}
  for(const r of s.rocks)if(r.fin){r.vy+=r.vb*dt;}
  B.pose=B.bt>0?'open':'idle';return[58,58,false];},
 claw:(B,dt,hpF)=>{const s=sp,ph=hpF>.6?1:hpF>.3?2:3;if(ph>(B.ph||1)){B.ph=ph;SHAKE=.7;sfx('stinger');s.pops.push({x:Math.min(B.cx,W-160),y:110,t:ph===2?'DOUBLE TROUBLE!':'CRUSH MODE!',l:1.5,comic:1,sz:26});s.msgs.push({t:ph===2?'COMET: BEEP. It throws twice now. Then the cockpit opens!':'COMET: BEEP. Dashed box = claw swipe. Get out of it!',l:3.2});}
  const fast=ph===3;B.x=B.cx;B.y=SH/2-30+Math.sin(B.t*.5)*60;if(B.sw&&B.sw.st===1)B.y=B.sw.y;
  B.ct-=dt;
  if(B.cs==='grab'){B.y+=Math.sin(B.ct*6)*2;if(B.ct<=0){B.cs='hold';B.held=ph>=2?2:1;B.ct=fast?.9:1.3;s.pops.push({x:B.cx-40,y:B.y-100,t:'GRAB!',l:.7,comic:1,sz:20});sfx('hit');}}
  else if(B.cs==='hold'){if(B.ct<=0){B.cs='tell';B.ct=AUTO?.3:.9;B.ty=clamp(s.y,50,SH-100);(s.warns=s.warns||[]).push({y:B.ty,r:24,t:B.ct,k:'lane'});sfx('warn');}}
  else if(B.cs==='tell'){if(B.ct<=0){jyJunk(B.cx-60,B.ty,[0,6,2][Math.random()*3|0],28,-(fast?300:250),0,AUTO?2:8,{big:1});sfx('whoosh');SHAKE=.25;B.held--;if(B.held>0){B.cs='hold';B.ct=.45;}else{B.cs='empty';B.ct=fast?2.4:2.9;s.pops=s.pops.filter(q=>!q.comic);s.pops.push({x:B.cx-50,y:B.y-96,t:'COCKPIT OPEN!',l:1,comic:1,sz:18,c:'#5fe36a'});}}}
  else if(B.cs==='empty'){B.sp=(B.sp||0)-dt;if(B.sp<=0){B.sp=fast?.8:1.1;const a=Math.atan2(s.y-B.y,s.x-B.cx);for(const k of[-.15,.15])s.eshots.push({x:B.cx-30,y:B.y+24,vx:Math.cos(a+k)*165,vy:Math.sin(a+k)*165,tb:1});}if(B.ct<=0){B.cs='grab';B.ct=fast?1:1.4;}}
  if(ph>=2){B.df-=dt;if(B.df<=0){B.df=9;M8WAVE('drones',null,t=>s.msgs.push({t,l:1.8}));}}
  const W2=B.sw;if(fast){B.swf-=dt;if(B.swf<=0&&!W2&&B.cs!=='empty'){B.swf=8;B.sw={st:0,t:0,y:clamp(s.y,60,SH-110)};s.pops.push({x:B.cx-40,y:80,t:'SWIPE!',l:1,comic:1,sz:26});sfx('warn');}}
  if(W2){W2.t+=dt;if(W2.st===0){if(W2.t>1.1){W2.st=1;W2.t=0;sfx('whoosh');SHAKE=.35;}}else if(W2.st===1){B.cx-=500*dt;if(B.cx<60)W2.st=2;}else{B.cx+=(SW-150-B.cx)*Math.min(1,dt*2.4);if(Math.abs(B.cx-(SW-150))<8)B.sw=null;}}
  const kx=B.cx,ky=B.y+24;for(const b of s.shots){if(b.dead)continue;if(B.cs==='empty'&&Math.abs(b.y-ky)<30&&b.x<kx+10){if(b.x<kx-34)continue;if(!b.pierce)b.dead=1;B.hp-=b.dmg||1;B.hit=.08;sfx('hit');if(Math.random()<.2)boomAt(s.booms,b.x,b.y,4,'#ff7ae0');}
   else if(Math.abs(b.x-B.cx)<70&&Math.abs(b.y-B.y)<96){b.dead=1;if(B.cs!=='empty'&&(!B.tk||B.t-B.tk>2.2)){B.tk=B.t;s.pops.push({x:B.cx-60,y:B.y-70,t:'CLANG!',l:.6,comic:1,sz:16});}}}
  if(Math.abs(s.x-B.cx)<64&&Math.abs(s.y-B.y)<90)hurtShip();
  return[-1,-1,false];}};
function m8BossFx(B){if(B.type==='satboss')for(const L of B.las||[]){if(!L.fired){const a=.5+.5*Math.sin(T*18);g.strokeStyle=`rgba(255,200,60,${.4+.4*a})`;g.lineWidth=3;g.setLineDash([14,10]);g.beginPath();g.moveTo(B.x-60,L.y);g.lineTo(0,L.y);g.stroke();g.setLineDash([]);}else{dglow(B.x-60,L.y,30,'#ffd040',.9);g.fillStyle='rgba(255,200,60,.85)';g.fillRect(0,L.y-10,B.x-60,20);g.fillStyle='rgba(255,255,230,.95)';g.fillRect(0,L.y-4,B.x-60,8);}}
 if(B.type==='jrocket'&&B.chg&&B.chg.st===0){g.globalAlpha=.4+.4*Math.sin(T*20);g.strokeStyle='#ff4f7b';g.lineWidth=4;g.setLineDash([16,12]);g.strokeRect(0,B.y-60,B.x,120);g.setLineDash([]);g.globalAlpha=1;}
 if(B.type==='claw'){const W2=B.sw;if(W2&&W2.st===0){g.globalAlpha=.4+.4*Math.sin(T*20);g.strokeStyle='#ff4f7b';g.lineWidth=4;g.setLineDash([16,12]);g.strokeRect(0,W2.y-95,B.cx,190);g.setLineDash([]);g.globalAlpha=1;}
}}
const M8DRAW={
 satboss:B=>{if(B.fan>0)dglow(B.x+20,B.y,90,'#5fb0ff',.3+.3*Math.sin(T*24));sprI('jy-satboss',B.x,B.y,150,B.hit>0)||circ(B.x,B.y,60,'#a05030',OL);
  if(B.sh){g.save();g.globalCompositeOperation='lighter';g.strokeStyle=`rgba(122,232,255,${.6+.3*Math.sin(T*10)})`;g.lineWidth=5;g.beginPath();g.ellipse(B.x-52,B.y-6,24,58,0,0,TAU);g.stroke();g.fillStyle='rgba(122,232,255,.15)';g.fill();g.restore();}
  if(B.fan>0)txt('!',B.x-20,B.y-96,22,'#ffe066');},
 jrocket:B=>{const sh=B.bt>0||B.chg&&B.chg.st===0;if(sh)dglow(B.x,B.y,80,'#ff9a3a',.3+.3*Math.sin(T*24));g.save();if(sh)g.translate(Math.sin(T*60)*3,0);if(B.chg&&B.chg.st===1)for(let i=0;i<5;i++){g.globalAlpha=.2;sprI('jy-rocket',B.x+i*26,B.y,130,false);}g.globalAlpha=1;sprI('jy-rocket',B.x,B.y,130,B.hit>0)||circ(B.x,B.y,55,'#c8c0b0',OL);g.restore();
  const fx=B.x+62,fy=B.y-12;for(let k=0;k<3;k++){const ph=(T*7+k/3)%1;g.globalAlpha=1-ph;circ(fx+ph*30,fy+Math.sin(T*20+k)*4,6+ph*8,k%2?'#ffe066':'#ff7a29');}g.globalAlpha=1;if(B.bt>0)txt('!',B.x-10,B.y-84,22,'#ffe066');},
 claw:B=>{const open=B.cs==='empty'||B.cs==='grab'&&B.ct<.6;if(B.cs==='empty')dglow(B.cx,B.y+24,50,'#ff4fd0',.5+.2*Math.sin(T*8));
  g.save();if(B.cs==='tell')g.translate(Math.sin(T*60)*3,0);sprI(open?'jy-claw-open':'jy-claw-full',B.cx,B.y,200,B.hit>0)||circ(B.cx,B.y,80,'#c0a030',OL);g.restore();
  if(B.cs==='empty'){g.strokeStyle='rgba(255,255,255,.85)';g.lineWidth=2;g.beginPath();g.arc(B.cx,B.y+24,26+3*Math.sin(T*8),0,TAU);g.stroke();}
  if(B.cs==='hold'||B.cs==='tell')txt('x'+B.held,B.cx+70,B.y+60,12,'#ffe066');}};
Object.assign(M3BOSS,M8BOSS);Object.assign(M3DRAW,M8DRAW);
const JYGO=[
 {img:'c63',d:4.5,int:3,cap:'Leaving Vesta. The map points to Jupiter.',bub:[{s:'Uh oh. That\'s a LOT of junk out there.',who:'@',x:40,y:230,w:240,tx:200,ty:180,at:.5}],fx:{s:'WHOOSH!',x:470,y:60,sz:28,at:.3}},
 {img:'c64',d:4.5,int:3,cap:'Meanwhile, King Malakar calls Ace Kreel.',bub:[{s:'The junkyard is your trap, Kreel. Crush them!',who:'MALAKAR',x:40,y:230,w:250,tx:200,ty:180,at:.5}]},
 {img:'c65',d:4.5,int:3,cap:'Comet scans the wrecks.',bub:[{s:'BEEP. Gems hide inside the old wrecks. Blast the glowing ones!',who:'COMET',x:360,y:120,w:250,tx:300,ty:120,at:.5}]}];
const JYWIN=[
 {img:'c69',d:4.5,int:3,cap:'The Compactor Claw falls apart!',bub:[{s:'This isn\'t over! See you at Jupiter!',who:'ACE KREEL',x:40,y:230,w:240,tx:200,ty:180,at:.5}],fx:{s:'KA-RUNCH!',x:430,y:60,sz:30,at:.3}},
 {img:'c70',d:5,int:3,sting:1,cap:'Out of the junkyard. Jupiter, dead ahead. To be continued...',bub:[{s:'Next stop: Jupiter!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'NEXT: JUPITER!',x:460,y:50,sz:28,at:.6,rot:-.06}}];

const BELTGO=[
 {img:'c45',d:4,int:3,cap:'Leaving Phobos. Next: the asteroid belt.',bub:[{s:'Hold on, crew. Full speed!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'VROOOM!',x:470,y:60,sz:28,at:.3}},
 {img:'c50',d:4.5,int:3,cap:'Comet scans the belt.',bub:[{s:'BEEP. Kreel\'s new ship has a weak spot. A glowing core!',who:'COMET',x:360,y:120,w:240,tx:300,ty:120,at:.5}]}];
const VESTAARR=[
 {img:'c49',d:5,int:3,sting:1,cap:'Vesta, dead ahead. To be continued...',bub:[{s:'Next stop: Vesta!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'NEXT: VESTA!',x:470,y:50,sz:28,at:.6,rot:-.06}}];

// ===== Phobos finale: on-foot boss KEYMASTER VOLK guards the prison gate (ref: assets/ref/keymaster-volk.jpg) =====
['volk','volk-slam','volk-leap'].forEach(k=>loadImg('spr_'+k,'assets/sprites/'+k+'.png'));
const FY=240;
function footInit(){return {px:110,py:FY,vy:0,air:false,face:1,hp:5,inv:1.5,cool:0,shots:[],waves:[],rings:[],t:0,won:0,gate:0,
 B:{x:W-190,y:FY,hp:AUTO?6:56,max:AUTO?6:56,ph:1,st:'idle',st_t:1.6,hit:0,cyc:0,lx:0,ly:0,air:0,roar:0}};}
function footHurt(){const c=CT,F=c.foot;if(F.inv>0||AUTO||F.won)return;F.hp--;F.inv=1.4;sfx('hurt');SHAKE=.35;cartPop(F.px,F.py-70,'OOF!',16);if(F.hp<=0){loseLife(()=>{CT.retry=9;cartInit();});}}
function updFoot(dt){const c=CT,F=c.foot,B=F.B;F.t+=dt;F.inv-=dt;F.cool-=dt;B.hit-=dt;
 for(const p of c.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;p.vy+=300*dt;p.l-=dt;}c.parts=c.parts.filter(p=>p.l>0);for(const p of c.pops)p.l-=dt;c.pops=c.pops.filter(p=>p.l>0);for(const m of c.msgs)m.l-=dt;c.msgs=c.msgs.filter(m=>m.l>0);
 if(AUTO)autoFoot();
 if(F.won){F.won+=dt;if(F.won>1.2&&!F.gate){F.gate=1;sfx('stinger');c.msgs.push({t:'THE GATE OPENS!',l:2.4});}if(F.won>3.4&&!F.end){F.end=1;try{COMET=true;localStorage.setItem('gr_comet','1');}catch(e){}completeMission(5);}return;}
 // player
 const mv=(I.R?1:0)-(I.L?1:0);F.px=clamp(F.px+mv*230*dt,30,W-60);if(mv)F.face=mv;F.run=mv?(F.run||0)+dt*10:0;
 if((pressedA||I.J)&&!F.air&&!F.jh){F.air=true;F.vy=-560;sfx('whoosh');}F.jh=I.J;pressedA=false;
 if(F.air){F.vy+=1350*dt;F.py+=F.vy*dt;if(F.py>=FY){F.py=FY;F.air=false;F.vy=0;}}
 if(I.F&&F.cool<=0){F.cool=.2;F.shots.push({x:F.px+F.face*18,y:F.py-34,vx:F.face*600});sfx('shot');}
 for(const s of F.shots){s.x+=s.vx*dt;if(s.x<-20||s.x>W+20)s.dead=1;if(!s.dead&&Math.abs(s.x-B.x)<52&&s.y>B.y-150&&s.y<B.y){s.dead=1;if(B.st!=='roar'){B.hp--;B.hit=.08;sfx('hit');if(Math.random()<.25)cartBurst(s.x,s.y,'#b04aff');}}}
 F.shots=F.shots.filter(s=>!s.dead);
 // phases
 const hpF=B.hp/B.max,ph=hpF>.66?1:hpF>.33?2:3;
 if(ph>B.ph){B.ph=ph;B.st='roar';B.st_t=1.4;F.waves=[];F.rings=[];SHAKE=.6;sfx('stinger');cartPop(B.x-40,B.y-170,ph===2?'GRRRAAAH!':'NOBODY ESCAPES!',22);c.msgs.push({t:ph===2?'HE LEAPS AND CHARGES NOW!':'HE IS FAST NOW! STAY SHARP!',l:2.4});}
 if(B.hp<=0){F.won=.01;B.st='down';SHAKE=.8;sfx('bigboom');score+=3000;stats.kills++;for(let i=0;i<4;i++)cartBurst(B.x+rnd(-40,40),B.y-rnd(30,140),'#b04aff');cartPop(B.x,B.y-160,'KLONK!',30);try{writeSave({cp:null,next:6});}catch(e){}return;}
 const fast=ph===3?.6:ph===2?.85:1;B.st_t-=dt;
 if(B.st==='idle'||B.st==='roar'){B.x+=((W-190)-B.x)*Math.min(1,dt*3);if(B.st_t<=0){B.cyc++;const opts=ph===1?['slam','ring','keys']:ph===2?['slam','ring','leap','keys','charge']:['charge','slam','leap','keys','ring','combo'];const a=opts[B.cyc%opts.length];B.st=a+'T';B.st_t=(a==='leap'?1.1:.95)*(AUTO?.6:1);
   if(a==='ring'||a==='combo')B.hi=B.cyc%2===0;if(a==='leap'){B.lx=clamp(F.px,60,W-190);}if(a==='keys'){const n=ph===1?2:3;B.kx=[...Array(n)].map((_,i)=>clamp(F.px+(i-(n-1)/2)*120,40,W-260));}if(a==='charge')B.st_t=1.1*(AUTO?.6:1);sfx('warn');}}
 else if(B.st==='keysT'&&B.st_t<=0){B.st='slam';B.st_t=.5;for(const x of B.kx)(F.keys=F.keys||[]).push({x,y:-30,vy:0,a:0});sfx('whoosh');}
 else if(B.st==='comboT'&&B.st_t<=0){B.st='slam';B.st_t=.5;SHAKE=.45;sfx('bigboom');F.waves.push({x:B.x-50,v:-300,h:26});F.rings.push({x:B.x-60,y:FY-92,v:-340,a:0});}
 else if(B.st==='chargeT'&&B.st_t<=0){B.st='charge';B.st_t=9;B.cv=-(ph===3?620:520);sfx('whoosh');}
 else if(B.st==='charge'){B.x+=B.cv*dt;if(B.cv<0&&B.x<40){B.cv=-B.cv*.7;SHAKE=.4;sfx('boom');cartPop(40,FY-120,'WHAM!',18);}if(B.cv>0&&B.x>=W-190){B.x=W-190;B.st='walk';B.st_t=.5;}}
 else if(B.st==='slamT'&&B.st_t<=0){B.st='slam';B.st_t=.5;SHAKE=.45;sfx('bigboom');F.waves.push({x:B.x-50,v:-270/fast,h:26});if(ph===3)F.wq=.55;}
 else if(B.st==='ringT'&&B.st_t<=0){B.st='ring';B.st_t=.4;F.rings.push({x:B.x-60,y:B.hi?FY-92:FY-16,v:-300/fast,a:0});sfx('whoosh');}
 else if(B.st==='leapT'&&B.st_t<=0){B.st='leap';B.st_t=.8;B.sx=B.x;sfx('whoosh');}
 else if(B.st==='leap'){const k=1-B.st_t/.8;B.x=B.sx+(B.lx-B.sx)*k;B.air=Math.sin(k*Math.PI)*150;if(B.st_t<=0){B.air=0;B.x=B.lx;B.st='land';B.st_t=.9;SHAKE=.6;sfx('bigboom');F.waves.push({x:B.x-50,v:-240,h:22},{x:B.x+50,v:240,h:22});}}
 else if((B.st==='slam'||B.st==='ring'||B.st==='land')&&B.st_t<=0){B.st='walk';B.st_t=.8;}
 else if(B.st==='walk'){B.x+=((W-190)-B.x)*Math.min(1,dt*2.5);if(B.st_t<=0){B.st='idle';B.st_t=(ph===1?1.3:ph===2?.95:.65)*(AUTO?.5:1);}}
 for(const k of F.keys||[]){k.vy+=900*dt;k.y+=k.vy*dt;k.a+=dt*9;if(k.y>=FY-14){k.dead=1;SHAKE=.2;sfx('boom');cartBurst(k.x,FY-10,'#ffe066');if(Math.abs(k.x-F.px)<42&&F.py>FY-60)footHurt();}}if(F.keys)F.keys=F.keys.filter(k=>!k.dead);
 if(F.wq>0){F.wq-=dt;if(F.wq<=0)F.waves.push({x:B.x-50,v:-300,h:26});}
 for(const w of F.waves){w.x+=w.v*dt;if(w.x<-30||w.x>W+30)w.dead=1;if(!w.dead&&Math.abs(w.x-F.px)<18&&F.py>FY-w.h){footHurt();w.dead=1;}}F.waves=F.waves.filter(w=>!w.dead);
 for(const r of F.rings){r.x+=r.v*dt;r.a+=dt*10;if(r.x<-30)r.dead=1;if(!r.dead&&Math.abs(r.x-F.px)<18&&Math.abs(r.y-(F.py-30))<30){footHurt();r.dead=1;}
  for(const s of F.shots)if(!s.dead&&!r.dead&&Math.abs(s.x-r.x)<14&&Math.abs(s.y-r.y)<16){s.dead=1;r.dead=1;cartBurst(r.x,r.y,'#ffe066');sfx('hit');score+=20;}}F.rings=F.rings.filter(r=>!r.dead);
 if(Math.abs(F.px-B.x)<46&&F.py>B.y-(B.st==='charge'?70:120)-B.air&&B.st!=='down')footHurt();}
function autoFoot(){const F=CT.foot,B=F.B;VK.F=1;VK.J=0;VK.L=0;VK.R=0;F.face=1;
 for(const w of F.waves)if(Math.abs(w.x-F.px)<70&&Math.sign(F.px-w.x)===Math.sign(w.v))VK.J=1;
 for(const r of F.rings)if(r.y>FY-40&&r.x-F.px<70&&r.x>F.px)VK.J=1;
 if(B.st==='charge'&&B.cv<0&&B.x-F.px<130&&B.x>F.px)VK.J=1;if(B.st==='keysT'&&B.kx.some(x=>Math.abs(x-F.px)<60)){VK.R=1;}if(B.st==='leapT'||B.st==='leap'){if(Math.abs(F.px-B.lx)<90)(B.lx>W/2?VK.L=1:VK.R=1);}else if(F.px>130)VK.L=1;else if(F.px<90)VK.R=1;}
function drawFoot(){const c=CT,F=c.foot,B=F.B;const sk=SHAKE>0?[rnd(-1,1)*SHAKE*8,rnd(-1,1)*SHAKE*8]:[0,0];g.save();g.translate(sk[0],sk[1]);
 const im=IMG.comic_c54;if(im)drawCover(im,-10,-10,W+20,H+20);g.fillStyle='rgba(10,4,20,.45)';g.fillRect(-10,-10,W+20,H+20);
 // gate glow when opening
 if(F.gate){const k=clamp((F.won-1.2)/2,0,1);dglow(W/2,170,140*k+20,'#ffe066',.6*k);}
 g.fillStyle=lg(g,0,FY,0,H,['#3a2a30','#1a1014']);g.fillRect(-10,FY,W+20,H-FY+10);g.fillStyle='#5a4048';g.fillRect(-10,FY,W+20,4);
 // telegraphs
 if(B.st==='slamT'){const a=.4+.4*Math.sin(T*20);g.fillStyle=`rgba(255,60,80,${a})`;g.fillRect(0,FY-4,B.x-40,8);txt('!',B.x-10,B.y-210,30,'#ff3a4a');}
 if(B.st==='ringT'){const y=B.hi?FY-92:FY-16;g.strokeStyle=`rgba(255,220,60,${.4+.4*Math.sin(T*20)})`;g.lineWidth=3;g.setLineDash([12,10]);g.beginPath();g.moveTo(B.x-60,y);g.lineTo(0,y);g.stroke();g.setLineDash([]);txt(B.hi?'STAY DOWN!':'JUMP!',B.x-110,y-20,14,'#ffe066');}
 if(B.st==='keysT')for(const x of B.kx){g.strokeStyle=`rgba(255,220,60,${.5+.4*Math.sin(T*18)})`;g.lineWidth=4;g.beginPath();g.ellipse(x,FY+2,42,8,0,0,TAU);g.stroke();txt('!',x,FY-40,22,'#ffe066');}
 if(B.st==='chargeT'||B.st==='comboT'){g.fillStyle=`rgba(255,60,80,${.35+.35*Math.sin(T*20)})`;g.fillRect(0,FY-60,B.x-40,56);txt(B.st==='chargeT'?'CHARGE! JUMP!':'!',W/2-60,FY-80,16,'#ff3a4a');}
 for(const k of F.keys||[]){g.save();g.translate(k.x,k.y);g.rotate(k.a);circ(0,-8,11,OL);circ(0,-8,8,'#ffd23a');circ(0,-8,3.5,'#8a5a10');g.fillStyle=OL;g.fillRect(-4,0,8,14);g.fillStyle='#ffd23a';g.fillRect(-2.5,1,5,12);g.fillRect(2,8,5,3);g.restore();}
 if(B.st==='leapT'||B.st==='leap'){const a=.35+.3*Math.sin(T*18);g.fillStyle=`rgba(255,40,70,${a})`;g.beginPath();g.ellipse(B.lx,FY+2,70,10,0,0,TAU);g.fill();if(B.st==='leapT')txt('!!',B.lx,FY-60,26,'#ff3a4a');}
 // boss
 if(B.st!=='down'||F.won<1.2){g.save();if(B.st==='down'){g.globalAlpha=clamp(1.4-F.won,0,1);}const pose=B.st==='slamT'||B.st==='slam'?'volk-slam':B.st==='leap'||B.st==='leapT'?'volk-leap':'volk';
  g.fillStyle='rgba(0,0,0,.35)';g.beginPath();g.ellipse(B.x,FY+2,60,8,0,0,TAU);g.fill();sprI(pose,B.x,B.y-95-B.air+(B.st==='down'?F.won*30:0),190,B.hit>0)||circ(B.x,B.y-90,60,'#6a4aa0',OL);g.restore();}
 for(const w of F.waves){g.fillStyle=OL;g.beginPath();g.moveTo(w.x-18,FY);g.lineTo(w.x,FY-w.h-4);g.lineTo(w.x+18,FY);g.fill();g.fillStyle='#ffb050';g.beginPath();g.moveTo(w.x-13,FY);g.lineTo(w.x,FY-w.h);g.lineTo(w.x+13,FY);g.fill();dglow(w.x,FY-10,22,'#ff9a3a',.6);}
 for(const r of F.rings){g.save();g.translate(r.x,r.y);g.rotate(r.a);g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.arc(0,0,12,0,TAU);g.stroke();g.strokeStyle='#c8c0b0';g.lineWidth=5;g.stroke();g.restore();}
 if(!(F.inv>0&&(T*14|0)%2))captain(F.px,F.py,CAPS[cap],{sc:1,t:T,air:F.air,vy:F.vy,run:F.run,shoot:F.cool>0,face:F.face});
 for(const s of F.shots){dglow(s.x,s.y,9,'#7fffff',.9);g.fillStyle='#fff';g.fillRect(s.x-7,s.y-1.5,14,3);}
 for(const p of c.parts){g.globalAlpha=Math.min(1,p.l*2);circ(p.x,p.y,2.4,p.c);}g.globalAlpha=1;
 g.restore();
 for(const p of c.pops)sfxText(p.t,Math.max(90,Math.min(W-90,p.x)),Math.max(100,Math.min(H-100,p.y))-(1-p.l)*20,p.sz||18,.9-p.l,-.08);
 panel(14,10,170,40,'#ffc53d');for(let i=0;i<5;i++){circ(32+i*22,30,8,OL);circ(32+i*22,30,6.5,i<F.hp?'#ff4f7b':'#3a2a4a');}txt('x'+LIVES,160,30,12,'#ffffff');
 if(!F.won){const bw=220,bx=W/2-bw/2;txt('KEYMASTER VOLK',W/2,20,11,'#d0a0ff');g.fillStyle=OL;g.fillRect(bx-2,28,bw+4,10);g.fillStyle='#2a2040';g.fillRect(bx,30,bw,6);g.fillStyle='#b04aff';g.fillRect(bx,30,bw*Math.max(0,B.hp/B.max),6);}
 if(c.msgs.length){const m=c.msgs[0];panel(W/2-170,50,340,30,'#45d6ff');txt(m.t,W/2,65,13,'#ffffff');}
 if(showTouch&&!F.won)footBtns();}
function footBtns(){const b=btns();const draw=(o,label,on)=>{g.globalAlpha=.62;circ(o.x,o.y,o.r+2,OL);g.fillStyle=lg(g,0,o.y-o.r,0,o.y+o.r,on?['#7fe8ff','#2a8ab8']:['#3a4a9a','#141c4a']);g.beginPath();g.arc(o.x,o.y,o.r,0,TAU);g.fill();g.globalAlpha=.92;txt(label,o.x,o.y,o.r*.42,'#ffffff');g.globalAlpha=1;};
 draw(b.left,'◀',held('left'));draw(b.right,'▶',held('right'));draw(b.jump,'JUMP',held('jump'));draw(b.shoot,'FIRE',held('shoot'));}
// ================= MISSION 7: VESTA PEAK v3. Low-gravity climb on foot: jump, double-jump, jetpack, grapple. Comet trots alongside. Refs: captain sheets, comet-m7, stone-golem =================
['golem','golem-slam','golem-core','comet-walk','dustwhale','comet-body','pip7','v7bat','v7mite','v7drone'].forEach(k=>loadImg('spr_'+k,'assets/sprites/'+k+'.png'));
[['v7far','v7-far'],['v7cave','v7-cave'],['v7gorge','v7-gorge'],['v7summit','v7-summit'],['v7rock','v7-rock']].forEach(([k,f])=>loadImg('bg_'+k,'assets/bg/'+f+'.jpg'));
const VW=880,VG=760,VJ=-540,VDJ=-470,VJET=1.0,VFY=-4600;
const VSEC=[{n:'CRATER WALL',y:0},{n:'CRYSTAL CAVERN',y:-1400},{n:'GRAPPLE GORGE',y:-3300},{n:'VESTA PEAK',y:VFY}];
function vBuild(){const P=[],A=[],E=[],I2=[];const p=(x,y,w,k,o)=>{const q={x,y,w,k:k||'s',x0:x,y0:y,...(o||{})};P.push(q);return q;};
 // A: crater wall
 p(-40,0,VW+80);p(100,-140,200);p(420,-280,180);p(650,-420,200,'c');p(380,-560,170);p(80,-700,200);p(330,-840,170,'c');p(600,-980,220);p(330,-1120,160);
 for(let i=0;i<6;i++)p(40+i*110,-1260,108,'br',{bi:i});p(700,-1260,180);p(480,-1400,260,'cp',{ci:1});
 // B: crystal cavern (open, 3 power crystals open the gate)
 p(0,-1540,260);p(620,-1540,260);p(300,-1680,260,'m',{r:170,sp:.8});p(0,-1820,220);p(660,-1820,220);p(330,-1960,220);p(40,-2100,200);p(640,-2100,200);
 p(300,-2240,280,'m',{r:190,sp:1});p(20,-2380,220);p(640,-2380,220);p(330,-2520,220);p(100,-2660,180);p(600,-2660,180);
 p(-40,-2790,VW+80,'gate');p(620,-2920,180,'el',{top:-3300});p(260,-3300,300,'cp',{ci:2});
 // C: grapple gorge
 p(40,-3440,170,'c');A.push({x:300,y:-3540},{x:560,y:-3660});p(660,-3760,180,'c');p(380,-3900,170,'m',{r:150,sp:1.1});
 A.push({x:150,y:-4060},{x:420,y:-4190},{x:690,y:-4320});p(600,-4460,200,'c');p(-40,VFY,VW+80,'cp',{ci:3});
 E.push({k:'drone',x:720,y:-640},{k:'mite',pi:5},{k:'bat',x:440,y:-2010},{k:'mite',pi:24},{k:'drone',x:150,y:-2300},{k:'bat',x:420,y:-3600},{k:'drone',x:780,y:-4150});
 for(const e of E){e.hp=e.k==='drone'?3:2;e.t=rnd(0,3);e.st='idle';}
 I2.push({k:'ec',x:110,y:-1858},{k:'ec',x:740,y:-2138},{k:'ec',x:110,y:-2418},{k:'gem',x:760,y:-1018,gi:0},{k:'gem',x:840,y:-1578,gi:1},{k:'gem',x:80,y:-2138,gi:2},{k:'gem',x:420,y:-3338,gi:3},{k:'gem',x:740,y:-3798,gi:4});
 return{P,A,E,I:I2};}
const VTIPS=[[-40,'COMET: BEEP. Low gravity! JUMP, then JUMP again in the air for a double jump.'],[-500,'COMET: BEEP. Cracked ledges crumble. Keep moving!'],[-1000,'COMET: BEEP. Hold JUMP while falling to use the jetpack.'],[-1460,'COMET: BEEP. A crystal gate! My scanner shows 3 power crystals.'],[-2850,'COMET: BEEP. A crystal elevator! Hop on.'],[-3360,'COMET: BEEP. Grapple rings! Press JUMP near one to grab it.']];
function vP(x,y,n,col,sp,l){for(let i=0;i<n;i++)CT.parts.push({x,y,vx:rnd(-sp,sp),vy:rnd(-sp,sp*.3),l:rnd(l*.5,l),c:Array.isArray(col)?col[i%col.length]:col,g:1});}
function vPop(x,y,t,sz){CT.pops.push({x,y,t,l:.9,sz:sz||18,w:1});}
function bugInit(r0){const k=r0|0,L=vBuild(),sy=VSEC[Math.min(k,3)].y,sx=k===0?140:k===3?140:440;
 CT={bug:1,clm:1,...L,px:sx,py:sy,vy:0,face:1,fuel:VJET,dj:0,jet:0,jh:1,hang:null,hp:5,inv:1.4,cool:0,cp:k,sec:Math.min(k,3),t:0,camX:0,camY:sy-H*.62,shots:[],es:[],parts:[],pops:[],msgs:[],rocks:[],ecs:k>=2?3:0,safe:{x:sx,y:sy},tip:{},rt:3,hs:0,hurtF:0,falls:0,maxH:0,br:{on:0,x:0,d:0},motes:[],
  dog:{x:sx-50,y:sy,vy:0,vx:0,air:0,ph:0,face:1,bark:0}};
 for(let i=0;i<40;i++)CT.motes.push({x:rnd(0,W),y:rnd(0,H),v:rnd(6,20),s:rnd(.6,2),a:rnd(0,TAU)});
 if(k>=2){const gt=CT.P.find(q=>q.k==='gate');gt.k='s';}if(k>=3){const el=CT.P.find(q=>q.k==='el');el.y=el.top;}
 CT.msgs.push({t:VSEC[CT.sec].n,l:2.2});for(const t of VTIPS)if(t[0]>sy-40)CT.tip[t[0]]=1;
 if(k>=3){CT.boss=vGolemInit();startMusic('boss',2);}else startMusic('asteroid');}
function bugSave(k){try{writeSave({cp:{m:7,k}});}catch(e){}}
function bugToast(t){CT.msgs.unshift({t,l:3.4});if(/^COMET/.test(t)){sfx('blip');setTimeout(()=>sfx('blip'),120);CT.dog.bark=.5;}}
function bugHurt(){const c=CT;if(c.inv>0||AUTO)return;c.hp--;c.inv=1.5;c.hurtF=.35;c.hs=.06;sfx('hurt');SHAKE=.4;vPop(c.px,c.py-80,'OOF!',16);vP(c.px,c.py-40,10,['#ff4f7b','#fff'],160,.5);if(c.hp<=0){const k=c.cp;loseLife(()=>{CT={retry:k};bugInit(k);});}}
function vPlatX(q,c){return q.k==='m'?q.x0+Math.sin(c.t*q.sp)*q.r:q.x;}
function vResetBridge(c){c.br={on:0,x:0,d:0};for(const q of c.P)if(q.k==='br'){q.down=0;q.fy=0;q.fv=0;}}
function vRespawn(c){c.px=c.safe.x;c.py=c.safe.y-2;c.vy=0;c.air=true;c.ground=null;c.hang=null;c.falls++;if(c.br.on)vResetBridge(c);const el=c.P.find(q=>q.k==='el');if(el&&el.y>el.top+1&&c.cp<2){el.y=el.y0;el.go=0;}c.dog.x=c.px-40;c.dog.y=c.py;c.dog.vy=0;bugHurt();}
function updBug(dt){const c=CT;if(c.hs>0){c.hs-=dt;return;}c.t+=dt;c.inv-=dt;c.cool-=dt;c.hurtF-=dt;
 for(const p of c.parts){p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.g)p.vy+=220*dt;p.l-=dt;}c.parts=c.parts.filter(p=>p.l>0);if(c.parts.length>400)c.parts.splice(0,c.parts.length-400);
 for(const p of c.pops)p.l-=dt;c.pops=c.pops.filter(p=>p.l>0);for(const m of c.msgs)m.l-=dt;c.msgs=c.msgs.filter(m=>m.l>0).slice(0,3);
 for(const m of c.motes){m.y-=m.v*dt;m.x+=Math.sin(c.t+m.a)*8*dt;if(m.y<-5){m.y=H+5;m.x=rnd(0,W);}}
 // reveal set piece at the summit
 if(c.rev!=null){c.rev+=dt;SHAKE=Math.max(SHAKE,c.rev>1.2?.25:0);if(c.rev>1.2&&Math.random()<.4)vP(rnd(300,800),VFY-10,2,['#a89880','#ff9af0'],90,1);vCam(dt);if(c.rev>3.4){c.rev=null;playComic(GOLEMCUT,()=>{CT={retry:3};go('cart');});}return;}
 // platforms
 for(const q of c.P){const nx=vPlatX(q,c);q.dx=nx-q.x;q.x=nx;q.dy=0;
  if(q.k==='c'&&q.st!=null){q.st+=dt;if(q.st>.65&&!q.down){q.down=1;sfx('boom');vP(q.x+q.w/2,q.y+6,14,['#8a8090','#5a5068','#c8c0d0'],120,1);}if(q.st>3.6){q.st=null;q.down=0;}}
  if(q.k==='el'&&q.go&&q.y>q.top){const ny=Math.max(q.top,q.y-60*dt);q.dy=ny-q.y;q.y=ny;if(Math.random()<.5)c.parts.push({x:q.x+rnd(10,q.w-10),y:q.y+16,vx:rnd(-10,10),vy:rnd(60,120),l:.6,c:Math.random()<.5?'#7ae8ff':'#ff9af0'});if(q.y<=q.top){q.go=0;sfx('stinger');bugToast('COMET: BEEP. Top floor! Grapple gorge ahead.');}}
  if(q.k==='br'&&q.down){q.fv=(q.fv||0)+700*dt;q.fy=(q.fy||0)+q.fv*dt;}}
 // collapsing bridge chase
 if(c.br.on&&c.py<-1330&&c.cp>=1)c.br.on=0;if(c.br.on){c.br.d+=dt;if(c.br.d>.7)c.br.x+=170*dt;for(const q of c.P)if(q.k==='br'&&!q.down&&q.x+q.w<c.br.x+40){q.down=1;SHAKE=.3;sfx('boom');vP(q.x+q.w/2,q.y+8,12,['#8a8090','#6a6070','#ffd27a'],140,1.1);}
  if(Math.random()<dt*3)c.rocks.push({x:clamp(c.px+rnd(40,160),30,VW-30),y:c.camY-40,warn:.9,vy:0,r:16});}
 const pj=(pressedA||I.J)&&!c.jh;c.jh=I.J;pressedA=false;
 if(AUTO)vBot(dt);
 const mv=(I.R?1:0)-(I.L?1:0);if(mv)c.face=mv;c.run=mv&&!c.air?(c.run||0)+dt*10:0;
 if(c.hang){const a=c.hang;c.px+=(a.x-c.px)*Math.min(1,dt*14);c.py+=(a.y+64-c.py)*Math.min(1,dt*14);c.fuel=VJET;c.dj=0;c.ht+=dt;if(pj&&c.ht>.12){c.hang=null;c.air=true;c.vy=-580;c.vx=0;sfx('whoosh');vP(a.x,a.y,8,'#7ae8ff',120,.4);}}
 else{c.px=clamp(c.px+mv*(c.air?215:235)*dt,16,VW-16);
  const near=c.air?c.A.find(a=>Math.hypot(a.x-c.px,a.y-(c.py-40))<135):null;c.near=near;
  if(pj){if(!c.air){c.air=true;c.vy=VJ;c.ground=null;c.dj=0;c.jy=c.py;sfx('whoosh');vP(c.px,c.py,8,'#c8c0d0',90,.4);}
   else if(near){c.hang=near;c.ht=0;c.vy=0;sfx('power');vPop(near.x,near.y-30,'GRAB!',14);}
   else if(!c.dj){c.dj=1;c.vy=VDJ;sfx('whoosh');for(let i=0;i<10;i++)c.parts.push({x:c.px+rnd(-14,14),y:c.py-6,vx:rnd(-60,60),vy:rnd(40,140),l:.4,c:i%2?'#7ae8ff':'#ffffff'});}}
  c.jet=c.air&&I.J&&c.dj&&c.vy>-60&&c.fuel>0;
  if(c.air){if(c.jet){c.vy=Math.max(-230,c.vy-1700*dt);c.fuel-=dt;if(Math.random()<.8)c.parts.push({x:c.px-c.face*10,y:c.py-22,vx:rnd(-20,20),vy:rnd(140,220),l:.35,c:Math.random()<.5?'#7ae8ff':'#ffc53d'});if(((c.t*20)|0)%4===0)sfx('near');}
   const oy=c.py;c.vy+=VG*dt;c.py+=c.vy*dt;if(c.jy!=null)c.maxH=Math.max(c.maxH,c.jy-c.py);
   if(c.vy>0)for(const q of c.P){if(q.down||q.k==='gate'&&c.ecs<3)continue;if(c.px>q.x-6&&c.px<q.x+q.w+6&&oy<=q.y+2&&c.py>=q.y){c.py=q.y;c.vy=0;c.air=false;c.ground=q;c.fuel=VJET;c.jet=0;c.dj=0;c.jy=null;vP(c.px,c.py,6,'#b0a8c0',70,.35);break;}}
   const gt=c.P.find(q=>q.k==='gate');if(gt&&c.ecs<3&&c.vy<0&&oy-70>=gt.y+14&&c.py-70<gt.y+14){c.py=gt.y+84;c.vy=60;vP(c.px,gt.y+14,8,'#b04aff',100,.4);if(!c.gm||c.t-c.gm>2){c.gm=c.t;bugToast('COMET: BEEP. Gate locked. Find '+(3-c.ecs)+' more power crystal'+(3-c.ecs===1?'':'s')+'!');}}}
  else{const q=c.ground;if(!q||q.down||c.px<q.x-8||c.px>q.x+q.w+8){c.air=true;c.vy=0;c.dj=0;c.jy=null;}else{c.py=q.y;c.px+=q.dx||0;
   if(q.k==='c'&&q.st==null){q.st=0;sfx('warn');}
   if(q.k==='br'&&!c.br.on){c.br.on=1;c.br.x=q.x-60;c.br.d=0;SHAKE=.5;sfx('stinger');bugToast('COMET: BEEP. The bridge is falling apart! RUN!');}
   if(q.k==='el'&&!q.go&&q.y>q.top){q.go=1;sfx('power');}
   if(q.k==='s'||q.k==='cp')c.safe={x:clamp(c.px,q.x+20,q.x+q.w-20),y:q.y};
   if(q.k==='cp'&&q.ci>c.cp){c.cp=q.ci;c.sec=q.ci;c.hp=5;bugSave(q.ci);c.msgs.unshift({t:'CHECKPOINT · '+VSEC[q.ci].n,l:2.4});sfx('pick');vP(c.px,c.py-20,16,['#7dff9a','#fff'],160,.8);if(q.ci===3&&!c.boss){c.rev=0;sfx('stinger');return;}}}}}
 if(c.py>c.safe.y+460)vRespawn(c);
 vDog(dt);
 if(c.boss){updVGolem(dt);return;}
 const si=VSEC.filter(s=>c.py<=s.y+20).length-1;if(si>c.sec&&si<3)c.sec=si;
 for(const t of VTIPS)if(!c.tip[t[0]]&&c.py<t[0]){c.tip[t[0]]=1;bugToast(t[1]);}
 // shooting
 if(I.F&&c.cool<=0&&!c.hang){c.cool=.2;c.shots.push({x:c.px+c.face*20,y:c.py-38,vx:c.face*640});sfx('shot');vP(c.px+c.face*24,c.py-38,3,'#bff8ff',60,.15);}
 for(const s of c.shots){s.x+=s.vx*dt;if(s.x<c.camX-40||s.x>c.camX+W+40)s.dead=1;}
 // items
 for(const it of c.I){if(it.got)continue;if(Math.abs(it.x-c.px)<34&&Math.abs(it.y-(c.py-30))<40){it.got=1;if(it.k==='ec'){c.ecs++;sfx('power');vPop(it.x,it.y-30,'POWER CRYSTAL '+c.ecs+'/3',16);vP(it.x,it.y,24,['#7ae8ff','#fff','#b04aff'],200,.9);
   if(c.ecs>=3){const gt=c.P.find(q=>q.k==='gate');gt.open=1;SHAKE=.5;sfx('stinger');bugToast('COMET: BEEP. All 3! The gate is open. Up we go!');for(let i=0;i<40;i++)c.parts.push({x:rnd(0,VW),y:gt.y,vx:rnd(-40,40),vy:rnd(-200,20),l:1.2,c:i%2?'#b04aff':'#ffffff',g:1});}}else{score+=500;gotGem(7,it.gi,c.msgs);vP(it.x,it.y,14,['#ff9af0','#fff'],150,.7);}}}
 // enemies: sparse, every attack telegraphed
 for(const e of c.E){if(e.dead)continue;e.t+=dt;e.hit=(e.hit||0)-dt;const near=Math.abs(e.y!=null?e.y-c.py:0)<380;
  if(e.k==='drone'){e.ex=e.x+Math.sin(e.t*.9)*60;e.ey=e.y+Math.sin(e.t*1.7)*14;
   if(Math.abs(e.ey-c.py)<360){e.f=(e.f??2)-dt;if(e.f<=0&&!e.tell){e.tell=.9;sfx('warn');}if(e.tell>0){e.tell-=dt;if(e.tell<=0){e.tell=0;e.f=3.2;const a=Math.atan2(c.py-40-e.ey,c.px-e.ex);c.es.push({x:e.ex,y:e.ey,vx:Math.cos(a)*190,vy:Math.sin(a)*190});sfx('shot');}}}
   if(Math.hypot(e.ex-c.px,e.ey-(c.py-40))<34)bugHurt();}
  else if(e.k==='mite'){const q=c.P[e.pi];if(e.st!=='hop'){e.u=(e.u??.3)+dt*.16*(e.d||1);if(e.u>1||e.u<0){e.d=-(e.d||1);e.u=clamp(e.u,0,1);}e.ex=q.x+16+e.u*(q.w-32);e.ey=q.y;
    if(!q.down&&c.ground===q&&Math.abs(e.ex-c.px)<170&&e.st==='idle'&&(e.cd||0)<=0){e.st='tell';e.tt=.7;sfx('warn');}
    if(e.st==='tell'){e.tt-=dt;if(e.tt<=0){e.st='hop';e.vy=-380;e.vx=Math.sign(c.px-e.ex)*150;e.hy=0;}}e.cd=(e.cd||0)-dt;}
   else{e.vy+=VG*dt;e.hy+=e.vy*dt;e.ex+=e.vx*dt;e.ey=q.y+Math.min(0,e.hy);if(e.hy>=0&&e.vy>0){e.st='idle';e.cd=2;e.u=clamp((e.ex-q.x-16)/(q.w-32),0,1);vP(e.ex,q.y,5,'#a89880',60,.3);}}
   if(Math.abs(e.ex-c.px)<28&&Math.abs(e.ey-14-(c.py-24))<30)bugHurt();}
  else if(e.k==='bat'){if(e.st==='idle'){e.ex=e.x+Math.sin(e.t*1.3)*30;e.ey=e.y+Math.sin(e.t*2.1)*10;if(Math.hypot(c.px-e.ex,c.py-40-e.ey)<280&&(e.cd||0)<=0){e.st='tell';e.tt=.8;sfx('warn');}e.cd=(e.cd||0)-dt;}
   else if(e.st==='tell'){e.tt-=dt;if(e.tt<=0){e.st='dive';e.s0={x:e.ex,y:e.ey};e.tg={x:c.px,y:c.py-40};e.u=0;}}
   else if(e.st==='dive'){e.u+=dt/1.1;const u=Math.min(1,e.u),dx=e.tg.x-e.s0.x;e.ex=e.s0.x+dx*u*2;e.ey=e.s0.y+(e.tg.y-e.s0.y)*Math.sin(u*Math.PI)*1;if(u>=1){e.st='back';e.u=0;e.s1={x:e.ex,y:e.ey};}}
   else{e.u+=dt/1;const u=Math.min(1,e.u);e.ex=e.s1.x+(e.x-e.s1.x)*u;e.ey=e.s1.y+(e.y-e.s1.y)*u;if(u>=1){e.st='idle';e.cd=2.5;}}
   if(e.st==='dive'&&Math.hypot(e.ex-c.px,e.ey-(c.py-40))<30)bugHurt();}
  for(const s of c.shots)if(!s.dead&&Math.abs(s.x-e.ex)<28&&Math.abs(s.y-(e.k==='mite'?e.ey-16:e.ey))<28){s.dead=1;e.hp--;e.hit=.12;c.hs=.03;sfx('hit');vP(s.x,s.y,8,['#fff6c0','#7ae8ff'],180,.3);
   if(e.hp<=0){e.dead=1;score+=250;stats.kills++;SHAKE=.25;vP(e.ex,e.ey-10,22,['#b04aff','#ff9af0','#fff'],220,.8);sfx('boom');vPop(e.ex,e.ey-36,e.k==='bat'?'SPLAT!':'ZAP!',18);}}}
 for(const e of c.es){e.x+=e.vx*dt;e.y+=e.vy*dt;if(Math.abs(e.y-c.py)>600)e.dead=1;if(Math.hypot(e.x-c.px,e.y-(c.py-36))<22){e.dead=1;bugHurt();}for(const s of c.shots)if(!s.dead&&Math.hypot(s.x-e.x,s.y-e.y)<14){s.dead=1;e.dead=1;vP(e.x,e.y,6,'#ff9af0',120,.3);}}
 // falling rocks in the gorge: red mark first
 if(c.py<-3350&&c.py>VFY+60){c.rt-=dt;if(c.rt<=0){c.rt=3.4;c.rocks.push({x:clamp(c.px+rnd(-90,90),30,VW-30),y:c.camY-40,warn:1.2,vy:0,r:18});sfx('warn');}}
 for(const r of c.rocks){if(r.warn>0){r.warn-=dt;r.y=c.camY-40;continue;}r.vy+=600*dt;r.y+=r.vy*dt;r.rot=(r.rot||0)+dt*4;if(Math.hypot(r.x-c.px,r.y-(c.py-36))<r.r+14){r.dead=1;bugHurt();vP(r.x,r.y,10,'#b0a898',160,.6);}for(const s of c.shots)if(!s.dead&&Math.hypot(s.x-r.x,s.y-r.y)<r.r+8){s.dead=1;r.dead=1;vP(r.x,r.y,12,['#c8c0b0','#ffd27a'],170,.6);sfx('boom');vPop(r.x,r.y-20,'KRAK!',14);}if(r.y>c.camY+H+60)r.dead=1;}
 c.rocks=c.rocks.filter(r=>!r.dead);c.shots=c.shots.filter(s=>!s.dead);c.es=c.es.filter(e=>!e.dead);
 vCam(dt);}
function vCam(dt){const c=CT;const tx=c.boss||c.rev!=null?(VW-W)/2:clamp(c.px-W/2,0,VW-W);c.camX+=(tx-c.camX)*Math.min(1,dt*6);const ty=c.boss?VFY-H+120:c.rev!=null?VFY-H+120-Math.max(0,1.4-c.rev)*60:c.py-H*.62;c.camY+=(ty-c.camY)*Math.min(1,dt*(c.rev!=null?2:5));}
// Comet trots after the hero on four legs, jumps after them, catches up if left behind
function vDog(dt){const c=CT,d=c.dog;d.bark-=dt;const tx=c.boss?Math.max((VW-W)/2+30,c.px-46):c.px-c.face*46;const dx=tx-d.x;
 if(!d.air){const sp=Math.abs(dx)>160?330:Math.abs(dx)>20?240:0;d.vx=sp?Math.sign(dx)*sp:0;if(d.vx)d.face=Math.sign(d.vx);else d.face=Math.sign(c.px-d.x)||1;d.x+=d.vx*dt;d.ph+=Math.abs(d.vx)*dt*.055;
  const g0=d.g;if(g0){d.y=g0.y;d.x+=g0.dx||0;if(g0.down||d.x<g0.x-4||d.x>g0.x+g0.w+4){d.air=1;d.vy=0;}}
  const hero=c.ground&&!c.air?c.ground:null;
  if(!d.air&&(hero&&hero!==d.g&&(c.py<d.y-20||Math.abs(c.px-d.x)>40)||c.air&&c.py<d.y-70)){d.air=1;d.vx=0;d.vy=-120;d.g=null;}}
 else{// jetpack hover: Comet flies after the hero and never falls
  const hg=c.ground&&!c.air?c.ground:null,lx=hg?clamp(tx,hg.x+10,hg.x+hg.w-10):tx,ty=hg?hg.y:c.py-26+Math.sin(T*4)*4;
  const ex=lx-d.x,ey=ty-d.y,dist=Math.hypot(ex,ey),mx=Math.min(560,60+dist*4.5),k=Math.min(1,dt*7);
  d.vx+=((dist>1?ex/dist*mx:0)-d.vx)*k;d.vy+=((dist>1?ey/dist*mx:0)-d.vy)*k;d.x+=d.vx*dt;d.y+=d.vy*dt;if(Math.abs(d.vx)>8)d.face=Math.sign(d.vx);
  d.pf=(d.pf||0)-dt;if(d.pf<=0){d.pf=.07;vP(d.x-(d.face||1)*4,d.y-14,1,['#9fe8ff','#ffffff'],40,.35);}
  if(hg&&Math.abs(ex)<18&&Math.abs(ey)<14){d.y=hg.y;d.x=lx;d.air=0;d.g=hg;d.vx=0;d.vy=0;}}
 if(Math.hypot(d.x-c.px,d.y-c.py)>1100){d.x=c.px-c.face*60;d.y=c.py-60;d.vy=0;d.vx=0;d.air=1;}// failsafe only (respawn handled in vRespawn)
 d.x=clamp(d.x,14,VW-14);}
function dogPack(d,t,bob){// small rounded doggy jetpack on Comet's back; puffs only while airborne
 const y=-27+bob;if(d.air){for(let k=0;k<3;k++){const ph=(t*6+k/3)%1;g.globalAlpha=(1-ph)*.85;circ(-3,y+10+ph*14,3.5+ph*4,k%2?'#ffffff':'#9fe8ff');}g.globalAlpha=1;dglow(-3,y+10,12,'#7ad8ff',.5);}
 g.fillStyle=OL;g.beginPath();g.roundRect(-11,y-8,16,15,6);g.fill();g.fillStyle=lg(g,0,y-7,0,y+6,['#ffb347','#e06a10']);g.beginPath();g.roundRect(-9.5,y-6.5,13,12,5);g.fill();
 g.fillStyle='rgba(255,255,255,.45)';g.beginPath();g.roundRect(-8,y-5.5,5,3,1.5);g.fill();circ(-3,y+7,3,OL);circ(-3,y+7,2,d.air?'#bff4ff':'#5a6a8a');
 g.strokeStyle=OL;g.lineWidth=2;g.beginPath();g.moveTo(-10,y+1);g.lineTo(-16,y+4);g.moveTo(4,y+1);g.lineTo(10,y+4);g.stroke();}
function drawDog(d,t){const im=IMG.spr_comet_body||IMG['spr_comet-body'];const s=.105,f=d.face||1;g.save();g.translate(d.x,d.y);g.scale(f*1,1);
 const run=!d.air&&Math.abs(d.vx)>5,ph=d.ph*TAU,bob=run?Math.abs(Math.sin(ph))*-2.5:Math.sin(t*3)*.6;
 const legs=[[88,0],[142,Math.PI],[252,Math.PI],[346,0]];// diagonal trot pairs
 const hip=-300*s+ (300*s) ;
 for(const [lx,o] of legs){const x0=(lx-227)*s,y0=-62*s*1+bob*0;let a=0,b=0;if(run){a=Math.sin(ph+o)*.7;b=Math.max(0,-Math.sin(ph+o))*.6;}else if(d.air){a=d.vy<0?(lx<200?.9:-.9):(lx<200?-.5:.5);}
  const L1=26*s*10*.13,L2=24*s*10*.13;const kx=x0+Math.sin(a)*L1,ky=y0+Math.cos(a)*L1,fx=kx+Math.sin(a-b)*L2,fy=ky+Math.cos(a-b)*L2;
  g.strokeStyle=OL;g.lineWidth=5.2;g.lineCap='round';g.beginPath();g.moveTo(x0,y0-4);g.lineTo(kx,ky);g.lineTo(fx,fy);g.stroke();g.strokeStyle='#a84e10';g.lineWidth=3.2;g.beginPath();g.moveTo(x0,y0-4);g.lineTo(kx,ky);g.lineTo(fx,fy);g.stroke();
  g.fillStyle=OL;g.beginPath();g.ellipse(fx+1.5,fy,3.4,2.2,0,0,TAU);g.fill();g.fillStyle='#e67519';g.beginPath();g.ellipse(fx+1.5,fy,2.4,1.4,0,0,TAU);g.fill();}
 // tail wag
 const wag=Math.sin(t*(run?16:9))*(run?.35:.55),tx0=(84-227)*s,ty0=(-300+200)*s-6+bob;g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.moveTo(tx0+4,ty0+2);g.quadraticCurveTo(tx0-8,ty0-2+Math.sin(wag)*4,tx0-12,ty0-14+wag*10);g.stroke();g.strokeStyle='#a84e10';g.lineWidth=3;g.beginPath();g.moveTo(tx0+4,ty0+2);g.quadraticCurveTo(tx0-8,ty0-2+Math.sin(wag)*4,tx0-12,ty0-14+wag*10);g.stroke();
 if(im){const w=im.width*s,h=im.height*s;g.drawImage(im,-227*s,-h+(300-262)*s*-0-6+bob-(62*s)+6,w,h);}else{g.fillStyle='#a84e10';g.beginPath();g.ellipse(0,-14,22,9,0,0,TAU);g.fill();}
 dogPack(d,t,bob);
 g.restore();if(d.bark>0)txt('WOOF!',d.x+f*18,d.y-48,10,'#ffe066');}
// test bot: drives ONLY the virtual buttons (VK.L/R/J/F); the real physics does the rest
function vRoute(c){const P=c.P,pi=i=>({t:'p',q:P[i]}),it=i=>({t:'i',it:c.I[i]}),an=i=>({t:'a',a:c.A[i]});
 const R=[pi(1),pi(2),pi(3),pi(4),pi(5),pi(6),pi(7),it(3),pi(8),pi(9),pi(10),pi(11),pi(12),pi(13),pi(14),pi(15),pi(16),
  pi(18),it(4),pi(19),pi(20),it(0),pi(22),pi(24),it(1),pi(25),pi(23),it(5),pi(25),pi(26),it(2),pi(28),pi(29),pi(31),pi(32),pi(33),it(6),
  pi(34),an(0),an(1),pi(35),it(7),pi(36),an(2),an(3),an(4),pi(37),pi(38)];return R;}
function vBot(dt){const c=CT;VK.F=1;VK.L=0;VK.R=0;const B=c.bot||(c.bot={i:0,jt:0,rel:0,stuck:0,best:1e9,log:[]});
 if(c.boss){vBossBot(dt);return;}
 if(!B.R){B.R=vRoute(c);B.i=0;while(B.i<B.R.length&&vNodeY(B.R[B.i],c)>c.py+5)B.i++;}
 let n=B.R[B.i];if(!n){VK.J=0;return;}
 if(n.t==='i'&&n.it.got){B.i++;return;}
 if(n.t==='p'&&c.ground===n.q&&!c.air){if(n.q.k==='el'&&n.q.go){VK.J=0;const x=n.q.x+n.q.w/2;if(Math.abs(x-c.px)>10)VK[x>c.px?'R':'L']=1;return;}B.i++;B.stuck=0;return;}
 if(n.t==='a'&&c.hang===n.a){const nx=B.R[B.i+1];if(c.ht>.25){B.i++;B.press=1;}return;}
 const tx=n.t==='p'?(n.q.k==='br'||n.q.w>500?clamp(c.px+120,n.q.x+20,n.q.x+n.q.w-20):clamp(c.px,n.q.x+24,n.q.x+n.q.w-24)):(n.t==='i'?n.it.x:n.a.x),ty=vNodeY(n,c);
 if(n.t==='p'&&n.q.k==='m')B.tx=n.q.x+n.q.w/2;
 const ax=(n.t==='p'&&n.q.k==='m')?n.q.x+n.q.w/2:tx,dx=ax-c.px;
 if(Math.abs(dx)>(n.t==='i'?6:10))VK[dx>0?'R':'L']=1;
 // jumping logic via button presses
 let want=0;const above=ty<c.py-8;
 if(c.hang){want=B.press?1:0;}
 else if(!c.air){if(above&&Math.abs(dx)<(ty<c.py-200?120:230))want=1;if(n.t==='a'&&Math.abs(dx)<200)want=1;}
 else{if(n.t==='a'&&c.near===n.a)want=1;
  else if(above&&!c.dj&&c.vy>-40&&c.py-ty>60)want=1;
  else if(c.dj&&c.vy>-60&&c.py>ty-4&&c.fuel>0&&(above||Math.abs(dx)>30))B.hold=1;else B.hold=0;}
 // emulate a finger: release one frame between presses
 if(want&&!B.down){VK.J=1;B.down=1;B.press=0;}else if(B.down&&!(B.hold&&c.dj)){VK.J=0;B.down=0;}else if(B.hold&&c.dj){VK.J=1;}
 if(!want&&!B.hold&&B.down){VK.J=0;B.down=0;}
 B.stuck+=dt;if(c.py<B.best-20){B.best=c.py;B.stuck=0;}if(B.stuck>20&&!B.fail){B.fail='stuck at node '+B.i+' y='+Math.round(c.py);console.log('VBOT '+B.fail);}}
function vNodeY(n,c){return n.t==='p'?n.q.y:n.t==='i'?n.it.y+30:n.a.y+64;}
function vBossBot(dt){const c=CT,B=c.boss;VK.F=1;VK.J=0;let j=0;
 for(const w of B.waves)if(w.x>c.px&&w.x-c.px<95)j=1;
 if(B.st==='beamT'&&!B.bh&&B.t<.35)j=1;
 for(const d of B.drops)if(Math.abs(d.x-c.px)<70){VK[d.x>c.px?'L':'R']=1;}
 if((B.st==='tossT'||B.st==='rainT')){const xs=B.st==='tossT'?[B.tx]:B.rx;for(const x of xs)if(Math.abs(x-c.px)<70)VK[x>c.px?'L':'R']=1;}
 if(!VK.L&&!VK.R&&c.px>260)VK.L=1;
 const bb=c.bot;if(j&&!c.air&&!bb.down){VK.J=1;bb.down=1;}else{bb.down=0;}}
// ---- boss: Vesta Stone Golem on the summit, fought on foot ----
function vGolemInit(){return{x:Math.min(VW,W)-120+(VW-W)/2,hp:AUTO?14:90,max:AUTO?14:90,ph:1,st:'idle',t:1.8,hit:0,cyc:0,waves:[],drops:[],core:0,won:0};}
function updVGolem(dt){const c=CT,B=c.boss,FY=VFY;B.hit-=dt;B.core-=dt;
 for(const s of c.shots){s.x+=s.vx*dt;if(s.x>VW+30||s.x<-30)s.dead=1;}
 if(B.won){B.won+=dt;if(B.won>2.2&&!B.key){B.key=1;try{writeSave({cp:null,next:7});}catch(e){}shardMoment(5,()=>completeMission(7));}vCam(dt);return;}
 c.px=clamp(c.px,(VW-W)/2+70,B.x-80);
 if(I.F&&c.cool<=0){c.cool=.2;c.face=1;c.shots.push({x:c.px+20,y:c.py-38,vx:640});sfx('shot');}
 for(const s of c.shots){if(!s.dead&&Math.abs(s.x-B.x)<70&&s.y>FY-230&&s.y<FY){s.dead=1;const core=B.core>0&&Math.abs(s.y-(FY-130))<50;B.hp-=core?3:1;B.hit=.08;sfx('hit');vP(s.x,s.y,core?14:5,core?['#ff4fd0','#fff']:['#c8c0b0','#fff'],180,.35);if(core){c.hs=.03;vPop(s.x,s.y-20,'CRACK!',14);}}}c.shots=c.shots.filter(s=>!s.dead);
 const hpF=B.hp/B.max,ph=hpF>.66?1:hpF>.33?2:3;if(ph>B.ph){B.ph=ph;B.st='roar';B.t=1.3;B.waves=[];B.drops=[];SHAKE=.7;sfx('stinger');vPop(B.x-60,FY-260,ph===2?'GRRRMMBLE!':'RRROOOAAR!',24);bugToast(ph===2?'COMET: BEEP. Its chest cracks after a slam. Hit the crystal!':'COMET: BEEP. Triple shockwaves! Double jump over them!');}
 if(B.hp<=0){B.won=.01;SHAKE=.9;sfx('bigboom');score+=5000;stats.kills++;for(let i=0;i<8;i++)vP(B.x+rnd(-60,60),FY-rnd(40,220),14,['#c8c0b0','#ff9af0','#fff'],240,1.2);vPop(B.x,FY-260,'KRAKOOM!',34);return;}
 B.t-=dt;const idle=ph===1?1.4:ph===2?1.05:.8;
 if(B.st==='idle'||B.st==='roar'){if(B.t<=0){B.cyc++;const L=ph===1?['slam','toss','beam']:ph===2?['slam','beam','toss','rain']:['slam','rain','beam','toss','beam'];const a=L[B.cyc%L.length];B.st=a+'T';B.t=1.05;if(a==='beam')B.bh=B.cyc%2;if(a==='toss')B.tx=clamp(c.px,(VW-W)/2+30,B.x-90);if(a==='rain')B.rx=[0,1,2].map(i=>clamp(c.px+(i-1)*120,(VW-W)/2+30,B.x-90));sfx('warn');}}
 else if(B.st==='slamT'&&B.t<=0){B.st='slam';B.t=.6;SHAKE=.6;sfx('bigboom');vP(B.x-60,FY,20,['#a89880','#ff9af0'],200,.8);B.waves.push({x:B.x-80,v:-320});if(ph===3){B.wq=.55;B.wn=2;}if(ph>=2)B.core=2.6;}
 else if(B.st==='tossT'&&B.t<=0){B.st='toss';B.t=.6;B.drops.push({x:B.tx,y:c.camY-40,vy:0,r:26});sfx('whoosh');}
 else if(B.st==='rainT'&&B.t<=0){B.st='toss';B.t=.6;for(const x of B.rx)B.drops.push({x,y:c.camY-40-rnd(0,80),vy:0,r:16});sfx('whoosh');}
 else if(B.st==='beamT'&&B.t<=0){B.st='beam';B.t=.7;sfx('hit');}
 else if(B.st==='beam'){const by=B.bh?FY-120:FY-26;if(Math.abs((c.py-36)-by)<30)bugHurt();if(B.t<=0){B.st='idle';B.t=idle;}}
 else if((B.st==='slam'||B.st==='toss')&&B.t<=0){B.st='idle';B.t=idle;}
 if(B.wq>0){B.wq-=dt;if(B.wq<=0){B.waves.push({x:B.x-80,v:-340});if(--B.wn>0)B.wq=.55;}}
 for(const w of B.waves){w.x+=w.v*dt;if(Math.random()<.5)c.parts.push({x:w.x,y:FY-4,vx:rnd(-30,30),vy:rnd(-120,-40),l:.4,c:'#c8b8a0',g:1});if(w.x<-40)w.dead=1;if(!w.dead&&Math.abs(w.x-c.px)<26&&c.py>FY-30){w.dead=1;bugHurt();}}B.waves=B.waves.filter(w=>!w.dead);
 for(const d of B.drops){d.vy+=900*dt;d.y+=d.vy*dt;if(d.y>=FY-d.r){d.dead=1;SHAKE=.3;sfx('boom');vP(d.x,FY-6,12,['#c8c0b0','#ff9af0'],180,.6);if(Math.abs(d.x-c.px)<d.r+24&&c.py>FY-80)bugHurt();}}B.drops=B.drops.filter(d=>!d.dead);
 vCam(dt);}
// ---------- drawing ----------
function vPat(){if(vPat.c&&vPat.g===g)return vPat.c;const im=IMG.bg_v7rock;if(!im)return '#6a6474';const o=document.createElement('canvas');o.width=o.height=110;o.getContext('2d').drawImage(im,0,0,110,110);vPat.c=g.createPattern(o,'repeat');vPat.g=g;return vPat.c;}
function vBg(c){const bgs=[['bg_v7far',1],['bg_v7cave',0],['bg_v7gorge',0],['bg_v7summit',0]];const y=c.py;
 const wts=[clamp(1-(-y-1250)/250,0,1),clamp(Math.min((-y-1250)/250,(3150+y)/250+1),0,1),clamp(Math.min((-y-3150)/250,(4350+y)/250+1),0,1),clamp((-y-4350)/200,0,1)];if(c.boss||c.rev!=null){wts.fill(0);wts[3]=1;}
 let any=0;wts.forEach((w,i)=>{const im=IMG[bgs[i][0]];if(!im||w<=0)return;any=1;g.globalAlpha=w;const s=Math.max((W+80)/im.width,(H+60)/im.height),iw=im.width*s,ih=im.height*s;g.drawImage(im,-40-(c.camX/(VW-W||1))*40,-30+Math.sin(c.camY*.001)*10,iw,ih);});g.globalAlpha=1;
 if(!any){g.fillStyle=lg(g,0,0,0,H,['#03030c','#1a0a24']);g.fillRect(0,0,W,H);}
 g.fillStyle='rgba(6,4,18,.28)';g.fillRect(0,0,W,H);
 // mid parallax spires
 g.fillStyle='rgba(20,14,34,.75)';const off=(c.camY*.25)%400;for(let i=-1;i<4;i++){const bx=((i*230-c.camX*.3)%920+920)%920-140,by=H-((off+i*130)%400)+120;g.beginPath();g.moveTo(bx,by+200);g.lineTo(bx+40,by-60);g.lineTo(bx+70,by-20);g.lineTo(bx+110,by-120);g.lineTo(bx+150,by+200);g.fill();}}
function vRock(x,y,w,h,k,t,q){const pat=vPat();g.save();
 const jag=(i)=>Math.sin(i*1.7+x*.03)*5+Math.sin(i*.9)*4;
 g.beginPath();g.moveTo(x-3,y-2);g.lineTo(x+w+3,y-2);g.lineTo(x+w+1,y+h*.6);for(let i=8;i>=0;i--){g.lineTo(x+w*i/8,y+h+jag(i)+(i%2?8:0));}g.lineTo(x-1,y+h*.6);g.closePath();
 g.fillStyle=OL;g.lineWidth=4;g.strokeStyle=OL;g.stroke();g.fillStyle=pat;g.fill();
 const sh=g.createLinearGradient(0,y,0,y+h+10);sh.addColorStop(0,'rgba(255,255,255,.18)');sh.addColorStop(.25,'rgba(0,0,0,0)');sh.addColorStop(1,'rgba(10,4,30,.6)');g.fillStyle=sh;g.fill();
 if(k==='c'){g.fillStyle='rgba(120,50,30,.35)';g.fill();g.strokeStyle='#1a1018';g.lineWidth=2;for(let i=1;i<5;i++){const cx=x+i*w/5;g.beginPath();g.moveTo(cx,y);g.lineTo(cx+5,y+7);g.lineTo(cx-2,y+14);g.stroke();}}
 if(k==='m'||k==='el'){for(const fx of [x+14,x+w-14]){dglow(fx,y+h+8,14+Math.sin(t*8+fx)*3,'#7ae8ff',.8);g.fillStyle='#bff8ff';g.beginPath();g.moveTo(fx-5,y+h);g.lineTo(fx,y+h+12);g.lineTo(fx+5,y+h);g.fill();}}
 if(k==='el'){g.strokeStyle='rgba(160,240,255,.8)';g.lineWidth=2;g.strokeRect(x+6,y+3,w-12,6);dglow(x+w/2,y,40,'#7ae8ff',.35);}
 if(k==='cp'&&q&&q.ci>CT.cp){txt('▲ CHECKPOINT',x+w/2,y-14,10,'#7dff9a');dglow(x+w/2,y,30,'#7dff9a',.3);}
 // top lip highlight + hanging crystals
 g.fillStyle='rgba(210,200,240,.55)';g.fillRect(x,y,w,2.5);
 if(k!=='br')for(let i=0;i<Math.floor(w/90);i++){const cx=x+30+i*90+((x*7)%30),col=(i+((x/10)|0))%2?'#7ae8ff':'#ff9af0';g.fillStyle=col;g.beginPath();g.moveTo(cx-4,y+h);g.lineTo(cx,y+h+10+((cx|0)%6));g.lineTo(cx+4,y+h);g.fill();dglow(cx,y+h+5,8,col,.35+.15*Math.sin(t*3+i));}
 g.restore();}
function drawBug(){const c=CT,cx=c.camX,cy=c.camY;const sk=SHAKE>0?[rnd(-1,1)*SHAKE*9,rnd(-1,1)*SHAKE*9]:[0,0];
 g.save();vBg(c);g.translate(sk[0],sk[1]);
 g.save();g.translate(-cx,-cy);
 // side walls
 const pat=vPat();for(const [x0,x1] of [[-260,0],[VW,VW+260]]){g.fillStyle=pat;g.fillRect(x0,cy-20,x1-x0,H+40);g.fillStyle=x0<0?lg(g,x0,0,x1,0,['rgba(5,3,15,.9)','rgba(5,3,15,.25)']):lg(g,x0,0,x1,0,['rgba(5,3,15,.25)','rgba(5,3,15,.9)']);g.fillRect(x0,cy-20,x1-x0,H+40);g.fillStyle=OL;g.fillRect(x0<0?-4:VW,cy-20,4,H+40);}
 for(let y=Math.floor(cy/170)*170;y<cy+H+170;y+=170){const lx=(y/170)%2?-6:VW+6,col=(y/170)%3?'#7ae8ff':'#ff9af0';dglow(lx,y,26,col,.45+.2*Math.sin(c.t*2+y));for(let k=0;k<3;k++){g.fillStyle=col;g.beginPath();const bx=lx+(lx<0?2:-2),d=lx<0?1:-1;g.moveTo(bx,y-6+k*7);g.lineTo(bx+d*(16+k*6),y-2+k*8);g.lineTo(bx,y+4+k*7);g.fill();}}
 // gate
 for(const q of c.P){if(q.k!=='gate'||q.y<cy-30||q.y>cy+H+40)continue;if(c.ecs<3){g.fillStyle=OL;g.fillRect(0,q.y-8,VW,26);const gg=lg(g,0,q.y-6,0,q.y+16,['#c08aff','#6a3aa0','#3a1a60']);g.fillStyle=gg;g.fillRect(0,q.y-6,VW,22);for(let i=0;i<VW;i+=40){g.fillStyle='rgba(255,255,255,.25)';g.beginPath();g.moveTo(i,q.y+16);g.lineTo(i+20,q.y-6);g.lineTo(i+26,q.y-6);g.lineTo(i+6,q.y+16);g.fill();}
  for(let k=0;k<3;k++){const on=k<c.ecs,gx=VW/2+(k-1)*70;circ(gx,q.y+5,13,OL);circ(gx,q.y+5,10,on?'#7ae8ff':'#2a2040');if(on)dglow(gx,q.y+5,22,'#7ae8ff',.7);}}else vRock(q.x,q.y,q.w,16,'s',c.t);}
 for(const q of c.P){if(q.k==='gate')continue;let y=q.y+(q.fy||0);if(q.down&&q.k!=='br')continue;if(y<cy-40||y>cy+H+60)continue;let x=q.x;if(q.k==='c'&&q.st!=null)x+=Math.sin(c.t*55)*2.2;
  if(q.k==='br'){if(q.fy>600)continue;g.save();if(q.down){g.translate(x+q.w/2,y);g.rotate((q.fy||0)*.002*(q.bi%2?1:-1));g.translate(-x-q.w/2,-y);}vRock(x,y,q.w,12,'br',c.t);g.restore();if(!q.down){g.strokeStyle='#7ae8ff';g.globalAlpha=.6;g.lineWidth=2;g.beginPath();g.moveTo(x,y-2);g.lineTo(x+q.w,y-2);g.stroke();g.globalAlpha=1;}continue;}
  vRock(x,y,q.w,q.k==='el'?18:22,q.k,c.t,q);}
 if(c.br.on&&c.br.x>0){const bx=c.br.x+40;dglow(bx,-1258,30,'#ffd27a',.4);}
 // grapple rings
 for(const a of c.A){if(a.y<cy-40||a.y>cy+H+40)continue;const nr=c.near===a;dglow(a.x,a.y,nr?34:20,'#7ae8ff',nr?.9:.55);g.strokeStyle=OL;g.lineWidth=9;g.beginPath();g.arc(a.x,a.y,13,0,TAU);g.stroke();g.strokeStyle=nr?'#ffffff':'#7ae8ff';g.lineWidth=4.5;g.stroke();for(let k=0;k<3;k++){const an=c.t*2+k*2.1;circ(a.x+Math.cos(an)*20,a.y+Math.sin(an)*20,1.6,'#bff8ff');}}
 if(c.hang){g.strokeStyle='#bff8ff';g.lineWidth=3;g.beginPath();g.moveTo(c.hang.x,c.hang.y);g.lineTo(c.px+c.face*8,c.py-58);g.stroke();dglow(c.hang.x,c.hang.y,20,'#ffffff',.6);}
 // items
 for(const it of c.I){if(it.got)continue;const y=it.y+Math.sin(T*4+it.x)*3;if(it.k==='ec'){dglow(it.x,y,30+Math.sin(T*5)*4,'#7ae8ff',.85);g.fillStyle=OL;g.beginPath();g.moveTo(it.x,y-20);g.lineTo(it.x+12,y);g.lineTo(it.x,y+20);g.lineTo(it.x-12,y);g.closePath();g.fill();g.fillStyle=lg(g,0,y-16,0,y+16,['#ffffff','#7ae8ff','#3a8aff']);g.beginPath();g.moveTo(it.x,y-16);g.lineTo(it.x+9,y);g.lineTo(it.x,y+16);g.lineTo(it.x-9,y);g.closePath();g.fill();if(Math.random()<.1)c.parts.push({x:it.x+rnd(-12,12),y:y+rnd(-14,14),vx:0,vy:-20,l:.6,c:'#bff8ff'});}else gemShard(it.x,y,it.gi,GEMS[7][it.gi]);}
 // enemies
 for(const e of c.E){if(e.dead||e.ex==null)continue;const fl=e.hit>0;
  if(e.k==='drone'){if(e.tell>0){dglow(e.ex,e.ey,30,'#ff3a4a',.8);sfxText('!',e.ex,e.ey-36,20,.3,0,'#ffe14d','#ff3a3a');}sprI('v7drone',e.ex,e.ey+Math.sin(c.t*6)*2,40,fl,e.ex>c.px)||circ(e.ex,e.ey,16,'#6a4aa0');}
  else if(e.k==='mite'){if(e.st==='tell')sfxText('!',e.ex,e.ey-46,18,.3,0,'#ffe14d','#ff3a3a');g.save();g.translate(e.ex,e.ey-14+(e.st==='idle'?Math.abs(Math.sin(c.t*12))*-1.5:0));sprI('v7mite',0,0,30,fl||e.st==='tell'&&(T*12|0)%2,e.ex>c.px)||circ(0,0,14,'#6a6474');g.restore();dglow(e.ex,e.ey-22,10,'#7ae8ff',.4);}
  else if(e.k==='bat'){if(e.st==='tell'){dglow(e.ex,e.ey,30,'#ff3a4a',.7);sfxText('!',e.ex,e.ey-36,20,.3,0,'#ffe14d','#ff3a3a');}const fl2=Math.sin(c.t*(e.st==='dive'?26:14));g.save();g.translate(e.ex,e.ey);g.scale(1,.85+.15*fl2);sprI('v7bat',0,0,40,fl,e.tg&&e.tg.x<e.ex)||circ(0,0,14,'#c050e0');g.restore();}}
 for(const e of c.es){dglow(e.x,e.y,14,'#ff4fd0',.9);circ(e.x,e.y,5,'#ffd0f0');}
 for(const r of c.rocks){if(r.warn>0)continue;dsp(rockSpr(19,1,false),r.x,r.y,r.r/16,1,r.rot||0);if(Math.random()<.3)c.parts.push({x:r.x,y:r.y-r.r,vx:rnd(-20,20),vy:-40,l:.4,c:'#a89880'});}
 if(c.boss)drawVGolem();
 // Comet + hero
 drawDog(c.dog,T);
 dglow(c.px,c.py-40,60,'#bff8ff',.12);
 if(!(c.inv>0&&(T*14|0)%2&&c.inv<1.3)){captain(c.px,c.py,CAPS[cap],{sc:1,t:T,air:c.air||!!c.hang,vy:c.vy,run:c.run,shoot:c.cool>0,face:c.face});if(c.jet){dglow(c.px-c.face*10,c.py-22,20,'#7ae8ff',.95);dglow(c.px-c.face*10,c.py-14,12,'#ffc53d',.9);}}
 for(const s of c.shots){dglow(s.x,s.y,11,'#7fffff',.95);g.fillStyle='#fff';g.fillRect(s.x-8,s.y-1.6,16,3.2);}
 for(const p of c.parts){g.globalAlpha=Math.min(1,p.l*2.2);circ(p.x,p.y,2.2,p.c);}g.globalAlpha=1;
 g.restore();
 // screen-space: dust motes + warnings + lighting
 for(const m of c.motes){g.globalAlpha=.35;circ(m.x,(m.y-c.camY*.15%H+H)%H,m.s,c.sec===1?'#d8b0ff':'#e0d8c8');}g.globalAlpha=1;
 for(const r of c.rocks)if(r.warn>0&&(T*8|0)%2){const x=r.x-cx;g.fillStyle='rgba(255,50,70,.3)';g.fillRect(x-24,96,48,H-180);sfxText('!',x,114,22,.3,0,'#ffe14d','#ff3a3a');}
 if(c.sec===1&&!c.boss){const v=g.createRadialGradient(c.px-cx,c.py-cy-40,60,c.px-cx,c.py-cy-40,W*.7);v.addColorStop(0,'rgba(0,0,0,0)');v.addColorStop(1,'rgba(4,0,14,.55)');g.fillStyle=v;g.fillRect(0,0,W,H);}
 if(c.hurtF>0){g.fillStyle=`rgba(255,40,80,${c.hurtF*.6})`;g.fillRect(0,0,W,H);}
 // Comet's scanner arrow toward the nearest power crystal
 if(c.sec===1&&c.ecs<3&&!c.boss){const t=c.I.filter(i=>i.k==='ec'&&!i.got).sort((a,b)=>Math.hypot(a.x-c.px,a.y-c.py)-Math.hypot(b.x-c.px,b.y-c.py))[0];if(t){const a=Math.atan2(t.y-(c.py-40),t.x-c.px),ax=c.px-cx+Math.cos(a)*62,ay=c.py-cy-40+Math.sin(a)*62;g.save();g.translate(ax,ay);g.rotate(a);g.fillStyle=OL;g.beginPath();g.moveTo(15,0);g.lineTo(-8,-9);g.lineTo(-8,9);g.closePath();g.fill();g.fillStyle='#7dff9a';g.beginPath();g.moveTo(12,0);g.lineTo(-6,-7);g.lineTo(-6,7);g.closePath();g.fill();g.restore();}}
 // summit reveal letterbox
 if(c.rev!=null){const e=Math.min(1,c.rev*2);g.fillStyle='#000';g.fillRect(0,0,W,40*e);g.fillRect(0,H-40*e,W,40*e);if(c.rev>.6)sfxText('VESTA PEAK',W/2,H*.36,34,c.rev-.6,-.05);if(c.rev>1.6)txt('Something big is waking up...',W/2,H*.36+40,13,'#ffe066');}
 g.restore();
 for(const p of c.pops)sfxText(p.t,clamp(p.x-cx,90,W-90),clamp(p.y-cy,100,H-110)-(1-p.l)*20,p.sz||18,.9-p.l,-.08);
 if(c.rev!=null)return;
 panel(14,10,170,40,'#ffc53d');for(let i=0;i<5;i++){circ(32+i*22,30,8,OL);circ(32+i*22,30,6.5,i<c.hp?'#ff4f7b':'#3a2a4a');}txt('x'+LIVES,160,30,12,'#ffffff');
 txt('◆ GEMS '+gemN(7)+'/5',20,62,11,'#ff9af0','left');
 {g.fillStyle=OL;g.fillRect(104,57,70,10);g.fillStyle=c.fuel>.25?'#7ae8ff':'#ff7a3a';g.fillRect(106,59,66*Math.max(0,c.fuel/VJET),6);txt('JET',190,62,9,'#7ae8ff');}
 if(c.boss&&!c.boss.won){const B=c.boss,bw=220,bx=W/2-bw/2;txt('VESTA STONE GOLEM',W/2,20,11,'#ff9af0');g.fillStyle=OL;g.fillRect(bx-2,28,bw+4,10);g.fillStyle='#2a2040';g.fillRect(bx,30,bw,6);g.fillStyle='#ff4fd0';g.fillRect(bx,30,bw*Math.max(0,B.hp/B.max),6);}
 else if(!c.boss){const pw=200,px=W/2-pw/2;g.fillStyle=OL;g.fillRect(px-2,14,pw+4,10);g.fillStyle='#2a2040';g.fillRect(px,16,pw,6);g.fillStyle='#ffc53d';g.fillRect(px,16,pw*clamp(-c.py/-VFY,0,1),6);txt(VSEC[c.sec].n+(c.sec===1?'  ·  CRYSTALS '+c.ecs+'/3':''),W/2,36,11,'#7ae8ff');}
 if(c.msgs.length){const m=c.msgs[0],co=/^COMET/.test(m.t);g.font=co?'bold 11.5px monospace':'bold 12px sans-serif';let L=[m.t];if(g.measureText(m.t).width>456){const w=m.t.split(' ');let best=1,bd=1e9;for(let i=1;i<w.length;i++){const d=Math.abs(g.measureText(w.slice(0,i).join(' ')).width-g.measureText(w.slice(i).join(' ')).width);if(d<bd){bd=d;best=i;}}L=[w.slice(0,best).join(' '),w.slice(best).join(' ')];}
  const bh=L.length>1?46:30;panel(W/2-240,72,480,bh,co?'#5fe36a':'#45d6ff');L.forEach((ln,i)=>{const y=72+bh/2+(i-(L.length-1)/2)*15;if(co){g.font='bold 11.5px monospace';g.fillStyle='#7dff9a';g.textAlign='center';g.textBaseline='middle';g.fillText(ln,W/2,y);}else txt(ln,W/2,y,12,'#ffffff');});}
 if(c.near&&!c.hang&&showTouch)txt('JUMP = GRAB',W-120,H-150,12,'#7ae8ff');
 if(showTouch)footBtns();}
function drawVGolem(){const c=CT,B=c.boss,FY=VFY,L=(VW-W)/2;
 if(B.st==='slamT'){g.fillStyle=`rgba(255,60,80,${.4+.4*Math.sin(T*20)})`;g.fillRect(L,FY-4,B.x-60-L,8);sfxText('!',B.x-30,FY-250,30,.3,0,'#ffe14d','#ff3a3a');}
 for(const x of [...(B.st==='tossT'?[B.tx]:[]),...(B.st==='rainT'?B.rx:[])]){g.strokeStyle=`rgba(255,50,70,${.5+.4*Math.sin(T*18)})`;g.lineWidth=4;g.beginPath();g.ellipse(x,FY+2,40,9,0,0,TAU);g.stroke();sfxText('!',x,FY-40,20,.3,0,'#ffe14d','#ff3a3a');}
 if(B.st==='beamT'||B.st==='beam'){const by=B.bh?FY-120:FY-26;if(B.st==='beam'){dglow(B.x-30,FY-180,30,'#ff4fd0',1);g.fillStyle='rgba(255,80,210,.85)';g.fillRect(L,by-9,B.x-40-L,18);g.fillStyle='#fff';g.fillRect(L,by-3,B.x-40-L,6);}else{g.strokeStyle=`rgba(255,60,200,${.5+.4*Math.sin(T*20)})`;g.lineWidth=3;g.setLineDash([12,10]);g.beginPath();g.moveTo(B.x-40,by);g.lineTo(L,by);g.stroke();g.setLineDash([]);txt(B.bh?'EYE BEAM! STAY LOW!':'EYE BEAM! JUMP!',(B.x-40+L)/2,FY-200,16,'#ff9af0');}}
 if(!(B.won>1.6)){g.save();if(B.won)g.globalAlpha=clamp(1.6-B.won,0,1);const pose=B.core>0?'golem-core':B.st==='slamT'?'golem-slam':'golem';dglow(B.x,FY-110,110,'#ff4fd0',.18);if(B.core>0)dglow(B.x,FY-130,70,'#ff4fd0',.5+.3*Math.sin(T*10));sprI(pose,B.x,FY-108,218,B.hit>0)||circ(B.x,FY-110,90,'#8a8070');g.restore();}
 for(const w of B.waves){g.fillStyle=OL;g.beginPath();g.moveTo(w.x-24,FY);g.lineTo(w.x,FY-36);g.lineTo(w.x+24,FY);g.fill();g.fillStyle='#c8b8a0';g.beginPath();g.moveTo(w.x-17,FY);g.lineTo(w.x,FY-29);g.lineTo(w.x+17,FY);g.fill();dglow(w.x,FY-12,18,'#ff9af0',.4);}
 for(const d of B.drops)dsp(rockSpr(d.r>20?24:13,1,false),d.x,d.y,d.r/(d.r>20?24:13),1,T*3);}
const VESTALAND=[
 {img:'c56',d:4.5,int:3,cap:'Vesta. The map\'s trail leads up the giant peak.',bub:[{s:'Jetpack on. Stay close, Comet!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.4},{s:'BEEP. Scanner on. Let\'s climb!',who:'COMET',x:360,y:120,w:240,tx:300,ty:120,at:1.6}],fx:{s:'WOOF!',x:470,y:280,sz:26,at:.3}}];
const GOLEMCUT=[
 {img:'c61',d:4.5,int:3,cap:'THE VESTA STONE GOLEM',bub:[{s:'GRRRMMBLE! LEAVE MY MOUNTAIN!',who:'STONE GOLEM',x:360,y:60,w:220,tx:330,ty:160,at:.4},{s:'BEEP. Its chest cracks after a slam. Hit the crystal!',who:'COMET',x:40,y:230,w:220,tx:200,ty:180,at:1.6}],fx:{s:'BOSS!',x:120,y:60,sz:28,at:.3}}];
const PEAKWIN=[
 {img:'c07',d:4.5,int:3,cap:'On the Vorr flagship...',bub:[{s:'All six keyholes filled?! Fine. Find the Heart Crystal for me. I will be waiting.',who:'MALAKAR',x:40,y:230,w:220,tx:200,ty:180,at:.4}]},
 {img:'c62',d:5,int:3,sting:1,cap:'The map points to Jupiter. To be continued...',bub:[{s:'Next stop: Jupiter!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:.5}],fx:{s:'NEXT: JUPITER!',x:470,y:50,sz:28,at:.6,rot:-.06}}];

const PRISONARR=[
 {img:'c54',d:4,int:3,cap:'Deep inside Phobos: the Vorr prison.',fx:{s:'SKRRRK!',x:200,y:300,sz:28,at:.2}},
 {img:'c55',d:4.5,int:3,cap:'KEYMASTER VOLK guards the gate.',bub:[{s:'Nobody gets in. NOBODY gets out!',who:'KEYMASTER VOLK',x:360,y:60,w:220,tx:330,ty:160,at:.4},{s:'Then we go through you!',who:'@',x:40,y:230,w:220,tx:200,ty:180,at:1.6}],fx:{s:'BOSS!',x:120,y:60,sz:28,at:.3}}];

// ---- M6 silly alien ships (refs: assets/ref/tow-saucer.jpg, sneezer.jpg, rock-disguise.jpg) ----
['towsaucer','sneezer','sneezer-wind','sneezer-achoo','disguise','disguise-pop'].forEach(k=>loadImg('spr_'+k,'assets/sprites/'+k+'.png'));
function m6Alien(f,dt){const s=sp,onS=f.x>-10&&f.x<SW+10;if(!onS)return;f.at=(f.at??1.6)-dt;
 if(f.kind==='tow'){if(f.tell>0){f.tell-=dt;if(f.tell<=0){f.rock=0;f.regrab=3;const a=Math.atan2(s.y-(f.y+40),s.x-f.x);s.rocks.push({x:f.x,y:f.y+40,vx:Math.cos(a)*240,vy:Math.sin(a)*240,r:17,hp:3,rot:0,vr:3,junk:false,v:1});sfx('whoosh');s.pops.push({x:f.x,y:f.y-30,t:'FLING!',l:.7,comic:1,sz:16});}}
  else if(!f.rock){f.regrab-=dt;if(f.regrab<=0)f.rock=1;}else if(f.at<=0){f.at=4.2;f.tell=AUTO?.4:1.1;sfx('warn');}}
 if(f.kind==='sneeze'){if(f.tell>0){f.tell-=dt;if(f.tell<=0){f.achoo=.5;const a=Math.atan2(s.y-f.y,s.x-f.x);s.eshots.push({x:f.x-30,y:f.y,vx:Math.cos(a)*115,vy:Math.sin(a)*115,tb:1,dust:1});s.pops.push({x:f.x,y:f.y-28,t:'ACHOO!',l:.8,comic:1,sz:18});sfx('boom');}}
  else{f.achoo=(f.achoo||0)-dt;if(f.at<=0){f.at=3.6;f.tell=AUTO?.4:1;s.pops.push({x:f.x,y:f.y-28,t:'AH... AH...',l:.9,comic:1,sz:13});}}}
 if(f.kind==='disg'){if(!f.pop){if(f.x<SW-190){f.pop=1;f.tell=AUTO?.4:.9;s.pops.push({x:f.x,y:f.y-36,t:'SURPRISE!',l:.9,comic:1,sz:18});sfx('warn');}}
  else if(f.tell>0){f.tell-=dt;if(f.tell<=0){const a=Math.atan2(s.y-f.y,s.x-f.x);for(const k of[-.22,0,.22])s.eshots.push({x:f.x-20,y:f.y,vx:Math.cos(a+k)*150,vy:Math.sin(a+k)*150});sfx('hit');f.shot=1;}}}}
const DRAWK6={
 tow:f=>{const y=f.y+Math.sin(f.age*3)*4,r=f.age*.8;if(f.rock){const fl=f.tell>0&&(T*12|0)%2;g.fillStyle=fl?'rgba(255,80,120,.45)':'rgba(255,140,230,.28)';g.beginPath();g.moveTo(f.x-14,y+20);g.lineTo(f.x+14,y+20);g.lineTo(f.x+24,y+58);g.lineTo(f.x-24,y+58);g.fill();dsp(rockSpr(17,1,false),f.x,y+44,1,1,r);if(f.tell>0)txt('!',f.x-30,y+44,18,'#ff3a4a');}
  g.save();g.translate(f.x,y);g.rotate(Math.sin(f.age*2.4)*.12);sprI('towsaucer',0,0,56,f.hit>0)||circ(0,0,20,'#7ad04a',OL);g.restore();},
 sneeze:f=>{const y=f.y+Math.sin(f.age*2)*3;sprI(f.achoo>0?'sneezer-achoo':f.tell>0?'sneezer-wind':'sneezer',f.x,y,50,f.hit>0)||circ(f.x,y,16,'#ff9a3a',OL);if(f.tell>0)dglow(f.x-20,y,18,'#ffb050',.4+.3*Math.sin(T*20));},
 disg:f=>{if(!f.pop){dsp(rockSpr(19,2,false),f.x,f.y,1.35,1,f.age*.6,f.hit>0);return;}sprI('disguise-pop',f.x,f.y-6,62,f.hit>0)||circ(f.x,f.y,20,'#888',OL);if(f.tell>0)txt('!',f.x,f.y-40,18,'#ff3a4a');}};
Object.assign(DRAWK,DRAWK6);

// ===================== MISSION 9: JUPITER (cloud platformer) =====================
let SK=null;const SKS=[{n:'CLOUD HOPPING',a:0,b:4300},{n:'STORM RIDING',a:4300,b:8800},{n:'SKY CITY',a:8800,b:13200}],SKA=13400;
function skRng(seed){let x=seed;return()=>{x=(x*16807)%2147483647;return(x&0xffff)/65536;};}
function initSky(){const R=skRng(909),C=[],G=[],F=[],U=[],P=[];let x=40,y=262;
 const add=(o)=>{C.push(Object.assign({x0:o.x,y0:o.y,sk:0,ph:R()*6,amp:0,dy:0},o));return C[C.length-1];};
 add({x:x,y:262,w:300,t:'n'});x=340;
 // stage 1: cloud hopping
 while(x<SKS[0].b-200){const r=R(),pb=C[C.length-1].t,t=pb==='bounce'||pb==='drift'&&r<.6?'n':r<.3?'drift':r<.5?'sink':r<.62?'bounce':'n',gap=t==='drift'?28+R()*30:45+R()*60;y=clamp(y+(R()-.55)*100,165,285);const w=t==='bounce'?80:pb==='bounce'?140+R()*40:90+R()*80;
  const c=add({x:x+gap,y,w,t,amp:t==='drift'?36:0});x=c.x+w;
  if(t==='bounce'&&G.length<2)G.push({x:c.x+w/2,y:y-170});}
 add({x:x+60,y:262,w:240,t:'n',cp:1});x+=300;
 // stage 2: storm riding (updrafts over wide gaps)
 let k=0;while(x<SKS[1].b-200){k++;y=clamp(y+(R()-.5)*90,170,285);if(k%4===0){const gw=190+R()*50;U.push({x:x+20,w:gw-40,top:60});if(G.length<3&&k===8)G.push({x:x+gw/2,y:85});x+=gw;add({x,y:clamp(y-40,170,260),w:120,t:'n'});x+=120;continue;}
  const t=R()<.25?'sink':R()<.2?'bounce':'n',w=100+R()*70,c=add({x:x+50+R()*55,y,w,t});x=c.x+w;}
 add({x:x+60,y:262,w:240,t:'n',cp:1});x+=300;
 // stage 3: sky city
 k=0;while(x<SKS[2].b-200){k++;y=clamp(y+(R()-.5)*70,190,282);const w=190+R()*130,c=add({x:x+55+R()*45,y,w,t:'city',hs:1+(R()*3|0)});x=c.x+w;
  if(k%2===1)P.push({x:c.x+30+R()*40,c:C.length-1,said:0,hug:0,col:k%3});if(k>1&&k%2===0)F.push({k:'goon',c:C.length-1,x:c.x+w*.6,hp:AUTO?1:3,dir:-1,at:1.5,tell:0});
  if(k===5&&G.length<4)G.push({x:c.x+w/2,y:c.y-120});if(k===9&&G.length<5)G.push({x:c.x+w-30,y:c.y+40});}
 while(G.length<5)G.push({x:SKS[2].b-400-G.length*300,y:120});
 const a=SKA;add({x:a-120,y:280,w:300,t:'n',cp:1});add({x:a+200,y:280,w:150,t:'n'});add({x:a+380,y:240,w:80,t:'bounce'});add({x:a+490,y:280,w:150,t:'n'});
 SK={px:120,py:262,vx:0,vy:0,on:true,face:1,hp:UPG(2)?11:8,maxhp:UPG(2)?11:8,inv:0,cool:0,run:0,cam:0,shots:[],eshots:[],booms:[],msgs:[],clouds:C,gems:G.map((g0,i)=>({...g0,i,got:GEMS[9][i]})),foes:F,ups:U,puffs:P,
  time:0,safe:{x:120,y:262},lock:false,boss:null,gust:null,gt:5,lt:3.5,warn:[],comet:{x:60,y:180,say:null,sl:0},stI:-1,tip:null,dj:0,done:0};
 SK.msgs.push({t:'MISSION 9: JUPITER',l:2.4});}
function skRespawn(x){const s=SK;let best=s.clouds[0];for(const c of s.clouds)if(c.cp&&c.x<=x+5)best=c;s.px=best.x+60;s.py=best.y;s.vx=s.vy=0;s.on=true;s.inv=1.5;s.cam=Math.max(0,s.px-W*.35);s.hp=s.maxhp;s.eshots=[];s.lock=false;s.boss=null;}
function skCloudAt(c){return{x:c.x,y:c.y+c.dy};}
function skHurt(n){const s=SK;if(s.inv>0||AUTO)return;s.hp-=n;s.inv=1.2;SHAKE=.25;sfx('hit');boomAt(s.booms,s.px,s.py-20,8,'#ff4f7b');if(s.hp<=0){const cx=s.px;loseLife(()=>{skRespawn(cx);startMusic('game');});s.hp=s.maxhp;}}
function autoSky(){const s=SK;VK.R=1;VK.F=1;VK.U=s.lock?1:0;const ahead=s.clouds.find(c=>c.x+c.w>s.px+4&&c.x<s.px+260&&!(s.px>=c.x&&s.px<=c.x+c.w));const on=s.clouds.find(c=>s.px>=c.x&&s.px<=c.x+c.w&&Math.abs(c.y+c.dy-s.py)<3);
 VK.J=0;VK.L=0;if(s.on&&on){s.apFrom=on;if(s.px>on.x+on.w-26){pressedA=true;VK.J=1;}}else if(!s.on&&s.vy<-200)VK.J=1;if(!s.on&&s.apFrom){const tg=s.clouds.find(c=>c.x>s.apFrom.x+5&&c.x+c.w>s.px-40);if(tg&&s.px>tg.x+Math.min(60,tg.w*.5)&&s.py<tg.y+tg.dy){VK.R=0;}}if(s.ups.some(u=>s.px>u.x-30&&s.px<u.x+u.w))VK.J=1;if(s.lock){VK.R=s.px<SKA+260?1:0;VK.L=s.px>SKA+300?1:0;if(s.on&&Math.random()<.02)pressedA=true;}}
function updSky(dt){const s=SK;if(AUTO)autoSky();s.time+=dt;
 const si=s.px<SKS[0].b?0:s.px<SKS[1].b?1:2;if(si!==s.stI&&!s.lock){s.stI=si;s.msgs.push({t:'STAGE '+(si+1)+': '+SKS[si].n,l:2.4});s.tip={t:['Hop the clouds! Grey ones sink, pink ones bounce. Comet sniffs out hidden gems.','Ride the updrafts over big gaps. Gusts push you. Blast the lightning!','The sky city! Friendly puffs help you. Kreel\'s goons do not.'][si],l:6};}
 for(const c of s.clouds){if(c.t==='drift'){const nx=c.x0+Math.sin(s.time*1.1+c.ph)*c.amp;c.ddx=nx-c.x;c.x=nx;}
  if(c.t==='sink'){if(c.stood){c.sk+=dt;if(c.sk>.35)c.dy=Math.min(150,c.dy+55*dt);}else{c.sk=0;c.dy=Math.max(0,c.dy-30*dt);}c.stood=0;}}
 const ax=(I.R?1:0)-(I.L?1:0);s.vx+=ax*900*dt;if(!ax)s.vx*=s.on?.75:.95;s.vx=clamp(s.vx,-150,150);if(ax)s.face=ax;
 if(s.lock&&s.boss&&!s.boss.dead&&s.boss.hp<s.boss.max/2){s.gt-=dt;if(s.gt<=0&&!s.gust){s.gust={d:Math.random()<.5?-1:1,t:1,l:1.4};sfx('warn');}if(s.gust){s.gust.t-=dt;if(s.gust.t<=0){s.gust.l-=dt;if(s.gust.l<=0){s.gust=null;s.gt=5;}}}}
 if(s.gust&&s.gust.t<=0)s.px+=s.gust.d*95*dt;
 if(pressedA)s.jb=.15;else s.jb=(s.jb||0)-dt;if(s.on)s.co=.1,s.dj=0;else s.co=(s.co||0)-dt;
 if(s.jb>0&&s.co>0){s.vy=-340;s.on=false;s.jb=0;s.co=0;sfx('jump');}else if(s.jb>0&&!s.on&&UPG(9)&&!s.dj){s.dj=1;s.vy=-300;s.jb=0;sfx('jump');boomAt(s.booms,s.px,s.py,6,'#ffffff');}pressedA=false;
 let gr=(I.J&&s.vy<0?GRAV*.55:GRAV);const up=s.ups.find(u=>s.px>u.x&&s.px<u.x+u.w);if(up){s.vy=Math.max(-250,s.vy-1500*dt);gr=0;if(Math.random()<.3)s.booms.push({x:s.px+rnd(-12,12),y:s.py,vx:0,vy:-200,l:.4,c:'#ffffff'});}
 s.vy+=gr*dt;s.px+=s.vx*dt;if(s.lock)s.px=clamp(s.px,SKA-100,SKA+W-130);else s.px=Math.max(20,s.px);
 const ny=s.py+s.vy*dt;let land=null;if(s.vy>=0)for(const c of s.clouds){const cy=c.y+c.dy;if(s.px>c.x+4&&s.px<c.x+c.w-4&&s.py<=cy+2&&ny>=cy){land=c;break;}}
 if(land){s.py=land.y+land.dy;if(land.t==='bounce'){s.vy=-560;s.on=false;sfx('jump');boomAt(s.booms,s.px,s.py,6,'#ff9ad8');land.sq=.3;}else{s.vy=0;s.on=true;if(land.t==='drift')s.px+=land.ddx||0;if(land.t==='sink')land.stood=1;if(land.t!=='sink'&&land.t!=='drift'&&land.t!=='bounce')s.safe={x:clamp(s.px,land.x+24,land.x+land.w-24),y:s.py};}}else{s.py=ny;s.on=false;}
 if(s.py>SH+40){s.px=s.safe.x;s.py=s.safe.y-4;s.vx=s.vy=0;s.inv=1.5;if(!AUTO)s.hp=Math.max(1,s.hp-1);s.msgs.push({t:'COMET TO THE RESCUE!',l:1.6});sfx('pick');}
 for(const c of s.clouds)if(c.cp&&!c.cpOn&&s.px>c.x+20){c.cpOn=1;s.msgs.push({t:'CHECKPOINT',l:1.6});saveCP(9,c.x+20);sfx('pick');s.hp=Math.min(s.maxhp,s.hp+2);}
 s.cool-=dt;s.inv-=dt;s.run+=Math.abs(s.vx)*dt*.12;
 if(I.F&&s.cool<=0){const upS=I.U;s.shots.push({x:s.px+s.face*20,y:s.py-26,vx:upS?s.face*300:s.face*430,vy:upS?-300:0});s.cool=UPG(1)?.15:.2;s.shooting=.15;sfx('shot');}
 for(const b of s.shots){b.x+=b.vx*dt;b.y+=b.vy*dt;}s.shots=s.shots.filter(b=>Math.abs(b.x-s.px)<W&&b.y>-20&&!b.dead);
 // stage 2 hazards: gusts and lightning
 if(si===1&&!s.lock){s.gt-=dt;if(s.gt<=0&&!s.gust){s.gust={d:Math.random()<.6?-1:1,t:1.2,l:1.8};sfx('warn');}if(s.gust){s.gust.t-=dt;if(s.gust.t<=0){s.gust.l-=dt;if(s.gust.l<=0){s.gust=null;s.gt=4+Math.random()*2;}}}
  s.lt-=dt;if(s.lt<=0){s.lt=3.2;s.warn.push({x:s.px+rnd(-30,170),t:AUTO?.4:1});sfx('warn');}}else if(!s.lock)s.gust=null;
 for(const w of s.warn){w.t-=dt;if(w.t<=0&&!w.done){w.done=1;s.eshots.push({x:w.x,y:-10,vx:0,vy:s.lock?420:300,bolt:1,r:9});sfx('whoosh');}}s.warn=s.warn.filter(w=>!w.done);
 // friendly puffs
 for(const p of s.puffs){const c=s.clouds[p.c];p.y=c.y+c.dy;if(Math.abs(s.px-p.x)<120&&!p.said){p.said=1;p.say=['Hiii! Welcome to Puffville!','Watch out for the goons!','Want a cloud hug?','Ooh, a shiny ship!'][p.col+(p.c%2)];p.sl=3;}if(p.sl>0)p.sl-=dt;
  if(!p.hug&&Math.abs(s.px-p.x)<22&&Math.abs(s.py-p.y)<10){p.hug=1;s.hp=Math.min(s.maxhp,s.hp+2);s.msgs.push({t:'CLOUD HUG! +2 ENERGY',l:1.6});sfx('pick');p.say='Squeeeze!';p.sl=1.5;}}
 // goons
 for(const f of s.foes){if(f.dead)continue;const c=s.clouds[f.c];f.y=c.y+c.dy;const near=Math.abs(f.x-s.px)<W*.7;if(!near)continue;
  if(f.tell>0){f.tell-=dt;if(f.tell<=0){const a=Math.atan2(s.py-26-(f.y-22),s.px-f.x);s.eshots.push({x:f.x,y:f.y-22,vx:Math.cos(a)*170,vy:Math.sin(a)*170,r:6,orb:1});sfx('blip');}}
  else{f.x+=f.dir*30*dt;if(f.x<c.x+20||f.x>c.x+c.w-20)f.dir*=-1;f.at-=dt;if(f.at<=0){f.at=2.6;f.tell=AUTO?.3:.8;f.dir=s.px<f.x?-1:1;}}
  for(const b of s.shots)if(!b.dead&&Math.abs(b.x-f.x)<14&&Math.abs(b.y-(f.y-18))<20){b.dead=1;f.hp--;f.hit=.1;sfx('hit');if(f.hp<=0){f.dead=1;score+=150;boomAt(s.booms,f.x,f.y-18,14);sfx('boom');}}
  if(f.hit>0)f.hit-=dt;if(Math.abs(s.px-f.x)<16&&Math.abs(s.py-f.y)<30)skHurt(1);}
 // enemy shots (all blastable)
 for(const e of s.eshots){e.x+=e.vx*dt;e.y+=e.vy*dt;for(const b of s.shots)if(!b.dead&&Math.hypot(b.x-e.x,b.y-e.y)<(e.r||6)+8){b.dead=1;e.dead=1;score+=10;boomAt(s.booms,e.x,e.y,8,e.bolt?'#ffe066':'#c08aff');sfx('hit');break;}
  if(!e.dead&&Math.abs(e.x-s.px)<12+(e.r||6)*.5&&Math.abs(e.y-(s.py-22))<22){e.dead=1;skHurt(1);}}
 s.eshots=s.eshots.filter(e=>!e.dead&&e.y<SH+30&&e.y>-60&&Math.abs(e.x-s.px)<W*1.2);
 // gems + Comet
 const cm=s.comet;let tg=s.gems.find(q=>!q.got&&q.x>s.px-60&&q.x<s.px+420);const tx=tg?tg.x+20:s.px+70*s.face,ty=clamp(tg?tg.y-34:s.py-80,72,SH-90);cm.x+=(tx-cm.x)*Math.min(1,dt*2.2);cm.y+=(ty-cm.y)*Math.min(1,dt*2.2);
 if(tg&&!tg.seen&&Math.hypot(cm.x-tg.x,cm.y-tg.y)<70){tg.seen=1;cm.say='BEEP! GEM!';cm.sl=2;sfx('blip');}if(cm.sl>0)cm.sl-=dt;
 for(const q of s.gems)if(!q.got&&Math.abs(q.x-s.px)<20&&Math.abs(q.y-(s.py-20))<28){q.got=1;gotGem(9,q.i,s.msgs);}
 // boss
 if(!s.lock&&s.px>SKA+60){s.lock=true;s.boss={x:SKA+300,y:140,hp:AUTO?6:110,max:AUTO?6:110,t:0,ft:2,fist:0,rt:6,dip:0,dt:8,hit:0};s.msgs.push({t:'STORM KING GRUMBULUS!',l:2.4});s.tip={t:'Hold ▲ while firing to aim up. Blast the thunderbolts!',l:5};startMusic('boss');s.cam=SKA-120;}
 if(s.boss)skBoss(s.boss,dt);
 const tc=s.lock?SKA-120:Math.max(0,s.px-W*.35);s.cam+=(tc-s.cam)*Math.min(1,dt*6);
 for(const b of s.booms){b.x+=b.vx*dt;b.y+=b.vy*dt;b.l-=dt;}s.booms=s.booms.filter(b=>b.l>0);
 for(const m of s.msgs)m.l-=dt;s.msgs=s.msgs.filter(m=>m.l>0);if(s.tip&&(s.tip.l-=dt)<=0)s.tip=null;}
function skBoss(B,dt){const s=SK,p2=B.hp<B.max/2;B.t+=dt;if(B.dead){B.dt2=(B.dt2||0)+dt;if(B.dt2>2.2&&!s.done){s.done=1;completeMission(9);}return;}
 B.dt-=dt;if(B.dt<=0&&!B.dip){B.dip=3.6;B.dt=p2?7:9;s.msgs.push({t:'IT\'S OUT OF BREATH! BLAST ITS FACE!',l:2});sfx('warn');}
 const ty=B.dip>0?210:140+Math.sin(B.t*.8)*14;B.y+=(ty-B.y)*Math.min(1,dt*2);B.x=SKA+300+Math.sin(B.t*.5)*45;if(B.dip>0)B.dip-=dt;else B.dip=0;
 if(!B.dip){B.ft-=dt;if(B.ft<=0&&!B.fist){B.fist=AUTO?.25:.7;sfx('blip');}if(B.fist>0){B.fist-=dt;if(B.fist<=0){B.fist=0;B.ft=p2?1.4:2;const a=Math.atan2(s.py-26-B.y,s.px-(B.x-60));for(const k of p2?[-.18,.18]:[0])s.eshots.push({x:B.x-60,y:B.y+10,vx:Math.cos(a+k)*200,vy:Math.sin(a+k)*200,bolt:1,r:9});sfx('whoosh');}}
  B.rt-=dt;if(B.rt<=0){B.rt=p2?5:7;for(let i=0;i<(p2?3:2);i++)s.warn.push({x:SKA-90+rnd(0,560),t:AUTO?.4:1.1});sfx('warn');}}
 for(const w of s.warn){}
 for(const b of s.shots)if(!b.dead&&Math.abs(b.x-B.x)<55&&Math.abs(b.y-B.y)<38){b.dead=1;B.hp-=B.dip?3:1;B.hit=.1;sfx('hit');if(B.hp<=0){B.dead=1;s.eshots=[];s.warn=[];score+=3000;for(let i=0;i<5;i++)boomAt(s.booms,B.x+rnd(-60,60),B.y+rnd(-30,30),18,'#ffe066');sfx('bigboom');SHAKE=.6;s.msgs.push({t:'GRUMBULUS IS BLOWN AWAY!',l:3});}}
 if(B.hit>0)B.hit-=dt;}
// ---- sky drawing ----
function skPuffy(x,y,w,h,fill,ol=OL){g.fillStyle=ol;const n=Math.max(3,w/34|0);for(let i=0;i<n;i++){const cx=x+w*(i+.5)/n;g.beginPath();g.ellipse(cx,y-h*.15-(i%2)*h*.2,w/n*.75+3,h*.6+3,0,0,TAU);g.fill();}g.beginPath();g.roundRect(x-3,y-h*.45-3,w+6,h*.9+6,h*.45);g.fill();
 g.fillStyle=fill;for(let i=0;i<n;i++){const cx=x+w*(i+.5)/n;g.beginPath();g.ellipse(cx,y-h*.15-(i%2)*h*.2,w/n*.75,h*.6,0,0,TAU);g.fill();}g.beginPath();g.roundRect(x,y-h*.45,w,h*.9,h*.45);g.fill();
 g.fillStyle='rgba(255,255,255,.55)';for(let i=0;i<n;i++){const cx=x+w*(i+.5)/n-w/n*.2;g.beginPath();g.ellipse(cx,y-h*.35-(i%2)*h*.2,w/n*.3,h*.18,0,0,TAU);g.fill();}}
function skBg(s){const k=clamp(s.px/SKA,0,1);g.fillStyle=lg(g,0,0,0,H,s.stI===1&&!s.lock?['#3a2a5a','#7a5a7a','#c08a6a']:['#f0a860','#f6d09a','#e89a5a']);g.fillRect(0,0,W,H);
 // bands
 for(let i=0;i<5;i++){g.fillStyle=['rgba(200,110,60,.25)','rgba(255,240,210,.25)','rgba(170,80,40,.2)','rgba(255,220,170,.2)','rgba(190,100,60,.2)'][i];g.fillRect(0,40+i*58+Math.sin(T*.2+i)*4,W,26);}
 // red storm grows toward the boss
 const rx=W-120-k*80,ry=110,rr=30+k*70;g.save();g.globalAlpha=.85;g.fillStyle='#b8402a';g.beginPath();g.ellipse(rx,ry,rr*1.6,rr*.8,0,0,TAU);g.fill();g.strokeStyle='rgba(255,180,140,.6)';g.lineWidth=3;for(let j=0;j<3;j++){g.beginPath();g.ellipse(rx,ry,rr*1.6*(1-j*.28),rr*.8*(1-j*.28),0,T*.3+j,T*.3+j+4);g.stroke();}g.restore();
 for(let L=0;L<2;L++){const z=L?.35:.15,n=7;for(let i=0;i<n;i++){const x=((i*173+L*80-s.cam*z)%(W+260)+W+260)%(W+260)-130;skPuffy(x,L?150+(i%3)*20:90+(i%2)*30,L?110:70,L?30:20,L?'rgba(255,236,210,.35)':'rgba(255,226,190,.25)','rgba(120,60,40,.12)');}}
 if(s.stI===1&&!s.lock){g.fillStyle='rgba(40,20,60,.25)';g.fillRect(0,0,W,H);}g.fillStyle=lg(g,0,H-90,0,H,['rgba(160,80,50,0)','rgba(120,50,40,.55)']);g.fillRect(0,H-90,W,90);}
function skCloudDraw(c,X){const y=c.y+c.dy,sq=c.sq>0?(c.sq-=DT,1+c.sq*.4):1;
 if(c.t==='city'){skPuffy(X,y+12,c.w,30,'#fff8ee');for(let i=0;i<c.hs;i++){const hx=X+24+i*(c.w-48)/Math.max(1,c.hs),hw=30;g.fillStyle=OL;g.fillRect(hx-2,y-34,hw+4,32);g.fillStyle=['#7ab8ff','#ffb07a','#b08aff'][i%3];g.fillRect(hx,y-32,hw,30);g.fillStyle=OL;g.beginPath();g.arc(hx+hw/2,y-32,hw/2+2,Math.PI,TAU);g.fill();g.fillStyle=['#3a6ad0','#d06a3a','#7a4ad0'][i%3];g.beginPath();g.arc(hx+hw/2,y-32,hw/2,Math.PI,TAU);g.fill();g.fillStyle='#ffe08a';g.fillRect(hx+hw/2-4,y-20,8,10);}return;}
 const col=c.t==='sink'?'#c8d0e8':c.t==='bounce'?'#ffc0e0':'#ffffff';g.save();g.translate(X+c.w/2,y);g.scale(1/sq,sq);skPuffy(-c.w/2,10,c.w,26,col);g.restore();
 if(c.t==='bounce'){g.strokeStyle='#d0408a';g.lineWidth=2;g.beginPath();for(let i=0;i<4;i++)g.arc(X+c.w/2,y+6,4+i*3,Math.PI*1.1,Math.PI*1.9);g.stroke();}
 if(c.t==='sink'&&c.dy>2){g.fillStyle='rgba(60,70,110,.6)';for(let i=0;i<3;i++)g.fillRect(X+c.w*(.25+i*.25),y+22+((T*40+i*7)%10),2,6);}
 if(c.t==='drift'){g.strokeStyle='rgba(255,255,255,.7)';g.lineWidth=2;for(let i=0;i<2;i++){g.beginPath();g.moveTo(X-8-i*6,y+i*8);g.lineTo(X-22-i*6,y+i*8);g.stroke();}}
 if(c.cp){g.fillStyle=OL;g.fillRect(X+20,y-40,4,40);g.fillStyle=c.cpOn?'#5fe36a':'#ffc53d';g.beginPath();g.moveTo(X+24,y-40);g.lineTo(X+44,y-33);g.lineTo(X+24,y-26);g.fill();}}
function skPuffDraw(p,X){const y=p.y-14+Math.sin(T*3+p.c)*2,cl=['#ffffff','#ffe0f0','#e0f0ff'][p.col];skPuffy(X-16,y,32,20,cl);circ(X-5,y-4,3,OL);circ(X+5,y-4,3,OL);circ(X-4,y-5,1,'#fff');circ(X+6,y-5,1,'#fff');g.fillStyle='rgba(255,120,150,.5)';circ(X-10,y+2,3,'rgba(255,120,150,.5)');circ(X+10,y+2,3,'rgba(255,120,150,.5)');
 g.strokeStyle=OL;g.lineWidth=1.6;g.beginPath();g.arc(X,y+1,3.5,.2,Math.PI-.2);g.stroke();if(p.sl>0&&p.say){setF(9);const w=Math.min(170,g.measureText(p.say).width+18);rr(X-w/2,y-46,w,22,8,'#fff',OL);txt(p.say,X,y-35,9,'#2a2040');}}
function skGoonDraw(f,X){const y=f.y,tel=f.tell>0;g.save();g.translate(X,y);if(f.hit>0)g.globalAlpha=.6;g.fillStyle=OL;g.beginPath();g.ellipse(0,-16,13,17,0,0,TAU);g.fill();g.fillStyle='#4a2a7a';g.beginPath();g.ellipse(0,-16,11,15,0,0,TAU);g.fill();
 g.fillStyle=OL;g.beginPath();g.moveTo(-12,-26);g.lineTo(-6,-44);g.lineTo(0,-30);g.lineTo(6,-44);g.lineTo(12,-26);g.fill();g.fillStyle='#9a5aff';g.beginPath();g.moveTo(-10,-27);g.lineTo(-6,-40);g.lineTo(0,-29);g.lineTo(6,-40);g.lineTo(10,-27);g.fill();
 g.fillStyle=tel?'#ff4f7b':'#ff9af0';g.fillRect(-8,-24,16,5);g.fillStyle=OL;g.fillRect(-9,-2,7,4);g.fillRect(2,-2,7,4);g.restore();if(tel){dglow(X,y-22,18,'#c08aff',.7);txt('!',X,y-54,14,'#ff4f7b');}}
function skBossDraw(B,X){const tel=B.fist>0,dip=B.dip>0;g.save();g.translate(X,B.y);if(B.dead){g.globalAlpha=Math.max(0,1-(B.dt2||0)/2);g.translate(0,-(B.dt2||0)*60);}
 const im=IMG.spr_stormking;dglow(0,0,110,dip?'#ffe066':'#8a6aff',.25);skPuffy(-95,20,190,70,B.hit>0?'#ffffff':'#7a7090','#1a1030');skPuffy(-70,-20,140,50,B.hit>0?'#ffffff':'#8a80a0','#1a1030');
 // face
 const ey=-8,blink=dip?1:0;g.strokeStyle=OL;g.lineWidth=3;for(const sx of[-1,1]){g.fillStyle='#ffe066';g.beginPath();g.ellipse(sx*26,ey,13,dip?6:11,0,0,TAU);g.fill();g.stroke();circ(sx*26-4,ey+1,4,OL);}
 g.strokeStyle=OL;g.lineWidth=5;g.beginPath();g.moveTo(-42,ey-18);g.lineTo(-14,ey-10);g.moveTo(42,ey-18);g.lineTo(14,ey-10);g.stroke();
 g.fillStyle='#2a1030';g.beginPath();if(dip){g.ellipse(0,26,16,12,0,0,TAU);}else{g.moveTo(-26,30);g.quadraticCurveTo(0,14,26,30);g.quadraticCurveTo(0,22,-26,30);}g.fill();g.stroke();
 if(dip){txt('HUFF... PUFF...',0,-62,11,'#ffe066');}
 // fists
 for(const sx of[-1,1]){const fx=sx*110,fy=20+Math.sin(B.t*3+sx)*6;skPuffy(fx-22,fy,44,30,'#8a80a0','#1a1030');if(tel&&sx<0){dglow(fx,fy,30,'#ffe066',.8);g.strokeStyle='#ffe066';g.lineWidth=3;g.beginPath();g.moveTo(fx-10,fy-20);g.lineTo(fx,fy-8);g.lineTo(fx-6,fy-4);g.lineTo(fx+6,fy+10);g.stroke();}}
 g.restore();if(!B.dead){const bw=220;rr(W/2-bw/2-2,48,bw+4,12,5,OL);g.fillStyle='#ffe066';g.fillRect(W/2-bw/2,50,bw*Math.max(0,B.hp/B.max),8);txt('STORM KING GRUMBULUS',W/2,40,10,'#ffffff');}}
function skBolt(x,y,big){g.save();g.translate(x,y);dglow(0,0,16,'#ffe066',.8);g.fillStyle=OL;g.beginPath();g.moveTo(-5,-14);g.lineTo(7,-14);g.lineTo(1,-3);g.lineTo(8,-3);g.lineTo(-6,15);g.lineTo(-1,2);g.lineTo(-8,2);g.closePath();g.fill();g.fillStyle='#fff3a0';g.beginPath();g.moveTo(-3,-12);g.lineTo(5,-12);g.lineTo(-1,-2);g.lineTo(5,-2);g.lineTo(-4,11);g.lineTo(0,1);g.lineTo(-6,1);g.closePath();g.fill();g.restore();}
function drawSky(){const s=SK,cx=s.cam;skBg(s);
 for(const u of s.ups){const X=u.x-cx;if(X>W||X+u.w<0)continue;g.fillStyle='rgba(200,240,255,.16)';g.fillRect(X,0,u.w,H);g.strokeStyle='rgba(255,255,255,.55)';g.lineWidth=2;for(let i=0;i<5;i++){const lx=X+10+i*(u.w-20)/4,ly=H-((T*160+i*70)%(H+40));g.beginPath();g.moveTo(lx,ly);g.quadraticCurveTo(lx+8,ly-14,lx,ly-28);g.stroke();}txt('▲',X+u.w/2,H-70+Math.sin(T*6)*4,14,'#ffffff');}
 for(const c of s.clouds){const X=c.x-cx;if(X>W+20||X+c.w<-20)continue;skCloudDraw(c,X);}
 for(const p of s.puffs){const X=p.x-cx;if(X>-40&&X<W+40)skPuffDraw(p,X);}
 for(const f of s.foes)if(!f.dead){const X=f.x-cx;if(X>-30&&X<W+30)skGoonDraw(f,X);}
 for(const q of s.gems)if(!q.got){const X=q.x-cx;if(X<-20||X>W+20)continue;g.globalAlpha=q.seen?1:.3;gemShard(X,q.y,q.i,false,1);g.globalAlpha=1;}
 for(const w of s.warn){const X=w.x-cx,a=.5+.5*Math.sin(T*18);g.strokeStyle=`rgba(255,230,80,${.25+.4*a})`;g.lineWidth=14;g.setLineDash([10,10]);g.beginPath();g.moveTo(X,30);g.lineTo(X,H);g.stroke();g.setLineDash([]);skPuffy(X-26,26,52,22,'#6a6080','#1a1030');txt('⚡',X,56,14,'#ffe066');}
 if(s.boss)skBossDraw(s.boss,s.boss.x-cx);
 for(const e of s.eshots){const X=e.x-cx;if(e.bolt)skBolt(X,e.y);else{dglow(X,e.y,12,'#c08aff',.8);circ(X,e.y,e.r,'#e0c0ff',OL);}}
 for(const b of s.shots){const X=b.x-cx;dglow(X,b.y,10,'#7fffff',.9);g.fillStyle='#fff';g.beginPath();g.ellipse(X,b.y,7,3,Math.atan2(b.vy,b.vx),0,TAU);g.fill();}
 // Comet with jetpack
 {const c=s.comet,X=c.x-cx,Y=c.y+Math.sin(T*4)*3;dglow(X-14,Y+10,10,'#ffb040',.8);cometMini(X,Y,1.5);if(c.sl>0&&c.say){rr(X-42,Y-44,84,20,8,'#fff',OL);txt(c.say,X,Y-34,9,'#2a2040');}}
 const fl=s.inv>0&&(T*14|0)%2;if(!fl)captain(s.px-cx,s.py,CAPS[cap],{sc:.8,t:T,air:!s.on,vy:s.vy,run:Math.abs(s.vx)>20?s.run:0,face:s.face,shoot:s.shooting>0});s.shooting-=DT;
 for(const b of s.booms){g.globalAlpha=Math.min(1,b.l*2);circ(b.x-cx,b.y,3,b.c);}g.globalAlpha=1;
 if(s.gust){const a=s.gust.t>0?(T*8|0)%2:1;if(a)txt(s.gust.d<0?'◀◀ GUST! ◀◀':'▶▶ GUST! ▶▶',W/2,96,14,'#bfe8ff');g.strokeStyle='rgba(255,255,255,.5)';g.lineWidth=2;if(s.gust.t<=0)for(let i=0;i<8;i++){const y=60+i*34,x=((T*400*-s.gust.d+i*90)%W+W)%W;g.beginPath();g.moveTo(x,y);g.lineTo(x+40,y);g.stroke();}}
 // HUD
 hud(s.hp,s.maxhp);txt('◆ GEMS '+gemN(9)+'/5',W/2-150,30,9,'#ff9af0','left');
 if(!s.lock){const px=W/2-90,pw=180,k=clamp(s.px/SKA,0,1);rr(px,10,pw,8,4,'rgba(0,0,0,.4)',OL);g.fillStyle='#45d6ff';g.fillRect(px+2,12,(pw-4)*k,4);for(const st of SKS){circ(px+pw*st.b/SKA,14,3,'#ff4f7b',OL);}txt(SKS[Math.max(0,s.stI)].n,W/2,30,9,'#ffffff');}
 txt('SCORE '+score,W-12,46,10,'#ffffff','right');
 for(let i=0;i<s.msgs.length&&i<2;i++){const m=s.msgs[s.msgs.length-1-i];txt(m.t,W/2,76+i*20,13,'#ffe066');}
 if(s.tip){setF(10);const w=Math.min(420,g.measureText(s.tip.t).width+24);rr(W/2-w/2,112,w,24,8,'rgba(10,8,30,.7)','#45d6ff');fitTxt(s.tip.t,W/2,124,10,w-16,'#ffffff');}
 controls(false);if(showTouch){const u=btns().up;if(u){g.globalAlpha=.62;circ(u.x,u.y,u.r,held('up')?'#2a8ab8':'#141c4a',OL);g.globalAlpha=.92;txt('▲',u.x,u.y,u.r*.45,'#ffffff');g.globalAlpha=1;}}}

window.GR={get sp(){return sp},get SK(){return SK},playB:(n,i)=>{playComic(n==="MAP"?mapBeats(i):{OPENING,JUPGO,JUPWIN,COMIC}[n],()=>{});if(n!=="MAP"&&i)comicI=i;},get gover(){return !!GOVER},dbg:()=>{try{drawBug();const m=g.getTransform();return "ok "+g.globalCompositeOperation+" a="+g.globalAlpha+" t="+[m.a,m.d,m.e,m.f].map(v=>v.toFixed(2))+" fs="+g.fillStyle+" f="+g.filter}catch(e){return e.message+" | "+e.stack.split("\n").slice(0,3).join(" ")}},vk:VK,mus:()=>wantTheme&&wantTheme.join(":"),ct:()=>CT,m:()=>M,wave:p=>spawnWave(p),raw:n=>({COMIC,INTER1,MOONWIN,MARSGO,MARSLAND,MARSWIN,MARSARR,COMETWIN,PHOBOSLAND,BELTGO,VESTAARR,PRISONARR,VESTALAND,GOLEMCUT,PEAKWIN})[n],bug:k=>{mission=7;CT=k!=null?{retry:k}:null;go('cart');},who:(q,b)=>whoOf(q,b),get C(){return CT},cart:k=>{mission=5;CT=k!=null?{retry:k}:null;go('cart');},boss:t=>spawnBoss(t),pc:(n,i)=>{playComic({COMIC,INTER1,MOONWIN,MARSGO,MARSLAND,MARSWIN,MARSARR,COMETWIN,PHOBOSLAND,BELTGO,VESTAARR,PRISONARR,VESTALAND,GOLEMCUT,PEAKWIN}[n],()=>{});comicI=i||0;},beats:n=>splitB({COMIC,INTER1,MOONWIN,MARSGO,MARSLAND,MARSWIN,MARSARR,COMETWIN,PHOBOSLAND,BELTGO,VESTAARR,PRISONARR,VESTALAND,GOLEMCUT,PEAKWIN}[n]).length,shard:l=>shardMoment(l,()=>{}),openPause:()=>openPause(),comicJump:i=>{comicI=i;comicT=0;},get SHM(){return SHM},get SHARDS(){return SHARDS},startMission:n=>startMission(n),play:a=>playComic(a==='MOONWIN'?MOONWIN:INTER1,()=>go('victory')),mz:moonZone,get pm(){return !!PAUSEM},get GEMS(){return GEMS},get CRY(){return CRY},state:S,go,get M(){return M},get sp(){return sp},setCap:i=>cap=i,get comicI(){return comicI},VK,unlocked,get t(){return stateT},flashSaved:()=>{SAVET=1.8;},setGO:()=>{GOVER=()=>{};GOT=1;}};
comicArt();go('title');requestAnimationFrame(frame);
})();
