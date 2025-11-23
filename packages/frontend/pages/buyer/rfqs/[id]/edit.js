import { useState, useEffect } from 'react';
import Head from 'next/head';
import { useRouter } from 'next/router';
import { ArrowLeft, Plus, X, Upload, Calendar, Loader } from 'lucide-react';
import Card from '../../../../components/common/Card';
import Button from '../../../../components/common/Button';
import { useAuth } from '../../../../contexts/AuthContext';
import apiService from '../../../../lib/api';

export default function EditRFQ() {
  const router = useRouter();
  const { id } = router.query;
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);
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
    attachments: [], // New file uploads
    existingAttachments: [], // Existing server attachments
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
    'Automotive Parts',
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

  // Helper function for getting attachment URLs
  const getAttachmentUrl = (attachment) => {
    if (!attachment) return '';
    
    // First check if there's a direct file URL
    if (attachment.file_url) {
      return attachment.file_url;
    }
    
    // Build URL from storage path
    const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';
    const storagePath = attachment.path || attachment.file_path;
    
    if (!storagePath) return '';
    
    // Clean the path and construct full URL
    const cleanPath = storagePath.replace(/^rfq-attachments\//, '');
    return `${baseUrl}/storage/rfq-attachments/${cleanPath}`;
  };

  // Load RFQ data when component mounts
  useEffect(() => {
    if (id && user) {
      fetchRFQData();
    }
  }, [id, user]);

  const fetchRFQData = async () => {
    try {
      setInitialLoading(true);
      setError(null);
      
      const response = await apiService.getBuyerRFQ(id);
      console.log('Fetched RFQ data:', response);
      
      if (response.success && response.data) {
        const rfq = response.data;
        
        // Only allow editing draft RFQs
        if (rfq.status !== 'draft') {
          setError('Only draft RFQs can be edited');
          return;
        }
        
        // Format the date for input field
        const formatDateForInput = (dateString) => {
          if (!dateString) return '';
          const date = new Date(dateString);
          return date.toISOString().split('T')[0];
        };
        
        // Parse specifications safely
        let specifications = [{ key: '', value: '' }];
        if (rfq.specifications) {
          try {
            const parsed = typeof rfq.specifications === 'string' 
              ? JSON.parse(rfq.specifications) 
              : rfq.specifications;
            if (Array.isArray(parsed) && parsed.length > 0) {
              specifications = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse specifications:', e);
          }
        }
        
        // Parse certifications safely
        let certifications = [];
        if (rfq.certifications_required) {
          try {
            const parsed = typeof rfq.certifications_required === 'string' 
              ? JSON.parse(rfq.certifications_required) 
              : rfq.certifications_required;
            if (Array.isArray(parsed)) {
              certifications = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse certifications:', e);
          }
        }

        // Process attachments safely
        let existingAttachments = [];
        if (rfq.attachments) {
          try {
            const parsed = typeof rfq.attachments === 'string' 
              ? JSON.parse(rfq.attachments) 
              : rfq.attachments;
            if (Array.isArray(parsed)) {
              existingAttachments = parsed;
            }
          } catch (e) {
            console.warn('Failed to parse attachments:', e);
          }
        }
        
        console.log('Processed attachments:', existingAttachments);
        
        setFormData({
          title: rfq.title || '',
          description: rfq.description || '',
          category: rfq.category || '',
          quantity: rfq.quantity ? String(rfq.quantity) : '',
          unit: rfq.unit || 'pieces',
          budget_min: rfq.budget_min ? String(rfq.budget_min) : '',
          budget_max: rfq.budget_max ? String(rfq.budget_max) : '',
          delivery_location: rfq.delivery_location || '',
          delivery_date: formatDateForInput(rfq.delivery_date),
          specifications: specifications,
          attachments: [], // New file uploads only
          existingAttachments: existingAttachments, // Existing server attachments
          terms_conditions: rfq.terms_conditions || '',
          payment_terms: rfq.payment_terms || '',
          validity_days: rfq.validity_days || 30,
          certifications_required: certifications,
          sample_requirements: rfq.sample_requirements || '',
          supplier_location_preference: rfq.supplier_location_preference || 'any',
          quality_standards: rfq.quality_standards || ''
        });
        
        // Debug: Log attachment structure
        if (existingAttachments && existingAttachments.length > 0) {
          console.log('RFQ Attachments:', existingAttachments);
          existingAttachments.forEach((attachment, index) => {
            console.log(`Attachment ${index}:`, attachment);
            console.log(`Generated URL:`, getAttachmentUrl(attachment));
          });
        }
      } else {
        setError(response.message || 'Failed to load RFQ data');
      }
    } catch (error) {
      console.error('Error fetching RFQ:', error);
      setError(error.message || 'Failed to load RFQ data');
    } finally {
      setInitialLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    console.log(`Input changed: ${name} = "${value}"`);
    
    setFormData(prev => {
      const newData = {
        ...prev,
        [name]: value
      };
      console.log('Updated formData:', newData);
      return newData;
    });
    
    // Clear field error when user starts typing
    if (fieldErrors[name]) {
      setFieldErrors(prev => ({
        ...prev,
        [name]: null
      }));
    }
    
    // Clear success message and errors when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
    if (error) {
      setError(null);
    }
  };

  const handleSpecificationChange = (index, field, value) => {
    const newSpecs = [...formData.specifications];
    newSpecs[index][field] = value;
    setFormData(prev => ({
      ...prev,
      specifications: newSpecs
    }));
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const addSpecification = () => {
    setFormData(prev => ({
      ...prev,
      specifications: [...prev.specifications, { key: '', value: '' }]
    }));
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const removeSpecification = (index) => {
    if (formData.specifications.length > 1) {
      const newSpecs = formData.specifications.filter((_, i) => i !== index);
      setFormData(prev => ({
        ...prev,
        specifications: newSpecs
      }));
      
      // Clear success message when user starts editing
      if (successMessage) {
        setSuccessMessage(null);
      }
    }
  };

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    
    if (files.length === 0) return;
    
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
    
    const validFiles = files.filter(file => {
      const fileExtension = file.name.split('.').pop().toLowerCase();
      const isAllowedType = allowedTypes.includes(file.type) || allowedExtensions.includes(fileExtension);
      
      if (!isAllowedType) {
        alert(`File "${file.name}" is not allowed. Only PDF, DOC, DOCX, Images, and Videos are allowed.`);
        return false;
      }
      
      const maxSize = 50 * 1024 * 1024; // 50MB
      if (file.size > maxSize) {
        alert(`File "${file.name}" is too large. Maximum file size is 50MB.`);
        return false;
      }
      
      return true;
    });
    
    if (validFiles.length > 0) {
      const filesWithPreviews = validFiles.map(file => {
        if (isImageFile(file) || isVideoFile(file)) {
          file.preview = URL.createObjectURL(file);
        }
        return file;
      });
      
      setFormData(prev => ({
        ...prev,
        attachments: [...prev.attachments, ...filesWithPreviews]
      }));
      
      // Clear success message when user starts editing
      if (successMessage) {
        setSuccessMessage(null);
      }
    }
    
    e.target.value = '';
  };

  const removeAttachment = (index) => {
    const fileToRemove = formData.attachments[index];
    
    if (fileToRemove && fileToRemove.preview) {
      URL.revokeObjectURL(fileToRemove.preview);
    }
    
    const newAttachments = formData.attachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      attachments: newAttachments
    }));
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const removeExistingAttachment = (index) => {
    const newExistingAttachments = formData.existingAttachments.filter((_, i) => i !== index);
    setFormData(prev => ({
      ...prev,
      existingAttachments: newExistingAttachments
    }));
    
    // Clear success message when user starts editing
    if (successMessage) {
      setSuccessMessage(null);
    }
  };

  const isImageFile = (file) => {
    const imageTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    const fileName = file.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageTypes.includes(file.type) || imageExtensions.includes(extension);
  };

  const isVideoFile = (file) => {
    const videoTypes = ['video/mp4', 'video/mov', 'video/avi', 'video/wmv', 'video/mkv', 'video/webm', 'video/quicktime'];
    const fileName = file.name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    return videoTypes.includes(file.type) || videoExtensions.includes(extension);
  };

  // Helper functions for existing attachments
  const isExistingImageFile = (attachment) => {
    const fileName = attachment.original_name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const imageExtensions = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    return imageExtensions.includes(extension);
  };

  const isExistingVideoFile = (attachment) => {
    const fileName = attachment.original_name || '';
    const extension = fileName.split('.').pop()?.toLowerCase();
    const videoExtensions = ['mp4', 'mov', 'avi', 'wmv', 'mkv', 'webm'];
    return videoExtensions.includes(extension);
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
    const name = typeof filename === 'string' ? filename : filename?.name || '';
    if (!name) return '📎';
    
    const ext = name.split('.').pop().toLowerCase();
    const imageExts = ['jpg', 'jpeg', 'png', 'gif', 'webp'];
    const videoExts = ['mp4', 'mov', 'avi', 'wmv', 'mkv'];
    const docExts = ['pdf', 'doc', 'docx'];
    
    if (imageExts.includes(ext)) return '🖼️';
    if (videoExts.includes(ext)) return '🎥';
    if (docExts.includes(ext)) return '📄';
    return '📎';
  };

  const getFieldError = (fieldName) => {
    return fieldErrors[fieldName] ? fieldErrors[fieldName][0] : null;
  };

  const getFieldClasses = (fieldName) => {
    const baseClasses = 'block w-full px-3 py-2 border rounded-md text-sm placeholder-secondary-400 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500';
    const errorClasses = 'border-red-300 text-red-900 placeholder-red-300 focus:ring-red-500 focus:border-red-500';
    const normalClasses = 'border-secondary-300 text-secondary-900';
    
    return fieldErrors[fieldName] ? `${baseClasses} ${errorClasses}` : `${baseClasses} ${normalClasses}`;
  };

  const validateForm = () => {
    const errors = [];
    
    if (!formData.title) errors.push('Title is required');
    if (!formData.description) errors.push('Description is required');
    if (!formData.category) errors.push('Category is required');
    if (!formData.quantity || formData.quantity <= 0) errors.push('Valid quantity is required');
    if (!formData.budget_min || formData.budget_min <= 0) errors.push('Valid minimum budget is required');
    if (!formData.budget_max || formData.budget_max <= 0) errors.push('Valid maximum budget is required');
    if (formData.budget_min && formData.budget_max && parseFloat(formData.budget_min) > parseFloat(formData.budget_max)) {
      errors.push('Minimum budget cannot be greater than maximum budget');
    }
    if (!formData.delivery_location) errors.push('Delivery location is required');
    if (!formData.delivery_date) errors.push('Delivery date is required');
    
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
    setSuccessMessage(null);

    try {
      setFieldErrors({});

      const submitData = {
        ...formData,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        status: 'published',
        // Include existing attachments that weren't removed
        existing_attachments: formData.existingAttachments
      };

      // Only include new file uploads for API call
      const { attachments, existingAttachments, ...rfqData } = submitData;
      
      console.log('Submit data for publish:', rfqData);
      console.log('Certifications being sent:', rfqData.certifications_required);
      console.log('Quality standards being sent:', rfqData.quality_standards);
      console.log('Supplier location preference being sent:', rfqData.supplier_location_preference);
      
      // Only send new file uploads to the API
      const newFileUploads = formData.attachments.filter(file => file instanceof File);

      const response = await apiService.updateBuyerRFQ(id, rfqData, newFileUploads);
      
      if (response.success) {
        router.push(`/buyer/rfqs/${id}`);
      } else {
        setError(response.message || 'Failed to update RFQ. Please try again.');
        if (response.field_errors) {
          setFieldErrors(response.field_errors);
        }
      }
    } catch (error) {
      console.error('Error updating RFQ:', error);
      
      if (error.field_errors) {
        setFieldErrors(error.field_errors);
      }
      
      if (error.status === 422) {
        setError('Please check the form for errors and try again.');
      } else if (error.status === 401) {
        setError('Your session has expired. Please log in again.');
      } else if (error.status === 403) {
        setError('Only draft RFQs can be updated.');
      } else {
        setError(error.message || 'Failed to update RFQ. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSaveDraft = async () => {
    setLoading(true);
    setError(null);
    setSuccessMessage(null);
    setFieldErrors({});

    try {
      console.log('=== SAVE DRAFT DEBUG START ===');
      console.log('Current formData state:', formData);
      console.log('Form title value:', formData.title);
      console.log('Form description value:', formData.description);
      console.log('Existing attachments:', formData.existingAttachments);
      console.log('New attachments:', formData.attachments);

      const submitData = {
        ...formData,
        specifications: formData.specifications.filter(spec => spec.key && spec.value),
        status: 'draft',
        existing_attachments: formData.existingAttachments
      };

      console.log('Submit data after processing:', submitData);

      // Only include new file uploads for API call
      const { attachments, existingAttachments, ...rfqData } = submitData;
      
      console.log('Final rfqData being sent to API:', rfqData);
      console.log('Title in rfqData:', rfqData.title);
      console.log('Description in rfqData:', rfqData.description);
      console.log('Existing attachments being sent:', rfqData.existing_attachments);
      console.log('Certifications being sent:', rfqData.certifications_required);
      console.log('Quality standards being sent:', rfqData.quality_standards);
      console.log('Sample requirements being sent:', rfqData.sample_requirements);
      
      // Only send new file uploads to the API
      const newFileUploads = formData.attachments.filter(file => file instanceof File);
      console.log('New file uploads:', newFileUploads);
      console.log('=== SAVE DRAFT DEBUG END ===');

      const response = await apiService.updateBuyerRFQ(id, rfqData, newFileUploads);
      
      if (response.success) {
        // Go back to the RFQ details page
        router.push(`/buyer/rfqs/${id}`);
      } else {
        setError(response.message || 'Failed to save changes. Please try again.');
        if (response.field_errors) {
          setFieldErrors(response.field_errors);
        }
      }
    } catch (error) {
      console.error('Error saving draft:', error);
      setError(error.message || 'Failed to save changes. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Show loading spinner while fetching data
  if (initialLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <Loader className="w-8 h-8 animate-spin mx-auto text-primary-600" />
          <p className="mt-2 text-secondary-600">Loading RFQ...</p>
        </div>
      </div>
    );
  }

  if (error && !formData.title) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <p className="text-red-600 mb-4">{error}</p>
          <Button onClick={() => router.push('/buyer/rfqs')}>
            Back to RFQs
          </Button>
        </div>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Edit RFQ - Buyer Portal</title>
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
            <h1 className="text-2xl font-bold text-secondary-900">Edit RFQ</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Update your request for quotes
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
                    placeholder="Detailed description of your requirements..."
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
                    onChange={handleInputChange}
                    className={getFieldClasses('category')}
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map((category) => (
                      <option key={category} value={category}>
                        {category}
                      </option>
                    ))}
                  </select>
                  {getFieldError('category') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('category')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Quantity *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="quantity"
                      value={formData.quantity}
                      onChange={handleInputChange}
                      placeholder="1000"
                      min="1"
                      className={`${getFieldClasses('quantity')} flex-grow`}
                      required
                    />
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleInputChange}
                      className={`${getFieldClasses('unit')} w-32`}
                    >
                      {units.map((unit) => (
                        <option key={unit} value={unit}>
                          {unit}
                        </option>
                      ))}
                    </select>
                  </div>
                  {getFieldError('quantity') && (
                    <p className="mt-1 text-sm text-red-600">{getFieldError('quantity')}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Budget Range ($) *
                  </label>
                  <div className="flex space-x-2">
                    <input
                      type="number"
                      name="budget_min"
                      value={formData.budget_min}
                      onChange={handleInputChange}
                      placeholder="Min"
                      min="0"
                      step="0.01"
                      className={getFieldClasses('budget_min')}
                      required
                    />
                    <span className="flex items-center text-secondary-500">to</span>
                    <input
                      type="number"
                      name="budget_max"
                      value={formData.budget_max}
                      onChange={handleInputChange}
                      placeholder="Max"
                      min="0"
                      step="0.01"
                      className={getFieldClasses('budget_max')}
                      required
                    />
                  </div>
                  {(getFieldError('budget_min') || getFieldError('budget_max')) && (
                    <p className="mt-1 text-sm text-red-600">
                      {getFieldError('budget_min') || getFieldError('budget_max')}
                    </p>
                  )}
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
                    placeholder="City, State, Country"
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
                </div>

                <div>
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Quote Validity (Days)
                  </label>
                  <input
                    type="number"
                    name="validity_days"
                    value={formData.validity_days}
                    onChange={handleInputChange}
                    min="1"
                    max="365"
                    className={getFieldClasses('validity_days')}
                  />
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
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Technical Specifications</h2>
              
              <div className="space-y-4">
                {formData.specifications.map((spec, index) => (
                  <div key={index} className="flex space-x-4">
                    <input
                      type="text"
                      value={spec.key}
                      onChange={(e) => handleSpecificationChange(index, 'key', e.target.value)}
                      placeholder="Specification name (e.g., Power Consumption)"
                      className="flex-1 block w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                    />
                    <input
                      type="text"
                      value={spec.value}
                      onChange={(e) => handleSpecificationChange(index, 'value', e.target.value)}
                      placeholder="Value (e.g., 10W)"
                      className="flex-1 block w-full px-3 py-2 border border-secondary-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removeSpecification(index)}
                      className="p-2 text-red-500 hover:text-red-700"
                      disabled={formData.specifications.length === 1}
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addSpecification}
                  className="flex items-center space-x-2 text-sm text-primary-600 hover:text-primary-700"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Specification</span>
                </button>
              </div>
            </div>
          </Card>

          {/* Additional Details */}
          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Additional Details</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Quality Standards
                  </label>
                  <textarea
                    name="quality_standards"
                    value={formData.quality_standards}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Quality standards and requirements..."
                    className={getFieldClasses('quality_standards')}
                  />
                </div>
              </div>
            </div>
          </Card>

          {/* Attachments */}
          <Card>
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-medium text-secondary-900">Attachments</h2>
                {(formData.existingAttachments.length + formData.attachments.length) > 0 && (
                  <span className="bg-primary-100 text-primary-700 px-2 py-1 rounded-full text-sm font-medium">
                    {formData.existingAttachments.length + formData.attachments.length} file{(formData.existingAttachments.length + formData.attachments.length) > 1 ? 's' : ''} total
                  </span>
                )}
              </div>
              
              <div className="space-y-4">
                {/* File Upload Area */}
                <div className="border-2 border-dashed border-secondary-300 rounded-lg p-6 text-center hover:border-secondary-400 transition-colors">
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
                      Add Files
                    </span>
                  </label>
                  <p className="text-xs text-secondary-400 mt-2">
                    Maximum file size: 50MB per file
                  </p>
                </div>

                {/* Existing Attachments */}
                {formData.existingAttachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-secondary-700">Current Attachments</h4>
                    {formData.existingAttachments.map((attachment, index) => (
                      <div key={`existing-${index}`} className="flex items-center justify-between p-3 bg-blue-50 rounded-lg border border-blue-200">
                        <div 
                          className={`flex items-center space-x-3 flex-1 ${(isExistingImageFile(attachment) || isExistingVideoFile(attachment)) ? 'cursor-pointer hover:bg-blue-100 rounded-lg p-2 -m-2 transition-colors' : ''}`}
                          onClick={() => {
                            if (isExistingImageFile(attachment)) {
                              setPreviewModal({ isOpen: true, file: { ...attachment, url: getAttachmentUrl(attachment) }, type: 'image' });
                            } else if (isExistingVideoFile(attachment)) {
                              setPreviewModal({ isOpen: true, file: { ...attachment, url: getAttachmentUrl(attachment) }, type: 'video' });
                            }
                          }}
                        >
                          {isExistingImageFile(attachment) ? (
                            <div className="relative w-12 h-12">
                              <img 
                                src={getAttachmentUrl(attachment)} 
                                alt={attachment.original_name}
                                className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                onLoad={() => console.log('Image loaded successfully:', attachment.original_name)}
                                onError={(e) => {
                                  console.error('Image failed to load:', attachment.original_name, 'URL:', getAttachmentUrl(attachment));
                                  // Fallback to icon if image fails to load
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="w-12 h-12 hidden items-center justify-center">
                                <span className="text-2xl">{getFileIcon(attachment.original_name)}</span>
                              </div>
                            </div>
                          ) : isExistingVideoFile(attachment) ? (
                            <div className="relative w-12 h-12">
                              <video 
                                src={getAttachmentUrl(attachment)}
                                className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                muted
                                preload="metadata"
                                onLoadedData={() => console.log('Video loaded successfully:', attachment.original_name)}
                                onError={(e) => {
                                  console.error('Video failed to load:', attachment.original_name, 'URL:', getAttachmentUrl(attachment));
                                  // Fallback to icon if video fails to load
                                  e.target.style.display = 'none';
                                  e.target.nextSibling.style.display = 'flex';
                                }}
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                                <div className="w-4 h-4 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[3px] border-l-black border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-0.5"></div>
                                </div>
                              </div>
                              <div className="w-12 h-12 hidden items-center justify-center">
                                <span className="text-2xl">{getFileIcon(attachment.original_name)}</span>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <span className="text-2xl">{getFileIcon(attachment.original_name)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-secondary-700">
                              {attachment.original_name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {formatFileSize(attachment.size)} • Existing file
                              {isExistingImageFile(attachment) && <span className="ml-2 text-blue-600">• Click to preview</span>}
                              {isExistingVideoFile(attachment) && <span className="ml-2 text-blue-600">• Click to preview</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeExistingAttachment(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Remove this attachment"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}

                {/* New Attachments */}
                {formData.attachments.length > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-sm font-medium text-secondary-700">New Files to Upload</h4>
                    {formData.attachments.map((file, index) => (
                      <div key={`new-${index}`} className="flex items-center justify-between p-3 bg-green-50 rounded-lg border border-green-200">
                        <div 
                          className={`flex items-center space-x-3 flex-1 ${(isImageFile(file) || isVideoFile(file)) ? 'cursor-pointer hover:bg-green-100 rounded-lg p-2 -m-2 transition-colors' : ''}`}
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
                              />
                            </div>
                          ) : isVideoFile(file) ? (
                            <div className="relative w-12 h-12">
                              <video 
                                src={file.preview || URL.createObjectURL(file)}
                                className="w-full h-full object-cover rounded border hover:opacity-80 transition-opacity"
                                muted
                                preload="metadata"
                              />
                              <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-20 rounded">
                                <div className="w-4 h-4 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                                  <div className="w-0 h-0 border-l-[3px] border-l-black border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-0.5"></div>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="w-12 h-12 flex items-center justify-center">
                              <span className="text-2xl">{getFileIcon(file.name)}</span>
                            </div>
                          )}
                          <div>
                            <p className="text-sm font-medium text-secondary-700">
                              {file.name}
                            </p>
                            <p className="text-xs text-secondary-500">
                              {formatFileSize(file.size)} • New upload
                              {isImageFile(file) && <span className="ml-2 text-green-600">• Click to preview</span>}
                              {isVideoFile(file) && <span className="ml-2 text-blue-600">• Click to preview</span>}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removeAttachment(index)}
                          className="p-1 text-red-600 hover:text-red-800 hover:bg-red-100 rounded transition-colors"
                          title="Remove this file"
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

          <Card>
            <div className="p-6">
              <h2 className="text-lg font-medium text-secondary-900 mb-4">Additional Requirements</h2>
              
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Sample Requirements
                  </label>
                  <textarea
                    name="sample_requirements"
                    value={formData.sample_requirements}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Sample requirements and testing procedures..."
                    className={getFieldClasses('sample_requirements')}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Terms & Conditions
                  </label>
                  <textarea
                    name="terms_conditions"
                    value={formData.terms_conditions}
                    onChange={handleInputChange}
                    rows={4}
                    placeholder="Any specific terms and conditions..."
                    className={getFieldClasses('terms_conditions')}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Payment Terms
                  </label>
                  <textarea
                    name="payment_terms"
                    value={formData.payment_terms}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Payment terms and conditions..."
                    className={getFieldClasses('payment_terms')}
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
                    className={getFieldClasses('supplier_location_preference')}
                  >
                    {supplierLocationOptions.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Quality Standards
                  </label>
                  <textarea
                    name="quality_standards"
                    value={formData.quality_standards}
                    onChange={handleInputChange}
                    rows={3}
                    placeholder="Quality standards and compliance requirements..."
                    className={getFieldClasses('quality_standards')}
                  />
                </div>

                <div className="lg:col-span-2">
                  <label className="block text-sm font-medium text-secondary-700 mb-2">
                    Required Certifications
                  </label>
                  <div className="space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {availableCertifications.map((cert) => (
                        <button
                          key={cert}
                          type="button"
                          onClick={() => {
                            const currentCerts = formData.certifications_required || [];
                            const isSelected = currentCerts.includes(cert);
                            const newCerts = isSelected
                              ? currentCerts.filter(c => c !== cert)
                              : [...currentCerts, cert];
                            setFormData(prev => ({
                              ...prev,
                              certifications_required: newCerts
                            }));
                          }}
                          className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                            (formData.certifications_required || []).includes(cert)
                              ? 'bg-primary-600 text-white border-primary-600'
                              : 'bg-white text-secondary-700 border-secondary-300 hover:border-primary-600'
                          }`}
                        >
                          {cert}
                        </button>
                      ))}
                    </div>
                    {formData.certifications_required && formData.certifications_required.length > 0 && (
                      <p className="text-sm text-secondary-600">
                        Selected: {formData.certifications_required.join(', ')}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </Card>

          {/* Success Message Display */}
          {successMessage && (
            <div className="bg-green-50 border border-green-200 rounded-md p-4">
              <p className="text-sm text-green-800">{successMessage}</p>
            </div>
          )}

          {/* Error Display */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-md p-4">
              <p className="text-sm text-red-800">{error}</p>
            </div>
          )}

          {/* Form Actions */}
          <div className="flex flex-col sm:flex-row gap-4 justify-end">
            <Button
              type="button"
              variant="outline"
              onClick={handleSaveDraft}
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Saving...
                </>
              ) : (
                'Save Draft'
              )}
            </Button>
            <Button
              type="submit"
              disabled={loading}
            >
              {loading ? (
                <>
                  <Loader className="w-4 h-4 mr-2 animate-spin" />
                  Updating...
                </>
              ) : (
                'Update & Publish RFQ'
              )}
            </Button>
          </div>
        </form>
      </div>

      {/* Preview Modal */}
      {previewModal.isOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-4xl max-h-full overflow-auto">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="text-lg font-medium">
                {previewModal.file?.name || previewModal.file?.original_name || 'Preview'}
              </h3>
              <button
                onClick={() => setPreviewModal({ isOpen: false, file: null, type: null })}
                className="text-secondary-400 hover:text-secondary-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="p-4">
              {previewModal.type === 'image' && (
                <img
                  src={previewModal.file?.preview || previewModal.file?.url || URL.createObjectURL(previewModal.file)}
                  alt="Preview"
                  className="max-w-full max-h-96 object-contain mx-auto"
                />
              )}
              {previewModal.type === 'video' && (
                <video
                  src={previewModal.file?.preview || previewModal.file?.url || URL.createObjectURL(previewModal.file)}
                  controls
                  className="max-w-full max-h-96 mx-auto"
                />
              )}
            </div>
          </div>
        </div>
      )}
    </>
  );
}
