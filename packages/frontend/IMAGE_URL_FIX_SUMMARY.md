# Image URL Fix Summary

## Problem Identified
The issue was with inconsistent URL construction across your application, leading to malformed URLs like:
`https://pinoyglobalsupply.com/.pinoyglobalsupply.com/api/storage/...`

## Root Cause
1. Different components were using different approaches to construct image URLs
2. Some components used hardcoded URLs (`https://api.pinoyglobalsupply.com`)
3. Environment variables might not be properly loaded in production

## Files Fixed
1. **lib/imageUtils.js** - Updated to use environment variables properly
2. **pages/company-profile.js** - Now uses the centralized imageUtils function
3. **components/common/DocumentDisplay.js** - Updated to use imageUtils
4. **components/common/ImageSwiper.js** - Updated to use imageUtils

## Key Changes Made

### 1. Centralized URL Construction
All image URLs are now constructed using the `getImageUrl()` function from `lib/imageUtils.js`:

```javascript
// Before (inconsistent)
const url = `${process.env.NEXT_PUBLIC_STORAGE_URL || '/storage'}/${imagePath}`;
const url = `https://api.pinoyglobalsupply.com/storage/${imagePath}`;

// After (consistent)
import { getImageUrl } from '../lib/imageUtils';
const url = getImageUrl(imagePath);
```

### 2. Environment Variable Logic
Updated the imageUtils function to:
- Use `NEXT_PUBLIC_API_URL` and strip the `/api` part
- Properly handle path formatting (no double slashes)
- Provide proper fallbacks

## Production Deployment Checklist

### 1. Environment Variables
Ensure these are set in your production environment:
```bash
NEXT_PUBLIC_API_URL=https://api.pinoyglobalsupply.com/api
NEXT_PUBLIC_STORAGE_URL=https://api.pinoyglobalsupply.com/storage  # Optional, for backward compatibility
```

### 2. Verify Environment Loading
Add temporary debugging to verify environment variables are loaded:
```javascript
console.log('API URL:', process.env.NEXT_PUBLIC_API_URL);
```

### 3. Build and Deploy
After fixing the environment variables:
```bash
npm run build
# Deploy your built application
```

## Testing
Test these URLs should work correctly:
- ✅ `https://api.pinoyglobalsupply.com/storage/companies/12/factory-tour/file.jpg`
- ❌ `https://pinoyglobalsupply.com/.pinoyglobalsupply.com/api/storage/...`

## Debug Utilities Added
- `lib/debugUtils.js` - Temporary debugging functions
- Use `checkEnvironmentSetup()` to verify environment variables
- Use `debugImageUrl(path)` to trace URL construction

## Remove After Testing
Once the issue is resolved, remove:
1. The debug imports and calls in `company-profile.js`
2. The `utils/url-test.js` file
3. The `lib/debugUtils.js` file (optional)

## Next Steps
1. Deploy the updated code
2. Check browser console for debug output
3. Verify images load correctly
4. Remove debug code once confirmed working
