const HABITAT_POSITIONS = [[264,105],[570,113],[571,324],[273,320]];
const HABITAT_COLORS = ['#f4a58c','#93d1b1','#bbadff','#83c9e0'];
const HABITAT_FORMS = [
  'M0-40Q12-20 34-22Q27-3 42 12Q18 12 14 36Q-4 28-26 35Q-22 16-41 6Q-25-9-28-31Q-9-24 0-40Z',
  'M0-33C27-46 42-12 34 9S11 44-11 34-45 21-35-2-29-21 0-33Z',
  'M0-37C9-42 16-23 20-17S40-10 38 0 22 15 18 20 9 41 0 38-14 22-20 18-40 10-39 0-25-14-20-19-7-36 0-37Z',
  'M0-39C17-38 23-23 32-15S39 11 28 22 13 38-1 36-28 36-34 18-39-6-27-26-9-38 0-39Z'
];

function habitatPage(){
  const bodies=HABITAT_POSITIONS.map(([x,y],i)=>
    '<g class="life-node" id="life-node-'+i+'" transform="translate('+x+' '+y+')" style="--organism:'+HABITAT_COLORS[i]+'">'+
    '<circle class="life-orbit" r="49"/><g class="life-body"><path d="'+HABITAT_FORMS[i]+'"/>'+
    '<ellipse rx="12" ry="18" transform="rotate(27)"/><circle r="4" cx="4" cy="-6"/></g></g>').join('');
  const census=LIFE_ROLES.map((role,i)=>
    '<div class="life-card" style="--organism:'+HABITAT_COLORS[i]+'"><span>'+role+'</span><small id="life-status-'+i+'">—</small></div>').join('');
  return '<div class="shell ecosystem life-shell"><header><a class="back" href="#">← Playground</a><span class="life-observer">'+rabbit('ecosystem')+' Krazy Wabbit</span></header>'+
    '<main class="life-main"><div class="life-heading"><div><p>The Circle of Life</p><h1>ECOSYSTEM</h1></div><div class="life-actions"><button id="play">BIG BANG</button><button id="father-time" disabled>Father Time</button></div></div>'+
    '<div class="life-world" id="life-world" data-phase="unborn"><div class="life-readout"><strong id="mode">UNBORN</strong><span id="relation">Smack that big bang to give life.</span></div>'+
    '<svg class="life-map" viewBox="0 0 840 424" role="img" aria-label="Habitat with four organism positions"><defs><pattern id="life-stars" width="28" height="28" patternUnits="userSpaceOnUse"><circle cx="2" cy="2" r="1" fill="#c6a8fc" opacity=".23"/></pattern></defs>'+
    '<rect width="840" height="424" fill="url(#life-stars)"/><g class="life-rings"><ellipse cx="420" cy="215" rx="330" ry="156"/><ellipse cx="420" cy="215" rx="268" ry="111"/><ellipse cx="420" cy="215" rx="201" ry="62"/><path d="M70 215H770M420 42V385"/></g>'+
    '<path id="life-link" class="life-link" visibility="hidden"/>'+bodies+'</svg><div class="life-census">'+census+'</div></div>'+
    '<p class="life-message" id="status" role="status"></p></main></div>';
}

function drawHabitat(view){
  const world=find('life-world');
  if(!world)return;
  world.dataset.phase=view?view.mode==='Father Time'?'ending':'living':'unborn';
  find('mode').textContent=view?.mode??'UNBORN';
  find('relation').textContent=view?.relation?.text??(view?(view.mode==='Father Time'?'The habitat is falling quiet.':''):'Smack that big bang to give life.');
  for(let i=0;i<4;i++){
    const c=view?.creatures[i], node=find('life-node-'+i);
    node.dataset.state=c?.state??'empty';
    node.style.setProperty('--growth',c?.sounding?1.1:.75+(c?.energy??0)*.3);
    node.style.setProperty('--health',c?Math.max(.04,c.energy):0);
    find('life-status-'+i).textContent=c?c.state+' · Gen '+c.generation:view?'Vacant':'—';
  }
  const link=find('life-link'), relation=view?.relation;
  if(!relation||relation.from===relation.to){
    link.setAttribute('visibility','hidden');
    return;
  }
  const [x,y]=HABITAT_POSITIONS[relation.from], [dx,dy]=HABITAT_POSITIONS[relation.to];
  link.setAttribute('d','M'+x+' '+y+' Q420 215 '+dx+' '+dy);
  link.dataset.type=relation.type;
  link.setAttribute('visibility','visible');
}
