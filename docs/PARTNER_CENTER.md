# TicoWild Partner Center

The operator-facing application ships at `/partners/`. It supports two entry paths:

1. **Existing operator invitation** — a TicoWild team member creates an invite for an existing CRM operator ID. When that email creates an account, the database links it to the company automatically.
2. **New partner application** — an operator creates an account, completes the three-step application, and waits for TicoWild approval. Approval creates the operator and owner membership atomically.

## What is implemented

- Email/password sign-in and secure email-link sign-in through Supabase Auth
- Account creation with email confirmation support
- Three-step, mobile-first operator application
- Pending-review state that does not expose portal data
- Operator-to-user memberships with owner, manager, guide, and finance roles
- Per-operator row-level security
- Existing operator portal promoted from CRM preview to a standalone partner experience
- Profile, logo, tours, availability, bookings, messages, and agreement interface
- CRM button that copies a prefilled partner signup URL
- Safe demo mode when Supabase is not configured

## Activate the backend

1. Create or select the TicoWild Supabase project.
2. Run `supabase/schema.sql`.
3. Run `supabase/operator_portal.sql`.
4. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` to the deployment environment.
5. Create the TicoWild team member's Supabase user.
6. Insert that user's UUID into `public.team_members` as shown at the bottom of `operator_portal.sql`.

Never put the Supabase service-role key in Vite environment variables or browser code.

## Invitation and approval

Existing operator invitation (run through an authenticated team tool):

```sql
select public.invite_operator(
  'existing-crm-operator-id',
  'Company Name',
  'owner@company.com',
  'owner'
);
```

Approve a submitted application:

```sql
select public.approve_operator_application('APPLICATION-UUID');
```

Both functions reject non-team users. An applicant cannot set their own application to approved, choose an operator ID, or access another company's portal state.

## Next production slice

- Move the internal CRM team login to Supabase Auth so Invite and Approve can run directly from the CRM UI.
- Normalize portal messages, tours, availability, agreements, and payouts from the compatibility JSON state into dedicated tables.
- Add email delivery for invites and application decisions.
- Add document uploads to a private Supabase Storage bucket with expiration reminders.
- Connect booking payments and operator payouts after the real booking lifecycle is live.
