import { auth, currentUser } from "@clerk/nextjs/server";
import { reply } from "@/lib/api";
export const dynamic="force-dynamic";
export async function GET(){const {userId}=await auth();const u=userId?await currentUser():null;return reply({user:u?{id:u.id,name:u.firstName||u.primaryEmailAddress?.emailAddress||"Letra learner"}:null,signIn:"/sign-in",signOut:"/sign-out"})}
