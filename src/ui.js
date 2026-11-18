const app=document.querySelector('#app');
const rabbits={
  mutiny:'M3 19 4 12 5 3 8 2 10 11 13 10 17 2 20 4 16 13 21 17 18 21 8 22Z',
  parasite:'M2 17 6 11 5 2 8 1 11 10 14 10 17 1 20 3 17 12 22 15 21 19 15 22 8 21Z',
  ecosystem:'M3 16Q3 12 7 11Q4 4 7 2Q10 0 11 11H14Q14 1 18 2Q21 3 17 12Q23 14 21 18Q19 23 12 22Q5 22 3 16Z'
};
function rabbit(k='mutiny'){
  return '<svg class="rabbit" viewBox="0 0 24 24" aria-hidden="true"><path fill="currentColor" d="'+rabbits[k]+'"/><path fill="none" stroke="var(--rabbit-eye,#151611)" stroke-width="1.6" d="m7 15 3 2m4 0 3-2"/></svg>';
}
function art(k){
  const g={
    mutiny:Array.from({length:11},(_,i)=>'<path d="M'+(i*32-55)+' 140l69-140h24l-67 140z" opacity="'+(.26+i*.06)+'"/>').join('')+'<path fill="var(--panel)" d="M27 77h83l-15 19h45l-75 39 16-28H30z"/>',
    parasite:Array.from({length:7},(_,i)=>'<path fill="none" stroke="currentColor" stroke-width="1.5" d="M0 '+(25+i*15)+'h'+(32+i*11)+'l29 -21h'+(27+i*9)+'l24 19H320"/>').join('')+'<circle cx="175" cy="66" r="17" fill="var(--panel)" stroke="currentColor" stroke-width="3"/><circle cx="175" cy="66" r="6"/>',
    ecosystem:Array.from({length:7},(_,i)=>'<ellipse fill="none" stroke="currentColor" opacity="'+(.35+i*.09)+'" cx="160" cy="70" rx="'+(35+i*19)+'" ry="'+(13+i*8)+'" transform="rotate('+(i*21)+' 160 70)"/>').join('')+'<circle cx="160" cy="70" r="23"/><circle cx="72" cy="51" r="9"/><circle cx="226" cy="90" r="12"/>'
  }[k];
  return '<svg class="card-art" viewBox="0 0 320 140" preserveAspectRatio="xMidYMid slice" fill="currentColor" aria-hidden="true">'+g+'</svg>';
}
const info={
  mutiny:{name:'MUTINY',line:'Autonomous musical rebellion',tempo:132,knobs:[['chaos','CRAZY',.42,'Push the machine toward fills and breakdowns'],['stability','Stability',.59,'Bring the original motif back and lengthen the bass'],['aggression','Aggression',.54,'Add percussion and hit harder'],['mutation','Mutation',.4,'Rewrite parts of the motif'],['rebirth','Rebirth',.54,'Shift the key and seed a new motif during recovery']]},
  parasite:{name:'PARASITE',line:'Autonomous MIDI disruption',tempo:124,knobs:[['chaos','INFECT',.4,'Splice, displace, and burst through the recurring phrase'],['density','Density',.6,'Let more of the phrase through'],['gate','Gate',.3,'Set how long notes ring'],['swing','Swing',.35,'Delay offbeats']]},
  ecosystem:{name:'ECOSYSTEM',line:'The Circle of Life'}
};
const audio=new InstrumentAudio(),midi=new Midi();
let current, gen, params, timer, next, step, access, run=0, playing=false, drawing=[];
let drawTimer, endingAt=null;
const find=id=>document.getElementById(id);
const setStatus=text=>{if(find('status'))find('status').textContent=text;};
function stop(){
  run++;playing=false;clearInterval(timer);clearTimeout(drawTimer);drawing=[];
  audio.stop();midi.route(null,0);
  endingAt=null;
  if(find('play'))find('play').disabled=false;
  if(find('stop'))find('stop').disabled=true;
  if(current==='ecosystem'){
    gen=null;
    if(find('father-time'))find('father-time').disabled=true;
    drawHabitat(null);
  }
}
function route(){
  if(current!=='parasite')return;
  const port=access?.outputs.get(find('destination').value);
  midi.route(playing&&port?.state==='connected'?port:null,Number(find('channel').value)-1);
}
function updatePorts(){
  if(current!=='parasite')return;
  const dest=find('destination'), selected=dest.value;
  const wasExternal=selected!=='';
  dest.replaceChildren(new Option('Internal audio',''));
  for(const port of access.outputs.values())if(port.state==='connected')dest.add(new Option(port.name||'MIDI output',port.id));
  if([...dest.options].some(o=>o.value===selected))dest.value=selected;
  if(wasExternal&&!dest.value)setStatus('MIDI disconnected. Internal audio selected.');
  route();
}
function draw(view){
  if(current==='ecosystem'){drawHabitat(view);return;}
  find('mode').textContent=view.mode;
  find('relation').textContent=view.relation;
}
function fatherTime(){
  if(!playing||endingAt!==null||find('father-time').disabled)return;
  gen.end(step);
  find('father-time').disabled=true;
  setStatus('The ecosystem is reaching its end.');
}
function paint(){
  if(endingAt!==null&&audio.context.currentTime>=endingAt){
    stop();setStatus('The habitat is quiet.');return;
  }
  while(drawing.length&&drawing[0].t<=audio.context.currentTime+.012)draw(drawing.shift().view);
  if(playing)drawTimer=setTimeout(paint,24);
}
function tick(){
  const c=audio.context, interval=60/(gen.tempo??info[current].tempo)/4;
  if(endingAt!==null)return;
  if(next<c.currentTime)next=c.currentTime+.025;
  midi.prune(performance.now());
  while(next<c.currentTime+.10){
    if(current==='ecosystem'&&gen.done(step)){
      endingAt=next;
      return;
    }
    const events=gen.step(step,params);
    for(const event of events){
      const t=next+event.offset;
      if(midi.port){
        const at=performance.now()+Math.max(0,t-c.currentTime)*1000;
        midi.note(event.note,event.vel,at,event.len*1000);
      }else audio.play(event,t);
    }
    if(midi.port&&step%4===0&&find('cc-opt').checked){
      const cc=find('cc-number').valueAsNumber;
      if(Number.isInteger(cc)&&cc>=1&&cc<=119&&![6,32,38,64,65,66,67,68,69,96,97,98,99,100,101].includes(cc)){
        const value=Math.round(20+params.chaos*(52+38*Math.sin(step*Math.PI/16)));
        midi.cc(cc,value,performance.now()+Math.max(0,next-c.currentTime)*1000);
      }
    }
    drawing.push({t:next,view:gen.view(step)});
    step++;next+=interval;
  }
}
async function start(){
  if(playing)return;
  const request=++run;
  find('play').disabled=true;
  if(find('stop'))find('stop').disabled=false;
  try{
    await audio.ready();
    if(request!==run)return;
    if(audio.context.state!=='running')throw new Error('Audio is suspended');
    audio.start();playing=true;gen=current==='ecosystem'?newEcosystem():engine(current);step=0;next=audio.context.currentTime+.045;
    route();
    if(current==='ecosystem'){
      find('father-time').disabled=false;
      setStatus('');
    }else{
      find('stop').disabled=false;
      setStatus('Playing');
    }
    tick();timer=setInterval(tick,20);paint();
  }catch(error){
    if(request!==run)return;
    stop();setStatus('Audio could not start. Press Play to try again.');
    console.error(error);
  }
}
function instrument(k){
  stop();current=k;
  if(k==='ecosystem'){
    app.innerHTML=habitatPage();
    drawHabitat(null);
    find('play').onclick=start;
    find('father-time').onclick=fatherTime;
    return;
  }
  const data=info[k];
  params=Object.fromEntries(data.knobs.map(([key,,v])=>[key,v]));
  const controls=data.knobs.map(([key,label,v,hint])=>
    '<label class="control '+(key==='chaos'?'chaos':'')+'" title="'+hint+'"><span>'+
    (key==='chaos'?rabbit(k):'')+label+'</span><output>'+Math.round(v*100)+'</output>'+
    '<input type="range" aria-label="'+label+'" data-knob="'+key+'" min="0" max="100" value="'+Math.round(v*100)+'"></label>').join('');
  app.innerHTML='<div class="shell '+k+'"><header><a class="back" href="#">← Playground</a><span>'+data.tempo+' BPM</span></header><main class="instrument"><h1>'+data.name+'</h1><p class="intro">'+data.line+'</p>'+
    '<div class="surface"><div class="screen">'+art(k)+'<div><b id="mode">Standby</b><small id="relation">Press Play</small></div></div><div class="controlbox">'+controls+'</div></div>'+
    '<div class="actions"><button class="play" id="play">▶ Play</button><button id="stop" disabled>■ Stop</button><button id="fresh">Fresh start</button>'+
    (k==='parasite'?'<button id="panic">Panic</button>':'')+'</div>'+
    (k==='parasite'?'<div class="midi"><button id="connect">Enable MIDI</button><label>Output <select id="destination"><option value="">Internal audio</option></select></label><label>Channel <select id="channel">'+
      Array.from({length:16},(_,i)=>'<option>'+(i+1)+'</option>').join('')+'</select></label><label><input type="checkbox" id="cc-opt"> Send CC</label><label>CC <input id="cc-number" type="number" min="1" max="119" value="74" step="1"></label></div>':'')+
    '<p class="status" id="status" role="status"></p></main><footer><span>Krazy Wabbit</span><span>Play more. Code less.</span></footer></div>';
  for(const input of app.querySelectorAll('[data-knob]')){
    input.oninput=()=>{params[input.dataset.knob]=input.valueAsNumber/100;input.previousElementSibling.value=input.value;};
  }
  find('play').onclick=start;
  find('stop').onclick=()=>{stop();setStatus('Stopped');};
  find('fresh').onclick=()=>{stop();start();};
  if(k==='parasite'){
    find('destination').onchange=()=>{if(playing){audio.stop();audio.start();}route();};
    find('channel').onchange=route;
    find('panic').onclick=()=>{stop();setStatus('Panic sent to the active route. Transport stopped.');};
    find('connect').onclick=async()=>{
      if(!navigator.requestMIDIAccess){setStatus('Web MIDI unavailable here. Internal audio is ready.');return;}
      try{
        access=await navigator.requestMIDIAccess({sysex:false});
        access.onstatechange=updatePorts;
        updatePorts();
        if(current==='parasite')setStatus(access.outputs.size?'MIDI enabled. Select an output.':'MIDI enabled. No outputs detected.');
      }catch{if(current==='parasite')setStatus('MIDI permission unavailable. Internal audio is ready.');}
    };
    if(access)updatePorts();
  }
}
function home(){
  stop();current=null;
  app.innerHTML='<div class="shell"><header><span class="brand">'+rabbit()+' Krazy Wabbit</span><span>Experimental instruments</span></header>'+
    '<main><div class="hero"><h1>Krazy Wabbit<br><span>Playground</span></h1><p>Three instruments that write their own music. You steer.</p></div><div class="cards">'+
    Object.entries(info).map(([k,data])=>'<a class="card '+k+'" href="#'+k+'" style="text-decoration:none">'+art(k)+'<span class="line"><strong>'+data.name+'</strong><span aria-hidden="true">↗</span></span><small>'+data.line+'</small></a>').join('')+
    '</div></main><footer><span>Play more. Code less.</span><span>Audio generated locally</span></footer></div>';
}
function navigate(){
  const key=location.hash.slice(1);
  if(Object.hasOwn(info,key))instrument(key);else home();
  window.scrollTo(0,0);
}
window.addEventListener('hashchange',navigate);
window.addEventListener('pagehide',stop);
document.addEventListener('visibilitychange',()=>{if(document.hidden&&current!=='ecosystem'&&find('play')?.disabled){stop();setStatus('Stopped when the page went into the background.');}});
navigate();
