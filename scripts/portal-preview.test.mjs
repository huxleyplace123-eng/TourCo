import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
// Leaflet needs a browser DOM; map rendering is checked separately in browser.
await build({logLevel:'error',plugins:[{name:'map-dom-stub',enforce:'pre',resolveId(id){if(id==='leaflet')return '\0map-stub';},load(id){if(id==='\0map-stub')return 'export default {};';}}],build:{ssr:'scripts/portal-preview-cases.jsx',outDir:'node_modules/.portal-preview-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
await(await import(pathToFileURL(resolve('node_modules/.portal-preview-test/portal-preview-cases.js')))).run();
