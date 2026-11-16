import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import GuestCareSchedule from '../src/experience/GuestCareSchedule.jsx';
import OperationsQueue from '../src/experience/OperationsQueue.jsx';
import ExperienceEssentials from '../src/experience/ExperienceEssentials.jsx';
export async function run(){
 const b={id:'b',name:'Sample walk',date:'2099-12-20',time:'09:00',status:'Confirmed',operator_id:'op',bring:'Water',meeting_point_lat:10,meeting_point_lng:-84,meeting_instructions:'Reception'};
 let sent=[],rows=[],fail=true,view;const service={list:async()=>rows,save:async args=>{sent.push(args);if(fail)throw Error('Connection lost');rows=[{id:'s',booking_id:'b',kind:'preparation',body:args.message_body,booking_revision:args.expected_booking_revision,send_at:args.send_time,updated_at:'2099-01-01',state:'scheduled'}];return rows[0];},cancel:async()=>{rows=[];}};
 await act(async()=>{view=TestRenderer.create(<GuestCareSchedule trips={[{id:'t',title:'QA',bookings:[b]}]} service={service}/>);});
 await act(async()=>view.root.findAllByType('select')[0].props.onChange({target:{value:'b'}}));
 assert.match(view.root.findByType('textarea').props.value,/Reception/);
 await act(async()=>view.root.findByType('input').props.onInput({target:{value:'2099-12-19T09:00'}}));
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.match(JSON.stringify(view.toJSON()),/Connection lost/);assert.match(view.root.findByType('textarea').props.value,/Reception/);
 assert.equal(sent[0].send_time,'2099-12-19T15:00:00.000Z');
 fail=false;await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.match(JSON.stringify(view.toJSON()),/Message scheduled/);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Cancel scheduled message')).props.onClick());
 assert.equal(rows.length,0);await act(async()=>view.root.findAllByType('select')[0].props.onChange({target:{value:'b'}}));await act(async()=>view.root.findByType('input').props.onInput({target:{value:'2099-12-19T09:00'}}));await act(async()=>view.update(<GuestCareSchedule trips={[{id:'t',title:'QA',bookings:[{...b,notification_revision:2}]}]} service={service}/>));
 const before=sent.length;await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(sent.length,before);assert.match(JSON.stringify(view.toJSON()),/Booking details changed/);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Rebuild from latest booking details')).props.onClick());await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(sent.at(-1).expected_booking_revision,2);

 // Refreshing the list must not silently replace the version the editor reviewed.
 const originalBody=view.root.findByType('textarea').props.value;
 rows=[{...rows[0],updated_at:'2099-01-02',body:'Another coordinator saved these instructions.'}];
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Refresh schedule')).props.onClick());
 const beforeConflict=sent.length;
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(sent.length,beforeConflict);assert.match(JSON.stringify(view.toJSON()),/Another team member changed/);
 assert.equal(view.root.findByType('textarea').props.value,originalBody);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Load saved schedule for review')).props.onClick());
 assert.equal(view.root.findByType('textarea').props.value,rows[0].body);
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.equal(sent.at(-1).expected_updated_at,'2099-01-02');
 await act(async()=>view.unmount());
 let opened=[];
 await act(async()=>{view=TestRenderer.create(<OperationsQueue trips={[]} profiles={[{id:'c',name:'Sample customer'}]} messages={[{id:'request',user_id:'c',from:'customer',at:'2026-11-15',text:'[Trip request: General question]\nPlease help with our plans.'}]} onCustomer={id=>opened.push(id)}/>);});
 assert.match(JSON.stringify(view.toJSON()),/General question/);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Open customer conversation')).props.onClick());assert.deepEqual(opened,['c']);
 await act(async()=>view.unmount());
 await act(async()=>{view=TestRenderer.create(<ExperienceEssentials activity={{title:'Example',catalogStatus:'planning-example',duration:'2 hours'}}/>);});
 assert.match(JSON.stringify(view.toJSON()),/Planning example/);assert.match(JSON.stringify(view.toJSON()),/guide details will be shared/);await act(async()=>view.unmount());
 console.log('PASS: schedule preview, Costa Rica time conversion, retained errors, save/cancel and honest sample essentials.');
}
