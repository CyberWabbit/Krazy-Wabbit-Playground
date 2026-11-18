function requireLife(value,reason){if(!value)throw new Error(reason);}
const birthFingerprints=new Set();
const verbs=new Set();
let dormant=false, aging=false, maxGeneration=0;
let endRuns=0, aliveAfterLongRun=0;
for(let i=0;i<40;i++){
  const life=newEcosystem(i+1);
  const initial=life.view(0);
  requireLife(initial.creatures.length===4&&initial.creatures.every(c=>c?.generation===1&&c.age===0),'Four new organisms');
  requireLife(new Set(initial.creatures.map(c=>c.role)).size===4,'Distinct roles');
  requireLife(life.step(0).length>0,'Immediate sound');
  const notes=[];
  for(let n=1;n<10000;n++){
    const events=life.step(n), view=life.view(n);
    requireLife(view.creatures.length===4&&view.voices<=LIFE_VOICE_LIMIT,'Bounded organisms and voices');
    if(n<128)notes.push(events);
    if(view.relation)verbs.add(view.relation.type);
    for(const creature of view.creatures){
      if(!creature)continue;
      dormant ||= creature.state==='Dormant';
      aging ||= creature.state==='Aging';
      maxGeneration=Math.max(maxGeneration,creature.generation);
    }
    for(const event of events)requireLife(event.note>=0&&event.note<=127&&event.vel>0&&event.vel<=1&&event.offset>=0,'Safe event');
  }
  requireLife(!birthFingerprints.has(life.seed)&&!birthFingerprints.has(JSON.stringify(notes)),'Distinct seeds produce different music');
  birthFingerprints.add(life.seed);birthFingerprints.add(JSON.stringify(notes));
  if(life.view(9999).creatures.some(Boolean))aliveAfterLongRun++;
  const serials=life.view(9999).creatures.map(c=>c?.id);
  life.end(10000);
  let early=0,late=0;
  for(let t=0;t<=LIFE_END_STEPS;t++){
    const events=life.step(10000+t),view=life.view(10000+t);
    requireLife(JSON.stringify(serials)===JSON.stringify(view.creatures.map(c=>c?.id)),'No births during Father Time');
    requireLife(view.life===1-t/LIFE_END_STEPS,'Gradual aging');
    if(t<32)early+=events.reduce((s,e)=>s+e.vel,0);else late+=events.reduce((s,e)=>s+e.vel,0);
    if(t>=52)requireLife(events.length===0,'Space for final tails');
  }
  if(early>late&&late>0)endRuns++;
  requireLife(life.done(10064)&&life.step(10064).length===0,'Ending reaches silence');
}
requireLife(aliveAfterLongRun>=39&&endRuns>=32,'Long sessions survive and Father Time trails off');
requireLife(['imitation','competition','birth','death'].every(x=>verbs.has(x))&&dormant&&aging&&maxGeneration>3,'Population lifecycle and interaction coverage');

// Observe an inherited motif note that differs from the follower’s pre-encounter note.
let imitationAudible=false;
for(let seed=1;seed<=50&&!imitationAudible;seed++){
  const life=newEcosystem(seed);
  let prior=life.view(0), copied=null;
  for(let n=0;n<960&&!imitationAudible;n++){
    const events=life.step(n), view=life.view(n);
    if(n%16===0){
      const rel=view.relation;
      copied=null;
      if(rel?.type==='imitation'){
        const before=prior.creatures[rel.to], follower=view.creatures[rel.to], leader=view.creatures[rel.from];
        if(before&&follower&&leader&&follower.role!==0)copied={before,follower,leader};
      }
    }
    if(copied){
      const {before,follower,leader}=copied, beat=(n+16-follower.offset)%16, part=Math.floor(beat/4);
      const degree=follower.motif[part];
      if(beat!==8&&!(follower.role===1&&beat%4===0)&&part>=2&&degree===leader.motif[part]&&degree!==before.motif[part]){
        const note=[36,36,60,48][follower.role]+view.root+LIFE_MODE[degree%7]+12*Math.floor(degree/7);
        if(events.some(e=>e.voice===LIFE_VOICES[follower.role]&&e.note===note))imitationAudible=true;
      }
    }
    prior=view;
  }
}
requireLife(imitationAudible,'A note with a newly imitated pitch appears in the generated events');
if(typeof print==='function')print('PASS: 40 births × 10,000 steps; varied music, bounded voices, competition, audible imitation events, dormancy, death, generations, and Father Time');
