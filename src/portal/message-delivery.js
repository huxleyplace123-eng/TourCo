// Stable per-account request IDs make a retry safe after an ambiguous timeout.
const pending = new Map();
export async function deliverCustomerMessage({userId,text,insert,find,list,storage,sender='customer',actorId=userId}) {
  if(!['customer','team'].includes(sender))throw Error('Invalid message sender.');
  const key=sender==='customer'?`ticowild_pending_message:${userId}`:`ticowild_pending_team_message:${actorId}:${userId}`;
  let attempt=pending.get(key);
  try { attempt=JSON.parse(storage?.getItem(key)||'null')||attempt; } catch {}
  if(!attempt||attempt.text!==text||!/^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i.test(attempt.id||''))attempt={id:crypto.randomUUID(),text};
  pending.set(key,attempt);
  try {storage?.setItem(key,JSON.stringify(attempt));}catch{}
  try {await insert({id:attempt.id,user_id:userId,from:sender,text});}
  catch(error) {
    // Read only this account's row. A conflicting ID alone is not success.
    let existing;try{existing=await find(attempt.id);}catch{}
    if(!existing||existing.user_id!==userId||existing.from!==sender||existing.text!==text)throw error;
  }
  const messages=await list();
  pending.delete(key);try{storage?.removeItem(key);}catch{}
  return messages;
}
