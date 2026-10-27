export type PlaylistTrack={id:string;title:string;artist:string;duration?:number;uri:string;url:string};
const spotifyId=/^[A-Za-z0-9]{22}$/;
export function playlistId(input:unknown):string{
 if(typeof input!=="string"||input.length>2048)throw Error("Paste a Spotify playlist link.");
 const value=input.trim();const uri=value.match(/^spotify:playlist:([A-Za-z0-9]{22})$/);if(uri)return uri[1];
 let u:URL;try{u=new URL(value)}catch{throw Error("Paste the full https://open.spotify.com/playlist/… link.")}
 if(u.protocol!=="https:"||u.hostname!=="open.spotify.com"||u.port||u.username||u.password)throw Error("Use a playlist link from open.spotify.com.");
 const path=u.pathname.match(/^\/(?:intl-[a-z-]+\/)?(?:embed\/)?playlist\/([A-Za-z0-9]{22})\/?$/);
 if(!path)throw Error("This is not a Spotify playlist link. Copy Share → Copy link to playlist in Spotify.");return path[1];
}
export function parsePlaylist(html:string,id:string){
 if(!spotifyId.test(id))throw Error("Invalid playlist id");
 const match=html.match(/<script\b(?=[^>]*\bid=["']__NEXT_DATA__["'])[^>]*>([\s\S]*?)<\/script>/i);
 let entity:any;try{entity=match?JSON.parse(match[1]).props?.pageProps?.state?.data?.entity:null}catch{throw Error("Spotify returned an unreadable playlist preview. Please retry.")}
 if(!entity||entity.type!=="playlist"||entity.uri!=="spotify:playlist:"+id||!Array.isArray(entity.trackList))throw Error("Spotify could not share this playlist's track list. Use a public playlist; private or restricted playlists need a Spotify connection.");
 const seen=new Set<string>();const tracks:PlaylistTrack[]=[];
 for(const item of entity.trackList){
  const trackId=typeof item?.uri==="string"?item.uri.match(/^spotify:track:([A-Za-z0-9]{22})$/)?.[1]:null;
  if(!trackId||seen.has(trackId)||typeof item.title!=="string"||!item.title.trim())continue;
  seen.add(trackId);tracks.push({id:trackId,title:item.title.slice(0,300),artist:String(item.subtitle||"Unknown artist").slice(0,300),duration:Math.round((Number(item.duration)||0)/1000),uri:"spotify:track:"+trackId,url:"https://open.spotify.com/track/"+trackId});
 }
 if(!tracks.length)throw Error("No songs were available in this playlist's public preview.");
 return {id,name:String(entity.name||entity.title||"Spotify playlist").slice(0,300),url:"https://open.spotify.com/playlist/"+id,tracks:tracks.slice(0,100),previewOnly:true,limit:100};
}
export async function loadPlaylist(input:unknown){
 const id=playlistId(input);
 const response=await fetch("https://open.spotify.com/embed/playlist/"+id,{redirect:"error",signal:AbortSignal.timeout(15000),cache:"no-store"});
 if(!response.ok)throw Error(response.status===429?"Spotify is busy. Wait a moment and try again.":"Spotify could not load this playlist. Check that it is public and try again.");
 if(Number(response.headers.get("content-length"))>4000000)throw Error("This playlist preview is too large.");
 const reader=response.body?.getReader();if(!reader)throw Error("Spotify returned an empty preview.");
 const decoder=new TextDecoder();let html="",size=0;
 try{while(true){const {done,value}=await reader.read();if(done)break;size+=value.byteLength;if(size>4000000){await reader.cancel();throw Error("This playlist preview is too large.")}html+=decoder.decode(value,{stream:true})}html+=decoder.decode()}finally{reader.releaseLock()}
 return parsePlaylist(html,id);
}
