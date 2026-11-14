import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/portal-recovery-cases.jsx',outDir:'node_modules/.portal-recovery-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.portal-recovery-test/portal-recovery-cases.js')));
await test.run();

