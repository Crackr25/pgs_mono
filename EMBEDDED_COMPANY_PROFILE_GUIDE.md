# Embedded Company Profile Feature

## Overview
This feature allows you to embed your full supplier profile page (like the ANRABESS design) directly into your storefront navigation. When visitors click on a navigation item with this option enabled, they'll see your complete company profile with sidebar, products, reviews, and all company information.

## How to Use

### Step 1: Create a Navigation Item
1. Go to your **Dashboard** → **Storefront** → **Navigation Manager**
2. Click **"Create Menu Item"**
3. Fill in the details:
   - **Label**: Enter the menu name (e.g., "Company Profile")
   - **Type**: Select **"Page"**
   - **Target**: Enter a slug (e.g., "companyprofile" or "about")
   - **Visible**: Check to make it visible
   - **Show Dropdown**: Optional, for dropdown menus

### Step 2: Enable Embedded Company Profile
In the same form, you'll see a new section:

```
🏢 Embed Company Profile [NEW]
☑ Load supplier profile page design (like ANRABESS) when this menu is clicked
```

**Check this box** to enable the embedded company profile feature.

### Step 3: Save and Test
1. Click **"Create Menu Item"** to save
2. Visit your storefront: `http://localhost:3000/store/your-slug/homepage`
3. Click on the navigation item you just created
4. You should see your full company profile page load!

## What Gets Displayed

When the embedded profile is shown, visitors will see:

### Sidebar (Left):
- 🏢 Company Card
  - Company logo
  - Company name
  - Years in business badge
  - Star rating and reviews count
- 📊 Company Statistics
  - Total products
  - Response time
  - Total orders
- 📞 Contact Information
  - Address
  - Phone
  - Email
  - Website
- 📋 Business Information
  - Business type
  - Main products
  - Total employees
  - Year established

### Main Content (Right):
- 📸 Company Banner/Cover Image
- 🔍 Product Search Bar
- 📑 Navigation Tabs:
  - Products
  - Company Profile
  - Trade Capacity
- 🛍️ Featured Products Grid
  - Product images with carousel
  - Product names and descriptions
  - Prices and "Add to Cart" buttons

## Technical Details

### Files Modified:
1. **navigation-v2.js** - Added checkbox UI in Navigation Manager
2. **[page].js** - Detects embed flag and renders component
3. **EmbeddedSupplierProfile.js** - New component with full profile UI

### Database:
- Added `embed_company_profile` column to `storefront_menu_items` table
- Migration file: `2025_11_18_000000_add_embed_company_profile_to_storefront_menu_items.php`

### API Endpoints Used:
- `/api/suppliers/{id}` - Fetch supplier details
- `/api/suppliers/{id}/products` - Fetch supplier products
- `/api/suppliers/{id}/reviews` - Fetch supplier reviews

## Example URL Structure

```
# Storefront homepage
http://localhost:3000/store/anrabess/homepage

# Navigation item with embedded profile
http://localhost:3000/store/anrabess/companyprofile
                                    └─────┬────┘
                                          └─ The slug you set in Navigation Manager
```

## Customization

The embedded profile automatically uses:
- Your company's primary color for buttons and accents
- Your uploaded company logo
- Your company banner image
- Your product catalog
- Your company information from the database

## Tips

1. **Use descriptive slugs**: Use names like "about", "profile", "company" for the target slug
2. **Navigation placement**: Place this item prominently in your navigation menu
3. **Multiple profiles**: You can create multiple navigation items with this feature if needed
4. **Testing**: Always test on your storefront after creating the navigation item

## Troubleshooting

### Profile not showing?
- Make sure the checkbox is checked
- Verify the navigation item is visible
- Check that your company has products and information filled in
- Clear browser cache and reload

### Products not displaying?
- Ensure your company has active products
- Check product images are uploaded correctly
- Verify products are marked as visible/active

### Styling issues?
- The component uses your storefront's primary color
- Check that your company logo and banner are uploaded
- Ensure images are in the correct format (JPG, PNG)

## Future Enhancements

Potential additions:
- Customizable tab sections
- Featured product selection
- Custom company profile content blocks
- Social media integration
- Download company brochure button
- Contact form integration

---

**Created**: November 2025  
**Last Updated**: November 2025  
**Version**: 1.0
