import * as T from './assets/three.module.js';
import {ball,bond,molecule} from './molecule-geometry.js?v=11';
const V=(a)=>new T.Vector3(...a), C={protein:0x9baab0,ion:0x55d6ef,drug:0xeac26b,product:0xbee780,cleaved:0xd6719b,cell:0x77353c};
function extent(d){const b=new T.Box3().setFromPoints(d.atoms.map(a=>V(a.slice(0,3))));const s=b.getSize(new T.Vector3());return Math.max(s.x,s.y,s.z)}
function antibody(parent,x,y,color,scale=1){const g=new T.Group();const a=V([0,-.65,0]),b=V([0,0,0]);bond(g,a,b,.1,color);bond(g,b,V([-.48,.6,0]),.1,color);bond(g,b,V([.48,.6,0]),.1,color);ball(g,V([-.48,.6,0]),.13,color);ball(g,V([.48,.6,0]),.13,color);g.position.set(x,y,.8);g.scale.setScalar(scale);parent.add(g);return g;}
export function buildMechanism(id,m,t,geometry){
 const root=new T.Group();let update=()=>{},pdb='',labels=[],status={on:'',off:''},buttons={on:'Remove inhibitor',off:'Add inhibitor'};
 if(id==='cone'){
  const d=t.cav22,geo=geometry.cav22,scale=7.2/extent(d.receptor),center=d.center;
  root.add(molecule(d.receptor,center,scale,{backbone:true,color:C.protein,thick:.46}));
  const ligand=molecule(d.ligand,center,scale,{color:C.drug});root.add(ligand);
  const point=a=>V(a).sub(V(center)).multiplyScalar(scale),axis=V(geo.axis.outward).normalize(),start=point(geo.axis.extracellularStart).addScaledVector(axis,.65),end=point(geo.axis.intracellularEnd),stop=point(geo.axis.blockadeStop),perp=new T.Vector3().crossVectors(axis,V([0,0,1])).normalize();
  root.quaternion.setFromUnitVectors(axis,V([0,1,0]));root.rotateX(.12);const ions=Array.from({length:18},()=>ball(root,start,.14,C.ion));
  update=(time,bound,amount)=>{const blocked=bound&&amount<.7;ligand.position.copy(axis).multiplyScalar(amount*.52).addScaledVector(perp,amount*.33);ions.forEach((ion,i)=>{const u=(time*.22+i/ions.length)%1;if(blocked){const v=u<.5?u*2:(1-u)*2;ion.position.copy(start).lerp(stop,v*.96);}else ion.position.copy(start).lerp(end,u);ion.position.addScaledVector(perp,Math.sin(i*2.4)*.12);ion.visible=blocked?i<9:true;});};
  pdb='7MIX · schematic Ca²⁺ influx';labels=[['bottom','Extracellular pore blockade · Ca²⁺ flux schematic']];status={on:'Extracellular pore blocked',off:'Ca²⁺ influx · schematic'};buttons={on:'Remove ziconotide',off:'Add ziconotide'};
 }else if(id==='jararaca'){
  const d=m.ace,scale=6.4/extent(d);const enzyme=molecule(d,d.center,scale,{backbone:true,color:C.protein,thick:.43});root.add(enzyme);ball(root,V(d.zinc).sub(V(d.center)).multiplyScalar(scale),.18,0x88e4bd);const inhibitor=molecule(m.captopril,d.center,scale,{color:C.drug});root.add(inhibitor);
  const peptide=new T.Group();root.add(peptide);const beads=[];for(let i=0;i<10;i++)beads.push(ball(peptide,V([(i-4.5)*.22,0,2.1]),.13,i<8?C.ion:C.cleaved));
  update=(time,bound,amount)=>{inhibitor.position.set(amount,amount*.35,0);const blocked=bound&&amount<.7,u=(time*.18)%1;const x=blocked?(u<.5?-5.3+u*7.5:-1.55-(u-.5)*7.5):-5.3+u*10.6;peptide.position.x=x;beads.forEach((b,i)=>{const split=!blocked&&x>.3&&i>=8;b.position.y=split?-(x-.3)*.7:Math.sin(time*2+i*.4)*.05;b.position.x=(i-4.5)*.22+(split?(x-.3)*.15:0)});};
  pdb='1UZF · testicular ACE · schematic cleavage';labels=[['left','Ang I · 10 aa'],['right','Ang II · 8 aa']];status={on:'Ang I cleavage inhibited',off:'ACE removes two residues'};buttons={on:'Remove captopril',off:'Add captopril'};
 }else if(id==='gila'){
  const d=t.glp1r,scale=6.3/extent(d.receptor),axis=V(d.ligand.center).sub(V(d.center)).normalize();root.add(molecule(d.receptor,d.center,scale,{backbone:true,color:C.protein,thick:.5}));const ligand=molecule(d.ligand,d.center,scale,{backbone:true,color:C.drug,thick:.7});root.add(ligand);root.quaternion.setFromUnitVectors(axis,V([0,1,0]));
  const signalGroup=new T.Group();root.add(signalGroup);const ions=Array.from({length:16},()=>ball(signalGroup,V([0,0,0]),.1,C.ion));const insulin=Array.from({length:8},()=>ball(signalGroup,V([0,0,0]),.18,C.product));const perp=new T.Vector3().crossVectors(axis,V([0,0,1])).normalize();
  update=(time,bound,amount)=>{ligand.position.copy(axis).multiplyScalar(amount*.5);const active=bound&&amount<.7;ions.forEach((p,i)=>{const u=(time*.3+i/16)%1;p.position.copy(axis).multiplyScalar(-1.5-u*2).addScaledVector(perp,Math.sin(i*2)*u*1.5);p.visible=active;});insulin.forEach((p,i)=>{const u=(time*.13+i/8)%1;p.position.copy(axis).multiplyScalar(-3.5).addScaledVector(perp,-2.5+u*5);p.position.z+=Math.cos(i)*.3;p.visible=active;});};
  pdb='7LLL · schematic signaling';labels=[['bottom','cAMP → insulin secretion']];status={on:'Glucose present · stimulated insulin release',off:'GLP-1R awaiting exendin-4'};buttons={on:'Remove exendin-4',off:'Add exendin-4'};
 }else if(id==='echis'){
  const platelets=[],drugs=[],recep=[];
  for(let side of [-1,1]){const g=new T.Group(),cell=ball(g,V([0,-.4,0]),1.5,C.cell);cell.scale.set(1,.5,.85);const receptor=new T.Group();bond(receptor,V([-.22,-.55,0]),V([-.22,.03,0]),.09,0xbccbc7);bond(receptor,V([.22,-.55,0]),V([.22,.03,0]),.09,0x889ca5);bond(receptor,V([-.22,.03,0]),V([0,.32,0]),.1,0xbccbc7);bond(receptor,V([.22,.03,0]),V([0,.32,0]),.1,0x889ca5);const head=ball(receptor,V([0,.4,0]),.24,0xbccbc7);head.scale.set(1.2,.8,.8);receptor.position.set(-side*.8,.2,.8);receptor.rotation.z=-side*.9;g.add(receptor);const d=t.integrin.ligand,drug=molecule(d,d.center,.065,{color:C.drug});drug.position.set(-side*1.2,.45,1);g.add(drug);root.add(g);platelets.push(g);drugs.push(drug);recep.push(receptor);}
  const bridge=new T.Group();root.add(bridge);for(let i=0;i<15;i++)ball(bridge,V([-1.8+i*.255,.5,1]),i===0||i===14?.17:.08,0xc4d7dc);
  update=(time,bound,amount)=>{const blocked=bound&&amount<.7,p=1-amount/4.8;platelets[0].position.x=-2.1-p*.8;platelets[1].position.x=2.1+p*.8;drugs.forEach((d,i)=>{d.position.y=.45+amount*.3;d.visible=amount<4.6;});bridge.scale.x=blocked?.42:1;bridge.position.y=blocked?1.3+Math.sin(time)*.1:0;bridge.rotation.z=blocked?.15:0;};
  root.scale.setScalar(1.35);pdb='Schematic platelet aggregation';labels=[['left','Platelet'],['right','Platelet'],['bottom','Fibrinogen bridge']];status={on:'αIIbβ3 blocked · platelets separate',off:'Fibrinogen bridges platelets'};buttons={on:'Remove tirofiban',off:'Add tirofiban'};
 }else{
  const mast=ball(root,V([1.9,-.9,-.4]),1.75,0x6f637e);mast.scale.set(1,.8,.85);antibody(root,1.25,.65,0xcb9abe,.6);antibody(root,2.2,.65,0xcb9abe,.6);const allergen=molecule(m.apiM1,m.apiM1.center,.037,{backbone:true,color:C.ion,thick:.7});root.add(allergen);const igg=antibody(root,-.4,1.15,C.drug,.95);igg.rotation.z=-.6;
  const mediators=Array.from({length:18},()=>ball(root,V([0,0,0]),.1,0xe68180));
  update=(time,bound,amount)=>{const blocked=bound&&amount<.7,u=(time*.17)%1;allergen.position.set(blocked?-1.4+Math.sin(time)*.12:-3.8+u*5.6,blocked?2:2.3-u*.9,1.1);allergen.rotation.y=time*.3;igg.visible=blocked;mediators.forEach((p,i)=>{const u=(time*.2+i/18)%1,a=i*2.4;p.position.set(1.9+Math.cos(a)*u*3,-.9+Math.sin(a)*u*2,1.3);p.visible=!blocked&&u>.2});};
  pdb='Api m 1: 1POC · immune interactions schematic';labels=[['left','Api m 1 · one allergen'],['right','Mast cell + IgE'],['bottom','IgG4 · one protective mechanism']];status={on:'Blocking antibodies · T/B-cell regulation also contributes',off:'IgE cross-linking · mediator release'};buttons={on:'Before immunotherapy',off:'After immunotherapy'};
 }
 update(5,true,0);return {root,update,pdb,labels,status,buttons};
}
