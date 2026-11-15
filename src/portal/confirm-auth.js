import {supabase, withTimeout} from './supabase.js';
import {confirmationInput} from './confirm-model.js';
const {token,next}=confirmationInput(window.location.hash,window.location.origin);
history.replaceState(null,'',window.location.pathname);
const button=document.getElementById('continue');
const status=document.getElementById('status');
const retry=document.getElementById('retry');
retry.href=next;
if(!token||!supabase){button.hidden=true;status.textContent='This sign-in link is incomplete. Request a new link to continue.';retry.hidden=false;}
button.addEventListener('click',async()=>{
  if(button.disabled||!token||!supabase)return;
  button.disabled=true;status.textContent='Verifying your secure sign-in…';
  try{
    const {data,error}=await withTimeout(supabase.auth.verifyOtp({token_hash:token,type:'email'}),15000,'Secure sign-in');
    if(error)throw error;
    if(!data.session)throw new Error('No session');
    window.location.replace(next);
  }catch{
    status.textContent='We could not complete sign-in. The link may have expired or already been used. Request a new link, or try Continue again if your connection was interrupted.';
    retry.hidden=false;button.disabled=false;
  }
});
