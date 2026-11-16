import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',plugins:[{name:'no-map-in-server-status-test',enforce:'pre',resolveId(id){if(id==='leaflet')return '\0test-leaflet';},load(id){if(id==='\0test-leaflet')return 'export default {};';}}],build:{ssr:'scripts/trip-status-cases.jsx',outDir:'node_modules/.trip-status-test',emptyOutDir:true}});
(await import(pathToFileURL(resolve('node_modules/.trip-status-test/trip-status-cases.js')))).run();
