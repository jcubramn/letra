export type LyricsQuery={title?:string;artist?:string;album?:string;duration?:number;id?:number};
type RecordData={id:number;trackName:string;artistName:string;albumName?:string;duration?:number;instrumental?:boolean;plainLyrics?:string|null;syncedLyrics?:string|null};
const base='https://lrclib.net/api/';
export function cleanLyrics(text:string){return text.replace(/\r/g,'').split('\n').filter(l=>!/^\[(?:ar|ti|al|by|offset|length|re|ve):[^\]]*\]\s*$/i.test(l.trim())).map(l=>l.replace(/^(?:\[\d{1,3}:\d{2}(?:[.:]\d{1,3})?\])+\s*/,'').trimEnd()).join('\n').trim();}
const normalize=(s:string)=>s.normalize('NFD').replace(/\p{M}/gu,'').toLowerCase().replace(/[^\p{L}\p{N}]+/gu,' ').trim();
export const searchTitle=(s:string)=>s.replace(/[\[(](?:feat\.?|ft\.?|featuring)\s[^\])]*[\])]/gi,'').replace(/\s+(?:feat\.?|ft\.?|featuring)\s.+$/i,'').trim();
export const primaryArtist=(s:string)=>s.split(/\s+(?:feat\.?|ft\.?|featuring|&|x|y)\s+|[,;•]/i)[0].trim();
function candidate(record:RecordData){
 if(!record||!Number.isSafeInteger(record.id)||record.id<=0||typeof record.trackName!=='string'||typeof record.artistName!=='string')return null;
 const lyrics=cleanLyrics(typeof record.plainLyrics==='string'&&record.plainLyrics.trim()?record.plainLyrics:String(record.syncedLyrics||''));
 return {...record,lyrics};
}
function summary(r:RecordData){return {id:r.id,title:r.trackName,artist:r.artistName,album:r.albumName||'',duration:r.duration||0};}
function found(r:RecordData&{lyrics:string}){return {status:'found' as const,lyrics:r.lyrics,match:summary(r),source:{provider:'LRCLIB',id:r.id,url:'https://lrclib.net/api/get/'+r.id}};}
function validLyrics(r:{lyrics:string}){return r.lyrics.length<=100000&&r.lyrics.split('\n').filter(l=>l.trim()&&!/^\[[^\]]+\]$/.test(l)).length>=2;}
export function selectLyrics(records:RecordData[],query:LyricsQuery){
 const title=normalize(searchTitle(query.title||'')),artist=normalize(query.artist||''),main=normalize(primaryArtist(query.artist||''));
 const scored=records.map(candidate).filter(r=>r&&normalize(searchTitle(r.trackName))===title&&(normalize(r.artistName)===artist||(main.length>=3&&normalize(primaryArtist(r.artistName))===main))).filter(r=>!!r).map(r=>{
  let score=normalize(r!.artistName)===artist?25:20;
  if(query.album&&normalize(r!.albumName||'')===normalize(query.album))score+=12;
  const difference=query.duration&&r!.duration?Math.abs(query.duration-r!.duration):null;
  if(difference!==null)score+=difference<=3?15:difference<=8?5:difference>20?-30:0;
  return {record:r!,score};
 }).filter(r=>r.score>=0).sort((a,b)=>b.score-a.score);
 const unique:Array<(typeof scored)[number]>=[];const seen=new Set<string>();
 for(const entry of scored){if(!entry.record.instrumental&&validLyrics(entry.record)){const key=normalize(entry.record.lyrics.replace(/^\[[^\]]+\]$/gm,''));if(!seen.has(key)){seen.add(key);unique.push(entry);}}}
 if(!unique.length)return {status:scored.some(r=>r.record.instrumental)?'instrumental' as const:'not_found' as const,matches:[]};
 if(unique.length===1||unique[0].score-unique[1].score>=10)return found(unique[0].record);
 return {status:'choose' as const,matches:unique.slice(0,6).map(r=>summary(r.record))};
}
export async function lookupLyrics(query:LyricsQuery,fetcher:typeof fetch=fetch){
 if(query.id!==undefined){if(!Number.isSafeInteger(query.id)||query.id<=0)throw Error('Invalid lyrics record.');}
 else if(typeof query.title!=='string'||!query.title.trim()||query.title.length>300||typeof query.artist!=='string'||!query.artist.trim()||query.artist.length>300)throw Error('Choose a song with a title and artist before looking up lyrics.');
 if(query.album&&query.album.length>300)throw Error('Album name is too long.');
 if(query.duration!==undefined&&(!Number.isFinite(query.duration)||query.duration<0||query.duration>86400))throw Error('Invalid song duration.');
 async function request(path:string){
  const response=await fetcher(base+path,{headers:{'User-Agent':'Letra/1.0 (https://letra-jcubtx9.vercel.app)'},signal:AbortSignal.timeout(10000),next:{revalidate:86400}});
  if(response.status===404)return null;
  if(!response.ok)throw Error(response.status===429?'The free lyrics service is busy. Please retry shortly.':'The free lyrics service is unavailable. Please retry.');
  const text=await response.text();if(text.length>3000000)throw Error('Lyrics response was too large.');
  try{return JSON.parse(text)}catch{throw Error('The lyrics service returned an unreadable response. Please retry.')}
 }
 if(query.id!==undefined){const r=candidate(await request('get/'+query.id));if(!r)return {status:'not_found' as const,matches:[]};if(r.instrumental)return {status:'instrumental' as const,matches:[]};return validLyrics(r)?found(r):{status:'not_found' as const,matches:[]};}
 const params=new URLSearchParams({track_name:query.title!.trim(),artist_name:primaryArtist(query.artist!)});
 let records;let serviceError:unknown;try{records=await request('search?'+params)}catch(e){serviceError=e;records=[];}if(!Array.isArray(records))records=[];
 let result=selectLyrics(records,query);
 const stripped=searchTitle(query.title!);
 if(result.status==='not_found'){
  // Broader title search handles alternate artist credits and catalog suffixes.
  const broad=new URLSearchParams({q:stripped+' '+primaryArtist(query.artist!)});
  try{records=await request('search?'+broad);result=selectLyrics(Array.isArray(records)?records:[],query);}catch(e){serviceError=e;}
 }
 if(result.status==='found'||result.status==='instrumental')return result;
 // A second independent free provider also resolves LRCLIB's ambiguous versions.
 try{
  const response=await fetcher('https://api.lyrics.ovh/v1/'+encodeURIComponent(primaryArtist(query.artist!))+'/'+encodeURIComponent(stripped),{signal:AbortSignal.timeout(9000),next:{revalidate:86400}});
  if(response.ok){
   const text=await response.text();if(text.length>150000)throw Error('Lyrics response was too large.');
   const data=JSON.parse(text);const lyrics=typeof data.lyrics==='string'?cleanLyrics(data.lyrics.replace(/^Paroles de la chanson[^\n]*\n/i,'')):'';
   if(validLyrics({lyrics}))return {status:'found' as const,lyrics,match:{title:query.title!,artist:query.artist!,album:'',duration:0},source:{provider:'lyrics.ovh',url:'https://api.lyrics.ovh/v1/'+encodeURIComponent(primaryArtist(query.artist!))+'/'+encodeURIComponent(stripped)}};
  }else if(response.status!==404)serviceError=Error('Free lyrics sources are busy. Please retry shortly.');
 }catch(e){serviceError=e;}
 if(result.status==='choose')return result;
 if(serviceError)throw Error('Free lyrics sources are temporarily unavailable. Please retry.');
 return result;
}
