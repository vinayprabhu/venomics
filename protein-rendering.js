import * as T from './assets/three.module.js';
const registry=new WeakMap();
export function configureProteinShapes(molecules,targets,shapes){for(const [k,v]of Object.entries(shapes.molecules))if(molecules[k])registry.set(molecules[k],v);for(const [key,parts]of Object.entries(shapes.targets))for(const [part,v]of Object.entries(parts))if(targets[key]?.[part])registry.set(targets[key][part],v);}
const rainbow=f=>new T.Color().setHSL(.67-.34*f,.84,.49);
export function proteinShape(data,center,scale,color=null,{surface=true}={}){
 const shape=registry.get(data);if(!shape)return null;const group=new T.Group();
 const transform=p=>new T.Vector3(...p).sub(new T.Vector3(...center)).multiplyScalar(scale);
 const tint=(f)=>color===0xeac26b||color===0xe7b667?new T.Color(color):rainbow(f);
 for(const run of shape.runs){const r=run.residues;if(r.length<2)continue;const points=r.map(x=>transform(x.ca)),curve=new T.CatmullRomCurve3(points),segments=Math.max(12,(r.length-1)*6),positions=[],colors=[],indices=[];let previous=null;
  // A flattened ribbon follows peptide-plane orientation; coil sections remain narrow.
  for(let j=0;j<=segments;j++){const u=j/segments,k=Math.min(r.length-2,Math.floor(u*(r.length-1))),f=u*(r.length-1)-k,a=r[k],b=r[k+1],res=f<.5?a:b,tangent=curve.getTangent(u).normalize(),p=curve.getPoint(u);let width=new T.Vector3(...a.carbonyl).lerp(new T.Vector3(...b.carbonyl),f);width.addScaledVector(tangent,-width.dot(tangent)).normalize();if(width.lengthSq()<.01)width=new T.Vector3(1,0,0).cross(tangent).normalize();if(previous&&width.dot(previous)<0)width.negate();if(previous)width.lerp(previous,.35).normalize();previous=width.clone();const normal=new T.Vector3().crossVectors(tangent,width).normalize();let half=res.ss==='H'?.77:res.ss==='E'&&res.ssCode!=='B'?.95:.18;const next=r[Math.min(r.length-1,k+1)];if(res.ss==='E'&&res.ssCode!=='B'&&next.ss!=='E')half*=Math.max(.08,1.65*(1-f));half*=scale;const thickness=(res.ss==='C'||res.ssCode==='B'?.17:.10)*scale;const c=tint(a.fraction+(b.fraction-a.fraction)*f);
   for(const [x,y]of [[-1,-1],[1,-1],[1,1],[-1,1]]){const v=p.clone().addScaledVector(width,x*half).addScaledVector(normal,y*thickness);positions.push(v.x,v.y,v.z);colors.push(c.r,c.g,c.b);}
   if(j<segments)for(let q=0;q<4;q++){const a0=j*4+q,b0=j*4+(q+1)%4,c0=(j+1)*4+q,d0=(j+1)*4+(q+1)%4;indices.push(a0,b0,c0,b0,d0,c0);}
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('color',new T.Float32BufferAttribute(colors,3));g.setIndex(indices);g.computeVertexNormals();const mesh=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,roughness:.35,metalness:.08,side:T.DoubleSide}));group.add(mesh);
 }
 if(surface&&shape.surface){const s=shape.surface,g=new T.BufferGeometry(),p=[],c=[];for(let i=0;i<s.vertices.length;i+=3){const v=transform(s.vertices.slice(i,i+3));p.push(v.x,v.y,v.z);const color=tint(s.residueFractions[i/3]);c.push(color.r,color.g,color.b);}g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(s.normals,3));g.setAttribute('color',new T.Float32BufferAttribute(c,3));g.setIndex(s.indices);const mesh=new T.Mesh(g,new T.MeshStandardMaterial({vertexColors:true,transparent:true,opacity:.16,depthWrite:false,roughness:.32,metalness:.02,side:T.FrontSide}));mesh.renderOrder=2;group.add(mesh);}
 group.userData.proteinRepresentation='ribbon + approximate atomic envelope';return group;
}
