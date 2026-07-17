import { useEffect, useMemo, useRef, useState } from "react";
import {
  AlertTriangle, BadgeCheck, ExternalLink, Globe, Mail, MessageCircle, Phone,
  Plus, Search, X, ChevronDown, ChevronUp, Star, Eye, Send, Upload,
} from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";
import { addDaysIso, daysFromToday, fmtDate, normPhone, todayIso } from "./store.js";
import { CATEGORY_BENCHMARKS, TOUR_SEED } from "./operators-data.js";
import {
  OUTREACH_CHECKLIST, PARTNER_STAGES, PARTNER_STAGE_COLORS,
  checklistProgress, importOperatorsCsv, loadOperatorOverlay, mergedOperators, patchOperator, pct, saveOverlay,
} from "./operators-store.js";
import {
  TEMPERATURES, TEMPERATURE_META, OPERATOR_TYPES, operatorType, tempRank,
} from "./crm-shared.js";
import { TempBadge, TempPicker, TypeBadge, TypeSelect, OperatorContacts, CRM_CSS } from "./crm-ui.jsx";
import { loadPortal, addMessage } from "./portal-store.js";
import OperatorPortal from "./OperatorPortal.jsx";
import WorkspaceSwitch from "./WorkspaceSwitch.jsx";

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

const money = (v) => (v === null || v === undefined ? "—" : `$${Math.round(v).toLocaleString()}`);

function StageChip({ stage, small }) {
  const col = PARTNER_STAGE_COLORS[stage] || c.stone;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 6, flexShrink: 0,
      padding: small ? "2px 8px" : "3px 10px", borderRadius: 999,
      border: `1px solid ${col}55`, background: `${col}1f`, color: col,
      fontSize: small ? 11 : 12, fontWeight: 700, whiteSpace: "nowrap",
    }}>
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
        ...inputBase, width: compact ? 148 : "100%", padding: compact ? "5px 8px" : "9px 12px",
        fontSize: 13, fontWeight: 600, color: PARTNER_STAGE_COLORS[value] || c.charcoal, cursor: "pointer",
      }}>
      {PARTNER_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
    </select>
  );
}

// Aligned contact rail (fixed slots) shared with the customer workspace.
const ContactButtons = OperatorContacts;

function FollowUpCell({ iso }) {
  const d = daysFromToday(iso);
  if (d === null) return <span style={{ color: c.stone }}>—</span>;
  const col = d < 0 ? "#F87171" : d === 0 ? c.gold : c.teal;
  const label = d < 0 ? `${Math.abs(d)}d overdue` : d === 0 ? "Today" : d === 1 ? "Tomorrow" : fmtDate(iso);
  return <span style={{ color: col, fontWeight: 700, fontSize: 13, whiteSpace: "nowrap" }}>{label}</span>;
}

// ─────────────────────────────────────────────────────────────────────────────
export default function OperatorsApp({ workspace, onWorkspace, onSignOut }) {
  const [overlay, setOverlay] = useState(() => loadOperatorOverlay());
  const [view, setView] = useState("directory");
  const [query, setQuery] = useState("");
  const [regionFilter, setRegionFilter] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [stageFilter, setStageFilter] = useState("");
  const [typeFilter, setTypeFilter] = useState("");
  const [tempFilter, setTempFilter] = useState("");
  const [sortKey, setSortKey] = useState("smart");
  const [sortDir, setSortDir] = useState("asc");
  const [selectedId, setSelectedId] = useState(null);
  const [showAdd, setShowAdd] = useState(false);
  const [portalOpId, setPortalOpId] = useState(null);
  const fileRef = useRef(null);

  useEffect(() => saveOverlay(overlay), [overlay]);

  const operators = useMemo(() => mergedOperators(overlay), [overlay]);

  const patch = (id, p) => setOverlay((ov) => patchOperator(ov, id, p));
  const addNote = (id, text) => {
    const op = operators.find((x) => x.id === id);
    patch(id, {
      lastContacted: todayIso(),
      notes: [...(op?.notes || []), { id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), text }],
    });
  };
  const logTouch = (id, text) => addNote(id, text);
  const setStage = (id, stage) => {
    const op = operators.find((x) => x.id === id);
    if (!op || op.stage === stage) return;
    patch(id, {
      stage,
      notes: [...(op.notes || []), { id: `n_${Math.random().toString(36).slice(2, 9)}`, at: new Date().toISOString(), text: `Stage: ${op.stage} → ${stage}` }],
    });
  };
  const setTemp = (id, temperature) => patch(id, { temperature });
  const togglePreferred = (id) => {
    const op = operators.find((x) => x.id === id);
    patch(id, { preferred: !op?.preferred });
  };

  const onImportFile = (e) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const { entries, imported, skippedDuplicates, badRows } = importOperatorsCsv(String(reader.result), operators);
      if (imported) setOverlay((ov) => ({ ...ov, ...entries }));
      window.alert(
        `Imported ${imported} operator${imported === 1 ? "" : "s"}.` +
        (skippedDuplicates ? ` Skipped ${skippedDuplicates} duplicate${skippedDuplicates === 1 ? "" : "s"} (same name or phone).` : "") +
        (badRows ? ` ${badRows} row${badRows === 1 ? "" : "s"} had no company name and were skipped.` : ""),
      );
    };
    reader.readAsText(file);
  };

  const regions = useMemo(() => [...new Set(operators.flatMap((o) => o.regions.split(",").map((r) => r.trim()).filter(Boolean)))].sort(), [operators]);
  const categories = useMemo(() => [...new Set(TOUR_SEED.map((t) => t.category).filter(Boolean))].sort(), []);

  const matched = useMemo(() => {
    const q = query.trim().toLowerCase();
    let list = operators;
    if (q) {
      list = list.filter((o) =>
        [o.name, o.regions, o.destinations, o.categories.join(" "), o.email, o.phone,
          (o.notes || []).map((n) => n.text).join(" ")].join(" ").toLowerCase().includes(q));
    }
    if (regionFilter) list = list.filter((o) => o.regions.toLowerCase().includes(regionFilter.toLowerCase()));
    if (categoryFilter) list = list.filter((o) => o.categories.some((x) => x === categoryFilter));
    if (stageFilter) list = list.filter((o) => o.stage === stageFilter);
    if (typeFilter) list = list.filter((o) => (o.type || "tours") === typeFilter);
    if (tempFilter) list = list.filter((o) => o.temperature === tempFilter);
    return list;
  }, [operators, query, regionFilter, categoryFilter, stageFilter, typeFilter, tempFilter]);

  // Default "smart" sort leads with who to act on (hottest → preferred → name);
  // any explicit column/dropdown sort overrides it. `onSort` toggles direction.
  const filtered = useMemo(() => {
    const list = [...matched];
    if (sortKey === "smart") {
      return list.sort((a, b) => {
        const t = tempRank(b.temperature) - tempRank(a.temperature);
        if (t) return t;
        if (!!b.preferred !== !!a.preferred) return b.preferred ? 1 : -1;
        return String(a.name).localeCompare(String(b.name));
      });
    }
    const val = (o) => {
      switch (sortKey) {
        case "name": return String(o.name).toLowerCase();
        case "fee": return o.takeRate ?? -1;
        case "stage": return PARTNER_STAGES.indexOf(o.stage);
        case "type": return o.type || "";
        case "heat": return tempRank(o.temperature);
        case "followup": return o.nextFollowUp || "9999";
        case "checklist": return checklistProgress(o.checklist).done;
        default: return String(o.name).toLowerCase();
      }
    };
    list.sort((a, b) => {
      const va = val(a), vb = val(b);
      const r = va < vb ? -1 : va > vb ? 1 : String(a.name).localeCompare(String(b.name));
      return sortDir === "asc" ? r : -r;
    });
    return list;
  }, [matched, sortKey, sortDir]);

  const onSort = (key) => {
    if (sortKey === key) setSortDir((d) => (d === "asc" ? "desc" : "asc"));
    else { setSortKey(key); setSortDir(key === "fee" || key === "heat" || key === "checklist" ? "desc" : "asc"); }
  };

  const anyFilter = query || stageFilter || regionFilter || categoryFilter || typeFilter || tempFilter;
  const clearFilters = () => { setQuery(""); setStageFilter(""); setRegionFilter(""); setCategoryFilter(""); setTypeFilter(""); setTempFilter(""); };

  const due = useMemo(() => {
    return operators
      .filter((o) => o.stage !== "Passed" && o.stage !== "Active partner")
      .filter((o) => { const d = daysFromToday(o.nextFollowUp); return d !== null && d <= 0; })
      .sort((a, b) => String(a.nextFollowUp).localeCompare(String(b.nextFollowUp)));
  }, [operators]);

  const hot = useMemo(
    () => operators.filter((o) => o.temperature === "Hot" && o.stage !== "Passed"),
    [operators],
  );
  const stats = useMemo(() => ({
    total: operators.length,
    hot: hot.length,
    active: operators.filter((o) => o.stage === "Active partner").length,
    inMotion: operators.filter((o) => !["Not contacted", "Active partner", "Passed"].includes(o.stage)).length,
    due: due.length,
    tours: TOUR_SEED.length,
  }), [operators, due, hot]);

  const selected = operators.find((o) => o.id === selectedId) || null;
  const headerBtn = {
    display: "inline-flex", alignItems: "center", gap: 7, padding: "9px 13px",
    borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)",
    color: c.charcoal, fontFamily: FONT, fontSize: 13, fontWeight: 600, cursor: "pointer", whiteSpace: "nowrap",
  };

  return (
    <div style={{ minHeight: "100vh", background: c.sand, color: c.charcoal, fontFamily: FONT }}>
      <style>{`
        ${CRM_CSS}
        .ops-topbar { display: flex; align-items: center; gap: 12px; flex-wrap: wrap; }
        .ops-row:hover { background: rgba(255,255,255,.04); }
        .ops-kanban { display: flex; gap: 12px; overflow-x: auto; padding-bottom: 18px; scroll-snap-type: x proximity; }
        .ops-kanban > div { scroll-snap-align: start; }
        .ops-drawer { position: fixed; top: 0; right: 0; bottom: 0; width: min(540px, 100vw); z-index: 50;
          background: ${c.canvas2}; border-left: 1px solid ${c.line}; box-shadow: ${shadow.xl};
          display: flex; flex-direction: column; animation: opsIn .18s ease; }
        @keyframes opsIn { from { transform: translateX(30px); opacity: 0 } to { transform: none; opacity: 1 } }
        .ops-grid2 { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; }
      `}</style>

      <div className="ops-wrap">
        {/* ── Top bar ── */}
        <div className="ops-topbar">
          <div style={{ fontSize: 22, fontWeight: 800, letterSpacing: -0.5 }}>
            Tico<span style={{ color: c.gold }}>Wild</span>
            <span style={{ color: c.stone, fontWeight: 700, fontSize: 15, marginLeft: 8 }}>CRM</span>
          </div>
          <WorkspaceSwitch workspace={workspace} onWorkspace={onWorkspace} />
          <div className="crm-toolgrow" style={{ position: "relative", flex: "1 1 200px", maxWidth: 380 }}>
            <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: c.stone }} />
            <input value={query} onChange={(e) => setQuery(e.target.value)}
              placeholder="Search operators, regions, notes…" style={{ ...inputBase, paddingLeft: 34 }} />
          </div>
          <div style={{ display: "flex", gap: 2, background: "rgba(255,255,255,.06)", border: `1px solid ${c.line}`, borderRadius: radius.sm, padding: 3 }}>
            {[["directory", "Directory"], ["pipeline", "Pipeline"], ["tours", "Tours & pricing"]].map(([k, label]) => (
              <button key={k} onClick={() => setView(k)} style={{
                padding: "7px 14px", borderRadius: radius.sm - 4, border: "none", cursor: "pointer",
                fontFamily: FONT, fontSize: 13, fontWeight: 700,
                background: view === k ? c.gold : "transparent", color: view === k ? c.ink : c.stone,
              }}>
                {label}
              </button>
            ))}
          </div>
          <div style={{ flex: 1 }} className="ops-hide-mobile" />
          <button onClick={() => fileRef.current?.click()} style={headerBtn} title="Import operators from CSV">
            <Upload size={15} /> <span className="ops-hide-mobile">Import</span>
          </button>
          <input ref={fileRef} type="file" accept=".csv,text/csv" onChange={onImportFile} style={{ display: "none" }} />
          <button onClick={() => setShowAdd(true)} style={{ ...headerBtn, background: c.gold, borderColor: c.gold, color: c.ink, fontWeight: 800, boxShadow: shadow.glowGold }}>
            <Plus size={16} strokeWidth={3} /> Add operator
          </button>
          <button onClick={onSignOut} style={{ ...headerBtn, color: c.stone }}>Sign out</button>
        </div>

        {/* ── Stats ── */}
        <div className="ops-stats">
          {[
            { label: "Operators", value: stats.total, col: c.teal, onClick: clearFilters },
            { label: "🔥 Hot leads", value: stats.hot, col: stats.hot ? "#FB7042" : c.stone, onClick: () => { clearFilters(); setView("directory"); setTempFilter("Hot"); } },
            { label: "In motion", value: stats.inMotion, col: c.blue },
            { label: "Active partners", value: stats.active, col: "#34D399", onClick: () => { clearFilters(); setStageFilter("Active partner"); } },
            { label: "Outreach due", value: stats.due, col: stats.due ? "#F87171" : c.stone },
            { label: "Tours priced", value: stats.tours, col: c.gold, onClick: () => setView("tours") },
          ].map((s) => (
            <div key={s.label} onClick={s.onClick}
              style={{ padding: "12px 16px", borderRadius: radius.md, border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm, cursor: s.onClick ? "pointer" : "default" }}>
              <div style={{ fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".06em" }}>{s.label}</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: s.col, marginTop: 3 }}>{s.value}</div>
            </div>
          ))}
        </div>

        {/* ── Filters ── */}
        <div className="crm-filterbar" style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center", marginBottom: 14 }}>
          <select value={typeFilter} onChange={(e) => setTypeFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All types</option>
            {OPERATOR_TYPES.map((t) => <option key={t.key} value={t.key}>{t.emoji}  {t.label}</option>)}
          </select>
          <select value={tempFilter} onChange={(e) => setTempFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All heat</option>
            {[...TEMPERATURES].reverse().map((t) => <option key={t} value={t}>{TEMPERATURE_META[t].emoji}  {t}</option>)}
          </select>
          <select value={stageFilter} onChange={(e) => setStageFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All stages</option>
            {PARTNER_STAGES.map((s) => <option key={s} value={s}>{s}</option>)}
          </select>
          <select value={regionFilter} onChange={(e) => setRegionFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All regions</option>
            {regions.map((r) => <option key={r} value={r}>{r}</option>)}
          </select>
          <select value={categoryFilter} onChange={(e) => setCategoryFilter(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="">All categories</option>
            {categories.map((x) => <option key={x} value={x}>{x}</option>)}
          </select>
          <select value={`${sortKey}:${sortDir}`} onChange={(e) => { const [k, d] = e.target.value.split(":"); setSortKey(k); setSortDir(d); }}
            style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
            <option value="smart:asc">Sort: hottest first</option>
            <option value="name:asc">Sort: name A → Z</option>
            <option value="name:desc">Sort: name Z → A</option>
            <option value="fee:desc">Sort: referral fee (high → low)</option>
            <option value="stage:asc">Sort: stage</option>
            <option value="followup:asc">Sort: follow-up date</option>
          </select>
          {anyFilter && (
            <button onClick={clearFilters} style={{ ...headerBtn, padding: "7px 11px", color: c.teal }}>
              <X size={13} /> Clear
            </button>
          )}
          <span className="crm-filtercount" style={{ marginLeft: "auto", display: "inline-flex", alignItems: "center", gap: 6, padding: "5px 11px", borderRadius: radius.pill, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.04)", color: c.charcoal, fontSize: 12.5, fontWeight: 700 }}>
            <span style={{ color: c.teal }}>{filtered.length}</span>
            {anyFilter ? <span style={{ color: c.stone, fontWeight: 600 }}>of {operators.length} operators</span> : <span style={{ color: c.stone, fontWeight: 600 }}>operators</span>}
          </span>
        </div>

        {view === "directory" && (
          <>
            {due.length > 0 && (
              <div style={{ marginBottom: 14, padding: "12px 16px", borderRadius: radius.md, border: "1px solid rgba(248,113,113,.35)", background: "rgba(248,113,113,.07)" }}>
                <div style={{ fontWeight: 800, fontSize: 13.5, color: "#F87171", marginBottom: 8 }}>Outreach due</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                  {due.map((o) => (
                    <button key={o.id} onClick={() => setSelectedId(o.id)} style={{
                      display: "inline-flex", alignItems: "center", gap: 8, padding: "6px 12px", borderRadius: 999,
                      border: `1px solid ${c.line}`, background: c.white, color: c.charcoal, fontFamily: FONT,
                      fontSize: 12.5, fontWeight: 700, cursor: "pointer",
                    }}>
                      {o.name} <FollowUpCell iso={o.nextFollowUp} />
                    </button>
                  ))}
                </div>
              </div>
            )}
            <Directory operators={filtered} sortKey={sortKey} sortDir={sortDir} onSort={onSort} onOpen={setSelectedId} onStage={setStage} onLog={logTouch} onTemp={setTemp} onPreferred={togglePreferred} />
          </>
        )}
        {view === "pipeline" && <OpsPipeline operators={filtered} onOpen={setSelectedId} onStage={setStage} />}
        {view === "tours" && <ToursView categories={categories} regions={[...new Set(TOUR_SEED.map((t) => t.region))].sort()} onOpenOperator={(oid) => { const op = operators.find((o) => o.id === oid); if (op) setSelectedId(op.id); }} />}
      </div>

      {selected && (
        <OperatorDrawer op={selected} patch={patch} addNote={addNote} setStage={setStage} logTouch={logTouch}
          onPreviewPortal={() => setPortalOpId(selected.id)} onClose={() => setSelectedId(null)} />
      )}
      {portalOpId && (
        <OperatorPortal op={operators.find((o) => o.id === portalOpId)} onExit={() => setPortalOpId(null)} />
      )}
      {showAdd && (
        <AddOperatorModal
          onClose={() => setShowAdd(false)}
          onSave={(id, entry) => { setOverlay((ov) => patchOperator(ov, id, entry)); setShowAdd(false); setSelectedId(id); }}
        />
      )}
    </div>
  );
}

// ── Directory ── desktop table + mobile card list (same data, two layouts) ────
function StarButton({ on, onClick }) {
  return (
    <button
      onClick={(e) => { e.stopPropagation(); onClick(); }}
      title={on ? "Preferred partner" : "Mark preferred"}
      aria-label="Toggle preferred partner"
      style={{ all: "unset", cursor: "pointer", display: "inline-flex", color: on ? c.gold : c.stone, opacity: on ? 1 : 0.5 }}
    >
      <Star size={16} fill={on ? c.gold : "none"} />
    </button>
  );
}

function Directory({ operators, sortKey, sortDir, onSort, onOpen, onStage, onLog, onTemp, onPreferred }) {
  if (!operators.length) {
    return <div style={{ padding: 40, textAlign: "center", color: c.stone, background: c.white, borderRadius: radius.md, border: `1px solid ${c.line}` }}>No operators match these filters.</div>;
  }
  const cell = { padding: "10px 12px", fontSize: 13.5, verticalAlign: "middle", borderBottom: `1px solid ${c.line}`, whiteSpace: "nowrap", textAlign: "left" };
  // key: sort key (null = not sortable). Click a header to sort by it.
  const headers = [
    { label: "", key: null },
    { label: "Operator", key: "name" },
    { label: "Type", key: "type" },
    { label: "Heat", key: "heat" },
    { label: "Stage", key: "stage" },
    { label: "Follow-up", key: "followup" },
    { label: "Regions", key: null },
    { label: "Referral fee", key: "fee" },
    { label: "Checklist", key: "checklist" },
    { label: "Verified", key: null },
  ];
  return (
    <>
      {/* Desktop */}
      <div className="crm-desk" style={{ borderRadius: radius.md, border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm, overflow: "auto", maxHeight: "68vh" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1040 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2, background: c.canvas2 }}>
            <tr>
              {headers.map((h, i) => {
                const active = h.key && sortKey === h.key;
                return (
                  <th key={i} onClick={h.key ? () => onSort(h.key) : undefined}
                    style={{ ...cell, fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", userSelect: "none",
                      cursor: h.key ? "pointer" : "default", color: active ? c.teal : c.stone }}>
                    {h.label}{active ? (sortDir === "asc" ? " ↑" : " ↓") : ""}
                  </th>
                );
              })}
            </tr>
          </thead>
          <tbody>
            {operators.map((op) => {
              const prog = checklistProgress(op.checklist);
              return (
                <tr key={op.id} className="ops-row" onClick={() => onOpen(op.id)} style={{ cursor: "pointer" }}>
                  <td style={{ ...cell, paddingRight: 0 }}><StarButton on={op.preferred} onClick={() => onPreferred(op.id)} /></td>
                  <td style={cell}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, minWidth: 250, justifyContent: "space-between" }}>
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 700, overflow: "hidden", textOverflow: "ellipsis" }}>{op.name}</div>
                        <div style={{ color: c.stone, fontSize: 11.5 }}>{op.regions || op.contactType || (op.custom ? "Added manually" : "")}</div>
                      </div>
                      <ContactButtons op={op} onLog={onLog} size={14} />
                    </div>
                  </td>
                  <td style={cell}><TypeBadge type={op.type} small /></td>
                  <td style={cell}><TempPicker size="sm" value={op.temperature} onChange={(t) => onTemp(op.id, t)} /></td>
                  <td style={cell}><StageSelect compact value={op.stage} onChange={(s) => onStage(op.id, s)} /></td>
                  <td style={cell}><FollowUpCell iso={op.nextFollowUp} /></td>
                  <td style={{ ...cell, maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>{op.regions || "—"}</td>
                  <td style={{ ...cell, fontWeight: 700, color: c.gold }}>{pct(op.takeRate)}</td>
                  <td style={cell}>
                    <span style={{ fontSize: 12.5, fontWeight: 700, color: prog.done === prog.total ? "#34D399" : prog.done ? c.gold : c.stone }}>
                      {prog.done}/{prog.total}
                    </span>
                  </td>
                  <td style={cell}>
                    {op.verification
                      ? <span title={op.verification} style={{ display: "inline-flex", alignItems: "center", gap: 5, color: "#34D399", fontSize: 12, fontWeight: 700 }}><BadgeCheck size={14} /> Verified</span>
                      : <span style={{ color: c.stone }}>—</span>}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      {/* Mobile */}
      <div className="crm-mob" style={{ gap: 10 }}>
        {operators.map((op) => {
          const prog = checklistProgress(op.checklist);
          return (
            <div key={op.id} className="crm-mcard" onClick={() => onOpen(op.id)}>
              <div className="crm-mcard-top">
                <div style={{ minWidth: 0 }}>
                  <div className="crm-mcard-name" style={{ display: "flex", alignItems: "center", gap: 7 }}>
                    {op.preferred && <Star size={14} fill={c.gold} color={c.gold} style={{ flexShrink: 0 }} />}
                    <span style={{ overflow: "hidden", textOverflow: "ellipsis" }}>{op.name}</span>
                  </div>
                  <div className="crm-mcard-sub">{op.regions || "—"}</div>
                </div>
                <TempBadge temperature={op.temperature} small />
              </div>
              <div className="crm-mcard-meta">
                <TypeBadge type={op.type} small />
                <StageChip stage={op.stage} small />
                <span style={{ color: c.gold, fontWeight: 700, fontSize: 12.5 }}>{pct(op.takeRate)}</span>
                <span style={{ fontSize: 12, fontWeight: 700, color: prog.done === prog.total ? "#34D399" : c.stone }}>✓ {prog.done}/{prog.total}</span>
                {daysFromToday(op.nextFollowUp) !== null && <FollowUpCell iso={op.nextFollowUp} />}
              </div>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10 }}>
                <TempPicker size="sm" value={op.temperature} onChange={(t) => onTemp(op.id, t)} />
                <ContactButtons op={op} onLog={onLog} size={16} />
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

// ── Pipeline ──────────────────────────────────────────────────────────────────
function OpsPipeline({ operators, onOpen, onStage }) {
  const [dragOver, setDragOver] = useState(null);
  return (
    <div className="ops-kanban">
      {PARTNER_STAGES.map((stage) => {
        const col = PARTNER_STAGE_COLORS[stage];
        const cards = operators.filter((o) => o.stage === stage);
        return (
          <div key={stage}
            onDragOver={(e) => { e.preventDefault(); setDragOver(stage); }}
            onDragLeave={() => setDragOver((v) => (v === stage ? null : v))}
            onDrop={(e) => { e.preventDefault(); setDragOver(null); const id = e.dataTransfer.getData("text/plain"); if (id) onStage(id, stage); }}
            style={{
              flex: "0 0 250px", width: 250, borderRadius: radius.md, padding: 10, minHeight: 300,
              border: `1px solid ${dragOver === stage ? col : c.line}`,
              background: dragOver === stage ? `${col}14` : "rgba(255,255,255,.03)",
            }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "2px 4px 10px" }}>
              <StageChip stage={stage} />
              <span style={{ color: c.stone, fontSize: 12, fontWeight: 700 }}>{cards.length}</span>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cards.map((op) => (
                <div key={op.id} draggable
                  onDragStart={(e) => e.dataTransfer.setData("text/plain", op.id)}
                  onClick={() => onOpen(op.id)}
                  style={{ padding: "11px 12px", borderRadius: radius.sm, cursor: "grab", border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm }}>
                  <div style={{ fontWeight: 700, fontSize: 13.5 }}>{op.name}</div>
                  <div style={{ color: c.stone, fontSize: 12, margin: "3px 0 6px", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                    {op.regions || "—"}
                  </div>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                    <FollowUpCell iso={op.nextFollowUp} />
                    <span style={{ fontWeight: 700, fontSize: 12.5, color: c.gold }}>{pct(op.takeRate)}</span>
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

// ── Tours & pricing ───────────────────────────────────────────────────────────
function ToursView({ categories, regions, onOpenOperator }) {
  const [q, setQ] = useState("");
  const [region, setRegion] = useState("");
  const [category, setCategory] = useState("");
  const [showBench, setShowBench] = useState(false);

  const list = useMemo(() => {
    const query = q.trim().toLowerCase();
    return TOUR_SEED.filter((t) =>
      (!query || [t.product, t.operator, t.destination, t.category, t.inclusions].join(" ").toLowerCase().includes(query)) &&
      (!region || t.region === region) &&
      (!category || t.category === category));
  }, [q, region, category]);

  const cell = { padding: "9px 12px", fontSize: 13, verticalAlign: "middle", borderBottom: `1px solid ${c.line}`, whiteSpace: "nowrap", textAlign: "left" };
  return (
    <div style={{ display: "grid", gap: 12 }}>
      <div style={{ display: "flex", gap: 8, flexWrap: "wrap", alignItems: "center" }}>
        <div style={{ position: "relative", flex: "1 1 220px", maxWidth: 380 }}>
          <Search size={15} style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)", color: c.stone }} />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search 115 priced tours…" style={{ ...inputBase, paddingLeft: 34 }} />
        </div>
        <select value={region} onChange={(e) => setRegion(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
          <option value="">All regions</option>
          {regions.map((r) => <option key={r} value={r}>{r}</option>)}
        </select>
        <select value={category} onChange={(e) => setCategory(e.target.value)} style={{ ...inputBase, width: "auto", padding: "7px 10px", fontSize: 13 }}>
          <option value="">All categories</option>
          {categories.map((x) => <option key={x} value={x}>{x}</option>)}
        </select>
        <button onClick={() => setShowBench((v) => !v)} style={{
          display: "inline-flex", alignItems: "center", gap: 6, padding: "8px 12px", borderRadius: radius.sm,
          border: `1px solid ${c.line}`, background: "rgba(255,255,255,.05)", color: c.teal,
          fontFamily: FONT, fontSize: 13, fontWeight: 700, cursor: "pointer",
        }}>
          Category benchmarks {showBench ? <ChevronUp size={14} /> : <ChevronDown size={14} />}
        </button>
        <span style={{ color: c.stone, fontSize: 12.5, marginLeft: "auto" }}>{list.length} tours</span>
      </div>

      {showBench && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(210px, 1fr))", gap: 8 }}>
          {CATEGORY_BENCHMARKS.map((b) => (
            <div key={b.category} style={{ padding: "10px 13px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: c.white }}>
              <div style={{ fontWeight: 800, fontSize: 13 }}>{b.category} <span style={{ color: c.stone, fontWeight: 600 }}>· {b.skuCount} SKU{b.skuCount === 1 ? "" : "s"}</span></div>
              <div style={{ color: c.stone, fontSize: 12, marginTop: 3 }}>
                avg {money(b.avgRetail)} · range {money(b.low)}–{money(b.high)}
              </div>
              <div style={{ color: c.gold, fontSize: 12, fontWeight: 700, marginTop: 3 }}>{b.approach}</div>
            </div>
          ))}
        </div>
      )}

      <div style={{ borderRadius: radius.md, border: `1px solid ${c.line}`, background: c.white, boxShadow: shadow.sm, overflow: "auto", maxHeight: "62vh" }}>
        <table style={{ borderCollapse: "collapse", width: "100%", minWidth: 1000 }}>
          <thead style={{ position: "sticky", top: 0, zIndex: 2, background: c.canvas2 }}>
            <tr>
              {["Tour", "Operator", "Where", "Category", "Retail", "Resident", "Child", "Fee %", "Op. net", "Duration", "Source"].map((h) => (
                <th key={h} style={{ ...cell, fontSize: 11.5, fontWeight: 800, textTransform: "uppercase", letterSpacing: ".05em", color: c.stone }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {list.map((t) => (
              <tr key={t.id} className="ops-row">
                <td style={{ ...cell, maxWidth: 240, overflow: "hidden", textOverflow: "ellipsis", fontWeight: 700 }} title={t.inclusions || t.product}>{t.product}</td>
                <td style={cell}>
                  <button onClick={() => onOpenOperator(t.operatorId)} style={{ all: "unset", cursor: "pointer", color: c.teal, fontWeight: 600, fontSize: 13 }}>
                    {t.operator}
                  </button>
                </td>
                <td style={{ ...cell, maxWidth: 170, overflow: "hidden", textOverflow: "ellipsis" }}>{t.destination}</td>
                <td style={cell}>{t.category}</td>
                <td style={{ ...cell, fontWeight: 700 }}>{money(t.retail)}</td>
                <td style={{ ...cell, color: t.resident !== null ? "#34D399" : c.stone }}>{money(t.resident)}</td>
                <td style={cell}>{money(t.child)}</td>
                <td style={{ ...cell, color: c.gold, fontWeight: 700 }}>{pct(t.suggestedFeePct)}</td>
                <td style={cell}>{money(t.suggestedOperatorNet)}</td>
                <td style={{ ...cell, maxWidth: 140, overflow: "hidden", textOverflow: "ellipsis" }}>{t.duration || "—"}</td>
                <td style={cell}>
                  {t.sourceUrl && (
                    <a href={t.sourceUrl} target="_blank" rel="noreferrer" title={`Confidence: ${t.confidence || "?"}`} style={{ color: c.stone }}>
                      <ExternalLink size={14} />
                    </a>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ── Team ↔ operator messages (team side of the same thread the operator sees
// in their portal). Shared via portal-store. ─────────────────────────────────
function TeamMessages({ op }) {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState("");
  useEffect(() => { setMessages(loadPortal(op.id).messages); }, [op.id]);
  const send = () => {
    const t = draft.trim();
    if (!t) return;
    setMessages(addMessage(op.id, "team", t));
    setDraft("");
  };
  const opLabel = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 };
  return (
    <div>
      <div style={{ ...opLabel, display: "flex", alignItems: "center", gap: 6 }}>
        <MessageCircle size={13} /> Messages with {op.name}
      </div>
      <div style={{ borderRadius: radius.md, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.03)", padding: 10, display: "grid", gap: 8, maxHeight: 220, overflowY: "auto" }}>
        {messages.length ? messages.map((m) => {
          const team = m.from === "team";
          return (
            <div key={m.id} style={{ display: "flex", justifyContent: team ? "flex-end" : "flex-start" }}>
              <div style={{ maxWidth: "82%", padding: "8px 11px", borderRadius: 12, fontSize: 13, lineHeight: 1.4,
                background: team ? c.teal : "rgba(255,255,255,.06)", color: team ? c.ink : c.charcoal, border: team ? "none" : `1px solid ${c.line}` }}>
                <div style={{ fontSize: 10, fontWeight: 800, opacity: .7, marginBottom: 2 }}>{team ? "You (TicoWild)" : op.name}</div>
                {m.text}
              </div>
            </div>
          );
        }) : <div style={{ color: c.stone, fontSize: 12.5, textAlign: "center", padding: "14px 0" }}>No messages yet. Send the first — it appears in their portal.</div>}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
        <input value={draft} onChange={(e) => setDraft(e.target.value)} onKeyDown={(e) => { if (e.key === "Enter") send(); }}
          placeholder={`Message ${op.name}…`} style={inputBase} />
        <button onClick={send} style={{ padding: "0 14px", borderRadius: radius.sm, border: "none", background: c.teal, color: c.ink, fontWeight: 800, cursor: "pointer", display: "inline-flex", alignItems: "center" }}><Send size={15} /></button>
      </div>
    </div>
  );
}

// Agreement status (read from the portal store the operator signs against), so
// the team sees signed/completed exactly as the operator does.
function AgreementStatus({ op }) {
  const [agreement, setAgreement] = useState({ status: "Not sent" });
  useEffect(() => { setAgreement(loadPortal(op.id).agreement || { status: "Not sent" }); }, [op.id]);
  const signed = agreement.status === "Signed";
  return (
    <div style={{ display: "flex", alignItems: "center", gap: 10, padding: "11px 13px", borderRadius: radius.md,
      border: `1px solid ${signed ? "rgba(52,211,153,.4)" : c.line}`, background: signed ? "rgba(52,211,153,.08)" : "rgba(255,255,255,.03)" }}>
      <BadgeCheck size={18} color={signed ? "#34D399" : c.stone} />
      <div style={{ flex: 1 }}>
        <div style={{ fontSize: 12.5, fontWeight: 800 }}>Partner agreement</div>
        <div style={{ fontSize: 12, fontWeight: 700, color: signed ? "#34D399" : c.stone }}>
          {signed ? `✓ Signed & completed by ${agreement.signedName} on ${fmtDate(agreement.signedAt)}` : "Not signed yet"}
        </div>
      </div>
    </div>
  );
}

// ── Operator drawer ───────────────────────────────────────────────────────────
function OperatorDrawer({ op, patch, addNote, setStage, logTouch, onPreviewPortal, onClose }) {
  const [noteDraft, setNoteDraft] = useState("");
  const tours = useMemo(() => TOUR_SEED.filter((t) => t.operatorId === op.id), [op.id]);
  const prog = checklistProgress(op.checklist);
  const notes = [...(op.notes || [])].reverse();
  const wa = normPhone(op.whatsapp || "");
  const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 };
  const bigAction = (bg, color, border, enabled) => ({
    flex: 1, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 7,
    padding: "10px 8px", borderRadius: radius.sm, border: `1px solid ${border}`, background: bg,
    color, fontFamily: FONT, fontSize: 13, fontWeight: 700, textDecoration: "none",
    cursor: "pointer", opacity: enabled ? 1 : 0.4, pointerEvents: enabled ? "auto" : "none",
  });

  return (
    <>
      <div onClick={onClose} style={{ position: "fixed", inset: 0, zIndex: 49, background: "rgba(4,10,20,.45)" }} />
      <div className="ops-drawer">
        <div style={{ padding: "16px 20px 12px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <div style={{ fontSize: 19, fontWeight: 800, flex: 1, minWidth: 0, overflow: "hidden", textOverflow: "ellipsis" }}>{op.name}</div>
            <StageSelect compact value={op.stage} onChange={(s) => setStage(op.id, s)} />
            <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}><X size={20} /></button>
          </div>
          <div style={{ color: c.stone, fontSize: 12.5, marginTop: 3 }}>
            {op.regions || "—"} · {op.tourCount} priced tour{op.tourCount === 1 ? "" : "s"} ·{" "}
            <span style={{ color: c.gold, fontWeight: 700 }}>{pct(op.takeRate)} referral fee</span>
            {op.verification && (
              <span style={{ marginLeft: 8, color: "#34D399", fontWeight: 700 }}>
                <BadgeCheck size={12} style={{ verticalAlign: -2 }} /> {op.verification}
              </span>
            )}
          </div>
          <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
            <a href={wa ? `https://wa.me/${wa}` : undefined} target="_blank" rel="noreferrer"
              onClick={() => wa && logTouch(op.id, "WhatsApp opened")}
              style={bigAction("rgba(37,211,102,.12)", "#25D366", "rgba(37,211,102,.4)", !!wa)}>
              <MessageCircle size={15} /> WhatsApp
            </a>
            <a href={op.email ? `mailto:${op.email}` : undefined}
              onClick={() => op.email && logTouch(op.id, "Email opened")}
              style={bigAction("rgba(34,211,238,.1)", c.teal, "rgba(34,211,238,.35)", !!op.email)}>
              <Mail size={15} /> Email
            </a>
            <a href={op.phone ? `tel:${op.phone}` : undefined}
              onClick={() => op.phone && logTouch(op.id, "Call started")}
              style={bigAction("rgba(127,166,232,.1)", c.blue, "rgba(127,166,232,.35)", !!op.phone)}>
              <Phone size={15} /> Call
            </a>
            <a href={op.website || op.contactUrl || undefined} target="_blank" rel="noreferrer"
              style={bigAction("rgba(255,255,255,.05)", c.stone, c.line, !!(op.website || op.contactUrl))}>
              <Globe size={15} /> Site
            </a>
          </div>
          <button onClick={onPreviewPortal}
            style={{ marginTop: 10, width: "100%", display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "11px", borderRadius: radius.sm, border: `1px solid ${c.teal}`, background: "rgba(34,211,238,.1)", color: c.teal, fontFamily: FONT, fontSize: 13.5, fontWeight: 800, cursor: "pointer" }}>
            <Eye size={16} /> Preview partner portal
          </button>
        </div>

        <div style={{ flex: 1, overflowY: "auto", padding: "16px 20px 24px", display: "grid", gap: 16 }}>
          {/* agreement status (signed in their portal) */}
          <AgreementStatus op={op} />

          {/* team ↔ operator messages */}
          <TeamMessages op={op} />

          {/* priority + type */}
          <div style={{ display: "grid", gap: 10, padding: 12, borderRadius: radius.md, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.03)" }}>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", gap: 10, flexWrap: "wrap" }}>
              <div>
                <div style={label}>Lead heat</div>
                <TempPicker labels value={op.temperature} onChange={(t) => patch(op.id, { temperature: t })} />
              </div>
              <button
                onClick={() => patch(op.id, { preferred: !op.preferred })}
                style={{
                  display: "inline-flex", alignItems: "center", gap: 7, padding: "8px 13px", borderRadius: radius.sm,
                  border: `1px solid ${op.preferred ? c.gold : c.line}`, background: op.preferred ? "rgba(255,208,0,.12)" : "transparent",
                  color: op.preferred ? c.gold : c.stone, fontFamily: FONT, fontSize: 12.5, fontWeight: 800, cursor: "pointer",
                }}>
                <Star size={15} fill={op.preferred ? c.gold : "none"} /> {op.preferred ? "Preferred partner" : "Mark preferred"}
              </button>
            </div>
            <div className="ops-grid2">
              <div>
                <div style={label}>Vendor type</div>
                <TypeSelect value={op.type} onChange={(t) => patch(op.id, { type: t })} />
              </div>
              <div>
                <div style={label}>Owner</div>
                <input value={op.owner || ""} onChange={(e) => patch(op.id, { owner: e.target.value })} placeholder="Who's handling this?" style={inputBase} />
              </div>
            </div>
          </div>

          {/* contacts + follow-up */}
          <div className="ops-grid2">
            <div>
              <div style={label}>Contacts</div>
              <div style={{ fontSize: 13, display: "grid", gap: 4, color: c.charcoal }}>
                {op.phone && <div>📞 {op.phone}</div>}
                {op.phone2 && <div>📞 {op.phone2}</div>}
                {op.whatsapp && <div>💬 {op.whatsapp}</div>}
                {op.email && <div>✉️ {op.email}</div>}
                {op.b2bEmail && <div>🏢 {op.b2bEmail}</div>}
                {op.contactNotes && <div style={{ color: c.gold, fontSize: 12 }}><AlertTriangle size={11} style={{ verticalAlign: -1 }} /> {op.contactNotes}</div>}
                {op.lastVerified && <div style={{ color: c.stone, fontSize: 12 }}>verified {fmtDate(op.lastVerified)}</div>}
              </div>
            </div>
            <div>
              <div style={label}>Next follow-up</div>
              <input type="date" value={op.nextFollowUp || ""} onChange={(e) => patch(op.id, { nextFollowUp: e.target.value })} style={inputBase} />
              <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                {[["Today", 0], ["+1d", 1], ["+3d", 3], ["+1w", 7], ["+1mo", 30]].map(([lab, d]) => (
                  <button key={lab} onClick={() => patch(op.id, { nextFollowUp: addDaysIso(d) })}
                    style={{ padding: "4px 10px", borderRadius: 8, border: `1px solid ${c.line}`, background: "transparent", color: c.teal, fontFamily: FONT, fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                    {lab}
                  </button>
                ))}
              </div>
              <div style={{ color: c.stone, fontSize: 12, marginTop: 8 }}>
                Last touch: <b style={{ color: op.lastContacted ? c.charcoal : "#F87171" }}>{op.lastContacted ? fmtDate(op.lastContacted) : "never"}</b>
              </div>
              <div style={{ marginTop: 8 }}>
                <div style={label}>Agreed referral fee</div>
                <input
                  value={op.takeRate === null || op.takeRate === undefined ? "" : Math.round(op.takeRate * 100)}
                  onChange={(e) => { const n = Number(e.target.value); patch(op.id, { takeRate: Number.isFinite(n) && e.target.value !== "" ? n / 100 : null }); }}
                  inputMode="numeric" placeholder="%" style={{ ...inputBase, width: 90 }}
                />
              </div>
            </div>
          </div>

          {/* checklist */}
          <div>
            <div style={{ ...label, display: "flex", justifyContent: "space-between" }}>
              <span>Outreach checklist</span>
              <span style={{ color: prog.done === prog.total ? "#34D399" : c.gold }}>{prog.done}/{prog.total}</span>
            </div>
            {["Pricing", "Operations"].map((group) => (
              <div key={group} style={{ marginBottom: 8 }}>
                <div style={{ fontSize: 11, fontWeight: 700, color: c.stone, margin: "6px 0 4px" }}>{group.toUpperCase()}</div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
                  {OUTREACH_CHECKLIST.filter((i) => i.group === group).map((item) => {
                    const on = !!op.checklist?.[item.key];
                    return (
                      <button key={item.key}
                        onClick={() => patch(op.id, { checklist: { ...op.checklist, [item.key]: !on } })}
                        style={{
                          padding: "6px 11px", borderRadius: 999, fontFamily: FONT, fontSize: 12, fontWeight: 600,
                          cursor: "pointer", border: `1px solid ${on ? "rgba(52,211,153,.5)" : c.line}`,
                          background: on ? "rgba(52,211,153,.12)" : "transparent", color: on ? "#34D399" : c.stone,
                        }}>
                        {on ? "✓ " : ""}{item.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>

          {/* their tours */}
          {tours.length > 0 && (
            <div>
              <div style={label}>Their tours & your margin ({tours.length})</div>
              <div style={{ display: "grid", gap: 6 }}>
                {tours.map((t) => (
                  <div key={t.id} style={{ padding: "9px 12px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "rgba(255,255,255,.04)", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
                    <div style={{ flex: "1 1 160px", minWidth: 0 }}>
                      <div style={{ fontWeight: 700, fontSize: 13 }}>{t.product}</div>
                      <div style={{ color: c.stone, fontSize: 11.5 }}>{t.category} · {t.destination}{t.duration ? ` · ${t.duration}` : ""}</div>
                    </div>
                    <div style={{ fontSize: 12.5, whiteSpace: "nowrap" }}>
                      retail <b>{money(t.retail)}</b>
                      {t.resident !== null && <span style={{ color: "#34D399" }}> · local <b>{money(t.resident)}</b></span>}
                      <span style={{ color: c.gold }}> · fee <b>{pct(t.suggestedFeePct)}</b></span>
                      <span style={{ color: c.stone }}> · net <b>{money(t.suggestedOperatorNet)}</b></span>
                    </div>
                    {t.sourceUrl && <a href={t.sourceUrl} target="_blank" rel="noreferrer" style={{ color: c.stone }}><ExternalLink size={13} /></a>}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* notes */}
          <div>
            <div style={label}>Notes & history</div>
            <div style={{ display: "flex", gap: 8 }}>
              <input value={noteDraft} onChange={(e) => setNoteDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter" && noteDraft.trim()) { addNote(op.id, noteDraft.trim()); setNoteDraft(""); } }}
                placeholder="Add a note + Enter (marks touched today)" style={inputBase} />
              <button onClick={() => { if (noteDraft.trim()) { addNote(op.id, noteDraft.trim()); setNoteDraft(""); } }}
                style={{ padding: "0 14px", borderRadius: radius.sm, border: "none", background: c.gold, color: c.ink, fontWeight: 800, fontFamily: FONT, cursor: "pointer" }}>
                Add
              </button>
            </div>
            <div style={{ marginTop: 10, display: "grid", gap: 8 }}>
              {notes.length ? notes.map((n) => (
                <div key={n.id} style={{ padding: "9px 12px", borderRadius: radius.sm, background: "rgba(255,255,255,.04)", border: `1px solid ${c.line}` }}>
                  <div style={{ color: c.stone, fontSize: 11.5, marginBottom: 3 }}>
                    {new Date(n.at).toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })}
                  </div>
                  <div style={{ fontSize: 13.5, lineHeight: 1.45, whiteSpace: "pre-wrap" }}>{n.text}</div>
                </div>
              )) : <div style={{ color: c.stone, fontSize: 13 }}>{op.outreachNotes || "No notes yet."}</div>}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

// ── Add operator ──────────────────────────────────────────────────────────────
function AddOperatorModal({ onClose, onSave }) {
  const [f, setF] = useState({ name: "", type: "tours", temperature: "", regions: "", categories: "", phone: "", whatsapp: "", email: "", website: "" });
  const set = (k) => (e) => setF((x) => ({ ...x, [k]: e.target.value }));
  const canSave = f.name.trim().length > 0;
  const label = { fontSize: 11.5, fontWeight: 700, color: c.stone, textTransform: "uppercase", letterSpacing: ".05em", marginBottom: 5 };
  return (
    <div onMouseDown={(e) => { if (e.target === e.currentTarget) onClose(); }}
      style={{ position: "fixed", inset: 0, background: "rgba(4,10,20,.6)", zIndex: 60, display: "flex", alignItems: "flex-start", justifyContent: "center", overflowY: "auto", padding: "6vh 12px" }}>
      <div style={{ width: "min(560px, 100%)", borderRadius: radius.lg, border: `1px solid ${c.line}`, background: c.canvas2, boxShadow: shadow.xl }}>
        <div style={{ display: "flex", alignItems: "center", padding: "16px 20px", borderBottom: `1px solid ${c.line}` }}>
          <div style={{ fontSize: 17, fontWeight: 800, flex: 1 }}>Add operator</div>
          <button onClick={onClose} aria-label="Close" style={{ all: "unset", cursor: "pointer", color: c.stone, display: "flex", padding: 6 }}><X size={20} /></button>
        </div>
        <div style={{ padding: 20, display: "grid", gap: 12 }}>
          <div className="ops-grid2">
            <label><div style={label}>Name *</div><input autoFocus value={f.name} onChange={set("name")} style={inputBase} /></label>
            <label><div style={label}>Vendor type</div><TypeSelect value={f.type} onChange={(t) => setF((x) => ({ ...x, type: t }))} /></label>
            <label style={{ gridColumn: "1 / -1" }}>
              <div style={label}>Lead heat</div>
              <TempPicker labels value={f.temperature} onChange={(t) => setF((x) => ({ ...x, temperature: t }))} />
            </label>
            <label><div style={label}>Regions</div><input value={f.regions} onChange={set("regions")} style={inputBase} placeholder="Guanacaste, Arenal…" /></label>
            <label><div style={label}>Categories</div><input value={f.categories} onChange={set("categories")} style={inputBase} placeholder="Zipline, Rafting" /></label>
            <label><div style={label}>Phone</div><input value={f.phone} onChange={set("phone")} style={inputBase} /></label>
            <label><div style={label}>WhatsApp</div><input value={f.whatsapp} onChange={set("whatsapp")} style={inputBase} /></label>
            <label><div style={label}>Email</div><input value={f.email} onChange={set("email")} style={inputBase} /></label>
            <label><div style={label}>Website</div><input value={f.website} onChange={set("website")} style={inputBase} /></label>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, justifyContent: "flex-end", padding: "14px 20px", borderTop: `1px solid ${c.line}` }}>
          <button onClick={onClose} style={{ padding: "10px 16px", borderRadius: radius.sm, border: `1px solid ${c.line}`, background: "transparent", color: c.stone, fontFamily: FONT, fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>Cancel</button>
          <button disabled={!canSave}
            onClick={() => {
              const id = `custom-${Date.now().toString(36)}`;
              onSave(id, {
                custom: true,
                name: f.name.trim(),
                type: f.type,
                temperature: f.temperature,
                regions: f.regions.trim(),
                categories: f.categories.split(",").map((x) => x.trim()).filter(Boolean),
                phone: f.phone.trim(),
                whatsapp: f.whatsapp.trim(),
                email: f.email.trim(),
                website: f.website.trim(),
                stage: "Not contacted",
                notes: [],
                checklist: {},
              });
            }}
            style={{
              padding: "10px 18px", borderRadius: radius.sm, border: "none",
              background: canSave ? c.gold : "rgba(255,255,255,.12)", color: canSave ? c.ink : c.stone,
              fontFamily: FONT, fontWeight: 800, fontSize: 13.5, cursor: canSave ? "pointer" : "default",
            }}>
            Save operator
          </button>
        </div>
      </div>
    </div>
  );
}
