# Quick Start: Company Reviews Section

## Test the New Section

### Step 1: Create a Test Review Section

Use this curl command or Postman to create a company reviews section:

```bash
curl -X POST "http://localhost:8000/api/storefront-sections" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "storefront_id": 1,
    "section_type": "company_reviews",
    "title": "Customer Reviews",
    "settings": {
      "overall_rating": 5.0,
      "reviews": [
        {
          "author": "R**************o",
          "country": "Canada",
          "date": "28 Oct 2025 15:30",
          "rating": 5,
          "product": "IClipper-HX01 Professional Hair Clipper",
          "comment": "nice quality all around this",
          "images": [],
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
        }
      ]
    },
    "sort_order": 10,
    "is_visible": true
  }'
```

### Step 2: Or Use JavaScript Fetch

```javascript
const token = 'YOUR_AUTH_TOKEN';
const storefrontId = 1; // Your storefront ID

const createReviewSection = async () => {
  const response = await fetch('http://localhost:8000/api/storefront-sections', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      'Accept': 'application/json'
    },
    body: JSON.stringify({
      storefront_id: storefrontId,
      section_type: 'company_reviews',
      title: 'What Our Customers Say',
      settings: {
        overall_rating: 4.8,
        reviews: [
          {
            author: "John D.",
            country: "United States",
            date: "15 Nov 2025",
            rating: 5,
            product: "Premium Widget Set",
            product_image: "storefronts/products/widget.jpg",
            comment: "Excellent quality and fast delivery. Highly recommend this supplier!",
            images: ["storefronts/reviews/widget-review1.jpg"],
            helpful: 12
          },
          {
            author: "Sarah M.",
            country: "United Kingdom",
            date: "10 Nov 2025",
            rating: 4,
            product: "Professional Tool Kit",
            comment: "Good product overall. Packaging could be improved.",
            images: [],
            helpful: 3
          },
          {
            author: "Michael Chen",
            country: "Singapore",
            date: "05 Nov 2025",
            rating: 5,
            product: "Industrial Equipment",
            product_image: "storefronts/products/equipment.jpg",
            comment: "Outstanding service and product quality. Will definitely order again!",
            images: [
              "storefronts/reviews/equipment-review1.jpg",
              "storefronts/reviews/equipment-review2.jpg"
            ],
            helpful: 8
          }
        ]
      },
      sort_order: 5,
      is_visible: true
    })
  });

  const data = await response.json();
  console.log('Section created:', data);
  return data;
};

// Call the function
createReviewSection();
```

### Step 3: View Your Section

After creating the section, visit your storefront:
- Main storefront: `http://localhost:3000/store/YOUR_SLUG`
- Custom page: `http://localhost:3000/store/YOUR_SLUG/YOUR_PAGE_SLUG`

## Features You Can Test

1. **Overall Rating Display** - Check the large rating number and stars
2. **Rating Breakdown** - See the distribution of 5-star to 1-star reviews
3. **Service Metrics** - View Supplier Service, On-time shipment, Product Quality ratings
4. **Review Cards** - Each review shows:
   - Customer name (with avatar initial)
   - Country with location icon
   - Date
   - Star rating
   - Product name and image (if provided)
   - Review comment
   - Review images gallery (if provided)
   - Helpful counter

5. **Filter Buttons** - Currently decorative, shows count of reviews with pictures

6. **Empty State** - Remove all reviews to see the "No reviews yet" message

## Sample Review Object

```json
{
  "author": "Customer Name",
  "country": "Country Name",
  "date": "DD MMM YYYY HH:MM",
  "rating": 5,
  "product": "Product Name",
  "product_image": "path/to/product/image.jpg",
  "comment": "The review text goes here...",
  "images": ["path/to/review/image1.jpg", "path/to/review/image2.jpg"],
  "helpful": 0
}
```

## Updating a Review Section

To update an existing section:

```bash
curl -X PUT "http://localhost:8000/api/storefront-sections/SECTION_ID" \
  -H "Authorization: Bearer YOUR_TOKEN_HERE" \
  -H "Content-Type: application/json" \
  -d '{
    "settings": {
      "overall_rating": 4.9,
      "reviews": [
        {
          "author": "New Customer",
          "country": "Australia",
          "date": "21 Nov 2025",
          "rating": 5,
          "product": "Amazing Product",
          "comment": "Best purchase ever!",
          "images": [],
          "helpful": 0
        }
      ]
    }
  }'
```

## Tips

1. **Privacy**: Use masked names like "J***n D***" for customer privacy
2. **Images**: Ensure image paths are correct and images exist in storage
3. **Rating Calculation**: The overall_rating should ideally match the average of all review ratings
4. **Realistic Data**: Use varied ratings (mix of 4 and 5 stars) for authenticity
5. **Recent Dates**: Use recent dates to show active engagement

## Next Steps

- Add actual review submission functionality
- Implement filtering logic
- Add pagination for many reviews
- Add image lightbox for review photos
- Integrate with your existing review system
