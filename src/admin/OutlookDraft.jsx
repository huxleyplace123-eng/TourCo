import {useState} from 'react';
import {outlookComposeHref} from './outlook-compose.js';
export default function OutlookDraft({draft,disabled=false}) {
  const [notice,setNotice]=useState('');
  let href='',error='';
  try {href=outlookComposeHref(draft);} catch(e) {error=e.message;}
  return <div><p className="mail-muted">Outlook opens separately. Check that From is info@ticowild.com, review the draft, then click Send there. Opening it does not confirm sending or delivery.</p>
    {href&&!disabled?<a className="mail-outlook ag-primary" href={href} target="_blank" rel="noreferrer" onClick={()=>setNotice('Outlook draft requested. Your CRM draft stays here; nothing is marked sent. Check Outlook before opening another copy.')}>Open draft in Outlook</a>:<button type="button" disabled>Open draft in Outlook</button>}
    {error&&<p>{error}</p>}
    <button type="button" disabled={disabled} onClick={async()=>{try{await navigator.clipboard.writeText(draft.body||'');setNotice('Message copied. Paste it into Outlook and check the recipient and subject.');}catch{setNotice('Could not copy automatically. Select and copy the message text below.');}}}>Copy message</button>
    {notice&&<p role="status">{notice}</p>}
  </div>;
}
