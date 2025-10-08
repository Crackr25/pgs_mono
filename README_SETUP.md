# 🚀 PGS Trading Platform - Setup Guide

This guide will help you run the complete trading platform with Laravel backend and Next.js frontend.

**⚠️ Important: This is a pnpm workspace monorepo. Do NOT use `npm` - use `pnpm` instead!**

## Prerequisites

Make sure you have installed:
- **PHP 8.1+** with extensions (mbstring, openssl, pdo, tokenizer, xml, ctype, json, bcmath)
- **Composer** (PHP package manager)
- **Node.js 18+** and **pnpm** (not npm - this is a pnpm workspace)
- **MySQL** or **SQLite** database

### Installing pnpm (if not already installed):
```bash
npm install -g pnpm
```

## 🔧 Monorepo Setup (Both Backend & Frontend)

### 1. Install all dependencies from root directory
```bash
# From the root directory (pgs_mono/)
pnpm install
```

This will install both frontend (Node.js) and backend (Composer) dependencies automatically.

### 2. Set up backend environment configuration
```bash
# Navigate to backend
cd packages/backend

# Copy environment file
copy .env.example .env

# Generate Laravel application key
php artisan key:generate
```

### 3. Configure database in `packages/backend/.env`
Open `packages/backend/.env` and update these settings:

**For MySQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pgs
DB_USERNAME=root
DB_PASSWORD=
```

**For SQLite (easier setup):**
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

### 4. Create database
**For MySQL:** Create a database named `pgs` in your MySQL server

**For SQLite:** Create the database file:
```bash
cd packages/backend
touch database/database.sqlite
```

### 5. Run database migrations
```bash
cd packages/backend
php artisan migrate
```

### 6. Set up frontend environment
```bash
# Navigate to frontend
cd packages/frontend

# Copy environment file
copy .env.example .env.local
```

The `.env.local` file should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 7. Start both servers (from root directory)
```bash
# Go back to root directory
cd ../..

# Start both backend and frontend together
pnpm run dev
```

This will start:
- ✅ **Backend** at: http://localhost:8000
- ✅ **Frontend** at: http://localhost:3000

### Alternative: Start servers individually
```bash
# Terminal 1 - Backend only
pnpm run dev:backend

# Terminal 2 - Frontend only  
pnpm run dev:frontend
```

---

## 🎯 Testing Your Setup

### 1. Open your browser and go to: http://localhost:3000 (or http://localhost:3001 if 3000 is in use)

### 2. Test the features:
- **Browse Products** (works without login)
- **Register/Login** (click Login button in top-right)
- **Add Products** (requires login as seller)
- **Submit Quotes** (works without login)
- **Manage Orders** (requires login)

### 3. API Endpoints are available at:
- **API Base:** http://localhost:8000/api
- **Companies:** http://localhost:8000/api/companies
- **Products:** http://localhost:8000/api/products
- **Authentication:** http://localhost:8000/api/auth/login

---

## 🔍 Troubleshooting

### Backend Issues:
- **"Class not found" errors:** Run `composer dump-autoload`
- **Database connection errors:** Check your `.env` database settings
- **Permission errors:** Make sure `storage/` and `bootstrap/cache/` are writable

### Frontend Issues:
- **API connection errors:** Ensure backend is running on port 8000
- **Module not found:** Run `pnpm install` again from root directory
- **Environment variables:** Make sure `packages/frontend/.env.local` exists with correct API URL
- **Port conflicts:** If port 3000 is in use, start with `pnpm run dev:frontend -- --port 3001`

### CORS Issues:
- The backend is already configured to allow all origins for development
- If you still get CORS errors, restart both servers

---

## 📊 Sample Data

To add sample data for testing:

### 1. Register as a seller
### 2. Create a company profile
### 3. Add some products
### 4. Test quote submissions

---

## 🚀 Production Deployment

For production deployment:

### Backend:
1. Set `APP_ENV=production` in `.env`
2. Configure proper database credentials
3. Set up proper CORS origins
4. Use a web server like Apache/Nginx

### Frontend:
1. Run `npm run build`
2. Deploy the `out/` or `.next/` folder
3. Update `NEXT_PUBLIC_API_URL` to your production API URL

---

## 🛠 Development Commands

### Root Level Commands (from pgs_mono/):
```bash
pnpm run dev               # Start both servers
pnpm run dev:backend       # Backend only
pnpm run dev:frontend      # Frontend only  
pnpm run build             # Build both applications
pnpm install               # Install all dependencies
```

### Backend Commands (from packages/backend/):
```bash
php artisan migrate:fresh  # Reset database
php artisan tinker         # Laravel console
php artisan route:list     # List all API routes
```

### Frontend Commands (from packages/frontend/):
```bash
pnpm run build            # Build for production
pnpm run lint             # Check code quality
```

---

## 📞 Support

If you encounter any issues:
1. Check that both servers are running
2. Verify database connection
3. Check browser console for errors
4. Ensure all dependencies are installed

Happy coding! 🎉
