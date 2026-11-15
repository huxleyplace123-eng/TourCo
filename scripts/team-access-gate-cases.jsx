import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import Gate from '../src/admin/TeamAccessGate.jsx';
export async function run(){
 let ui,signal,resolveOld;const subscribe=fn=>{signal=fn;return()=>{};};
 const member={configured:true,session:{user:{id:'staff',email:'info@ticowild.com'}},member:{user_id:'staff',role:'manager'}};
 const customer={configured:true,session:{user:{id:'customer',email:'customer@example.test'}},member:null};
 globalThis.localStorage={getItem:()=>JSON.stringify({expiresAt:Date.now()+999999999})};
 let current=customer;
 const load=async()=>current;
 await act(async()=>{ui=TestRenderer.create(<Gate load={load} subscribe={subscribe}><p>PRIVATE CRM DATA</p></Gate>);});
 assert.doesNotMatch(JSON.stringify(ui.toJSON()),/PRIVATE CRM DATA/);assert.match(JSON.stringify(ui.toJSON()),/does not have staff access/);
 current=member;await act(async()=>{signal();await new Promise(r=>setTimeout(r,10));});assert.match(JSON.stringify(ui.toJSON()),/PRIVATE CRM DATA/);
 current=customer;await act(async()=>{signal();await new Promise(r=>setTimeout(r,10));});assert.doesNotMatch(JSON.stringify(ui.toJSON()),/PRIVATE CRM DATA/);
 await act(async()=>ui.unmount());
 let count=0;const delayed=()=>++count===1?new Promise(r=>resolveOld=r):Promise.resolve(customer);
 await act(async()=>{ui=TestRenderer.create(<Gate load={delayed} subscribe={subscribe}><p>PRIVATE CRM DATA</p></Gate>);});
 await act(async()=>{signal();await new Promise(r=>setTimeout(r,10));});
 await act(async()=>resolveOld(member));assert.doesNotMatch(JSON.stringify(ui.toJSON()),/PRIVATE CRM DATA/);await act(async()=>ui.unmount());
 await act(async()=>{ui=TestRenderer.create(<Gate load={async()=>{throw Error('Verification unavailable');}} subscribe={subscribe}><p>PRIVATE CRM DATA</p></Gate>);});
 assert.match(JSON.stringify(ui.toJSON()),/Verification unavailable/);assert.doesNotMatch(JSON.stringify(ui.toJSON()),/PRIVATE CRM DATA/);await act(async()=>ui.unmount());
 console.log('PASS: browser-only markers cannot open CRM; verified staff can; customer switch revokes UI access; stale staff response cannot restore access; verification failures fail closed.');
}
