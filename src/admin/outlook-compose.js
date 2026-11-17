import { outgoingMessage } from './mail-model.js';
export function outlookComposeHref(draft) {
  const message = outgoingMessage(draft);
  const params = new URLSearchParams({
    to: message.toRecipients.map(x => x.emailAddress.address).join(';'),
    bcc: message.bccRecipients.map(x => x.emailAddress.address).join(';'),
    subject: message.subject, body: message.body.content,
    realm: 'ticowild.com'
  });
  const href = 'https://outlook.office.com/mail/deeplink/compose?' + params.toString().replace(/\+/g, '%20');
  if (href.length > 7500) throw new Error('This draft is too long to transfer reliably. Copy the message and paste it into Outlook.');
  return href;
}
