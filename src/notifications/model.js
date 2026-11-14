export function notificationItems(scope,{messages=[],operatorMessages=[],bookings=[],trips=[],applications=[],inquiries=[],agreements=[]}={}){
 const items=[];
 const add=(key,title,at,target)=>items.push({key:scope+':'+key,title,at,target});
 for(const m of messages)if(m.from===(scope==='team'?'customer':'team'))add('message:'+m.id,scope==='team'?'New customer message':'New message from TicoWild',m.at,scope==='team'?'portal':'messages');
 for(const m of operatorMessages)if(m.sender_role===(scope==='team'?'operator':'team'))add('operator-message:'+m.id,scope==='team'?'New operator message':'New message from TicoWild',m.created_at,scope==='team'?'operators':'messages');
 for(const b of bookings)add('booking:'+b.id+':'+(b.notification_revision||1),(b.name||'Booking')+' · '+(b.status||'Requested'),b.notification_updated_at||b.created_at,scope==='team'?'portal':scope==='customer'?'trip':'bookings');
 if(scope==='customer')for(const t of trips)add('trip:'+t.id+':'+(t.portal_revision||1),(t.title||'Your trip')+' · '+(t.status||'Updated'),t.notification_updated_at||t.created_at,'trip');
 for(const a of applications)if(scope!=='team'||a.status==='pending')add('application:'+a.id+':'+a.status+':'+a.updated_at,scope==='team'?'Operator application awaiting review':'Application · '+a.status,a.updated_at,scope==='team'?'applications':'application');
 if(scope==='team')for(const q of inquiries)if(q.status==='new')add('inquiry:'+q.id,'New website inquiry',q.created_at,'customers');
 if(scope==='team')for(const r of agreements)if(r.signed_at)add('agreement:'+r.id,'Signed agreement · '+r.company_name,r.signed_at,'operators');
 return items.sort((a,b)=>(Date.parse(b.at)||0)-(Date.parse(a.at)||0)||a.key.localeCompare(b.key)).slice(0,100);
}
