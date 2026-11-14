import {useState} from 'react';
import {useSavedList} from './useSavedList.js';
export default function TravelerNames({trip}) {
 const [status,setStatus]=useState('');
 const names=useSavedList('travelers_'+trip.id,{demo:trip.id==='demo-trip'});
 const count=Math.min(100,Math.max(1,Number(trip.travelers)||1));
 async function save(e){e.preventDefault();setStatus('');if(await names.save(Array.from({length:count},(_,i)=>String(names.value[i]||'').trim().slice(0,120))))setStatus('Traveler names saved to your account.');}
 return <form className="portal-account-tools" onSubmit={save} style={{marginTop:20}}><h3>Traveler names</h3><p>Keep names here for your records. Send any operator coordination requests through Messages. These names do not create separate logins.</p>
 {names.error&&<p role="alert">{names.error} {!names.ready&&<button type="button" onClick={names.retry}>Retry loading names</button>}</p>}
 {Array.from({length:count},(_,i)=><label key={i} style={{display:'grid',gap:6,marginBottom:10}}>Traveler {i+1}<input maxLength={120} value={names.value[i]||''} disabled={names.busy||!names.ready||trip.id==='demo-trip'} onChange={e=>{setStatus('');names.setValue(n=>{const next=[...n];next[i]=e.target.value;return next;});}}/></label>)}
 <button disabled={names.busy||!names.ready||trip.id==='demo-trip'}>Save traveler names</button><p role="status">{names.busy?'Loading or saving traveler names…':status}</p></form>;
}
