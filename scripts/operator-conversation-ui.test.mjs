import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/operator-conversation-cases.jsx',outDir:'node_modules/.operator-conversation-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.operator-conversation-test/operator-conversation-cases.js')));
await test.run();
