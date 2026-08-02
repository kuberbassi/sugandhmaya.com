# Sugandhmaya Storefront

Production storefront for Sugandhmaya, a handcrafted Indian incense brand. It combines a responsive React shopping experience with a small Express API and a Supabase-backed catalogue.

## Highlights

- React 19, React Router and Vite
- Express API for products, OTP verification and orders
- Supabase Postgres catalogue with Row Level Security
- Server-authoritative pricing and order validation
- Resend OTP and SendGrid order-email integrations
- Local catalogue and order fallbacks for reliable development
- Lazy-loaded routes, accessible motion and responsive layouts

## Quick start

Requirements: Node.js 20 or newer and npm.

```powershell
npm ci
npm ci --prefix client
Copy-Item server/.env.example server/.env
npm run dev
```

Local services:

- Storefront: `http://127.0.0.1:5176`
- API: `http://127.0.0.1:5000/api`
- Health: `http://127.0.0.1:5000/api/health`

The shop remains usable with bundled catalogue data when Supabase is not configured or temporarily unavailable.

## Environment

Configure server-only values in `server/.env`. Never expose `SUPABASE_SECRET_KEY` in React or commit the local environment file.

```env
PORT=5000
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=sb_publishable_your_key
SUPABASE_SECRET_KEY=sb_secret_your_key
RESEND_API_KEY=
RESEND_FROM_EMAIL=
SENDGRID_API_KEY=
SENDGRID_FROM_EMAIL=
COMPANY_EMAIL=
```

See [Database setup](docs/DATABASE.md) and [Deployment](docs/DEPLOYMENT.md) for the complete configuration.

## Commands

```powershell
npm run dev        # API and frontend development servers
npm run lint       # React lint checks
npm run build      # Production client build
npm run check:api  # API health and catalogue smoke test
npm run check      # Lint and production build
npm run seed       # Upsert the canonical catalogue into Supabase
npm start          # Start the production Express server
```

## Repository structure

```text
api/                    Vercel serverless entrypoint
client/
  public/media/         Named brand, product, texture and video assets
  src/components/       Shared interface components
  src/context/          Catalogue and cart state
  src/pages/            Route-level screens
  src/utils/            Small formatting helpers
docs/                   Database and deployment guides
scripts/                Catalogue seed and API verification scripts
server/
  data/                 Canonical catalogue and local order fallback
  services/             Supabase and transactional-email integrations
supabase/catalog.sql    Protected schema and initial catalogue seed
server.js               Express application and local entrypoint
vercel.json             Build, routing and cache configuration
```

## Reliability and security

- Product requests use a short server cache and fall back to canonical local data.
- Order prices are recalculated from the server catalogue.
- Public Supabase access is read-only; order rows require the server secret key.
- `/api/health` reports catalogue, order-storage and email readiness.
- Local fallback orders are ignored by Git and are not production storage.

## License

Proprietary. See [LICENSE.md](LICENSE.md).
