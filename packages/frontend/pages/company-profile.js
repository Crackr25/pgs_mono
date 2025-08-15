import { useState, useEffect } from 'react';
import Head from 'next/head';
import { Building, Edit, Save, X, Upload, Camera } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import { FormField } from '../components/common/Form';
import FileUpload from '../components/common/FileUpload';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../lib/api';

export default function CompanyProfile() {
  const [company, setCompany] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState(null);
  const [formData, setFormData] = useState({});
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

        {/* Company Images */}
        <Card>
          <div className="p-6">
            <h3 className="text-lg font-medium text-secondary-900 mb-6">
              Company Images & Documents
            </h3>
            
            {isEditing ? (
              <div className="space-y-6">
                <div>
                  <h4 className="text-md font-medium text-secondary-900 mb-4">
                    Company Logo & Profile Images
                  </h4>
                  <FileUpload
                    label="Company Logo"
                    accept=".jpg,.jpeg,.png"
                    maxSize={5}
                    description="Upload your company logo (recommended: square format, max 5MB)"
                  />
                </div>

                <div>
                  <h4 className="text-md font-medium text-secondary-900 mb-4">
                    Factory & Facility Photos
                  </h4>
                  <FileUpload
                    label="Factory Overview Photos"
                    accept=".jpg,.jpeg,.png"
                    multiple
                    maxSize={10}
                    description="Upload photos showing your manufacturing facilities"
                  />
                </div>

                <div>
                  <h4 className="text-md font-medium text-secondary-900 mb-4">
                    Certifications & Documents
                  </h4>
                  <FileUpload
                    label="Business Registration Documents"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    maxSize={5}
                    description="Upload business registration, permits, and certifications"
                  />
                </div>

                <div>
                  <h4 className="text-md font-medium text-secondary-900 mb-4">
                    Product Certifications
                  </h4>
                  <FileUpload
                    label="Quality Certifications (ISO, CE, etc.)"
                    accept=".pdf,.jpg,.jpeg,.png"
                    multiple
                    maxSize={5}
                    description="Upload product quality and safety certifications"
                  />
                </div>

                <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="flex">
                    <div className="flex-shrink-0">
                      <Camera className="h-5 w-5 text-blue-400" />
                    </div>
                    <div className="ml-3">
                      <h3 className="text-sm font-medium text-blue-800">
                        Image Guidelines
                      </h3>
                      <div className="mt-2 text-sm text-blue-700">
                        <ul className="list-disc list-inside space-y-1">
                          <li>Use high-quality images with good lighting</li>
                          <li>Show your production capabilities and equipment</li>
                          <li>Include quality control processes</li>
                          <li>Display certifications prominently</li>
                          <li>Keep file sizes under the specified limits</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="text-center py-8">
                  <Upload className="mx-auto h-12 w-12 text-secondary-400" />
                  <h3 className="mt-2 text-sm font-medium text-secondary-900">
                    Company Images & Documents
                  </h3>
                  <p className="mt-1 text-sm text-secondary-500">
                    Click "Edit Profile" to upload and manage your company images, factory photos, and certification documents.
                  </p>
                </div>
                
                {/* Display existing images if any */}
                {company.images && company.images.length > 0 && (
                  <div>
                    <h4 className="text-md font-medium text-secondary-900 mb-4">
                      Current Images
                    </h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      {company.images.map((image, index) => (
                        <div key={index} className="relative">
                          <img
                            src={image}
                            alt={`Company image ${index + 1}`}
                            className="w-full h-24 object-cover rounded-lg border border-secondary-200"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}
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
