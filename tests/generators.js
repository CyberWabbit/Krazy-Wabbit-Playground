function assert(condition,message){if(!condition)throw new Error(message);}
const settings={chaos:.75,stability:.5,aggression:.5,mutation:.6,rebirth:.5,density:.6,gate:.3,swing:.4,competition:.6,cooperation:.9,scarcity:.4};
function generate(kind,params=settings){
  const instance=engine(kind,12345), modes=new Set();
  let count=0;
  const trace=Array.from({length:1600},(_,n)=>{
    const events=instance.step(n,params), view=instance.view();
    modes.add(view.mode);
    count+=events.length;
    for(const e of events)assert(Number.isInteger(e.note)&&e.note>=0&&e.note<=127&&e.vel>0&&e.vel<=1&&e.len>0&&e.offset>=0,'Invalid event');
    return events;
  });
  assert(count>100,kind+' produces too few events');
  return {trace,modes};
}
for(const k of ['mutiny','parasite']){
  const a=generate(k), b=generate(k), low=generate(k,{...settings,chaos:0});
  assert(JSON.stringify(a.trace)===JSON.stringify(b.trace),k+' is not repeatable with the same seed');
  assert(JSON.stringify(a.trace)!==JSON.stringify(low.trace),k+' chaos control has no effect');
}
const mutiny=generate('mutiny');
assert(['Drive','Break','Rebuild'].every(m=>mutiny.modes.has(m)),'MUTINY state transitions');
const parasite=generate('parasite');
assert(['Latch','Slip','Burst','Splice','Recover'].every(m=>parasite.modes.has(m)),'PARASITE state transitions');
const midiTest=new Midi(), messages=[];
const fake={send(bytes,at){messages.push([bytes.join(','),at]);},clear(){messages.push(['clear']);}};
midiTest.route(fake,2);
midiTest.note(60,.5,100,80);
midiTest.note(60,.6,110,100);
assert(messages.length===2&&messages[0][0]==='146,60,64'&&messages[1].join(';')==='130,60,0;180','Timestamped note pairing and retrigger protection');
midiTest.route(fake,1);
assert(messages[2][0]==='clear'&&messages[3][0]==='130,60,0'&&messages[6][0]==='178,120,0'&&midiTest.active.size===0,'Route cleanup');
midiTest.note(64,.7,200,50);
midiTest.prune(260);
assert(midiTest.active.size===0,'Completed note pruning');
midiTest.route({send(){throw Error('disconnected');},clear(){throw Error('disconnected');}},1);
midiTest.note(65,.5,300,50);
midiTest.panic();
assert(midiTest.active.size===0,'Disconnected MIDI cleanup');
if(typeof print==='function')print('PASS: MUTINY and PARASITE generators, MIDI timestamps, route change, disconnect and panic');
