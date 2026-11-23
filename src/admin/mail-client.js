import { PublicClientApplication, InteractionRequiredAuthError } from "@azure/msal-browser";
import { mailConfig } from "./mail-config.js";
import { outgoingMessage } from "./mail-model.js";

const scopes = ["User.Read", "Mail.Read.Shared", "Mail.Send.Shared"];
export function needsMailReconnect(error) {
  return error instanceof InteractionRequiredAuthError ||
    ["invalid_grant", "interaction_required", "login_required", "consent_required", "refresh_token_expired", "mail_reconnect_required"].includes(error?.errorCode || error?.code);
}
function reconnectError() {
  return Object.assign(new Error("Your Microsoft email session needs to be renewed. Choose Reconnect email and sign in with your approved TicoWild account. Your CRM login and unsent draft are unchanged."), { code: "mail_reconnect_required" });
}
const mailboxPath = `users/${encodeURIComponent(mailConfig.mailbox)}/`;
function allowedAccount(account) {
  return account?.tenantId === mailConfig.tenantId &&
    mailConfig.signInAccounts.includes(account.username?.toLowerCase());
}
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
  const active = app.getActiveAccount();
  return allowedAccount(active) ? active : app.getAllAccounts().find(allowedAccount);
}
export async function mailAccount() {
  if (!mailConfigured) return null;
  return accountFor(await client()) || null;
}
export async function connectMail() {
  const app = await client();
  let result;
  try { result = await app.loginPopup({ scopes, prompt: "select_account" }); }
  catch (error) { if (needsMailReconnect(error)) throw reconnectError(); throw error; }
  if (!allowedAccount(result.account)) {
    await app.clearCache({ account: result.account });
    throw new Error("Use your approved TicoWild Microsoft account (info@ticowild.com or john@ticowild.com). No email was sent.");
  }
  app.setActiveAccount(result.account);
  return result.account;
}
export async function disconnectMail() {
  if (mailConfigured) await (await client()).clearCache();
}
async function token() {
  const app = await client(), account = accountFor(app);
  if (!account) throw reconnectError();
  try { return (await app.acquireTokenSilent({ scopes, account })).accessToken; }
  catch (error) {
    if (needsMailReconnect(error)) throw reconnectError();
    throw error;
  }
}
async function graph(path, options = {}) {
  const url = new URL(path, "https://graph.microsoft.com/v1.0/");
  const parts = url.pathname.split("/");
  if (url.origin !== "https://graph.microsoft.com" || url.username || url.password ||
      parts[1] !== "v1.0" || parts[2] !== "users" ||
      decodeURIComponent(parts[3] || "").toLowerCase() !== mailConfig.mailbox || !parts[4]) throw new Error("Invalid mailbox request.");
  const accessToken = await token();
  let response;
  try {
    response = await fetch(url, { ...options, headers: { Authorization: `Bearer ${accessToken}`,
      "Content-Type": "application/json", Prefer: 'outlook.body-content-type="text"', ...options.headers }, signal: AbortSignal.timeout(30000) });
  } catch (error) {
    throw new Error(options.method === "POST" ? "Send status is unknown. Check Sent mail before trying again to avoid a duplicate." : "Microsoft did not respond. Please refresh.");
  }
  if (!response.ok) {
    if (response.status === 401) throw reconnectError();
    if (response.status === 403) throw new Error("Microsoft signed you in, but denied access to info@ticowild.com. A Microsoft 365 administrator must check shared-mailbox access and app permissions for your account.");
    const detail = await response.json().catch(() => ({}));
    throw new Error(detail.error?.message || `Microsoft mailbox request failed (${response.status}).`);
  }
  return response.status === 202 || response.status === 204 ? null : response.json();
}
export function listMail(folder = "inbox", next) {
  if (!["inbox", "sentitems"].includes(folder)) throw new Error("Invalid folder.");
  return graph(next || `${mailboxPath}mailFolders/${folder}/messages?$top=50&$orderby=receivedDateTime%20desc&$select=id,subject,from,toRecipients,receivedDateTime,sentDateTime,bodyPreview,isRead,webLink,conversationId`);
}
export function readMail(id) {
  return graph(`${mailboxPath}messages/${encodeURIComponent(id)}?$select=id,subject,from,toRecipients,body,receivedDateTime,sentDateTime,webLink,conversationId`);
}
export function sendMail(draft) {
  return graph(`${mailboxPath}sendMail`, { method: "POST", body: JSON.stringify({ message: outgoingMessage(draft), saveToSentItems: true }) });
}
export function replyMail(id, body) {
  if (!body.trim() || /{{[^}]+}}/.test(body)) throw new Error("Write a reply and replace any template placeholders.");
  return graph(`${mailboxPath}messages/${encodeURIComponent(id)}/reply`, { method: "POST", body: JSON.stringify({ message: { body: { contentType: "Text", content: body } } }) });
}
