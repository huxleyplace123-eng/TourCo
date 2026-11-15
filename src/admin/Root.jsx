import './desktop-density.css';
import CustomerPortalApp from './CustomerPortalApp.jsx';
import { useState } from "react";
import { AUTH_KEY } from "./Login.jsx";
import TeamAccessGate from './TeamAccessGate.jsx';
import App from "./App.jsx";
import OperatorsApp from "./OperatorsApp.jsx";
import ApplicationsApp from "./ApplicationsApp.jsx";
import TemplatesApp from "./TemplatesApp.jsx";
import EmailApp from "./EmailApp.jsx";
import { disconnectMail } from "./mail-client.js";
import { signOutTeam } from "./applications-data.js";

const WS_KEY = "ticowild_crm_workspace";

// Every CRM workspace requires a verified team account.
export default function Root() {
  return <TeamAccessGate><TeamWorkspace/></TeamAccessGate>;
}
function TeamWorkspace() {
  const [logoutError,setLogoutError]=useState("");
  const [workspace, setWorkspaceState] = useState(() => new URLSearchParams(window.location.search).get("workspace") || localStorage.getItem(WS_KEY) || "customers");

  const setWorkspace = (ws) => {
    localStorage.setItem(WS_KEY, ws);
    window.history.replaceState(null, "", `/admin/?workspace=${encodeURIComponent(ws)}`);
    setWorkspaceState(ws);
  };
  const signOut = async () => {
    setLogoutError("");
    try{await signOutTeam();await disconnectMail();localStorage.removeItem(AUTH_KEY);}
    catch(error){setLogoutError(error.message||"Sign out failed. Please try again.");}
  };

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
  return <div className="crm-desktop">{logoutError&&<div role="alert" style={{padding:12,background:"#532c34",color:"white"}}>{logoutError}</div>}{content}</div>;
}
