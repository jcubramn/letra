import { SignUp } from "@clerk/nextjs";
export default function Page(){return <main style={{minHeight:"100vh",display:"grid",placeItems:"center",background:"#F4F2F7"}}><SignUp routing="path" path="/sign-up" /></main>}
