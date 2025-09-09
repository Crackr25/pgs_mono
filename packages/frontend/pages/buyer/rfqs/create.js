import { useState, useEffect } from 'react';
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
  const [fieldErrors, setFieldErrors] = useState({});
  const [previewModal, setPreviewModal] = useState({ isOpen: false, file: null, type: null });
  
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
    validity_days: 30,
    certifications_required: [],
    sample_requirements: '',
    supplier_location_preference: 'any',
    quality_standards: ''
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

  const availableCertifications = [
    'CE', 'FCC', 'RoHS', 'ISO 9001', 'ISO 14001', 'FDA', 'HACCP', 
    'Organic', 'Fair Trade', 'GMP', 'ISO/TS 16949', 'UL', 'ETL', 'CSA'
  ];

  const supplierLocationOptions = [
    { value: 'any', label: 'Any Location' },
    { value: 'local', label: 'Local/Domestic Only' },
    { value: 'asia', label: 'Asia Pacific' },
    { value: 'europe', label: 'Europe' },
    { value: 'americas', label: 'Americas' },
    { value: 'verified', label: 'Verified Suppliers Only' }
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

  // Category-specific specification templates inspired by Alibaba
  const categoryTemplates = {
    'Electronics & Electrical': [
      { key: 'Power Consumption', value: '' },
      { key: 'Input Voltage', value: '' },
      { key: 'Operating Temperature', value: '' },
      { key: 'Certification Required', value: 'CE, FCC, RoHS' },
      { key: 'Warranty Period', value: '' }
    ],
    'Textiles & Apparel': [
      { key: 'Material Composition', value: '' },
      { key: 'Size Range', value: '' },
      { key: 'Color Options', value: '' },
      { key: 'Care Instructions', value: '' },
      { key: 'Packaging Requirements', value: '' }
    ],
    'Industrial Equipment': [
      { key: 'Power Requirements', value: '' },
      { key: 'Dimensions (L×W×H)', value: '' },
      { key: 'Weight Capacity', value: '' },
      { key: 'Safety Standards', value: '' },
      { key: 'Installation Requirements', value: '' }
    ],
    'Food & Beverages': [
      { key: 'Shelf Life', value: '' },
      { key: 'Storage Temperature', value: '' },
      { key: 'Packaging Type', value: '' },
      { key: 'Certifications Required', value: 'FDA, HACCP, Organic' },
      { key: 'Ingredients List', value: '' }
    ],
    'Automotive Parts': [
      { key: 'Compatible Models', value: '' },
      { key: 'Material Standard', value: '' },
      { key: 'Testing Requirements', value: '' },
      { key: 'OEM Part Number', value: '' },
      { key: 'Quality Standards', value: 'ISO/TS 16949' }
    ]
  };

  // Cleanup function to revoke object URLs when component unmounts
  useEffect(() => {
    return () => {
      // Clean up all object URLs when component unmounts
      formData.attachments.forEach(file => {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
      });
    };
  }, []);

  // Helper function to apply category template
  const applyCategoryTemplate = (category) => {
    const template = categoryTemplates[category];
    if (template) {
      setFormData(prev => ({
        ...prev,
        specifications: template.map(spec => ({ ...spec }))
      }));
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Apply category template when category changes
    if (name === 'category' && value && categoryTemplates[value]) {
      applyCategoryTemplate(value);
    }
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
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
    console.log('File upload triggered'); // Debug log
    const files = Array.from(e.target.files);
    console.log('Selected files:', files); // Debug log
    
    if (files.length === 0) {
      console.log('No files selected');
      return;
    }
    
    // Define allowed file types (including videos)
    const allowedTypes = [
      'application/pdf',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'image/jpeg',
      'image/jpg', 
      'image/png',
      'image/gif',
      'video/mp4',
      'video/mov',
      'video/avi',
      'video/wmv',
      'video/mkv',
      'video/webm',
      'video/quicktime'
    ];
    
    const allowedExtensions = ['pdf', 'doc', 'docx', 'jpg', 'jpeg', 'png', 'gif', 'mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    
    // Validate file types and sizes
    const validFiles = files.filter(file => {
      console.log(`Checking file: ${file.name}, size: ${file.size} bytes, type: ${file.type}`);
      
      // Check file type
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isAllowedType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
      
      if (!isAllowedType) {
        alert(`File "${file.name}" is not allowed. Only PDF, DOC, DOCX, Images (JPG, JPEG, PNG, GIF), and Videos (MP4, MOV, AVI, WMV, MKV, WEBM) are allowed.`);
        return false;
      }
      
      // Set size limits - 50MB for all files to match backend
      const maxSize = 50 * 1024 * 1024; // 50MB
      
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum file size is 50MB.`);
        return false;
      }
      
      return true;
    });
    
    console.log('Valid files after validation:', validFiles);
    
    if (validFiles.length > 0) {
      // Create preview URLs for image and video files
      const filesWithPreviews = validFiles.map(file => {
        console.log(`Processing file: ${file.name}, type: ${file.type}`);
        
        if (isImageFile(file) || isVideoFile(file)) {
          // Create a new file object with preview URL
          const fileWithPreview = file;
          fileWithPreview.preview = URL.createObjectURL(file);
          console.log(`Created preview URL for ${file.name}: ${fileWithPreview.preview}`);
          return fileWithPreview;
        }
        return file;
      });
      
      console.log('Files with previews:', filesWithPreviews);
      
      setFormData(prev => {
        const newData = {
          ...prev,
          attachments: [...prev.attachments, ...filesWithPreviews]
        };
        console.log('Updated attachments:', newData.attachments);
        return newData;
      });
    }
    
    // Clear the input so the same file can be selected again if needed
    e.target.value = '';
  };

  const formatFileSize = (bytes) => {
    if (!bytes && bytes !== 0) return 'Unknown size';
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const getFileIcon = (filename) => {
    // Handle both File objects and filename strings
    const name = typeof filename === 'string' ? filename : filename?.name || '';
    
    if (!name) return '📎'; // Default icon if no filename
    
    const ext = name.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'mkv'];
    const docExts = ['pdf', 'doc', 'docx'];
    
    if (imageExts.includes(ext)) return '🖼️';
    if (videoExts.includes(ext)) return '🎥';
    if (docExts.includes(ext)) return '📄';
    if (['xlsx', 'xls'].includes(ext)) return '📊';
    if (['pptx', 'ppt'].includes(ext)) return '📋';
    if (['zip', 'rar'].includes(ext)) return '📦';
    return '📎';
  };

  const removeAttachment = (index) => {
    const fileToRemove = formData.attachments[index];
    
    // Revoke object URL if it exists to prevent memory leaks
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
  };

  // Function to check if file is an image
  const isImageFile = (file) => {
    if (!file) return false;
    
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const isImageByType = imageTypes.includes(file.type);
    
    // Also check by file extension as a fallback
    const fileName = file.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const isImageByExtension = imageExtensions.includes(extension);
    
    const result = isImageByType || isImageByExtension;
    console.log(`isImageFile check for ${fileName}: type=${file.type}, extension=${extension}, result=${result}`);
    
    return result;
  };

  // Function to check if file is a video
  const isVideoFile = (file) => {
    if (!file) return false;
    
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/mkv', 'video/webm', 'video/quicktime'];
    const isVideoByType = videoTypes.includes(file.type);
    
    // Also check by file extension as a fallback
    const fileName = file.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    const isVideoByExtension = videoExtensions.includes(extension);
    
    const result = isVideoByType || isVideoByExtension;
    console.log(`isVideoFile check for ${fileName}: type=${file.type}, extension=${extension}, result=${result}`);
    
    return result;
  };

  // Function to create preview URL for images
  const createFilePreview = (file) => {
    if (isImageFile(file)) {
      return URL.createObjectURL(file);
    }
    return null;
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragEnter = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    console.log('Files dropped:', files);
    
    if (files.length > 0) {
      // Create a fake event object to reuse the handleFileUpload logic
      const fakeEvent = {
        target: { files: files, value: '' }
      };
      handleFileUpload(fakeEvent);
    }
  };

  // Helper function to get field error message
  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
  };

  // Helper function to get field CSS classes with error styling
  const getFieldClasses = (fieldName, baseClasses = "w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent") => {
    const hasError = fieldErrors[fieldName];
    if (hasError) {
      return `${baseClasses} border-red-300 focus:ring-red-500`;
    }
    return `${baseClasses} border-secondary-300 focus:ring-primary-500`;
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
      // Clear previous errors
      setError(null);
      setFieldErrors({});

      // Prepare form data for submission
      const submitData = {
        ...formData,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        status: 'published' // Publish immediately when submitting
      };

      // Remove attachments from submitData as they'll be sent separately
      const { attachments, ...rfqData } = submitData;

      const response = await apiService.createBuyerRFQ(rfqData, formData.attachments);
      
      if (response.success) {
        router.push('/buyer/rfqs');
      } else {
        setError(response.message || 'Failed to create RFQ. Please try again.');
        
        // Handle field-specific errors
        if (response.field_errors) {
          setFieldErrors(response.field_errors);
        }
      }
    } catch (error) {
      console.error('Error creating RFQ:', error);
      
      // Handle field-specific errors from API
      if (error.field_errors) {
        setFieldErrors(error.field_errors);
      }
      
      // Parse error response for better user feedback
      if (error.status === 422 || error.message.includes('Validation')) {
        setError(error.message || 'Please check the form for errors and try again.');
      } else if (error.status === 413 || error.message.includes('too large')) {
        setError('One or more files are too large. Please use files smaller than 10MB.');
      } else if (error.status === 401 || error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please log in again.');
      } else if (error.status === 500) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.message || 'Failed to create RFQ. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    setFieldErrors({});

    try {
      // Prepare form data for submission
      const submitData = {
        ...formData,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        status: 'draft' // Save as draft
      };

      // Remove attachments from submitData as they'll be sent separately
      const { attachments, ...rfqData } = submitData;

      const response = await apiService.createBuyerRFQ(rfqData, formData.attachments);
      
      if (response.success) {
        router.push('/buyer/rfqs');
      } else {
        setError(response.message || 'Failed to save draft. Please try again.');
        
        // Handle field-specific errors
        if (response.field_errors) {
          setFieldErrors(response.field_errors);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      
      // Parse error response for better user feedback
      if (error.message.includes('422') || error.message.includes('Validation')) {
        setError('Please check the form for errors and try again.');
      } else if (error.message.includes('413') || error.message.includes('too large')) {
        setError('One or more files are too large. Please use files smaller than 10MB.');
      } else if (error.message.includes('401') || error.message.includes('Unauthorized')) {
        setError('Your session has expired. Please log in again.');
      } else if (error.message.includes('500')) {
        setError('Server error occurred. Please try again later.');
      } else {
        setError(error.message || 'Failed to save draft. Please try again.');
      }
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
                    className={getFieldClasses('title')}
                    required
                  />
                  {getFieldError('title') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('title')}</p>
                  )}
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
                    className={getFieldClasses('description')}
                    required
                  />
                  {getFieldError('description') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('description')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Category *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={(e) => {
                      handleInputChange(e);
                      applyCategoryTemplate(e.target.value); // Apply template on category change
                    }}
                    className={getFieldClasses('category')}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {getFieldError('category') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('category')}</p>
                  )}
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
                      placeholder="Enter quantity"
                      className={getFieldClasses('quantity')}
                      required
                    />
                    {getFieldError('quantity') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('quantity')}</p>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-secondary-700 mb-2">
                      Unit *
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className={getFieldClasses('unit')}
                      required
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
                      className={getFieldClasses('budget_min')}
                      required
                    />
                    {getFieldError('budget_min') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('budget_min')}</p>
                    )}
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
                      className={getFieldClasses('budget_max')}
                      required
                    />
                    {getFieldError('budget_max') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('budget_max')}</p>
                    )}
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
                    className={getFieldClasses('delivery_location')}
                    required
                  />
                  {getFieldError('delivery_location') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('delivery_location')}</p>
                  )}
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
                      className={getFieldClasses('delivery_date')}
                      required
                    />
                    {getFieldError('delivery_date') && (
                      <p className="mt-1 text-sm text-red-600">{getFieldError('delivery_date')}</p>
                    )}
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
                    className={getFieldClasses('validity_days')}
                  >
                    <option value={7}>7 days</option>
                    <option value={14}>14 days</option>
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                  </select>
                  {getFieldError('validity_days') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('validity_days')}</p>
                  )}
                </div>
              </div>
            </div>
          </Card>

          {/* Specifications */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-lg font-medium text-secondary-900">Technical Specifications</h2>
                  <p className="text-sm text-secondary-600 mt-1">
                    {formData.category ? `Specifications for ${formData.category}` : 'Add detailed product specifications'}
                  </p>
                </div>
                <div className="flex space-x-2">
                  {formData.category && categoryTemplates[formData.category] && (
                    <Button 
                      type="button" 
                      variant="outline" 
                      size="sm" 
                      onClick={() => applyCategoryTemplate(formData.category)}
                    >
                      Use Template
                    </Button>
                  )}
                  <Button type="button" variant="outline" size="sm" onClick={addSpecification}>
                    <Plus className="w-4 h-4 mr-1" />
                    Add Specification
                  </Button>
                </div>
              </div>
              
              <div className="space-y-3">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex space-x-3">
                    <input
                      type="text"
                      placeholder="Specification name"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      className={getFieldClasses(`specifications.${index}.key`, "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent")}
                    />
                    <input
                      type="text"
                      placeholder="Value/Requirement"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      className={getFieldClasses(`specifications.${index}.value`, "flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:border-transparent")}
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
                {(getFieldError('specifications.0.key') || getFieldError('specifications.0.value')) && (
                  <p className="mt-1 text-sm text-red-600">
                    {getFieldError('specifications.0.key') || getFieldError('specifications.0.value')}
                  </p>
                )}
              </div>
            </div>
          </Card>

          {/* Attachments */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-secondary-900">Attachments</h2>
                {formData.attachments.length > 0 && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
                    {formData.attachments.length} file{formData.attachments.length > 1 ? 's' : ''} selected
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                <div 
                  className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors"
                  onDragOver={handleDragOver}
                  onDragEnter={handleDragEnter}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className="w-8 h-8 text-secondary-400 mx-auto mb-2" />
                  <p className="text-sm text-secondary-600 mb-2">
                    <strong>Click to upload</strong> or drag and drop files here
                  </p>
                  <p className="text-xs text-secondary-500 mb-3">
                    Supported: PDF, DOC, DOCX, Images (JPG, JPEG, PNG, GIF), Videos (MP4, MOV, AVI, WMV, MKV, WEBM)
                  </p>
                  <input
                    type="file"
                    multiple
                    accept=".pdf,.doc,.docx,.jpg,.jpeg,.png,.gif,.mp4,.mov,.avi,.wmv,.mkv,.webm"
                    onChange={handleFileUpload}
                    className="hidden"
                    id="file-upload"
                  />
                  <label htmlFor="file-upload" className="cursor-pointer inline-block">
                    <span className="inline-flex items-center px-3 py-2 border border-secondary-300 shadow-sm text-sm leading-4 font-medium rounded-md text-secondary-700 bg-white hover:bg-secondary-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors">
                      Choose Files
                    </span>
                  </label>
                  <p className="text-xs text-secondary-400 mt-2">
                    Maximum file size: 50MB per file
                  </p>
                  
                  {/* Temporary debug button */}
                  <button 
                    type="button" 
                    onClick={() => {
                      console.log('=== DEBUG: Current attachments ===');
                      formData.attachments.forEach((file, index) => {
                        console.log(`File ${index}:`, {
                          name: file.name,
                          type: file.type,
                          size: file.size,
                          preview: file.preview,
                          isImage: isImageFile(file),
                          isVideo: isVideoFile(file)
                        });
                      });
                      console.log('Total files:', formData.attachments.length);
                    }}
                    className="mt-2 text-xs text-blue-600 hover:text-blue-800"
                  >
                    Debug: Show Attached Files Details
                  </button>
                  
                  {/* Additional debug info */}
                  {formData.attachments.length > 0 && (
                    <div className="mt-3 p-2 bg-blue-50 rounded text-xs">
                      <p className="font-medium text-blue-800">Debug Info:</p>
                      <p className="text-blue-600">
                        Images: {formData.attachments.filter(isImageFile).length}, 
                        Videos: {formData.attachments.filter(isVideoFile).length}, 
                        Others: {formData.attachments.filter(f => !isImageFile(f) && !isVideoFile(f)).length}
                      </p>
                    </div>
                  )}
                </div>

                {getFieldError('attachments') && (
                  <p className="mt-1 text-sm text-red-600">{getFieldError('attachments')}</p>
                )}

                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    {formData.attachments.map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-secondary-50 rounded-lg border">
                        <div 
                          className={`flex items-center space-x-3 flex-1 ${(isImageFile(file) || isVideoFile(file)) ? 'cursor-pointer hover:bg-secondary-100 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                          onClick={() => {
                            if (isImageFile(file)) {
                              setPreviewModal({ isOpen: true, file, type: 'image' });
                            } else if (isVideoFile(file)) {
                              setPreviewModal({ isOpen: true, file, type: 'video' });
                            }
                          }}
                        >
                          {isImageFile(file) ? (
                            <div className="relative w-12 h-12">
                              <img 
                                src={file.preview || URL.createObjectURL(file)} 
                                alt={file.name}
                                className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                onLoad={(e) => {
                                  console.log('Image loaded successfully:', file.name);
                                }}
                                onError={(e) => {
                                  console.error('Image preview error for:', file.name, e);
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-icon');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="fallback-icon w-full h-full bg-gray-200 rounded border flex items-center justify-center text-lg absolute inset-0" style={{display: 'none'}}>
                                🖼️
                              </div>
                            </div>
                          ) : isVideoFile(file) ? (
                            <div className="relative w-12 h-12">
                              <video 
                                src={file.preview || URL.createObjectURL(file)}
                                className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                muted
                                preload="metadata"
                                onLoadedMetadata={(e) => {
                                  console.log('Video metadata loaded successfully:', file.name);
                                }}
                                onError={(e) => {
                                  console.error('Video preview error for:', file.name, e);
                                  e.target.style.display = 'none';
                                  const fallback = e.target.parentElement.querySelector('.fallback-icon');
                                  if (fallback) fallback.style.display = 'flex';
                                }}
                              />
                              <div className="fallback-icon w-full h-full bg-gray-200 rounded border flex items-center justify-center text-lg absolute inset-0" style={{display: 'none'}}>
                                🎥
                              </div>
                              {/* Play icon overlay */}
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-0 hover:bg-opacity-40 rounded transition-all duration-200 group">
                                <div className="w-6 h-6 bg-white bg-opacity-0 group-hover:bg-opacity-90 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 group-hover:scale-110">
                                  <div className="w-0 h-0 border-l-[6px] border-l-black opacity-0 group-hover:opacity-100 border-t-[3px] border-t-transparent border-b-[3px] border-b-transparent ml-0.5 transition-all duration-200"></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <span className="text-2xl">{getFileIcon(file.name || file)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-secondary-700">
                              {file.name || 'Unknown filename'}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {formatFileSize(file.size)}
                              {isImageFile(file) && <span className="ml-2 text-green-600">• Image Preview - Click to view</span>}
                              {isVideoFile(file) && <span className="ml-2 text-blue-600">• Video Preview - Click to play</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
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
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Quality & Supplier Requirements</h2>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-3">
                    Required Certifications
                  </label>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                    {availableCertifications.map(cert => (
                      <label key={cert} className="flex items-center space-x-2">
                        <input
                          type="checkbox"
                          checked={formData.certifications_required.includes(cert)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData(prev => ({
                                ...prev,
                                certifications_required: [...prev.certifications_required, cert]
                              }));
                            } else {
                              setFormData(prev => ({
                                ...prev,
                                certifications_required: prev.certifications_required.filter(c => c !== cert)
                              }));
                            }
                          }}
                          className="rounded border-secondary-300 text-primary-600 focus:ring-primary-500"
                        />
                        <span className="text-sm text-secondary-700">{cert}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Quality Standards
                  </label>
                  <textarea
                    name="quality_standards"
                    value={formData.quality_standards}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g., Zero defect requirement, specific testing standards, quality control processes..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Sample Requirements
                  </label>
                  <textarea
                    name="sample_requirements"
                    value={formData.sample_requirements}
                    onChange={handleInputChange}
                    rows={2}
                    placeholder="e.g., Free samples required, sample quantity needed, sample shipping terms..."
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Supplier Location Preference
                  </label>
                  <select
                    name="supplier_location_preference"
                    value={formData.supplier_location_preference}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-secondary-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-transparent"
                  >
                    {supplierLocationOptions.map(option => (
                      <option key={option.value} value={option.value}>{option.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </Card>

          {/* Additional Information */}
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

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4">
          <div className="relative max-w-4xl max-h-full bg-white rounded-lg overflow-hidden">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-medium text-gray-900">
                {previewModal.file?.name}
              </h3>
              <button
                onClick={() => setPreviewModal({ isOpen: false, file: null, type: null })}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="p-4">
              {previewModal.type === 'image' ? (
                <img
                  src={previewModal.file?.preview || URL.createObjectURL(previewModal.file)}
                  alt={previewModal.file?.name}
                  className="max-w-full max-h-[70vh] object-contain mx-auto"
                />
              ) : previewModal.type === 'video' ? (
                <video
                  src={previewModal.file?.preview || URL.createObjectURL(previewModal.file)}
                  controls
                  autoPlay
                  className="max-w-full max-h-[70vh] mx-auto"
                >
                  Your browser does not support the video tag.
                </video>
              ) : null}
            </div>
            <div className="px-4 pb-4">
              <p className="text-sm text-gray-600">
                File size: {formatFileSize(previewModal.file?.size)}
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
