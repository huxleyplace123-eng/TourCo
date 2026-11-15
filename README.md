# TourCo — TripNest

Costa Rica experience discovery and planning. TicoWild helps travelers narrow the choices around their route, dates and travel style, then request current availability before payment.

## What's here

- **`index.html` / `src/`** — the React/Vite public website. Build it before deployment; opening the source HTML directly is not supported.
- **`/admin/`** — the internal TicoWild CRM.
- **`/my/`** — the customer trip portal.
- **`/partners/`** — operator applications, onboarding, and the Partner Center. See `docs/PARTNER_CENTER.md`.

## Run it locally

Install dependencies and start the development server:

```
npm ci
npm run dev
```

Production: `npm run build`, then deploy `dist/`. Cloudflare Pages builds the main branch. See `docs/OPERATIONS.md` for release checks and recovery requirements.

## Pages / flow

Home · Activities (filterable) · shareable activity detail URLs · Collections · Build-my-trip wizard · Insider Guide · Why TicoWild · Partner · My Trips portal — plus an availability-request flow and optional WhatsApp handoff.

## Public inquiries

Run `supabase/schema.sql`, then configure `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to deliver public planning and availability requests into `public.public_inquiries`. Configure `VITE_TICOWILD_WHATSAPP` for direct click-to-chat. When the inquiry backend is not configured, the UI says so and opens a ready-to-send email rather than displaying a false success state.

The public site does not collect card payments yet. Prices and 20% figures are estimates until availability, provider, final price and terms are confirmed.
