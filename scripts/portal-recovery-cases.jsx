import Login from '../src/portal/Login.jsx';
import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import {useSavedList} from '../src/portal/useSavedList.js';
import {deliverInquiry} from '../src/conversion.js';
import {InquiryModal} from '../src/components/ConversionCenter.jsx';
import {PlanContactCard} from '../src/pages/Build.jsx';
const deferred=()=>{let resolve,reject;const promise=new Promise((yes,no)=>{resolve=yes;reject=no;});return {promise,resolve,reject};};
export async function run(){
 let api,view;let pending=deferred(),writes=[];
 const read=()=>pending.promise,write=async(key,value)=>writes.push({key,value});
 function Probe({id}){api=useSavedList(id,{read,write});return null;}
 await act(async()=>{view=TestRenderer.create(<Probe id="first"/>);});
 await act(async()=>{assert.equal(await api.save(['overwrite']),false);});assert.equal(writes.length,0);
 await act(async()=>pending.reject(new Error('offline')));assert.equal(api.ready,false);
 await act(async()=>{assert.equal(await api.save(['overwrite']),false);});assert.equal(writes.length,0);
 pending=deferred();await act(async()=>{api.retry();});await act(async()=>pending.resolve(['Original']));assert.deepEqual(api.value,['Original']);
 await act(async()=>api.save(['Updated']));assert.deepEqual(writes,[{key:'first',value:['Updated']}]);
 pending=deferred();await act(async()=>view.update(<Probe id="second"/>));assert.equal(api.ready,false);assert.deepEqual(api.value,[]);
 await act(async()=>pending.resolve(['Second account trip']));assert.deepEqual(api.value,['Second account trip']);
 pending=deferred();await act(async()=>{api.retry();});const stale=pending;pending=deferred();await act(async()=>view.update(<Probe id="third"/>));await act(async()=>pending.resolve(['Third']));await act(async()=>stale.resolve(['Stale']));assert.deepEqual(api.value,['Third']);
 await act(async()=>view.unmount());
 globalThis.window={location:{pathname:'/plan'},addEventListener(){},removeEventListener(){}};
 globalThis.document={body:{style:{},classList:{add(){},remove(){}}}};
 globalThis.localStorage={getItem(){return null;},setItem(){throw new Error('quota');}};
 const fallback=await deliverInquiry({name:'QA',email:'qa@example.test'});assert.equal(fallback.delivered,false);assert.ok(fallback.fallbackHref.startsWith('mailto:info@ticowild.com'));
 const fail=async()=>{throw new Error('network');};
 await act(async()=>{view=TestRenderer.create(<InquiryModal request={{}} onClose={()=>{}} deliver={fail}/>);});
 for(const [field,value] of [['name','QA Guest'],['email','qa@example.test']])await act(async()=>view.root.findByProps({autoComplete:field}).props.onChange({target:{value}}));
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(view.root.findByProps({autoComplete:'name'}).props.value,'QA Guest');assert.ok(view.root.findByProps({role:'alert'}));assert.equal(view.root.findByProps({type:'submit'}).props.disabled,false);
 await act(async()=>view.unmount());
 const plannerForm={who:'couple',vibe:'nature',budget:'mid',stops:[],pax:'2'};const result={plan:{days:[]}};
 await act(async()=>{view=TestRenderer.create(<PlanContactCard plannerForm={plannerForm} result={result} deliver={fail}/>);});
 await act(async()=>view.root.findByProps({autoComplete:'name'}).props.onChange({target:{value:'QA Planner'}}));
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(view.root.findByProps({autoComplete:'name'}).props.value,'QA Planner');assert.ok(view.root.findByProps({role:'alert'}));assert.equal(view.root.findByProps({type:'submit'}).props.disabled,false);
 await act(async()=>view.unmount());
 await act(async()=>{view=TestRenderer.create(<Login onSignIn={async()=>{}} onPasswordSignIn={async()=>{}}/>);});
 assert.equal(view.root.findByProps({'aria-label':'Email address'}).type,'input');
 await act(async()=>view.root.findAllByType('button').find(x=>x.children.includes('Password')).props.onClick());
 assert.equal(view.root.findByProps({'aria-label':'Password'}).type,'input');await act(async()=>view.unmount());
 console.log('PASS: no save before successful load; failed-load recovery; trip switching and stale read isolation; storage-disabled inquiry email fallback; both form errors preserve details and re-enable submission.');
}

