# Nudge architecture

```text
Phone / Laptop
      │
      ▼
Responsive Next.js PWA on Vercel
      │
      ├── UI / visual storytelling
      │     Home · Money · Grow · Goals · Track · Journal · Insights · Rewards · Wrapped
      │
      ├── Server Route Handlers
      │     transactions · splits · budgets · investments · goals · check-ins · journal
      │     insights · wrapped · settings · auth
      │
      ├── Deterministic engines
      │     finance · split accounting · budgets · growth · rewards · investor profile
      │     goals · mindset · wrapped
      │
      ├──────────────► Google Drive/Sheets API
      │                    │
      │                    ▼
      │              Nudge Finance Sheet
      │              (user-owned source of truth)
      │
      ├──────────────► Gemini API (optional aggregates only)
      │
      └──────────────► IndexedDB offline queue

Optional Vercel Cron ──► service-account bridge ──► prepare Dec 31 Wrapped
```

## Security boundaries

- OAuth state + PKCE for Google authorization.
- Narrow `drive.file` scope: only app-used Drive files.
- Refresh/access token data encrypted with AES-256-GCM inside an HttpOnly SameSite cookie.
- Google credentials and Gemini key stay server-side.
- `ALLOWED_EMAIL` can hard-lock the deployment to one Google account.
- Cron requires Vercel's `Authorization: Bearer <CRON_SECRET>` behavior.
- AI never performs financial arithmetic and receives aggregate statistics only.
- Offline money writes carry a stable client transaction ID, so a retry after a lost response is idempotent.

## Persistence model

Google Sheets is deliberate here: Nudge is personal, the volume is small, direct access to the financial records is a product requirement, and a second database would create two sources of truth.

## Responsive model

One codebase serves three layouts:

- mobile: bottom navigation + floating Quick Add + full menu
- tablet: adaptive single/two-column cards
- desktop: sidebar + richer multi-column storytelling

The content hierarchy changes with space rather than merely scaling the same dashboard.
