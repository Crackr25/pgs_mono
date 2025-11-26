# Company Reviews - Styling Reference

## Colors Used (Alibaba-Inspired)

### Primary Colors
- **Orange-500**: `#FF6B35` or `#F97316` - Used for:
  - Star ratings
  - Overall rating number
  - Service metric stars
  - Rating breakdown bars
  - Active filter button background
  - "Very satisfied" text emphasis

### Background Colors
- **Gray-50**: `#F9FAFB` - Used for:
  - Rating card background
  - Product info boxes in reviews
  
- **Gray-100**: `#F3F4F6` - Used for:
  - Inactive filter buttons
  - Image placeholders

- **White**: `#FFFFFF` - Used for:
  - Main section background
  - Review cards
  - Button text on orange backgrounds

### Text Colors
- **Gray-900**: `#111827` - Primary headings
- **Gray-700**: `#374151` - Regular text content
- **Gray-600**: `#4B5563` - Secondary text, labels
- **Gray-500**: `#6B7280` - Tertiary text, dates, metadata
- **Gray-400**: `#9CA3AF` - Icon colors, disabled states
- **Gray-300**: `#D1D5DB` - Borders, dividers, empty stars

## Typography

### Font Sizes
- **5xl** (3rem/48px) - Overall rating number
- **3xl** (1.875rem/30px) - Section title "Customer Reviews"
- **2xl** (1.5rem/24px) - Large numbers in rating display
- **lg** (1.125rem/18px) - Subsection headings, emphasized text
- **base** (1rem/16px) - Regular text, review comments
- **sm** (0.875rem/14px) - Metadata, labels, secondary info
- **xs** (0.75rem/12px) - Small labels, badges

### Font Weights
- **bold** (700) - Section titles, rating numbers, customer names
- **semibold** (600) - Subsection headings, satisfaction text
- **medium** (500) - Filter buttons, product names
- **normal** (400) - Regular text, review comments

## Spacing

### Padding
- **p-8** - Main section content (32px)
- **p-6** - Rating card, review cards (24px)
- **p-4** - Product info boxes (16px)
- **p-3** - Rating display boxes (12px)
- **py-2 px-4** - Filter buttons (8px/16px)

### Margin/Gap
- **mb-8** - Between major sections (32px)
- **mb-6** - Between subsections (24px)
- **mb-4** - Between elements (16px)
- **mb-3** - Between small elements (12px)
- **gap-8** - Grid gap for rating layout (32px)
- **gap-4** - Gap between review elements (16px)
- **gap-3** - Gap between rating bars (12px)
- **gap-2** - Gap between filter buttons, images (8px)

## Border Radius

- **rounded-lg** (0.5rem/8px) - Cards, images
- **rounded-full** - Filter buttons, avatar, navigation dots
- **rounded** (0.25rem/4px) - Small images, badges

## Shadows

- **shadow-md** - Main cards
  - `box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)`
  
- **shadow-lg** (on hover) - Enhanced card shadow

## Interactive States

### Buttons
```css
/* Default */
background: #F3F4F6 (gray-100)
color: #374151 (gray-700)

/* Hover */
background: #E5E7EB (gray-200)
transition: all 0.15s ease

/* Active (Selected) */
background: #FED7AA (orange-100)
color: #EA580C (orange-600)
```

### Images
```css
/* Default */
opacity: 1

/* Hover */
opacity: 0.75
cursor: pointer
transition: opacity 0.15s ease
```

## Component Measurements

### Avatar
- **Size**: 48px × 48px (w-12 h-12)
- **Shape**: Circle (rounded-full)
- **Background**: gray-300
- **Text**: White, semibold, uppercase first letter

### Star Icons
- **Small**: 16px × 16px (w-4 h-4) - In service metrics
- **Medium**: 20px × 20px (w-5 h-5) - In helpful button
- **Large**: 24px × 24px (w-6 h-6) - In overall rating

### Review Images
- **Size**: 96px × 96px (w-24 h-24)
- **Shape**: Rounded (rounded)
- **Border**: 1px solid border
- **Object Fit**: cover

### Product Image in Review
- **Size**: 64px × 64px (w-16 h-16)
- **Shape**: Rounded (rounded)
- **Object Fit**: cover

### Rating Bars
- **Height**: 10px (h-2.5)
- **Background**: gray-200
- **Fill**: orange-500
- **Shape**: Rounded full
- **Animation**: Smooth width transition

## Responsive Breakpoints

### Grid Layout
```css
/* Mobile (default) */
grid-cols-1

/* Tablet (md: 768px+) */
md:grid-cols-3 /* For rating layout */
md:grid-cols-2 /* For some content sections */

/* Desktop (lg: 1024px+) */
/* Inherits from md */
```

### Text Sizes
```css
/* Mobile */
text-3xl (30px) - Section titles
text-5xl (48px) - Rating number

/* Tablet/Desktop */
text-4xl (36px) - Section titles
text-6xl (60px) - Rating number
```

## Z-Index Layers

- **z-10** - Navigation arrows, overlay controls
- **z-0 (default)** - Main content
- **relative** - Parent positioning context

## Accessibility

### Focus States
All interactive elements have:
- Visible focus ring
- Keyboard navigation support
- Aria labels for icon-only buttons

### Color Contrast
- Text on white: Minimum 4.5:1 ratio
- Text on gray backgrounds: Minimum 4.5:1 ratio
- Orange on white: Sufficient for large text

## Animation/Transitions

### Standard Transition
```css
transition: all 0.15s ease
```

Applied to:
- Button hover states
- Image opacity changes
- Rating bar width changes

### Carousel Transitions
```css
transition-opacity: 1000ms
```

For smooth fading between slides

## Icons

Using Heroicons (outlined) for:
- 📍 Location pin - `heroicon-o-location-marker`
- 👍 Thumbs up - `heroicon-o-thumb-up`
- 💬 Chat - `heroicon-o-chat`
- ⭐ Star (filled) - Custom SVG path

## Print Styles

Consider adding:
```css
@media print {
  .filter-buttons { display: none; }
  .navigation-arrows { display: none; }
  .helpful-button { display: none; }
}
```

## Browser Support

Tested and working on:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

## CSS Variables (Optional)

For easier theming, consider:
```css
:root {
  --color-primary: #FF6B35;
  --color-primary-light: #FED7AA;
  --color-star: #FF6B35;
  --radius-card: 0.5rem;
  --radius-button: 9999px;
  --shadow-card: 0 4px 6px -1px rgb(0 0 0 / 0.1);
}
```

## Comparison with Alibaba

### Similarities ✅
- Orange color scheme for ratings
- Large rating number display
- Service metrics with individual ratings
- Horizontal rating bars
- Rounded filter buttons
- Clean card-based layout
- Star rating visualization
- Customer avatars with initials

### Differences 📝
- Alibaba uses more orange gradients
- Alibaba has more complex filtering system
- Alibaba shows verified badges
- Alibaba has supplier response feature
- Our implementation is cleaner/simpler

## Best Practices

1. **Consistency**: Uses Tailwind utility classes throughout
2. **Responsiveness**: Mobile-first approach
3. **Performance**: Minimal custom CSS, uses Tailwind's purging
4. **Accessibility**: Semantic HTML, proper ARIA labels
5. **Maintainability**: Clear class names, logical structure
