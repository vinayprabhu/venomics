// Locally rendered original soundtrack, independent of Web Audio scheduling.
export class Atmosphere {
 constructor(){
  this.animal=new Audio();this.animal.preload='auto';this.animal.hidden=true;this.animal.dataset.effect='animal';document.body.append(this.animal);this.animalId=null;this.audio=document.querySelector('#ambient-audio');this.flow=document.querySelector('#flow-audio');this.button=document.querySelector('#sound');this.volume=document.querySelector('#volume');this.enabled=true;this.pending=false;this.biological=false;this.circulation=false;this.clickIndex=0;
  this.clicks=Array.from({length:5},()=>{const a=new Audio('media/audio/interface-click.wav');a.preload='auto';a.dataset.effect='click';a.hidden=true;document.body.append(a);return a;});
  this.audio.loop=this.flow.loop=true;this.audio.muted=this.flow.muted=false;this.mix();
  this.button.addEventListener('click',()=>{if(this.pending)return;if(!this.audio.paused){this.enabled=false;this.audio.pause();this.flow.pause();this.animal.pause();this.clicks.forEach(a=>a.pause());}else{this.enabled=true;this.click();this.start();}this.sync();});
  this.volume.addEventListener('input',()=>{this.mix();if(Number(this.volume.value)>0&&this.audio.paused){this.enabled=true;this.start();}this.sync();});
  document.addEventListener('click',e=>{if(e.target.closest('#sound'))return;this.click();this.start();},true);
  for(const event of ['playing','pause','ended','volumechange'])this.audio.addEventListener(event,()=>{this.pending=false;this.sync()});
  this.audio.addEventListener('error',()=>{this.pending=false;this.button.textContent='↻ Retry sound';this.button.title='Audio could not load. Tap to retry.';this.button.setAttribute('aria-pressed','false');});
  document.addEventListener('visibilitychange',()=>{if(document.hidden){this.flow.pause();this.animal.pause();}else if(this.enabled){if(this.biological)this.playFlow();this.playAnimal();}});
  this.sync();this.smoke();
 }
 mix(){const volume=Number(this.volume.value);this.audio.volume=volume*(this.biological?.42:this.animalId?.46:1);this.flow.volume=volume*.86;this.animal.volume=volume*.83;this.clicks?.forEach(a=>a.volume=volume*.65);}
 click(){if(!this.enabled||!Number(this.volume.value))return;const a=this.clicks[this.clickIndex++%this.clicks.length];a.currentTime=0;a.play().catch(()=>{});}
 sync(){const playing=!this.audio.paused&&!this.audio.muted&&Number(this.volume.value)>0;this.button.textContent=this.pending?'… Loading audio':playing?'Ⅱ Sound on':'▶ Play sound';this.button.setAttribute('aria-pressed',String(playing));this.button.setAttribute('aria-label',playing?'Mute all sounds':'Play sound');this.button.title=playing?'Mute music, animal sounds, clicks and blood-flow sound':'Play music and sound effects';document.querySelector('#sound-controls').classList.toggle('playing',playing);}
 async start(){if(!this.enabled||this.pending||!this.audio.paused)return;this.pending=true;this.sync();try{if(this.audio.error)this.audio.load();this.audio.muted=false;await this.audio.play();if(this.biological)this.playFlow();this.playAnimal();}catch(error){this.button.title='Tap Play sound to enable audio in your browser.';}finally{this.pending=false;this.sync();}}
 playFlow(){if(this.enabled&&this.circulation&&!document.hidden)this.flow.play().catch(()=>{});}
 setBiologicalAction(active,circulation=false){this.biological=active;this.circulation=active&&circulation;this.mix();if(this.circulation)this.playFlow();else{this.flow.pause();this.flow.currentTime=0;}}
 setAnimal(id){if(id===this.animalId)return;this.animal.pause();this.animal.currentTime=0;this.animalId=id;if(id){this.animal.src=`media/audio/adventures/${id}.mp3`;this.animal.loop=true;}this.mix();if(id)this.playAnimal();}
 playAnimal(){if(this.animalId&&this.enabled&&!document.hidden)this.animal.play().catch(()=>{});}
 smoke(){
  const canvas=document.querySelector('#smoke'),ctx=canvas.getContext('2d');if(!ctx)return;document.body.classList.add('smoke-ready');
  const size=256,texture=document.createElement('canvas');texture.width=texture.height=size;const tc=texture.getContext('2d'),im=tc.createImageData(size,size);let seed=34951;const rand=()=>{seed=seed*16807%2147483647;return(seed-1)/2147483646};const grids=[4,8,16,32].map(n=>({n,values:Array.from({length:(n+1)*(n+1)},rand)}));const smooth=x=>x*x*(3-2*x);
  const noise=(x,y,g)=>{const px=x/size*g.n,py=y/size*g.n,ix=Math.floor(px),iy=Math.floor(py),u=smooth(px-ix),v=smooth(py-iy),w=g.n+1;return(g.values[iy*w+ix]*(1-u)+g.values[iy*w+ix+1]*u)*(1-v)+(g.values[(iy+1)*w+ix]*(1-u)+g.values[(iy+1)*w+ix+1]*u)*v;};
  for(let y=0;y<size;y++)for(let x=0;x<size;x++){const n=grids.reduce((v,g,i)=>v+noise(x,y,g)*[.54,.26,.13,.07][i],0),dx=(x-128)/128,dy=(y-128)/128,edge=Math.max(0,1-dx*dx-dy*dy),ribbon=Math.pow(Math.max(0,1-Math.abs(n-.51)*3.3),3);const k=(y*size+x)*4;im.data[k]=235;im.data[k+1]=172;im.data[k+2]=66;im.data[k+3]=Math.min(255,edge*edge*ribbon*230);}
  tc.putImageData(im,0,0);const clouds=Array.from({length:21},(_,i)=>({x:rand()*1.5-.25,y:rand(),s:.4+rand()*.55,v:.009+rand()*.012,phase:rand()*6.28,alpha:.44+rand()*.22,direction:i%2?1:-1}));
  const resize=()=>{canvas.width=Math.round(innerWidth*.75);canvas.height=Math.round(innerHeight*.75)};resize();addEventListener('resize',resize);let last=-100;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const frame=time=>{requestAnimationFrame(frame);if(document.hidden||time-last<48)return;last=time;const t=reduced?10:time/1000,w=canvas.width,h=canvas.height;ctx.clearRect(0,0,w,h);ctx.globalCompositeOperation='screen';for(const p of clouds){const s=w*p.s,x=(((p.x+t*p.v*p.direction)%1.6+1.6)%1.6-.3)*w,y=(p.y+Math.sin(t*.14+p.phase)*.14)*h;ctx.save();ctx.globalAlpha=p.alpha;ctx.translate(x,y);ctx.rotate(p.phase+Math.sin(t*.08+p.phase)*.6);ctx.scale(1.45,.7+Math.sin(t*.1+p.phase)*.12);ctx.drawImage(texture,-s/2,-s/2,s,s);ctx.restore();}};requestAnimationFrame(frame);
 }
}
export const atmosphere=new Atmosphere();
