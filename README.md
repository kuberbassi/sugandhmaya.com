# Sugandhmaya Storefront

Production storefront for **Sugandhmaya**, a handcrafted Indian incense brand. It combines a high-performance React shopping experience with an Express API backed by Supabase Postgres.

## Architecture & Highlights

- **Frontend**: React 19, React Router v7, and Vite with custom design tokens.
- **Backend API**: Express.js API for products, OTP verification, and order processing.
- **Database**: Supabase Postgres with Row-Level Security (RLS) policies.
- **Transact Emails**: Resend API for OTP verification and SendGrid for order receipts.
- **Automated Seeding & Smoke Testing**: Idempotent seeding script (`npm run seed`) and API contract verification (`npm run check:api`).

## Quick Start

Requirements: Node.js 20+ and npm.

1. **Clone & Install Dependencies**:
   ```powershell
   git clone https://github.com/kuberbassi/sugandhmaya.com.git
   cd sugandhmaya.com
   npm install
   npm install --prefix client
   ```

2. **Configure Environment**:
   Copy `server/.env.example` to `server/.env` and configure your Supabase, Resend, and SendGrid credentials.

3. **Run Development Servers**:
   ```powershell
   npm run dev
   ```
   - Storefront: `http://localhost:5173` (or Vite dev port)
   - Express API: `http://localhost:5000/api`

## Repository Structure

```text
api/                    Vercel serverless entrypoint
client/
  public/media/         Brand, product assets, and videos
  src/components/       Reusable UI components
  src/context/          ShopContext and state store
  src/pages/            Route pages (Home, Shop, Product, Checkout)
docs/                   Database and deployment documentation
scripts/                Catalogue seeding and API verification scripts
server/
  data/                 Canonical product catalog definition
  services/             Database and email integration services
supabase/catalog.sql    Database schema and initial SQL seed
server.js               Express application entrypoint
vercel.json             Vercel deployment configuration
```

## Available Scripts

| Command | Action |
| :--- | :--- |
| `npm run dev` | Starts Express API (`nodemon`) and Vite frontend (`npm run dev --prefix client`) |
| `npm run seed` | Seeds product catalog and image mappings into Supabase Postgres |
| `npm run check:api` | Runs API contract smoke test |
| `npm run check` | Runs frontend linter and production build |
| `npm start` | Starts Express production server |

## Documentation

- [Database Setup & Schema](docs/DATABASE.md)
- [Deployment Guide](docs/DEPLOYMENT.md)

## License

Proprietary. See [LICENSE.md](LICENSE.md).
