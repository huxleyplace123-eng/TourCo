// Stable per-account request IDs make a retry safe after an ambiguous timeout.
const pending = new Map();
export async function deliverCustomerMessage({userId,text,insert,find,list,storage}) {
  const key=`ticowild_pending_message:${userId}`;
  let attempt=pending.get(key);
  try { attempt=JSON.parse(storage?.getItem(key)||'null')||attempt; } catch {}
  if(!attempt||attempt.text!==text)attempt={id:crypto.randomUUID(),text};
  pending.set(key,attempt);
  try {storage?.setItem(key,JSON.stringify(attempt));}catch{}
  try {await insert({id:attempt.id,user_id:userId,from:'customer',text});}
  catch(error) {
    // Read only this account's row. A conflicting ID alone is not success.
    let existing;try{existing=await find(attempt.id);}catch{}
    if(!existing||existing.user_id!==userId||existing.from!=='customer'||existing.text!==text)throw error;
  }
  const messages=await list();
  pending.delete(key);try{storage?.removeItem(key);}catch{}
  return messages;
}
