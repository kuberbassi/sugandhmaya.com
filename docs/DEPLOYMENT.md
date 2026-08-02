# Deployment

The project is configured for Vercel with a Vite static frontend and an Express serverless function.

## Vercel settings

- Build command: `npm run build`
- Output directory: `client/dist`
- API entrypoint: `api/index.js`
- Node.js: 20 or newer

Add every variable from `server/.env.example` to the Vercel project. `SUPABASE_SECRET_KEY`, email provider keys and sender configuration must remain server-only.

## Pre-deployment checklist

```powershell
npm ci
npm ci --prefix client
npm run lint
npm run check:api
npm run build
```

After deployment, verify:

1. `/api/health` reports the expected integrations.
2. `/api/products` returns six products from Supabase.
3. Shop and product routes load directly without a 404.
4. OTP delivery, checkout validation and order confirmation work with production sender domains.
5. `/media/*` responses include the configured cache policy.
