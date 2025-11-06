# Storage Link Setup

To make uploaded files accessible via public URLs, run this command in your Laravel backend:

```bash
php artisan storage:link
```

This creates a symbolic link from `public/storage` to `storage/app/public`, making files accessible at:
- `http://your-domain.com/storage/companies/{company_id}/documents/filename.pdf`
- `http://your-domain.com/storage/companies/{company_id}/kyc/filename.jpg`
- `http://your-domain.com/storage/companies/{company_id}/factory-tour/filename.mp4`

## File URL Helper

Add this method to your Company model to generate public URLs:

```php
public function getFileUrl($filePath)
{
    if (!$filePath) return null;
    return asset('storage/' . $filePath);
}
```
