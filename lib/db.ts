import { neon } from "@neondatabase/serverless";
export function db(){if(!process.env.DATABASE_URL)throw Error("Database is unavailable");return neon(process.env.DATABASE_URL)}
