# Cloud Review Seeder Setup Guide

## Quick Commands to Run on Cloud Server

### Option 1: Run Only Review Seeder (Recommended)
```bash
cd packages/backend
php artisan db:seed --class=SmartReviewsSeeder
```

This will:
- ✅ Generate 3-10 reviews per company (based on product count)
- ✅ Link each review to a specific product
- ✅ Create realistic B2B buyer profiles
- ✅ Generate 70% 4-5 star ratings (weighted distribution)
- ✅ Include supplier responses (70% for good ratings, 90% for average)
- ✅ Mark 80% as verified purchases
- ✅ Spread reviews over the last 6 months

### Option 2: Run All Seeders
```bash
cd packages/backend
php artisan db:seed
```

This will run:
1. OrderSeeder
2. ComprehensiveQuoteRFQSeeder
3. **SmartReviewsSeeder** (newly added)

---

## SSH Steps

1. **Connect to your cloud server:**
   ```bash
   ssh your-username@your-server-ip
   ```

2. **Navigate to your project:**
   ```bash
   cd /path/to/your/pgs_mono/packages/backend
   ```

3. **Run the seeder:**
   ```bash
   php artisan db:seed --class=SmartReviewsSeeder
   ```

4. **Verify it worked:**
   ```bash
   php artisan tinker
   ```
   Then in tinker:
   ```php
   \App\Models\Review::count();
   \App\Models\Review::where('verified', true)->count();
   \App\Models\Review::avg('rating');
   exit
   ```

---

## Expected Output

You should see output like this:

```
🌱 Starting Smart Reviews Seeding...

📊 Company A: Generating 7 reviews...
   ✅ Created 7 reviews
   ⭐ Average Rating: 4.4/5
   ✓ Verified: 6/7

📊 Company B: Generating 5 reviews...
   ✅ Created 5 reviews
   ⭐ Average Rating: 4.6/5
   ✓ Verified: 4/5

🎉 Seeding Complete!
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
📈 Total Reviews Created: 107
🏢 Companies with Reviews: 33
⭐ Overall Average Rating: 4.4/5
✓ Total Verified Reviews: 93
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
```

---

## Troubleshooting

### Error: "Class SmartReviewsSeeder does not exist"
**Solution:** Run composer dump-autoload first:
```bash
composer dump-autoload
php artisan db:seed --class=SmartReviewsSeeder
```

### Error: "No companies with products found"
**Solution:** You need to add products to companies first. The seeder requires products to exist.

### Error: Database connection issues
**Solution:** Check your `.env` file has correct database credentials:
```bash
php artisan config:clear
php artisan cache:clear
```

---

## What the Seeder Creates

### 20 Realistic B2B Buyers
- Michael Chen (Pacific Trading International)
- Sarah Martinez (Global Sourcing Solutions)
- David Thompson (American Wholesale Group)
- ... and 17 more international buyers

### Product-Specific Reviews
The seeder generates contextually relevant reviews based on product category:
- **Apparel**: Comments about fabric, fit, stitching
- **Electronics**: Battery life, build quality, performance
- **Metals**: Dimensions, rust resistance, ASTM standards
- **Machinery**: Engineering, operation, durability
- **Furniture**: Construction, finish, assembly
- ... and more

### Smart Distribution
- 50% give 5 stars
- 35% give 4 stars
- 15% give 3 stars
- 80% are verified purchases
- 70% of 4-5 star reviews get supplier responses
- Reviews spread over last 6 months

---

## After Running the Seeder

Visit your storefront review pages to see the results:
```
https://your-domain.com/store/[company-slug]/reviews
```

Example:
```
https://your-domain.com/store/anrabess/apparelreviews
```

You should see:
- ✅ Overall rating card with breakdown
- ✅ Individual reviews with product cards
- ✅ Clickable product images and names
- ✅ Verified purchase badges
- ✅ Supplier responses
- ✅ Rating distribution chart

---

## Notes

- The seeder is **safe to run multiple times** - it will add new reviews each time
- Reviews are linked to actual products in your database
- Each review has a unique buyer (no duplicates per company)
- Review dates are randomized within the last 6 months
- Supplier responses appear 1-7 days after the review

---

## Files Updated

1. ✅ `SmartReviewsSeeder.php` - The main seeder file
2. ✅ `DatabaseSeeder.php` - Now includes SmartReviewsSeeder
3. ✅ `SupplierController.php` - API returns reviews with product data
4. ✅ `[page].js` - Frontend displays reviews with clickable product cards
5. ✅ `Review.php` - Model with product relationship

---

## Support

If you encounter any issues, check:
1. Database connection is working
2. Companies have products added
3. Review migration has run (`reviews` table exists with `product_id` column)
4. Composer autoload is current

Run these diagnostic commands:
```bash
php artisan migrate:status
php artisan config:cache
composer dump-autoload
```
