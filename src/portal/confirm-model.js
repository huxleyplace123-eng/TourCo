export function confirmationInput(hash, origin) {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  const token = params.get("token_hash") || "";
  let next = "/my/";
  try {
    const target = new URL(params.get("next") || next, origin);
    if (target.origin === origin && ["/my/", "/my", "/partners/", "/partners", "/admin/", "/admin"].includes(target.pathname)) next = target.pathname + target.search;
  } catch { /* Never redirect to an untrusted destination. */ }
  return { token: /^[a-f0-9]{40,128}$/i.test(token) ? token : "", next };
}
