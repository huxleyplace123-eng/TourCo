import React,{useState,useRef} from 'react';
import {trackedRequests,requestStatuses,requestUpdate} from './request-tracking.js';
export default function RequestTracker({messages=[],onUpdate,busy=false}) {
  const requests=trackedRequests(messages);
  if(!requests.length)return null;
  return <section aria-label="Request progress" style={{padding:16,border:'1px solid #a9bac8',borderRadius:14,margin:'16px 0'}}><h3>Request progress</h3><p>Updates from your private conversation. A resolved request does not change a booking by itself; check your published itinerary.</p>{requests.map(r=><article key={r.id} style={{borderTop:'1px solid #a9bac8',padding:'12px 0',overflowWrap:'anywhere'}}><strong>{r.title} · {r.status}</strong>{r.status!=="Resolved"&&["Operator has not arrived","Meeting-point help"].includes(r.title)&&<p role="status">Time-sensitive: contact the team directly if your activity is starting. Messages are not emergency dispatch.</p>}<p>Responsible team member: {r.owner}</p><small>Updated {new Date(r.updatedAt).toLocaleString()}</small>{r.update&&<p style={{whiteSpace:'pre-wrap'}}>{r.update}</p>}{onUpdate&&<UpdateForm key={`${r.id}:${r.updatedAt}`} request={r} onUpdate={onUpdate} busy={busy}/>}</article>)}</section>;
}
function UpdateForm({request,onUpdate,busy}) {
  const lock=useRef(false);const [sending,setSending]=useState(false);
  const [status,setStatus]=useState(request.status),[owner,setOwner]=useState(request.owner==='Not assigned'?'':request.owner),[note,setNote]=useState(''),[error,setError]=useState('');
  async function submit(e){e.preventDefault();if(lock.current)return;lock.current=true;setSending(true);try{const text=requestUpdate(request.id,status,owner,note);setError('');if(await onUpdate(text))setNote('');else setError('The update could not be confirmed. Your details are retained; retry safely.');}catch(e){setError(e.message);}finally{lock.current=false;setSending(false);}}
  return <form onSubmit={submit}><fieldset disabled={busy||sending}><legend>Send a request update to the customer</legend><label>Status<select value={status} onChange={e=>setStatus(e.target.value)}>{requestStatuses.map(s=><option key={s}>{s}</option>)}</select></label><label>Responsible team member<input required maxLength={80} value={owner} onChange={e=>setOwner(e.target.value)}/></label><label>Customer-visible update<textarea required minLength={8} maxLength={1800} value={note} onChange={e=>setNote(e.target.value)}/></label><button>{sending?'Sending update…':'Send request update'}</button>{error&&<p role="alert">{error}</p>}</fieldset></form>;
}
