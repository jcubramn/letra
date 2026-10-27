import { readFile,writeFile } from 'node:fs/promises';
const source=await readFile(new URL('../public/app.html',import.meta.url),'utf8');
const [html,tail]=source.split('<script>');if(!tail)throw Error('UI script missing');
const script=tail.split('</script>')[0];new Function(script);
await writeFile(new URL('../public/letra.js',import.meta.url),script);
await writeFile(new URL('../lib/shell.ts',import.meta.url),'export const shell = '+JSON.stringify(html)+';\n');
