# CRM Bulk WhatsApp — Guided Send Design

**Date:** 2026-08-13
**Surface:** TicoWild CRM (`src/admin/*`) — both Operators (`OperatorsApp.jsx`) and Customers (`App.jsx`), via the shared bulk bar.

## Goal

From the bulk-action bar, send a WhatsApp message to every selected contact using the team's **own** WhatsApp — writing the message once and stepping through the selection one contact at a time.

## Reality constraint (drives the design)

WhatsApp has no silent bulk-send from a personal number (anti-spam by design). The only way to use *your* WhatsApp is the click-to-chat link (`https://wa.me/<digits>?text=<encoded>`), which opens one chat with the message pre-filled; a human presses send. So bulk = a **guided, one-at-a-time stepper**, not a blast. One click per contact also keeps every `window.open` a real user gesture, so the browser never blocks it.

## Flow

**Button:** a green **WhatsApp** button in `BulkBar`, before Email (order: Status · Heat · Follow-up · WhatsApp · Email · Text · Export · Delete).

**Modal `WhatsAppSendModal` — two phases:**

1. **Compose** — one message textarea; an "Insert {name}" helper that drops a `{name}` token (replaced per contact with their first name); a live preview for the first recipient; a recipient summary ("N on WhatsApp") with contacts lacking a number listed as **skipped**; a "Start sending →" button (disabled if nobody has a number).
2. **Step-through** — progress ("Contact i of N") + a done/current/pending checklist; the current contact's card (name, number, the filled message); a primary button that toggles:
   - not yet opened → **"Open WhatsApp for <first name> →"**: `window.open(waHref)` (pre-filled chat) **and** logs that contact (note + `lastContacted: today`).
   - opened → **"Next contact →"** (plus a "Skip" link that advances without logging).
   - after the last → a **"Done — N contacted"** summary + Close.

## Number + name resolution

- Operators: `op.whatsapp || op.phone`; Customers: `cust.phone`. Digits only via the existing `normPhone`/inline strip. Empty → skipped.
- First name: `name.trim().split(/\s+/)[0]` (fallback "there").

## Components (all shared in `src/admin/bulk.jsx`)

- `waHref(number, text)` → `https://wa.me/<digits>?text=<encoded>` (null if no digits).
- `WhatsAppSendModal({ recipients: [{id,name,number}], onClose, onSent })` — owns compose/step state; calls `onSent(id)` once per contact when their WhatsApp is opened.
- `BulkBar` gains an `onWhatsApp` prop + the green button (`.crm-bulk-wa` accent).

## Per-workspace wiring

Each app adds `waOpen` state, builds `recipients` from the selection, and implements `onSent(id)` as a single-record patch:
- Operators: `patchOperator(ov, id, { lastContacted, notes:[...prev, {text:"WhatsApp bulk message"}] })`.
- Customers: map-update the one record with `lastContacted` + a `kind:"whatsapp"` note.

Selection persists after sending (like Email); the modal closes on Done/Close.

## Out of scope

- WhatsApp Business Cloud API / automated bulk (separate business number, Meta setup, per-message fees) — explicitly rejected in favor of "my WhatsApp".
- Changing the single-row WhatsApp icon behavior.
- Delivery/read receipts (not available via click-to-chat).
