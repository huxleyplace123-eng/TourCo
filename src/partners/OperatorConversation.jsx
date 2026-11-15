import {useEffect,useRef,useState} from 'react';
import {loadOperatorMessages,sendOperatorMessage} from './message-data.js';
const control={minHeight:44,padding:'10px 14px',border:'1px solid #406080',borderRadius:10,background:'#13294a',color:'#fff',font:'inherit',fontSize:13,fontWeight:700,cursor:'pointer',width:'fit-content',maxWidth:'100%'};
export default function OperatorConversation({operatorId,operatorName='Operator',load=loadOperatorMessages,send=sendOperatorMessage}) {
 const [messages,setMessages]=useState([]),[draft,setDraft]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[loading,setLoading]=useState(true),[limit,setLimit]=useState(100);
 const sequence=useRef(0),lock=useRef(false),retry=useRef(null);
 async function refresh(){if(lock.current)return;const n=++sequence.current;try{const rows=await load(operatorId,limit);if(n===sequence.current){setMessages(rows);setError('');}}catch(e){if(n===sequence.current)setError(e.message);}finally{if(n===sequence.current)setLoading(false);}}
 useEffect(()=>{refresh();const timer=setInterval(refresh,15000);return()=>{sequence.current++;clearInterval(timer);};},[operatorId,limit]);
 async function submit(e){e.preventDefault();const text=draft.trim();if(lock.current||!text)return;
  lock.current=true;sequence.current++;setBusy(true);setError('');
  const request=retry.current?.text===text?retry.current:{text,id:crypto.randomUUID()};retry.current=request;
  try{const saved=await send(operatorId,text,request.id);setMessages(rows=>rows.some(m=>m.id===saved.id)?rows:[...rows,saved]);setDraft('');retry.current=null;}
  catch(e){setError(e.message+' Your message is still here. Retry to check delivery.');}
  finally{lock.current=false;setBusy(false);}
 }
 return <section aria-label={'Shared conversation with '+operatorName} style={{display:'grid',gap:12,minWidth:0}}>
  <h3 style={{margin:0}}>Messages with {operatorName}</h3><p style={{margin:0,fontSize:13}}>Shared between the TicoWild team and this operator’s portal. These messages are not WhatsApp or email notifications.</p>
  <button type="button" style={control} disabled={busy} onClick={refresh}>Refresh messages</button>
  {error&&<p role="alert">{error}</p>}{loading&&<p role="status">Loading conversation…</p>}
  <div aria-live="polite" style={{display:'grid',gap:10,maxHeight:380,overflowY:'auto',overflowWrap:'anywhere'}}>
   {messages.map(m=><article key={m.id} style={{padding:12,border:'1px solid #406080',borderRadius:12,background:m.sender_role==='team'?'#173e4b':'#13294a',color:'#fff'}}><b>{m.sender_role==='team'?'TicoWild team':operatorName}</b><small style={{display:'block'}}>{new Date(m.created_at).toLocaleString()}{m.legacy?' · Imported history':''}</small><p style={{margin:'8px 0 0',whiteSpace:'pre-wrap'}}>{m.text}</p></article>)}
   {!loading&&!messages.length&&!error&&<p>No shared messages yet.</p>}
  </div>
  {messages.length>=limit&&<button type="button" style={control} disabled={busy} onClick={()=>setLimit(n=>n+100)}>Load older messages</button>}
  <form onSubmit={submit} style={{display:'grid',gap:8}}><label>Message<textarea aria-label="Message to operator conversation" value={draft} maxLength={5000} disabled={busy} onChange={e=>setDraft(e.target.value)} style={{display:'block',boxSizing:'border-box',width:'100%',minHeight:100,marginTop:6,padding:12,borderRadius:10,border:'1px solid #406080',background:'#0b1a2e',color:'#fff',font:'inherit',fontSize:16,resize:'vertical'}}/></label><button style={{...control,background:'#ffd100',color:'#0b1a2e',opacity:(busy||!draft.trim())?0.55:1,cursor:busy||!draft.trim()?'default':'pointer'}} disabled={busy||!draft.trim()}>{busy?'Sending…':'Send portal message'}</button></form>
 </section>;
}

