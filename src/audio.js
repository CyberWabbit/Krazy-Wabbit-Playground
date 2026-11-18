class Midi {
  constructor(){this.active=new Map();this.port=null;this.channel=0;}
  route(port,channel){
    if(port===this.port&&channel===this.channel)return;
    this.panic();this.port=port;this.channel=channel;
  }
  send(packet,at){
    try {this.port?.send(packet,at);return !!this.port;} catch {return false;}
  }
  note(note,vel,at,duration){
    const on=0x90|this.channel,off=0x80|this.channel;
    const end=at+duration;
    const existing=this.active.get(note);
    if(existing!==undefined&&existing>at)return;
    if(this.send([on,note,Math.round(clamp(vel)*126)+1],at)){
      this.active.set(note,end);
      this.send([off,note,0],end);
    }
  }
  prune(at){for(const [note,end] of this.active)if(end<at)this.active.delete(note);}
  cc(cc,value,at){this.send([0xb0|this.channel,cc,value],at);}
  panic(){
    if(this.port){
      try{this.port.clear();}catch{}
      for(const note of this.active.keys())this.send([0x80|this.channel,note,0]);
      this.cc(64,0);this.cc(123,0);this.cc(120,0);
    }
    this.active.clear();
  }
}
class InstrumentAudio {
  constructor(){this.context=null;this.bus=null;this.voices=new Set();}
  async ready(){
    if(!this.context){
      this.context=new AudioContext();
      const ctx=this.context;
      this.noise=ctx.createBuffer(1,ctx.sampleRate/2,ctx.sampleRate);
      const a=this.noise.getChannelData(0);
      for(let i=0;i<a.length;i++)a[i]=Math.random()*2-1;
      this.limiter=ctx.createDynamicsCompressor();
      this.limiter.threshold.value=-16;this.limiter.ratio.value=10;
      this.limiter.connect(ctx.destination);
    }
    await this.context.resume();
  }
  start(){
    this.bus=this.context.createGain();
    this.bus.gain.value=.55;this.bus.connect(this.limiter);
  }
  stop(){
    if(!this.bus)return;
    const bus=this.bus,t=this.context.currentTime;
    bus.gain.cancelScheduledValues(t);bus.gain.setTargetAtTime(0,t,.004);
    for(const source of this.voices){try{source.stop(t+.02);}catch{}}
    this.voices.clear();this.bus=null;
    setTimeout(()=>bus.disconnect(),50);
  }
  play(event,t){
    const {voice,note,vel,len,tone}=event,c=this.context;
    const freq=440*2**((note-69)/12);
    const env=c.createGain(),filter=c.createBiquadFilter();
    filter.connect(env);env.connect(this.bus);
    const burst=voice==='hat'||voice==='clap';
    const source=burst?c.createBufferSource():c.createOscillator();
    const span=voice==='kick'?.25:voice==='clap'?.14:Math.min(len,.8);
    const peak=vel*({kick:.55,clap:.24,hat:.15,bass:.30,glass:.21,moss:.18,wire:.23}[voice]??.2);
    if(burst){
      source.buffer=this.noise;filter.type=voice==='hat'?'highpass':'bandpass';filter.frequency.value=voice==='hat'?7500:1650;
    }else{
      source.type=({kick:'sine',bass:'sawtooth',glass:'sine',moss:'triangle',wire:'square'})[voice];
      source.frequency.value=freq;
      if(voice==='kick'){
        source.frequency.setValueAtTime(140,t);source.frequency.exponentialRampToValueAtTime(42,t+.12);
      }
      filter.frequency.value=voice==='bass'?580:voice==='wire'?1350:voice==='moss'?1100:13000;
      if(tone!==undefined && (voice==='glass'||voice==='moss')){
        source.type=voice==='glass'?(tone>.64?'triangle':'sine'):(tone>.71?'sine':'triangle');
        filter.frequency.value=480+tone*5200;
      }
      if(voice==='bass'||voice==='wire'){
        filter.frequency.setValueAtTime(450+vel*1250+(tone??0)*800,t);
        filter.frequency.exponentialRampToValueAtTime(300,t+span);
      }
    }
    env.gain.setValueAtTime(.0001,t);
    env.gain.exponentialRampToValueAtTime(Math.max(.001,peak),t+(voice==='moss'?.09:.006));
    if(voice==='clap'){
      env.gain.setValueAtTime(peak*.25,t+.016);
      env.gain.linearRampToValueAtTime(peak*.82,t+.022);
      env.gain.setValueAtTime(peak*.30,t+.032);
      env.gain.linearRampToValueAtTime(peak*.70,t+.038);
    }
    env.gain.exponentialRampToValueAtTime(.0001,t+span);
    source.connect(filter);this.voices.add(source);
    source.onended=()=>{this.voices.delete(source);source.disconnect();filter.disconnect();env.disconnect();};
    source.start(t);source.stop(t+span+.008);
  }
}
