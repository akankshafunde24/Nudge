# Nudge 🌱

**Small steps. A brighter you.**

Nudge is a responsive personal finance + investing + daily-life PWA. It is intentionally designed to feel positive, minimalist and playful rather than like a conventional finance dashboard.

The financial source of truth is a **Google Sheet in the signed-in user's own Google Drive**. The web app turns that structured ledger into Money River, Spending Gardens, Wealth Garden, Goal Journeys, a Seed → Sprout → Seedling → Plant growth system, gentle weekly/monthly insights and Nudge Wrapped.

## Core behavior

- Google Sheet source of truth with independently inspectable tabs
- Split-aware accounting: bank outflow, personal share and receivable are distinct
- Friend settlements clear receivables and **never count as income**
- Expense, income, savings, refunds and transfers
- Category budgets shown as positive “Spending Gardens”
- Investment contributions, withdrawals/sales and manual valuation updates
- Educational investor profile; no security recommendations or live price dependency
- Goals and goal contributions
- Daily mood/energy/movement/food/intention check-in
- Lightweight journal
- XP, Quest Coins, badges, comeback rewards and non-destructive Momentum
- Seed → Sprout → Seedling → Plant lifecycle based on lifetime XP
- 7-day and monthly story-style Insights
- December 31 Nudge Wrapped with deterministic fallback if AI is unavailable
- Offline expense queue with idempotent transaction IDs
- Responsive desktop/mobile interface + installable PWA
- Optional Gemini narrative layer; raw financial ledger is not sent to AI

## Stack — recurring cost ₹0 for personal use

- Next.js 16 + React 19 + TypeScript
- Vercel Hobby hosting
- Google OAuth 2.0
- Google Drive + Sheets APIs using the narrow `drive.file` OAuth scope
- Google Sheets as persistence
- Gemini Developer API free tier (optional)
- IndexedDB for offline transaction queue
- Vercel Cron (optional year-end preparation)
- GitHub Actions CI

No database subscription, paid chart library, paid notification provider or paid AI dependency is required.

## Financial Sheet

Nudge creates **Nudge Finance** with these tabs:

`Settings`, `Transactions`, `Splits`, `Investments`, `Goals`, `Budgets`, `Daily_CheckIns`, `Journal`, `Rewards`, `Wrapped`, `Monthly_Summary`, `Yearly_Summary`.

The summary tabs contain Google Sheets formulas so useful monthly/yearly totals remain visible even when the web app is not open.

## Local development

Requirements: Node.js 22+ and npm.

```bash
npm install
cp .env.example .env.local
npm run dev
```

For UI-only exploration without Google credentials, set:

```bash
NUDGE_DEV_BYPASS=true
AUTH_SECRET=local-development-secret-at-least-32-characters
```

`NUDGE_DEV_BYPASS` is ignored in production.

## Google Cloud setup

1. Create a Google Cloud project.
2. Enable **Google Drive API** and **Google Sheets API**.
3. Configure an OAuth consent screen.
4. Create an OAuth 2.0 **Web application** client.
5. Add local redirect URI:
   `http://localhost:3000/api/auth/google/callback`
6. After Vercel deployment, also add:
   `https://YOUR-VERCEL-DOMAIN/api/auth/google/callback`
7. Put the client ID and secret in environment variables.

Nudge requests `openid`, `email`, `profile` and `https://www.googleapis.com/auth/drive.file`. It intentionally does **not** request the broad `spreadsheets` scope; `drive.file` is enough for the app-created spreadsheet.

For a personal deployment, Google documents a personal-use exception to sensitive-scope verification. `drive.file` is also classified as a recommended non-sensitive Drive scope. If the OAuth project remains in **Testing**, refresh tokens are time-limited; for a long-lived personal deployment, move the OAuth app to **In production** and restrict Nudge with `ALLOWED_EMAIL`.

## Environment variables

```dotenv
GOOGLE_CLIENT_ID=
GOOGLE_CLIENT_SECRET=
AUTH_SECRET=
ALLOWED_EMAIL=

# Optional
GEMINI_API_KEY=
GEMINI_MODEL=gemini-3.7-flash
GOOGLE_SERVICE_ACCOUNT_JSON_B64=
CRON_SECRET=

# Local only
NUDGE_DEV_BYPASS=false
```

Generate an auth secret, for example:

```bash
openssl rand -base64 48
```

### Optional December 31 automation bridge

Wrapped always works when the user opens Nudge. If you also want Vercel Cron to prepare it unattended on December 31:

1. Create a Google Cloud service account in the same project.
2. Download its JSON key.
3. Base64-encode the full JSON and set `GOOGLE_SERVICE_ACCOUNT_JSON_B64` in Vercel.
4. Set a strong `CRON_SECRET` in Vercel.
5. Sign into Nudge once. New Nudge Sheets are automatically shared with the service account; for an existing Sheet use **Settings → Refresh Sheet automation access**.

The cron runs once on December 31. It prepares Wrapped in the Sheet; the web app displays it when opened. Without the bridge, the first open on/after December 31 generates it normally.

## Vercel deployment

1. Import `akankshafunde24/Nudge` into Vercel.
2. Framework preset: **Next.js**.
3. Keep the project root as `/`.
4. Add the required environment variables above.
5. Deploy.
6. Copy the assigned `*.vercel.app` production domain into the Google OAuth redirect URI list.
7. Redeploy or sign in again and complete onboarding.

The repository includes `vercel.json` for the optional December 31 cron.

## Validation

```bash
npm run test
npm run typecheck
npm run build
```

GitHub Actions runs the same core tests, full TypeScript check and Next.js production build on pushes and pull requests.

## Accounting rules worth protecting

- A ₹900 dinner for you + two friends can be ₹900 bank outflow, ₹300 personal food expense and ₹600 receivable.
- A friend returning ₹300 is a settlement, not income.
- A refund reduces spending; it is not salary-like income.
- Investment withdrawals/sales are cash returns from investing, not income.
- A portfolio valuation update changes the recorded current value but does not create a cash transaction.
- Savings and investment contributions remain separate from consumption spending.

## AI and privacy

Exact totals are calculated by deterministic TypeScript logic. Gemini, when configured, receives aggregate statistics for narrative phrasing. If Gemini is unavailable or its free quota is exhausted, Nudge uses rule-based positive insights instead, so core functionality does not depend on AI.

See `/privacy` and `/terms` in the application for the concise user-facing policy copy.

## Disclaimer

Nudge is a personal organization and reflection tool. It is not a bank, broker, financial adviser, medical service or diagnostic product.
