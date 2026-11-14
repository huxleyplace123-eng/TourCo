export const hasSupabase=true;export const friendlyBackendError=(e)=>e;export const withTimeout=p=>p;
export const supabase={auth:{getSession:()=>globalThis.__customerSession.getSession(),onAuthStateChange:cb=>{globalThis.__customerSession.watch=cb;return {data:{subscription:{unsubscribe(){}}}};},signOut:options=>globalThis.__customerSession.signOut(options)}};
