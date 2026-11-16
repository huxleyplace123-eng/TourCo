import assert from 'node:assert/strict';
import {protectBackup,openBackup,exportProtectedBackup} from './protected-backup.mjs';
const key='12'.repeat(32),data=Buffer.from('Synthetic private archive');
const a=protectBackup(data,key),b=protectBackup(data,key);assert.notDeepEqual(a,b);assert.deepEqual(openBackup(a,key),data);assert.ok(!a.includes(data));
assert.throws(()=>openBackup(a,'34'.repeat(32)));const tampered=Buffer.from(a);tampered[22]^=1;assert.throws(()=>openBackup(tampered,key));assert.throws(()=>openBackup(a.subarray(0,25),key));
await assert.rejects(exportProtectedBackup({}),/encryption key/);await assert.rejects(exportProtectedBackup({BACKUP_ENCRYPTION_KEY:key}),/read-only PostgreSQL/);
console.log('PASS: portable authenticated encryption, unique nonces, tampering/wrong-key rejection and missing-configuration gates. No production export performed.');
