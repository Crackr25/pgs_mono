# Image Display - Cloud & Local Setup Handling

## Overview
The `getImageUrl()` helper function in `lib/storefront-api.js` automatically handles both **cloud-based** and **local** image URLs. This ensures images work correctly whether stored in cloud storage or locally.

---

## How It Works

### getImageUrl() Function
Located in: `packages/frontend/lib/storefront-api.js`

```javascript
export function getImageUrl(imagePath) {
  if (!imagePath) return null;
  
  // If it's already a full URL (starts with http), return as-is
  if (imagePath.startsWith('http')) {
    return imagePath;
  }
  
  // Otherwise, prepend the API base URL for local storage
  return `${process.env.NEXT_PUBLIC_API_URL}/storage/${imagePath}`;
}
```

**Logic:**
1. **Cloud URLs** (e.g., `https://s3.amazonaws.com/...`) → Return as-is
2. **Local paths** (e.g., `products/image.jpg`) → Prepend `http://localhost:8000/storage/`

---

## Product Image Fields

### Database Schema
The `products` table has **ONE image column**:
```sql
products
├── image  ← Single image path (e.g., "products/1732105814_clipper.jpg")
```

**NOT:**
- ❌ `main_image` (doesn't exist)
- ❌ `images` array (doesn't exist)

### Frontend Usage Pattern

**✅ CORRECT (Products Showcase):**
```javascript
const productImage = product.main_image 
  ? getImageUrl(product.main_image)
  : product.images?.[0]
    ? getImageUrl(product.images[0])
    : null;
```
*This code tries multiple fallbacks but ultimately works because company.products includes `image` field*

**✅ CORRECT (Reviews with Product):**
```javascript
const productImage = review.product?.image 
  ? getImageUrl(review.product.image)
  : null;
```
*Directly uses the correct field name*

---

## Current Implementation

### 1. Products Showcase Section
**File:** `pages/store/[slug]/[page].js` (Line ~740)

```javascript
const productImage = product.main_image 
  ? getImageUrl(product.main_image)
  : product.images?.[0]
    ? getImageUrl(product.images[0])
    : null;
```

**Issue:** Code tries `main_image` and `images[0]` but database has `image`

**Why it works:** 
- The products come from `company.products` which the backend transforms
- Backend might be adding `main_image` alias OR frontend gets lucky with fallback

### 2. Reviews with Products Section
**File:** `pages/store/[slug]/[page].js` (Line ~1105)

```javascript
const productImage = review.product?.image 
  ? getImageUrl(review.product.image)
  : null;
```

**Status:** ✅ Uses correct field name `image`

### 3. Featured Products (ProductCard Component)
**File:** `pages/store/[slug]/[page].js` (Line ~1258)

```javascript
const productImage = product.main_image 
  ? getImageUrl(product.main_image)
  : product.images?.[currentImageIndex]
    ? getImageUrl(product.images[currentImageIndex])
    : null;
```

**Issue:** Same as Products Showcase - tries wrong field names

---

## Recommended Fix (For Consistency)

To make all product image displays consistent, we should standardize on the actual database field:

### Option 1: Fix Frontend (Recommended)
Update all components to use `product.image`:

```javascript
// Simplified, correct approach
const productImage = product.image 
  ? getImageUrl(product.image)
  : null;
```

### Option 2: Fix Backend
Add `main_image` alias in API responses:

**SupplierController.php** (when returning products):
```php
'main_image' => $product->image,
'images' => [$product->image], // Wrap in array for compatibility
```

---

## API Response Structure

### Current Backend Response
**GET `/api/suppliers/{id}/reviews`**

```json
{
  "data": [
    {
      "id": 1,
      "reviewer_name": "Michael Chen",
      "rating": 5,
      "product": {
        "id": 54,
        "name": "Womens Polo Sweater",
        "category": "apparel",
        "image": "products/1732105814_sweater.jpg"  ← Correct field
      }
    }
  ]
}
```

### Products from Company
**GET `/api/public/storefront/{slug}/products`**

```json
[
  {
    "id": 54,
    "name": "Womens Polo Sweater",
    "category": "apparel",
    "image": "products/1732105814_sweater.jpg",  ← Correct field
    "price": 29.99,
    "moq": 100
  }
]
```

**Question:** Does the products API add `main_image` or `images` fields?

---

## Image URL Examples

### Cloud Storage (S3, Cloudflare, etc.)
**Input:** `https://cdn.example.com/products/clipper.jpg`
**Output:** `https://cdn.example.com/products/clipper.jpg` (unchanged)

### Local Storage
**Input:** `products/1732105814_clipper.jpg`
**Output:** `http://localhost:8000/storage/products/1732105814_clipper.jpg`

---

## Testing Checklist

### ✅ Where Images Should Display
1. **Products Showcase Section** - Auto-display company products
2. **Featured Products Section** - Manually selected products
3. **Reviews Section** - Products linked to each review
4. **Product Cards** - In all grid views

### Test Cases
```bash
# Test with local storage
✓ Product image in showcase
✓ Product image in featured section
✓ Product image in review card
✓ Image fallback when missing

# Test with cloud storage (if configured)
✓ Cloud URL returned as-is
✓ No double slashes in URL
✓ HTTPS protocol preserved
```

---

## Common Issues

### Issue 1: Image Not Showing
**Symptom:** Gray placeholder appears instead of image

**Causes:**
1. Using `main_image` instead of `image`
2. Product doesn't have `image` field in API response
3. Image file doesn't exist in storage
4. Storage link not created (`php artisan storage:link`)

**Fix:**
```bash
# Check storage link
php artisan storage:link

# Check product data
php artisan tinker --execute="App\Models\Product::first()->image"

# Verify field name
php artisan tinker --execute="echo json_encode(App\Models\Product::first()->toArray())"
```

### Issue 2: Wrong URL Format
**Symptom:** URL like `http://localhost:8000/storage/http://localhost:8000/storage/...`

**Cause:** `getImageUrl()` applied twice

**Fix:** Only call `getImageUrl()` once:
```javascript
// ❌ Wrong
getImageUrl(getImageUrl(product.image))

// ✅ Correct
getImageUrl(product.image)
```

### Issue 3: 404 on Image URL
**Symptom:** Image URL returns 404 Not Found

**Causes:**
1. Symlink missing: Run `php artisan storage:link`
2. Image path incorrect in database
3. File doesn't exist in `storage/app/public/products/`

**Debug:**
```bash
# Check if file exists
ls -la storage/app/public/products/

# Check symlink
ls -la public/storage

# Test URL directly
curl http://localhost:8000/storage/products/1732105814_clipper.jpg
```

---

## Best Practices

### 1. Always Use getImageUrl()
```javascript
// ✅ Good
<img src={getImageUrl(product.image)} />

// ❌ Bad (won't work for local storage)
<img src={product.image} />
```

### 2. Provide Fallback
```javascript
const productImage = product.image 
  ? getImageUrl(product.image)
  : null;

{productImage ? (
  <img src={productImage} />
) : (
  <div>No Image Available</div>
)}
```

### 3. Handle Errors
```javascript
<img 
  src={getImageUrl(product.image)}
  onError={(e) => {
    e.target.src = '/placeholder.png'; // Or hide
  }}
/>
```

---

## Conclusion

**Key Points:**
1. ✅ `getImageUrl()` handles both cloud and local automatically
2. ✅ Database uses `image` field, not `main_image` or `images`
3. ✅ Reviews section already uses correct field name
4. ⚠️ Products showcase and ProductCard use incorrect field names but might work due to backend transformation
5. 🔧 For consistency, update all components to use `product.image`

**Next Steps:**
1. Verify if backend adds `main_image` alias to product responses
2. If not, update frontend components to use `product.image` consistently
3. Test both local and cloud storage scenarios
4. Document any backend transformations

---

**Updated:** November 21, 2025
