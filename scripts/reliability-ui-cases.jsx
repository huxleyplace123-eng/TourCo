import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import RequestTracker from '../src/portal/RequestTracker.jsx';
import {Field,Select} from '../src/components/ui.jsx';
import {readDraft,saveDraft} from '../src/portal/session-draft.js';
export async function run(){
  let view;const sent=[];const messages=[{id:'r1',user_id:'a',from:'customer',at:'2026-11-15T12:00:00Z',text:'[Trip request: Pickup help]\nPlease confirm the pickup.'}];
  await act(async()=>{view=TestRenderer.create(<RequestTracker messages={messages} onUpdate={async text=>{sent.push(text);return false;}}/>);});
  await act(async()=>{view.root.findByType('input').props.onChange({target:{value:'John'}});view.root.findByType('textarea').props.onChange({target:{value:'Checking the pickup with the operator.'}});view.root.findByType('select').props.onChange({target:{value:'Being reviewed'}});});
  await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
  assert.equal(sent.length,1);assert.match(sent[0],/Status: Being reviewed/);assert.equal(view.root.findByType('textarea').props.value,'Checking the pickup with the operator.');
  await act(async()=>view.update(<RequestTracker messages={messages} busy={true} onUpdate={async()=>true}/>));assert.equal(view.root.findByType('fieldset').props.disabled,true);
  await act(async()=>view.update(<RequestTracker messages={[...messages,{id:'u',user_id:'a',from:'team',at:'2026-11-15T13:00:00Z',text:sent[0]}]}/>));
  assert.match(JSON.stringify(view.toJSON()),/Being reviewed/);assert.match(JSON.stringify(view.toJSON()),/John/);assert.equal(view.root.findAllByType('form').length,0);await act(async()=>view.unmount());
  await act(async()=>{view=TestRenderer.create(<Field label="Email"><input type="email"/></Field>);});assert.equal(view.root.findByType('label').props.htmlFor,view.root.findByType('input').props.id);await act(async()=>view.unmount());
  await act(async()=>{view=TestRenderer.create(<Field label="Travelers"><Select value="2" options={['1','2']} onChange={()=>{}}/></Field>);});assert.equal(view.root.findByType('label').props.htmlFor,view.root.findByType('select').props.id);await act(async()=>view.unmount());
  const values=new Map(),storage={getItem:k=>values.get(k),setItem:(k,v)=>values.set(k,v),removeItem:k=>values.delete(k)};
  saveDraft(storage,'a','Private draft');assert.equal(readDraft(storage,'a'),'Private draft');assert.equal(readDraft(storage,'b'),'');saveDraft(storage,'a','');assert.equal(readDraft(storage,'a'),'');
  assert.equal(readDraft({getItem(){throw Error('blocked')}},'a'),'');
  console.log('PASS: customer request progress, CRM update validation and failure retention, disabled submission, accessible labels, draft refresh and account isolation.');
}
