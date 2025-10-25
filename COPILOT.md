# 🧩 Copilot Context — PGS Monorepo (Laravel + Next.js on CloudPanel)

You are assisting in a monorepo project named **PGS Mono**, containing both a Laravel backend and a Next.js frontend.  
The system must run correctly both **locally** and on **CloudPanel** (production).

---

## 🏗️ Project Overview

- **Architecture:** Monorepo using PNPM Workspaces
- **Frontend:** Next.js 14 (React 18, Tailwind CSS)
- **Backend:** Laravel 10 (PHP 8.1+, MySQL)
- **Hosting:** CloudPanel (Nginx reverse proxy)
- **Package manager:** PNPM

### Local Folder Structure

```
pgs_mono/
├── packages/
│   ├── backend/         # Laravel 10 API (PHP 8.1+)
│   └── frontend/        # Next.js 14 App (React 18)
├── shared/
│   └── configs/         # Shared ESLint/Prettier configs
├── pnpm-workspace.yaml
├── package.json
└── .env.shared
```

---

## ☁️ Online Deployment (CloudPanel)

| Domain | Site User | App | Description |
|--------|------------|-----|-------------|
| **api.pinoyglobalsupply.com** | `pgsapi` | PHP (Laravel) | Backend API server |
| **pinoyglobalsupply.com** | `pinoyglobalsupply` | NODEJS (Next.js) | Frontend web portal |

### 🔁 Nginx Proxy Logic

```
/api → https://api.pinoyglobalsupply.com/api
/storage → https://api.pinoyglobalsupply.com/storage
/ → http://127.0.0.1:3000 (Next.js frontend)
```

- HTTP → HTTPS redirect is always active.
- Both apps are served via CloudPanel with SSL.
- Frontend requests to `/api` or `/storage` automatically proxy to the backend API domain.

---

## ⚙️ Development Setup (Local)

### Run both apps locally:
```bash
pnpm dev
```

- Laravel backend runs on: `http://localhost:8000`
- Next.js frontend runs on: `http://localhost:3000`
- API requests from the frontend should go to: `/api/...` (locally proxied or pointing to backend)
- Storage paths should reference `/storage/...`

### Run separately:
```bash
pnpm dev:backend   # Laravel only
pnpm dev:frontend  # Next.js only
```

---

## 🧩 Copilot Rules for Code Suggestions

1. **Do not mix backend and frontend logic in the same codebase.**
   - `packages/backend` → Laravel + PHP
   - `packages/frontend` → Next.js + Node.js

2. **When writing frontend code (Next.js):**
   - Use relative API paths (`/api/...`) instead of hardcoded URLs.
   - File/image paths use `/storage/...`.
   - Assume the proxy setup from Nginx handles redirection.

3. **When writing backend code (Laravel):**
   - Serve all APIs under `/api`.
   - Use standard Laravel routing and controllers.
   - Storage path: `storage/app/public`.

4. **Copilot should understand this project works both:**
   - **Locally:** via PNPM scripts and localhost ports.
   - **Online (CloudPanel):** via two separate domains and reverse proxy.

5. **Never modify or suggest changes to:**
   - CloudPanel Nginx configuration
   - SSL settings
   - Monorepo folder structure

6. **Always maintain Laravel for API logic and Next.js for UI logic.**

---

## 🌐 Environment Configuration

### Local Development
- Backend: `http://localhost:8000`
- Frontend: `http://localhost:3000`
- API Base URL: `/api` (relative paths)

### Production (CloudPanel)
- Backend: `https://api.pinoyglobalsupply.com`
- Frontend: `https://pinoyglobalsupply.com`
- API Base URL: `/api` (proxied to backend domain)

---

## 🔄 API Request Flow

### Local Environment
```
Frontend (localhost:3000) → /api/users → Laravel (localhost:8000/api/users)
```

### Production Environment
```
Frontend (pinoyglobalsupply.com) → /api/users → Nginx Proxy → api.pinoyglobalsupply.com/api/users
```

---

## ✅ Summary

This monorepo is designed to run seamlessly both locally (via PNPM dev scripts) and in production (via CloudPanel with Nginx reverse proxy).

All AI suggestions should follow this structure and preserve the separation between the Next.js frontend and Laravel backend.

**Key Principles:**
- Use relative paths for API calls (`/api/...`)
- Use relative paths for storage (`/storage/...`)
- Maintain clear separation between frontend and backend packages
- Support both local development and CloudPanel production deployment
