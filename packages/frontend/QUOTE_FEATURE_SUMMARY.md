# Product-Based Quote Request Feature

## Overview
Added an Alibaba-style "Request Quote" feature to product detail pages that allows buyers to request quotes directly from product pages.

## Implementation Details

### 1. Database Schema
Uses the existing `quotes` table with the following structure:
```sql
- product_id (foreign key to products)
- company_id (foreign key to companies)
- buyer_name
- buyer_email
- buyer_company
- quantity
- target_price (optional)
- deadline
- status (pending, responded, accepted, rejected, expired)
- message
- response_message (for supplier response)
- quoted_price (supplier's quoted price)
- quoted_lead_time (supplier's quoted lead time)
```

### 2. Frontend Features Added

#### A. New State Variables
- `showQuoteModal` - Controls quote request modal visibility
- `quoteQuantity` - Quantity requested in quote
- `targetPrice` - Optional target price from buyer
- `quoteDeadline` - Deadline for supplier response
- `quoteMessage` - Message from buyer
- `submittingQuote` - Loading state for quote submission

#### B. New Functions
- `openQuoteModal()` - Opens quote modal with pre-populated data
- `handleQuoteRequest()` - Submits quote request to API

#### C. UI Components Added
1. **"Request Quote" Button** - Added next to "Send Message" button in company info section
2. **Quote Request Modal** - Complete form with:
   - Product summary display
   - Quantity input (pre-filled with MOQ)
   - Optional target price input
   - Deadline selector (defaults to 7 days)
   - Message textarea (pre-filled with template)
   - Submit/Cancel buttons

### 3. User Experience Flow

1. **Buyer browses product** → Sees product details, pricing, MOQ, etc.
2. **Clicks "Request Quote"** → Modal opens with pre-populated form
3. **Fills quote requirements** → Quantity, target price, deadline, message
4. **Submits quote request** → Sent to supplier via API
5. **Receives confirmation** → Success message displayed
6. **Supplier gets notification** → Can respond through their portal

### 4. Pre-population Features

The quote modal automatically pre-fills:
- **Quantity**: Product's MOQ (minimum order quantity)
- **Message**: Template mentioning the specific product
- **Deadline**: 7 days from current date
- **Product info**: Name, supplier, current price displayed

### 5. Integration Points

- **API**: Uses `apiService.createQuote(quoteData)`
- **Product Context**: Accesses current product and company data
- **Validation**: Ensures required fields and minimum quantities
- **Error Handling**: Displays user-friendly error messages

## Benefits

1. **Alibaba-like Experience**: Direct quote requests from product pages
2. **Pre-populated Data**: Reduces buyer effort with intelligent defaults
3. **Structured Process**: Clear workflow for both buyers and suppliers
4. **Separate from RFQs**: Uses dedicated quotes table for product-specific requests
5. **Better Conversion**: Easier for buyers to request quotes = more leads for suppliers

## Usage Statistics Potential

The system can track:
- Quote request volume per product
- Conversion rates (requests → actual quotes)
- Response times by supplier
- Popular products by quote requests
- Buyer engagement patterns

## Next Steps

1. **Supplier Portal**: Add quote management for suppliers
2. **Email Notifications**: Notify suppliers of new quote requests
3. **Quote Comparison**: Let buyers compare multiple quotes
4. **Follow-up System**: Automated reminders for pending quotes
5. **Analytics Dashboard**: Track quote performance metrics
