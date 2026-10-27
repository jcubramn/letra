import type { NextConfig } from "next";
const config:NextConfig={async redirects(){return [{source:"/app",destination:"/",permanent:false},{source:"/app.html",destination:"/",permanent:false}]}};
export default config;
