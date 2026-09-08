window.N2=window.N2||{};
(()=>{
const {W,H,T}=N2.CFG;
const $=s=>document.querySelector(s);
const canvas=$('#game'),ctx=canvas.getContext('2d');ctx.imageSmoothingEnabled=false;
N2.ctx=ctx;N2.$=$;
N2.fresh=()=>({lang:N2.lang,map:N2.START.map,x:N2.START.x,y:N2.START.y,dir:N2.START.dir,hearts:3,quest:'count',inventory:[],flags:{introDone:false},abilities:{swim:false,dive:false,climb:false},diving:false,partner:null,finished:false});
N2.state=N2.fresh();
const C={ink:'#17211e',skin:'#f1c6a4',hijab:'#11181a',card:'#c6aa85',shirt:'#f7f1e8',denim:'#314b5c',bag:'#7d3e49',white:'#fff8df',blue:'#75c7ee'};
function R(x,y,w,h,c){ctx.fillStyle=c;ctx.fillRect(Math.round(x),Math.round(y),Math.round(w),Math.round(h))}N2.R=R;
function area(){return N2.MAPS[N2.state.map]}N2.area=area;
function rectHas(rect,x,y){return x>=rect[0]&&x<rect[0]+rect[2]&&y>=rect[1]&&y<rect[1]+rect[3]}
function inRects(rects,x,y){return (rects||[]).some(r=>rectHas(r,x,y))}
function inWaterAt(map,x,y){return inRects(map.water,x,y)}
function inDeepAt(map,x,y){return inRects(map.deep,x,y)}
N2.inWater=()=>inWaterAt(area(),N2.state.x,N2.state.y);
N2.inDeep=()=>inDeepAt(area(),N2.state.x,N2.state.y);
function objVisible(o){if(N2.state.flags['done:'+o.id])return false;if(o.hideFlag&&N2.state.flags[o.hideFlag])return false;if(o.showFlag&&!N2.state.flags[o.showFlag])return false;return true}N2.objVisible=objVisible;
function blocked(x,y){
 const m=area();
 if(x<0||y<0||x>=W||y>=H)return true;
 if(inWaterAt(m,x,y)){
   if(!N2.state.abilities.swim)return true;
   if(inDeepAt(m,x,y)&&(!N2.state.abilities.dive||!N2.state.diving))return true;
 }
 if((m.walls||[]).some(r=>rectHas(r,x,y)))return true;
 if((m.npcs||[]).some(n=>n.x===x&&n.y===y&&!(N2.state.partner&&n.id==='abdullah')))return true;
 if((m.objects||[]).some(o=>objVisible(o)&&o.x===x&&o.y===y&&['chest','lever','star','bed','bowl','sign'].includes(o.type)))return true;
 return false;
}N2.blocked=blocked;
function gateOkay(w){
 const f=N2.state.flags,a=N2.state.abilities;
 if(!w.gate)return true;
 if(w.gate==='flood1'&&!f.flood1){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Slussen öppnade en väg, men jag har inte aktiverat den än.':'The floodgate should open this route, but I have not activated it yet.']]);return false}
 if(w.gate==='dive'&&!a.dive){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Den gången är helt under vatten. Jag behöver ett sätt att dyka.':'That passage is completely submerged. I need a way to dive.']]);return false}
 if(w.gate==='swim'&&!f.swimLessonDone){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Jag borde klara Samis simlektion innan jag försöker korsa floden.':'I should finish Sami’s swimming lesson before trying to cross the river.']]);return false}
 if(w.gate==='grottoPass'&&(!f.flood2||!a.dive)){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Jag behöver aktivera den andra slussen och kunna dyka innan jag tar den här tunneln.':'I need the second floodgate active and a way to dive before taking this tunnel.']]);return false}
 if(w.gate==='star'&&!f.starSeen){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Jag borde undersöka stjärnemblemet först.':'I should inspect the star emblem first.']]);return false}
 return true;
}
function followerStep(px,py,pmap){if(!N2.state.partner)return;N2.state.partner.x=px;N2.state.partner.y=py;N2.state.partner.map=pmap}
function followerWarp(){if(!N2.state.partner)return;let x=N2.state.x-1,y=N2.state.y;if(blocked(x,y)){x=N2.state.x;y=N2.state.y+1}N2.state.partner.x=Math.max(1,Math.min(W-2,x));N2.state.partner.y=Math.max(1,Math.min(H-2,y));N2.state.partner.map=N2.state.map}
N2.move=function(dx,dy,dir){
 if(!$('#dialog').classList.contains('hidden')||!$('#inventoryPanel').classList.contains('hidden')||!$('#titleOverlay').classList.contains('hidden'))return;
 const s=N2.state,m=area(),px=s.x,py=s.y,pmap=s.map; s.dir=dir;
 const nx=s.x+dx,ny=s.y+dy;
 const warp=(m.warps||[]).find(w=>w.x===nx&&w.y===ny);
 if(warp){if(!gateOkay(warp))return;s.map=warp.to;s.x=warp.tx;s.y=warp.ty;s.diving=false;followerWarp();N2.onEnter?.(warp.to);N2.save();N2.draw();N2.sfx('step');return}
 if(!blocked(nx,ny)){s.x=nx;s.y=ny;followerStep(px,py,pmap);N2.draw();N2.sfx('step')}
};
N2.target=function(){const s=N2.state,d=s.dir;return d==='up'?[s.x,s.y-1]:d==='down'?[s.x,s.y+1]:d==='left'?[s.x-1,s.y]:[s.x+1,s.y]};

// ---------- Rendering ----------
function drawWater(m){
 (m.water||[]).forEach(r=>{for(let y=r[1];y<r[1]+r[3];y++)for(let x=r[0];x<r[0]+r[2];x++){const deep=inDeepAt(m,x,y);R(x*T,y*T,T,T,deep?'#377faa':'#64b6e5');R(x*T,y*T,T,4,deep?'#2f6689':'#4a94c2');if((x+y)%2===0)R(x*T+7,y*T+14,16,3,deep?'#65abd0':'#a4e4ff')}})
}
function drawPaths(m){
 if(!['field','rainTown','riverbank'].includes(m.theme))return;
 const path=m.theme==='rainTown'?'#c5d4c3':'#dcecd0';
 const cx=10,cy=7;R((cx-1)*T,(cy-1)*T,T*3,T*3,path);
 (m.warps||[]).forEach(w=>{if(w.x<=1||w.x>=18){const a=Math.min(cx,w.x),b=Math.max(cx,w.x);R(a*T,(cy-1)*T,(b-a+1)*T,T*3,path);R((w.x-1)*T,Math.min(cy,w.y)*T,T*3,(Math.abs(w.y-cy)+1)*T,path)}else{R((cx-1)*T,Math.min(cy,w.y)*T,T*3,(Math.abs(w.y-cy)+1)*T,path);R(Math.min(cx,w.x)*T,(w.y-1)*T,(Math.abs(w.x-cx)+1)*T,T*3,path)}})
}
function drawWalls(m){
 (m.walls||[]).forEach((b,bi)=>{for(let y=b[1];y<b[1]+b[3];y++)for(let x=b[0];x<b[0]+b[2];x++){
  const px=x*T,py=y*T,edge=x===0||y===0||x===W-1||y===H-1;
  if(edge&&['field','rainTown','riverbank'].includes(m.theme))continue;
  if(m.theme==='room'){R(px,py,T,T,'#7c6b58');R(px+3,py+3,T-6,T-6,'#d6c7aa')}
  else if(m.theme==='rainTown'){R(px+2,py+10,T-4,T-10,'#f3e6b5');R(px,py,T,11,bi%2?'#db6b62':'#df9c5c');R(px+8,py+17,7,7,'#91d4f3')}
  else if(m.theme==='field'||m.theme==='riverbank'){R(px+12,py+15,8,17,'#6b5440');R(px+3,py+5,27,19,'#70ad68');R(px+8,py,18,13,'#82bd73')}
  else {R(px,py,T,T,'#394b4d');R(px+4,py+4,T-8,T-8,'#627778');R(px+8,py+8,6,4,'#8da7a4')}
 }})
}
function drawDecor(m){
 if(m.theme==='field'||m.theme==='riverbank'||m.theme==='rainTown'){
   for(let i=0;i<16;i++){const x=(i*127+45)%610,y=(i*83+52)%430;if(i%4===0){R(x,y,4,11,'#6fa462');R(x+6,y+3,4,8,'#6fa462')}else if(i%7===0){R(x,y,5,5,'#ef7692');R(x+6,y+3,5,5,'#f3d36d')}}
 }
 if(m.theme==='rainTown'){ctx.strokeStyle='rgba(195,226,244,.55)';ctx.lineWidth=2;for(let i=0;i<28;i++){const x=(i*71)%640,y=(i*37)%480;ctx.beginPath();ctx.moveTo(x,y);ctx.lineTo(x-5,y+12);ctx.stroke()}}
 if(m.theme==='star'){R(112,68,416,282,'#53676e');ctx.strokeStyle='#c8b16f';ctx.lineWidth=3;ctx.strokeRect(112,68,416,282);for(let i=0;i<5;i++){const a=-Math.PI/2+i*Math.PI*2/5;const x=320+Math.cos(a)*120,y=205+Math.sin(a)*90;R(x-8,y-8,16,16,'#b9d4ce')}}
}
function drawWarpMarkers(m){(m.warps||[]).forEach(w=>{const px=w.x*T,py=w.y*T,edge=w.x===0||w.x===19||w.y===0||w.y===14;if(!edge){R(px+5,py+20,22,7,'#f4dca0');return}const c='#fff2b9',d='#56635d';if(w.x===0){R(0,py+8,24,16,c);R(5,py+13,12,6,d)}else if(w.x===19){R(px+8,py+8,24,16,c);R(px+15,py+13,12,6,d)}else if(w.y===0){R(px+8,0,16,24,c);R(px+13,5,6,12,d)}else{R(px+8,py+8,16,24,c);R(px+13,py+15,6,12,d)}})}
function drawObject(o){const px=o.x*T,py=o.y*T;switch(o.type){
 case'paws':for(let i=0;i<3;i++){R(px+6+i*7,py+14+(i%2)*4,4,5,'#5e625c');R(px+5+i*7,py+11+(i%2)*4,2,2,'#5e625c')}break;
 case'sparkle':R(px+14,py+8,4,16,'#fff0a5');R(px+8,py+14,16,4,'#fff0a5');break;
 case'herb':R(px+14,py+12,4,13,'#4d8e59');R(px+8,py+12,8,5,'#7ab66d');R(px+17,py+9,8,6,'#7ab66d');break;
 case'stones':R(px+5,py+18,7,5,'#f1f2e8');R(px+14,py+14,8,6,'#f1f2e8');R(px+23,py+19,6,4,'#f1f2e8');break;
 case'sign':R(px+14,py+12,5,18,'#7b5d42');R(px+5,py+5,22,14,'#f0e7bf');R(px+8,py+9,16,3,'#695d4e');break;
 case'buoy':R(px+11,py+9,10,14,'#ef7f64');R(px+10,py+13,12,4,'#fff2cf');break;
 case'foam':R(px+3,py+13,12,3,'#c7efff');R(px+17,py+20,10,3,'#c7efff');break;
 case'lever':R(px+9,py+8,14,18,'#707d7d');R(px+15,py+2,4,13,'#d4c078');R(px+13,py+1,8,5,'#df8b67');break;
 case'chest':R(px+5,py+10,22,16,'#9f7850');R(px+5,py+8,22,7,'#c49a67');R(px+14,py+13,5,5,'#e7cf7a');break;
 case'star':ctx.strokeStyle='#d8c378';ctx.lineWidth=4;ctx.beginPath();for(let i=0;i<6;i++){const a=-Math.PI/2+i*Math.PI*4/5,x=px+16+Math.cos(a)*12,y=py+16+Math.sin(a)*12;i?ctx.lineTo(x,y):ctx.moveTo(x,y)}ctx.stroke();break;
 case'crystal':R(px+13,py+4,7,22,'#a9e9ff');R(px+8,py+10,17,10,'#79cdec');break;
 case'exit':R(px+4,py+3,24,26,'#dff6ff');R(px+8,py+7,16,18,'#fffceb');break;
 case'kitten':drawKitten(px+4,py+4);break;
 case'bowl':R(px+7,py+17,18,7,'#d6675b');R(px+10,py+14,12,5,'#f0dfbd');break;
 case'bed':R(px+2,py+4,28,25,'#ece5d6');R(px+4,py+6,24,7,'#fff8eb');R(px+4,py+14,24,13,'#8a8782');break;
 }}
function drawAya(px,py,dir,swimming=false,diving=false){
 const r=(x,y,w,h,c)=>R(px+x,py+y,w,h,c);R(px+7,py+27,20,3,'rgba(0,0,0,.2)');
 if(swimming){R(px+2,py+21,28,5,diving?'#3e8ab5':'#8ed9f4');r(7,11,18,9,C.card);r(8,2,17,12,C.hijab);r(12,6,10,8,C.skin);r(18,7,3,3,C.hijab);r(4,16,8,4,C.skin);r(23,16,8,4,C.skin);if(diving){R(px+11,py+6,13,5,'#aeeaff');R(px+17,py+8,4,2,'#315a6b');R(px+28,py+10,3,3,'#c7efff')}return}
 r(7,13,17,12,C.card);r(10,15,11,9,C.shirt);r(8,23,6,6,C.denim);r(18,23,6,6,C.denim);r(7,28,7,3,'#272a2d');r(18,28,7,3,'#272a2d');
 if(dir==='up'){r(7,2,18,13,C.hijab);r(10,1,12,5,C.hijab);r(9,13,4,9,C.card);r(21,13,4,9,C.card)}
 else if(dir==='left'){r(8,2,17,13,C.hijab);r(7,6,9,8,C.skin);r(5,9,3,3,C.skin);r(10,8,3,3,C.hijab);r(5,14,4,9,C.card);r(12,13,3,10,C.bag)}
 else if(dir==='right'){r(7,2,17,13,C.hijab);r(16,6,9,8,C.skin);r(24,9,3,3,C.skin);r(19,8,3,3,C.hijab);r(23,14,4,9,C.card);r(17,13,3,10,C.bag)}
 else{r(7,2,18,13,C.hijab);r(11,6,10,8,C.skin);r(12,8,3,3,C.hijab);r(18,8,3,3,C.hijab);r(6,14,4,9,C.card);r(23,14,4,9,C.card);r(9,13,3,10,C.bag)}
}
function drawNamosh(px,py,s=1){const r=(x,y,w,h,c)=>R(px+x*s,py+y*s,w*s,h*s,c);r(4,11,20,12,'#f5f2e8');r(7,3,16,13,'#1b2020');r(6,1,6,6,'#1b2020');r(18,1,6,6,'#1b2020');r(11,8,9,7,'#f5f2e8');r(13,10,3,3,'#1b2020');r(18,10,3,3,'#1b2020');r(13,14,6,2,'#d9908b');r(4,20,7,7,'#f5f2e8');r(18,20,7,7,'#f5f2e8');r(9,15,12,7,'#1b2020')}
function drawKitten(px,py){R(px+6,py+7,15,11,'#f5f2e8');R(px+8,py+2,12,9,'#202526');R(px+7,py,5,5,'#202526');R(px+17,py,5,5,'#202526');R(px+10,py+14,5,7,'#202526');R(px+17,py+15,5,6,'#f5f2e8')}
function drawNpc(px,py,look){if(look==='cat'){drawNamosh(px,py);return}const skin='#d7aa8b';R(px+7,py+27,19,3,'rgba(0,0,0,.2)');let cloth='#567765',hair='#2d3231';if(look==='girl')cloth='#9f647f';if(look==='oldwoman')cloth='#76627b';if(look==='fisher')cloth='#527889';if(look==='abdullah'){cloth='#315f4e';hair='#182226'}R(px+8,py+13,17,12,cloth);R(px+11,py+6,11,9,skin);R(px+8,py+2,17,7,hair);R(px+9,py+24,6,6,'#354c5c');R(px+19,py+24,6,6,'#354c5c');if(look==='abdullah'){R(px+9,py+13,3,11,'#c06d36');R(px+19,py+18,7,6,'#d88645')}}
N2.draw=function(){
 const s=N2.state,m=area();R(0,0,640,480,m.ground);drawPaths(m);drawWater(m);drawDecor(m);drawWalls(m);drawWarpMarkers(m);
 (m.objects||[]).filter(objVisible).forEach(drawObject);
 (m.npcs||[]).forEach(n=>{if(s.partner&&n.id==='abdullah')return;drawNpc(n.x*T,n.y*T,n.look)});
 if(s.partner&&s.partner.map===s.map)drawNpc(s.partner.x*T,s.partner.y*T,'abdullah');
 drawAya(s.x*T,s.y*T,s.dir,inWaterAt(m,s.x,s.y),s.diving);
 $('#areaName').textContent=N2.t('areas.'+m.area);$('#questText').textContent=N2.t('quests.'+s.quest);$('#hearts').textContent='♥'.repeat(s.hearts);const ab=[];if(s.abilities.swim)ab.push(N2.t('ui.swim'));if(s.abilities.dive)ab.push(N2.t('ui.dive'));if(s.abilities.climb)ab.push(N2.t('ui.climb'));$('#abilityText').textContent=ab.join(' · ');
};

// ---------- Dialog ----------
let q=[],done=null;
N2.dialog=function(rows,cb){q=[...rows];done=cb||null;$('#dialog').classList.remove('hidden');N2.nextDialog()};
N2.nextDialog=function(){if(q.length){const [sp,tx]=q.shift();$('#speaker').textContent=sp;$('#dialogText').textContent=tx}else{$('#dialog').classList.add('hidden');const cb=done;done=null;if(cb)cb();N2.draw()}};

// ---------- Inventory / save ----------
N2.addItem=function(key){if(!N2.state.inventory.includes(key))N2.state.inventory.push(key);N2.renderInventory();N2.save()};
N2.renderInventory=function(){const box=$('#inventoryList');box.innerHTML='';N2.state.inventory.forEach(k=>{const [n,d]=N2.t('items.'+k);const el=document.createElement('div');el.className='item';el.innerHTML=`<strong>${n}</strong><span>${d}</span>`;box.appendChild(el)});if(!N2.state.inventory.length)box.textContent=N2.lang==='sv'?'Väskan är tom.':'The satchel is empty.';$('#invTitle').textContent=N2.t('ui.satchel');$('#closeInventory').textContent=N2.t('ui.close')};
N2.openInventory=()=>{N2.renderInventory();$('#inventoryPanel').classList.remove('hidden')};
N2.save=function(){try{localStorage.setItem('namosh2-save',JSON.stringify(N2.state));localStorage.setItem('namosh2-lang',N2.lang)}catch(e){}};
N2.load=function(){try{const raw=localStorage.getItem('namosh2-save');if(!raw)return false;N2.state={...N2.fresh(),...JSON.parse(raw)};N2.lang=N2.state.lang||localStorage.getItem('namosh2-lang')||'en';return true}catch(e){return false}};

// ---------- Audio ----------
let ac=null,timer=null,step=0,theme='field';
N2.startAudio=function(){try{if(!ac)ac=new(window.AudioContext||window.webkitAudioContext)();if(ac.state==='suspended')ac.resume();if(timer)return;const notes=[392,440,493.88,523.25,493.88,440,392,349.23,329.63,349.23,392,440,493.88,440,392,349.23];const cave=[261.63,293.66,329.63,349.23,329.63,293.66,261.63,246.94];function tone(f,type,g,d){const o=ac.createOscillator(),v=ac.createGain(),n=ac.currentTime;o.type=type;o.frequency.value=f;v.gain.setValueAtTime(.0001,n);v.gain.exponentialRampToValueAtTime(g,n+.03);v.gain.exponentialRampToValueAtTime(.0001,n+d);o.connect(v);v.connect(ac.destination);o.start();o.stop(n+d+.04)}timer=setInterval(()=>{if(ac.state!=='running')return;theme=area().theme;const arr=['grotto','star'].includes(theme)?cave:notes,f=arr[step%arr.length];tone(f,'triangle',.018,.38);if(step%4===0)tone(f/4,'sine',.008,.7);step++},330)}catch(e){}};
N2.sfx=function(kind){if(!ac)return;const o=ac.createOscillator(),g=ac.createGain(),n=ac.currentTime;o.type='square';o.frequency.value=kind==='step'?130:kind==='item'?720:220;g.gain.setValueAtTime(.004,n);g.gain.exponentialRampToValueAtTime(.0001,n+.07);o.connect(g);g.connect(ac.destination);o.start();o.stop(n+.08)};

// expose sprite funcs for cutscenes
N2.drawAya=drawAya;N2.drawNamosh=drawNamosh;N2.drawKitten=drawKitten;N2.drawNpc=drawNpc;
})();
