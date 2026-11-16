import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/reliability-ui-cases.jsx',outDir:'node_modules/.reliability-ui-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
await(await import(pathToFileURL(resolve('node_modules/.reliability-ui-test/reliability-ui-cases.js')))).run();
