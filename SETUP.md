# NaijaBet sportsbook

React/Vite betting site with a Node/Express API and SQLite wallet. Money is in NGN; balances and stakes are stored in kobo. Minimum deposit: ₦50.

## Start locally

Requires Node.js 22.5 or later. Copy `.env.example` to `.env`, set a private `JWT_SECRET`, and add your Paystack **test** secret key. In the project root:

```sh
npm install
npm start
```

In a second terminal:

```sh
cd frontend
npm install
npm run dev
```

Open the Vite address (usually `http://localhost:5173`) and create an account with your email address. The deposit form accepts whole naira from ₦50, then redirects to Paystack checkout. The wallet changes only after a verified Paystack webhook confirms the payment.

## Paystack setup

Use a Paystack test secret while developing. Configure the webhook as `https://YOUR_PUBLIC_API/api/payments/paystack/webhook`, and put its signing secret in `PAYSTACK_WEBHOOK_SECRET`. `APP_URL` should be the public frontend URL used for the post-checkout return. Production needs HTTPS and live secrets stored only in the server environment.

Real charges cannot complete until valid Paystack credentials and a publicly reachable HTTPS webhook are configured. The app does not fake wallet top-ups. Never put the Paystack secret in frontend code or commit `.env`.

## Existing data

The server adds a `password_hash` column to older users tables and creates deposit and booking-code tables. Existing events, bets and wallet balances remain in the database. The old shared demo account is no longer used; create an account for a private wallet.
