/**
 * Shared product categories for consistent handling across the application
 * This ensures category consistency between ProductForm and buyer search functionality
 */

export const PRODUCT_CATEGORIES = [
  { value: 'electronics', label: 'Electronics' },
  { value: 'automotive', label: 'Automotive' },
  { value: 'textiles', label: 'Textiles' },
  { value: 'machinery', label: 'Machinery' },
  { value: 'chemicals', label: 'Chemicals' },
  { value: 'food', label: 'Food & Beverages' },
  { value: 'construction', label: 'Construction Materials' },
  { value: 'packaging', label: 'Packaging' },
  { value: 'apparel', label: 'Apparel' },
  { value: 'conductor', label: 'Conductor' },
  { value: 'furniture', label: 'Furniture' },
  { value: 'hair_clipper', label: 'Hair Clipper' },
  { value: 'metal', label: 'Metal' }
];

export const CATEGORY_VALUES = PRODUCT_CATEGORIES.map(cat => cat.value);

export const CATEGORY_LABELS = PRODUCT_CATEGORIES.reduce((acc, cat) => {
  acc[cat.value] = cat.label;
  return acc;
}, {});

/**
 * Get display label for a category value
 * @param {string} value - Category value (e.g., 'hair_clipper')
 * @returns {string} - Display label (e.g., 'Hair Clipper')
 */
export function getCategoryLabel(value) {
  return CATEGORY_LABELS[value] || value.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
}

/**
 * Get category value from label
 * @param {string} label - Category label (e.g., 'Hair Clipper')  
 * @returns {string} - Category value (e.g., 'hair_clipper')
 */
export function getCategoryValue(label) {
  const category = PRODUCT_CATEGORIES.find(cat => cat.label === label);
  return category ? category.value : label.toLowerCase().replace(/\s+/g, '_');
}
