export const requestStatuses = ['Received','Being reviewed','Waiting for customer','Waiting for operator','Resolved'];
export function trackedRequests(messages) {
  const ordered=[...messages].sort((a,b)=>String(a.at).localeCompare(String(b.at)));
  const requests=ordered.filter(m=>m.from==='customer' && /^\[Trip request: [^\]\n]+\]/.test(m.text)).map(m=>({...m,title:m.text.match(/^\[Trip request: ([^\]\n]+)\]/)[1],status:'Received',owner:'Not assigned',update:'',updatedAt:m.at}));
  for(const message of ordered) {
    if(message.from!=='team')continue;
    const match=message.text.match(/^\[Request update: ([a-zA-Z0-9_-]+)\]\nStatus: ([^\n]+)\nOwner: ([^\n]+)\n\n([\s\S]+)/);
    if(!match||!requestStatuses.includes(match[2]))continue;
    const request=requests.find(r=>r.id===match[1] && r.user_id===message.user_id && String(message.at)>=String(r.at));
    if(request)Object.assign(request,{status:match[2],owner:match[3],update:match[4],updatedAt:message.at});
  }
  return requests;
}
export function requestUpdate(id,status,owner,note) {
  if(!/^[a-zA-Z0-9_-]+$/.test(id)||!requestStatuses.includes(status))throw new Error('Choose a valid request and status.');
  owner=String(owner||'').trim();note=String(note||'').trim();
  if(!owner||owner.length>80||/[\r\n]/.test(owner))throw new Error('Enter the responsible team member’s name (up to 80 characters).');
  if(note.length<8||note.length>1800)throw new Error('Add an update of 8–1,800 characters.');
  return `[Request update: ${id}]\nStatus: ${status}\nOwner: ${owner}\n\n${note}`;
}
