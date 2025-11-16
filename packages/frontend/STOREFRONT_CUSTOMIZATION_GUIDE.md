# Storefront Page Customization Guide

## Overview
You have TWO ways to customize each menu item in your navigation:

---

## Method 1: Using Page Builder Sections (Easiest - No Coding)

This is the **recommended approach** for most customizations!

### How it works:
1. Go to **Dashboard → Storefront → Page Builder**
2. Add different section types for each "page"
3. Navigation automatically scrolls to these sections

### Menu Item Mapping:
- **Home** → Hero/Banner sections at the top
- **Products** → Products Showcase section (id="products")
- **Profile** → About, Team, Text sections (id="about")
- **Contact** → Contact section (id="contact")
- **Promotion** → Custom Banner or Text sections

### Example Setup:
```
Section Order:
1. Hero Section (title: "Welcome to Our Store")
2. About Section (title: "Company Profile")
3. Products Showcase (title: "Our Products")
4. Gallery Section (title: "Our Facilities")
5. Contact Section (title: "Get in Touch")
```

### Advantages:
✅ No coding required
✅ Drag & drop reordering
✅ Live preview
✅ All on one scrolling page
✅ Mobile responsive automatically

---

## Method 2: Creating Separate Custom Pages (For Advanced Users)

If you want completely different pages (like going to `/store/yourstore/profile`), follow this approach.

### File Structure:
```
pages/
  store/
    [slug]/
      index.js          → Main storefront (Home)
      profile.js        → Company profile page
      products.js       → Products catalog page
      contact.js        → Contact page
      promotion.js      → Promotions page
```

### Step-by-Step Guide:

#### 1. Create a New Page File
Create a file in `pages/store/[slug]/` folder:
- Example: `profile.js` for the profile page

#### 2. Basic Page Template:
```javascript
import { useRouter } from 'next/router';
import { useEffect, useState } from 'react';
import { storefrontAPI, getImageUrl } from '../../../lib/storefront-api';
import Head from 'next/head';
import Link from 'next/link';

export default function YourPageName() {
  const router = useRouter();
  const { slug } = router.query;
  const [storefront, setStorefront] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    
    const fetchStorefront = async () => {
      try {
        const response = await storefrontAPI.getPublicStorefront(slug);
        setStorefront(response.data);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchStorefront();
  }, [slug]);

  if (loading) return <div>Loading...</div>;
  if (!storefront) return <div>Not found</div>;

  const { company, primary_color } = storefront;

  return (
    <>
      <Head>
        <title>{company.name} - Your Page Title</title>
      </Head>

      <div className="min-h-screen bg-gray-50">
        {/* Add your navigation header here */}
        
        {/* Add your custom content here */}
        <div className="max-w-7xl mx-auto px-4 py-12">
          <h1 className="text-4xl font-bold mb-8">Your Page Title</h1>
          
          {/* Your custom design goes here */}
          <div className="bg-white rounded-lg shadow-md p-8">
            <p>Your custom content...</p>
          </div>
        </div>
      </div>
    </>
  );
}
```

#### 3. Update Navigation Links
In `pages/store/[slug]/index.js`, update the navigation:

```javascript
<Link href={`/store/${slug}/profile`}>
  <a className="text-sm hover:text-gray-300">profile</a>
</Link>
```

#### 4. Design Customization Areas:

**A. Header/Hero Section:**
```javascript
<div className="h-64 bg-gradient-to-r from-blue-500 to-purple-600">
  <h1 className="text-5xl font-bold text-white">Custom Title</h1>
</div>
```

**B. Content Grid:**
```javascript
<div className="grid md:grid-cols-2 gap-8">
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Card 1 */}
  </div>
  <div className="bg-white rounded-lg shadow-md p-6">
    {/* Card 2 */}
  </div>
</div>
```

**C. Custom Sections:**
```javascript
<section className="mb-8">
  <h2 className="text-2xl font-bold mb-4" style={{ color: primary_color }}>
    Section Title
  </h2>
  <p>Your content...</p>
</section>
```

---

## Styling Tips

### Use Your Brand Colors:
```javascript
const { primary_color, secondary_color } = storefront;

// In your JSX:
<div style={{ backgroundColor: primary_color }}>...</div>
<h2 style={{ color: primary_color }}>...</h2>
```

### Tailwind CSS Classes Available:
- **Spacing**: `p-4`, `m-4`, `px-8`, `py-6`
- **Colors**: `bg-blue-500`, `text-red-600`
- **Layouts**: `grid`, `flex`, `grid-cols-2`
- **Typography**: `text-xl`, `font-bold`
- **Shadows**: `shadow-md`, `shadow-lg`
- **Rounded**: `rounded-lg`, `rounded-full`

### Responsive Design:
```javascript
// Mobile first, then tablet, then desktop
<div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
  {/* Auto-adjusts: 1 column → 2 columns → 3 columns */}
</div>
```

---

## Example Pages Created

### ✅ Profile Page
File: `pages/store/[slug]/profile.js`
- Company information
- Business details grid
- Capabilities showcase
- Contact information

### 📝 To Create More Pages:
1. Copy `profile.js` as a template
2. Rename to `products.js`, `contact.js`, etc.
3. Customize the content section
4. Add the link in navigation

---

## Quick Reference: Navigation Update

Update this section in `pages/store/[slug]/index.js`:

```javascript
<nav className="flex items-center h-12">
  <a href="#home">Home</a>
  
  {/* Separate page - uses Link */}
  <Link href={`/store/${slug}/products`}>
    <a>Products</a>
  </Link>
  
  {/* Section on same page - uses anchor */}
  <a href="#contact">Contact</a>
</nav>
```

**Rule of thumb:**
- Same page section → Use `<a href="#section">`
- Different page → Use `<Link href="/path"><a>Text</a></Link>`

---

## Need Help?

### Common Customizations:
1. **Change colors**: Use `style={{ backgroundColor: primary_color }}`
2. **Add images**: Use `getImageUrl(imagePath)` helper
3. **Grid layouts**: Use `grid grid-cols-X` classes
4. **Cards**: Use `bg-white rounded-lg shadow-md p-6`
5. **Buttons**: Use `px-6 py-2 rounded text-white` with background color

### Files to Edit:
- **Main page**: `pages/store/[slug]/index.js`
- **New pages**: `pages/store/[slug]/yourpage.js`
- **Shared styles**: Can use Tailwind CSS classes

---

## Summary

**For quick customization without coding:**
→ Use **Page Builder** in Dashboard

**For completely custom pages with unique designs:**
→ Create new files in `pages/store/[slug]/` folder
→ Copy the template from `profile.js`
→ Customize the content section
→ Update navigation links

Both methods work great! Choose based on your needs. 🎨
