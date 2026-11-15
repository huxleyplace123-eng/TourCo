import {useEffect,useRef,useState} from 'react';
import {supabase,withTimeout} from '../portal/supabase.js';
export default function EmailDeliveryStatus(){
 const [open,setOpen]=useState(false),[rows,setRows]=useState([]),[error,setError]=useState(''),[busy,setBusy]=useState(false);const epoch=useRef(0);
 useEffect(()=>{const sub=supabase?.auth.onAuthStateChange(()=>{epoch.current++;setRows([]);setOpen(false);setError('');setBusy(false);});return()=>{epoch.current++;sub?.data.subscription.unsubscribe();};},[]);
 async function refresh(){const n=++epoch.current;setBusy(true);setError('');try{
  if(!supabase)throw Error('Connect your CRM team account first.');
  const {data:auth,error:authError}=await supabase.auth.getUser();if(authError||!auth.user)throw Error('Sign in to your CRM team account first.');
  const {data:team,error:teamError}=await supabase.from('team_members').select('user_id').eq('user_id',auth.user.id);if(teamError||!team?.length)throw Error('Team access is required to view email delivery.');
  const {data,error}=await withTimeout(supabase.from('email_notifications').select('id,subject,recipient_email,state,created_at,last_error').order('created_at',{ascending:false}).limit(30),12000,'Email delivery');
  if(error)throw error;if(epoch.current===n)setRows(data||[]);
 }catch(e){if(epoch.current===n)setError(e.message);}finally{if(epoch.current===n)setBusy(false);}}
 return <div style={{flexShrink:0,marginBottom:8}}><button onClick={()=>{setOpen(v=>!v);if(!open)refresh();}} aria-expanded={open}>Automatic email delivery</button>{open&&<section aria-label="Automatic email delivery" style={{maxHeight:'35vh',overflow:'auto',padding:12,border:'1px solid #36506d',borderRadius:8,marginTop:8}}><p>Portal notifications are separate from your Outlook mailbox. “Accepted” means the provider accepted the message; “Delivered” means the recipient’s mail server accepted it, not that it was read.</p><button onClick={refresh} disabled={busy}>Refresh delivery status</button>{busy&&<p role="status">Loading delivery status…</p>}{error&&<p role="alert">{error}</p>}{!busy&&!error&&!rows.length&&<p>No automatic email activity recorded yet.</p>}{rows.map(row=><article key={row.id} style={{padding:'10px 0',borderBottom:'1px solid #36506d'}}><strong>{row.subject}</strong><div>{row.recipient_email||'Recipient checked before sending'} · <b>{row.state}</b> · {new Date(row.created_at).toLocaleString()}</div>{row.last_error&&<small>{row.last_error}</small>}</article>)}</section>}</div>;
}
