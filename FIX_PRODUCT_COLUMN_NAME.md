# Fix: Product Column Name Mismatch

## Issue
API was failing with error:
```
SQLSTATE[42S22]: Column not found: 1054 Unknown column 'main_image' in 'field list'
```

## Root Cause
The code was looking for `main_image` and `images` columns in the products table, but the actual column name is `image` (singular, no "main_" prefix).

## Fix Applied

### Backend Changes

**File:** `packages/backend/app/Http/Controllers/Api/SupplierController.php`

**Before:**
```php
->with('product:id,name,category,main_image,images')

'main_image' => $review->product->main_image,
'images' => $review->product->images,
```

**After:**
```php
->with('product:id,name,category,image')

'image' => $review->product->image,
```

### Frontend Changes

**File:** `packages/frontend/pages/store/[slug]/[page].js`

**Before:**
```javascript
const productImage = review.product?.main_image 
  ? getImageUrl(review.product.main_image)
  : review.product?.images?.[0]
    ? getImageUrl(review.product.images[0])
    : null;
```

**After:**
```javascript
const productImage = review.product?.image 
  ? getImageUrl(review.product.image)
  : null;
```

## Products Table Schema

Confirmed column names:
```
products
├── id
├── company_id
├── name
├── category
├── image          ← Single image column (not main_image)
├── description
├── specs
├── price
├── moq
├── lead_time
├── hs_code
├── origin_country
├── brand_name
├── model_number
├── warranty
├── variants
├── videos
├── stock_quantity
├── unit
└── active
```

## Testing

### Test API Endpoint:
```bash
curl http://localhost:8000/api/suppliers/11/reviews
```

**Expected Response:**
```json
{
  "data": [
    {
      "id": 1,
      "reviewer_name": "Michael Chen",
      "rating": 5,
      "product": {
        "id": 54,
        "name": "Womens Polo V Neck Long Sleeve Sweaters",
        "category": "apparel",
        "image": "products/1732105814_sweater.jpg"
      }
    }
  ]
}
```

### Test Frontend:
Visit: `http://localhost:3000/store/anrabess/apparelreviews`

Should now display:
- ✅ Product images in reviews
- ✅ Product names (clickable)
- ✅ No API errors
- ✅ Proper image URLs

## Status
✅ **FIXED** - Reviews with products now display correctly!
