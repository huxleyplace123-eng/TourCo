export function createVersionedPortalSaver(initialVersion,write){
 let version=initialVersion,chain=Promise.resolve();
 return snapshot=>{const copy=structuredClone(snapshot);const operation=chain.then(async()=>{version=await write(copy,version);return version;});chain=operation.catch(()=>{});return operation;};
}
