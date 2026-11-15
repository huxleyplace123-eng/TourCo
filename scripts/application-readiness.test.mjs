import {build} from 'vite';import {pathToFileURL} from 'node:url';import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/application-readiness-cases.jsx',outDir:'node_modules/.readiness-test',emptyOutDir:true}});
(await import(pathToFileURL(resolve('node_modules/.readiness-test/application-readiness-cases.js')))).run();
