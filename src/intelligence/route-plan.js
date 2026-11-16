import {planTrip} from './planner.js';

// Reserve arrival/transfer days. A stop's nights are a limit, never a reason
// to invent more catalog activities. Departure is outside the activity window.
export function planRoute(items, stops, opts) {
  const used = new Set();
  const days = [], reasoning = [], warnings = [];
  let offset = 0;
  for (const stop of stops) {
    const nights = Math.max(1, Math.floor(Number(stop.nights) || 1));
    const available = Math.max(0, Math.min(nights, opts.maxDays - offset) - 1);
    const selected = stop.region && stop.region !== 'Not sure yet';
    let candidates = items.filter(a => !used.has(a.id) && (!selected || a.region === stop.region));
    if(!selected && opts.avoidLongDrives && candidates.length){
      const base=candidates[0].region;
      candidates=candidates.filter(a=>a.region===base);
      warnings.push(`To reduce travel, these suggestions stay in ${base}. Confirm your accommodation and pickup distances with the team.`);
    }
    warnings.push(`Day ${offset + 1}: keep time open for ${offset ? 'travel to' : 'arrival in'} ${selected ? stop.region : 'your destination'}. Confirm transport and check-in before adding an excursion.`);
    if (available) {
      const part = planTrip(candidates, {...opts, maxDays:available});
      part.days.forEach((day,i) => {
        day.activities.forEach(a => used.add(a.id));
        const n = offset + i + 2;
        days.push({...day,n});
        reasoning.push({...part.reasoning[i],day:n});
      });
    }
    offset += nights;
    if (offset >= opts.maxDays) break;
  }
  warnings.push('Departure day is left open. Suggestions are not a confirmed transport schedule; the team must check travel between regions.');
  return {days,reasoning,warnings,totals:{days:days.length,activities:used.size,cost:days.reduce((s,d)=>s+d.cost,0),drive:0}};
}
