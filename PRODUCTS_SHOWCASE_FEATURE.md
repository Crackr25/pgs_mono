# Products Showcase - Product Selection Feature

## Overview
Enhanced the Products Showcase section to allow manual selection of specific products to display, in addition to the existing automatic display mode.

## Features Added

### 1. Display Modes
- **Automatic Mode (Default)**: Shows latest products with a configurable limit (4, 8, 12, 16, 20, or all products)
- **Manual Mode**: Allows you to select specific products to display in a custom order

### 2. Product Selector Component
A new UI component that:
- Displays all your products with images, names, categories, and prices
- Allows you to select/deselect products by clicking on them
- Shows selection count
- Includes search functionality to filter products
- Visual feedback for selected products (blue highlight)

## How to Use

### Setting Up a Products Showcase Section

1. **Go to Storefront Sections**
   - Navigate to Dashboard → Storefront → Sections

2. **Add or Edit a Products Showcase Section**
   - Click "Add Section" and select "Featured Products"
   - Or edit an existing Products Showcase section

3. **Choose Display Mode**
   - **Automatic Mode**: 
     - Select "Automatic - Show Latest Products"
     - Choose how many products to display (4, 8, 12, 16, 20, or all)
     - Your latest products will be automatically displayed
   
   - **Manual Mode**:
     - Select "Manual - Select Specific Products"
     - A product selector will appear showing all your products
     - Click on products to select/deselect them
     - Use the search box to find specific products
     - Selected products will be highlighted in blue
     - Products will display in the order you selected them

4. **Configure Other Settings**
   - Add a title (e.g., "Our Featured Products", "Best Sellers")
   - Add optional description text
   - Check/uncheck "Show this section on the storefront"

5. **Save**
   - Click "Add Section" or "Update Section"

## Technical Implementation

### Files Modified

1. **`packages/frontend/pages/dashboard/storefront/sections.js`**
   - Added display mode selector (automatic/manual)
   - Added `ProductSelector` component for product selection
   - Modified settings to store `display_mode` and `selected_products` array

2. **`packages/frontend/pages/store/[slug].js`**
   - Updated products_showcase rendering logic
   - Checks `display_mode` setting
   - Shows selected products if in manual mode
   - Shows latest products with limit if in automatic mode

3. **`packages/frontend/pages/store/[slug]/[page].js`**
   - Added products_showcase section support for custom pages
   - Same display logic as main storefront

### Data Structure

The section settings now include:
```json
{
  "display_mode": "auto" | "selected",
  "products_limit": 8,  // Only used in auto mode
  "selected_products": [1, 5, 12, 8]  // Product IDs in manual mode
}
```

## Benefits

1. **Full Control**: Choose exactly which products to showcase
2. **Custom Ordering**: Products display in the order you select them
3. **Flexibility**: Switch between automatic and manual modes anytime
4. **Easy Management**: Visual product selector with search
5. **No Coding Required**: All done through the UI

## Example Use Cases

1. **Featured Products**: Manually select your best-selling or most profitable products
2. **Seasonal Promotions**: Select products for current season/promotion
3. **Category Highlights**: Select products from a specific category
4. **New Arrivals**: Use automatic mode to always show latest products
5. **Mixed Strategy**: Use both modes on different pages (e.g., manual for homepage, auto for product pages)

## Notes

- Products that are deleted from your catalog will be automatically removed from the selected products list
- The product selector shows all active products in your catalog
- Search works on product name and category
- Selected products are stored by ID, so if you update product details, the showcase will reflect the changes
- Images and videos can still be added to the section for additional visual content

## Future Enhancements (Possible)

- Drag-and-drop reordering of selected products
- Category-based auto filtering
- Sort options (by price, name, date added)
- Product preview in the section editor
