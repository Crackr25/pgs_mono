# Dynamic-Style Storefront Navigation & Page Builder

## 🎯 Overview

Your storefront now works **exactly like Dynamic**:
- Create **custom pages** (About Us, Contact, Services, etc.)
- Build **custom navigation menus** with your own labels
- Add **sections to each page** using Page Builder
- **Drag & drop** to reorder menu items and sections

---

## 📋 Database Structure

### Tables Created:
1. **`storefront_menu_items`** - Custom navigation menu
2. **`storefront_pages`** - Individual pages (like Dynamic pages)
3. **`storefront_sections`** - Now linked to pages (not just storefront)

---

## 🚀 How It Works

### 1. Create Custom Pages

**Dashboard → Storefront → Pages**

Create pages like:
- **Home** (slug: `home`)
- **About Us** (slug: `about-us`)
- **Our Services** (slug: `services`)
- **Contact** (slug: `contact`)
- **Products** (slug: `products`)
- **Gallery** (slug: `gallery`)

Each page has:
- **Title**: Display name
- **Slug**: URL-friendly name (`/store/yourstore/about-us`)
- **Meta Description**: SEO description
- **Meta Keywords**: SEO keywords
- **Sections**: Content blocks you add

---

### 2. Build Page Content

**Dashboard → Storefront → Pages → [Select Page] → Page Builder**

For each page, add sections:

**Example: "About Us" Page**
```
Sections:
1. Hero Section (Welcome image)
2. Heading Section (Company Story)
3. Text Section (Our mission and values)
4. Team Section (Meet our team)
5. Gallery Section (Office photos)
```

**Example: "Contact" Page**
```
Sections:
1. Heading Section (Get In Touch)
2. Contact Section (Form + map)
3. Text Section (Office hours)
```

**Example: "Products" Page**
```
Sections:
1. Banner Section (Products header)
2. Products Showcase (8 products)
3. Text Section (Custom order info)
4. Contact Section (Inquiry form)
```

---

### 3. Create Custom Navigation Menu

**Dashboard → Storefront → Navigation**

Add menu items:

| Label | Type | Target | Dropdown |
|-------|------|--------|----------|
| Home | Page | home | No |
| Our Products | Page | products | Yes |
| About Us | Page | about-us | Yes |
| Services | Page | services | No |
| Gallery | Page | gallery | No |
| Contact Us | Page | contact | No |

**Menu Item Types:**
- **Page**: Links to a custom page (`/store/yourstore/about-us`)
- **Section**: Scrolls to section on current page (`#products`)
- **External**: Links to external URL (`https://...`)

---

## 💻 Implementation Steps

### Step 1: Run Migration

```bash
cd packages/backend
php artisan migrate
```

This creates:
- `storefront_menu_items` table
- `storefront_pages` table
- Adds `page_id` to `storefront_sections`

---

### Step 2: Add Routes

**File: `packages/backend/routes/api.php`**

```php
// Storefront Pages
Route::middleware(['auth:sanctum'])->group(function () {
    Route::get('/storefront/pages', [StorefrontPageController::class, 'index']);
    Route::post('/storefront/pages', [StorefrontPageController::class, 'store']);
    Route::get('/storefront/pages/{slug}', [StorefrontPageController::class, 'show']);
    Route::put('/storefront/pages/{id}', [StorefrontPageController::class, 'update']);
    Route::delete('/storefront/pages/{id}', [StorefrontPageController::class, 'destroy']);
    
    // Menu Items
    Route::get('/storefront/menu', [StorefrontMenuController::class, 'index']);
    Route::post('/storefront/menu', [StorefrontMenuController::class, 'store']);
    Route::put('/storefront/menu/{id}', [StorefrontMenuController::class, 'update']);
    Route::delete('/storefront/menu/{id}', [StorefrontMenuController::class, 'destroy']);
    Route::post('/storefront/menu/reorder', [StorefrontMenuController::class, 'reorder']);
});

// Public routes
Route::get('/public/storefront/{slug}/page/{pageSlug}', [PublicStorefrontController::class, 'showPage']);
```

---

### Step 3: Update Models

**Add to `CompanyStorefront` model:**

```php
public function pages()
{
    return $this->hasMany(StorefrontPage::class, 'storefront_id');
}

public function menuItems()
{
    return $this->hasMany(StorefrontMenuItem::class, 'storefront_id')
        ->where('is_visible', true)
        ->orderBy('sort_order');
}
```

**Add to `StorefrontSection` model:**

```php
public function page()
{
    return $this->belongsTo(StorefrontPage::class);
}
```

---

## 🎨 Frontend Implementation

### API Functions

**File: `lib/storefront-api.js`**

```javascript
export const storefrontAPI = {
  // ... existing code ...
  
  // Pages
  getPages: () => api.get('/storefront/pages'),
  getPage: (slug) => api.get(`/storefront/pages/${slug}`),
  createPage: (data) => api.post('/storefront/pages', data),
  updatePage: (id, data) => api.put(`/storefront/pages/${id}`, data),
  deletePage: (id) => api.delete(`/storefront/pages/${id}`),
  
  // Menu
  getMenuItems: () => api.get('/storefront/menu'),
  createMenuItem: (data) => api.post('/storefront/menu', data),
  updateMenuItem: (id, data) => api.put(`/storefront/menu/${id}`, data),
  deleteMenuItem: (id) => api.delete(`/storefront/menu/${id}`),
  reorderMenu: (items) => api.post('/storefront/menu/reorder', { items }),
  
  // Public
  getPublicPage: (storefrontSlug, pageSlug) => 
    api.get(`/public/storefront/${storefrontSlug}/page/${pageSlug}`),
};
```

---

## 📱 Dashboard UI Components

### 1. Pages Manager

**File: `pages/dashboard/storefront/pages/index.js`**

```javascript
// List all pages
- Create New Page button
- Table showing:
  - Page Title
  - Slug
  - Sections Count
  - Status (Active/Inactive)
  - Actions (Edit, Delete, Page Builder)
```

### 2. Page Builder (Per Page)

**File: `pages/dashboard/storefront/pages/[pageId]/builder.js`**

```javascript
// Same as current section builder, but scoped to a page
- Shows sections for selected page only
- Add Section button
- Drag & drop reordering
- Edit/Delete sections
```

### 3. Navigation Menu Builder

**File: `pages/dashboard/storefront/navigation.js`**

```javascript
// Dynamic-style menu builder
- Add Menu Item button
- List of menu items with:
  - Label input
  - Type dropdown (Page/Section/External)
  - Target selector
  - Show Dropdown checkbox
  - Visibility toggle
- Drag & drop reordering
```

---

## 🌐 Public Storefront

### Dynamic Navigation

**File: `pages/store/[slug].js`**

```javascript
// Fetch menu items from API
const menuItems = storefront.menuItems;

// Render navigation
<nav>
  {menuItems.map(item => (
    item.type === 'page' ? (
      <Link href={`/store/${slug}/${item.target}`}>
        {item.label}
        {item.show_dropdown && <DropdownIcon />}
      </Link>
    ) : item.type === 'section' ? (
      <a href={`#${item.target}`}>{item.label}</a>
    ) : (
      <a href={item.target} target="_blank">{item.label}</a>
    )
  ))}
</nav>
```

### Dynamic Pages

**File: `pages/store/[slug]/[page].js`**

```javascript
// Fetch page content
const page = await storefrontAPI.getPublicPage(slug, pageSlug);

// Render sections for that page
{page.sections.map(section => (
  <StorefrontSection section={section} />
))}
```

---

## 📖 User Workflow Example

### Scenario: Manufacturer wants "About Us" page

1. **Create Page**
   - Go to Dashboard → Storefront → Pages
   - Click "Create New Page"
   - Fill in:
     - Title: "About Our Company"
     - Slug: "about-us" (auto-generated)
     - Meta Description: "Learn about our company history and values"
   - Click "Create"

2. **Build Page Content**
   - Click "Page Builder" for "About Our Company"
   - Add sections:
     1. Hero Section (upload company building photo)
     2. Heading "Our Story"
     3. Text Section (company history)
     4. Gallery Section (factory photos)
     5. Team Section (upload team photos)
   - Save

3. **Add to Navigation**
   - Go to Dashboard → Storefront → Navigation
   - Click "Add Menu Item"
   - Fill in:
     - Label: "About Us"
     - Type: Page
     - Target: about-us
     - Show Dropdown: Yes
   - Drag to desired position
   - Save

4. **View Result**
   - Visit storefront: `/store/mycompany`
   - See "About Us" in navigation
   - Click → Goes to `/store/mycompany/about-us`
   - See all sections beautifully rendered

---

## 🔄 Migration from Current System

### Default Pages to Create

When storefront is created, auto-create these pages:

```javascript
const defaultPages = [
  {
    slug: 'home',
    title: 'Home',
    is_active: true
  },
  {
    slug: 'products',
    title: 'Products',
    is_active: true
  },
  {
    slug: 'about',
    title: 'About Us',
    is_active: true
  },
  {
    slug: 'contact',
    title: 'Contact',
    is_active: true
  }
];
```

### Migrate Existing Sections

```php
// Move all sections to "Home" page
$homePage = StorefrontPage::where('slug', 'home')
    ->where('storefront_id', $storefrontId)
    ->first();

StorefrontSection::where('storefront_id', $storefrontId)
    ->whereNull('page_id')
    ->update(['page_id' => $homePage->id]);
```

---

## ✨ Advanced Features

### Nested Menus (Optional)

Add `parent_id` to menu items for dropdown submenus:

```php
Schema::table('storefront_menu_items', function (Blueprint $table) {
    $table->foreignId('parent_id')->nullable()->constrained('storefront_menu_items');
});
```

### Page Templates

Add predefined templates:
- **Product Catalog**: Products Showcase + Contact
- **About Page**: Hero + Text + Team + Gallery
- **Contact Page**: Heading + Contact Form + Text

### Custom CSS Per Page

```php
Schema::table('storefront_pages', function (Blueprint $table) {
    $table->text('custom_css')->nullable();
});
```

---

## 🎯 Benefits

✅ **Full Control**: Create any menu structure
✅ **SEO Friendly**: Custom slugs, meta descriptions
✅ **Dynamic-like**: Familiar interface for users
✅ **Unlimited Pages**: Create as many as needed
✅ **Per-Page Sections**: Different content per page
✅ **Drag & Drop**: Easy reordering
✅ **Professional**: Like enterprise website builders

---

## 📝 Summary

This system transforms your storefront into a **full Dynamic-style CMS**:

- **Pages Manager** - Create/edit pages
- **Page Builder** - Add sections to each page
- **Navigation Builder** - Custom menu with any labels
- **Dynamic Rendering** - All pages auto-generated
- **SEO Ready** - Meta tags per page
- **User-Friendly** - No coding required

**Result**: Manufacturers can build professional, multi-page storefronts with complete control over navigation and content, just like Dynamic! 🚀
