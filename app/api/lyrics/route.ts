import { auth,reply,error } from '@/lib/api';
import { lookupLyrics } from '@/lib/lyrics';
export const dynamic='force-dynamic';
export const maxDuration=60;
export async function GET(request:Request){try{await auth(request);const p=new URL(request.url).searchParams;return reply(await lookupLyrics({title:p.get('title')||undefined,artist:p.get('artist')||undefined,album:p.get('album')||undefined,duration:p.has('duration')?Number(p.get('duration')):undefined,id:p.has('id')?Number(p.get('id')):undefined}))}catch(e){return error(e)}}
