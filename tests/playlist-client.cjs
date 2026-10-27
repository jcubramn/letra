const fs=require('fs'),vm=require('vm'),assert=require('assert');
const source=fs.readFileSync(__dirname+'/../public/app.html','utf8').split('<script>')[1].split('</script>')[0];
const elements=new Map();
const el=()=>({textContent:'',innerHTML:'',value:'',querySelector:()=>el(),querySelectorAll:()=>[],classList:{toggle(){}},focus(){},prepend(){},setAttribute(){}});
const document={documentElement:{},querySelector(k){if(!elements.has(k))elements.set(k,el());return elements.get(k)},querySelectorAll(){return []}};
const cache=new Map();
const context={document,localStorage:{getItem:k=>cache.get(k),setItem:(k,v)=>cache.set(k,v)},console,window:{},setTimeout,clearTimeout,scrollTo(){},crypto:require('crypto').webcrypto,AbortController,structuredClone};
vm.createContext(context);
vm.runInContext(source.replace('/* ---------- boot ---------- */', '/* ---------- boot ---------- */').split('/* ---------- boot ---------- */')[0],context);
vm.runInContext(`
const english=validateImport([{title:'English input',source:'en',lyrics:'Open the window\\nListen to the city'}]);if(english[0].lines[0].en!=='Open the window'||english[0].lines[0].es!=='')throw Error('English import language lost');
const backup=validateImport([{title:'Backup',lines:[{es:'Hola',en:'Hello'},{es:'Adiós',en:'Goodbye'}],stats:{l0:{r:4,w:1}},reverseProgress:{stats:{l0:{r:2,w:0}},quizzes:1}}]);if(backup[0].stats.l0.r!==4 || backup[0].reverseProgress.stats.l0.r!==2)throw Error('Backup progress lost');
const queued=validateImport([{title:'Playlist song',lines:[],spotify:{uri:'spotify:track:4rzfv0JLZfVhOhbSQ8o5jZ'}}]);if(!queued[0].needsLyrics || queued[0].lines.length)throw Error('Pending playlist backup failed');Store.save(queued[0]);S.id=queued[0].id;reverse=false;if(!viewSong().includes('Find lyrics'))throw Error('Pending song needs an Add lyrics button');reverse=true;if(!viewSong().includes('Buscar letra'))throw Error('Reverse pending action missing');
const lookupOriginal={sourceLanguage:'en',lines:[],needsLyrics:true};if(!applyFoundLyrics(lookupOriginal,{status:'found',lyrics:'Open the window\\nListen to the city',source:{provider:'LRCLIB',id:1}})||lookupOriginal.lines[0].en!=='Open the window'||lookupOriginal.lines[0].es!==''||lookupOriginal.needsLyrics)throw Error('English auto-lookup storage failed');
const spanish={sourceLanguage:'es',lines:[],needsLyrics:true};applyFoundLyrics(spanish,{status:'found',lyrics:'Abre la ventana\\nEscucha la ciudad',source:{provider:'LRCLIB',id:2}});if(spanish.lines[0].es!=='Abre la ventana'||!spanish.needsTranslation)throw Error('Spanish auto-lookup storage failed');
if(applyFoundLyrics(spanish,{status:'not_found'})||spanish.lines.length!==2)throw Error('Missing lookup overwrote lyrics');
lsSet('letra.draft',{title:'Previous',artist:'Different artist',lyrics:'Unrelated old words'});useTrack({title:'Selected',artist:'Chosen artist',album:'Album',duration:210,url:'https://open.spotify.com/search/Selected',uri:''});const selectedDraft=lsGet('letra.draft',{});if(selectedDraft.lyrics!==''||selectedDraft.metadata.duration!==210)throw Error('Song selection mixed previous lyrics or lost matching metadata');
const rows=validateImport({songs:[{title:'Example',lyrics:'Hola mundo\\nBuenos días'}]});
if(rows.length!==1 || rows[0].lines.length!==2) throw Error('Import parsing failed');
let rejected=false;try{validateImport([{title:'Missing lyrics'}])}catch{rejected=true}if(!rejected)throw Error('Invalid import accepted');
const original=DEMO.lines[1].es;reverse=true;const projected=Store.get('demo');if(projected.lines[1].es!==DEMO.lines[1].en)throw Error('Reverse failed');
projected.stats={l1:{r:3,w:0}};Store.save(projected);if(DEMO.lines[1].es!==original || DEMO.stats.l1)throw Error('Reverse corrupted original');
if(DEMO.reverseProgress.stats.l1.r!==3)throw Error('Reverse progress not saved');
reverse=false;S.view='library';render();reverse=true;render();
`,context);
console.log('Passed: script syntax, bulk import parsing and validation, reverse learning, independent progress, library rendering.');

vm.runInContext(`(async()=>{
 hostedUser={id:'qa'};hosted=true;reverse=false;Store.songs={};
 const song={id:'queue-test',title:'Queue',sourceLanguage:'es',lines:[{es:'Hola',en:''},{es:'Hola',en:''},{es:'Adiós',en:'Existing translation'}],vocab:[],stats:{l0:{r:3,w:1}}};Store.songs[song.id]=song;
 let calls=0,saves=0;deviceTranslate=async()=>{calls++;return 'Hello';};api=async()=>{saves++;return {saved:true};};
 await runTranslationQueue();const saved=originalGet(song.id);
 if(calls!==1||saves!==1||saved.lines[1].en!=='Hello'||saved.lines[2].en!=='Existing translation'||saved.stats.l0.r!==3||saved.needsTranslation)throw Error('Queue lost progress, repeated work or overwrote translations');
 Store.songs={broken:{...song,id:'broken',lines:[{es:'Nueva',en:''}]}};deviceTranslate=async()=>{throw Error('offline');};translationQueue.paused=false;await runTranslationQueue();if(!translationQueue.paused||!missingTranslation(Store.songs.broken))throw Error('Failed queue did not preserve pending work');
 deviceTranslate=async()=> 'New';translationQueue.paused=false;await runTranslationQueue();if(missingTranslation(Store.songs.broken))throw Error('Resume failed');
 console.log('Passed: queue deduplication, existing translations and quiz progress preserved, failure pause and resume.');
})()`,context).catch(e=>{console.error(e);process.exitCode=1;});
