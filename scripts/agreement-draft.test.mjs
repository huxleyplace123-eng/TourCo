import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/agreement-draft-cases.jsx',outDir:'node_modules/.agreement-draft-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.agreement-draft-test/agreement-draft-cases.js')));
await test.run();
