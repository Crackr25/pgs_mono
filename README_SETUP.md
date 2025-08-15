# 🚀 PGS Trading Platform - Setup Guide

This guide will help you run the complete trading platform with Laravel backend and Next.js frontend.

## Prerequisites

Make sure you have installed:
- **PHP 8.1+** with extensions (mbstring, openssl, pdo, tokenizer, xml, ctype, json, bcmath)
- **Composer** (PHP package manager)
- **Node.js 16+** and **npm**
- **MySQL** or **SQLite** database

## 🔧 Backend Setup (Laravel API)

### 1. Navigate to backend directory
```bash
cd backend
```

### 2. Install PHP dependencies
```bash
composer install
```

### 3. Set up environment configuration
```bash
copy .env.example .env
```

### 4. Generate application key
```bash
php artisan key:generate
```

### 5. Configure database in `.env` file
Open `backend/.env` and update these settings:

**For MySQL:**
```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=pgs_trading
DB_USERNAME=root
DB_PASSWORD=your_password
```

**For SQLite (easier setup):**
```env
DB_CONNECTION=sqlite
DB_DATABASE=database/database.sqlite
```

### 6. Create database
**For MySQL:** Create a database named `pgs_trading` in your MySQL server

**For SQLite:** Create the database file:
```bash
touch database/database.sqlite
```

### 7. Run database migrations
```bash
php artisan migrate
```

### 8. Start Laravel development server
```bash
php artisan serve
```

✅ **Backend will be running at: http://localhost:8000**

---

## 🎨 Frontend Setup (Next.js)

### 1. Open a new terminal and navigate to frontend
```bash
cd frontend
```

### 2. Install Node.js dependencies
```bash
npm install
```

### 3. Create environment configuration
```bash
copy .env.example .env.local
```

The `.env.local` file should contain:
```env
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### 4. Start Next.js development server
```bash
npm run dev
```

✅ **Frontend will be running at: http://localhost:3000**

---

## 🎯 Testing Your Setup

### 1. Open your browser and go to: http://localhost:3000

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
- **Module not found:** Run `npm install` again
- **Environment variables:** Make sure `.env.local` exists with correct API URL

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

### Backend:
```bash
php artisan migrate:fresh    # Reset database
php artisan tinker          # Laravel console
php artisan route:list      # List all API routes
```

### Frontend:
```bash
npm run build              # Build for production
npm run lint              # Check code quality
npm run dev               # Development server
```

---

## 📞 Support

If you encounter any issues:
1. Check that both servers are running
2. Verify database connection
3. Check browser console for errors
4. Ensure all dependencies are installed

Happy coding! 🎉
