import assert from 'node:assert/strict';
import {emailHealthAlerts} from '../src/notifications/health.js';
const now=Date.parse('2026-11-15T06:00:00Z');
const healthy={mode:'live',checked_at:new Date(now).toISOString(),last_worker_check_at:new Date(now-60000).toISOString(),failed:0,stalled:0,daily_budget:40,attempted_today:20,pending:0,oldest_pending:null};
assert.deepEqual(emailHealthAlerts(healthy),[]);
assert.equal(emailHealthAlerts(null)[0].key,'team:email-health:unavailable');
assert.equal(emailHealthAlerts({...healthy,last_worker_check_at:null})[0].key,'team:email-health:worker');
assert.equal(emailHealthAlerts({...healthy,last_worker_check_at:new Date(now-300001).toISOString()})[0].key,'team:email-health:worker');
assert.deepEqual(emailHealthAlerts({...healthy,last_worker_check_at:new Date(now-300000).toISOString()}),[]);
assert.equal(emailHealthAlerts({...healthy,mode:'off',last_worker_check_at:null}).length,1);
assert.equal(emailHealthAlerts({...healthy,attempted_today:36})[0].key,'team:email-health:capacity');
assert.match(emailHealthAlerts({...healthy,attempted_today:40})[0].title,/reached/);
assert.equal(emailHealthAlerts({...healthy,pending:3,oldest_pending:new Date(now-600001).toISOString()})[0].key,'team:email-health:waiting');
assert.equal(emailHealthAlerts({...healthy,failed:2,stalled:1}).length,2);
for(const a of emailHealthAlerts({...healthy,failed:1})) {assert.equal(a.actionOnly,true);assert.equal(a.read,false);assert.equal(a.target,'email');}
// Server checked_at controls age so a wrong device clock does not invent an outage.
assert.deepEqual(emailHealthAlerts(healthy,now+86400000),[]);
console.log('PASS: worker outage, queue age, capacity, failure and stale-message alerts; healthy/off modes and clock skew.');
