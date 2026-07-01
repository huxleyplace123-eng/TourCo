# TourCo — TripNest

Costa Rica adventure concierge. Vetted local tours, transparent pricing (20% deposit, rest on arrival), human WhatsApp support, and John's local recommendations.

## What's here

- **`index.html`** — the complete, self-contained app. It bundles a React 18 single-page app inline (no build step, no dependencies to install). Open it in a browser or serve the folder and it runs.

## Run it locally

Just open the file:

```
# any static server works, e.g.
npx serve .
# then visit the printed URL
```

Or double-click `index.html`.

## Pages / flow

Home · John Recommends · Activities (filterable) · Activity detail · Packages · Build-my-trip wizard · Local's Guide · Why TripNest · Partner · My Trips portal — plus a trip cart with deposit math and a WhatsApp concierge CTA.

## Notes

- Prototype: bookings, payments, and WhatsApp actions are stubbed (`window.alert`) — no backend yet.
- Single-file by design so it's trivial to preview and hand off.
