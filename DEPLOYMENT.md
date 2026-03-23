# Deployment Guide

## Architecture

- Backend: Render (Docker), from `server/Dockerfile`
- Frontend: Netlify, from `client/`

## 1) Deploy Backend to Render (Docker)

### Option A: Using `render.yaml` (recommended)

1. Push your code to GitHub.
2. In Render dashboard, choose **New +** -> **Blueprint**.
3. Select this repository.
4. Render reads `render.yaml` and creates the backend service.

### Option B: Manual Web Service setup

1. In Render dashboard, choose **New +** -> **Web Service**.
2. Connect repository `Anika-34/CSE-326-project`.
3. Configure:
   - Environment: `Docker`
   - Root Directory: `server`
   - Dockerfile Path: `server/Dockerfile`
4. Add environment variables:
   - `NODE_ENV=production`
   - `DATABASE_URL=<your render postgres external url>`
   - `JWT_SECRET=<strong random secret>`
   - `STRIPE_SECRET_KEY=<your stripe secret key>`
   - `CORS_ORIGIN=https://<your-netlify-site>.netlify.app`
5. Deploy and copy the backend URL, for example:
   - `https://cse326-backend.onrender.com`

## 2) Deploy Frontend to Netlify

1. In Netlify, choose **Add new site** -> **Import an existing project**.
2. Connect the same GitHub repository.
3. Build settings (already defined in `netlify.toml`):
   - Base directory: `client`
   - Build command: `npm ci && npm run build`
   - Publish directory: `build`
4. Add environment variable in Netlify Site settings:
   - `REACT_APP_API_URL=https://<your-render-backend-domain>`
5. Trigger deploy.

## 3) Post-deploy checks

1. Open backend health endpoint:
   - `https://<render-backend>/v1/dummy`
2. Open frontend URL from Netlify.
3. Test login and hotel search flows.

## Notes for this repository

- Frontend now uses a single API variable: `REACT_APP_API_URL`.
- Backend DB connection supports both local DB vars and `DATABASE_URL` for Render.
- Backend CORS now supports allowlist via `CORS_ORIGIN` (comma-separated if needed).
- Keep `.env` files local only; do not commit secrets.