import * as T from './assets/three.module.js';
import {Software3DRenderer} from './software.js?v=11';

// One GPU context for the entire exhibit, including offscreen thumbnails.
// Each view retains its own 2D presentation canvas and real 3D scene/camera.
let device;
function sharedDevice(){
 if(device!==undefined)return device;
 device=null;
 try{
  const canvas=document.createElement('canvas');
  const context=canvas.getContext('webgl2',{alpha:true,antialias:false,preserveDrawingBuffer:true});
  if(!context)return null;
  const renderer=new T.WebGLRenderer({canvas,context,alpha:true,antialias:false,preserveDrawingBuffer:true});
  renderer.setPixelRatio(1);
  const result={canvas,context,renderer,lost:false};
  canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();result.lost=true;});
  canvas.addEventListener('webglcontextrestored',()=>{result.lost=false;});
  device=result;
 }catch{/* The same geometry can be rendered without WebGL. */}
 return device;
}

export class SceneRenderer{
 constructor({canvas}){
  this.domElement=canvas;
  this.ctx=canvas.getContext('2d',{alpha:true});
  this.pixelRatio=1;this.w=1;this.h=1;this.color=new T.Color(0);
  this.alpha=0;this.transparent=true;this.outputColorSpace=T.SRGBColorSpace;
 }
 setClearColor(color,alpha=1){this.color.set(color);this.alpha=alpha;this.transparent=alpha<1;}
 setPixelRatio(ratio){this.pixelRatio=Math.min(ratio,matchMedia('(max-width:750px), (pointer:coarse)').matches?1.25:1.6);}
 setSize(width,height){
  this.w=Math.max(1,width);this.h=Math.max(1,height);
  const ratio=Math.min(this.pixelRatio,Math.sqrt(1500000/(this.w*this.h)));
  const w=Math.max(1,Math.round(this.w*ratio)),h=Math.max(1,Math.round(this.h*ratio));
  if(this.domElement.width!==w)this.domElement.width=w;
  if(this.domElement.height!==h)this.domElement.height=h;
  this.domElement.style.width=this.w+'px';this.domElement.style.height=this.h+'px';
  if(this.software){this.software.setPixelRatio(ratio);this.software.setSize(this.w,this.h);}
 }
 get last(){return this.software?.last||0;}
 set last(value){if(this.software)this.software.last=value;}
 render(scene,camera){
  const gpu=sharedDevice();
  if(gpu&&!gpu.lost&&!gpu.context.isContextLost()){
   try{
    const {width,height}=this.domElement;
    if(gpu.canvas.width!==width||gpu.canvas.height!==height)gpu.renderer.setSize(width,height,false);
    gpu.renderer.setClearColor(this.color,this.alpha);
    gpu.renderer.outputColorSpace=this.outputColorSpace;
    gpu.renderer.render(scene,camera);
    if(gpu.context.isContextLost())throw Error('GPU context lost');
    this.ctx.clearRect(0,0,width,height);this.ctx.drawImage(gpu.canvas,0,0);
    this.domElement.dataset.renderer='webgl';return true;
   }catch{/* Keep the view usable during GPU loss or driver failure. */}
  }
  try{
   if(!this.software){this.software=new Software3DRenderer({canvas:this.domElement});this.software.setPixelRatio(this.pixelRatio);this.software.setSize(this.w,this.h);}
   this.software.transparent=this.transparent;
   this.software.background=this.color.getStyle();
   this.software.render(scene,camera);
   this.domElement.dataset.renderer='software';return true;
  }catch{return false;}
 }
}
