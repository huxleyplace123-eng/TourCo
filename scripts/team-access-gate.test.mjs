import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/team-access-gate-cases.jsx',outDir:'node_modules/.team-gate-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.team-gate-test/team-access-gate-cases.js')));await test.run();
