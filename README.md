# PGS Mono - Laravel + Next.js Monorepo

A monorepo containing a Laravel backend and Next.js frontend using PNPM Workspaces.

## 📁 Project Structure

```
pgs_mono/
├── packages/
│   ├── backend/         # Laravel 10 API (PHP 8.1+)
│   └── frontend/        # Next.js 14 App (React 18)
├── shared/
│   └── configs/         # Shared ESLint/Prettier configs
├── pnpm-workspace.yaml  # PNPM workspace configuration
├── package.json         # Root workspace scripts
├── .env.shared          # Shared environment variables
└── README.md
```

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ 
- **PNPM** 8+
- **PHP** 8.1+
- **Composer** 2+

### Installation

1. **Install all dependencies:**
   ```bash
   pnpm install:all
   ```

2. **Set up environment files:**
   ```bash
   # Copy shared env to both packages
   cp .env.shared packages/backend/.env
   cp .env.shared packages/frontend/.env.local
   
   # Configure backend-specific variables in packages/backend/.env
   # Configure frontend-specific variables in packages/frontend/.env.local
   ```

3. **Run database migrations (backend):**
   ```bash
   pnpm --filter backend migrate
   ```

## 🛠️ Development

### Run both applications concurrently:
```bash
pnpm dev
```

### Run applications separately:
```bash
# Backend only (Laravel API on :8000)
pnpm dev:backend

# Frontend only (Next.js on :3000)
pnpm dev:frontend
```

## 📦 Available Scripts

### Root Level Commands
- `pnpm dev` - Run both backend and frontend in development
- `pnpm build` - Build both applications
- `pnpm start` - Start both applications in production
- `pnpm test` - Run tests for both applications
- `pnpm lint` - Lint frontend code
- `pnpm clean` - Clean all build artifacts

### Backend Commands (Laravel)
- `pnpm --filter backend dev` - Start Laravel development server
- `pnpm --filter backend test` - Run PHPUnit tests
- `pnpm --filter backend migrate` - Run database migrations
- `pnpm --filter backend seed` - Seed database
- `pnpm --filter backend fresh` - Fresh migration with seeding

### Frontend Commands (Next.js)
- `pnpm --filter frontend dev` - Start Next.js development server
- `pnpm --filter frontend build` - Build Next.js application
- `pnpm --filter frontend start` - Start Next.js production server
- `pnpm --filter frontend lint` - Run ESLint

## 🔧 Configuration

### Environment Variables
- **`.env.shared`** - Common variables for both apps
- **`packages/backend/.env`** - Laravel-specific environment
- **`packages/frontend/.env.local`** - Next.js-specific environment

### Code Quality
- **ESLint** - Shared configuration in `shared/configs/eslint.config.js`
- **Prettier** - Shared configuration in `shared/configs/prettier.config.js`

## 🏗️ Architecture

### Backend (Laravel)
- **API Routes:** RESTful API endpoints
- **Database:** MySQL/PostgreSQL (configurable)
- **Authentication:** Laravel Sanctum
- **Port:** 8000 (development)

### Frontend (Next.js)
- **Framework:** Next.js 14 with App Router
- **Styling:** Tailwind CSS
- **UI Components:** Lucide React icons
- **Port:** 3000 (development)

## 🔄 Deployment

### Build for production:
```bash
pnpm build
```

### Start production servers:
```bash
pnpm start
```

## 📝 Adding New Packages

To add a new package to the monorepo:

1. Create directory in `packages/`
2. Add to `pnpm-workspace.yaml` if needed
3. Create `package.json` with `@pgs-mono/package-name`
4. Install dependencies: `pnpm install`

## 🤝 Contributing

1. Follow the shared ESLint/Prettier configurations
2. Keep backend (PHP) and frontend (Node.js) dependencies separate
3. Use workspace scripts for cross-package operations
4. Update this README when adding new features

## 📄 License

This project is licensed under the MIT License.
