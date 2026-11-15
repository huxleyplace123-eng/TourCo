import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import {AgreementCenter} from '../src/agreements/AgreementCenter.jsx';
export async function run(){
 let ui,fail=true;
 globalThis.__agreementList=async()=>{if(fail)throw Error('Temporary load failure');return [];};
 await act(async()=>{ui=TestRenderer.create(<AgreementCenter op={{id:'qa',email:'qa@example.test'}}/>);});
 assert.match(JSON.stringify(ui.toJSON()),/Temporary load failure/);
 fail=false;
 await act(async()=>ui.root.findByProps({'aria-label':'Refresh agreement status'}).props.onClick());
 assert.doesNotMatch(JSON.stringify(ui.toJSON()),/Temporary load failure/);
 await act(async()=>ui.root.findAllByType('button').find(b=>b.children.includes('Prepare secure agreement link')).props.onClick());
 assert.match(JSON.stringify(ui.toJSON()),/Prepare failed/);
 await act(async()=>ui.root.findByProps({'aria-label':'Refresh agreement status'}).props.onClick());
 assert.match(JSON.stringify(ui.toJSON()),/Prepare failed/,'Background reads must not hide action errors');
 await act(async()=>ui.unmount());delete globalThis.__agreementList;
 console.log('PASS: refreshed agreement status clears stale load failures without hiding failed actions.');
}
