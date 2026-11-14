import {supabase,hasSupabase,withTimeout} from './supabase.js';
export async function getPreference(key,fallback) {
 if(!hasSupabase)return fallback;
 const {data:{user},error:authError}=await withTimeout(supabase.auth.getUser(),8000,'Customer account');if(authError)throw authError;if(!user)throw new Error('Please sign in to save to your account.');
 const {data,error}=await withTimeout(supabase.from('customer_preferences').select('value').eq('user_id',user.id).eq('key',key).maybeSingle(),10000,'Account preferences');if(error)throw new Error(error.message);return data?.value??fallback;
}
export async function savePreference(key,value) {
 if(!hasSupabase)return;
 const {data:{user},error:authError}=await withTimeout(supabase.auth.getUser(),8000,'Customer account');if(authError)throw authError;if(!user)throw new Error('Please sign in to save to your account.');
 const {error}=await withTimeout(supabase.from('customer_preferences').upsert({user_id:user.id,key,value}),10000,'Account save');if(error)throw new Error(error.message);
}
