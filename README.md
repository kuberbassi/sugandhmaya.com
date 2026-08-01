# Sugandhmaya

The production storefront for Sugandhmaya, a handcrafted Indian incense brand. The application combines a responsive React catalogue and checkout experience with an Express API for products, OTP verification, orders, and transactional email.

## Stack

- React 19, React Router and Vite
- Express and Node.js
- MongoDB with Mongoose
- Resend for OTP delivery
- SendGrid for order confirmations
- Vercel for the SPA and serverless API

## Features

- Responsive product catalogue and product galleries
- Persistent cart with quantity and variant controls
- Email OTP verification before order placement
- Server-authoritative pricing and order validation
- MongoDB catalogue with a bundled read-only product fallback
- Lazy-loaded routes with stale-chunk recovery and an application error boundary
- Accessible reduced-motion behavior and mobile navigation

## Local development

Requirements: Node.js 20 or newer and npm.

```powershell
npm install
npm ci --prefix client
```

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://...
RESEND_API_KEY=...
RESEND_FROM_EMAIL=verified@example.com
SENDGRID_API_KEY=...
SENDGRID_FROM_EMAIL=verified@example.com
COMPANY_EMAIL=orders@example.com
```

Run the API and Vite frontend together:

```powershell
npm run dev
```

- Frontend: `http://localhost:5175`
- API: `http://localhost:5000/api`
- Health check: `http://localhost:5000/api/health`

The Vite port is intentionally strict so duplicate development servers fail clearly instead of creating stale module sessions on ports 5176 and beyond.

## Useful commands

```powershell
npm run lint
npm run build
npm run seed
npm start
```

`npm run seed` replaces the MongoDB product catalogue with the canonical products in `server/data/products.js`.

## Deployment

The repository is configured for Vercel:

- `client/dist` is the static Vite output.
- `api/index.js` exposes the Express application as a Vercel Function.
- `/api/*` routes to the function.
- Other non-file routes fall back to the React application.
- Hashed assets receive immutable caching headers.

Configure all variables from `server/.env` in the Vercel project settings. Never commit that file.

## Project structure

```text
api/                  Vercel function entrypoint
client/
  public/             Images, robots.txt and sitemap.xml
  src/
    components/       Shared interface components
    context/          Catalogue and cart state
    pages/            Route-level screens
server/
  data/               Canonical product data and local development fallback
  models/             Mongoose schemas
  utils/              Transactional email integration
server.js             Express application and local server entrypoint
vercel.json           Build, routing and caching configuration
```

## Reliability notes

- Product browsing remains available through bundled catalogue data when MongoDB cannot be reached.
- Order totals are always recalculated on the server.
- `/api/health` reports database, product-source, ordering and email readiness.
- Local fallback orders are ignored by Git and must not be treated as durable production storage.

## License

Proprietary. See [LICENSE.md](LICENSE.md).
