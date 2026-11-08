import * as T from './assets/three.module.js';
import {SceneRenderer} from './scene-renderer.js?v=13';
const cache=new Map();
const angles={jararaca:-.93,gila:.78,cone:.78,bee:.78};
// The supplied GLBs contain static, textured triangle meshes. No invented rig or anatomy.
export async function loadAnimal(id){
 if(cache.has(id))return cache.get(id);
 const promise=(async()=>{
  const response=await fetch(`media/models/${id}.glb`);if(!response.ok)throw Error('Model unavailable');
  const buffer=await response.arrayBuffer(),dv=new DataView(buffer);if(dv.getUint32(0,true)!==0x46546c67||dv.getUint32(4,true)!==2)throw Error('Invalid GLB');
  let json,bin;for(let p=12;p<buffer.byteLength;){const n=dv.getUint32(p,true),type=dv.getUint32(p+4,true);const chunk=buffer.slice(p+8,p+8+n);if(type===0x4e4f534a)json=JSON.parse(new TextDecoder().decode(chunk));if(type===0x004e4942)bin=chunk;p+=8+n;}
  const widths={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT4:16},types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array,5122:Int16Array,5120:Int8Array};
  const accessor=i=>{const a=json.accessors[i],v=json.bufferViews[a.bufferView],Type=types[a.componentType],w=widths[a.type],bytes=Type.BYTES_PER_ELEMENT,offset=(v.byteOffset||0)+(a.byteOffset||0),stride=v.byteStride||w*bytes,out=new Type(a.count*w);for(let j=0;j<a.count;j++)out.set(new Type(bin,offset+j*stride,w),j*w);return new T.BufferAttribute(out,w,!!a.normalized);};
  const textures=await Promise.all((json.textures||[]).map(async t=>{const im=json.images[t.source],v=json.bufferViews[im.bufferView],url=URL.createObjectURL(new Blob([bin.slice(v.byteOffset||0,(v.byteOffset||0)+v.byteLength)],{type:im.mimeType}));try{const image=new Image();image.src=url;await image.decode();const texture=new T.Texture(image);texture.flipY=false;texture.colorSpace=T.SRGBColorSpace;texture.needsUpdate=true;return texture;}finally{URL.revokeObjectURL(url)}}));
  const materials=(json.materials||[{}]).map(m=>{const p=m.pbrMetallicRoughness||{},c=p.baseColorFactor||[1,1,1,1];return new T.MeshStandardMaterial({color:new T.Color(c[0],c[1],c[2]),map:textures[p.baseColorTexture?.index],metalness:0,roughness:.82,side:m.doubleSided?T.DoubleSide:T.FrontSide,transparent:c[3]<1,opacity:c[3]});});
  const meshes=json.meshes.map(m=>{const group=new T.Group();for(const p of m.primitives){if(p.mode!==undefined&&p.mode!==4)continue;const g=new T.BufferGeometry();for(const [name,i]of Object.entries(p.attributes)){const attr={POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv'}[name];if(attr)g.setAttribute(attr,accessor(i));}if(p.indices!==undefined)g.setIndex(accessor(p.indices));if(!g.attributes.normal)g.computeVertexNormals();group.add(new T.Mesh(g,materials[p.material||0]));}return group;});
  const nodes=json.nodes.map(n=>{const g=n.mesh===undefined?new T.Group():meshes[n.mesh].clone();if(n.matrix){g.matrix.fromArray(n.matrix);g.matrix.decompose(g.position,g.quaternion,g.scale)}else{if(n.translation)g.position.fromArray(n.translation);if(n.rotation)g.quaternion.fromArray(n.rotation);if(n.scale)g.scale.fromArray(n.scale)}return g;});
  json.nodes.forEach((n,i)=>n.children?.forEach(j=>nodes[i].add(nodes[j])));const root=new T.Group();for(const i of json.scenes[json.scene||0].nodes)root.add(nodes[i]);const box=new T.Box3().setFromObject(root),size=box.getSize(new T.Vector3()),center=box.getCenter(new T.Vector3()),scale=6.8/Math.max(size.x,size.y,size.z);root.position.copy(center).multiplyScalar(-scale);root.scale.setScalar(scale);const model=new T.Group();model.add(root);return model;
 })();cache.set(id,promise);promise.catch(()=>{if(cache.get(id)===promise)cache.delete(id);});return promise;
}
export class FaunaView{
 constructor(preview=false){this.preview=preview;this.epoch=0;this.canvas=document.createElement('canvas');this.renderer=new SceneRenderer({canvas:this.canvas});this.renderer.setClearColor(0,0);this.renderer.setPixelRatio(Math.min(devicePixelRatio,preview?1.2:1.6));this.renderer.outputColorSpace=T.SRGBColorSpace;
 this.canvas.className='fauna-canvas';this.canvas.setAttribute('role','img');this.scene=new T.Scene();this.scene.add(new T.AmbientLight(0xffffff,2));const key=new T.DirectionalLight(0xfff1d7,2.8);key.position.set(-5,8,9);this.scene.add(key);const rim=new T.DirectionalLight(0xb4d7ff,2);rim.position.set(5,3,-6);this.scene.add(rim);this.camera=new T.PerspectiveCamera(34,1,.05,100);this.observer=new ResizeObserver(()=>this.resize());
 if(!preview){this.canvas.addEventListener('pointerdown',e=>{this.drag=[e.clientX,e.clientY];this.manual=true;this.canvas.setPointerCapture(e.pointerId)});this.canvas.addEventListener('pointermove',e=>{if(!this.drag||!this.model)return;this.yaw-=(e.clientX-this.drag[0])*.009;this.pitch=T.MathUtils.clamp(this.pitch+(e.clientY-this.drag[1])*.008,-.8,1.3);this.drag=[e.clientX,e.clientY]});for(const e of ['pointerup','pointercancel'])this.canvas.addEventListener(e,()=>this.drag=null);this.canvas.addEventListener('wheel',e=>{e.preventDefault();this.zoom=T.MathUtils.clamp(this.zoom+e.deltaY*.001,.65,1.7);this.manual=true;},{passive:false});}}
 async mount(host,id){
  this.stop();const epoch=this.epoch;this.id=id;this.host=host;this.manual=false;this.yaw=angles[id];this.pitch=id==='bee'?.51:.39;this.zoom=1;
  this.poster=host.querySelector('img');
  if(!this.poster){this.poster=new Image();this.poster.src=`media/models/${id}-poster.png`;this.poster.alt=`${id} model preview`;this.poster.className='fauna-poster';host.append(this.poster);}
  this.poster.hidden=false;this.canvas.style.opacity='0';host.dataset.modelState='loading';
  this.canvas.setAttribute('aria-label',`Rotatable ${id} model supplied by Venomics AI`);host.append(this.canvas);this.observer.observe(host);
  let model;try{model=await loadAnimal(id)}catch{
   if(epoch===this.epoch){host.dataset.modelState='fallback';if(!this.preview){const note=document.createElement('span');note.className='model-note';note.textContent='3D unavailable · image shown';host.append(note);}}return false;
  }
  if(epoch!==this.epoch)return false;
  this.model=model.clone();this.scene.add(this.model);this.start=performance.now();this.resize();
  let last=0;const reduced=matchMedia('(prefers-reduced-motion:reduce)').matches;
  const tick=now=>{if(epoch!==this.epoch)return;this.frame=requestAnimationFrame(tick);if(document.hidden||(this.preview&&document.body.classList.contains('zooming')))return;if(now-last<(this.preview?140:35))return;const rect=host.getBoundingClientRect();if(rect.bottom<0||rect.top>innerHeight)return;last=now;const t=(now-this.start)/1000;if(!this.manual&&!reduced){this.yaw=angles[id]+(this.preview?Math.sin(t*.45)*.19:Math.sin(t*.18)*.48);this.pitch=(id==='bee'?.51:.39)+Math.sin(t*.3)*.045;}this.position();this.paint();};
  this.frame=requestAnimationFrame(tick);return true;
 }
 paint(){
  if(!this.model||!this.host)return false;
  const painted=this.renderer.render(this.scene,this.camera);
  this.canvas.style.opacity=painted?'1':'0';this.poster.hidden=painted;
  this.host.dataset.modelState=painted?'ready':'fallback';return painted;
 }
 position(){const d=(this.preview?10.4:11.5)*this.zoom/Math.min(1,this.camera.aspect/1.35);this.camera.position.set(Math.sin(this.yaw)*Math.cos(this.pitch)*d,Math.sin(this.pitch)*d,Math.cos(this.yaw)*Math.cos(this.pitch)*d);this.camera.lookAt(0,0,0);}
 resize(){if(!this.host)return;const {width:w,height:h}=this.host.getBoundingClientRect();if(!w||!h)return;this.renderer.setSize(w,h);this.camera.aspect=w/h;this.camera.updateProjectionMatrix();this.position();this.renderer.last=0;this.paint();}
 stop(){this.epoch++;cancelAnimationFrame(this.frame);this.observer?.disconnect();this.canvas.remove();if(this.model)this.scene.remove(this.model);this.model=null;if(this.poster)this.poster.hidden=false;this.poster=null;this.host=null;}
}
