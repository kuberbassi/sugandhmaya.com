# Database & Catalogue Setup

Sugandhmaya uses Supabase Postgres for canonical product catalogue storage and persistent customer order management.

## Schema Creation

1. Log into your [Supabase Dashboard](https://supabase.com/dashboard).
2. Create a new project or select an existing project.
3. Open the **SQL Editor** and execute the contents of [`supabase/catalog.sql`](../supabase/catalog.sql).

The SQL script creates:
- `public.products` with Row-Level Security (RLS) policies allowing public read access for anonymous and authenticated users, and full access for the `service_role`.
- `public.orders` with RLS restricted strictly to `service_role`.

## Seeding the Catalogue

To seed or update the catalogue data in your Supabase database from [`server/data/catalog.js`](../server/data/catalog.js):

```powershell
npm run seed
```

This populates all 6 products (Rose, Mogra, Oudh Regular, Chandan, Orchid, Oudh Premium) with their names, categories, scents, descriptions, pricing, and variant gallery image mappings.

## Environment Configuration

Configure the following variables in `server/.env`:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_PUBLISHABLE_KEY=your-anon-publishable-key
SUPABASE_SECRET_KEY=your-service-role-key
```

Never expose `SUPABASE_SECRET_KEY` in frontend client code or public repositories.
