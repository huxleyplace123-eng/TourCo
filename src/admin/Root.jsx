import { useState } from "react";
import Login, { AUTH_KEY, isAdminSessionValid } from "./Login.jsx";
import App from "./App.jsx";
import OperatorsApp from "./OperatorsApp.jsx";
import ApplicationsApp from "./ApplicationsApp.jsx";
import TemplatesApp from "./TemplatesApp.jsx";

const WS_KEY = "ticowild_crm_workspace";

// Auth gate + workspace routing. Customer sales, operator outreach, and live
// partner applications share the CRM while approvals require staff auth.
export default function Root() {
  const [signedIn, setSignedIn] = useState(() => isAdminSessionValid());
  const [workspace, setWorkspaceState] = useState(() => localStorage.getItem(WS_KEY) || "customers");

  const setWorkspace = (ws) => {
    localStorage.setItem(WS_KEY, ws);
    setWorkspaceState(ws);
  };
  const signOut = () => {
    localStorage.removeItem(AUTH_KEY);
    setSignedIn(false);
  };

  if (!signedIn) return <Login onSuccess={() => setSignedIn(true)} />;
  return workspace === "templates" ? (
    <TemplatesApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : workspace === "applications" ? (
    <ApplicationsApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : workspace === "operators" ? (
    <OperatorsApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : (
    <App workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  );
}
