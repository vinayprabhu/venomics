import * as T from './assets/three.module.js';
import {SceneRenderer} from './scene-renderer.js?v=13';

export const organSites={
 jararaca:{group:'lungs',title:'Lung microvasculature',target:'Capillary endothelium · ACE',caption:'Captopril enters circulation · distinct from teprotide',note:'Pulmonary capillary endothelium is a representative high-ACE vascular bed. Captopril is systemic; this is not a claim of lung-exclusive action. The cited pulmonary study used enalaprilat and supports localization, not a captopril-specific experiment. The reference lung surface does not resolve capillaries or ACE molecules.',url:'https://pubmed.ncbi.nlm.nih.gov/11827728/'},
 gila:{group:'pancreas',title:'Pancreas',target:'Islet β cells · GLP-1R',caption:'Glucose-dependent insulin secretion',note:'Pancreatic beta-cell GLP-1 receptors illustrate the insulin-secretory action of exenatide. Gastric emptying and glucagon effects are additional actions. The pancreas mesh does not resolve islets or individual cells.',url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=e6cb5c8f-e97f-4a6a-95a4-939fd2393949'},
 cone:{group:'spinalCord',title:'Spinal cord',target:'Dorsal horn · presynaptic CaV2.2',caption:'Sensory afferent terminals · intrathecal delivery',note:'Ziconotide blocks N-type calcium channels on primary nociceptive afferent terminals in superficial dorsal-horn laminae I and II. The camera turns toward the posterior cord; the reference mesh does not resolve laminae or nerve terminals. The later channel animation is a separate molecular schematic.',url:'https://www.dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=57376a5b-4530-9018-e063-6394a90a9afe'},
 bee:{group:'subcutis',title:'Under the skin',target:'Subcutaneous venom extract → immune response',caption:'Schematic injection site · distributed immune response',note:'Venom extract is administered subcutaneously for immunotherapy. This schematic skin cutaway locates the injection depot; it does not identify a single target organ or show actual drug distribution. Api m 1 represents one component of the extract. The subsequent immune-cell scene illustrates one contributing protective process; regulatory T and B cells and IL-10 also contribute.',url:'https://dailymed.nlm.nih.gov/dailymed/drugInfo.cfm?setid=9aeb05aa-6de7-433a-9476-180fa8cba467'}
};
const colors={skin:0x7c9ca1,ribs:0xc8b993,heart:0x9e3c32,lungs:0xb58c74,pancreas:0xc6a351,spinalCord:0xa9cccf,spleen:0x8b4f74,lymphNodes:0xc4d694,vessels:0x844b46};
const smooth=t=>{t=T.MathUtils.clamp(t,0,1);return t*t*(3-2*t)};
const vec=a=>new T.Vector3(...a);

// A clearly labelled tissue schematic, not an anatomical scan or a spleen target.
function skinCutaway(){
 const layers=[['epidermis',.38,.14,0xc7a98b],['dermis',.02,.58,0xad796b],['subcutis',-.7,.82,0xcfaf69]];
 return {meshes:layers.map(([group,y,height,color])=>{
  const mesh=new T.BoxGeometry(4.8,height,2.4,24,1,12),p=mesh.attributes.position;
  for(let i=0;i<p.count;i++)p.setY(i,p.getY(i)+y+.055*Math.sin(p.getX(i)*1.6)*Math.cos(p.getZ(i)*1.7));
  const part={group,name:group,color,vertices:Array.from(p.array),indices:Array.from(mesh.index.array)};mesh.dispose();return part;
 })};
}
function addNeedle(root){
 const tip=new T.Vector3(-.35,-.72,.55),entry=new T.Vector3(-2,1.45,.55),direction=entry.clone().sub(tip);
 const needle=new T.Mesh(new T.CylinderGeometry(.025,.025,direction.length(),24),new T.MeshStandardMaterial({color:0xdce4e6,metalness:.7,roughness:.25}));
 needle.position.copy(tip).add(entry).multiplyScalar(.5);needle.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),direction.normalize());root.add(needle);
 const barrel=new T.Mesh(new T.CylinderGeometry(.11,.11,.8,32),new T.MeshStandardMaterial({color:0xa8d7df,transparent:true,opacity:.5,roughness:.25}));
 barrel.position.copy(entry).addScaledVector(direction,.4);barrel.quaternion.copy(needle.quaternion);root.add(barrel);
}

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
  this.stop();const epoch=this.epoch;this.host=host;this.id=id;this.site=organSites[id];this.host.classList.add('organ-view');this.canvas.setAttribute('aria-label',id==='bee'?'Rotatable schematic skin cutaway showing a subcutaneous injection depot':'Rotatable human anatomical reference with a highlighted site of action');
  const loading=document.createElement('span');loading.className='organ-caption';loading.textContent='Loading anatomy…';host.append(loading);
  let data;try{data=id==='bee'?skinCutaway():await this.load()}catch{if(epoch===this.epoch)loading.textContent='Anatomy unavailable · continue to mechanism';return;}
  if(epoch!==this.epoch)return;loading.remove();
  this.root=new T.Group();this.scene.add(this.root);this.parts=[];
  for(const part of data.meshes){
   const geometry=new T.BufferGeometry();geometry.setAttribute('position',new T.Float32BufferAttribute(part.vertices,3));geometry.setIndex(part.indices);geometry.computeVertexNormals();
   const target=part.group===this.site.group;
   const material=new T.MeshStandardMaterial({color:part.color??(target?0xefc17e:colors[part.group]||0x738780),roughness:.6,metalness:.06,transparent:true,opacity:1,depthWrite:target,side:T.DoubleSide,emissive:target?0x99521d:0,emissiveIntensity:.15});
   const mesh=new T.Mesh(geometry,material);mesh.userData={group:part.group,target,name:part.name};this.root.add(mesh);this.parts.push(mesh);
  }
  this.focusParts=this.parts.filter(p=>p.userData.target);
  if(!this.focusParts.length){loading.textContent='Anatomical target unavailable · continue to mechanism';host.append(loading);return;}
  this.bounds=new T.Box3();this.focusBounds=new T.Box3();
  this.parts.forEach(p=>this.bounds.expandByObject(p));this.focusParts.forEach(p=>this.focusBounds.expandByObject(p));
  this.payload=payload;if(payload){this.root.add(payload);payload.userData.entry=true;}
  this.startCenter=this.bounds.getCenter(new T.Vector3());this.focus=this.focusBounds.getCenter(new T.Vector3());this.focusSize=this.focusBounds.getSize(new T.Vector3());
  if(id==='cone')this.focusSize.set(.7,1.8,.7); // Camera window on the actual cord, not a fabricated dorsal-horn mesh.
  if(id==='bee'){this.focus.set(-.35,-.72,.55);this.focusSize.set(3,2,1.7);addNeedle(this.root);}
  host.prepend(this.canvas);
  this.label=document.createElement('span');this.label.className='organ-label';this.label.textContent=id==='bee'?'Subcutaneous depot':this.site.title;host.append(this.label);
  const credit=document.createElement('span');credit.className='organ-credit';credit.textContent=id==='bee'?'Skin cutaway · schematic · not to scale':'BodyParts3D / DBCLS · anatomical reference';host.append(credit);this.credit=credit;
  this.reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.begin=performance.now();this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();
  const tick=now=>{if(epoch!==this.epoch)return;this.frame=requestAnimationFrame(tick);const elapsed=(now-this.begin)/1000;const progress=this.reduced?1:smooth((elapsed-1.1)/3.9);this.positionCamera(progress);
   if(this.flight){const u=smooth((now-this.flight.start)/this.flight.duration);this.camera.position.lerpVectors(this.flight.from,this.flight.to,u);this.target.copy(this.flight.focus);if(u>=1){const done=this.flight.resolve;this.flight=null;done(true);}}
   if(this.payload){const travel=smooth((elapsed-.7)/3.7),start=id==='bee'?new T.Vector3(-2,1.45,.55):id==='cone'?this.focus.clone().add(new T.Vector3(-.6,.5,-.5)):this.startCenter.clone().add(new T.Vector3(-4,1,2));this.payload.position.lerpVectors(start,this.focus,travel);this.payload.rotation.y=elapsed*.6;this.payload.scale.setScalar(1-travel*.7);this.payload.visible=id==='bee'||elapsed<6; }
   this.camera.lookAt(this.target);
   for(const mesh of this.parts){const group=mesh.userData.group,target=mesh.userData.target;mesh.material.opacity=id==='bee'?(target?.48:group==='epidermis'?.26:.2):target?1:group==='skin'?.065*(1-progress):group==='ribs'?.42*(1-progress):.42*(1-progress);mesh.material.emissiveIntensity=target?.23+(this.reduced?0:.1*Math.sin(elapsed*3)):0;mesh.visible=mesh.material.opacity>.02;}
   this.renderer.render(this.scene,this.camera);this.root.updateMatrixWorld();const point=this.focus.clone().applyMatrix4(this.root.matrixWorld).project(this.camera);
   this.label.style.left=T.MathUtils.clamp((point.x*.5+.5)*100,18,82)+'%';this.label.style.top=T.MathUtils.clamp((-point.y*.5+.5)*100+23,32,83)+'%';this.label.style.opacity=this.flight?'0':'1';
  };this.frame=requestAnimationFrame(tick);
 }
 fit(size,minimum=0){const tangent=Math.tan(T.MathUtils.degToRad(this.camera.fov/2));return Math.max(size.y,size.x/this.camera.aspect,minimum)/(2*tangent)*1.16+size.z*.4;}
 positionCamera(progress){const size=this.bounds.getSize(new T.Vector3()),fromDistance=this.fit(size),toDistance=this.fit(this.focusSize,this.id==='cone'?1.9:this.id==='bee'?2:1.4);this.target.lerpVectors(this.startCenter,this.focus,progress);const distance=T.MathUtils.lerp(fromDistance,toDistance,progress),angle=T.MathUtils.lerp(.2,this.id==='cone'?Math.PI-.15:this.id==='gila'?-.18:.1,progress);this.camera.position.copy(this.target).add(new T.Vector3(Math.sin(angle)*distance,distance*(this.id==='bee'?.38:.035),Math.cos(angle)*distance));}
 resize(){if(!this.host)return;const {width,height}=this.host.getBoundingClientRect();if(!width||!height)return;this.renderer.setSize(width,height);this.camera.aspect=width/height;this.camera.updateProjectionMatrix();}
 enterTarget(){if(!this.root||this.reduced)return Promise.resolve(true);return new Promise(resolve=>{const from=this.camera.position.clone(),focus=this.target.clone(),to=from.clone().lerp(focus,.72);this.flight={start:performance.now(),duration:1100,from,to,focus,resolve};});}
 stop(){this.epoch++;cancelAnimationFrame(this.frame);this.observer?.disconnect();this.flight?.resolve(false);this.flight=null;this.canvas.remove();this.label?.remove();this.credit?.remove();if(this.root){this.scene.remove(this.root);this.root.traverse(p=>{p.geometry?.dispose();p.material?.dispose()});this.root=null;}this.host?.classList.remove('organ-view');this.host=null;}
}
