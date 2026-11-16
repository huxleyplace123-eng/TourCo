import React from 'react';import TestRenderer,{act} from 'react-test-renderer';import assert from 'node:assert/strict';import Root from '../src/partners/Root.jsx';
export async function run(){
 globalThis.window={location:{search:""}};
 let initial,active=false,secondResolve,ui,calls=[];
 globalThis.__partnerTest={getSession:()=>new Promise(r=>initial=r),load:async s=>{calls.push(s.user.id);if(s.user.id==='other')return new Promise(r=>secondResolve=r);return active?{kind:'active',operator:{id:'qa',name:'Verified QA operator'},portal:{},bookings:[]}:{kind:'application',application:{status:'pending',company_name:'QA Company'}};}};
 await act(async()=>{ui=TestRenderer.create(<Root/>);});
 await act(async()=>globalThis.__partnerTest.watch({user:{id:'current',email:'qa@example.test'}}));
 await act(async()=>initial({user:{id:'stale'}}));assert.deepEqual(calls,['current']);
 assert.match(JSON.stringify(ui.toJSON()),/Pending application/);
 const refresh=ui.root.findAllByType('button').find(b=>b.children.join('')==='Check application status');assert.ok(refresh);
 active=true;await act(async()=>refresh.props.onClick());assert.match(JSON.stringify(ui.toJSON()),/Verified QA operator/);
 await act(async()=>globalThis.__partnerTest.watch({user:{id:'other'}}));assert.doesNotMatch(JSON.stringify(ui.toJSON()),/Verified QA operator/);
 await act(async()=>secondResolve({kind:'active',operator:{id:'other-op',name:'Other operator'},portal:{},bookings:[]}));assert.match(JSON.stringify(ui.toJSON()),/Other operator/);
 await act(async()=>globalThis.__partnerTest.watch(null));assert.doesNotMatch(JSON.stringify(ui.toJSON()),/Other operator/);
 await act(async()=>globalThis.__partnerTest.watch({user:{id:'other'}}));
 await act(async()=>globalThis.__partnerTest.watch(null));
 await act(async()=>secondResolve({kind:'active',operator:{id:'stale-op',name:'Stale private operator'},portal:{},bookings:[]}));assert.doesNotMatch(JSON.stringify(ui.toJSON()),/Stale private operator/);
 await act(async()=>ui.unmount());delete globalThis.__partnerTest;
 console.log('PASS: auth races, pending-review refresh, account switching, expired session and late private responses after sign-out.');
}
