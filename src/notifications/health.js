// Operational alerts stay visible until their underlying condition clears.
export function emailHealthAlerts(health, now = Date.now()) {
  const alerts = [];
  const add = (key, title, detail) => alerts.push({key:'team:email-health:'+key,title,detail,target:'email',at:health?.checked_at || null,actionOnly:true,read:false});
  if (!health || !['live','test','off'].includes(health.mode)) {
    add('unavailable','Email health could not be checked','Open Email and refresh delivery status.');
    return alerts;
  }
  if (health.mode !== 'live') add('mode','Automatic email is '+health.mode,'Portal notifications are not sending normally.');
  const checked = Date.parse(health.checked_at);
  const clock = Number.isFinite(checked) ? checked : now;
  const heartbeat = Date.parse(health.last_worker_check_at);
  if (health.mode === 'live' && (!Number.isFinite(heartbeat) || clock-heartbeat > 5*60000)) {
    add('worker','Email worker needs attention','No successful worker check in the last five minutes.');
  }
  if (health.failed > 0) add('failures',`${health.failed} email deliveries need review`,'Failed or bounced in the last seven days. Check the delivery history before resending.');
  if (health.stalled > 0) add('stalled',`${health.stalled} emails have stalled`,'The delivery lease expired. Check the worker and delivery history.');
  if (health.daily_budget > 0 && health.attempted_today >= health.daily_budget) {
    add('capacity','Daily email queue allowance reached','Waiting messages resume after the UTC daily reset. Login emails share a separate provider allowance.');
  } else if (health.daily_budget > 0 && health.attempted_today >= health.daily_budget*.9) {
    add('capacity','Daily email queue allowance is nearly used',`${health.attempted_today} of ${health.daily_budget} used. Review capacity before more outreach.`);
  }
  const oldest = Date.parse(health.oldest_pending);
  if (health.pending > 0 && Number.isFinite(oldest) && clock-oldest > 10*60000) add('waiting','Email is waiting longer than expected',`${health.pending} messages waiting; the oldest has waited more than ten minutes.`);
  return alerts;
}
