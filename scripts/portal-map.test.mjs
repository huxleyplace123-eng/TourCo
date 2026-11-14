import assert from 'node:assert/strict';
import {validPoint} from '../src/portal/meeting-point.js';
for(const p of [null,{}, {lat:'',lng:''},{lat:null,lng:null},{lat:' ',lng:20},{lat:91,lng:10},{lat:10,lng:181},{lat:'no',lng:1}]) assert.equal(validPoint(p),false);
assert.equal(validPoint({lat:0,lng:0}),true);
assert.equal(validPoint({lat:'9.4',lng:'-84.1'}),true);
console.log('Portal maps: missing and invalid coordinates rejected; valid coordinates retained.');
