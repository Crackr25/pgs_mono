# Pinoy Global Supply Theme Guide

This document outlines the visual theme applied to match the Pinoy Global Supply website style.

## 🎨 Color Palette

### Primary Colors
- **Primary Blue**: `#0046ad` (primary-500)
- **Primary Blue Variants**: 
  - Light: `#e6f0ff` (primary-50)
  - Dark: `#00225c` (primary-900)

### Secondary Colors
- **White**: `#ffffff`
- **Light Gray**: `#f8f9fa`
- **Medium Gray**: `#6c757d`
- **Dark Gray**: `#343a40`
- **Black**: `#000000`

### Accent Colors
- **Orange**: `#ff6b35`
- **Red**: `#dc2626`
- **Green**: `#16a34a`
- **Yellow**: `#eab308`

## 🔤 Typography

### Font Family
- **Primary**: Poppins (Google Fonts)
- **Fallback**: Inter, system-ui, sans-serif

### Font Sizes
- **Hero Text**: `3.5rem` (56px) - Bold
- **Section Title**: `2.5rem` (40px) - Semibold
- **Card Title**: `1.5rem` (24px) - Semibold

## 🎯 Component Classes

### Buttons
```css
.btn-primary          /* Main blue button with hover effects */
.btn-primary-large    /* Larger version for CTAs */
.btn-secondary        /* White button with blue border */
.btn-outline          /* Transparent with blue border */
```

### Cards
```css
.card                 /* Standard card with soft shadow */
.card-featured        /* Enhanced card with stronger shadow */
```

### Hero Section
```css
.hero-section         /* Blue gradient background */
.hero-content         /* Centered content container */
.hero-title           /* Large hero heading */
.hero-subtitle        /* Hero description text */
.hero-warehouse       /* Industrial background pattern */
```

### Forms
```css
.form-input           /* Styled input fields */
.form-label           /* Form field labels */
.form-select          /* Dropdown selects */
.form-floating-label  /* Floating label animation */
```

### Navigation
```css
.nav-link             /* Navigation menu items */
.nav-link-active      /* Active navigation state */
```

### Badges
```css
.badge                /* Base badge style */
.badge-primary        /* Blue badge */
.badge-success        /* Green badge */
.badge-warning        /* Yellow badge */
.badge-danger         /* Red badge */
```

## 🏗️ Layout Classes

### Containers
```css
.container-section    /* Standard section container */
.container-hero       /* Hero section container */
```

### Utilities
```css
.text-gradient        /* Blue gradient text */
.section-title        /* Large section headings */
.section-subtitle     /* Section descriptions */
```

## 🎭 Special Effects

### Animations
- **Hover Transforms**: Buttons and cards lift on hover
- **Loading Spinner**: Blue spinning indicator
- **Success Checkmark**: Green checkmark animation

### Shadows
- **Soft**: `shadow-soft` - Subtle elevation
- **Medium**: `shadow-medium` - Standard elevation
- **Strong**: `shadow-strong` - High elevation

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Mobile Optimizations
- Hero text scales down to `text-4xl`
- Section titles scale to `text-3xl`
- Partner logos display in 2-column grid
- Background attachments switch to scroll

## ♿ Accessibility Features

### High Contrast Support
- Enhanced borders in high contrast mode
- Improved color contrast ratios

### Reduced Motion Support
- Respects `prefers-reduced-motion` setting
- Disables animations for sensitive users

### Print Styles
- Optimized for printing
- Converts gradients to solid colors
- Ensures text readability

## 🚀 Usage Examples

### Hero Section
```jsx
<section className="hero-section hero-warehouse">
  <div className="hero-overlay"></div>
  <div className="hero-content">
    <h1 className="hero-title">Your Hero Title</h1>
    <p className="hero-subtitle">Your hero description</p>
    <button className="btn-primary-large">Get Started</button>
  </div>
</section>
```

### Feature Cards
```jsx
<div className="card-featured feature-card">
  <h3 className="text-card-title mb-4">Feature Title</h3>
  <p className="text-secondary-600">Feature description</p>
  <button className="btn-primary mt-6">Learn More</button>
</div>
```

### Call-to-Action Section
```jsx
<section className="cta-section">
  <div className="container-section text-center text-white">
    <h2 className="section-title text-white mb-6">Ready to Get Started?</h2>
    <button className="btn-secondary">Contact Us</button>
  </div>
</section>
```

## 🔧 Customization

### Tailwind Config
The theme is configured in `tailwind.config.js` with:
- Custom color palette
- Extended font sizes
- Custom spacing values
- Enhanced shadows

### CSS Files
- `globals.css` - Main Tailwind components
- `pinoy-theme.css` - Additional theme styles

## 📋 Implementation Checklist

- [x] Updated Tailwind configuration with Pinoy Global Supply colors
- [x] Applied Poppins font family
- [x] Created comprehensive component classes
- [x] Added hero section styles with gradients
- [x] Implemented modern button designs with hover effects
- [x] Added card components with shadows
- [x] Created form styling
- [x] Added responsive design support
- [x] Implemented accessibility features
- [x] Added special effects and animations

The theme is now fully applied and ready for use across your Next.js application!
