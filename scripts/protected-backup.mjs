import {createCipheriv,createDecipheriv,randomBytes} from 'node:crypto';
import {execFile} from 'node:child_process';
import {promisify} from 'node:util';
import {writeFile} from 'node:fs/promises';
import {isAbsolute} from 'node:path';
import {pathToFileURL} from 'node:url';
const magic=Buffer.from('TICOBK01');
function keyBytes(key){if(!/^[a-f0-9]{64}$/i.test(key||''))throw Error('Use a 32-byte encryption key from the private secret store.');return Buffer.from(key,'hex');}
export function protectBackup(data,key){
  const iv=randomBytes(12),cipher=createCipheriv('aes-256-gcm',keyBytes(key),iv);cipher.setAAD(magic);
  return Buffer.concat([magic,iv,cipher.update(data),cipher.final(),cipher.getAuthTag()]);
}
export function openBackup(data,key){
  if(data.length<36||!data.subarray(0,8).equals(magic))throw Error('Invalid protected backup.');
  const cipher=createDecipheriv('aes-256-gcm',keyBytes(key),data.subarray(8,20));cipher.setAAD(magic);cipher.setAuthTag(data.subarray(-16));
  return Buffer.concat([cipher.update(data.subarray(20,-16)),cipher.final()]);
}
export async function exportProtectedBackup(env=process.env){
  keyBytes(env.BACKUP_ENCRYPTION_KEY);
  if(!env.PGSERVICE||!isAbsolute(env.BACKUP_OUTPUT||''))throw Error('Configure a read-only PostgreSQL service and an absolute private backup output path.');
  // PostgreSQL service/password files hold credentials; never command arguments.
  // TLS certificate validation is required. No plaintext file is written.
  let stdout;try{({stdout}=await promisify(execFile)(env.PG_DUMP_BINARY||'pg_dump',['--format=custom','--no-owner','--no-privileges'],{env:{...env,PGSSLMODE:'verify-full'},encoding:'buffer',maxBuffer:256*1024*1024,timeout:180000}));}catch{throw Error('Database export failed. Check the private service configuration and PostgreSQL client version.');}
  if(!stdout.subarray(0,5).equals(Buffer.from('PGDMP')))throw Error('Database export did not return a PostgreSQL archive.');
  const encrypted=protectBackup(stdout,env.BACKUP_ENCRYPTION_KEY);
  const verified=openBackup(encrypted,env.BACKUP_ENCRYPTION_KEY);
  if(!verified.equals(stdout))throw Error('Backup verification failed.');
  await writeFile(env.BACKUP_OUTPUT,encrypted,{flag:'wx',mode:0o600});
  return {encrypted:true,roundTripVerified:true,bytes:encrypted.length,offSite:false,restoreTested:false};
}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href){try{console.log(JSON.stringify(await exportProtectedBackup(),null,2));}catch(e){console.error(e.message);process.exitCode=1;}}
