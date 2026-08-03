# Deployment Guide

This repository is optimized for deployment on Vercel or any Node.js environment.

## Vercel Deployment

1. Import the repository into Vercel.
2. The included [`vercel.json`](../vercel.json) automatically handles static building and API rewrites:
   - Output directory: `client/dist`
   - Serverless entrypoint: `api/index.js` (delegates to `server.js`)
3. Add Environment Variables in your Vercel Project Settings:
   - `SUPABASE_URL`
   - `SUPABASE_PUBLISHABLE_KEY`
   - `SUPABASE_SECRET_KEY`
   - `RESEND_API_KEY`
   - `RESEND_FROM_EMAIL`
   - `SENDGRID_API_KEY`
   - `SENDGRID_FROM_EMAIL`
   - `COMPANY_EMAIL`

## Local Production Testing

To build the client and test the API contract locally:

```powershell
npm run check
```

To run the local production server:

```powershell
npm start
```
