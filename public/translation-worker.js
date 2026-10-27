import {pipeline,env} from 'https://cdn.jsdelivr.net/npm/@huggingface/transformers@3.8.1/dist/transformers.min.js';
env.allowLocalModels=false;
env.backends.onnx.wasm.numThreads=1;
const models={};
self.onmessage=async({data:{id,text,source}})=>{
 try{
  const key=source==='en'?'en-es':'es-en';
  models[key]??=pipeline('translation','Xenova/opus-mt-'+key,{dtype:'q8',progress_callback:p=>{if(p.status==='progress')self.postMessage({id,progress:Math.round(p.progress||0)});}});
  const model=await models[key];
  const chunks=text.match(/.{1,350}(?:\s|$)|\S{1,350}/gs)||[text];
  const result=[];
  for(const chunk of chunks){const out=await model(chunk.trim());result.push(out[0].translation_text);}
  self.postMessage({id,translation:result.join(' ')});
 }catch(e){self.postMessage({id,error:'On-device translation failed. Check your connection for the model download, then retry. '+e.message});}
};
