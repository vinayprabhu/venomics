import * as T from './assets/three.module.js';
import {SceneRenderer} from './scene-renderer.js?v=13';
import {ball,bond} from './molecule-geometry.js?v=11';
const V=a=>new T.Vector3(...a),C={gland:0xc5ac65,duct:0x758f92,tooth:0xcbd4d0,venom:0xf1d987,outline:0x415355};
function curve(g,points,r,color,taper=false){const c=new T.CatmullRomCurve3(points.map(V)),geometry=new T.TubeGeometry(c,100,r,16,false);if(taper){const a=geometry.attributes.position;for(let i=0;i<a.count;i++){const u=Math.floor(i/17)/100,center=c.getPointAt(u),v=new T.Vector3().fromBufferAttribute(a,i).sub(center).multiplyScalar(1-u*.96).add(center);a.setXYZ(i,v.x,v.y,v.z);}geometry.computeVertexNormals();}const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.35,metalness:.05}));g.add(mesh);return c;}
function gland(g,p,r,scale,color){
 const geometry=new T.SphereGeometry(1,64,40);geometry.type='GlandSurface';const a=geometry.attributes.position;
 for(let i=0;i<a.count;i++){const x=a.getX(i),y=a.getY(i),z=a.getZ(i),theta=Math.atan2(z,y),taper=.76-.25*x+.13*Math.sin(x*2.2),rib=1+.025*Math.cos(theta*14+x*3)*(1-x*x);a.setXYZ(i,x*r*scale[0],y*r*scale[1]*taper*rib,z*r*scale[2]*taper*rib);}geometry.computeVertexNormals();const mesh=new T.Mesh(geometry,new T.MeshStandardMaterial({color,roughness:.48,metalness:.03}));mesh.position.copy(V(p));g.add(mesh);return mesh;
}
function ellipsoid(g,p,r,scale,color){const b=ball(g,V(p),r,color);b.scale.multiply(V(scale));return b;}
export function anatomyScene(id,stage){const root=new T.Group(),flow=new T.Group();root.add(flow);let path,labels=[],lancets=[];
 if(id==='jararaca'){
  gland(root,[-2.1,1.2,0],.9,[1.35,.72,.65],0xbea080);
  ellipsoid(root,[.7,1,0],.29,[1.35,.65,.7],C.gland);
  path=curve(root,[[-1.2,1.2,0],[-.1,1.05,0],[1.2,.8,0],[1.6,.25,0],[1.42,-1.55,0]],.09,C.duct);
  curve(root,[[1.1,.8,-.1],[1.72,.25,-.1],[1.62,-.9,-.1],[1.4,-1.7,-.1]],.22,C.tooth,true);
  curve(root,[[-3.3,.2,-.7],[-2.1,-.3,-.7],[.1,-.25,-.7],[2.6,.3,-.7]],.045,C.outline);
  labels=[['Venom gland',[-2.1,2.3,0]],['Duct',[.2,1.7,0]],['Hollow fang',[2.2,-.8,0]]];
 }else if(id==='gila'){
  for(let i=0;i<6;i++)gland(root,[-2.2+i*.55,-1.4,0],.41,[.8,1,.6],0xbea080);
  curve(root,[[-3,-.3,-.5],[-1,-.65,-.5],[1.2,-.4,-.5],[2.2,.25,-.5]],.1,C.outline);
  for(let i=0;i<5;i++){const x=-2.15+i*.8;curve(root,[[x,-.5,0],[x+.05,.4,0],[x+.32,.75,0]],.13,C.tooth,true);curve(root,[[x,-.8,.1],[x+.06,.35,.1],[x+.24,.62,.1]],.035,C.venom);}
  path=curve(root,[[-1.6,-1.4,.1],[-1.35,-.8,.1],[-1.3,-.3,.2],[-1.3,.4,.2],[-1.1,.7,.2]],.055,C.duct);
  labels=[['Lower-jaw glands',[-1.3,-2.5,0]],['Grooved teeth',[.2,1.65,0]]];
 }else if(id==='cone'){
  ellipsoid(root,[-3,1,0],.55,[1.25,.85,.8],C.outline);
  const coils=[];for(let i=0;i<=70;i++){const u=i/70;coils.push([-2.3+u*3.8,Math.sin(u*Math.PI*8)*.55+.7,Math.cos(u*Math.PI*8)*.4]);}
  path=curve(root,[[-2.6,1,0],...coils,[2,.1,0],[2.5,-.5,0],[3.1,-.9,0]],.075,C.gland);
  curve(root,[[1.8,-.2,0],[2.5,-.7,0],[3.3,-1.2,0]],.15,C.tooth,true);
  const tip=new T.Mesh(new T.ConeGeometry(.16,.65,32),new T.MeshStandardMaterial({color:C.tooth}));tip.position.set(3.4,-1.3,0);tip.rotation.z=-2.1;root.add(tip);
  labels=[['Muscular bulb',[-3,2.15,0]],['Venom duct',[-.4,1.9,0]],['Radular tooth',[2.4,-2,0]]];
 }else{
  gland(root,[-1.7,.7,0],1,[1.15,.7,.65],0xbea080);
  curve(root,[[-2.1,1.3,0],[-2.45,2.1,0],[-3.1,2.5,0]],.065,C.gland);curve(root,[[-2.45,2.1,0],[-1.8,2.7,0]],.065,C.gland);
  path=curve(root,[[-.7,.7,0],[.1,.3,0],[1,-.35,0],[2,-1.1,0]],.085,C.duct);
  for(const z of [-.16,.16]){const l=new T.Group();root.add(l);curve(l,[[.1,.3,z],[1.2,-.55,z],[2.7,-1.55,z]],.08,C.tooth,true);lancets.push(l);}curve(root,[[.1,.4,0],[1.2,-.45,0],[2.85,-1.55,0]],.06,C.outline);
  labels=[['Venom gland',[-2.3,3,0]],['Venom sac',[-2.1,-.4,0]],['Paired lancets',[2.3,-2.35,0]]];
 }
 const particles=Array.from({length:20},()=>ball(flow,V([0,0,0]),.045,C.venom));const end=path.getPoint(1),drop=ellipsoid(root,end.toArray(),.24,[.8,1.3,.8],C.venom);drop.visible=stage===2;
 return {root,labels,focus:stage===2?drop:root,update(time){particles.forEach((p,i)=>{p.position.copy(path.getPoint(((time*.18+i/20)%1+1)%1));p.position.z+=.19;});if(stage===2){const u=(time*.4)%1;drop.position.copy(end).add(V([0,-u*1.4,0]));drop.scale.set(.19+u*.13,.31+u*.17,.19+u*.13);drop.visible=u<.9;}lancets.forEach((l,i)=>{l.position.set(Math.sin(time*7+i*Math.PI)*.09,-Math.sin(time*7+i*Math.PI)*.06,0)});}};
}
export class AnatomyView{
 constructor(){this.canvas=document.createElement('canvas');this.renderer=new SceneRenderer({canvas:this.canvas});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.5));this.renderer.setClearColor(0,0);this.scene=new T.Scene();this.scene.add(new T.AmbientLight(0xffffff,2));const l=new T.DirectionalLight(0xffffff,4);l.position.set(-4,7,8);this.scene.add(l);this.camera=new T.PerspectiveCamera(36,1,.1,100);this.camera.position.z=15;this.canvas.addEventListener('pointerdown',e=>{this.drag=[e.clientX,e.clientY];this.canvas.setPointerCapture(e.pointerId)});this.canvas.addEventListener('pointermove',e=>{if(!this.drag)return;this.current.root.rotation.y+=(e.clientX-this.drag[0])*.009;this.current.root.rotation.x+=(e.clientY-this.drag[1])*.008;this.drag=[e.clientX,e.clientY];this.manual=true;});this.canvas.addEventListener('pointerup',()=>this.drag=null);this.canvas.addEventListener('pointercancel',()=>this.drag=null);}
 use(id,s){if(this.current)this.scene.remove(this.current.root);this.current=anatomyScene(id,s);this.scene.add(this.current.root);this.current.root.rotation.y=-.12;}
 snapshot(id,s){this.stop();this.use(id,s);this.renderer.setSize(320,240);this.camera.aspect=320/240;this.camera.position.z=13;this.camera.updateProjectionMatrix();this.current.update(1);this.renderer.last=0;this.renderer.render(this.scene,this.camera);this.current.root.updateMatrixWorld();const point=this.current.focus.getWorldPosition(new T.Vector3()).project(this.camera);this.snapshotFocus=[point.x*.5+.5,-point.y*.5+.5];return this.canvas.toDataURL();}
 mount(host,id,s){this.stop();this.use(id,s);this.host=host;this.canvas.setAttribute('aria-label','Rotatable anatomical schematic');host.append(this.canvas);this.labels=this.current.labels.map(([text,p])=>{const el=document.createElement('span');el.className='anatomy-label';el.textContent=text;host.append(el);return {el,p:V(p)}});this.manual=false;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;this.observer=new ResizeObserver(()=>this.resize());this.observer.observe(host);this.resize();const begin=performance.now();const tick=now=>{this.frame=requestAnimationFrame(tick);const time=reduced?1:Math.max(0,(now-begin)/1000);this.current.update(time);if(!this.manual)this.current.root.rotation.y=-.12+Math.sin(time*.3)*.14;this.renderer.render(this.scene,this.camera);this.current.root.updateMatrixWorld();for(const l of this.labels){const p=l.p.clone().applyMatrix4(this.current.root.matrixWorld).project(this.camera);l.el.style.left=(p.x*.5+.5)*100+'%';l.el.style.top=(-p.y*.5+.5)*100+'%';}};this.frame=requestAnimationFrame(tick);}
 resize(){if(!this.host)return;const {width:w,height:h}=this.host.getBoundingClientRect();this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.position.z=13/Math.min(1,w/h);this.camera.updateProjectionMatrix();}
 stop(){cancelAnimationFrame(this.frame);this.observer?.disconnect();this.canvas.remove();this.labels?.forEach(l=>l.el.remove());this.host=null;}
}
