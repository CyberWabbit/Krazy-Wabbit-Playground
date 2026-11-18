const clamp = (x, lo=0, hi=1) => Math.max(lo, Math.min(hi,x));
const pick = (r, xs) => xs[Math.floor(r()*xs.length)];
const scale = [0,2,3,5,7,8,10];
const pitch = d => scale[((d%7)+7)%7]+12*Math.floor(d/7);
function engine(kind, seed=Date.now()) {
  let z=seed|0;
  const r=()=>{ z=(Math.imul(z,1664525)+1013904223)|0; return (z>>>0)/4294967296; };
  const motif=()=>Array.from({length:4},(_,i)=>i===0?0:pick(r,[0,1,2,3,4,5,7]));
  let phrase=motif(), origin=[...phrase], mode='Drive', age=0, root=0, relation='';
  return {
    step(n,p){
      const s=n%16,b=Math.floor(n/16), out=[];
      const add=(voice,note=48,vel=.65,len=.22,offset=0)=>out.push({voice,note,vel,len,offset});
      if(kind==='mutiny'){
        if(s===0&&b>0){
          age++;
          if(mode==='Break'){mode='Rebuild';age=0;phrase=[...origin];}
          else if(mode==='Rebuild'){mode='Drive';age=0;}
          else if(age>=3 && (age>=12 || r()<.11+p.chaos*.48-p.stability*.12)){mode='Break';age=0;}
          if(mode==='Drive'&&r()<p.mutation*(.45+.5*p.chaos)) phrase[Math.floor(r()*4)]=pick(r,[0,2,3,4,5,7]);
          if(mode==='Rebuild'&&r()<p.rebirth){root=pick(r,[0,-2,-5,3]);origin=motif();}
          if(b%4===0&&mode==='Drive'&&r()<p.stability) phrase=[...origin];
        }
        if(s%4===0&&(mode!=='Break'||s===0))add('kick',36,.7+p.aggression*.23);
        if((s===4||s===12)&&mode==='Drive')add('clap',44,.45+p.aggression*.35);
        if((s%4===2||s%2===1&&r()<p.aggression*.55)&&mode!=='Break')add('hat',72,.28+p.aggression*.34,.07,.012*(s%2));
        if([0,3,6,10,12,15].includes(s)&&mode!=='Break'&&(mode!=='Rebuild'||s<9)){
          add('bass',36+root+pitch(phrase[Math.floor(s/4)]%5),.73,.14+p.stability*.12);
        }
        if((s===2||s===9||s===14)&& (mode==='Break'||b%4>=2))add('glass',60+root+pitch(phrase[Math.floor(s/4)]),.52,mode==='Break'?.68:.24);
        if(s>=13&&b%4===3&&r()<.45+p.chaos*.5)add('hat',70,.58,.06);
        relation=mode==='Break'?'Pulse stripped back':mode==='Rebuild'?'Original motif resurfaces':'Motif in circulation';
      }else if(kind==='parasite'){
        if(s===0){
          if(b%8===0){phrase=[...origin];mode='Latch';}
          else if(b%8===7){mode='Recover';phrase=[...origin];}
          else if(r()<.17+p.chaos*.7){
            mode=pick(r,['Splice','Burst','Slip']);
            if(mode==='Splice')phrase=[...phrase.slice(1),pick(r,[0,2,4,6,7])];
          }
        }
        const shift=mode==='Slip'&&s<12?1:0;
        if([0,3,6,8,11,14].includes(s-shift)||(mode==='Burst'&&s%2===1&&r()<p.chaos*p.density)){
          if(s===0||r()<.45+p.density*.55){
            const idx=Math.floor((s-shift)/4)%4;
            const note=48+pitch(phrase[idx])+((mode==='Splice'&&s>=12)?12:0);
            add('wire',note,s%4===0?.8:.46,.045+p.gate*.33,(s%2)*p.swing*.055);
            if(mode==='Burst'&&p.chaos>.72&&s%4===3)add('wire',note+12,.43,.055,.055);
          }
        }
        relation=mode==='Recover'?'Returning to source phrase':'Phrase '+phrase.map(x=>x+1).join(' · ');
      }
      return out;
    },
    view(){return {mode,relation};}
  };
}
