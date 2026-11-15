import {build} from 'vite';
import {pathToFileURL} from 'node:url';
import {resolve} from 'node:path';
await build({logLevel:'error',plugins:[{name:'agreement-data-test',enforce:'pre',resolveId(source,importer){if(source==='./data.js'&&importer?.endsWith('AgreementCenter.jsx'))return '\0agreement-test-data';},load(id){if(id==='\0agreement-test-data')return `export const listAgreements=(...args)=>globalThis.__agreementList(...args);export const prepareAgreement=async()=>{throw Error('Prepare failed');};export const getAgreement=()=>{},recordEvent=()=>{},openAgreement=()=>{},signAgreement=()=>{},agreementLink=()=>'',agreementMessage=()=>'',downloadAgreement=()=>{};`;}}],build:{ssr:'scripts/agreement-refresh-cases.jsx',outDir:'node_modules/.agreement-refresh-test',emptyOutDir:true}});
process.env.NODE_ENV='development';
const test=await import(pathToFileURL(resolve('node_modules/.agreement-refresh-test/agreement-refresh-cases.js')));
await test.run();
