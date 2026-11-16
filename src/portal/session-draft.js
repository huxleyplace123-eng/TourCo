export const draftKey = id => `ticowild_message_draft:${id}`;
export function readDraft(storage,id){try{return (storage.getItem(draftKey(id))||'').slice(0,5000);}catch{return '';}}
export function saveDraft(storage,id,text){try{if(text)storage.setItem(draftKey(id),text.slice(0,5000));else storage.removeItem(draftKey(id));}catch{}}
