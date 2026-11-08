// Regression: entering an intrathecal or subcutaneous scene must stop circulation audio,
// including when playback resumes after a browser visibility or mute transition.
import fs from 'node:fs';
import vm from 'node:vm';
import assert from 'node:assert/strict';
const code=fs.readFileSync(new URL('../atmosphere.js',import.meta.url),'utf8')
 .replace('export class Atmosphere','class Atmosphere')
 .replace('export const atmosphere=new Atmosphere();','globalThis.Atmosphere=Atmosphere;');
const context={document:{hidden:false}};
vm.runInNewContext(code,context);
const audio=Object.create(context.Atmosphere.prototype);
let plays=0,pauses=0;
audio.enabled=true;audio.mix=()=>{};
audio.flow={currentTime:8,play(){plays++;return Promise.resolve()},pause(){pauses++}};
audio.setBiologicalAction(true,true);
assert.equal(plays,1);
audio.setBiologicalAction(true,false);
assert.equal(pauses,1);assert.equal(audio.flow.currentTime,0);
audio.playFlow();assert.equal(plays,1);
audio.setBiologicalAction(false);audio.playFlow();assert.equal(plays,1);
audio.enabled=false;audio.setBiologicalAction(true,true);assert.equal(plays,1);
audio.enabled=true;context.document.hidden=true;audio.playFlow();assert.equal(plays,1);
context.document.hidden=false;audio.playFlow();assert.equal(plays,2);
console.log('Circulation audio stops and stays off in non-circulatory scenes.');
