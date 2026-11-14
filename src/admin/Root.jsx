import CustomerPortalApp from './CustomerPortalApp.jsx';
import { useState } from "react";
import Login, { AUTH_KEY, isAdminSessionValid } from "./Login.jsx";
import App from "./App.jsx";
import OperatorsApp from "./OperatorsApp.jsx";
import ApplicationsApp from "./ApplicationsApp.jsx";
import TemplatesApp from "./TemplatesApp.jsx";
import EmailApp from "./EmailApp.jsx";
import { disconnectMail } from "./mail-client.js";
import { signOutTeam } from "./applications-data.js";

const WS_KEY = "ticowild_crm_workspace";

// Auth gate + workspace routing. Customer sales, operator outreach, and live
// partner applications share the CRM while approvals require staff auth.
export default function Root() {
  const [logoutError,setLogoutError]=useState("");
  const [signedIn, setSignedIn] = useState(() => isAdminSessionValid());
  const [workspace, setWorkspaceState] = useState(() => new URLSearchParams(window.location.search).get("workspace") || localStorage.getItem(WS_KEY) || "customers");

  const setWorkspace = (ws) => {
    localStorage.setItem(WS_KEY, ws);
    window.history.replaceState(null, "", `/admin/?workspace=${encodeURIComponent(ws)}`);
    setWorkspaceState(ws);
  };
  const signOut = async () => {
    setLogoutError("");
    try{await signOutTeam();await disconnectMail();localStorage.removeItem(AUTH_KEY);setSignedIn(false);}
    catch(error){setLogoutError(error.message||"Sign out failed. Please try again.");}
  };

  if (!signedIn) return <Login onSuccess={() => setSignedIn(true)} />;
  const content=workspace === "portal" ? (<CustomerPortalApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut}/>) : workspace === "email" ? (
    <EmailApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : workspace === "templates" ? (
    <TemplatesApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : workspace === "applications" ? (
    <ApplicationsApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : workspace === "operators" ? (
    <OperatorsApp workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  ) : (
    <App workspace={workspace} onWorkspace={setWorkspace} onSignOut={signOut} />
  );
  return <>{logoutError&&<div role="alert" style={{padding:12,background:"#532c34",color:"white"}}>{logoutError}</div>}{content}</>;
}
