import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/customer-journey-cases.jsx',outDir:'node_modules/.customer-journey-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
await(await import(pathToFileURL(resolve('node_modules/.customer-journey-test/customer-journey-cases.js')))).run();
