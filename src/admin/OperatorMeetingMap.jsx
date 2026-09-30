import { useEffect, useMemo, useRef, useState } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { Crosshair, ExternalLink, MapPin, Navigation, UsersRound, X } from "lucide-react";
import { c, FONT, radius, shadow } from "../theme.js";
import "./operator-map.css";

const COSTA_RICA = [9.7489, -83.7534];
const DEFAULT_ZOOM = 7;

export const hasMeetingPoint = (operator) => {
  const point = operator?.meetingPoint;
  return Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng));
};

const cleanPoint = (point = {}) => ({
  name: String(point.name || ""),
  lat: point.lat === "" || point.lat === null || point.lat === undefined ? "" : Number(point.lat),
  lng: point.lng === "" || point.lng === null || point.lng === undefined ? "" : Number(point.lng),
  instructions: String(point.instructions || ""),
});

const mapUrl = (point) => {
  if (!Number.isFinite(Number(point?.lat)) || !Number.isFinite(Number(point?.lng))) return "";
  return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(`${Number(point.lat)},${Number(point.lng)}`)}`;
};

function createMap(node, point, zoom = DEFAULT_ZOOM) {
  const hasPoint = Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng));
  const map = L.map(node, { zoomControl: false, attributionControl: true }).setView(
    hasPoint ? [Number(point.lat), Number(point.lng)] : COSTA_RICA,
    hasPoint ? 13 : zoom,
  );
  L.control.zoom({ position: "bottomright" }).addTo(map);
  L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
    maxZoom: 19,
    attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
  }).addTo(map);
  return map;
}

function pinIcon(active, selected = false) {
  return L.divIcon({
    className: "tw-leaflet-pin-shell",
    html: `<span class="tw-map-dot ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}"></span>`,
    iconSize: [26, 34],
    iconAnchor: [13, 31],
  });
}

function companyIcon(operator, selected) {
  const active = operator.stage === "Active partner";
  const safeName = String(operator.name || "Tour operator").replace(/[&<>'"]/g, (char) => ({
    "&": "&amp;", "<": "&lt;", ">": "&gt;", "'": "&#39;", '"': "&quot;",
  })[char]);
  return L.divIcon({
    className: "tw-company-marker-shell",
    html: `<button class="tw-company-marker ${active ? "is-active" : ""} ${selected ? "is-selected" : ""}" type="button"><span></span>${safeName}</button>`,
    iconSize: [190, 44],
    iconAnchor: [18, 39],
  });
}

export function MeetingPointPicker({ value, onChange, compact = false }) {
  const point = cleanPoint(value);
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const markerRef = useRef(null);
  const onChangeRef = useRef(onChange);
  const pointRef = useRef(point);
  onChangeRef.current = onChange;
  pointRef.current = point;

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    const map = createMap(mapNode.current, point);
    mapRef.current = map;
    map.on("click", ({ latlng }) => onChangeRef.current({
      ...pointRef.current, lat: Number(latlng.lat.toFixed(6)), lng: Number(latlng.lng.toFixed(6)),
    }));
    window.setTimeout(() => map.invalidateSize(), 0);
    return () => { map.remove(); mapRef.current = null; markerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;
    const valid = Number.isFinite(Number(point.lat)) && Number.isFinite(Number(point.lng));
    if (!valid) {
      if (markerRef.current) markerRef.current.remove();
      markerRef.current = null;
      return;
    }
    const latlng = [Number(point.lat), Number(point.lng)];
    if (!markerRef.current) {
      markerRef.current = L.marker(latlng, { icon: pinIcon(true, true), draggable: true }).addTo(map);
      markerRef.current.on("dragend", (event) => {
        const next = event.target.getLatLng();
        onChangeRef.current({ ...pointRef.current, lat: Number(next.lat.toFixed(6)), lng: Number(next.lng.toFixed(6)) });
      });
    } else markerRef.current.setLatLng(latlng);
    map.panTo(latlng, { animate: true });
  }, [point.lat, point.lng]);

  const setField = (key) => (event) => onChange({ ...point, [key]: event.target.value });
  const clearPin = () => onChange({ ...point, lat: "", lng: "" });
  return (
    <div className={`tw-point-picker ${compact ? "is-compact" : ""}`}>
      <div className="tw-point-copy">
        <div><MapPin size={18} /><span><b>Tour meeting point</b><small>Drop the pin where guests actually meet—not at the company office.</small></span></div>
        {hasMeetingPoint({ meetingPoint: point }) && <button type="button" onClick={clearPin}>Clear pin</button>}
      </div>
      <input value={point.name} onChange={setField("name")} placeholder="Meeting point name, e.g. Playa Flamingo Marina" />
      <div className="tw-point-map" ref={mapNode} aria-label="Choose tour meeting point on map" />
      <div className="tw-coordinate-row">
        <span><Crosshair size={13} /> {hasMeetingPoint({ meetingPoint: point }) ? `${Number(point.lat).toFixed(5)}, ${Number(point.lng).toFixed(5)}` : "Click the map to place the exact meeting pin"}</span>
        {mapUrl(point) ? (
          <a className="tw-record-location-link" href={mapUrl(point)} target="_blank" rel="noreferrer">
            <ExternalLink size={13} /> Open exact location
          </a>
        ) : <span>Drag to fine-tune</span>}
      </div>
      <textarea value={point.instructions} onChange={setField("instructions")} placeholder="Pickup landmark or instructions guests need to know" />
    </div>
  );
}

export function OperatorMapView({ operators, onOpen }) {
  const [partnersOnly, setPartnersOnly] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const mapNode = useRef(null);
  const mapRef = useRef(null);
  const layerRef = useRef(null);
  const pinned = useMemo(() => operators.filter(hasMeetingPoint), [operators]);
  const unpinned = operators.length - pinned.length;
  const visible = useMemo(
    () => (partnersOnly ? pinned.filter((operator) => operator.stage === "Active partner") : pinned),
    [pinned, partnersOnly],
  );

  useEffect(() => {
    if (!mapNode.current || mapRef.current) return undefined;
    mapRef.current = createMap(mapNode.current, {}, DEFAULT_ZOOM);
    layerRef.current = L.layerGroup().addTo(mapRef.current);
    window.setTimeout(() => mapRef.current?.invalidateSize(), 0);
    return () => { mapRef.current?.remove(); mapRef.current = null; layerRef.current = null; };
  }, []);

  useEffect(() => {
    const map = mapRef.current;
    const layer = layerRef.current;
    if (!map || !layer) return;
    layer.clearLayers();
    const bounds = [];
    const markers = [];
    visible.forEach((operator) => {
      const position = [Number(operator.meetingPoint.lat), Number(operator.meetingPoint.lng)];
      bounds.push(position);
      const marker = L.marker(position, { icon: pinIcon(operator.stage === "Active partner", operator.id === selectedId), riseOnHover: true }).addTo(layer);
      marker.on("click", () => setSelectedId(operator.id));
      markers.push({ marker, operator });
    });
    const refreshMarkerStyle = () => {
      const showCompanyNames = map.getZoom() >= 9;
      markers.forEach(({ marker, operator }) => {
        const isSelected = operator.id === selectedId;
        marker.setIcon(showCompanyNames || isSelected
          ? companyIcon(operator, isSelected)
          : pinIcon(operator.stage === "Active partner", isSelected));
      });
    };
    map.on("zoomend", refreshMarkerStyle);
    const selectedOperator = visible.find((operator) => operator.id === selectedId);
    if (selectedOperator) map.flyTo([Number(selectedOperator.meetingPoint.lat), Number(selectedOperator.meetingPoint.lng)], 13, { animate: true, duration: 0.8 });
    else if (bounds.length === 1) map.setView(bounds[0], 12, { animate: true });
    else if (bounds.length > 1) map.setView(COSTA_RICA, DEFAULT_ZOOM, { animate: true });
    else map.setView(COSTA_RICA, DEFAULT_ZOOM);
    window.setTimeout(refreshMarkerStyle, 0);
    return () => map.off("zoomend", refreshMarkerStyle);
  }, [visible, selectedId]);

  useEffect(() => {
    if (!selectedId || !window.matchMedia("(max-width: 900px)").matches) return;
    const timer = window.setTimeout(() => {
      mapNode.current?.parentElement?.scrollIntoView({ behavior: "smooth", block: "start" });
    }, 80);
    return () => window.clearTimeout(timer);
  }, [selectedId]);

  const selected = visible.find((operator) => operator.id === selectedId) || null;
  return (
    <section className="tw-operator-map-card">
      <div className="tw-map-rail">
        <div className="tw-map-heading">
          <div className="tw-map-kicker"><Navigation size={13} /> LIVE PARTNER COVERAGE</div>
          <h2>{visible.length} tour meeting points across Costa Rica</h2>
          <p>Choose a company to see its exact guest meeting spot and open the full operator record.</p>
        </div>
        <div className="tw-map-toggles">
          <button className={partnersOnly ? "active" : ""} onClick={() => setPartnersOnly(true)}>Active partners</button>
          <button className={!partnersOnly ? "active" : ""} onClick={() => setPartnersOnly(false)}>All pinned</button>
        </div>
        <div className="tw-map-stats">
          <div><b>{visible.length}</b><span>showing</span></div>
          <div><b>{pinned.length}</b><span>pinned</span></div>
          <div><b>{unpinned}</b><span>need a pin</span></div>
        </div>
        <div className="tw-map-list">
          {visible.map((operator) => (
            <button key={operator.id} className={selectedId === operator.id ? "active" : ""} onClick={() => setSelectedId(operator.id)}>
              <span className={operator.stage === "Active partner" ? "partner-dot active" : "partner-dot"} />
              <span><b>{operator.name}</b><small>{operator.meetingPoint.name || operator.regions || "Meeting point pinned"}</small></span>
              <MapPin size={15} />
            </button>
          ))}
          {!visible.length && (
            <div className="tw-map-empty"><UsersRound size={25} /><b>{partnersOnly ? "No active partners are pinned yet." : "No meeting points are pinned yet."}</b><span>Open an operator and add their exact tour meeting point. Their company name will appear here automatically.</span></div>
          )}
        </div>
      </div>
      <div className="tw-map-stage">
        <div ref={mapNode} className="tw-operator-map" aria-label="Costa Rica tour operator meeting points" />
        <div className="tw-map-legend"><span className="legend-active" /> Active partner <span className="legend-lead" /> Pinned prospect</div>
        {selected && (
          <button className="tw-map-clear-selection" type="button" onClick={() => setSelectedId(null)} aria-label="Close selected operator">
            <X size={17} /> <span>Close</span>
          </button>
        )}
        {selected && (
          <div className="tw-map-selection">
            <button onClick={() => setSelectedId(null)} aria-label="Close map card"><X size={19} /></button>
            <div className="tw-map-selection-kicker">TOUR MEETING POINT</div>
            <h3>{selected.name}</h3>
            <p><MapPin size={14} /> {selected.meetingPoint.name || "Pinned location"}</p>
            {selected.meetingPoint.verified && <div className="tw-verified-place">✓ Location verified</div>}
            {selected.meetingPoint.instructions && <small>{selected.meetingPoint.instructions}</small>}
            <a className="tw-map-location-link" href={mapUrl(selected.meetingPoint)} target="_blank" rel="noreferrer">
              <ExternalLink size={14} /> Open exact location
            </a>
            <button className="tw-open-record" onClick={() => onOpen(selected.id)}>Open operator record</button>
          </div>
        )}
      </div>
    </section>
  );
}
