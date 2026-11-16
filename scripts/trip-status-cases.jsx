import React from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import assert from 'node:assert/strict';
import {TripTab} from '../src/portal/Portal.jsx';
import {tripPresentation} from '../src/portal/trip-status.js';

export function run() {
  const trip={title:'Test trip',region:'Costa Rica',start:'2099-12-15',end:'2099-12-19',travelers:2,status:'Cancelled',days:[{date:'2099-12-15',items:[{id:'b1',name:'Test hike',status:'Confirmed'}]}]};
  const html=renderToStaticMarkup(<TripTab trip={trip}/>);
  assert.match(html,/Trip cancelled/);
  for(const misleading of ['Your upcoming trip','days to go','You are ready to go','Trip passes','Meeting details']) assert.ok(!html.includes(misleading),misleading);
  const empty=renderToStaticMarkup(<TripTab trip={{...trip,status:'Planning',days:[]}}/>);
  assert.match(empty,/No activities scheduled/);
  assert.match(empty,/Upcoming itinerary/);
  assert.match(empty,/Your upcoming trip/);
  assert.ok(!empty.includes('images.unsplash.com/undefined'));
  assert.ok(!empty.includes('confirming the remaining'));
  const mixed=tripPresentation({...trip,status:'Planning'},[{status:'Confirmed'},{status:'Cancelled'},{status:'Declined'},{status:'Requested'}],3);
  assert.equal(mixed.status,'1 of 2 experiences confirmed');assert.equal(mixed.progress,50);
  assert.equal(tripPresentation({...trip,status:'Completed'},[], -5).countdown,'Completed');
  assert.equal(tripPresentation({...trip,status:'Planning'},[], -5).countdown,'Planning');
  console.log('PASS: cancelled trips do not advertise upcoming travel or passes; empty, mixed and completed trip states are accurate.');
}
