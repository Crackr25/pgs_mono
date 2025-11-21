# Company Reviews - Dynamic Database Integration ✅

## Overview
The Company Reviews section now fetches **real reviews from the database** instead of using static JSON data. This guide explains how the system works and how to use it.

## Database Schema

### `reviews` Table
```sql
- id (primary key)
- company_id (foreign key to companies)
- order_id (foreign key to orders, nullable)
- reviewer_name (string)
- reviewer_email (string)
- reviewer_company (string, nullable)
- rating (integer, 1-5)
- title (string, nullable)
- comment (text)
- verified (boolean, default: false)
- response (text, nullable) - Supplier can respond to reviews
- created_at (timestamp)
- updated_at (timestamp)
```

## API Endpoints

### 1. Get Company Reviews
**Endpoint:** `GET /api/suppliers/{company_id}/reviews`

**Query Parameters:**
- `page` - Page number (default: 1)
- `per_page` - Items per page (default: 10)
- `rating` - Filter by specific rating (1-5)
- `verified_only` - Show only verified reviews (true/false)

**Response:**
```json
{
  "data": [
    {
      "id": 1,
      "reviewer_name": "John Smith",
      "reviewer_company": "ABC Manufacturing",
      "reviewer_email": "john@abc.com",
      "rating": 5,
      "title": "Excellent Service",
      "comment": "Great quality products and fast shipping!",
      "verified": true,
      "response": "Thank you for your feedback!",
      "date": "2025-01-15",
      "formatted_date": "Jan 15, 2025",
      "order_id": 123
    }
  ],
  "current_page": 1,
  "last_page": 5,
  "per_page": 10,
  "total": 45,
  "from": 1,
  "to": 10
}
```

### 2. Get Review Statistics
**Endpoint:** `GET /api/suppliers/{company_id}/reviews/stats`

**Response:**
```json
{
  "total_reviews": 156,
  "average_rating": 4.7,
  "rating_breakdown": {
    "5": 95,
    "4": 40,
    "3": 15,
    "2": 4,
    "1": 2
  },
  "rating_percentage": {
    "5": 60.9,
    "4": 25.6,
    "3": 9.6,
    "2": 2.6,
    "1": 1.3
  },
  "verified_reviews": 134,
  "verified_percentage": 85.9
}
```

## Frontend Integration

### Using the API Service
```javascript
import apiService from '@/lib/api';

// In your component
const [reviews, setReviews] = useState([]);
const [reviewStats, setReviewStats] = useState(null);
const [loading, setLoading] = useState(true);

useEffect(() => {
  const fetchReviews = async () => {
    try {
      const companyId = company.id;
      
      // Fetch review statistics
      const stats = await apiService.getSupplierReviewStats(companyId);
      setReviewStats(stats);
      
      // Fetch paginated reviews
      const reviewsData = await apiService.getSupplierReviews(companyId, {
        page: 1,
        per_page: 10,
        verified_only: false
      });
      setReviews(reviewsData.data);
      
    } catch (error) {
      console.error('Failed to fetch reviews:', error);
    } finally {
      setLoading(false);
    }
  };
  
  fetchReviews();
}, [company.id]);
```

### Filtering Reviews
```javascript
// Filter by rating
const filterByRating = async (rating) => {
  const reviewsData = await apiService.getSupplierReviews(companyId, {
    rating: rating,
    per_page: 10
  });
  setReviews(reviewsData.data);
};

// Show only verified reviews
const showVerifiedOnly = async () => {
  const reviewsData = await apiService.getSupplierReviews(companyId, {
    verified_only: true,
    per_page: 10
  });
  setReviews(reviewsData.data);
};
```

## Creating Reviews (For Testing)

### Method 1: Using Laravel Tinker
```bash
cd packages/backend
php artisan tinker
```

```php
// Create a review
$review = new App\Models\Review();
$review->company_id = 1; // Your company ID
$review->reviewer_name = 'John Smith';
$review->reviewer_email = 'john@example.com';
$review->reviewer_company = 'ABC Manufacturing';
$review->rating = 5;
$review->title = 'Excellent Service';
$review->comment = 'Great quality products and fast shipping!';
$review->verified = true;
$review->save();
```

### Method 2: Using Database Seeder
Create a seeder file:
```bash
cd packages/backend
php artisan make:seeder ReviewsSeeder
```

Edit `database/seeders/ReviewsSeeder.php`:
```php
<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use App\Models\Review;
use App\Models\Company;

class ReviewsSeeder extends Seeder
{
    public function run()
    {
        $company = Company::first(); // Or find by ID
        
        $reviews = [
            [
                'company_id' => $company->id,
                'reviewer_name' => 'John Smith',
                'reviewer_email' => 'john@abc.com',
                'reviewer_company' => 'ABC Manufacturing',
                'rating' => 5,
                'title' => 'Excellent Service',
                'comment' => 'Great quality products and fast shipping!',
                'verified' => true,
            ],
            [
                'company_id' => $company->id,
                'reviewer_name' => 'Maria Garcia',
                'reviewer_email' => 'maria@xyz.com',
                'reviewer_company' => 'XYZ Industries',
                'rating' => 4,
                'title' => 'Good Quality',
                'comment' => 'Products are good but delivery took a bit longer than expected.',
                'verified' => true,
            ],
            // Add more reviews...
        ];
        
        foreach ($reviews as $reviewData) {
            Review::create($reviewData);
        }
    }
}
```

Run the seeder:
```bash
php artisan db:seed --class=ReviewsSeeder
```

## Storefront Configuration

### Adding Company Reviews Section

1. Go to **Dashboard → Storefront → Pages**
2. Click on a page to edit (or create new page)
3. Click **"Add Section"**
4. Select **"⭐ Company Reviews"** from the dropdown
5. Configure the section:
   - **Title:** "Supplier Reviews" (or custom title)
   - **Status:** Active
   - **Display Order:** Set position

### Section Settings (Optional JSON Override)

If you want to override the dynamic data with custom static reviews, you can add this to the settings JSON:

```json
{
  "reviews": [
    {
      "author": "John Doe",
      "rating": 5,
      "comment": "Excellent supplier!",
      "country": "USA",
      "date": "2025-01-15",
      "product": "LED Light Fixture",
      "verified": true
    }
  ],
  "overall_rating": 4.8
}
```

**Note:** If settings JSON is provided, it will take priority over database reviews. Leave settings empty to use dynamic database reviews.

## Features

### ✅ What's Working
- **Real-time Reviews:** Fetched directly from the database
- **Verified Badge:** Shows which reviews are verified purchases
- **Rating Breakdown:** Automatic calculation of star distribution
- **Pagination:** Supports loading reviews in batches
- **Filtering:** Filter by rating and verification status
- **Supplier Response:** Display supplier responses to reviews
- **Average Rating:** Auto-calculated from all reviews

### 🔄 Automatic Updates
- When new reviews are added to the database, they appear immediately
- Rating statistics update automatically
- No manual JSON editing required

## Backend Code Changes

### SupplierController.php
- **`reviews()`** method now fetches from database
- **`reviewStats()`** method provides aggregated statistics
- **`calculateRatingBreakdown()`** calculates real rating distribution

### API Routes (api.php)
```php
Route::get('/suppliers/{id}/reviews', [SupplierController::class, 'reviews']);
Route::get('/suppliers/{id}/reviews/stats', [SupplierController::class, 'reviewStats']);
```

### Frontend API Service (lib/api.js)
```javascript
async getSupplierReviews(supplierId, params = {})
async getSupplierReviewStats(supplierId)
```

## Migration Path

### From Static JSON to Dynamic
1. **Keep settings JSON empty** in StorefrontSection
2. Reviews will automatically fetch from database
3. If no reviews exist yet, seed some test reviews
4. Frontend will display "No reviews yet" if database is empty

### Hybrid Approach (Optional)
- Use **settings JSON** for featured/curated reviews
- Use **database** for all customer reviews
- Frontend can merge both sources if needed

## Troubleshooting

### No Reviews Showing Up?
1. Check if reviews exist in database:
   ```bash
   php artisan tinker
   >>> App\Models\Review::where('company_id', 1)->count();
   ```

2. Verify API endpoint works:
   ```
   GET http://localhost:8000/api/suppliers/1/reviews
   ```

3. Check browser console for errors

### Reviews Not Updating?
- Clear Laravel cache: `php artisan cache:clear`
- Restart dev server
- Check network tab in browser DevTools

## Next Steps (Optional Enhancements)

### 1. Add Review Form
- Allow buyers to submit reviews after purchase
- Create `POST /api/reviews` endpoint
- Add modal/form in frontend

### 2. Image Upload
- Add `images` JSON field to reviews table
- Allow customers to upload photos
- Display product images in reviews

### 3. Helpful Votes
- Add upvote/downvote feature
- Track "Was this review helpful?"
- Sort by helpfulness

### 4. Review Moderation
- Add admin approval workflow
- Flag inappropriate reviews
- Edit/delete reviews dashboard

## Summary

✅ **Reviews are now fully dynamic!**
- Data comes from the `reviews` table
- Real-time statistics and ratings
- No manual JSON management needed
- Easy to add new reviews via API or database

🎯 **To use it:**
1. Add some reviews to the database (using seeder or Tinker)
2. Create a Company Reviews section in page builder
3. Reviews will automatically appear on the storefront

📊 **Data Flow:**
```
Database (reviews table) 
  ↓
API Endpoint (/api/suppliers/{id}/reviews)
  ↓
Frontend (StorefrontSection component)
  ↓
Display on Storefront
```
