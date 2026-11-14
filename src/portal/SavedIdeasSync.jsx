import {useEffect,useRef,useState} from 'react';
import {supabase,hasSupabase} from './supabase.js';
import {getPreference,savePreference} from './preferences.js';
// Explicit account save/load preserves the guest shortlist and avoids silently merging shared-device data.
export default function SavedIdeasSync({trip,setTrip}) {
 const [email,setEmail]=useState(''),[busy,setBusy]=useState(false),[status,setStatus]=useState('');const lock=useRef(false);
 useEffect(()=>{if(!hasSupabase)return;let live=true;supabase.auth.getSession().then(({data})=>{if(live)setEmail(data.session?.user.email||'');});const {data}=supabase.auth.onAuthStateChange((_e,s)=>{if(live)setEmail(s?.user.email||'');});return()=>{live=false;data.subscription.unsubscribe();};},[]);
 const act=async(save)=>{if(lock.current)return;lock.current=true;setBusy(true);setStatus('');try{if(save){await savePreference('saved-ideas',trip);setStatus('Saved to your account. Open Saved ideas in your customer portal on any device.');}else{const saved=await getPreference('saved-ideas',[]);if(!Array.isArray(saved))throw new Error('Saved ideas could not be loaded.');setTrip(saved);setStatus('Account ideas loaded on this device.');}}catch(e){setStatus(e.message);}finally{lock.current=false;setBusy(false);}};
 return <section style={{maxWidth:1160,margin:'16px auto',padding:16,border:'1px solid #406080',borderRadius:12,color:'#fff',background:'#13294a'}} aria-label="Account saved ideas"><b>Saved ideas</b> {email?<><span> · {email}</span><div><button disabled={busy} onClick={()=>act(true)}>Save these ideas to my account</button> <button disabled={busy} onClick={()=>act(false)}>Load my account’s ideas</button> <a href="/my/">My customer portal</a></div></>:<p>These ideas are stored on this device. <a href="/my/">Sign in</a> to save them to your account.</p>}<p role="status">{status}</p></section>;
}
