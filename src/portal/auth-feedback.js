export function callbackErrorMessage(hash = "") {
  const params = new URLSearchParams(hash.replace(/^#/, ""));
  if (params.get("error_code") === "otp_expired") return "This sign-in link has expired or has already been used. Enter the invitation email below and request a new secure link. Open the newest email link in this same browser.";
  if (params.has("error")) return "That sign-in link could not be verified. Request a new secure link below and open the newest email.";
  return "";
}

// Capture before the auth client processes and removes the callback fragment.
export const initialAuthError = callbackErrorMessage(typeof window === "undefined" ? "" : window.location.hash);

export function authErrorMessage(error, fallback = "We couldn't sign you in. Please try again.") {
  if (error?.code === "over_email_send_rate_limit" || /email rate limit/i.test(error?.message || "")) return "Sign-in emails are temporarily unavailable because the service has reached its sending limit. Please try again later or contact info@ticowild.com. Requesting more links now will not help.";
  return error?.message || fallback;
}
