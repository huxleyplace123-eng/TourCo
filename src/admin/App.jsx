import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarClock, Check, ChevronDown, Columns3, Download, Filter, Mail, MessageCircle,
  Pencil, Phone, Plus, Search, Trash2, Upload, Users, X, AlertTriangle, StickyNote,
} from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";
import {
  ACTIVE_STAGES, LEAD_SOURCES, PAYMENT_STATUSES, STAGES, STAGE_COLORS,
  addDaysIso, blankCustomer, daysFromToday, findDuplicates, fmtDate, followUpBuckets,
  importCsv, loadColumnPrefs, loadCustomers, moneyNum, normPhone, sampleCustomers,
  saveColumnPrefs, saveCustomers, toCsv, todayIso,
} from "./store.js";

// ─────────────────────────────────────────────────────────────────────────────
// TicoWild CRM — one screen, three views (Table · Pipeline · Follow-ups),
// a side drawer for the selected customer, and zero ceremony anywhere else.
// ─────────────────────────────────────────────────────────────────────────────

const money = (v) => {
  const n = moneyNum(v);
  return n ? `$${n.toLocaleString()}` : "—";
};

const inputBase = {
  width: "100%",
  background: "rgba(255,255,255,.06)",
  border: `1px solid ${c.line}`,
  borderRadius: radius.sm,
  color: c.charcoal,
  fontFamily: FONT,
  fontSize: 14,
  padding: "9px 12px",
  outline: "none",
};

function StageChip({ stage, small }) {
  const col = STAGE_COLORS[stage] || c.stone;
  return (
    <span
      style={{
        display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
        padding: small ? "2px 8px" : "3px 10px", borderRadius: 999,
        border: `1px solid ${col}55`, background: `${col}1f`, color: col,
        fontSize: small ? 11 : 12, fontWeight: 700, whiteSpace: "nowrap",
      }}
    >
      <span style={{ width: 6, height: 6, borderRadius: 999, background: col }} />
      {stage}
    </span>
  );
}

function StageSelect({ value, onChange, compact }) {
  return (
    <select
      value={value}
      onClick={(e) => e.stopPropagation()}
      onChange={(e) => onChange(e.target.value)}
      style={{
        ...inputBase, width: compact ? 132 : "100%", padding: compact ? "5px 8px" : "9px 12px",
        fontSize: 13, fontWeight: 600, color: STAGE_COLORS[value] || c.charcoal, cursor: "pointer",
      }}
    >
      {STAGES.map((s) => (
        <option key={s} value={s}>{s}</option>
      ))}
    </select>
  );
}

function Tag({ label, onRemove }) {
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 5, padding: "2px 9px",
      borderRadius: 999, background: "rgba(34,211,238,.12)", border: "1px solid rgba(34,211,238,.3)",
      color: c.teal, fontSize: 11.5, fontWeight: 600, whiteSpace: "nowrap",
    }}>
      {label}
      {onRemove && (
        <button onClick={onRemove} style={{ all: "unset", cursor: "pointer", display: "flex" }} aria-label={`remove ${label}`}>
          <X size={11} />
        </button>
      )}
    </span>
  );
}

function FollowUpCell({ iso }) {
  const d = daysFromToday(iso);
  if (d === null) return <span style={{ color: c.stone }}>—</span>;
  const col = d < 0 ? "#F87171" : d === 0 ? c.gold : c.teal;
  const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : d === 1 ? "Tomorrow" : fmtDate(iso);
  return <span style={{ color: col, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{label}</span>;
}

function QuickActions({ cust, onLog, size = 15 }) {
  const btn = {
    display: "inline-flex", alignItems: "center", justifyContent: "center",
    width: 34, height: 34, borderRadius: 10, border: `1px solid ${c.line}`,
    background: "rgba(255,255,255,.05)", color: c.stone, cursor: "pointer", textDecoration: "none",
  };
  const phone = normPhone(cust.phone);
  return (
    <span style={{ display: "inline-flex", gap: 6 }} onClick={(e) => e.stopPropagation()}>
      {phone && (
        <a href={`https://wa.me/${phone}`} target="_blank" rel="noreferrer" title="WhatsApp"
          style={{ ...btn, color: "#25D366" }} onClick={() => onLog(cust.id, "whatsapp")}>
          <MessageCircle size={size} />
        </a>
      )}
      {cust.email && (
        <a href={`mailto:${cust.email}`} title="Email" style={btn} onClick={() => onLog(cust.id, "email")}>
          <Mail size={size} />
        </a>
      )}
      {phone && (
        <a href={`tel:${cust.phone}`} title="Call" style={btn} onClick={() => onLog(cust.id, "call")}>
          <Phone size={size} />
        </a>
      )}
    </span>
  );
}

// ── Column model for the table ────────────────────────────────────────────────
const ALL_COLUMNS = [
  { key: "name", label: "Customer", always: true },
  { key: "stage", label: "Stage" },
  { key: "nextFollowUp", label: "Follow-up" },
  { key: "travel", label: "Travel dates" },
  { key: "travelers", label: "Pax" },
  { key: "tripValue", label: "Value" },
  { key: "assignee", label: "Assigned" },
  { key: "tags", label: "Tags" },
  { key: "lastContacted", label: "Last contact" },
  { key: "phone", label: "Phone" },
  { key: "email", label: "Email" },
  { key: "country", label: "Country" },
  { key: "region", label: "Region" },
  { key: "activities", label: "Activities" },
  { key: "budget", label: "Budget" },
  { key: "source", label: "Source" },
  { key: "payment", label: "Payment" },
];
const DEFAULT_COLUMNS = ["name", "stage", "nextFollowUp", "travel", "travelers", "tripValue", "assignee", "tags", "lastContacted"];

const sortVal = (cust, key) => {
  switch (key) {
    case "name": return String(cust.name).toLowerCase();
    case "stage": return STAGES.indexOf(cust.stage);
    case "nextFollowUp": return cust.nextFollowUp || "9999";
    case "travel": return cust.travelStart || "9999";
    case "travelers": return moneyNum(cust.travelers);
    case "tripValue": return moneyNum(cust.tripValue);
    case "lastContacted": return cust.lastContacted || "";
    default: return String(cust[key] ?? "").toLowerCase();
  }
};

// ─────────────────────────────────────────────────────────────────────────────
export default function App() {
  const [customers, setCustomers] = useState(() => loadCustomers());
  const [view, setView] = useState("table");
  const [query, setQuery] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [assigneeFilter, setAssigneeFilter] = useState("");
  const [sourceFilter, setSourceFilter] = useState("");
  const [tagFilter, setTagFilter] = useState("");
  const [sortKey, setSortKey] = useState("nextFollowUp");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [showColumns, setShowColumns] = useState(false);
  const [columns, setColumns] = useState(() => loadColumnPrefs(DEFAULT_COLUMNS));
  const fileRef = useRef(null);

  useEffect(() => saveCustomers(customers), [customers]);
  useEffect(() => saveColumnPrefs(columns), [columns]);

  const update = (id, patch) =>
    setCustomers((cs) => cs.map((x) => (x.id === id ? { ...x, ...patch, updatedAt: new Date().toISOString() } : x)));

  const addNote = (id, text, kind = "note") =>
    setCustomers((cs) => cs.map((x) => x.id === id ? {
      ...x,
      updatedAt: new Date().toISOString(),
      notes: [...(x.notes || []), { id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), kind, text }],
    } : x));

  const logContact = (id, kind) => {
    update(id, { lastContacted: todayIso() });
    addNote(id, kind === "whatsapp" ? "WhatsApp opened" : kind === "call" ? "Call started" : "Email opened", kind);
  };

  const setStage = (id, stage) => {
    const cust = customers.find((x) => x.id === id);
    if (!cust || cust.stage === stage) return;
    update(id, { stage });
    addNote(id, `Stage: ${cust.stage} → ${stage}`, "stage");
  };

  const removeCustomer = (id) => {
    const cust = customers.find((x) => x.id === id);
    if (!cust) return;
    if (!window.confirm(`Delete ${cust.name}? This can't be undone.`)) return;
    setSelectedId(null);
    setCustomers((cs) => cs.filter((x) => x.id !== id));
  };

  // Derived option lists for filters + form datalists.
  const assignees = useMemo(() => [...new Set(customers.map((x) => x.assignee).filter(Boolean))].sort(), [customers]);
  const sources = useMemo(() => [...new Set([...LEAD_SOURCES, ...customers.map((x) => x.source).filter(Boolean)])], [customers]);
  const allTags = useMemo(() => [...new Set(customers.flatMap((x) => x.tags || []))].sort(), [customers]);

  // Search + filters → the working list every view renders from.
  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = customers;
    if (q) {
      list = list.filter((x) =>
        [x.name, x.email, x.phone, x.country, x.region, x.activities, x.assignee, x.source,
          (x.tags || []).join(" "), (x.notes || []).map((n) => n.text).join(" ")]
          .join(" ").toLowerCase().includes(q),
      );
    }
    if (stageFilter) list = list.filter((x) => x.stage === stageFilter);
    if (assigneeFilter) list = list.filter((x) => x.assignee === assigneeFilter);
    if (sourceFilter) list = list.filter((x) => x.source === sourceFilter);
    if (tagFilter) list = list.filter((x) => (x.tags || []).includes(tagFilter));
    return list;
  }, [customers, query, stageFilter, assigneeFilter, sourceFilter, tagFilter]);

  const sorted = useMemo(() => {
    const list = [...filtered];
    list.sort((a, b) => {
      const va = sortVal(a, sortKey);
      const vb = sortVal(b, sortKey);
      const r = va < vb ? -1 : va > vb ? 1 : 0;
      return sortDir === "asc" ? r : -r;
    });
    return list;
  }, [filtered, sortKey, sortDir]);

  const buckets = useMemo(() => followUpBuckets(filtered), [filtered]);
  const selected = customers.find((x) => x.id === selectedId) || null;
  const filtersOn = stageFilter || assigneeFilter || sourceFilter || tagFilter || query;

  // Stat strip numbers (whole book, not the filtered view — these are the pulse).
  const stats = useMemo(() => {
    const all = followUpBuckets(customers);
    const open = customers.filter((x) => ["New", "Contacted", "Planning", "Quote sent"].includes(x.stage));
    const booked = customers.filter((x) => x.stage === "Booked");
    return {
      active: open.length,
      overdue: all.overdue.length,
      pipeline: open.reduce((s, x) => s + moneyNum(x.tripValue), 0),
      bookedValue: booked.reduce((s, x) => s + moneyNum(x.tripValue), 0),
      bookedCount: booked.length,
    };
  }, [customers]);

  const exportCsv = () => {
    const blob = new Blob([toCsv(customers)], { type: "text/csv;charset=utf-8" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `ticowild-crm-${todayIso()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { imported, skippedDuplicates, badRows } = importCsv(String(reader.result), customers);
      if (imported.length) setCustomers((cs) => [...cs, ...imported]);
      window.alert(
        `Imported ${imported.length} customer${imported.length === 1 ? "" : "s"}.` +
        (skippedDuplicates ? ` Skipped ${skippedDuplicates} duplicate${skippedDuplicates === 1 ? "" : "s"} (same phone/email).` : "") +
        (badRows ? ` ${badRows} row${badRows === 1 ? "" : "s"} had no name and were skipped.` : ""),
      );
    };
    reader.readAsText(file);
  };

  const headerBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px",
    borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)",
    color: c.charcoal, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.sand, color: c.charcoal, fontFamily: FONT }}>
      <style>{`
        .crm-wrap { max-width: 1440px; margin: 0 auto; padding: 18px clamp(12px, 2.5vw, 28px) 90px; }
        .crm-topbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .crm-stats { display: grid; grid-template-columns: repeat(auto-fit, minmax(150px, 1fr)); gap: 10px; margin: 16px 0 12px; }
        .crm-filters { display: flex; gap: 8px; flex-wrap: wrap; align-items: center; margin-bottom: 14px; }
        .crm-table-head { position: sticky; top: 0; z-index: 2; background: ${c.canvas2}; }
        .crm-row:hover { background: rgba(255,255,255,.04); }
        .crm-kanban { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 18px; scroll-snap-type: x proximity; }
        .crm-kanban > div { scroll-snap-align: start; }
        .crm-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(520px, 100vw); z-index: 50;
          background: ${c.canvas2}; border-left: 1px solid ${c.line}; box-shadow: ${shadow.xl};
          display: flex; flex-direction: column; animation: slideIn .18s ease; }
        @keyframes slideIn { from { transform: translateX(30px); opacity: 0 } to { transform: none; opacity: 1 } }
        .crm-modal-bg { position: fixed; inset: 0; background: rgba(4,10,20,.6); backdrop-filter: blur(3px); z-index: 60;
          display: flex; align-items: flex-start; justify-content: center; overflow-y: auto; padding: 4vh 12px 8vh; }
        .crm-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
        input[type="date"]::-webkit-calendar-picker-indicator { filter: invert(.8); }
        select option { color: ${c.ink}; background: #fff; }
        ::-webkit-scrollbar { width: 10px; height: 10px; }
        ::-webkit-scrollbar-track { background: transparent; }
        ::-webkit-scrollbar-thumb { background: rgba(255,255,255,.14); border-radius: 999px; }
        @media (max-width: 760px) {
          .crm-grid2 { grid-template-columns: 1fr; }
          .crm-hide-mobile { display: none !important; }
          button, select, input { min-height: 42px; }
        }
      `}</style>

      <div className="crm-wrap">
        {/* ── Top bar ── */}
        <div className="crm-topbar">
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5, marginRight: 4 }}>
            Tico<span style={{ color: c.gold }}>Wild</span>
            <span style={{ color: c.stone, fontWeight: 700, fontSize: 15, marginLeft: 8 }}>CRM</span>
          </div>

          <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 420 }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: c.stone }} />
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search name, phone, email, notes…"
              style={{ ...inputBase, paddingLeft: 34 }}
            />
          </div>

          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.sm, padding: 3 }}>
            {[["table", "Table"], ["pipeline", "Pipeline"], ["followups", "Follow-ups"]].map(([k, label]) => (
              <button key={k} onClick={() => setView(k)}
                style={{
                  padding: "7px 14px", borderRadius: radius.sm - 4, border: "none", cursor: "pointer",
                  fontFamily: FONT, fontSize: 13, fontWeight: 700,
                  background: view === k ? c.gold : "transparent",
                  color: view === k ? c.ink : c.stone,
                }}>
                {label}
                {k === "followups" && stats.overdue > 0 && (
                  <span style={{
                    marginLeft: 6, padding: "1px 7px", borderRadius: 999, fontSize: 11,
                    background: view === k ? "rgba(11,26,46,.18)" : "rgba(248,113,113,.2)",
                    color: view === k ? c.ink : "#F87171", fontWeight: 800,
                  }}>{stats.overdue}</span>
                )}
              </button>
            ))}
          </div>

          <div style={{ flex: 1 }} className="crm-hide-mobile" />

          <button onClick={() => setShowColumns((v) => !v)} style={headerBtn} title="Choose table columns">
            <Columns3 size={15} /> <span className="crm-hide-mobile">Columns</span>
          </button>
          <button onClick={() => fileRef.current?.click()} style={headerBtn} title="Import customers from CSV">
            <Upload size={15} /> <span className="crm-hide-mobile">Import</span>
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onImportFile} style={{ display: "none" }} />
          <button onClick={exportCsv} style={headerBtn} title="Export all customers to CSV">
            <Download size={15} /> <span className="crm-hide-mobile">Export</span>
          </button>
          <button onClick={() => setShowAdd(true)}
            style={{
              ...headerBtn, background: c.gold, borderColor: c.gold, color: c.ink, fontWeight: 800,
              boxShadow: shadow.glowGold,
            }}>
            <Plus size={16} strokeWidth={3} /> Add customer
          </button>
        </div>

        {/* ── Column picker ── */}
        {showColumns && (
          <div style={{
            marginTop: 10, padding: 14, borderRadius: radius.md, border: `1px solid ${c.line}`,
            background: c.white, display: "flex", flexWrap: "wrap", gap: 8,
          }}>
            {ALL_COLUMNS.map((col) => {
              const on = columns.includes(col.key);
              return (
                <button key={col.key}
                  disabled={col.always}
                  onClick={() => setColumns((cur) => on ? cur.filter((k) => k !== col.key) : [...cur, col.key])}
                  style={{
                    display: "inline-flex", alignItems: "center", gap: 6, padding: "6px 11px",
                    borderRadius: 999, cursor: col.always ? "default" : "pointer", fontFamily: FONT, fontSize: 12.5, fontWeight: 600,
                    border: `1px solid ${on ? "rgba(34,211,238,.45)" : c.line}`,
                    background: on ? "rgba(34,211,238,.12)" : "transparent",
                    color: on ? c.teal : c.stone, opacity: col.always ? 0.7 : 1,
                  }}>
                  {on && <Check size={13} />} {col.label}
                </button>
              );
            })}
          </div>
        )}

        {/* ── Stat strip ── */}
        <div className="crm-stats">
          {[
            { label: "Open leads", value: stats.active, icon: <Users size={15} />, col: c.teal },
            { label: "Overdue follow-ups", value: stats.overdue, icon: <CalendarClock size={15} />, col: stats.overdue ? "#F87171" : c.stone, onClick: () => setView("followups") },
            { label: "Open pipeline", value: `$${stats.pipeline.toLocaleString()}`, icon: null, col: c.gold },
            { label: `Booked (${stats.bookedCount})`, value: `$${stats.bookedValue.toLocaleString()}`, icon: null, col: "#34D399" },
          ].map((s) => (
            <div key={s.label} onClick={s.onClick}
              style={{
                padding: "12px 16px", borderRadius: radius.md, border: `1px solid ${c.line}`,
                background: c.white, boxShadow: shadow.sm, cursor: s.onClick ? "pointer" : "default",
              }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".06em", display: "flex", alignItems: "center", gap: 6 }}>
                {s.icon}{s.label}
              </div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col, marginTop: 3 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="crm-filters">
          <Filter size={14} style={{ color: c.stone }} />
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All stages</option>
            {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={assigneeFilter} onChange={(e) => setAssigneeFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All teammates</option>
            {assignees.map((a) => <option key={a} value={a}>{a}</option>)}
          </select>
          <select value={sourceFilter} onChange={(e) => setSourceFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All sources</option>
            {sources.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={tagFilter} onChange={(e) => setTagFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All tags</option>
            {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
          </select>
          <select value={`${sortKey}:${sortDir}`} onChange={(e) => { const [k, d] = e.target.value.split(":"); setSortKey(k); setSortDir(d); }}
            style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="nextFollowUp:asc">Sort: next follow-up</option>
            <option value="travel:asc">Sort: travel date</option>
            <option value="tripValue:desc">Sort: value (high→low)</option>
            <option value="stage:asc">Sort: stage</option>
            <option value="lastContacted:asc">Sort: last contact (oldest)</option>
            <option value="name:asc">Sort: name</option>
          </select>
          {filtersOn && (
            <button onClick={() => { setQuery(""); setStageFilter(""); setAssigneeFilter(""); setSourceFilter(""); setTagFilter(""); }}
              style={{ ...headerBtn, padding: "7px 11px", color: c.teal }}>
              <X size={13} /> Clear
            </button>
          )}
          <span style={{ color: c.stone, fontSize: 12.5, marginLeft: "auto" }}>
            {filtered.length} of {customers.length}
          </span>
        </div>

        {/* ── Views ── */}
        {customers.length === 0 ? (
          <EmptyState onAdd={() => setShowAdd(true)} onSample={() => setCustomers(sampleCustomers())} />
        ) : view === "table" ? (
          <TableView
            customers={sorted} columns={columns} sortKey={sortKey} sortDir={sortDir}
            onSort={(k) => { if (sortKey === k) setSortDir((d) => (d === "asc" ? "desc" : "asc")); else { setSortKey(k); setSortDir("asc"); } }}
            onOpen={setSelectedId} onStage={setStage} onLog={logContact}
          />
        ) : view === "pipeline" ? (
          <PipelineView customers={filtered} onOpen={setSelectedId} onStage={setStage} />
        ) : (
          <FollowupsView buckets={buckets} onOpen={setSelectedId} onLog={logContact} update={update} />
        )}
      </div>

      {selected && (
        <Drawer
          cust={selected} customers={customers} update={update} addNote={addNote}
          setStage={setStage} logContact={logContact} onDelete={removeCustomer}
          onClose={() => setSelectedId(null)}
        />
      )}
      {showAdd && (
        <AddModal
          customers={customers}
          onClose={() => setShowAdd(false)}
          onSave={(rec) => { setCustomers((cs) => [...cs, rec]); setShowAdd(false); setSelectedId(rec.id); }}
          onOpenExisting={(id) => { setShowAdd(false); setSelectedId(id); }}
        />
      )}

      {/* Shared datalists — the drawer and the add-form both use them. */}
      <datalist id="crm-sources">{sources.map((s) => <option key={s} value={s} />)}</datalist>
      <datalist id="crm-assignees">{assignees.map((a) => <option key={a} value={a} />)}</datalist>
    </div>
  );
}

// ── Empty state ───────────────────────────────────────────────────────────────
function EmptyState({ onAdd, onSample }) {
  return (
    <div style={{
      marginTop: 40, padding: "56px 24px", textAlign: "center", borderRadius: radius.lg,
      border: `1px dashed ${c.line}`, background: c.white,
    }}>
      <div style={{ fontSize: 40, marginBottom: 8 }}>🌴</div>
      <div style={{ fontSize: 19, fontWeight: 800 }}>No customers yet</div>
      <div style={{ color: c.stone, fontSize: 14, margin: "8px auto 20px", maxWidth: 420, lineHeight: 1.5 }}>
        Add your first lead, import a CSV from the toolbar, or load sample data to see how the three views work.
      </div>
      <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
        <button onClick={onAdd} style={{
          padding: "11px 18px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink,
          fontFamily: FONT, fontWeight: 800, fontSize: 14, cursor: "pointer", boxShadow: shadow.glowGold,
        }}>
          <Plus size={14} style={{ verticalAlign: -2 }} /> Add customer
        </button>
        <button onClick={onSample} style={{
          padding: "11px 18px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent",
          color: c.teal, fontFamily: FONT, fontWeight: 700, fontSize: 14, cursor: "pointer",
        }}>
          Load sample data
        </button>
      </div>
    </div>
  );
}

// ── Table view ────────────────────────────────────────────────────────────────
function TableView({ customers, columns, sortKey, sortDir, onSort, onOpen, onStage, onLog }) {
  const cols = ALL_COLUMNS.filter((col) => columns.includes(col.key));
  const cellStyle = { padding: "10px 12px", fontSize: 13.5, verticalAlign: "middle", borderBottom: `1px solid ${c.line}`, whiteSpace: "nowrap" };
  const render = (cust, key) => {
    switch (key) {
      case "name":
        return (
          <div style={{ display: "flex", alignItems: "center", gap: 8, minWidth: 0 }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{cust.name}</div>
              <div style={{ color: c.stone, fontSize: 11.5 }}>{cust.country || cust.email || cust.phone}</div>
            </div>
            <QuickActions cust={cust} onLog={onLog} size={14} />
          </div>
        );
      case "stage": return <StageSelect compact value={cust.stage} onChange={(s) => onStage(cust.id, s)} />;
      case "nextFollowUp": return <FollowUpCell iso={cust.nextFollowUp} />;
      case "travel":
        return cust.travelStart
          ? <span>{fmtDate(cust.travelStart)}{cust.travelEnd ? ` – ${fmtDate(cust.travelEnd)}` : ""}</span>
          : <span style={{ color: c.stone }}>—</span>;
      case "travelers": return cust.travelers || <span style={{ color: c.stone }}>—</span>;
      case "tripValue": return <span style={{ fontWeight: 700, color: moneyNum(cust.tripValue) ? c.gold : c.stone }}>{money(cust.tripValue)}</span>;
      case "tags":
        return (cust.tags || []).length
          ? <span style={{ display: "inline-flex", gap: 5 }}>{cust.tags.slice(0, 3).map((t) => <Tag key={t} label={t} />)}{cust.tags.length > 3 && <span style={{ color: c.stone, fontSize: 12 }}>+{cust.tags.length - 3}</span>}</span>
          : <span style={{ color: c.stone }}>—</span>;
      case "lastContacted": return cust.lastContacted ? fmtDate(cust.lastContacted) : <span style={{ color: "#F87171", fontSize: 12.5 }}>never</span>;
      case "payment": return cust.payment === "No payment" ? <span style={{ color: c.stone }}>—</span> : <span style={{ color: cust.payment === "Paid in full" ? "#34D399" : c.gold, fontWeight: 600, fontSize: 12.5 }}>{cust.payment}</span>;
      default: return cust[key] || <span style={{ color: c.stone }}>—</span>;
    }
  };

  if (!customers.length) {
    return <div style={{ padding: 40, textAlign: "center", color: c.stone, background: c.white, borderRadius: radius.md, border: `1px solid ${c.line}` }}>No customers match these filters.</div>;
  }
  return (
    <div style={{ borderRadius: radius.md, border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm, overflow: "auto", maxHeight: "70vh" }}>
      <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 760 }}>
        <thead className="crm-table-head">
          <tr>
            {cols.map((col) => (
              <th key={col.key} onClick={() => onSort(col.key)}
                style={{ ...cellStyle, cursor: "pointer", textAlign: "left", fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: sortKey === col.key ? c.teal : c.stone, userSelect: "none" }}>
                {col.label}{sortKey === col.key ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {customers.map((cust) => (
            <tr key={cust.id} className="crm-row" onClick={() => onOpen(cust.id)} style={{ cursor: "pointer" }}>
              {cols.map((col) => <td key={col.key} style={cellStyle}>{render(cust, col.key)}</td>)}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

// ── Pipeline view ─────────────────────────────────────────────────────────────
function PipelineView({ customers, onOpen, onStage }) {
  const [dragOver, setDragOver] = useState(null);
  return (
    <div className="crm-kanban">
      {STAGES.map((stage) => {
        const col = STAGE_COLORS[stage];
        const cards = customers.filter((x) => x.stage === stage);
        const value = cards.reduce((s, x) => s + moneyNum(x.tripValue), 0);
        return (
          <div key={stage}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
            onDragLeave={() => setDragOver((v) => (v === stage ? null : v))}
            onDrop={(e) => {
              e.preventDefault();
              setDragOver(null);
              const id = e.dataTransfer.getData("text/plain");
              if (id) onStage(id, stage);
            }}
            style={{
              flex: "0 0 264px", width: 264, borderRadius: radius.md,
              border: `1px solid ${dragOver === stage ? col : c.line}`,
              background: dragOver === stage ? `${col}14` : "rgba(255,255,255,.03)",
              padding: 10, minHeight: 300, transition: "border-color .12s ease",
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 10px" }}>
              <StageChip stage={stage} />
              <span style={{ color: c.stone, fontSize: 12, fontWeight: 700 }}>
                {cards.length}{value ? ` · $${value.toLocaleString()}` : ""}
              </span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cards.map((cust) => (
                <div key={cust.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", cust.id)}
                  onClick={() => onOpen(cust.id)}
                  style={{
                    padding: "11px 12px", borderRadius: radius.sm, cursor: "grab",
                    border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm,
                  }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{cust.name}</div>
                  <div style={{ color: c.stone, fontSize: 12, margin: "3px 0 6px" }}>
                    {cust.travelStart ? fmtDate(cust.travelStart) : "No dates"}{cust.travelers ? ` · ${cust.travelers} pax` : ""}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <FollowUpCell iso={cust.nextFollowUp} />
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: moneyNum(cust.tripValue) ? c.gold : c.stone }}>{money(cust.tripValue)}</span>
                  </div>
                </div>
              ))}
              {!cards.length && <div style={{ color: c.stone, fontSize: 12, textAlign: "center", padding: "18px 0", opacity: 0.7 }}>Drop here</div>}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// ── Follow-ups view ───────────────────────────────────────────────────────────
function FollowupsView({ buckets, onOpen, onLog, update }) {
  const sections = [
    { key: "overdue", title: "Overdue", col: "#F87171", hint: "Past their follow-up date" },
    { key: "dueToday", title: "Due today", col: c.gold, hint: "On today's list" },
    { key: "upcoming", title: "Coming up", col: c.teal, hint: "Next 7 days" },
    { key: "noContact", title: "No contact in 7+ days", col: c.blue, hint: "Active leads going quiet" },
    { key: "quotesWaiting", title: "Quotes waiting", col: "#A78BFA", hint: "Quote sent, no answer yet" },
  ];
  const snooze = (cust, days) => update(cust.id, { nextFollowUp: addDaysIso(days) });
  return (
    <div style={{ display: "grid", gap: 14 }}>
      {sections.map((sec) => {
        const list = buckets[sec.key];
        return (
          <div key={sec.key} style={{ borderRadius: radius.md, border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm, overflow: "hidden" }}>
            <div style={{ display: "flex", alignItems: "baseline", gap: 10, padding: "12px 16px", borderBottom: `1px solid ${c.line}` }}>
              <span style={{ width: 8, height: 8, borderRadius: 999, background: sec.col, alignSelf: "center" }} />
              <span style={{ fontWeight: 800, fontSize: 14.5 }}>{sec.title}</span>
              <span style={{ color: sec.col, fontWeight: 800, fontSize: 14 }}>{list.length}</span>
              <span style={{ color: c.stone, fontSize: 12 }}>{sec.hint}</span>
            </div>
            {list.length ? list.map((cust) => (
              <div key={cust.id} onClick={() => onOpen(cust.id)}
                className="crm-row"
                style={{ display: "flex", alignItems: "center", gap: 10, padding: "10px 16px", borderBottom: `1px solid ${c.line}`, cursor: "pointer", flexWrap: "wrap" }}>
                <div style={{ minWidth: 150, flex: "1 1 160px" }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{cust.name}</div>
                  <div style={{ color: c.stone, fontSize: 12 }}>
                    {cust.assignee ? `${cust.assignee} · ` : ""}{cust.travelStart ? `travels ${fmtDate(cust.travelStart)}` : "no dates yet"}
                  </div>
                </div>
                <StageChip stage={cust.stage} small />
                {sec.key === "noContact"
                  ? <span style={{ fontSize: 12.5, color: c.blue, fontWeight: 700 }}>{cust.lastContacted ? `last touch ${fmtDate(cust.lastContacted)}` : "never contacted"}</span>
                  : <FollowUpCell iso={cust.nextFollowUp} />}
                <span style={{ flex: 1 }} />
                <span onClick={(e) => e.stopPropagation()} style={{ display: "inline-flex", gap: 6, alignItems: "center" }}>
                  <QuickActions cust={cust} onLog={onLog} size={14} />
                  {[1, 3, 7].map((d) => (
                    <button key={d} onClick={() => snooze(cust, d)} title={`Set next follow-up in ${d} day${d > 1 ? "s" : ""}`}
                      style={{ padding: "5px 9px", borderRadius: 8, border: `1px solid ${c.line}`, background: "transparent", color: c.stone, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                      +{d}d
                    </button>
                  ))}
                </span>
              </div>
            )) : (
              <div style={{ padding: "14px 16px", color: c.stone, fontSize: 13 }}>Nothing here. 🎉</div>
            )}
          </div>
        );
      })}
    </div>
  );
}

// ── Field primitives for forms/drawer ────────────────────────────────────────
function Field({ label, children, span2 }) {
  return (
    <label style={{ display: "block", gridColumn: span2 ? "1 / -1" : undefined }}>
      <div style={{ fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 }}>{label}</div>
      {children}
    </label>
  );
}

function TagsEditor({ tags, onChange }) {
  const [draft, setDraft] = useState("");
  const add = () => {
    const t = draft.trim();
    if (t && !tags.includes(t)) onChange([...tags, t]);
    setDraft("");
  };
  return (
    <div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6, marginBottom: tags.length ? 8 : 0 }}>
        {tags.map((t) => <Tag key={t} label={t} onRemove={() => onChange(tags.filter((x) => x !== t))} />)}
      </div>
      <div style={{ display: "flex", gap: 6 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); add(); } }}
          placeholder="Add tag + Enter" style={{ ...inputBase, padding: "7px 10px", fontSize: 13 }} />
        <button onClick={add} style={{ padding: "0 12px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent", color: c.teal, cursor: "pointer" }}>
          <Plus size={14} />
        </button>
      </div>
    </div>
  );
}

// ── Drawer (customer side panel) ─────────────────────────────────────────────
function Drawer({ cust, customers, update, addNote, setStage, logContact, onDelete, onClose }) {
  const [noteDraft, setNoteDraft] = useState("");
  const dupes = findDuplicates(customers, cust, cust.id);
  const phone = normPhone(cust.phone);
  const set = (key) => (e) => update(cust.id, { [key]: e.target.value });
  const notes = [...(cust.notes || [])].reverse();
  const noteIcon = { note: <StickyNote size={12} />, whatsapp: <MessageCircle size={12} />, call: <Phone size={12} />, email: <Mail size={12} />, stage: <Pencil size={12} /> };

  const bigAction = (bg, color, border) => ({
    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "10px 8px", borderRadius: radius.sm, border: `1px solid ${border}`, background: bg,
    color, fontFamily: FONT, fontSize: 13, fontWeight: 700, textDecoration: "none", cursor: "pointer",
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(4,10,20,.45)" }} />
      <div className="crm-drawer">
        {/* header */}
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 19, fontWeight: 800, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{cust.name}</div>
            <StageSelect compact value={cust.stage} onChange={(s) => setStage(cust.id, s)} />
            <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}>
              <X size={20} />
            </button>
          </div>
          <div style={{ color: c.stone, fontSize: 12.5, marginTop: 3 }}>
            {cust.country || "—"} · {cust.travelers || "?"} pax · {cust.travelStart ? `${fmtDate(cust.travelStart)}${cust.travelEnd ? ` – ${fmtDate(cust.travelEnd)}` : ""}` : "no dates"} ·{" "}
            <span style={{ color: moneyNum(cust.tripValue) ? c.gold : c.stone, fontWeight: 700 }}>{money(cust.tripValue)}</span>
          </div>
          {dupes.length > 0 && (
            <div style={{ marginTop: 8, display: "flex", alignItems: "center", gap: 7, padding: "7px 10px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.35)", color: c.gold, fontSize: 12.5, fontWeight: 600 }}>
              <AlertTriangle size={14} /> Possible duplicate of {dupes.map((d) => d.name).join(", ")} (same phone/email)
            </div>
          )}
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <a href={phone ? `https://wa.me/${phone}` : undefined} target="_blank" rel="noreferrer"
              onClick={() => phone && logContact(cust.id, "whatsapp")}
              style={{ ...bigAction("rgba(37,211,102,.12)", "#25D366", "rgba(37,211,102,.4)"), opacity: phone ? 1 : 0.4, pointerEvents: phone ? "auto" : "none" }}>
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a href={cust.email ? `mailto:${cust.email}` : undefined}
              onClick={() => cust.email && logContact(cust.id, "email")}
              style={{ ...bigAction("rgba(34,211,238,.1)", c.teal, "rgba(34,211,238,.35)"), opacity: cust.email ? 1 : 0.4, pointerEvents: cust.email ? "auto" : "none" }}>
              <Mail size={15} /> Email
            </a>
            <a href={phone ? `tel:${cust.phone}` : undefined}
              onClick={() => phone && logContact(cust.id, "call")}
              style={{ ...bigAction("rgba(127,166,232,.1)", c.blue, "rgba(127,166,232,.35)"), opacity: phone ? 1 : 0.4, pointerEvents: phone ? "auto" : "none" }}>
              <Phone size={15} /> Call
            </a>
          </div>
        </div>

        {/* body */}
        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "grid", gap: 16 }}>
          {/* follow-up + payment quick row */}
          <div className="crm-grid2">
            <Field label="Next follow-up">
              <input type="date" value={cust.nextFollowUp || ""} onChange={set("nextFollowUp")} style={inputBase} />
              <div style={{ display: "flex", gap: 6, marginTop: 6 }}>
                {[["Today", 0], ["+1d", 1], ["+3d", 3], ["+1w", 7]].map(([label, d]) => (
                  <button key={label} onClick={() => update(cust.id, { nextFollowUp: addDaysIso(d) })}
                    style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${c.line}`, background: "transparent", color: c.teal, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {label}
                  </button>
                ))}
              </div>
            </Field>
            <Field label="Payment status">
              <select value={cust.payment} onChange={set("payment")} style={inputBase}>
                {PAYMENT_STATUSES.map((p) => <option key={p} value={p}>{p}</option>)}
              </select>
              <div style={{ color: c.stone, fontSize: 12, marginTop: 8 }}>
                Last contacted: <b style={{ color: cust.lastContacted ? c.charcoal : "#F87171" }}>{cust.lastContacted ? fmtDate(cust.lastContacted) : "never"}</b>
                <button onClick={() => update(cust.id, { lastContacted: todayIso() })}
                  style={{ marginLeft: 8, padding: "3px 9px", borderRadius: 8, border: `1px solid ${c.line}`, background: "transparent", color: c.teal, fontFamily: FONT, fontSize: 11.5, fontWeight: 700, cursor: "pointer" }}>
                  Mark today
                </button>
              </div>
            </Field>
          </div>

          {/* details */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.stone, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Details</div>
            <div className="crm-grid2">
              <Field label="Full name"><input value={cust.name} onChange={set("name")} style={inputBase} /></Field>
              <Field label="Phone / WhatsApp"><input value={cust.phone} onChange={set("phone")} style={inputBase} /></Field>
              <Field label="Email"><input value={cust.email} onChange={set("email")} style={inputBase} /></Field>
              <Field label="Country"><input value={cust.country} onChange={set("country")} style={inputBase} /></Field>
              <Field label="Travel start"><input type="date" value={cust.travelStart || ""} onChange={set("travelStart")} style={inputBase} /></Field>
              <Field label="Travel end"><input type="date" value={cust.travelEnd || ""} onChange={set("travelEnd")} style={inputBase} /></Field>
              <Field label="Travelers"><input value={cust.travelers} onChange={set("travelers")} inputMode="numeric" style={inputBase} /></Field>
              <Field label="Destination / region"><input value={cust.region} onChange={set("region")} style={inputBase} /></Field>
              <Field label="Activities interested in" span2><input value={cust.activities} onChange={set("activities")} style={inputBase} /></Field>
              <Field label="Estimated budget"><input value={cust.budget} onChange={set("budget")} style={inputBase} /></Field>
              <Field label="Estimated trip value ($)"><input value={cust.tripValue} onChange={set("tripValue")} inputMode="numeric" style={inputBase} /></Field>
              <Field label="Lead source"><input list="crm-sources" value={cust.source} onChange={set("source")} style={inputBase} /></Field>
              <Field label="Assigned to"><input list="crm-assignees" value={cust.assignee} onChange={set("assignee")} style={inputBase} /></Field>
              <Field label="Tags" span2><TagsEditor tags={cust.tags || []} onChange={(tags) => update(cust.id, { tags })} /></Field>
            </div>
          </div>

          {/* notes */}
          <div>
            <div style={{ fontSize: 12, fontWeight: 800, color: c.stone, textTransform: "uppercase", letterSpacing: ".06em", marginBottom: 8 }}>Notes & history</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input
                value={noteDraft}
                onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && noteDraft.trim()) { addNote(cust.id, noteDraft.trim()); update(cust.id, { lastContacted: todayIso() }); setNoteDraft(""); } }}
                placeholder="Add a note + Enter (also marks contacted today)"
                style={inputBase}
              />
              <button
                onClick={() => { if (noteDraft.trim()) { addNote(cust.id, noteDraft.trim()); update(cust.id, { lastContacted: todayIso() }); setNoteDraft(""); } }}
                style={{ padding: "0 14px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontWeight: 800, fontFamily: FONT, cursor: "pointer" }}>
                Add
              </button>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {notes.length ? notes.map((n) => (
                <div key={n.id} style={{ padding: "9px 12px", borderRadius: radius.sm, background: "rgba(255,255,255,.04)", border: `1px solid ${c.line}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 6, color: c.stone, fontSize: 11.5, marginBottom: 3 }}>
                    {noteIcon[n.kind] || noteIcon.note}
                    {new Date(n.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{n.text}</div>
                </div>
              )) : <div style={{ color: c.stone, fontSize: 13 }}>No notes yet.</div>}
            </div>
          </div>
        </div>

        {/* footer */}
        <div style={{ padding: "12px 20px", borderTop: `1px solid ${c.line}`, display: "flex", justifyContent: "space-between", alignItems: "center" }}>
          <span style={{ color: c.stone, fontSize: 11.5 }}>Added {fmtDate(cust.createdAt)}</span>
          <button onClick={() => onDelete(cust.id)}
            style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: radius.sm, border: "1px solid rgba(248,113,113,.4)", background: "transparent", color: "#F87171", fontFamily: FONT, fontSize: 12.5, fontWeight: 700, cursor: "pointer" }}>
            <Trash2 size={14} /> Delete
          </button>
        </div>
      </div>
    </>
  );
}

// ── Add customer modal ────────────────────────────────────────────────────────
function AddModal({ customers, onClose, onSave, onOpenExisting }) {
  const [rec, setRec] = useState(() => ({ ...blankCustomer(), nextFollowUp: addDaysIso(1) }));
  const set = (key) => (e) => setRec((r) => ({ ...r, [key]: e.target.value }));
  const dupes = findDuplicates(customers, rec);
  const canSave = rec.name.trim().length > 0;

  return (
    <div className="crm-modal-bg" onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ width: "min(680px, 100%)", borderRadius: radius.lg, border: `1px solid ${c.line}`, background: c.canvas2, boxShadow: shadow.xl, overflow: "hidden" }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, flex: 1 }}>Add customer</div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}><X size={20} /></button>
        </div>
        <div style={{ padding: 20, display: "grid", gap: 12, maxHeight: "62vh", overflowY: "auto" }}>
          {dupes.length > 0 && (
            <div style={{ display: "flex", alignItems: "center", gap: 8, padding: "9px 12px", borderRadius: radius.sm, background: "rgba(255,208,0,.1)", border: "1px solid rgba(255,208,0,.35)", color: c.gold, fontSize: 13, fontWeight: 600 }}>
              <AlertTriangle size={15} />
              <span style={{ flex: 1 }}>Same phone/email as <b>{dupes[0].name}</b></span>
              <button onClick={() => onOpenExisting(dupes[0].id)}
                style={{ padding: "5px 11px", borderRadius: 8, border: `1px solid rgba(255,208,0,.5)`, background: "transparent", color: c.gold, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                Open existing
              </button>
            </div>
          )}
          <div className="crm-grid2">
            <Field label="Full name *"><input autoFocus value={rec.name} onChange={set("name")} style={inputBase} placeholder="e.g. Sarah Mitchell" /></Field>
            <Field label="Phone / WhatsApp"><input value={rec.phone} onChange={set("phone")} style={inputBase} placeholder="+1 …" /></Field>
            <Field label="Email"><input value={rec.email} onChange={set("email")} style={inputBase} /></Field>
            <Field label="Country"><input value={rec.country} onChange={set("country")} style={inputBase} /></Field>
            <Field label="Travel start"><input type="date" value={rec.travelStart} onChange={set("travelStart")} style={inputBase} /></Field>
            <Field label="Travel end"><input type="date" value={rec.travelEnd} onChange={set("travelEnd")} style={inputBase} /></Field>
            <Field label="Travelers"><input value={rec.travelers} onChange={set("travelers")} inputMode="numeric" style={inputBase} /></Field>
            <Field label="Destination / region"><input value={rec.region} onChange={set("region")} style={inputBase} placeholder="Guanacaste, Arenal…" /></Field>
            <Field label="Activities interested in" span2><input value={rec.activities} onChange={set("activities")} style={inputBase} placeholder="Catamaran, zipline…" /></Field>
            <Field label="Estimated budget"><input value={rec.budget} onChange={set("budget")} style={inputBase} placeholder="$3,000" /></Field>
            <Field label="Estimated trip value ($)"><input value={rec.tripValue} onChange={set("tripValue")} inputMode="numeric" style={inputBase} placeholder="2800" /></Field>
            <Field label="Lead source"><input list="crm-sources" value={rec.source} onChange={set("source")} style={inputBase} /></Field>
            <Field label="Assigned to"><input list="crm-assignees" value={rec.assignee} onChange={set("assignee")} style={inputBase} /></Field>
            <Field label="Sales stage">
              <select value={rec.stage} onChange={set("stage")} style={inputBase}>
                {STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
              </select>
            </Field>
            <Field label="Next follow-up"><input type="date" value={rec.nextFollowUp} onChange={set("nextFollowUp")} style={inputBase} /></Field>
            <Field label="Tags" span2><TagsEditor tags={rec.tags} onChange={(tags) => setRec((r) => ({ ...r, tags }))} /></Field>
            <Field label="First note" span2>
              <input
                value={rec._firstNote || ""}
                onChange={(e) => setRec((r) => ({ ...r, _firstNote: e.target.value }))}
                style={inputBase} placeholder="What do they want?"
              />
            </Field>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent", color: c.stone, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
          <button
            disabled={!canSave}
            onClick={() => {
              const { _firstNote, ...clean } = rec;
              const final = { ...clean };
              if (_firstNote?.trim()) {
                final.notes = [{ id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), kind: "note", text: _firstNote.trim() }];
              }
              onSave(final);
            }}
            style={{
              padding: "10px 18px", borderRadius: radius.sm, border: "none",
              background: canSave ? c.gold : "rgba(255,255,255,.12)", color: canSave ? c.ink : c.stone,
              fontFamily: FONT, fontWeight: 800, fontSize: 13.5, cursor: canSave ? "pointer" : "default",
            }}>
            Save customer
          </button>
        </div>
      </div>
    </div>
  );
}
