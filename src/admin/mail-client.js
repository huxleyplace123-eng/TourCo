import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { mailConfig } from "./mail-config.js";
import { outgoingMessage } from "./mail-model.js";

const scopes = ["User.Read", "Mail.Read", "Mail.Send"];
let clientPromise;
export const mailConfigured = Boolean(mailConfig.clientId);
async function client() {
  if (!mailConfigured) throw new Error("Microsoft mailbox connection is awaiting administrator setup.");
  if (!clientPromise) clientPromise = (async () => {
    const app = new PublicClientApplication({
    auth: { clientId: mailConfig.clientId, authority: `https://login.microsoftonline.com/${mailConfig.tenantId}`,
      redirectUri: `${window.location.origin}/admin/mail-auth.html` },
    cache: { cacheLocation: "sessionStorage" },
    system: { popupBridgeTimeout: 600000 },
    });
    await app.initialize();
    return app;
  })().catch(error => { clientPromise = null; throw error; });
  return clientPromise;
}
function accountFor(app) {
  return app.getAllAccounts().find(a => a.username.toLowerCase() === mailConfig.mailbox);
}
export async function mailAccount() {
  if (!mailConfigured) return null;
  return accountFor(await client()) || null;
}
export async function connectMail() {
  const app = await client();
  const result = await app.loginPopup({ scopes, loginHint: mailConfig.mailbox, prompt: "select_account" });
  if (result.account?.username.toLowerCase() !== mailConfig.mailbox) {
    await app.clearCache({ account: result.account });
    throw new Error(`Please connect ${mailConfig.mailbox}. No email was sent.`);
  }
  return result.account;
}
export async function disconnectMail() {
  if (mailConfigured) await (await client()).clearCache();
}
async function token() {
  const app = await client(), account = accountFor(app);
  if (!account) throw new Error(`Connect ${mailConfig.mailbox} first.`);
  try { return (await app.acquireTokenSilent({ scopes, account })).accessToken; }
  catch (error) {
    if (error instanceof InteractionRequiredAuthError) throw new Error("Microsoft needs you to reconnect your mailbox. Your message has not been sent.");
    throw error;
  }
}
async function graph(path, options = {}) {
  const url = new URL(path, "https://graph.microsoft.com/v1.0/");
  if (url.origin !== "https://graph.microsoft.com" || !url.pathname.startsWith("/v1.0/me/")) throw new Error("Invalid mailbox request.");
  const accessToken = await token();
  let response;
  try {
    response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", Prefer: 'outlook.body-content-type="text"', ...options.headers }, signal: AbortSignal.timeout(30000) });
  } catch (error) {
    throw new Error(options.method === "POST" ? "Send status is unknown. Check Sent mail before trying again to avoid a duplicate." : "Microsoft did not respond. Please refresh.");
  }
  if (!response.ok) {
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error?.message || `Microsoft mailbox request failed (${response.status}).`);
  }
  return response.status === 202 || response.status === 204 ? null : response.json();
}
export function listMail(folder = "inbox", next) {
  if (!["inbox", "sentitems"].includes(folder)) throw new Error("Invalid folder.");
  return graph(next || `me/mailFolders/${folder}/messages?$top=50&$orderby=receivedDateTime%20desc&$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,bodyPreview,isRead,webLink,conversationId`);
}
export function readMail(id) {
  return graph(`me/messages/${encodeURIComponent(id)}?$select=id,subject,from,toRecipients,body,receivedDateTime,sentDateTime,webLink,conversationId`);
}
export function sendMail(draft) {
  return graph("me/sendMail", { method: "POST", body: JSON.stringify({ message: outgoingMessage(draft), saveToSentItems: true }) });
}
export function replyMail(id, body) {
  if (!body.trim() || /{{[^}]+}}/.test(body)) throw new Error("Write a reply and replace any template placeholders.");
  return graph(`me/messages/${encodeURIComponent(id)}/reply`, { method: "POST", body: JSON.stringify({ message: { body: { contentType: "Text", content: body } } }) });
}
