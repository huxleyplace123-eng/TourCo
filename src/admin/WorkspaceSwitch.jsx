import { Users, Handshake } from "lucide-react";
import { c, FONT, radius } from "../theme.js";

// Customers | Operators — the two sides of the business, one CRM.
export default function WorkspaceSwitch({ workspace, onWorkspace }) {
  return (
    <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.pill, padding: 3 }}>
      {[["customers", "Customers", Users], ["operators", "Operators", Handshake]].map(([k, label, Icon]) => (
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
