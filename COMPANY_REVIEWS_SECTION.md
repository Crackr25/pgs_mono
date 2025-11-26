# Company Reviews Section - Implementation Guide

## Overview
The Company Reviews section has been successfully added to your storefront! This section displays supplier reviews in an Alibaba-style layout, showcasing ratings, testimonials, and customer feedback.

## Features

### 1. **Overall Rating Display**
- Large rating score (out of 5)
- Star rating visualization
- Total number of reviews
- Rating breakdown by stars (5-star, 4-star, etc.)

### 2. **Service Metrics**
- Supplier Service rating
- On-time shipment rating
- Product Quality rating

### 3. **Review Filters**
- Filter by all reviews
- Filter by reviews with pictures
- Filter by reviews with videos
- Filter by good service
- Filter by fast shipping

### 4. **Individual Reviews**
- Customer name and location
- Review date
- Star rating
- Product information
- Review text/comment
- Review images (if available)
- Helpful button with count

## How to Use

### Step 1: Create a Company Reviews Section

When creating a new section in the page builder:

1. Select **Section Type**: `company_reviews`
2. Set **Title** (optional): e.g., "Customer Reviews" or "What Our Clients Say"
3. Configure **Settings** with the review data (see structure below)

### Step 2: Review Data Structure

The reviews are stored in the `settings` field as JSON. Here's the structure:

```json
{
  "overall_rating": 5.0,
  "reviews": [
    {
      "author": "John Doe",
      "country": "Canada",
      "date": "28 Oct 2025 15:30",
      "rating": 5,
      "product": "IClipper-HX01 Professional Hair Clipper",
      "product_image": "storefronts/products/clipper.jpg",
      "comment": "nice quality all around this",
      "images": [
        "storefronts/reviews/review1.jpg"
      ],
      "helpful": 0
    },
    {
      "author": "Jane Smith",
      "country": "United States",
      "date": "29 Sep 2025 16:54",
      "rating": 5,
      "product": "Professional Trimmer Set",
      "comment": "Excellent product and fast shipping. Very satisfied with the quality.",
      "images": [],
      "helpful": 3
    }
  ]
}
```

### Step 3: Adding Reviews via API

When creating or updating a section through the API:

```javascript
// Example API call
const response = await fetch('/api/storefront-sections', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': `Bearer ${token}`
  },
  body: JSON.stringify({
    storefront_id: 1,
    page_id: 1, // optional
    section_type: 'company_reviews',
    title: 'Customer Reviews',
    settings: {
      overall_rating: 4.8,
      reviews: [
        {
          author: "Customer Name",
          country: "Country",
          date: "Date",
          rating: 5,
          product: "Product Name",
          product_image: "path/to/image.jpg",
          comment: "Review text here",
          images: ["path/to/review/image1.jpg"],
          helpful: 0
        }
      ]
    },
    sort_order: 10,
    is_visible: true
  })
});
```

## Sample Data

Here's a complete example with multiple reviews:

```json
{
  "overall_rating": 4.9,
  "reviews": [
    {
      "author": "R**************o",
      "country": "Canada",
      "date": "28 Oct 2025 15:30",
      "rating": 5,
      "product": "IClipper-HX01 Professional Hair Clipper Dub Magneti...",
      "product_image": "storefronts/products/clipper.jpg",
      "comment": "nice quality all around this",
      "images": ["storefronts/reviews/clipper-review1.jpg"],
      "helpful": 0
    },
    {
      "author": "B***********a",
      "country": "Canada",
      "date": "29 Sep 2025 16:54",
      "rating": 5,
      "product": "Professional Grooming Kit",
      "comment": "Fast shipping and excellent customer service. Product exceeded expectations!",
      "images": [],
      "helpful": 5
    },
    {
      "author": "M*********z",
      "country": "United States",
      "date": "15 Oct 2025 10:22",
      "rating": 4,
      "product": "Cordless Hair Trimmer",
      "product_image": "storefronts/products/trimmer.jpg",
      "comment": "Good quality product. Battery life is excellent. Would recommend.",
      "images": [
        "storefronts/reviews/trimmer-review1.jpg",
        "storefronts/reviews/trimmer-review2.jpg"
      ],
      "helpful": 12
    }
  ]
}
```

## Visual Layout

The section displays in a card layout similar to Alibaba's supplier review page:

```
┌─────────────────────────────────────────────────────────┐
│                    Supplier Reviews                      │
├─────────────────────────────────────────────────────────┤
│  ┌──────────┐  ┌──────────────────────────────────────┐ │
│  │  5.0/5   │  │     Product Quality Breakdown         │ │
│  │  ★★★★★   │  │  5 Stars ████████████████ 80% (4)   │ │
│  │Very      │  │  4 Stars ███████          20% (1)   │ │
│  │satisfied │  │  3 Stars                   0% (0)   │ │
│  │5 Reviews │  │  2 Stars                   0% (0)   │ │
│  │          │  │  1 Stars                   0% (0)   │ │
│  │Supplier  │  └──────────────────────────────────────┘ │
│  │Service:  │                                            │
│  │★★★★★ 5.0│                                            │
│  │On-time   │                                            │
│  │shipment: │                                            │
│  │★★★★★ 5.0│                                            │
│  │Product   │                                            │
│  │Quality:  │                                            │
│  │★★★★★ 5.0│                                            │
│  └──────────┘                                            │
├─────────────────────────────────────────────────────────┤
│  Filters: [ALL] [With pictures(3)] [With videos(0)]     │
│           [Good service(3)] [Fast shipping(1)]           │
├─────────────────────────────────────────────────────────┤
│  [Avatar] Name                         Date              │
│          Country                                         │
│          Supplier Service: ★★★★★ 5 stars               │
│          [Product Image] Product Name                    │
│          Review comment text goes here...                │
│          [Review Images]                                 │
│          👍 Helpful (0)                                  │
├─────────────────────────────────────────────────────────┤
│  [More reviews...]                                       │
└─────────────────────────────────────────────────────────┘
```

## Styling

The section uses:
- Orange color scheme (#FF6B35 or similar) for ratings and highlights
- Gray backgrounds for cards and breakdowns
- Responsive grid layout (mobile-friendly)
- Hover effects on buttons and images
- Star icons for ratings

## Notes

1. **Images**: All image paths should be relative to the storage folder (e.g., `storefronts/reviews/image.jpg`)
2. **Rating Calculation**: The overall rating is manually set but should ideally match the average of individual reviews
3. **Filtering**: The filter buttons are currently decorative - you can add filtering logic if needed
4. **Empty State**: When no reviews exist, a friendly message is displayed
5. **Privacy**: Consider masking customer names (e.g., "R**************o") for privacy

## Future Enhancements

Potential improvements:
- Real-time review submission form
- Pagination for large numbers of reviews
- Sorting options (most recent, most helpful, highest rating)
- Image lightbox/gallery view
- Video review support
- Verified purchase badges
- Response from supplier feature

## Support

For questions or issues with the Company Reviews section, please refer to the main documentation or contact support.
