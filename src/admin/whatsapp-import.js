export const MAX_CHAT_BYTES = 1024 * 1024;

// Preserve source dates verbatim: WhatsApp exports vary by locale and timezone.
export function splitWhatsAppChat(source) {
  const text = String(source).replace(/^\uFEFF/, '').replace(/\r\n?/g, '\n').trim();
  if (!text) throw new Error('Paste a conversation or choose a text export first.');
  if (new TextEncoder().encode(text).length > MAX_CHAT_BYTES) throw new Error('Choose a text export smaller than 1 MB.');
  const startsMessage = line => /^(?:\[\d{1,4}[/.\-]\d{1,2}[/.\-]\d{1,4},?\s+[^\]]+\]\s*|\d{1,4}[/.\-]\d{1,2}[/.\-]\d{1,4},?\s+\d{1,2}:\d{2}[^\n]*?\s[-–]\s)/.test(line.replace(/[\u200e\u200f]/g, ''));
  const chunks = [];
  for (const line of text.split('\n')) {
    if (startsMessage(line) || !chunks.length) chunks.push(line);
    else chunks[chunks.length - 1] += '\n' + line;
  }
  if (chunks.length > 2000) throw new Error('Import up to 2,000 messages at a time. Choose a smaller export.');
  return chunks.map(item => item.trim()).filter(Boolean);
}

export async function prepareWhatsAppNotes(source, existing = [], now = new Date().toISOString()) {
  const seen = new Set(existing.map(note => note.importKey).filter(Boolean));
  const notes = [];
  let duplicates = 0;
  for (const text of splitWhatsAppChat(source)) {
    const bytes = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(text));
    const importKey = 'wa-v1-' + Array.from(new Uint8Array(bytes), b => b.toString(16).padStart(2, '0')).join('');
    if (seen.has(importKey)) { duplicates++; continue; }
    seen.add(importKey);
    notes.push({ id: importKey, importKey, at: now, kind: 'whatsapp', text: 'WhatsApp import (manual)\n' + text });
  }
  return { notes, duplicates };
}
