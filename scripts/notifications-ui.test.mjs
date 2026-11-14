import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/notifications-ui-cases.jsx',outDir:'node_modules/.notifications-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.notifications-test/notifications-ui-cases.js')));
await test.run();
