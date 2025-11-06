// CSV parsing and export utilities for bulk operations

export function parseCSV(csvText) {
  const lines = csvText.trim().split('\n');
  if (lines.length < 2) return [];

  const headers = lines[0].split(',').map(header => header.trim().replace(/"/g, ''));
  const data = [];

  for (let i = 1; i < lines.length; i++) {
    const values = parseCSVLine(lines[i]);
    if (values.length === headers.length) {
      const row = {};
      headers.forEach((header, index) => {
        row[header] = values[index]?.trim().replace(/"/g, '') || '';
      });
      data.push(row);
    }
  }

  return data;
}

function parseCSVLine(line) {
  const values = [];
  let current = '';
  let inQuotes = false;
  let i = 0;

  while (i < line.length) {
    const char = line[i];
    const nextChar = line[i + 1];

    if (char === '"' && !inQuotes) {
      inQuotes = true;
    } else if (char === '"' && inQuotes) {
      if (nextChar === '"') {
        current += '"';
        i++; // Skip next quote
      } else {
        inQuotes = false;
      }
    } else if (char === ',' && !inQuotes) {
      values.push(current);
      current = '';
    } else {
      current += char;
    }
    i++;
  }

  values.push(current);
  return values;
}

export function generateCSVTemplate() {
  const headers = [
    'name',
    'description', 
    'category',
    'price',
    'moq',
    'lead_time',
    'hs_code',
    'origin_country',
    'brand_name',
    'model_number',
    'warranty',
    'specs',
    'stock_quantity',
    'unit'
  ];

  const sampleData = [
    {
      name: 'Sample Product 1',
      description: 'High-quality sample product for demonstration',
      category: 'electronics',
      price: '99.99',
      moq: '100',
      lead_time: '7-14 days',
      hs_code: '8517.62.00',
      origin_country: 'China',
      brand_name: 'Sample Brand',
      model_number: 'SP-001',
      warranty: '1 year',
      specs: 'Size: 10x10cm, Weight: 500g, Color: Black',
      stock_quantity: '1000',
      unit: 'pieces'
    },
    {
      name: 'Sample Product 2', 
      description: 'Another example product',
      category: 'automotive',
      price: '149.99',
      moq: '50',
      lead_time: '10-21 days',
      hs_code: '8708.99.00',
      origin_country: 'Germany',
      brand_name: 'Auto Parts Inc',
      model_number: 'AP-2024',
      warranty: '2 years',
      specs: 'Material: Steel, Finish: Chrome, Compatible: Universal',
      stock_quantity: '500',
      unit: 'pieces'
    }
  ];

  const csvContent = [
    headers.join(','),
    ...sampleData.map(row => 
      headers.map(header => {
        const value = row[header] || '';
        // Escape quotes and wrap in quotes if contains comma or quote
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  downloadCSV(csvContent, 'product_import_template.csv');
}

export async function exportProductsToCSV(products) {
  if (!products || products.length === 0) {
    alert('No products to export');
    return;
  }

  const headers = [
    'id',
    'name',
    'description', 
    'category',
    'price',
    'moq',
    'lead_time',
    'hs_code',
    'origin_country',
    'brand_name',
    'model_number',
    'warranty',
    'specs',
    'stock_quantity',
    'unit',
    'created_at',
    'updated_at'
  ];

  const csvContent = [
    headers.join(','),
    ...products.map(product => 
      headers.map(header => {
        let value = '';
        
        // Handle nested properties and special cases
        switch (header) {
          case 'created_at':
          case 'updated_at':
            value = product[header] ? new Date(product[header]).toISOString().split('T')[0] : '';
            break;
          case 'variants':
            value = Array.isArray(product.variants) 
              ? product.variants.map(v => typeof v === 'object' ? JSON.stringify(v) : v).join(';')
              : product.variants || '';
            break;
          default:
            value = String(product[header] || '');
        }

        // Escape quotes and wrap in quotes if contains comma, quote, or newline
        if (value.includes(',') || value.includes('"') || value.includes('\n')) {
          return `"${value.replace(/"/g, '""')}"`;
        }
        return value;
      }).join(',')
    )
  ].join('\n');

  const timestamp = new Date().toISOString().split('T')[0];
  const filename = `products_export_${timestamp}.csv`;
  
  downloadCSV(csvContent, filename);
}

function downloadCSV(csvContent, filename) {
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  
  if (link.download !== undefined) {
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  }
}

// Validation helpers
export function validateProductData(product) {
  const errors = [];
  
  if (!product.name?.trim()) {
    errors.push('Product name is required');
  }
  
  if (!product.price || isNaN(parseFloat(product.price))) {
    errors.push('Valid price is required');
  }
  
  if (!product.moq || isNaN(parseInt(product.moq))) {
    errors.push('Valid MOQ (Minimum Order Quantity) is required');
  }
  
  if (!product.category?.trim()) {
    errors.push('Category is required');
  }

  // Optional field validations
  if (product.hs_code && !/^\d{4,10}$/.test(product.hs_code.replace(/\./g, ''))) {
    errors.push('HS Code must be 4-10 digits');
  }

  if (product.price && parseFloat(product.price) < 0) {
    errors.push('Price must be positive');
  }

  if (product.moq && parseInt(product.moq) < 1) {
    errors.push('MOQ must be at least 1');
  }

  if (product.stock_quantity && parseInt(product.stock_quantity) < 0) {
    errors.push('Stock quantity cannot be negative');
  }

  return errors;
}

export function formatProductForImport(rawProduct) {
  return {
    name: rawProduct.name?.trim() || '',
    description: rawProduct.description?.trim() || '',
    category: rawProduct.category?.trim().toLowerCase() || '',
    price: parseFloat(rawProduct.price) || 0,
    moq: parseInt(rawProduct.moq) || 1,
    lead_time: rawProduct.lead_time?.trim() || '',
    hs_code: rawProduct.hs_code?.trim() || '',
    origin_country: rawProduct.origin_country?.trim() || '',
    brand_name: rawProduct.brand_name?.trim() || '',
    model_number: rawProduct.model_number?.trim() || '',
    warranty: rawProduct.warranty?.trim() || '',
    specs: rawProduct.specs?.trim() || '',
    stock_quantity: parseInt(rawProduct.stock_quantity) || 0,
    unit: rawProduct.unit?.trim() || 'pieces',
    // Set defaults for required fields
    images: [],
    videos: [],
    variants: []
  };
}
