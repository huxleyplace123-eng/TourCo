import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',build:{ssr:'scripts/experience-ui-cases.jsx',outDir:'node_modules/.experience-ui-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
await(await import(pathToFileURL(resolve('node_modules/.experience-ui-test/experience-ui-cases.js')))).run();
