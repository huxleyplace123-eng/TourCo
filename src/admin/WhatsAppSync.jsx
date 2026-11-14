import { useEffect, useRef, useState } from 'react';
import { c, FONT } from '../theme.js';
import { MAX_CHAT_BYTES, prepareWhatsAppNotes } from './whatsapp-import.js';

export function WhatsAppLogo() {
  return <svg width="19" height="19" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M20.5 3.5A11.9 11.9 0 0 0 12 0C5.4 0 0 5.4 0 12c0 2.1.5 4.2 1.6 6L0 24l6.2-1.6A12 12 0 0 0 12 24c6.6 0 12-5.4 12-12 0-3.2-1.2-6.2-3.5-8.5ZM12 22a10 10 0 0 1-5.1-1.4l-.4-.2-3.7 1 1-3.6-.3-.4A10 10 0 1 1 12 22Zm5.5-7.5-1.8-.9c-.3-.1-.5-.2-.7.2l-.8 1c-.2.2-.4.2-.7.1-1.8-.9-3-2-3.9-3.8-.2-.3 0-.5.1-.6l.6-.7c.2-.2.2-.4.3-.6l-.1-.6-.9-2.1c-.2-.5-.5-.4-.7-.4h-.6c-.2 0-.5.1-.7.3-.8.8-1.1 1.6-1.1 2.5 0 1.5 1.1 3 1.3 3.2.2.2 2.2 3.5 5.4 4.8 2.5 1 3.2.8 3.8.7.8-.1 1.8-.7 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4Z"/></svg>;
}

export default function WhatsAppSync({ customers, initialId, connected, onSave, onClose, entity = 'customer' }) {
  const [customerId, setCustomerId] = useState(initialId || '');
  const [source, setSource] = useState('');
  const [preview, setPreview] = useState(null);
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);
  const [success, setSuccess] = useState('');
  const selectRef = useRef(null);
  const customer = customers.find(item => item.id === customerId);
  const field = { width:'100%', boxSizing:'border-box', padding:10, borderRadius:8, background:c.sand, color:c.charcoal, border:`1px solid ${c.line}`, fontFamily:FONT };
  const button = { padding:'10px 14px', borderRadius:8, border:`1px solid ${c.line}`, background:c.surface2, color:c.charcoal, cursor:busy ? 'wait' : 'pointer', fontFamily:FONT };
  useEffect(() => { const previous = document.activeElement; selectRef.current?.focus(); return () => previous?.focus?.(); }, []);
  const invalidate = () => { setPreview(null); setError(''); setSuccess(''); };
  async function readFile(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    invalidate();
    try {
      if (!/\.txt$/i.test(file.name)) throw new Error('Choose the .txt chat export. ZIP files and attachments are not supported.');
      if (file.size > MAX_CHAT_BYTES) throw new Error('Choose a text export smaller than 1 MB.');
      setSource(await file.text());
    } catch (err) { setSource(''); setError(err.message); }
    event.target.value = '';
  }
  async function review() {
    setBusy(true); setError('');
    try { setPreview(await prepareWhatsAppNotes(source, customer?.notes)); }
    catch (err) { setError(err.message); }
    finally { setBusy(false); }
  }
  async function save() {
    setBusy(true); setError('');
    try {
      const count = await onSave(customerId, source);
      setSuccess(`${count} new message${count === 1 ? '' : 's'} saved to ${customer.name} in the shared CRM. Find them in the ${entity}’s notes.`);
      setPreview(null); setSource('');
    } catch (err) { setError(err.message || 'Save failed. Your pasted conversation is still here.'); }
    finally { setBusy(false); }
  }
  return <div style={{position:'fixed',inset:0,zIndex:200,background:'rgba(0,0,0,.65)',display:'flex',alignItems:'center',justifyContent:'center',padding:12}} onKeyDown={e => {
    if (e.key === 'Escape' && !busy) { e.stopPropagation(); onClose(); }
    if (e.key === 'Tab') {
      const elements = [...e.currentTarget.querySelectorAll('button:not(:disabled),select:not(:disabled),textarea:not(:disabled),input:not(:disabled),a[href]')];
      const first = elements[0], last = elements.at(-1);
      if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last?.focus(); }
      else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first?.focus(); }
    }
  }}>
    <section role="dialog" aria-modal="true" aria-labelledby="wa-sync-title" style={{background:c.white,color:c.charcoal,fontFamily:FONT,width:'100%',maxWidth:680,maxHeight:'90vh',overflowY:'auto',borderRadius:16,padding:22,boxSizing:'border-box'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',gap:12}}><h2 id="wa-sync-title" style={{display:'flex',gap:9,alignItems:'center',margin:0,color:'#25D366'}}><WhatsAppLogo/> WhatsApp sync</h2><button style={button} disabled={busy} onClick={onClose} aria-label="Close WhatsApp sync">Close</button></div>
      <p style={{lineHeight:1.5}}>Bring a conversation into your shared CRM. <strong>Manual import—not automatic or live sync.</strong> Replies still happen in WhatsApp.</p>
      <p style={{color:c.stone,fontSize:13}}>Company WhatsApp: John · +1 918-506-2803. Copy the messages, or export a chat without media and choose its .txt file. Only import the conversation intended for this {entity}.</p>
      {!connected && <p role="alert" style={{color:'#FCA5A5'}}>Connect the team database in Applications before saving shared messages.</p>}
      <label>{entity === 'operator' ? 'Operator' : 'Customer'}<select ref={selectRef} aria-label={`WhatsApp sync ${entity}`} value={customerId} disabled={busy} style={{...field,margin:'6px 0 14px'}} onChange={e => {setCustomerId(e.target.value); invalidate();}}><option value="">Choose a {entity}</option>{customers.map(item => <option key={item.id} value={item.id}>{item.name} · {item.whatsapp || item.phone || item.email || 'No contact details'}</option>)}</select></label>
      <label style={{display:'block'}}>Upload chat export (.txt)<input aria-label="Upload WhatsApp chat export" type="file" accept=".txt,text/plain" disabled={busy} onChange={readFile} style={{display:'block',margin:'8px 0 14px',maxWidth:'100%'}}/></label>
      <label>Or paste messages<textarea aria-label="WhatsApp conversation" rows={7} value={source} disabled={busy} style={{...field,marginTop:6,resize:'vertical'}} onChange={e => {setSource(e.target.value); invalidate();}} placeholder="Paste the conversation here…"/></label>
      <p style={{fontSize:12,color:c.stone}}>Original dates and names are preserved as text. Identical imported entries are skipped. Edited text or different export formatting may be treated as new. Attachments are not imported.</p>
      {error && <p role="alert" style={{color:'#FCA5A5'}}>{error}</p>}
      {success && <p role="status" style={{color:'#25D366'}}>{success}</p>}
      {preview && <div style={{margin:'14px 0',padding:12,border:`1px solid ${c.line}`,borderRadius:8}}><strong>{preview.notes.length} new entries · {preview.duplicates} duplicates skipped</strong><p>Save to: {customer?.name} · {customer?.phone || customer?.email}</p><div style={{maxHeight:190,overflowY:'auto'}}>{preview.notes.map(note => <pre key={note.id} style={{whiteSpace:'pre-wrap',overflowWrap:'anywhere',fontFamily:FONT,fontSize:12,borderTop:`1px solid ${c.line}`,paddingTop:8}}>{note.text}</pre>)}</div></div>}
      <div style={{display:'flex',gap:8,flexWrap:'wrap'}}><button style={button} disabled={busy || !customer || !source.trim()} onClick={review}>{busy ? 'Working…' : 'Review messages'}</button>{preview && <button style={{...button,background:'#25D366',color:c.ink,fontWeight:800}} disabled={busy || !connected || !preview.notes.length} onClick={save}>Save to shared CRM</button>}</div>
    </section>
  </div>;
}
