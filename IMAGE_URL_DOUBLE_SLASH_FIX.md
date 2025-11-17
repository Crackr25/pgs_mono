# Featured Products Image URL Fix

## 🐛 Problem
Featured products images not loading due to double slashes in URLs:
- ❌ `https://api.pinoyglobalsupply.com//storage/products/...`
- ✅ `https://api.pinoyglobalsupply.com/storage/products/...`

## 🔍 Root Causes

### 1. **Product Image Objects from Laravel**
Products from API have both properties:
```json
{
  "image_path": "products/123.jpg",
  "image_url": "https://api.pinoyglobalsupply.com//storage/products/123.jpg"  // ← double slash!
}
```

### 2. **No Double-Slash Cleanup**
The `getImageUrl()` function in `storefront-api.js` wasn't removing double slashes from URLs.

### 3. **Which File to Fix?**
- ✅ **Featured Products** uses: `lib/storefront-api.js` ← **FIXED THIS ONE**
- ⚠️ **Other pages** use: `lib/imageUtils.js` ← **LEFT UNCHANGED** (hardcoded URL needed for other pages)

## ✅ Solution Applied

### Fixed `lib/storefront-api.js` ONLY
```javascript
// ✅ Handle product image objects from Laravel
if (typeof path === 'object') {
  if (path.image_url) {
    return path.image_url.replace(/([^:]\/)\/+/g, '$1'); // Remove double slashes
  }
  path = path.image_path || path.path;
}

// ✅ If already a full URL, clean up double slashes
if (path.startsWith('http://') || path.startsWith('https://')) {
  return path.replace(/([^:]\/)\/+/g, '$1');
}

// ✅ Clean up double slashes in final constructed URL
const finalUrl = `${cleanStorageUrl}/${path}`;
return finalUrl.replace(/([^:]\/)\/+/g, '$1');
```

### NOT Changed: `lib/imageUtils.js`
- **Left as-is** with hardcoded production URL
- Other pages depend on this behavior
- Featured products doesn't use this file

## 🎯 The Regex Explained
```javascript
.replace(/([^:]\/)\/+/g, '$1')
```
- `([^:]\/)` - Captures any "/" that's NOT preceded by ":"
- `\/+` - Matches one or more additional slashes
- `$1` - Replaces with just the first slash
- Preserves `https://` while removing `//storage/` → `/storage/`

## 📋 Where This Affects

### Featured Products Section
`pages/store/[slug].js` - Line ~1120
```javascript
<img src={getImageUrl(images[currentImageIndex])} />
```

### Other Places Using getImageUrl:
- Product cards (all storefronts)
- Product detail modals
- Supplier pages
- Dashboard previews
- Banner images
- Section images

## 🧪 Testing

### Environment Setup
Create `.env.local` if it doesn't exist:
```bash
NEXT_PUBLIC_API_URL=http://localhost:8000/api
```

### Verify URLs
1. Open browser DevTools → Network tab
2. Visit featured products section
3. Check image URLs - should be:
   - Local: `http://localhost:8000/storage/products/...`
   - Prod: `https://api.pinoyglobalsupply.com/storage/products/...`
4. NO double slashes!

## 🚀 Next Steps
1. ✅ Restart Next.js dev server
2. ✅ Clear browser cache
3. ✅ Test featured products section
4. ✅ Verify console has no 404 image errors
