import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({configFile:false,logLevel:'error',build:{ssr:'scripts/payment-document-cases.jsx',outDir:'node_modules/.payment-document-test',emptyOutDir:true}});
(await import(pathToFileURL(resolve('node_modules/.payment-document-test/payment-document-cases.js')))).run();
