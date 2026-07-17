import { useState } from "react";
import Login, { AUTH_KEY } from "./Login.jsx";
import App from "./App.jsx";
import OperatorsApp from "./OperatorsApp.jsx";

const WS_KEY = "ticowild_crm_workspace";

// Auth gate + workspace routing. Customers and Operators are two views of the
// same CRM behind one sign-in.
export default function Root() {
  const [signedIn, setSignedIn] = useState(() => localStorage.getItem(AUTH_KEY) === "1");
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
  return workspace === "operators" ? (
    <OperatorsApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : (
    <App workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  );
}
