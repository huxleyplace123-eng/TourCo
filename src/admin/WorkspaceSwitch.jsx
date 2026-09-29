import { Users, Handshake, ClipboardCheck, Mail } from "lucide-react";
import { c, FONT, radius } from "../theme.js";

// Customers | Operators | Applications | Templates — every relationship and
// its communication tools live in one CRM.
export default function WorkspaceSwitch({ workspace, onWorkspace }) {
  return (
    <div className="crm-workspace-switch" style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.pill, padding: 3 }}>
      <style>{`@media(max-width:620px){.crm-workspace-switch{width:100%;max-width:100%;min-width:0;order:3;overflow:hidden}.crm-workspace-switch button{flex:1 1 0;min-width:0;justify-content:center;gap:0!important;padding:7px 3px!important;font-size:10.5px!important}.crm-workspace-switch button svg{display:none}}`}</style>
      {[["customers", "Customers", Users], ["operators", "Operators", Handshake], ["applications", "Applications", ClipboardCheck], ["templates", "Templates", Mail]].map(([k, label, Icon]) => (
        <button key={k} onClick={() => onWorkspace(k)} style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          padding: "6px 13px", borderRadius: radius.pill, border: "none", cursor: "pointer",
          fontFamily: FONT, fontSize: 12.5, fontWeight: 700,
          background: workspace === k ? c.teal : "transparent",
          color: workspace === k ? c.ink : c.stone,
        }}>
          <Icon size={13} /> {label}
        </button>
      ))}
    </div>
  );
}
