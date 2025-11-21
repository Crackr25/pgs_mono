# Quick Start: Adding Test Reviews to Database

## Steps to Add Test Reviews

### 1. Run the Reviews Seeder
```bash
cd packages/backend
php artisan db:seed --class=ReviewsSeeder
```

This will add 10 sample reviews to your first company in the database.

### 2. Verify Reviews Were Created
```bash
php artisan tinker
```

Then in Tinker:
```php
// Check total reviews
App\Models\Review::count();

// Check reviews for a specific company
$company = App\Models\Company::first();
$company->reviews()->count();

// View a sample review
App\Models\Review::first();

// Get average rating
App\Models\Review::where('company_id', 1)->avg('rating');
```

Type `exit` to leave Tinker.

### 3. Test the API Endpoint

Open your browser or use curl:
```bash
# Get reviews
curl http://localhost:8000/api/suppliers/1/reviews

# Get review statistics
curl http://localhost:8000/api/suppliers/1/reviews/stats
```

### 4. View on Storefront

1. Go to your storefront page that has the Company Reviews section
2. The reviews should now appear automatically!
3. URL format: `http://localhost:3000/store/{company-slug}`

## Customizing the Seeder

If you want to add reviews to a specific company or customize the reviews:

### Option 1: Edit the Seeder
Edit `packages/backend/database/seeders/ReviewsSeeder.php`:

```php
// Change this line to target a specific company
$company = Company::find(2); // Your company ID

// Or find by slug
$company = Company::where('slug', 'your-company-slug')->first();
```

### Option 2: Add Reviews Manually via Tinker

```bash
php artisan tinker
```

```php
$review = new App\Models\Review();
$review->company_id = 1; // Your company ID
$review->reviewer_name = 'Your Name';
$review->reviewer_email = 'email@example.com';
$review->reviewer_company = 'Company Name';
$review->rating = 5;
$review->title = 'Review Title';
$review->comment = 'Your review comment here';
$review->verified = true;
$review->save();
```

## Troubleshooting

### Error: "No company found"
- Make sure you have at least one company in the database
- Check: `php artisan tinker` then `App\Models\Company::count();`

### Error: "Class 'ReviewsSeeder' not found"
- Run: `composer dump-autoload`
- Try again: `php artisan db:seed --class=ReviewsSeeder`

### Reviews Not Showing on Frontend
1. Check API works: `curl http://localhost:8000/api/suppliers/1/reviews`
2. Clear Laravel cache: `php artisan cache:clear`
3. Restart frontend dev server: `npm run dev`
4. Check browser console for errors

## Next: Update Frontend to Use Dynamic Reviews

The frontend storefront page will need to be updated to fetch reviews from the API instead of using static settings JSON. See `COMPANY_REVIEWS_DYNAMIC_INTEGRATION.md` for full details.

## Summary

✅ **What You Just Did:**
- Created a seeder with 10 realistic sample reviews
- Each review has:
  - Reviewer name and company
  - Rating (3-5 stars)
  - Title and detailed comment
  - Verified purchase status
  - Supplier response (some reviews)
  - Different dates (spread over 120 days)

🎯 **Result:**
- Reviews are now in your database
- API endpoints return real data
- Ready to display on storefront!
