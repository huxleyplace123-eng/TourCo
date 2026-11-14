import React from 'react';import TestRenderer,{act} from 'react-test-renderer';import assert from 'node:assert/strict';import Root from '../src/portal/Root.jsx';
export async function run(){let resolveInitial,ui,scopes=[];globalThis.localStorage={removeItem(){}};
 globalThis.__customerSession={getSession:()=>new Promise(r=>resolveInitial=r),signOut:async options=>{scopes.push(options);return {error:null};}};
 await act(async()=>{ui=TestRenderer.create(<Root/>);});await act(async()=>globalThis.__customerSession.watch('SIGNED_IN',{user:{id:'new',email:'new@example.test'}}));await act(async()=>resolveInitial({data:{session:{user:{id:'old',email:'old@example.test'}}},error:null}));
 assert.match(JSON.stringify(ui.toJSON()),/new@example.test/);assert.doesNotMatch(JSON.stringify(ui.toJSON()),/old@example.test/);
 await act(async()=>ui.root.findByType('button').props.onClick());assert.deepEqual(scopes,[{scope:'local'}]);assert.match(JSON.stringify(ui.toJSON()),/Sign-in page/);await act(async()=>ui.unmount());
 globalThis.__customerSession={getSession:async()=>({data:{session:{user:{id:'new',email:'new@example.test'}}},error:null}),signOut:async()=>({error:new Error('Sign-out connection failed')})};
 await act(async()=>{ui=TestRenderer.create(<Root/>);});await act(async()=>ui.root.findByType('button').props.onClick());assert.match(JSON.stringify(ui.toJSON()),/Sign-out connection failed/);assert.doesNotMatch(JSON.stringify(ui.toJSON()),/Sign-in page/);await act(async()=>ui.unmount());delete globalThis.__customerSession;
 console.log('PASS: customer auth events beat stale session loads, sign-out is device-local, and failed logout remains visible instead of falsely showing signed out.');
}
