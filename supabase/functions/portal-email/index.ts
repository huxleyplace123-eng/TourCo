import { Webhook } from 'npm:svix@1.85.0';
import { createEmailHandler } from './handler.js';
Deno.serve(createEmailHandler({
  env:name=>Deno.env.get(name),
  verifyWebhook:(body,headers,secret)=>new Webhook(secret).verify(body,{
    'svix-id':headers.get('svix-id')||'',
    'svix-timestamp':headers.get('svix-timestamp')||'',
    'svix-signature':headers.get('svix-signature')||'',
  }),
}));
