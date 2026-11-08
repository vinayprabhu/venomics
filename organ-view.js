import * as T from './assets/three.module.js';
import {SceneRenderer} from './scene-renderer.js?v=13';

export const organSites={
 jararaca:{group:'lungs',title:'Lung microvasculature',target:'Capillary endothelium · ACE',caption:'Representative vascular bed · ACE also acts elsewhere',note:'Pulmonary capillary endothelium is a representative high-ACE vascular bed. Captopril is systemic; this is not a claim of lung-exclusive action. The reference lung surface does not resolve capillaries or ACE molecules.',url:'https://pubmed.ncbi.nlm.nih.gov/11827728/'},
 gila:{group:'pancreas',title:'Pancreas',target:'Islet β cells · GLP-1R',caption:'Glucose-dependent insulin secretion',note:'Pancreatic beta-cell GLP-1 receptors illustrate the insulin-secretory action of exenatide. Gastric emptying and glucagon effects are additional actions. The pancreas mesh does not resolve islets or individual cells.',url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=53d03c03-ebf7-418d-88a8-533eabd2ee4f'},
 cone:{group:'spinalCord',title:'Spinal cord',target:'Dorsal horn · presynaptic CaV2.2',caption:'Sensory afferent terminals · intrathecal delivery',note:'Ziconotide blocks N-type calcium channels on primary nociceptive afferent terminals in superficial dorsal-horn laminae I and II. The camera turns toward the posterior cord; the reference mesh does not resolve laminae or nerve terminals. The later channel animation is a separate molecular schematic.',url:'https://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=57376a5b-4530-9018-e063-6394a90a9afe'},
 bee:{group:'spleen',title:'Immune system',target:'Spleen · lymphoid context',caption:'Distributed immune tolerance · not spleen-specific',note:'Venom immunotherapy changes a distributed immune response, including T- and B-cell regulation, blocking antibodies and effector-cell responses. The spleen is shown only as a representative lymphoid organ, not a demonstrated primary site of venom-immunotherapy action, injection site or single-organ target; lymph nodes and immune cells elsewhere also contribute. The later IgG animation illustrates one contributing mechanism.',url:'https://www.jci.org/articles/view/2250'}
};
const colors={skin:0x7c9ca1,ribs:0xc8b993,heart:0x9e3c32,lungs:0xb58c74,pancreas:0xc6a351,spinalCord:0xa9cccf,spleen:0x8b4f74,lymphNodes:0xc4d694,vessels:0x844b46};
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
const vec=a=>new T.Vector3(...a);

export class OrganView {
 constructor(){
  this.epoch=0;this.canvas=document.createElement('canvas');this.renderer=new SceneRenderer({canvas:this.canvas});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor(0);
  this.scene=new T.Scene();this.scene.add(new T.AmbientLight(0xdde5e8,1.5));
  const key=new T.DirectionalLight(0xffe6c5,2.8);key.position.set(-5,7,8);this.scene.add(key);
  const fill=new T.DirectionalLight(0x97c7dc,1.7);fill.position.set(6,2,-5);this.scene.add(fill);
  this.camera=new T.PerspectiveCamera(34,1,.01,250);this.target=new T.Vector3();
  this.canvas.setAttribute('role','img');this.canvas.setAttribute('aria-label','Rotatable human anatomical reference with a highlighted site of action');
  this.canvas.addEventListener('pointerdown',e=>{this.drag=[e.clientX,e.clientY];this.canvas.setPointerCapture(e.pointerId)});
  this.canvas.addEventListener('pointermove',e=>{if(!this.drag||!this.root)return;this.root.rotation.y+=(e.clientX-this.drag[0])*.009;this.root.rotation.x=T.MathUtils.clamp(this.root.rotation.x+(e.clientY-this.drag[1])*.006,-.7,.7);this.drag=[e.clientX,e.clientY]});
  for(const e of ['pointerup','pointercancel'])this.canvas.addEventListener(e,()=>this.drag=null);
 }
 async load(){if(!this.loading)this.loading=fetch('data/organ-meshes.json?v=11').then(r=>{if(!r.ok)throw Error('Anatomy unavailable');return r.json()});return this.loading;}
 async mount(host,id,payload=null){
  this.stop();const epoch=this.epoch;this.host=host;this.id=id;this.site=organSites[id];this.host.classList.add('organ-view');
  const loading=document.createElement('span');loading.className='organ-caption';loading.textContent='Loading anatomy…';host.append(loading);
  let data;try{data=await this.load()}catch{if(epoch===this.epoch)loading.textContent='Anatomy unavailable · continue to mechanism';return;}
  if(epoch!==this.epoch)return;loading.remove();
  this.root=new T.Group();this.scene.add(this.root);this.parts=[];
  for(const part of data.meshes){
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(part.vertices,3));geometry.setIndex(part.indices);geometry.computeVertexNormals();
   const target=part.group===this.site.group;
   const material=new T.MeshStandardMaterial({color:target?0xefc17e:colors[part.group]||0x738780,roughness:.6,metalness:.06,transparent:true,opacity:1,depthWrite:target,side:T.DoubleSide,emissive:target?0x99521d:0,emissiveIntensity:.15});
   const mesh=new T.Mesh(geometry,material);mesh.userData={group:part.group,target,name:part.name};this.root.add(mesh);this.parts.push(mesh);
  }
  this.focusParts=this.parts.filter(p=>p.userData.target);
  if(!this.focusParts.length){loading.textContent='Anatomical target unavailable · continue to mechanism';host.append(loading);return;}
  this.bounds=new T.Box3();this.focusBounds=new T.Box3();
  this.parts.forEach(p=>this.bounds.expandByObject(p));this.focusParts.forEach(p=>this.focusBounds.expandByObject(p));
  this.payload=payload;if(payload){this.root.add(payload);payload.userData.entry=true;}
  this.startCenter=this.bounds.getCenter(new T.Vector3());this.focus=this.focusBounds.getCenter(new T.Vector3());this.focusSize=this.focusBounds.getSize(new T.Vector3());
  if(id==='cone')this.focusSize.set(.7,1.8,.7); // Camera window on the actual cord, not a fabricated dorsal-horn mesh.
  host.prepend(this.canvas);
  this.label=document.createElement('span');this.label.className='organ-label';this.label.textContent=id==='bee'?'Spleen · lymphoid context':this.site.title;host.append(this.label);
  const credit=document.createElement('span');credit.className='organ-credit';credit.textContent='BodyParts3D / DBCLS · anatomical reference';host.append(credit);this.credit=credit;
  this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.begin=performance.now();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
  const tick=now=>{if(epoch!==this.epoch)return;this.frame=requestAnimationFrame(tick);const elapsed=(now-this.begin)/1000;const progress=this.reduced?1:smooth((elapsed-1.1)/3.9);this.positionCamera(progress);
   if(this.flight){const u=smooth((now-this.flight.start)/this.flight.duration);this.camera.position.lerpVectors(this.flight.from,this.flight.to,u);this.target.copy(this.flight.focus);if(u>=1){const done=this.flight.resolve;this.flight=null;done(true);}}
   if(this.payload){const travel=smooth((elapsed-.7)/3.7),start=this.startCenter.clone().add(new T.Vector3(-4,1,2));this.payload.position.lerpVectors(start,this.focus,travel);this.payload.rotation.y=elapsed*.6;this.payload.scale.setScalar(1-travel*.7);this.payload.visible=elapsed<6; }
   this.camera.lookAt(this.target);
   for(const mesh of this.parts){const group=mesh.userData.group,target=mesh.userData.target;mesh.material.opacity=target?1:group==='skin'?.065*(1-progress):group==='ribs'?.42*(1-progress):.42*(1-progress);mesh.material.emissiveIntensity=target?.23+(this.reduced?0:.1*Math.sin(elapsed*3)):0;mesh.visible=mesh.material.opacity>.02;}
   this.renderer.render(this.scene,this.camera);this.root.updateMatrixWorld();const point=this.focus.clone().applyMatrix4(this.root.matrixWorld).project(this.camera);
   this.label.style.left=T.MathUtils.clamp((point.x*.5+.5)*100,18,82)+'%';this.label.style.top=T.MathUtils.clamp((-point.y*.5+.5)*100+23,32,83)+'%';this.label.style.opacity=this.flight?'0':'1';
  };this.frame=requestAnimationFrame(tick);
 }
 fit(size,minimum=0){const tangent=Math.tan(T.MathUtils.degToRad(this.camera.fov/2));return Math.max(size.y,size.x/this.camera.aspect,minimum)/(2*tangent)*1.16+size.z*.4;}
 positionCamera(progress){const size=this.bounds.getSize(new T.Vector3()),fromDistance=this.fit(size),toDistance=this.fit(this.focusSize,this.id==='cone'?1.9:this.id==='bee'?2:1.4);this.target.lerpVectors(this.startCenter,this.focus,progress);const distance=T.MathUtils.lerp(fromDistance,toDistance,progress),angle=T.MathUtils.lerp(.2,this.id==='cone'?Math.PI-.15:this.id==='gila'?-.18:.1,progress);this.camera.position.copy(this.target).add(new T.Vector3(Math.sin(angle)*distance,distance*.035,Math.cos(angle)*distance));}
 resize(){if(!this.host)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();}
 enterTarget(){if(!this.root||this.reduced)return Promise.resolve(true);return new Promise(resolve=>{const from=this.camera.position.clone(),focus=this.target.clone(),to=from.clone().lerp(focus,.72);this.flight={start:performance.now(),duration:1100,from,to,focus,resolve};});}
 stop(){this.epoch++;cancelAnimationFrame(this.frame);this.observer?.disconnect();this.flight?.resolve(false);this.flight=null;this.canvas.remove();this.label?.remove();this.credit?.remove();if(this.root){this.scene.remove(this.root);this.root.traverse(p=>{p.geometry?.dispose();p.material?.dispose()});this.root=null;}this.host?.classList.remove('organ-view');this.host=null;}
}
