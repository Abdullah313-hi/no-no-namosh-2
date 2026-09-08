window.N2=window.N2||{};
(()=>{
const $=N2.$,R=N2.R,{W,H,T}=N2.CFG;
function rows(key){return N2.t('dialog.'+key).map(([s,t])=>[N2.t('names.'+s),t])}
function titleScreen(){
  $('#hud').classList.add('hidden');$('#dialog').classList.add('hidden');$('#inventoryPanel').classList.add('hidden');$('#titleOverlay').classList.remove('hidden');
  const canContinue=!!localStorage.getItem('namosh2-save');
  $('#titlePanel').innerHTML=`<div class="small-note">${N2.t('ui.part1')}</div><div class="logo">${N2.t('ui.title')}</div><div class="subtitle">${N2.t('ui.subtitle')}</div><div class="lang-buttons"><button id="langEn">ENGLISH</button><button id="langSv">SVENSKA</button></div><div class="menu"><button id="newBtn">${N2.t('ui.newGame')}</button>${canContinue?`<button id="continueBtn">${N2.t('ui.continue')}</button>`:''}</div><div class="small-note">A larger retro adventure · swimming · caves · companions</div>`;
  $('#langEn').onclick=()=>{N2.lang='en';localStorage.setItem('namosh2-lang','en');titleScreen()};
  $('#langSv').onclick=()=>{N2.lang='sv';localStorage.setItem('namosh2-lang','sv');titleScreen()};
  $('#newBtn').onclick=()=>{N2.startAudio();N2.state=N2.fresh();N2.state.lang=N2.lang;localStorage.removeItem('namosh2-save');$('#titleOverlay').classList.add('hidden');$('#hud').classList.remove('hidden');playIntro()};
  const c=$('#continueBtn');if(c)c.onclick=()=>{N2.startAudio();if(N2.load()){N2.state.lang=N2.lang;$('#titleOverlay').classList.add('hidden');$('#hud').classList.remove('hidden');N2.renderInventory();N2.draw()}};
  drawTitleBackdrop();
}
function drawTitleBackdrop(){
 R(0,0,640,480,'#6fae77');R(0,320,640,160,'#9dc98a');R(0,375,640,105,'#70b9e5');
 for(let i=0;i<20;i++){R((i*91)%620,310-((i*37)%90),18,34,'#477b55');R((i*91)%620-8,300-((i*37)%90),34,22,'#78b46d')}
 N2.drawAya(160,315,'right',2,false,false);N2.drawNamosh(410,340,2);
}
function drawIntroFrame(i){
 R(0,0,640,480,'#b98962');
 R(0,0,640,45,'#d8c7aa');R(0,435,640,45,'#876c52');R(0,0,45,480,'#d8c7aa');R(595,0,45,480,'#d8c7aa');
 R(430,70,120,210,'#ece5d6');R(438,78,104,55,'#fff8eb');R(438,140,104,132,'#88847f');
 R(70,80,180,80,'#f0e9dc');R(70,160,180,20,'#4e514b');
 // window with storm
 R(290,55,105,95,'#45576b');R(300,65,85,75,'#6b8096');
 for(let k=0;k<10;k++){R(305+k*9,70+(k%3)*18,2,22,'#a9d7ef')}
 if(i>=5){R(335,66,5,55,'#fff1a5');R(325,102,24,5,'#fff1a5')}
 // Aya near kittens
 N2.drawAya(255,285,'right',1,false,false);
 // Namosh tense by door later
 if(i<4)N2.drawNamosh(320,300,1);else N2.drawNamosh(470,300,1);
 const kittens=[[130,320],[180,335],[220,300],[370,335]];kittens.forEach(([x,y])=>N2.drawKitten(x,y));
 if(i<2)N2.drawKitten(420,275);
 // hallway door
 R(515,180,55,140,'#6e5947');R(525,192,35,118,'#8d725a');R(552,250,4,4,'#e4c57a');
}
function playSequence(list,scene,done){let i=0;const step=()=>{scene?.(i);N2.dialog([list[i]],()=>{i++;if(i<list.length)step();else done?.()})};step()}
function playIntro(){
  const list=rows('intro');
  playSequence(list,drawIntroFrame,()=>{
    N2.state.flags.introDone=true;N2.state.map='hall';N2.state.x=10;N2.state.y=12;N2.state.dir='up';N2.state.quest='hall';N2.save();N2.draw();
  });
}
function showEnd(){
  $('#titleOverlay').classList.remove('hidden');$('#hud').classList.add('hidden');
  $('#titlePanel').innerHTML=`<div class="small-note">${N2.t('ui.part1')}</div><div class="logo">${N2.t('ui.demoEnd')}</div><div class="subtitle">${N2.t('ui.demoMsg')}</div><div class="menu"><button id="backTitle">TITLE / TITEL</button></div>`;
  $('#backTitle').onclick=titleScreen;
}
function startPartner(){N2.state.partner={name:'Abdullah',look:'abdullah',map:N2.state.map,x:N2.state.x-1,y:N2.state.y};N2.state.flags.abdullahJoined=true}
function findTarget(){const [x,y]=N2.target(),m=N2.area();const n=(m.npcs||[]).find(n=>n.x===x&&n.y===y);let o=(m.objects||[]).find(o=>N2.objVisible(o)&&o.x===x&&o.y===y);if(!o)o=(m.objects||[]).find(o=>N2.objVisible(o)&&o.x===N2.state.x&&o.y===N2.state.y&&['paws','sparkle','herb','stones','foam','exit'].includes(o.type));return {n,o,x,y}}
function talkNpc(n){
 const f=N2.state.flags;
 if(n.id==='ahmed'){N2.dialog(rows('ahmed'),()=>{f.ahmed=true;N2.state.quest='green';N2.save()});return}
 if(n.id==='farah'){N2.dialog(rows('farah'));return}
 if(n.id==='ummz'){N2.dialog(rows('ummz'));return}
 if(n.id==='abdullah'){
   if(!f.abdullahJoined)N2.dialog(rows('abdullah'),()=>{startPartner();N2.addItem('whiteStone');N2.state.quest='abdullah';N2.save();N2.draw()});
   else N2.dialog([[N2.t('names.Abdullah'),N2.lang==='sv'?'Jag följer de små spåren. Fortsätt söderut.':'I am following the smaller prints. Keep heading south.']]);
   return;
 }
 if(n.id==='sami'){
   if(!N2.state.abilities.swim)N2.dialog(rows('sami1'),()=>{f.samiTalked=true;N2.state.quest='lesson';N2.save()});
   else N2.dialog([[N2.t('names.Sami'),N2.lang==='sv'?'Bra. Nu kan floden inte stoppa dig.':'Good. The river cannot stop you now.']]);
   return;
 }
 if(n.id==='samiLesson'){
   if(!N2.state.abilities.swim){N2.state.abilities.swim=true;N2.dialog(rows('sami2'),()=>{N2.state.quest='lesson';N2.save();N2.draw()})}
   else N2.dialog([[N2.t('names.Sami'),N2.lang==='sv'?'Simma ut till den röda bojen och tillbaka.':'Swim out to the red buoy and back.']]);
   return;
 }
}
function interactObject(o){
 const f=N2.state.flags;
 if(o.id==='wetPaws'){N2.dialog(rows('hall'),()=>{f.hallClue=true;N2.state.quest='rose';N2.save()});return}
 if(o.id==='roseScratch'){N2.dialog(rows('rose'),()=>{f.roseClue=true;N2.state.quest='green';N2.save()});return}
 if(o.id==='shard'&&!f['done:shard']){f['done:shard']=true;N2.addItem('starShard');N2.dialog(rows('shard'),()=>{N2.save();N2.draw()});return}
 if(o.id.startsWith('herb')){f['done:'+o.id]=true;f.herbs=(f.herbs||0)+1;if(f.herbs===3)N2.addItem('herbs');N2.sfx('item');N2.draw();return}
 if(o.id==='whiteStones'){N2.dialog([[N2.t('names.Narrator'),N2.lang==='sv'?'Små vita stenar markerar den torrare vägen mot floden. Abdullah håller sitt ord.':'Small white stones mark the drier path toward the river. Abdullah is keeping his word.']]);return}
 if(o.id==='riverSign'){N2.dialog([[N2.t('names.Narrator'),N2.lang==='sv'?'SKYLT: Starka strömmar. Simma inte utan erfarenhet.':'SIGN: Strong current. Do not enter without experience.']]);return}
 if(o.id==='lessonBuoy'){
   if(N2.state.abilities.swim&&!f.swimLessonDone){f.swimLessonDone=true;N2.addItem('swimBadge');N2.state.quest='cross';N2.dialog([[N2.t('names.Narrator'),N2.lang==='sv'?'Aya rundar bojen och håller sig stadigt i strömmen. Simlektionen är klar.':'Aya rounds the buoy and holds steady in the current. Swimming lesson complete.']],()=>N2.save())}
   return;
 }
 if(o.id==='grottoPaws'){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Namoshs tassavtryck. Hon tog sig igenom här.':'Namosh’s paw prints. She made it through here.']]);return}
 if(o.id==='lever1'&&!f.flood1){f.flood1=true;N2.dialog(rows('flood1'),()=>{N2.state.quest='flood2';N2.save();N2.draw()});return}
 if(o.id==='lever2'&&!f.flood2){f.flood2=true;N2.dialog(rows('flood2'),()=>{N2.state.quest='dive';N2.save();N2.draw()});return}
 if(o.id==='goggles'&&!N2.state.abilities.dive){f['done:goggles']=true;N2.state.abilities.dive=true;N2.addItem('diveGoggles');N2.dialog(rows('goggles'),()=>{N2.state.quest='dive';N2.save();N2.draw()});return}
 if(o.id==='starEmblem'&&!f.starSeen){f.starSeen=true;N2.dialog(rows('star'),()=>{N2.state.quest='escape';N2.save();N2.draw()});return}
 if(o.id==='coolCrystal'&&!f['done:coolCrystal']){f['done:coolCrystal']=true;N2.addItem('crystal');N2.dialog([[N2.t('names.Narrator'),N2.lang==='sv'?'Aya tar loss en iskall blå kristall från väggen.':'Aya carefully removes an ice-cold blue crystal from the wall.']]);N2.draw();return}
 if(o.id==='exitLight'&&!f.chapterComplete){f.chapterComplete=true;N2.dialog(rows('escape'),()=>playSequence(rows('end'),null,()=>{N2.state.quest='complete';N2.state.finished=true;N2.save();showEnd()}));return}
 if(o.type==='kitten'){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Du är här. Bra. Fyra... vänta. Fortfarande bara fyra.':'You are here. Good. Four... wait. Still only four.']]);return}
 if(o.id==='bowl'){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Sex matskålar. Mitt liv har förändrats väldigt snabbt.':'Six food bowls. My life changed very quickly.']]);return}
 if(o.id==='bed'){N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'En gång hade jag en hel säng.':'I used to own an entire bed.']]);return}
}
N2.interact=function(){
 if(!$('#dialog').classList.contains('hidden')){N2.nextDialog();return}
 if(!$('#inventoryPanel').classList.contains('hidden'))return;
 const {n,o}=findTarget();if(n){talkNpc(n);return}if(o){interactObject(o);return}
 if(N2.state.partner){const [tx,ty]=N2.target(),p=N2.state.partner;if(p.map===N2.state.map&&p.x===tx&&p.y===ty){N2.dialog([[N2.t('names.Abdullah'),N2.lang==='sv'?'Jag är med dig. Fortsätt följa spåren.':'I am with you. Keep following the trail.']]);return}}
 N2.dialog([[N2.t('names.Aya'),N2.lang==='sv'?'Inget här.':'Nothing here.']]);
};
N2.toggleDive=function(){
 if(N2.state.abilities.dive&&N2.inWater()){
   N2.state.diving=!N2.state.diving;N2.sfx('item');N2.draw();return;
 }
 N2.openInventory();
};
N2.onEnter=function(id){
 const f=N2.state.flags;
 if(id==='rose'&&!f.enterRose){f.enterRose=true;N2.state.quest='rose'}
 if(id==='green1')N2.state.quest='green';
 if(id==='green2'&&!f.abdullahJoined)N2.state.quest='green';
 if(id==='riverTown'&&!N2.state.abilities.swim)N2.state.quest='sami';
 if(id==='riverCross')N2.state.quest='cross';
 if(id==='grotto1'&&!f.grottoIntro){f.grottoIntro=true;N2.state.quest='grotto';setTimeout(()=>N2.dialog(rows('grottoEnter')),100)}
 if(id==='grotto2'&&!f.flood1)N2.state.quest='flood1';
 if(id==='grotto3'&&f.flood1&&!f.flood2)N2.state.quest='flood2';
 if(id==='grotto4'&&!f.starSeen)N2.state.quest='star';
 if(id==='grotto5')N2.state.quest='escape';
 N2.save();
};
// controls
$('[data-dir="up"]').onclick=()=>N2.move(0,-1,'up');$('[data-dir="down"]').onclick=()=>N2.move(0,1,'down');$('[data-dir="left"]').onclick=()=>N2.move(-1,0,'left');$('[data-dir="right"]').onclick=()=>N2.move(1,0,'right');
$('#btnA').onclick=N2.interact;$('#btnB').onclick=N2.toggleDive;$('#btnBag').onclick=N2.openInventory;$('#closeInventory').onclick=()=>$('#inventoryPanel').classList.add('hidden');
document.querySelector('.shell').addEventListener('keydown',e=>{const k=e.key.toLowerCase();if(['arrowup','arrowdown','arrowleft','arrowright','w','a','s','d','enter',' ','b','i','escape'].includes(k))e.preventDefault();if(k==='arrowup'||k==='w')N2.move(0,-1,'up');else if(k==='arrowdown'||k==='s')N2.move(0,1,'down');else if(k==='arrowleft'||k==='a')N2.move(-1,0,'left');else if(k==='arrowright'||k==='d')N2.move(1,0,'right');else if(k==='enter'||k===' ')N2.interact();else if(k==='b')N2.toggleDive();else if(k==='i')N2.openInventory();else if(k==='escape')$('#inventoryPanel').classList.add('hidden')});
const savedLang=localStorage.getItem('namosh2-lang');if(savedLang&&N2.I18N[savedLang])N2.lang=savedLang;titleScreen();
})();
