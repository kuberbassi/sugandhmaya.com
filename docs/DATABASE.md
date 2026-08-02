# Database setup

Sugandhmaya uses Supabase Postgres for the product catalogue and persistent orders. The API automatically uses the bundled catalogue when Supabase is unavailable.

## Create the schema

1. Create a Supabase project in the intended organization.
2. Run [`supabase/catalog.sql`](../supabase/catalog.sql) through the Supabase SQL editor or migration tooling.
3. Copy the project URL, publishable key and server secret key into `server/.env`.
4. Run `npm run check:api` and confirm that `productSource` reports `supabase`.

The SQL enables RLS on both tables. Anonymous and authenticated clients may only read `products`; `orders` has no public policy and is written only by the Express server with `SUPABASE_SECRET_KEY`.

## Update catalogue data

Edit `server/data/catalog.js`, then run:

```powershell
npm run seed
```

The seed is idempotent and updates products by their stable text ID. All storefront cards intentionally use `/media/products/product-cover.webp`; scents, variants and prices remain product-specific.

## Required environment variables

- `SUPABASE_URL`: project API URL
- `SUPABASE_PUBLISHABLE_KEY`: read-only catalogue access
- `SUPABASE_SECRET_KEY`: server-only order writes and catalogue seeding

Never place the secret key in `client/`, a `VITE_*` variable, browser storage, or committed files.
