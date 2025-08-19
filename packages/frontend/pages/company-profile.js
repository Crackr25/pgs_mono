import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Building, Edit, Save, X, Upload, Camera, FileText, Shield, Factory } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FormField } from '../components/common/Form';
import FileUpload from '../components/common/FileUpload';
import DocumentDisplay from '../components/common/DocumentDisplay';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const { user } = useAuth();

  useEffect(() => {
    fetchCompanyProfile();
  }, []);

  const fetchCompanyProfile = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const companies = await apiService.getCompanies();
      const userCompany = companies.data?.find(comp => comp.user_id === user.id);
      
      if (userCompany) {
        setCompany(userCompany);
        setFormData({
          name: userCompany.name || '',
          registration: userCompany.registration || '',
          peza_id: userCompany.peza_id || '',
          location: userCompany.location || '',
          year_established: userCompany.year_established || '',
          factory_size: userCompany.factory_size || '',
          employees: userCompany.employees || '',
          description: userCompany.description || '',
          website: userCompany.website || '',
          phone: userCompany.phone || '',
          email: userCompany.email || ''
        });
      }
    } catch (error) {
      console.error('Error fetching company profile:', error);
      setError('Failed to load company profile');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async () => {
    if (!company) return;

    setIsSaving(true);
    setError(null);

    try {
      const updateData = {
        ...formData,
        year_established: formData.year_established ? parseInt(formData.year_established) : null,
        employees: formData.employees ? parseInt(formData.employees) : null
      };

      const response = await apiService.updateCompany(company.id, updateData);
      setCompany(response);
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating company profile:', error);
      setError(error.message || 'Failed to update company profile');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setIsEditing(false);
    setError(null);
    // Reset form data to original company data
    if (company) {
      setFormData({
        name: company.name || '',
        registration: company.registration || '',
        peza_id: company.peza_id || '',
        location: company.location || '',
        year_established: company.year_established || '',
        factory_size: company.factory_size || '',
        employees: company.employees || '',
        description: company.description || '',
        website: company.website || '',
        phone: company.phone || '',
        email: company.email || ''
      });
    }
  };

  // Helper functions to organize documents
  const getDocumentsByType = (type) => {
    if (!company) return [];
    
    switch (type) {
      case 'business':
        const businessDocs = [];
        if (company.dti_sec_certificate) businessDocs.push(company.dti_sec_certificate);
        if (company.peza_documents) {
          const pezaDocs = Array.isArray(company.peza_documents) 
            ? company.peza_documents 
            : JSON.parse(company.peza_documents || '[]');
          businessDocs.push(...pezaDocs);
        }
        if (company.business_permits) {
          const permits = Array.isArray(company.business_permits) 
            ? company.business_permits 
            : JSON.parse(company.business_permits || '[]');
          businessDocs.push(...permits);
        }
        return businessDocs;
        
      case 'certifications':
        const certDocs = [];
        if (company.product_certifications) {
          const certs = Array.isArray(company.product_certifications) 
            ? company.product_certifications 
            : JSON.parse(company.product_certifications || '[]');
          certDocs.push(...certs);
        }
        return certDocs;
        
      case 'kyc':
        const kycDocs = [];
        if (company.owner_id_front) kycDocs.push(company.owner_id_front);
        if (company.owner_id_back) kycDocs.push(company.owner_id_back);
        if (company.proof_of_address) kycDocs.push(company.proof_of_address);
        if (company.business_registration_cert) kycDocs.push(company.business_registration_cert);
        return kycDocs;
        
      case 'factory':
        const factoryDocs = [];
        if (company.factory_overview_video) factoryDocs.push(company.factory_overview_video);
        if (company.production_line_photos) {
          const photos = Array.isArray(company.production_line_photos) 
            ? company.production_line_photos 
            : JSON.parse(company.production_line_photos || '[]');
          factoryDocs.push(...photos);
        }
        if (company.quality_control_photos) {
          const photos = Array.isArray(company.quality_control_photos) 
            ? company.quality_control_photos 
            : JSON.parse(company.quality_control_photos || '[]');
          factoryDocs.push(...photos);
        }
        if (company.warehouse_photos) {
          const photos = Array.isArray(company.warehouse_photos) 
            ? company.warehouse_photos 
            : JSON.parse(company.warehouse_photos || '[]');
          factoryDocs.push(...photos);
        }
        if (company.certifications_photos) {
          const photos = Array.isArray(company.certifications_photos) 
            ? company.certifications_photos 
            : JSON.parse(company.certifications_photos || '[]');
          factoryDocs.push(...photos);
        }
        return factoryDocs;
        
      default:
        return [];
    }
  };

  // Handle file uploads for document updates
  const handleFileUpload = async (files, uploadType) => {
    if (!company) return;

    setError(null);
    setIsSaving(true);

    try {
      // Reset progress and errors for these files
      const newProgress = {};
      const newErrors = {};
      files.forEach(file => {
        newProgress[file.name] = 0;
        newErrors[file.name] = null;
      });
      setUploadProgress(prev => ({ ...prev, ...newProgress }));
      setUploadErrors(prev => ({ ...prev, ...newErrors }));

      // Progress callback
      const onProgress = (progress) => {
        files.forEach(file => {
          setUploadProgress(prev => ({
            ...prev,
            [file.name]: Math.round(progress)
          }));
        });
      };

      let response;
      switch (uploadType) {
        case 'documents':
          response = await apiService.uploadCompanyDocuments(company.id, files, onProgress);
          break;
        case 'kyc':
          response = await apiService.uploadCompanyKyc(company.id, files, onProgress);
          break;
        case 'factory-tour':
          response = await apiService.uploadFactoryTour(company.id, files, onProgress);
          break;
        default:
          throw new Error('Invalid upload type');
      }

      console.log('Upload successful:', response);
      
      // Mark files as completed
      files.forEach(file => {
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 100
        }));
      });

      // Update company data with uploaded files instead of full refresh
      if (response && response.data) {
        setCompany(prev => ({
          ...prev,
          ...response.data
        }));
      }

    } catch (error) {
      console.error('Upload error:', error);
      files.forEach(file => {
        setUploadErrors(prev => ({
          ...prev,
          [file.name]: error.message || 'Upload failed'
        }));
        setUploadProgress(prev => ({
          ...prev,
          [file.name]: 0
        }));
      });
      setError(error.message || 'Upload failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleDocumentDelete = async (filePath, index) => {
    // TODO: Implement document deletion API call
    console.log('Delete document:', filePath, index);
    // For now, just show a confirmation
    if (confirm('Are you sure you want to delete this document?')) {
      // Implement deletion logic here
      alert('Document deletion will be implemented');
    }
  };

  const handleDocumentEdit = async (filePath, index) => {
    // TODO: Implement document replacement
    console.log('Edit document:', filePath, index);
    alert('Document replacement will be implemented');
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
          <p className="mt-2 text-sm text-secondary-600">Loading company profile...</p>
        </div>
      </div>
    );
  }

  if (!company) {
    return (
      <div className="text-center py-12">
        <Building className="mx-auto h-12 w-12 text-secondary-400" />
        <h3 className="mt-2 text-sm font-medium text-secondary-900">No company profile found</h3>
        <p className="mt-1 text-sm text-secondary-500">
          Please complete your onboarding to create a company profile.
        </p>
      </div>
    );
  }

  return (
    <>
      <Head>
        <title>Company Profile - PSG</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-secondary-900">Company Profile</h1>
            <p className="mt-1 text-sm text-secondary-600">
              Manage your company information and settings
            </p>
          </div>
          
          {!isEditing ? (
            <Button onClick={() => setIsEditing(true)} className="flex items-center">
              <Edit className="w-4 h-4 mr-2" />
              Edit Profile
            </Button>
          ) : (
            <div className="flex space-x-2">
              <Button 
                onClick={handleSave} 
                disabled={isSaving}
                className="flex items-center"
              >
                <Save className="w-4 h-4 mr-2" />
                {isSaving ? 'Saving...' : 'Save Changes'}
              </Button>
              <Button 
                variant="outline" 
                onClick={handleCancel}
                className="flex items-center"
              >
                <X className="w-4 h-4 mr-2" />
                Cancel
              </Button>
            </div>
          )}
        </div>

        {/* Error Message */}
        {error && (
          <div className="rounded-md bg-red-50 p-4">
            <div className="text-sm text-red-700">{error}</div>
          </div>
        )}

        {/* Company Information */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-6">
              Company Information
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <FormField
                label="Company Name"
                name="name"
                value={isEditing ? formData.name : company.name}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
              
              <FormField
                label="Registration Number"
                name="registration"
                value={isEditing ? formData.registration : company.registration}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
              
              <FormField
                label="PEZA ID"
                name="peza_id"
                value={isEditing ? formData.peza_id : company.peza_id}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              
              <FormField
                label="Location"
                name="location"
                value={isEditing ? formData.location : company.location}
                onChange={handleInputChange}
                disabled={!isEditing}
                required
              />
              
              <FormField
                label="Year Established"
                name="year_established"
                type="number"
                value={isEditing ? formData.year_established : company.year_established}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1900"
                max={new Date().getFullYear()}
              />
              
              <FormField
                label="Factory Size"
                name="factory_size"
                value={isEditing ? formData.factory_size : company.factory_size}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              
              <FormField
                label="Number of Employees"
                name="employees"
                type="number"
                value={isEditing ? formData.employees : company.employees}
                onChange={handleInputChange}
                disabled={!isEditing}
                min="1"
              />
              
              <FormField
                label="Website"
                name="website"
                type="url"
                value={isEditing ? formData.website : company.website}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              
              <FormField
                label="Phone"
                name="phone"
                value={isEditing ? formData.phone : company.phone}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
              
              <FormField
                label="Email"
                name="email"
                type="email"
                value={isEditing ? formData.email : company.email}
                onChange={handleInputChange}
                disabled={!isEditing}
              />
            </div>

            <div className="mt-6">
              <FormField
                label="Company Description"
                name="description"
                type="textarea"
                value={isEditing ? formData.description : company.description}
                onChange={handleInputChange}
                disabled={!isEditing}
                rows="4"
              />
            </div>
          </div>
        </Card>

        {/* Company Documents & Media */}
        <Card>
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-medium text-secondary-900">
                Company Documents & Media
              </h3>
              <div className="text-sm text-secondary-600">
                {company.onboarding_step === 'completed' ? (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                    Onboarding Complete
                  </span>
                ) : (
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                    Onboarding In Progress
                  </span>
                )}
              </div>
            </div>

            <div className="space-y-8">
              {/* Business Documents Section */}
              <div>
                <div className="flex items-center mb-4">
                  <FileText className="h-5 w-5 text-blue-600 mr-2" />
                  <h4 className="text-md font-medium text-secondary-900">Business Documents</h4>
                </div>
                
                <DocumentDisplay
                  documents={getDocumentsByType('business')}
                  title="Registration & Permits"
                  onEdit={handleDocumentEdit}
                  onDelete={handleDocumentDelete}
                  isEditing={isEditing}
                  className="mb-4"
                />

                {isEditing && (
                  <div className="mt-4">
                    <FileUpload
                      key={`business-docs-${isEditing}`}
                      label="Add Business Documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      maxSize={5}
                      onUpload={(files) => handleFileUpload(files, 'documents')}
                      uploadProgress={uploadProgress}
                      uploadErrors={uploadErrors}
                    />
                  </div>
                )}
              </div>

              {/* Product Certifications Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-green-600 mr-2" />
                  <h4 className="text-md font-medium text-secondary-900">Product Certifications</h4>
                </div>
                
                <DocumentDisplay
                  documents={getDocumentsByType('certifications')}
                  title="Quality & Safety Certifications"
                  onEdit={handleDocumentEdit}
                  onDelete={handleDocumentDelete}
                  isEditing={isEditing}
                  className="mb-4"
                />

                {isEditing && (
                  <div className="mt-4">
                    <FileUpload
                      key={`certifications-${isEditing}`}
                      label="Add Product Certifications"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      maxSize={5}
                      onUpload={(files) => handleFileUpload(files, 'documents')}
                      uploadProgress={uploadProgress}
                      uploadErrors={uploadErrors}
                    />
                  </div>
                )}
              </div>

              {/* KYC Documents Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Shield className="h-5 w-5 text-purple-600 mr-2" />
                  <h4 className="text-md font-medium text-secondary-900">KYC Verification</h4>
                </div>
                
                <DocumentDisplay
                  documents={getDocumentsByType('kyc')}
                  title="Identity & Address Verification"
                  onEdit={handleDocumentEdit}
                  onDelete={handleDocumentDelete}
                  isEditing={isEditing}
                  className="mb-4"
                />

                {isEditing && (
                  <div className="mt-4">
                    <FileUpload
                      key={`kyc-docs-${isEditing}`}
                      label="Update KYC Documents"
                      accept=".pdf,.jpg,.jpeg,.png"
                      multiple
                      maxSize={5}
                      onUpload={(files) => handleFileUpload(files, 'kyc')}
                      uploadProgress={uploadProgress}
                      uploadErrors={uploadErrors}
                    />
                  </div>
                )}
              </div>

              {/* Factory Tour Section */}
              <div>
                <div className="flex items-center mb-4">
                  <Factory className="h-5 w-5 text-orange-600 mr-2" />
                  <h4 className="text-md font-medium text-secondary-900">Factory Tour</h4>
                </div>
                
                <DocumentDisplay
                  documents={getDocumentsByType('factory')}
                  title="Manufacturing Facilities & Capabilities"
                  onEdit={handleDocumentEdit}
                  onDelete={handleDocumentDelete}
                  isEditing={isEditing}
                  className="mb-4"
                />

                {isEditing && (
                  <div className="mt-4">
                    <FileUpload
                      key={`factory-tour-${isEditing}`}
                      label="Add Factory Photos/Videos"
                      accept=".jpg,.jpeg,.png,.mp4,.mov,.avi"
                      multiple
                      maxSize={100}
                      onUpload={(files) => handleFileUpload(files, 'factory-tour')}
                      uploadProgress={uploadProgress}
                      uploadErrors={uploadErrors}
                    />
                  </div>
                )}
              </div>

              {/* Upload Guidelines */}
              {isEditing && (
                <div className="mt-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Camera className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Document Upload Guidelines
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use high-quality images with good lighting</li>
                          <li>Documents: PDF, JPG, PNG formats (max 5MB each)</li>
                          <li>Factory photos: JPG, PNG formats (max 10MB each)</li>
                          <li>Videos: MP4, MOV, AVI formats (max 100MB each)</li>
                          <li>Files are automatically uploaded when selected</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </Card>

        {/* Company Stats */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-6">
              Company Statistics
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="text-center">
                <div className="text-2xl font-bold text-primary-600">
                  {company.products_count || 0}
                </div>
                <div className="text-sm text-secondary-600">Products Listed</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {company.quotes_count || 0}
                </div>
                <div className="text-sm text-secondary-600">Quotes Received</div>
              </div>
              
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {company.orders_count || 0}
                </div>
                <div className="text-sm text-secondary-600">Orders Completed</div>
              </div>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
