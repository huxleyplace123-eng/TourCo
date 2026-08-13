# CRM Bulk Actions — Design

**Date:** 2026-08-13
**Surface:** TicoWild CRM (`src/admin/*`) — both the Customers workspace (`App.jsx`) and the Operators workspace (`OperatorsApp.jsx`).

## Goal

Let the team check a box on any number of rows in either table (with a "select all" in the header) and then act on the whole selection at once: change status, change heat, set a follow-up date, email them, text them, export them, or delete them. The selection UI and the action bar should feel premium and clean, and behave identically across the two tables.

## Approach

Build the selection primitives **once** as shared pieces (mirrors the existing `crm-ui.jsx` shared-atom pattern that keeps the two workspaces consistent), then wire each table into them. Selection *state* and the data mutations live in each app (they own their data); the *UI* and the selection *hook* are shared.

## Components

New file `src/admin/bulk.jsx`:

- **`useSelection(visibleIds)`** — owns a `Set` of selected ids. Returns `{ selected, isSelected, toggle, toggleAll, clear, count, allVisibleSelected, someVisibleSelected }`. `toggleAll` selects/clears exactly the ids currently passed in (the filtered/visible list). A `useEffect` clears the selection whenever `visibleIds` changes identity due to a filter/search/view/workspace change (the host passes a `resetKey`).
- **`SelectCheckbox`** — theme-styled checkbox (gold check, not the native box), with an `indeterminate` state for the header. Stops click propagation so it never opens the row drawer.
- **`BulkBar`** — the floating action bar. Hidden at `count === 0`; slides up pinned bottom-center when `count >= 1`. Shows `N selected`, a clear (✕), and action controls. `Status` / `Heat` / `Follow-up` are popover triggers; `Email` / `Text` open the compose modal; `Export` and `Delete` are direct. Props are callbacks so each workspace supplies its own stage list, heat picker, and handlers. Wraps / horizontally scrolls on mobile.
- **`ComposeModal`** — subject (email only) + message textarea, a recipient summary ("Sending to N recipients (BCC)"), the included names, and a skipped list for rows lacking the channel. Email **Send** builds a `mailto:?bcc=<all>&subject=&body=` and opens the mail client, then calls back so the host logs a note + marks contacted. Text mode disables Send behind a "SMS isn't connected yet" pill.

Edit `src/admin/crm-ui.jsx`: add checkbox + selected-row + floating-bar styles to the shared `CRM_CSS` stylesheet.

## Per-workspace wiring

**Customers (`App.jsx`)** — selection scoped to `sorted`. Bulk handlers, each a single state update:
- `bulkStage(ids, stage)` — set stage + log `Stage: X → Y` per row.
- `bulkTemp(ids, t)` / `bulkFollowUp(ids, iso)` — set field (no note, matching single-row behavior).
- `bulkEmail(ids, subject, body)` — collect emails, open `mailto` BCC, log note + `lastContacted` per row.
- `bulkDelete(ids)` — confirm with count, filter out.
- `exportSelected(ids)` — `toCsv` of the selected subset, download.

**Operators (`OperatorsApp.jsx`)** — selection scoped to `filtered`. Same handlers over `patchOperator` in one `setOverlay`. `bulkDelete` removes only custom/imported overlay entries; seed operators are skipped and reported ("3 deleted, 2 seed skipped").

Edit `src/admin/operators-store.js`: add `operatorsToCsv(list)` and a `deleteOperators(overlay, ids, mergedList)` helper that only drops non-seed entries and returns `{ overlay, deleted, skippedSeed }`.

## Behavior decisions

- Bulk mutations are **atomic** (one `setCustomers` / `setOverlay` call → one re-render), and preserve the single-row note-logging for status changes.
- **Selection clears** on any filter / search / view / workspace change.
- **Delete**: customers confirm-and-remove; operators skip seed rows.
- **Email BCC** so recipients never see each other; rows with no email are surfaced as skipped, not silently dropped.
- **Text** ships fully built but inert (no SMS provider connected).

## Out of scope

- Real email/SMS sending backend (email uses the OS mail client via `mailto`; text is a stub).
- Bulk edits to free-text fields, tags, or owner (not requested).
