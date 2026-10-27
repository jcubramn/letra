import Script from "next/script";
import { shell } from "@/lib/shell";
export default function Page(){return <><div dangerouslySetInnerHTML={{__html:shell}}/><Script src="/letra.js" strategy="afterInteractive"/></>}
