"use client";
import { SignOutButton } from "@clerk/nextjs";
export default function Page(){return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#F4F2F7",fontFamily:"system-ui"}}><div><h1>Sign out of Letra?</h1><SignOutButton redirectUrl="/"><button style={{padding:12}}>Sign out</button></SignOutButton><p><a href="/">Back to songs</a></p></div></main>}
