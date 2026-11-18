(async()=>{
  const check=(value,message)=>{if(!value)throw Error(message);};
  const delay=ms=>new Promise(resolve=>setTimeout(resolve,ms));
  try{
    check(document.querySelectorAll('.card').length===3,'Landing links');
    for(const kind of ['mutiny','parasite']){
      history.replaceState(null,'','#'+kind);navigate();
      check(!!document.querySelector('.chaos svg'),'Chaos rabbit missing');
      const knob=document.querySelector('.chaos input');
      knob.value=85;knob.dispatchEvent(new Event('input'));
      check(params.chaos===.85,'Chaos control failed');
      await start();
      const meter=audio.context.createAnalyser(), pcm=new Float32Array(meter.fftSize);
      audio.limiter.connect(meter);
      let peak=0;
      for(let i=0;i<9;i++){
        await delay(100);meter.getFloatTimeDomainData(pcm);
        for(const sample of pcm)peak=Math.max(peak,Math.abs(sample));
      }
      check(playing&&peak>.002&&peak<.95,kind+' Web Audio output: '+peak);
      check(find('mode').textContent!=='Standby',kind+' screen updates');
      if(kind==='parasite'){
        const sent=[],port={id:'test',name:'Mock synth',state:'connected',send(bytes,t){sent.push([bytes,t]);},clear(){sent.push(['clear']);}};
        access={outputs:new Map([[port.id,port]])};updatePorts();
        find('destination').value='test';find('destination').dispatchEvent(new Event('change'));
        await delay(800);
        const noteOn=sent.find(([bytes])=>bytes[0]===144);
        const noteOff=sent.find(([bytes])=>bytes[0]===128);
        check(noteOn&&noteOff&&noteOff[1]>noteOn[1],'MIDI scheduling through interface');
        find('panic').click();
        check(sent.some(([bytes])=>bytes==='clear')&&sent.some(([bytes])=>bytes[1]===123),'MIDI panic from interface');
      }
      if(kind==='ecosystem'){history.replaceState(null,'','#');navigate();}else find('stop').click();
      await delay(130);meter.getFloatTimeDomainData(pcm);
      check(!playing&&!audio.bus&&audio.voices.size===0&&pcm.every(x=>Math.abs(x)<.0001),kind+' stop or navigation leaves audio active');
      audio.limiter.disconnect(meter);
    }
    history.replaceState(null,'','#ecosystem');navigate();
    check(!document.querySelector('input')&&document.querySelectorAll('button').length===2,'Only birth and death controls');
    check(find('mode').textContent==='UNBORN'&&!find('play').disabled&&find('father-time').disabled,'Unborn interface');
    check(find('play').textContent==='BIG BANG'&&find('relation').textContent==='Smack that big bang to give life.','Exact ECOSYSTEM copy');
    find('play').click();
    await delay(100);
    const meter=audio.context.createAnalyser(), pcm=new Float32Array(meter.fftSize);
    audio.limiter.connect(meter);
    function peak(){
      meter.getFloatTimeDomainData(pcm);
      return pcm.reduce((p,x)=>Math.max(p,Math.abs(x)),0);
    }
    const seed=gen.seed;
    check(/^[a-f0-9]{32}$/.test(seed),'Fresh 128-bit seed');
    let startup=0;
    for(let i=0;i<20;i++){await delay(60);startup=Math.max(startup,peak());}
    check(startup>.005&&startup<.95,'Birth sound');
    check(find('life-world').dataset.phase==='living'&&find('life-status-0').textContent.includes('Gen 1'),'Life visualization');
    find('father-time').click();
    check(find('father-time').disabled&&find('play').disabled,'No repeat ending or premature restart');
    await delay(500);
    check(playing&&find('life-world').dataset.phase==='ending','Father Time remains audible in an ending phase');
    let early=0,late=0;
    const fadeLength=LIFE_END_STEPS*60/gen.tempo/4*1000, now=performance.now()-500;
    while(playing&&performance.now()-now<fadeLength+3000){
      const p=peak(), elapsed=performance.now()-now;
      if(elapsed<fadeLength*.49)early=Math.max(p,early);
      if(elapsed>fadeLength*.68)late=Math.max(p,late);
      await delay(38);
    }
    check(early>late&&late>.0001,'Recorded fade peaks '+early+' → '+late);
    await delay(170);
    check(!playing&&!audio.bus&&audio.voices.size===0&&peak()<.0001,'Father Time silence and release');
    check(find('mode').textContent==='UNBORN'&&!find('play').disabled,'Return to unborn');
    check(find('relation').textContent==='Smack that big bang to give life.','Unborn copy restored');
    find('play').click();
    await delay(100);
    check(gen.seed!==seed&&gen.view(0).creatures.every(c=>c.generation===1&&c.age===0),'Live rebirth creates a fresh population');
    history.replaceState(null,'','#');navigate();
    await delay(145);
    check(!playing&&!audio.bus&&audio.voices.size===0&&peak()<.0001,'Navigation immediately stops ecosystem');
    audio.limiter.disconnect(meter);
    document.body.dataset.smoke='PASS: MUTINY and PARASITE playback, MIDI scheduling and panic; ECOSYSTEM fresh births, visual states, Father Time fade ('+early.toFixed(3)+' → '+late.toFixed(3)+'), cleanup and navigation';
  }catch(error){document.body.dataset.smoke='FAIL: '+error.message;}
})()
