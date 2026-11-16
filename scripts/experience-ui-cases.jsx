import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import GuestCareSchedule from '../src/experience/GuestCareSchedule.jsx';
import ExperienceEssentials from '../src/experience/ExperienceEssentials.jsx';
export async function run(){
 const b={id:'b',name:'Sample walk',date:'2099-12-20',time:'09:00',status:'Confirmed',operator_id:'op',bring:'Water',meeting_point_lat:10,meeting_point_lng:-84,meeting_instructions:'Reception'};
 let sent=[],rows=[],fail=true,view;const service={list:async()=>rows,save:async args=>{sent.push(args);if(fail)throw Error('Connection lost');rows=[{id:'s',booking_id:'b',kind:'preparation',body:args.message_body,send_at:args.send_time,updated_at:'2099-01-01',state:'scheduled'}];},cancel:async()=>{rows=[];}};
 await act(async()=>{view=TestRenderer.create(<GuestCareSchedule trips={[{id:'t',title:'QA',bookings:[b]}]} service={service}/>);});
 await act(async()=>view.root.findAllByType('select')[0].props.onChange({target:{value:'b'}}));
 assert.match(view.root.findByType('textarea').props.value,/Reception/);
 await act(async()=>view.root.findByType('input').props.onChange({target:{value:'2099-12-19T09:00'}}));
 await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.match(JSON.stringify(view.toJSON()),/Connection lost/);assert.match(view.root.findByType('textarea').props.value,/Reception/);
 assert.equal(sent[0].send_time,'2099-12-19T15:00:00.000Z');
 fail=false;await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));
 assert.match(JSON.stringify(view.toJSON()),/Message scheduled/);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Cancel scheduled message')).props.onClick());
 assert.equal(rows.length,0);await act(async()=>view.update(<GuestCareSchedule trips={[{id:'t',title:'QA',bookings:[{...b,notification_revision:2}]}]} service={service}/>));
 const before=sent.length;await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(sent.length,before);assert.match(JSON.stringify(view.toJSON()),/Booking details changed/);
 await act(async()=>view.root.findAllByType('button').find(b=>b.children.includes('Rebuild from latest booking details')).props.onClick());await act(async()=>view.root.findByType('form').props.onSubmit({preventDefault(){}}));assert.equal(sent.at(-1).expected_booking_revision,2);
 await act(async()=>view.unmount());
 await act(async()=>{view=TestRenderer.create(<ExperienceEssentials activity={{title:'Example',catalogStatus:'planning-example',duration:'2 hours'}}/>);});
 assert.match(JSON.stringify(view.toJSON()),/Planning example/);assert.match(JSON.stringify(view.toJSON()),/guide details will be shared/);await act(async()=>view.unmount());
 console.log('PASS: schedule preview, Costa Rica time conversion, retained errors, save/cancel and honest sample essentials.');
}
