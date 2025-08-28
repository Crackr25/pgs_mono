import { useState } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, X, Upload, Calendar } from 'lucide-react';
import Card from '../../../components/common/Card';
import Button from '../../../components/common/Button';
import { useAuth } from '../../../contexts/AuthContext';
import apiService from '../../../lib/api';

export default function CreateRFQ() {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    quantity: '',
    unit: 'pieces',
    budget_min: '',
    budget_max: '',
    delivery_location: '',
    delivery_date: '',
    specifications: [{ key: '', value: '' }],
    attachments: [],
    terms_conditions: '',
    payment_terms: '',
    validity_days: 30
  });

  const categories = [
    'Electronics & Electrical',
    'Industrial Equipment',
    'Construction Materials',
    'Textiles & Apparel',
    'Food & Beverages',
    'Automotive Parts',
    'Chemicals & Materials',
    'Furniture & Home Decor',
    'Medical & Healthcare',
    'Agriculture & Farming',
    'Other'
  ];

  const units = [
    'pieces', 'sets', 'pairs', 'dozens',
    'meters', 'kilometers', 'feet', 'inches',
    'kilograms', 'grams', 'tons', 'pounds',
    'liters', 'gallons', 'cubic meters',
    'square meters', 'square feet',
    'boxes', 'cartons', 'pallets',
    'other'
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
  };

  const removeSpecification = (index) => {
    if (formData.specifications.length > 1) {
      const newSpecs = formData.specifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        specifications: newSpecs
      }));
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    setFormData(prev => ({
      ...prev,
      attachments: [...prev.attachments, ...files]
    }));
  };

  const removeAttachment = (index) => {
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title.trim()) errors.push('Title is required');
    if (!formData.description.trim()) errors.push('Description is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.quantity || formData.quantity <= 0) errors.push('Valid quantity is required');
    if (!formData.budget_min || formData.budget_min <= 0) errors.push('Minimum budget is required');
    if (!formData.budget_max || formData.budget_max <= 0) errors.push('Maximum budget is required');
    if (parseFloat(formData.budget_min) >= parseFloat(formData.budget_max)) {
      errors.push('Maximum budget must be greater than minimum budget');
    }
    if (!formData.delivery_location.trim()) errors.push('Delivery location is required');
    if (!formData.delivery_date) errors.push('Delivery date is required');
    
    // Check if delivery date is in the future
    const deliveryDate = new Date(formData.delivery_date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    if (deliveryDate <= today) {
      errors.push('Delivery date must be in the future');
    }

    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    const validationErrors = validateForm();
    if (validationErrors.length > 0) {
      setError(validationErrors.join(', '));
      return;
    }

    setLoading(true);
    setError(null);

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        expires_at: new Date(Date.now() + (formData.validity_days * 24 * 60 * 60 * 1000)).toISOString()
      };

      // Mock API call - replace with actual API
      console.log('Submitting RFQ:', submitData);
      
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to RFQs list on success
      router.push('/buyer/rfqs');
    } catch (error) {
      console.error('Error creating RFQ:', error);
      setError('Failed to create RFQ. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    try {
      // Mock save draft functionality
      console.log('Saving draft:', formData);
      await new Promise(resolve => setTimeout(resolve, 500));
      router.push('/buyer/rfqs');
    } catch (error) {
      console.error('Error saving draft:', error);
      setError('Failed to save draft. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <Head>
        <title>Create RFQ - Buyer Portal</title>
      </Head>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center space-x-4">
          <button
            onClick={() => router.back()}
            className="p-2 hover:bg-secondary-100 rounded-lg transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-secondary-600" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Create New RFQ</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Request quotes from suppliers for your requirements
            </p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Basic Information</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    RFQ Title *
                  </label>
                  <input
                    type="text"
                    name="title"
                    value={formData.title}
                    onChange={handleInputChange}
                    placeholder="e.g., LED Light Fixtures - 1000 units"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Description *
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Provide detailed description of your requirements..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Quantity *
                    </label>
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      min="1"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    >
                      {units.map(unit => (
                        <option key={unit} value={unit}>{unit}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Budget & Delivery */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Budget & Delivery</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Min Budget (USD) *
                    </label>
                    <input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Max Budget (USD) *
                    </label>
                    <input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleInputChange}
                      min="0"
                      step="0.01"
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Delivery Location *
                  </label>
                  <input
                    type="text"
                    name="delivery_location"
                    value={formData.delivery_location}
                    onChange={handleInputChange}
                    placeholder="e.g., Manila, Philippines"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Required Delivery Date *
                  </label>
                  <div className="relative">
                    <input
                      type="date"
                      name="delivery_date"
                      value={formData.delivery_date}
                      onChange={handleInputChange}
                      min={new Date().toISOString().split('T')[0]}
                      className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                      required
                    />
                    <Calendar className="absolute right-3 top-1/2 transform -translate-y-1/2 text-secondary-400 w-4 h-4 pointer-events-none" />
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    RFQ Validity (Days)
                  </label>
                  <select
                    name="validity_days"
                    value={formData.validity_days}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Specifications */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-secondary-900">Technical Specifications</h2>
                <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                  <Plus className="w-4 h-4 mr-1" />
                  Add Specification
                </Button>
              </div>
              
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      placeholder="Value/Requirement"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className="flex-1 px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                    />
                    {formData.specifications.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeSpecification(index)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Card>

          {/* Attachments */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Attachments</h2>
              
              <div className="space-y-4">
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center">
                  <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 mb-2">
                    Upload technical drawings, specifications, or reference images
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload">
                    <Button type="button" variant="outline" size="sm" as="span">
                      Choose Files
                    </Button>
                  </label>
                </div>

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg">
                        <span className="text-sm text-secondary-700">{file.name}</span>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="text-red-600 hover:text-red-800"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </Card>

          {/* Terms & Conditions */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Additional Information</h2>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="e.g., 30% advance, 70% on delivery"
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any specific terms, conditions, or requirements..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Error Display */}
          {error && (
            <Card className="p-4 bg-red-50 border-red-200">
              <p className="text-red-800 text-sm">{error}</p>
            </Card>
          )}

          {/* Actions */}
          <div className="flex justify-end space-x-4">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              Save as Draft
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Publishing...
                </>
              ) : (
                'Publish RFQ'
              )}
            </Button>
          </div>
        </form>
      </div>
    </>
  );
}
