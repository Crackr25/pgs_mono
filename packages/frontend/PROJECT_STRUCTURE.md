# Supplier/Manufacturer Marketplace UI Project Structure

## Laravel Backend (Blade Templates)
```
laravel-backend/
├── resources/
│   └── views/
│       ├── layouts/
│       │   ├── app.blade.php (Main layout with navbar, sidebar, footer)
│       │   ├── navbar.blade.php
│       │   ├── sidebar.blade.php
│       │   └── footer.blade.php
│       ├── onboarding/
│       │   ├── company-profile.blade.php
│       │   ├── document-upload.blade.php
│       │   ├── kyc-upload.blade.php
│       │   └── factory-tour.blade.php
│       ├── products/
│       │   ├── dashboard.blade.php
│       │   ├── create.blade.php
│       │   ├── edit.blade.php
│       │   └── bulk-upload.blade.php
│       ├── orders/
│       │   ├── quotes-dashboard.blade.php
│       │   ├── auto-reply.blade.php
│       │   ├── order-tracking.blade.php
│       │   └── payment-status.blade.php
│       ├── messaging/
│       │   ├── chat.blade.php
│       │   └── templates.blade.php
│       ├── analytics/
│       │   ├── dashboard.blade.php
│       │   └── buyer-engagement.blade.php
│       ├── payments/
│       │   ├── commission-tracker.blade.php
│       │   ├── payout-settings.blade.php
│       │   └── tax-receipts.blade.php
│       ├── integrations/
│       │   ├── shipping-calculator.blade.php
│       │   ├── logistics.blade.php
│       │   ├── sample-requests.blade.php
│       │   └── compliance.blade.php
│       ├── support/
│       │   ├── knowledge-center.blade.php
│       │   ├── webinars.blade.php
│       │   └── account-manager.blade.php
│       └── trust/
│           ├── verification.blade.php
│           ├── reviews.blade.php
│           └── performance.blade.php
└── public/
    ├── css/
    │   └── app.css (Tailwind CSS)
    ├── js/
    │   └── app.js
    └── images/
        └── (placeholder images)
```

## Next.js Frontend
```
nextjs-frontend/
├── pages/
│   ├── _app.js (Global app wrapper)
│   ├── _document.js (Custom document)
│   ├── index.js (Dashboard/Home)
│   ├── onboarding/
│   │   ├── company-profile.js
│   │   ├── document-upload.js
│   │   ├── kyc-upload.js
│   │   └── factory-tour.js
│   ├── products/
│   │   ├── index.js (Dashboard)
│   │   ├── create.js
│   │   ├── edit/[id].js
│   │   └── bulk-upload.js
│   ├── orders/
│   │   ├── quotes.js
│   │   ├── auto-reply.js
│   │   ├── tracking.js
│   │   └── payments.js
│   ├── messaging/
│   │   └── index.js
│   ├── analytics/
│   │   └── index.js
│   ├── payments/
│   │   ├── commission.js
│   │   ├── settings.js
│   │   └── receipts.js
│   ├── integrations/
│   │   ├── shipping.js
│   │   ├── logistics.js
│   │   ├── samples.js
│   │   └── compliance.js
│   ├── support/
│   │   ├── knowledge.js
│   │   ├── webinars.js
│   │   └── manager.js
│   └── trust/
│       ├── verification.js
│       ├── reviews.js
│       └── performance.js
├── components/
│   ├── layouts/
│   │   ├── Layout.js (Main layout wrapper)
│   │   ├── Navbar.js
│   │   ├── Sidebar.js
│   │   └── Footer.js
│   ├── common/
│   │   ├── Button.js
│   │   ├── Card.js
│   │   ├── Modal.js
│   │   ├── Table.js
│   │   └── LanguageSwitcher.js
│   └── [module-specific components]
├── public/
│   ├── images/
│   │   └── (placeholder images)
│   └── icons/
│       └── (placeholder icons)
├── styles/
│   ├── globals.css (Tailwind CSS)
│   └── components.css
├── package.json
└── tailwind.config.js
```

## Technology Stack
- **CSS Framework**: Tailwind CSS
- **Laravel**: Blade templating engine
- **Next.js**: React framework with SSR/SSG
- **Icons**: Heroicons (for consistency)
- **Dummy Data**: JSON files with placeholder content
- **Images**: Placeholder images from picsum.photos or similar
