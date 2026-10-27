import { auth as clerkAuth } from "@clerk/nextjs/server";
export async function auth(request:Request,mutate=false){
 const {userId}=await clerkAuth();if(!userId)throw Error("UNAUTHORIZED");
 if(mutate&&request.headers.get("origin")!==new URL(request.url).origin)throw Error("FORBIDDEN");
 return {userId};
}
export function reply(data:unknown,status=200){return Response.json(data,{status,headers:{"Cache-Control":"private, no-store"}})}
export function error(e:unknown){const m=e instanceof Error?e.message:"Request failed";return reply({error:m},m==="UNAUTHORIZED"?401:m==="FORBIDDEN"?403:400)}
