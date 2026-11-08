import * as T from './assets/three.module.js';
import {proteinShape} from './protein-rendering.js?v=11';
const COLORS={C:0xced7db,N:0x477fe8,O:0xe76059,S:0xe1c354,P:0xf0a14a};
const mat=c=>new T.MeshStandardMaterial({color:c,roughness:.46,metalness:.05});
const sphere=new T.SphereGeometry(1,32,24);
const rod=new T.CylinderGeometry(1,1,1,16);
export function ball(parent,p,r,color){const m=new T.Mesh(sphere,mat(color));m.position.copy(p);m.scale.setScalar(r);parent.add(m);return m;}
export function bond(parent,a,b,r,color){const d=b.clone().sub(a),m=new T.Mesh(rod,mat(color));m.position.copy(a).add(b).multiplyScalar(.5);m.quaternion.setFromUnitVectors(new T.Vector3(0,1,0),d.clone().normalize());m.scale.set(r,d.length(),r);parent.add(m);return m;}
export function molecule(data,center,scale,{backbone=false,color=null,thick=.3}={}){
 if(backbone){const protein=proteinShape(data,center,scale,color);if(protein)return protein;}
 const group=new T.Group(),pos=data.atoms.map(a=>new T.Vector3(a[0]-center[0],a[1]-center[1],a[2]-center[2]).multiplyScalar(scale));
 if(backbone){let chains=data.chains?.map(c=>c.atomIndices.filter(i=>data.atoms[i][5]==='CA'))||[data.backbone];for(const ids of chains){if(!ids)continue;let run=[];const draw=()=>{if(run.length<2){run=[];return}const curve=new T.CatmullRomCurve3(run),points=curve.getPoints(run.length*3);for(let k=1;k<points.length;k++)bond(group,points[k-1],points[k],thick*scale,color??0xd5dfda);run=[]};for(const i of ids){const p=pos[i];if(!p)continue;if(run.length&&p.distanceTo(run.at(-1))>=4.5*scale)draw();run.push(p)}draw();}}
 else{data.bonds.forEach(([a,b])=>{if(pos[a]&&pos[b])bond(group,pos[a],pos[b],.12*scale,color??0x9ca6a9)});data.atoms.forEach((a,i)=>ball(group,pos[i],(a[3]==='S'?.5:.34)*scale,color??COLORS[a[3]]??0xbbbbaa));}
 return group;
}
