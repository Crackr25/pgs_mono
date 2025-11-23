# 🔧 Troubleshooting: Header Not Showing

## Quick Fix Steps

### 1. Hard Refresh Your Browser
The browser likely has the old page cached.

**Windows/Linux:**
- Press `Ctrl + Shift + R` or `Ctrl + F5`

**Mac:**
- Press `Cmd + Shift + R`

### 2. Check Browser Console
1. Open browser DevTools (F12)
2. Go to Console tab
3. Refresh the page
4. Look for: `🎨 StorefrontHeader loaded: ...`
   - If you see this, the component is loading!
   - If not, continue to step 3

### 3. Clear Next.js Cache & Restart Dev Server

```powershell
# Stop the current dev server (Ctrl+C in terminal)
cd c:\pgs_mono\packages\frontend

# Clear Next.js cache
Remove-Item -Recurse -Force .next -ErrorAction SilentlyContinue

# Restart dev server
npm run dev
```

### 4. Verify Component File Exists
```powershell
cd c:\pgs_mono\packages\frontend
Test-Path components\storefront\StorefrontHeader.js
```
Should return: `True`

### 5. Check for JavaScript Errors
1. Open browser DevTools (F12)
2. Look for any red errors in Console
3. Common issues:
   - Import path incorrect
   - Syntax error
   - Missing dependencies

### 6. Test Direct Component Access
Visit: `http://localhost:3000/store/arizona/arizonareviews`

Then:
1. Open DevTools Console (F12)
2. Type: `console.log('Test')`
3. Refresh with Ctrl+Shift+R
4. Check for the `🎨 StorefrontHeader loaded` message

### 7. Verify Backend Data
```powershell
cd c:\pgs_mono\packages\backend
php artisan tinker --execute="echo App\Models\Company::where('name', 'ARIZONA')->first(['name', 'verified', 'certification_agency'])->toJson();"
```

Should show:
```json
{"name":"ARIZONA","verified":true,"certification_agency":"SGS"}
```

### 8. Check API Response
Visit in browser:
`http://localhost:8000/api/public/storefront/arizona`

Search for `certification_agency` in the JSON response. If it's there, backend is working!

## Common Issues

### Issue: "Cannot find module"
**Solution:** Component file might be missing or path is wrong
```powershell
# Verify file exists
dir c:\pgs_mono\packages\frontend\components\storefront\StorefrontHeader.js
```

### Issue: Page still shows old header
**Solution:** Browser cache or Next.js cache
1. Hard refresh: `Ctrl + Shift + R`
2. Clear Next.js cache: Delete `.next` folder
3. Restart dev server

### Issue: Component loads but no badges show
**Solution:** Data not populated
```powershell
cd c:\pgs_mono\packages\backend
php artisan db:seed --class=CompanyVerificationBadgesSeeder
```

### Issue: White screen / blank page
**Solution:** React error, check console
1. Open DevTools (F12)
2. Check Console for errors
3. Check Network tab for failed requests

## Quick Test

1. **Stop dev server** (Ctrl+C)
2. **Delete .next folder:**
   ```powershell
   cd c:\pgs_mono\packages\frontend
   Remove-Item -Recurse -Force .next
   ```
3. **Restart:**
   ```powershell
   npm run dev
   ```
4. **Open browser in incognito mode:**
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`
5. **Visit:** `http://localhost:3000/store/arizona`
6. **Check console** for `🎨 StorefrontHeader loaded`

## Expected Result

You should see:
- Blue verification badge at top
- Large company logo
- Company name with dropdown arrow
- "ODM Manufacturer" in blue
- Years and location info
- Categories listed
- Orange/white badges
- "Contact Supplier" and "Chat now" buttons

## Still Not Working?

If after all these steps you still don't see the new header:

1. **Check the terminal running npm run dev** - Are there any errors?
2. **Take a screenshot** of your browser showing the page
3. **Copy the browser console output** (any errors in red)
4. **Check Network tab** - Is the JavaScript bundle loading?

Let me know what you see and I'll help debug further!
