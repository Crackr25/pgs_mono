import { useState } from 'react';
import { Plus, X } from 'lucide-react';
import Form, { FormField } from '../common/Form';
import FileUpload from '../common/FileUpload';
import Button from '../common/Button';

export default function ProductForm({ product = null, onSubmit, onCancel }) {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    specs: product?.specs || '',
    moq: product?.moq || '',
    lead_time: product?.lead_time || product?.leadTime || '',
    hs_code: product?.hs_code || product?.hsCode || '',
    price: product?.price || '',
    category: product?.category || '',
    description: product?.description || '',
    variants: product?.variants || [],
    stock_quantity: product?.stock_quantity || '',
    unit: product?.unit || '',
    image: product?.image || null
  });
  
  const [newVariant, setNewVariant] = useState('');
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const addVariant = () => {
    if (newVariant.trim() && !formData.variants.includes(newVariant.trim())) {
      setFormData(prev => ({
        ...prev,
        variants: [...prev.variants, newVariant.trim()]
      }));
      setNewVariant('');
    }
  };

  const removeVariant = (index) => {
    setFormData(prev => ({
      ...prev,
      variants: prev.variants.filter((_, i) => i !== index)
    }));
  };

  const handleImageUpload = (files) => {
    // Store single file for later upload when form is submitted
    console.log('handleImageUpload called with files:', files);
    if (files && files.length > 0) {
      console.log('Setting image file:', files[0]);
      setFormData(prev => ({
        ...prev,
        image: files[0] // Only take the first file
      }));
    }
  };

  const categoryOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'automotive', label: 'Automotive' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'food', label: 'Food & Beverages' },
    { value: 'construction', label: 'Construction Materials' },
    { value: 'packaging', label: 'Packaging' }
  ];

  return (
    <div className="space-y-6">
      <Form 
        onSubmit={handleSubmit} 
        onCancel={onCancel}
        submitText={product ? 'Update Product' : 'Create Product'}
      >
        {/* Basic Information */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Basic Information
          </h3>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Product Name"
              name="name"
              value={formData.name}
              onChange={handleInputChange}
              required
              placeholder="Enter product name"
            />
            
            <FormField
              label="Category"
              name="category"
              type="select"
              value={formData.category}
              onChange={handleInputChange}
              options={categoryOptions}
              required
            />
            
            <FormField
              label="Price (USD)"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              required
              placeholder="25.50"
            />
            
            <FormField
              label="HS Code"
              name="hsCode"
              value={formData.hsCode}
              onChange={handleInputChange}
              required
              placeholder="9405.40.90"
            />
            
            <FormField
              label="Minimum Order Quantity (MOQ)"
              name="moq"
              type="number"
              value={formData.moq}
              onChange={handleInputChange}
              required
              placeholder="100"
            />
            
            <FormField
              label="Lead Time"
              name="lead_time"
              value={formData.lead_time}
              onChange={handleInputChange}
              required
              placeholder="15-20 days"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              label="Stock Quantity"
              name="stock_quantity"
              type="number"
              value={formData.stock_quantity}
              onChange={handleInputChange}
              placeholder="1000"
              min="0"
            />
            
            <FormField
              label="Unit"
              name="unit"
              value={formData.unit}
              onChange={handleInputChange}
              placeholder="pieces, kg, meters, etc."
            />
          </div>
          
          <FormField
            label="Product Specifications"
            name="specs"
            type="textarea"
            value={formData.specs}
            onChange={handleInputChange}
            required
            placeholder="Detailed product specifications..."
          />
          
          <FormField
            label="Product Description"
            name="description"
            type="textarea"
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Detailed product description for buyers..."
          />
        </div>

        {/* Product Images */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Product Images
          </h3>
          <FileUpload
            label="Upload Product Photo"
            accept=".jpg,.jpeg,.png"
            multiple={false}
            maxSize={5}
            onFilesChange={handleImageUpload}
            uploadProgress={uploadProgress}
            uploadErrors={uploadErrors}
          />
          <p className="mt-2 text-sm text-secondary-600">
            Upload high-quality images showing your product from different angles. 
            First image will be used as the main product image.
          </p>
        </div>

        {/* Product Variants */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            Product Variants
          </h3>
          
          <div className="flex space-x-2 mb-4">
            <input
              type="text"
              value={newVariant}
              onChange={(e) => setNewVariant(e.target.value)}
              placeholder="Add variant (e.g., 50W, 100W, Red, Large)"
              className="flex-1 form-input"
              onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addVariant())}
            />
            <Button type="button" onClick={addVariant} variant="outline">
              <Plus className="w-4 h-4 mr-1" />
              Add
            </Button>
          </div>
          
          {formData.variants.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {formData.variants.map((variant, index) => (
                <div
                  key={index}
                  className="flex items-center space-x-2 bg-secondary-100 px-3 py-1 rounded-full"
                >
                  <span className="text-sm">{variant}</span>
                  <button
                    type="button"
                    onClick={() => removeVariant(index)}
                    className="text-secondary-500 hover:text-red-500"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* SEO & Marketing */}
        <div className="bg-white p-6 rounded-lg border border-secondary-200">
          <h3 className="text-lg font-medium text-secondary-900 mb-4">
            SEO & Marketing
          </h3>
          
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
            <div className="flex items-start space-x-3">
              <div className="flex-shrink-0">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-blue-600 font-bold text-sm">AI</span>
                </div>
              </div>
              <div>
                <h4 className="text-sm font-medium text-blue-800">
                  AI Assistant (Coming Soon)
                </h4>
                <p className="mt-1 text-sm text-blue-700">
                  Our AI will help optimize your product title and description for better visibility 
                  in search results and improved buyer engagement.
                </p>
                <Button variant="outline" size="sm" className="mt-2" disabled>
                  Optimize with AI
                </Button>
              </div>
            </div>
          </div>
        </div>
      </Form>
    </div>
  );
}
