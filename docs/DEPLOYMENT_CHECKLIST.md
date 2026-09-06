# Nudge production deployment checklist

## 1. GitHub

Target repository: `https://github.com/akankshafunde24/Nudge`

The repository must allow the connected GitHub integration to write repository contents. If ChatGPT can read the repository but receives `403 Resource not accessible by integration` on a file write, reconnect GitHub and make sure the integration is authorized for the **Nudge** repository with repository-content write access.

## 2. Google Cloud — required

Create one Google Cloud project and enable:

- Google Drive API
- Google Sheets API

Configure the OAuth consent screen, then create an OAuth 2.0 **Web application** client.

Authorized redirect URIs:

- Local: `http://localhost:3000/api/auth/google/callback`
- Production: `https://YOUR-VERCEL-DOMAIN/api/auth/google/callback`

Nudge requests only:

- `openid`
- `email`
- `profile`
- `https://www.googleapis.com/auth/drive.file`

Set the OAuth app to production for a long-lived personal deployment. Restrict the deployed Nudge instance with `ALLOWED_EMAIL`.

## 3. Vercel — required

Import the GitHub repository into Vercel and use the Hobby plan.

Required production environment variables:

```dotenv
GOOGLE_CLIENT_ID=<oauth-client-id>
GOOGLE_CLIENT_SECRET=<oauth-client-secret>
AUTH_SECRET=<random-secret-32+-chars>
ALLOWED_EMAIL=<your-google-email>
```

Recommended optional variables:

```dotenv
GEMINI_API_KEY=<free-tier-key>
GEMINI_MODEL=gemini-3.7-flash
```

Optional unattended Dec 31 Wrapped bridge:

```dotenv
GOOGLE_SERVICE_ACCOUNT_JSON_B64=<base64-service-account-json>
CRON_SECRET=<random-secret>
```

Do not set `NUDGE_DEV_BYPASS=true` in Vercel.

## 4. After first Vercel deployment

1. Copy the final Vercel production domain.
2. Add `https://YOUR-VERCEL-DOMAIN/api/auth/google/callback` to the Google OAuth client's authorized redirect URIs.
3. Open Nudge and sign in with the `ALLOWED_EMAIL` account.
4. Complete the 3-step onboarding.
5. Confirm a `Nudge Finance` Sheet appears in Google Drive.
6. Open **Settings → Open Google Sheet** and confirm the Sheet can be inspected independently.

## 5. Acceptance smoke test

Run these in the live app:

1. Add ₹900 Food expense split equally between you + two friends.
   - bank outflow should be ₹900
   - personal Food spend should be ₹300
   - open receivable should be ₹600
2. Settle ₹300 from one friend.
   - receivable should fall by ₹300
   - income should not increase
3. Add a ₹500 refund to Food/Shopping.
   - personal spending should fall by ₹500
   - income should not increase
4. Add an investment contribution.
   - Investments tab and Transactions tab should both receive appropriate rows
5. Use **Update current value** for that holding.
   - portfolio value should change
   - no cash transaction should be created
6. Create a category budget.
   - Spending Garden should update
7. Complete a daily check-in with a motto/intention.
   - Growth/Momentum should update without destructive streak behavior
8. Create a goal and contribution.
9. Add a journal entry.
10. Open Insights and Wrapped preview.
11. Install Nudge to a phone home screen and test Quick Add.
12. Disable network, log one expense, restore network, and confirm only one transaction is created after sync.

## 6. Verification commands

```bash
npm install
npm test
npm run typecheck
npm run build
```

The GitHub Actions workflow runs tests, TypeScript validation and a production Next.js build on every push to `main` and pull request.
