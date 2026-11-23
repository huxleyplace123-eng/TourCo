import React from 'react';
import TestRenderer,{act} from 'react-test-renderer';
import assert from 'node:assert/strict';
import Preview from '../src/admin/CustomerPortalPreview.jsx';
export async function run(){
  let network=0,storage=0,closed=0,view;
  globalThis.fetch=async()=>{network++;throw Error('Preview must not access backend');};
  globalThis.localStorage={getItem(){storage++;return null;},setItem(){storage++;}};
  const trip={id:'trip-a',user_id:'a',title:'Published Arenal trip',start_date:'2026-12-12',end_date:'2026-12-16',travelers:2,status:'Planning',bookings:[]};
  const props={profile:{id:'a',name:'Traveler A',email:'a@example.com'},trips:[trip,{...trip,id:'private-trip',user_id:'b',title:'OTHER CUSTOMER SECRET'}],messages:[{id:'a-msg',user_id:'a',from:'team',text:'Your published message'},{id:'b-msg',user_id:'b',text:'OTHER CUSTOMER SECRET'}],onClose:()=>closed++};
  const click=async label=>{const button=view.root.findAllByType('button').find(b=>b.children.join('')===label);assert(button,'Missing '+label);await act(async()=>button.props.onClick());};
  await act(async()=>{view=TestRenderer.create(<Preview {...props}/>);});
  assert.match(JSON.stringify(view.toJSON()),/Published Arenal trip/);
  assert(!JSON.stringify(view.toJSON()).includes('OTHER CUSTOMER SECRET'));
  for(const label of ['Itinerary','Documents','Travelers','Payments','Support'])await click(label);
  await click('Messages');assert.match(JSON.stringify(view.toJSON()),/Your published message/);assert(!JSON.stringify(view.toJSON()).includes('OTHER CUSTOMER SECRET'));assert.equal(view.root.findAllByType('textarea').length,0);
  await click('Account');assert.match(JSON.stringify(view.toJSON()),/a@example.com/);assert.equal(view.root.findAllByType('input').length,0);
  await click('← Back to CRM');assert.equal(closed,1);
  await act(async()=>view.unmount());
  await act(async()=>{view=TestRenderer.create(<Preview sample onClose={()=>{}}/>);});assert.match(JSON.stringify(view.toJSON()),/Sample customer portal/);
  await click('Messages');assert.match(JSON.stringify(view.toJSON()),/Welcome to your Costa Rica adventure/);
  await act(async()=>view.unmount());
  assert.equal(network,0);assert.equal(storage,0);
  console.log('PASS portal preview: real trip layout, customer isolation, sample messages, account view, exit, no network or account storage access.');
}
