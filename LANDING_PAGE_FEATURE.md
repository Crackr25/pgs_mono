# Landing Page Feature (WordPress-Style)

## Overview
This feature allows storefront owners to select a specific page as their landing page, similar to WordPress's "Front Page" setting. When visitors click the company name in the header, they will be redirected to the selected landing page instead of the default homepage.

## How It Works

### Backend Changes

1. **Database Migration** (`2025_11_17_000000_add_landing_page_to_company_storefronts.php`)
   - Added `landing_page_id` column to `company_storefronts` table
   - Foreign key relationship to `storefront_pages` table
   - Nullable field (can be unset)

2. **Model Updates** (`CompanyStorefront.php`)
   - Added `landing_page_id` to fillable array
   - Added `landingPage()` relationship method
   - Returns the associated StorefrontPage model

3. **Controller Updates**
   - `StorefrontController.php`: Added `landing_page_id` validation in update method
   - `PublicStorefrontController.php`: Included `landingPage` relationship in API response

### Frontend Changes

1. **Storefront Settings Page** (`/dashboard/storefront/index.js`)
   - Added landing page dropdown selector
   - Fetches available pages from API
   - Shows preview of the landing page URL
   - Saves `landing_page_id` when updating storefront

2. **Public Storefront View** (`/store/[slug].js`)
   - Checks for `landing_page` in storefront data
   - Uses landing page if set, otherwise falls back to finding 'homepage', 'home', or 'home-page' slug
   - Company name link in header redirects to:
     - `/store/{slug}/{landing_page_slug}` if landing page is set
     - `/store/{slug}` if no landing page is set

## Usage

### For Storefront Owners

1. Go to **Dashboard > Storefront Settings**
2. Create pages in **Pages Manager** (e.g., "Home", "About Us", "Services")
3. In Storefront Settings, find the **Landing Page** dropdown
4. Select which page should be your homepage
5. Click **Save Settings**

### Example Scenarios

**Scenario 1: E-commerce Store**
- Landing page: "Shop" page with featured products
- When visitors click company name → `/store/anrabess/shop`

**Scenario 2: Service Business**
- Landing page: "Services" page with service offerings
- When visitors click company name → `/store/acme-services/services`

**Scenario 3: Blog/Content Site**
- Landing page: "Blog" page with latest posts
- When visitors click company name → `/store/techblog/blog`

**Scenario 4: Default (No Landing Page Set)**
- No landing page selected
- When visitors click company name → `/store/anrabess` (default homepage with legacy sections or auto-detected homepage)

## API Changes

### GET /api/public/storefront/{slug}
Response now includes:
```json
{
  "id": 1,
  "slug": "anrabess",
  "landing_page_id": 5,
  "landing_page": {
    "id": 5,
    "title": "Home",
    "slug": "homepage",
    "is_active": true
  },
  ...
}
```

### PUT /api/storefronts/{id}
Now accepts:
```json
{
  "landing_page_id": 5,
  ...
}
```

## Benefits

1. **Flexibility**: Change your homepage without rebuilding sections
2. **WordPress-like**: Familiar UX for users coming from WordPress
3. **Marketing**: Easily create seasonal landing pages (e.g., holiday sales page)
4. **A/B Testing**: Quickly switch between different homepage designs
5. **Multi-purpose**: Different pages for different campaigns

## Notes

- If landing page is deleted, the foreign key constraint sets `landing_page_id` to NULL automatically
- The system falls back to legacy behavior (showing sections with `page_id = null`) if no landing page is set
- Only active pages appear in the landing page dropdown
- The landing page must belong to the same storefront

## Migration Status

✅ Database migration completed
✅ Model relationships added
✅ API endpoints updated
✅ Frontend UI implemented
✅ Public storefront view updated
