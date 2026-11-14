export const getSession=()=>globalThis.__partnerTest.getSession();
export const watchSession=cb=>{globalThis.__partnerTest.watch=cb;return ()=>{};};
export const loadPartnerContext=session=>globalThis.__partnerTest.load(session);
export const signOut=async()=>{};export const savePortal=async()=>{};export const demoSession=()=>null;
