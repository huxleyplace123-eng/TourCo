import {useState} from 'react';
import {PortalStyles,TripTab} from '../portal/Portal.jsx';
import {DEMO_TRIP,shapeTrip} from '../portal/portalData.js';
import './customer-portal-preview.css';

// Render only data already authorized by the CRM team gate and workspace query.
// No customer session, credential exchange, or customer write APIs are used here.
export default function CustomerPortalPreview({sample=false,profile,trips=[],messages=[],onSample,onClose}) {
  const rows=sample?[DEMO_TRIP]:trips.filter(t=>profile?.id&&t.user_id===profile.id).map(shapeTrip);
  const [tripId,setTripId]=useState(rows[0]?.id||'');
  const [tab,setTab]=useState('trip');
  const trip=rows.find(t=>t.id===tripId)||null;
  const thread=sample?[
    {id:'sample-1',from:'team',text:'Welcome to your Costa Rica adventure! Your itinerary and meeting details are ready to explore.'},
    {id:'sample-2',from:'customer',text:'Thank you! What should we bring for our first activity?'},
  ]:messages.filter(m=>profile?.id&&m.user_id===profile.id);
  return <div className="customer-portal crm-portal-preview" style={{minHeight:'100vh',background:'#F2F1EC',color:'#172532',fontFamily:'Inter,system-ui,sans-serif'}}>
    <PortalStyles/>
    <header className="cpp-banner"><div><b>{sample?'Sample customer portal':`Customer portal preview · ${profile?.name||profile?.email}`}</b><span>{sample?'Fictional trip for demonstration.':'Published trips and messages · snapshot from the CRM.'} Your staff account stays signed in. Customer actions are unavailable.</span></div><button onClick={onClose}>← Back to CRM</button></header>
    <nav className="cpp-nav" aria-label="Customer portal preview"><strong>TicoWild · My trips</strong>{[['trip','My trip'],['messages','Messages'],['account','Account']].map(([key,label])=><button key={key} aria-pressed={tab===key} onClick={()=>setTab(key)}>{label}</button>)}</nav>
    <div className="pt-wrap">
      {tab==='trip'&&<><label className="cpp-trip">Choose a trip<select value={tripId} onChange={e=>setTripId(e.target.value)}>{!rows.length&&<option value="">No published trips yet</option>}{rows.map(t=><option key={t.id} value={t.id}>{t.title} · {t.start}</option>)}</select></label>
        <p className="cpp-note">Explore the same trip layout customers use, including itinerary, meeting details and documents. Private saved ideas, traveler preferences, notifications and sign-in settings are not included. Checklist changes in this preview are temporary.</p>
        <TripTab key={trip?.id||'empty'} trip={trip} readOnly sampleMode={sample} onPreviewSample={onSample} onExitSample={onClose} onMessage={()=>setTab('messages')} onAccount={()=>setTab('account')}/>
      </>}
      {tab==='messages'&&<section className="cpp-card"><h1>Your concierge conversation</h1><p>Read-only preview. Return to CRM to reply as TicoWild.</p>{!thread.length&&<p>No portal messages yet.</p>}{thread.map(m=><article className="cpp-message" key={m.id} data-team={m.from==='team'}><b>{m.from==='team'?'TicoWild':sample?'Sample traveler':profile?.name||'Customer'}</b>{m.at&&<time>{new Date(m.at).toLocaleString()}</time>}<p>{m.text}</p></article>)}</section>}
      {tab==='account'&&<section className="cpp-card"><h1>Customer account</h1><p><b>{sample?'Sample traveler':profile?.name||'Name not provided'}</b></p><p>{sample?'traveler@example.com':profile?.email}</p><p>This staff preview does not open the customer’s private profile editor or change their password. Use My trip to explore the portal; return to CRM to manage published details.</p><button onClick={()=>setTab('trip')}>View trip</button></section>}
    </div>
  </div>;
}
