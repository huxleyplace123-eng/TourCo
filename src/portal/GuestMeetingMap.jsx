import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import "./guest-meeting-map.css";

const validPoint = (point) => Number.isFinite(Number(point?.lat)) && Number.isFinite(Number(point?.lng));

export const guestDirectionsUrl = (booking) => {
  const point = booking?.meetingPoint;
  const destination = validPoint(point)
    ? `${Number(point.lat)},${Number(point.lng)}`
    : point?.name || booking?.meet || "";
  if (!destination) return "";
  return `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(destination)}`;
};

export default function GuestMeetingMap({ booking }) {
  const node = useRef(null);
  const point = booking?.meetingPoint;

  useEffect(() => {
    if (!node.current || !validPoint(point)) return undefined;
    const position = [Number(point.lat), Number(point.lng)];
    const map = L.map(node.current, { zoomControl: false, attributionControl: true, scrollWheelZoom: false }).setView(position, 14);
    L.control.zoom({ position: "bottomright" }).addTo(map);
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}", {
      maxZoom: 19,
      attribution: 'Tiles &copy; <a href="https://www.esri.com/">Esri</a>',
    }).addTo(map);
    const icon = L.divIcon({
      className: "guest-meeting-pin-shell",
      html: `<span class="guest-meeting-pin"><i></i>${String(point.name || booking.name || "Meeting point").replace(/[<>&"]/g, "")}</span>`,
      iconSize: [220, 38],
      iconAnchor: [18, 34],
    });
    L.marker(position, { icon }).addTo(map);
    const timer = window.setTimeout(() => map.invalidateSize(), 80);
    return () => { window.clearTimeout(timer); map.remove(); };
  }, [booking?.id, point?.lat, point?.lng, point?.name]);

  if (!validPoint(point)) return null;
  return <div ref={node} className="guest-meeting-map" aria-label={`Map to ${point.name || booking.meet || "your meeting point"}`} />;
}
