import {useEffect,useRef,useState} from 'react';
import {supabase} from '../portal/supabase.js';
import {getTeamAccess} from './applications-data.js';
import Login from './Login.jsx';
const subscribeDefault=callback=>{const sub=supabase?.auth.onAuthStateChange(callback);return()=>sub?.data.subscription.unsubscribe();};
export default function TeamAccessGate({children,load=getTeamAccess,subscribe=subscribeDefault}){
 const [access,setAccess]=useState(null),[error,setError]=useState(''),[ready,setReady]=useState(false);const epoch=useRef(0);
 async function check(){const n=++epoch.current;try{const result=await load();if(n!==epoch.current)return;setAccess(result);setError(result.configured?'':'The team sign-in service is not configured.');}catch(e){if(n!==epoch.current)return;setAccess(null);setError(e.message||'Team access could not be verified.');}finally{if(n===epoch.current)setReady(true);}}
 useEffect(()=>{let timer;check();const stop=subscribe(()=>{epoch.current++;setAccess(null);setReady(false);clearTimeout(timer);timer=setTimeout(check,0);});const poll=setInterval(check,60000);return()=>{epoch.current++;clearTimeout(timer);clearInterval(poll);stop();};},[load,subscribe]);
 if(!ready)return <main role="status" style={{padding:32,fontFamily:'sans-serif'}}>Verifying your TicoWild team access…</main>;
 if(!access?.configured||!access?.session||!access?.member)return <Login access={access} error={error} onRetry={check}/>;
 return <div key={access.session.user.id}>{children}</div>;
}
