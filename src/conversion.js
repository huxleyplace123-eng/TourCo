import { hasSupabase, supabase } from "./portal/supabase.js";

const teamWhatsApp = String(import.meta.env.VITE_TICOWILD_WHATSAPP || "").replace(/\D/g, "");
const teamEmail = String(import.meta.env.VITE_TICOWILD_EMAIL || "hello@ticowild.com").trim();

export function whatsappHref(message) {
  return teamWhatsApp ? `https://wa.me/${teamWhatsApp}?text=${encodeURIComponent(message)}` : null;
}

export function emailHref(subject, body) {
  return `mailto:${teamEmail}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}

export function inquiryMessage(inquiry) {
  const lines = [
    `Hi TicoWild, I would like help with ${inquiry.intent === "trip" ? "my saved trip" : inquiry.activity_title || "my Costa Rica plans"}.`,
    inquiry.destination ? `Staying in: ${inquiry.destination}` : "",
    inquiry.arrival || inquiry.departure ? `Dates: ${inquiry.arrival || "not set"} to ${inquiry.departure || "not set"}` : "",
    inquiry.travelers ? `Travelers: ${inquiry.travelers}` : "",
    inquiry.activity_titles?.length ? `Experiences: ${inquiry.activity_titles.join(", ")}` : "",
    inquiry.notes ? `Notes: ${inquiry.notes}` : "",
  ];
  return lines.filter(Boolean).join("\n");
}

export async function deliverInquiry(inquiry) {
  const payload = {
    name: inquiry.name.trim(),
    email: inquiry.email.trim(),
    phone: inquiry.phone.trim(),
    destination: inquiry.destination || "",
    arrival: inquiry.arrival || null,
    departure: inquiry.departure || null,
    travelers: inquiry.travelers || "",
    intent: inquiry.intent || "planning",
    activity_ids: inquiry.activity_ids || [],
    activity_titles: inquiry.activity_titles || [],
    notes: inquiry.notes?.trim() || "",
    source_path: window.location.pathname,
    status: "new",
  };

  if (hasSupabase) {
    const { error } = await supabase.from("public_inquiries").insert(payload);
    if (!error) return { delivered: true };
  }

  const body = [
    inquiryMessage(payload),
    "",
    `Name: ${payload.name}`,
    `Email: ${payload.email}`,
    payload.phone ? `Phone / WhatsApp: ${payload.phone}` : "",
  ].filter(Boolean).join("\n");
  return {
    delivered: false,
    fallbackHref: emailHref("TicoWild trip request", body),
  };
}

