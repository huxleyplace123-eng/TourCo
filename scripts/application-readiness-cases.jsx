import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {ApplicationDetail} from '../src/admin/ApplicationsApp.jsx';
import {OperatorAgreement} from '../src/components/OperatorAgreement.jsx';
export function run(){
 const base={id:'qa',status:'pending',company_name:'QA',agreement_accepted_at:'2026-11-14',agreement_signature:'test',years_in_business:null};
 for(const [lat,lng,allowed] of [[null,null,false],['','',false],[' ',20,false],[91,10,false],[10,181,false],[10,-84,true],[0,0,true]]){
 const html=renderToStaticMarkup(<ApplicationDetail application={{...base,meeting_point_lat:lat,meeting_point_lng:lng}} busy={false} onAction={()=>{}}/>);
 const approve=html.match(/<button[^>]*>[^]*?Approve partner<\/button>/g)?.at(-1);
 assert(approve); const tag=approve.slice(approve.lastIndexOf('<button'));assert.equal(!/^<button[^>]*disabled/.test(tag),allowed,JSON.stringify([lat,lng]));
 assert.equal(html.includes('Exact meeting pin required'),!allowed);
 }
 const html=renderToStaticMarkup(<OperatorAgreement onClose={()=>{}}/>);assert(html.includes('Download agreement terms'));assert(html.includes('29. Notices, Assignment and General Terms'));assert(!html.includes('not attached here'));assert(html.includes('Continue to secure operator portal'));assert(!html.includes('Review, fill in, sign &amp; send'));
 console.log('PASS: rendered approval rejects missing/out-of-range pins, accepts valid coordinates, footer explains agreement summary.');
}
