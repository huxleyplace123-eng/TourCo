export function validCalendarDate(value){if(!/^\d{4}-\d{2}-\d{2}$/.test(value||''))return false;const d=new Date(value+'T00:00:00Z');return !Number.isNaN(+d)&&d.toISOString().slice(0,10)===value;}
const esc=v=>String(v??'').replace(/\\/g,'\\\\').replace(/\r\n|\r|\n/g,'\\n').replace(/[,;]/g,'\\$&');
const stamp=d=>d.toISOString().replace(/[-:]/g,'').replace(/\.\d{3}Z$/,'Z');
export function calendarStart(date,time){
 if(!validCalendarDate(date))throw new Error('An activity has no valid calendar date.');
 const m=String(time||'').trim().match(/^(\d{1,2}):(\d{2})(?:\s*(AM|PM))?$/i);
 if(!m)return 'DTSTART;VALUE=DATE:'+date.replaceAll('-','');
 let h=Number(m[1]),minutes=Number(m[2]);if(minutes>59||h>(m[3]?12:23)||(m[3]&&h<1))throw new Error('Invalid activity time.');
 if(m[3])h=(h%12)+(m[3].toUpperCase()==='PM'?12:0);
 // Costa Rica uses UTC-06:00 year-round. UTC export preserves the instant in any calendar locale.
 return 'DTSTART:'+stamp(new Date(`${date}T${String(h).padStart(2,'0')}:${m[2]}:00-06:00`));
}
function fold(line){let rows=[],part='',bytes=0;for(const char of line){const size=new TextEncoder().encode(char).length;if(bytes+size>75){rows.push(part);part=' ';bytes=1;}part+=char;bytes+=size;}rows.push(part);return rows.join('\r\n');}
export function tripCalendar(trip,bookings,now=new Date()){
 const events=bookings.filter(b=>!['Cancelled','Declined'].includes(b.status)).flatMap(b=>['BEGIN:VEVENT',`UID:${esc(b.id)}@ticowild.com`,`DTSTAMP:${stamp(now)}`,calendarStart(b.date,b.time),`SUMMARY:${esc(b.name)} · TicoWild`,`LOCATION:${esc(b.meetingPoint?.name||b.meet)}`,`DESCRIPTION:${esc(`${b.operator||''} | ${b.meet||''} | Bring: ${b.bring||''}`)}`,'END:VEVENT']);
 return ['BEGIN:VCALENDAR','VERSION:2.0','PRODID:-//TicoWild//Traveler Portal//EN','CALSCALE:GREGORIAN',`X-WR-CALNAME:${esc(trip.title)}`,...events,'END:VCALENDAR'].map(fold).join('\r\n')+'\r\n';
}
