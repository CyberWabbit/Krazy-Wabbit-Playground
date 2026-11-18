const LIFE_ROLES = ['Pulse','Bass','Melody','Texture'];
const LIFE_VOICES = ['kick','bass','glass','moss'];
const LIFE_RHYTHMS = [
  [[0,4,8,12],[0,6,8,14],[0,3,8,12]],
  [[0,5,10,14],[2,6,12],[0,7,11,15]],
  [[2,6,11,14],[3,7,12],[1,9,13]],
  [[0,8],[4,12],[2,10,15]]
];
const LIFE_END_STEPS = 64;
const LIFE_VOICE_LIMIT = 7;
const LIFE_MODE = [0,2,3,5,7,9,10];

function birthSeed(){
  return [...crypto.getRandomValues(new Uint32Array(4))].map(n=>n.toString(16).padStart(8,'0')).join('');
}
function newEcosystem(seed=birthSeed()){
  const words=typeof seed==='number'?[seed,seed^0x6679,seed^0x8923,seed^0x1ade]:seed.match(/.{8}/g).map(w=>parseInt(w,16));
  let [a,b,c,d]=words.map(word=>word|0);
  let serial=0;
  function random(){
    const value=(a+b+d)|0;
    d=(d+1)|0;
    a=b^(b>>>9);
    b=(c+(c<<3))|0;
    c=(((c<<21)|(c>>>11))+value)|0;
    return (value>>>0)/4294967296;
  }
  for(let i=0;i<12;i++)random();
  const choose=values=>pick(random,values);
  const initialRoot=Math.floor(random()*12);
  const tempo=94+Math.floor(random()*34);
  const seasonBias=random()*.28-.14;
  let resource=.52+random()*.35, weather='Flourishing', root=initialRoot;
  let nextShift=3+Math.floor(random()*5), twilight=null, relation=null;
  let phraseAnchor=0;
  const slots=Array(4).fill(null), voices=[];
  const remembered=Array(4).fill(null);
  const affinities=Array.from({length:4},(_,i)=>Array.from({length:4},(_,j)=>i===j?0:random()*.6-.3));

  function organism(role,parent=null){
    const motif=parent?[...parent.motif]:[0,choose([1,2,4]),choose([2,4,5,7]),choose([0,2,4,6])];
    if(parent)motif[1+Math.floor(random()*3)]=choose([0,1,2,4,5,7]);
    return {
      id:++serial,role,parent:parent?.id??null,generation:(parent?.generation??0)+1,
      motif, rhythm:LIFE_RHYTHMS[role].indexOf(choose(LIFE_RHYTHMS[role])),
      tint:parent?clamp(parent.tint+(random()-.5)*.37):random(),
      offset:role===0?0:Math.floor(random()*3),
      energy:.48+random()*.3,age:0, lifespan:13+Math.floor(random()*22),
      sleep:0, state:'Young', lastBeat:-1
    };
  }
  for(let role=0;role<4;role++)slots[role]=organism(role);

  function evolve(bar){
    relation=null;
    const drift=Math.sin((bar+seasonBias*12)*.39)*.061+Math.sin(bar*.116)*.027+(random()-.5)*.085;
    resource=clamp(resource+drift+(0.59+seasonBias-resource)*.09,.19,.94);
    weather=resource<.44?'Lean season':resource>.71?'Flourishing':'Quiet growth';
    if(bar>=nextShift){
      root=initialRoot+choose([0,0,5,7,-2]);
      nextShift=bar+2+Math.floor(random()*7);
    }
    const living=slots.filter(Boolean);
    const leader=living.reduce((a,b)=>!a||b.energy>a.energy?b:a,null);
    phraseAnchor=leader?.motif[2]??0;
    const vacancies=[];
    for(let i=0;i<slots.length;i++){
      const c=slots[i];
      if(!c){vacancies.push(i);continue;}
      c.age++;
      c.energy=clamp(c.energy+(resource-.54)*.21+(random()-.5)*.09
        -(c.age/c.lifespan)*.042+(c.sleep?.11:.012));
      if(c.age>=c.lifespan||(c.energy<.13&&c.age>6)){
        remembered[i]=c;slots[i]=null;
        relation={type:'death',from:i,to:i,text:LIFE_ROLES[i]+' has died'};
        continue;
      }
      if(c.sleep){
        c.sleep--;
        if(!c.sleep){c.energy=Math.max(.43,c.energy);c.state='Returning';}
        continue;
      }
      if(c.energy<.27){c.sleep=2;relation={type:'dormant',from:i,to:i,text:LIFE_ROLES[i]+' goes dormant'};continue;}
      c.state=c.age<4?'Growing':c.age/c.lifespan>.72?'Aging':'Mature';
      if(!leader||c===leader||leader.sleep)continue;
      const affinity=affinities[i][leader.role];
      const probability=random();
      if(probability<.10+resource*.14+affinity*.16){
        c.motif[2]=leader.motif[2];
        c.motif[3]=leader.motif[3];
        c.offset=leader.offset;
        c.tint=(c.tint*2+leader.tint)/3;
        relation={type:'imitation',from:leader.role,to:i,text:LIFE_ROLES[i]+' echoes '+LIFE_ROLES[leader.role]};
      }else if(resource<.5&&probability>.63){
        c.offset=(c.offset+1)%3;
        c.energy=Math.max(.18,c.energy-.041);
        relation={type:'competition',from:leader.role,to:i,text:LIFE_ROLES[i]+' yields space to '+LIFE_ROLES[leader.role]};
      }
      if(random()<.10+(1-resource)*.15){
        c.motif[1+Math.floor(random()*3)]=choose([0,2,3,4,5,7]);
        c.rhythm=(c.rhythm+1)%3;
        c.tint=clamp(c.tint+(random()-.5)*.3);
      }
    }
    for(const i of vacancies){
      const parent=leader&&slots.includes(leader)?leader:remembered[i];
      if(!parent||!leader||random()<.48+resource*.36){
        slots[i]=organism(i,parent);
        remembered[i]=null;
        relation={type:'birth',from:parent?.role??i,to:i,text:LIFE_ROLES[i]+' born'+(parent?' · generation '+slots[i].generation:'')};
      }
    }
  }

  const noteOffset=d=>LIFE_MODE[d%7]+12*Math.floor(d/7);
  const stepSeconds=60/tempo/4;
  function step(n){
    if(n>0&&n%16===0&&twilight===null)evolve(n/16);
    const elapsed=twilight===null?0:n-twilight;
    const life=clamp(1-elapsed/LIFE_END_STEPS);
    if(life===0)return [];
    const now=n*stepSeconds;
    while(voices.length&&voices[0]<=now)voices.shift();
    const capacity=twilight===null?(resource<.39?1:resource<.66?2:3):Math.ceil(life*3);
    const ordered=slots.filter(c=>c&&!c.sleep).sort((a,b)=>b.energy-a.energy);
    const events=[];
    if(twilight!==null&&elapsed>=44){
      // Let the strongest surviving voice articulate the home pitch twice, then leave its tail.
      const final=ordered.find(c=>c.role!==0)??ordered[0];
      if(final&&voices.length<LIFE_VOICE_LIMIT&&(elapsed===44||elapsed===51)){
        final.lastBeat=n;
        voices.push(now+.628);
        voices.sort((a,b)=>a-b);
        events.push({voice:'glass',note:60+root,vel:life*.72,len:.62,offset:0,tone:final.tint});
      }
      return events;
    }
    for(const c of ordered){
      if(events.length>=capacity||voices.length>=LIFE_VOICE_LIMIT)break;
      const beat=(n+16-c.offset)%16;
      const ending=twilight!==null;
      if(ending && life<.62&&c.role===0)continue;
      const rhythm=LIFE_RHYTHMS[c.role][c.rhythm];
      if(!rhythm.includes(beat)&&!(n===0&&c.role===0))continue;
      const strength=ending?life:(.56+resource*.32+c.energy*.15);
      if(n!==0&&random()>strength)continue;
      const degree=c.role===1&&beat%4===0?0:beat===8&&resource>.64?phraseAnchor:c.motif[Math.floor(beat/4)];
      const note=[36,36,60,48][c.role]+root+noteOffset(degree);
      const length=[.25,.16+c.tint*.22,.21+c.tint*.32,.46+c.tint*.31][c.role];
      const gain=(.32+c.energy*.38)*(ending?life**.65:1);
      const offset=c.role===0?0:c.offset*.009+c.tint*.014*(beat%2);
      events.push({voice:LIFE_VOICES[c.role],note,vel:gain,len:length,offset,tone:c.tint});
      voices.push(now+offset+length+.008);
      voices.sort((a,b)=>a-b);
      c.lastBeat=n;
    }
    return events;
  }
  return {
    seed,tempo,step,
    end(n){if(twilight===null)twilight=n;},
    done(n){return twilight!==null&&n>=twilight+LIFE_END_STEPS;},
    view(n){
      const life=twilight===null?1:clamp(1-(n-twilight)/LIFE_END_STEPS);
      return {
        mode:twilight===null?weather:'Father Time',
        relation:twilight===null?relation:null,
        root,
        life,
        voices:voices.length,
        creatures:slots.map(c=>c&&{
          ...c,motif:[...c.motif],
          energy:twilight===null?c.energy:c.energy*life,
          state:twilight===null?(c.sleep?'Dormant':c.state):life<.28?'Fading':'Aging',
          sounding:c.lastBeat===n
        })
      };
    }
  };
}
