# Cloud Deployment Checklist - Reviews System

## ✅ Pre-Deployment Verification

### 1. Environment Variables
Make sure these are set in your cloud environment:

**Backend (.env)**
```env
DB_CONNECTION=mysql
DB_HOST=your-cloud-db-host
DB_PORT=3306
DB_DATABASE=your_database
DB_USERNAME=your_username
DB_PASSWORD=your_password
APP_URL=https://your-api-domain.com
```

**Frontend (.env.local or .env.production)**
```env
NEXT_PUBLIC_API_URL=https://your-api-domain.com/api
```

### 2. Run Migrations on Cloud
```bash
# SSH into your cloud server
cd /path/to/backend

# Run migrations
php artisan migrate

# Verify reviews table exists
php artisan tinker
>>> App\Models\Review::count();
>>> exit
```

### 3. Seed Sample Reviews (Optional)
```bash
php artisan db:seed --class=ReviewsSeeder
```

### 4. Clear Cache
```bash
php artisan cache:clear
php artisan config:clear
php artisan route:clear
```

### 5. Test API Endpoints
```bash
# Test reviews endpoint
curl https://your-api-domain.com/api/suppliers/1/reviews

# Test stats endpoint
curl https://your-api-domain.com/api/suppliers/1/reviews/stats
```

## 🚀 Deployment Steps

### Backend (Laravel)

1. **Push Code to Cloud**
   ```bash
   git add .
   git commit -m "Add dynamic reviews system"
   git push origin main
   ```

2. **Deploy Backend** (via your cloud provider's method)
   - Railway: Auto-deploys on git push
   - Heroku: `git push heroku main`
   - AWS/DigitalOcean: Use your deployment pipeline

3. **Run Migrations**
   ```bash
   php artisan migrate --force
   ```

4. **Verify**
   ```bash
   php artisan route:list | grep reviews
   ```
   Should show:
   - `GET /api/suppliers/{id}/reviews`
   - `GET /api/suppliers/{id}/reviews/stats`

### Frontend (Next.js)

1. **Build Frontend**
   ```bash
   cd packages/frontend
   npm run build
   ```

2. **Deploy Frontend** (via Vercel/Netlify/etc.)
   ```bash
   # Vercel
   vercel --prod
   
   # Or configure auto-deploy from git
   ```

3. **Verify Environment Variable**
   - Check that `NEXT_PUBLIC_API_URL` is set in your cloud dashboard
   - Example: `https://your-backend.railway.app/api`

## 🔍 Testing in Cloud

### 1. Test API Directly
```bash
curl https://your-api-domain.com/api/suppliers/1/reviews
```

Expected response:
```json
{
  "data": [...],
  "current_page": 1,
  "total": 10
}
```

### 2. Test Frontend
1. Visit your storefront: `https://your-frontend-domain.com/store/company-slug`
2. Add Company Reviews section via page builder
3. Check if reviews appear

### 3. Check Browser Console
- Open DevTools (F12)
- Go to Network tab
- Filter by "reviews"
- Should see successful API calls (200 status)

## ⚠️ Common Cloud Issues & Solutions

### Issue 1: CORS Errors
**Symptom:** Frontend can't fetch from backend

**Solution:** Update `config/cors.php` in backend:
```php
'allowed_origins' => [
    'https://your-frontend-domain.com',
    'http://localhost:3000', // For local dev
],
```

### Issue 2: 404 on API Endpoints
**Symptom:** Routes not found

**Solution:**
```bash
php artisan route:clear
php artisan config:clear
php artisan cache:clear
```

### Issue 3: Empty Reviews
**Symptom:** API returns empty array

**Solution:** Seed reviews in cloud database:
```bash
php artisan db:seed --class=ReviewsSeeder
```

### Issue 4: Environment Variables Not Working
**Symptom:** API calls to localhost instead of cloud

**Solution:**
1. Check your cloud provider's dashboard
2. Set `NEXT_PUBLIC_API_URL` in environment variables
3. Rebuild/redeploy frontend

## 📊 Database Migration Status

Check if migration ran successfully:

```bash
php artisan migrate:status
```

Look for:
```
✓ 2025_11_21_000001_add_company_reviews_to_storefront_sections_type.php
✓ 2025_08_13_123500_create_reviews_table.php
```

## 🔐 Security Checklist for Cloud

✅ **API is public** - No authentication required (as designed)
✅ **Reviews are read-only** - No POST endpoint for now (prevents spam)
✅ **CORS configured** - Only your frontend can access
✅ **Database indexed** - `company_id` is indexed for fast queries
✅ **Pagination enabled** - Prevents large data dumps

## 🎯 Final Verification Commands

Run these in your cloud server:

```bash
# 1. Check database connection
php artisan db:show

# 2. Count reviews
php artisan tinker
>>> App\Models\Review::count();
>>> exit

# 3. Test API endpoint
curl https://your-domain.com/api/suppliers/1/reviews | jq

# 4. Check route exists
php artisan route:list | grep "suppliers/{id}/reviews"
```

## 📝 Cloud Provider Specific Notes

### Railway
- Auto-migrates on deploy if `Procfile` configured
- Environment variables set in dashboard
- Free tier has limited database storage

### Heroku
- Run `heroku run php artisan migrate` after deploy
- Set env vars: `heroku config:set NEXT_PUBLIC_API_URL=...`
- Use add-on for MySQL database

### AWS/DigitalOcean
- SSH access required for manual commands
- Set up CI/CD pipeline for auto-migrations
- Configure load balancer if using multiple servers

### Vercel (Frontend)
- Environment variables in project settings
- Auto-deploys from git push
- Preview deployments for testing

## ✅ Success Indicators

You'll know it's working when:

1. ✅ API endpoint returns JSON data (not 404)
2. ✅ Frontend makes successful network requests
3. ✅ Reviews appear on storefront page
4. ✅ Rating statistics show correct calculations
5. ✅ No CORS errors in browser console

## 🆘 Need Help?

If issues persist in cloud:

1. **Check Logs:**
   ```bash
   # Laravel logs
   tail -f storage/logs/laravel.log
   
   # Cloud provider logs
   heroku logs --tail  # Heroku
   railway logs        # Railway
   ```

2. **Enable Debug Mode Temporarily:**
   ```env
   APP_DEBUG=true
   LOG_LEVEL=debug
   ```
   ⚠️ **Don't forget to disable after troubleshooting!**

3. **Test with curl:**
   ```bash
   curl -v https://your-api.com/api/suppliers/1/reviews
   ```
   The `-v` flag shows detailed request/response info

## 🎉 Summary

**The reviews system is 100% cloud-compatible!**

- ✅ No localhost dependencies
- ✅ Uses environment variables
- ✅ Standard Laravel/Next.js architecture
- ✅ Works with any cloud provider
- ✅ No special configuration needed

Just make sure:
1. Migrations ran on cloud database ✅
2. Environment variables are set ✅
3. API routes are accessible ✅
4. Frontend can reach backend ✅

**Your cloud setup will work exactly like local!** 🚀
