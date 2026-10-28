export function track(event, properties = {}) {
  if (typeof window === "undefined") return;

  const payload = { event, ...properties };
  window.dispatchEvent(new CustomEvent("ticowild:analytics", { detail: payload }));

  if (Array.isArray(window.dataLayer)) {
    window.dataLayer.push(payload);
  }
}
