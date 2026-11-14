import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import NotificationCenter from '../src/notifications/NotificationCenter.jsx';
export async function run(){
 globalThis.window={addEventListener(){},removeEventListener(){}};
 const item={key:'customer:message:1',title:'New message',at:'2026-11-14T12:00:00Z',target:'messages',read:false};
 let ui,failed=true,opened=[],calls=[];
 const load=async()=>({userId:'user-a',items:[item]});
 const markRead=async(user,keys)=>{calls.push({user,keys});if(failed)throw new Error('Save failed');};
 await act(async()=>{ui=TestRenderer.create(<NotificationCenter scope="customer" load={load} markRead={markRead} onNavigate={target=>opened.push(target)}/>);});
 assert.equal(ui.root.findByProps({className:'tw-alert-toggle'}).props['aria-label'],'Alerts: 1 unread');
 await act(async()=>ui.root.findByProps({className:'tw-alert-toggle'}).props.onClick());
 const activity=()=>ui.root.findByType('article').findByType('button');
 await act(async()=>activity().props.onClick());assert.equal(opened.length,0);assert.equal(ui.root.findByType('article').props['data-unread'],true);assert.equal(ui.root.findByProps({role:'alert'}).children[0],'Save failed');
 failed=false;await act(async()=>activity().props.onClick());assert.deepEqual(opened,['messages']);assert.equal(ui.root.findByProps({className:'tw-alert-toggle'}).props['aria-label'],'Alerts: 0 unread');assert.deepEqual(calls[1],{user:'user-a',keys:[item.key]});await act(async()=>ui.unmount());
 let resolve;const delayed=()=>new Promise(r=>resolve=r);
 await act(async()=>{ui=TestRenderer.create(<NotificationCenter scope="customer" load={delayed} markRead={markRead} onNavigate={()=>{}}/>);});
 await act(async()=>ui.update(<NotificationCenter scope="team" load={async()=>({userId:'user-b',items:[]})} markRead={markRead} onNavigate={()=>{}}/>));
 await act(async()=>resolve({userId:'user-a',items:[item]}));assert.equal(ui.root.findByProps({className:'tw-alert-toggle'}).props['aria-label'],'Alerts: 0 unread');await act(async()=>ui.unmount());
 console.log('PASS: unread badges, failed acknowledgment recovery, server-confirmed marking, target navigation, and stale-account response isolation.');
}
