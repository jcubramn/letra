import { auth,reply,error } from "@/lib/api";
import { loadPlaylist } from "@/lib/spotify-playlist";
export const dynamic="force-dynamic";
export const maxDuration=30;
export async function POST(request:Request){try{await auth(request,true);const text=await request.text();if(text.length>4096)throw Error("Paste a Spotify playlist link.");const {url}=JSON.parse(text);return reply(await loadPlaylist(url))}catch(e){return error(e)}}
