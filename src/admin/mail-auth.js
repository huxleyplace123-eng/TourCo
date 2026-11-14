import { broadcastResponseToMainFrame } from "@azure/msal-browser/redirect-bridge";
broadcastResponseToMainFrame().catch(() => {
  document.getElementById("status").textContent = "Return to the CRM and choose Connect mailbox to continue.";
});
