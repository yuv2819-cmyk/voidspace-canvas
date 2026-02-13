# SaaS Note App

Production-oriented SaaS notes starter with:
- Next.js 16 (App Router)
- Prisma + SQLite
- NextAuth credentials authentication
- Per-user note ownership
- Stripe billing foundation (checkout, portal, webhook)

## Requirements
- Node.js 20+
- npm 9+

## Local Setup
1. Install dependencies:
   ```bash
   npm install
   ```
2. Prepare environment:
   ```bash
   copy .env.example .env.local
   ```
3. Set required values in `.env.local`:
   - `NEXTAUTH_SECRET` (required)
   - Stripe keys/prices (optional unless testing billing)
4. Setup database:
   ```bash
   npm run db:setup
   ```
5. Start app:
   ```bash
   npm run dev
   ```
6. Open `http://localhost:3000`.

## Auth Flow
- Register from the home page.
- Sign in with credentials.
- Notes API is protected and scoped to the signed-in user.

## Billing Flow (Optional)
- `POST /api/billing/checkout` starts Stripe subscription checkout (`PRO`/`TEAM`).
- `POST /api/billing/portal` opens Stripe billing portal.
- `POST /api/stripe/webhook` syncs subscription status.

Required env vars for billing:
- `STRIPE_SECRET_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `STRIPE_PRICE_PRO_MONTHLY`
- `STRIPE_PRICE_TEAM_MONTHLY`

## Scripts
- `npm run dev` start dev server
- `npm run build` production build
- `npm run start` start production server
- `npm run lint` run ESLint
- `npm run db:setup` generate client + push schema
- `npm run db:generate` generate Prisma client
- `npm run db:push` sync DB schema
- `npm run db:studio` open Prisma Studio

## Windows Launcher
- Double-click `launch-voidspace.bat` to:
  - install dependencies if needed
  - start the dev server in a new terminal window
  - open `http://localhost:3000/voidspace` automatically
