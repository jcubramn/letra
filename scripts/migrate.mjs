import { neon } from '@neondatabase/serverless';
import { readFile } from 'node:fs/promises';
const sql=neon(process.env.DATABASE_URL);await sql.query(await readFile(new URL('../migrations/001_songs.sql',import.meta.url),'utf8'));console.log('Letra schema is ready.');
