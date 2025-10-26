import { useState } from 'react';
import { useRouter } from 'next/router';
import Head from 'next/head';
import { CheckCircle, Upload, Building, FileText, User, Camera } from 'lucide-react';
import Card from '../components/common/Card';
import Button from '../components/common/Button';
import Form, { FormField } from '../components/common/Form';
import FileUpload from '../components/common/FileUpload';
import Badge from '../components/common/Badge';
import apiService from '../lib/api';
import { useAuth } from '../contexts/AuthContext';

export default function Onboarding() {
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [companyId, setCompanyId] = useState(null);
  const [uploadProgress, setUploadProgress] = useState({});
  const [uploadErrors, setUploadErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    registration: '',
    peza_id: '',
    location: '',
    year_established: '',
    factory_size: '',
    product_lines: [],
    employees: '',
    description: '',
    website: '',
    phone: '',
    email: ''
  });

  const router = useRouter();
  const { user, checkAuthStatus } = useAuth();

  const steps = [
    { id: 1, name: 'Company Profile', icon: Building, completed: false },
    { id: 2, name: 'Document Upload', icon: FileText, completed: false },
    { id: 3, name: 'KYC Verification', icon: User, completed: false },
    { id: 4, name: 'Factory Tour', icon: Camera, completed: false }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleFileUpload = async (files, uploadType, fieldName = null) => {
    if (!companyId) {
      setError('Company must be created first');
      return;
    }

    setError(null);
    setIsLoading(true);

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
          response = await apiService.uploadCompanyDocuments(companyId, files, onProgress, fieldName);
          break;
        case 'kyc':
          response = await apiService.uploadCompanyKyc(companyId, files, onProgress, fieldName);
          break;
        case 'factory-tour':
          response = await apiService.uploadFactoryTour(companyId, files, onProgress, fieldName);
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
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Only handle step 1 form submission
    if (currentStep !== 1) {
      return;
    }
    
    setError(null);
    setIsLoading(true);

    try {
      // Step 1: Create company profile
      const companyData = {
        name: formData.name,
        registration: formData.registration,
        peza_id: formData.peza_id || null,
        location: formData.location,
        year_established: parseInt(formData.year_established),
        factory_size: formData.factory_size || null,
        product_lines: formData.product_lines,
        employees: formData.employees ? parseInt(formData.employees) : null,
        description: formData.description || null,
        website: formData.website || null,
        phone: formData.phone || null,
        email: formData.email || null
      };

      const response = await apiService.createCompany(companyData);
      console.log('Company created:', response);
      
      // Store company ID for file uploads
      setCompanyId(response.id);
      
      // Refresh auth context to load the new company data
      await checkAuthStatus();
      
      // Move to next step
      setCurrentStep(currentStep + 1);
    } catch (error) {
      console.error('Onboarding error:', error);
      
      // If company already exists (registration taken), refresh auth and redirect
      if (error.message && error.message.includes('registration has already been taken')) {
        console.log('Company already exists, refreshing auth context and redirecting...');
        await checkAuthStatus();
        // Small delay to ensure auth context is updated
        setTimeout(() => {
          router.push('/');
        }, 1000);
        return;
      }
      
      setError(error.message || 'An error occurred during onboarding');
    } finally {
      setIsLoading(false);
    }
  };

  const productLineOptions = [
    { value: 'electronics', label: 'Electronics' },
    { value: 'automotive', label: 'Automotive Parts' },
    { value: 'textiles', label: 'Textiles' },
    { value: 'machinery', label: 'Machinery' },
    { value: 'chemicals', label: 'Chemicals' },
    { value: 'food', label: 'Food & Beverages' }
  ];

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Company Profile Builder
              </h3>
              <p className="text-sm text-secondary-600">
                Please provide your company information to get started.
              </p>
            </div>

            <Form onSubmit={handleSubmit} submitText="Continue to Documents">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <FormField
                  label="Company Name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                  placeholder="Enter your company name"
                />
                
                <FormField
                  label="DTI/SEC Registration Number"
                  name="registration"
                  value={formData.registration}
                  onChange={handleInputChange}
                  required
                  placeholder="DTI-123456789"
                />
                
                <FormField
                  label="PEZA ID (if applicable)"
                  name="peza_id"
                  value={formData.peza_id}
                  onChange={handleInputChange}
                  placeholder="PEZA-2023-001"
                />
                
                <FormField
                  label="Location"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  required
                  placeholder="City, Province, Country"
                />
                
                <FormField
                  label="Year Established"
                  name="year_established"
                  type="number"
                  value={formData.year_established}
                  onChange={handleInputChange}
                  required
                  placeholder="2020"
                  min="1900"
                  max={new Date().getFullYear()}
                />
                
                <FormField
                  label="Factory Size (sq ft)"
                  name="factory_size"
                  value={formData.factory_size}
                  onChange={handleInputChange}
                  placeholder="10,000 sq ft"
                />
                
                <FormField
                  label="Number of Employees"
                  name="employees"
                  type="number"
                  value={formData.employees}
                  onChange={handleInputChange}
                  placeholder="50"
                  min="1"
                />

                <FormField
                  label="Website (optional)"
                  name="website"
                  type="url"
                  value={formData.website}
                  onChange={handleInputChange}
                  placeholder="https://www.yourcompany.com"
                />
                
                <FormField
                  label="Phone Number (optional)"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  placeholder="+63 912 345 6789"
                />
                
                <FormField
                  label="Email (optional)"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="contact@yourcompany.com"
                />
              </div>

              <div className="mt-6">
                <FormField
                  label="Company Description (optional)"
                  name="description"
                  type="textarea"
                  value={formData.description}
                  onChange={handleInputChange}
                  placeholder="Brief description of your company and manufacturing capabilities..."
                  rows="4"
                />
              </div>
            </Form>
          </Card>
        );

      case 2:
        return (
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Document Upload
              </h3>
              <p className="text-sm text-secondary-600">
                Upload your business registration and certification documents.
              </p>
            </div>

            <div className="space-y-6">
              <FileUpload
                key={`step2-dti-${currentStep}`}
                label="DTI/SEC Registration Certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'documents', 'dti_sec_certificate')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step2-peza-${currentStep}`}
                label="PEZA Registration Documents"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'documents', 'peza_documents')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step2-certs-${currentStep}`}
                label="Product Certifications (ISO, CE, etc.)"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'documents', 'product_certifications')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step2-permits-${currentStep}`}
                label="Business Permits"
                accept=".pdf,.jpg,.jpeg,.png"
                multiple
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'documents', 'business_permits')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setCurrentStep(3)} disabled={isLoading}>
                Skip to KYC
              </Button>
            </div>
          </Card>
        );

      case 3:
        return (
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                KYC Verification
              </h3>
              <p className="text-sm text-secondary-600">
                Upload identification documents for business owner verification.
              </p>
            </div>

            <div className="space-y-6">
              <FileUpload
                key={`step3-id-front-${currentStep}`}
                label="Owner's Government ID (Front)"
                accept=".jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'kyc', 'kyc_id_front')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step3-id-back-${currentStep}`}
                label="Owner's Government ID (Back)"
                accept=".jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'kyc', 'kyc_id_back')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step3-address-${currentStep}`}
                label="Proof of Address (Utility Bill, Bank Statement)"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'kyc', 'kyc_proof_address')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step3-business-cert-${currentStep}`}
                label="Business Registration Certificate"
                accept=".pdf,.jpg,.jpeg,.png"
                maxSize={5}
                onUpload={(files) => handleFileUpload(files, 'kyc', 'kyc_business_registration')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
            </div>

            <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <FileText className="h-5 w-5 text-yellow-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-yellow-800">
                    Important Notice
                  </h3>
                  <div className="mt-2 text-sm text-yellow-700">
                    <p>
                      All documents will be securely stored and used only for verification purposes. 
                      Your information is protected according to our privacy policy.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={() => setCurrentStep(4)}>
                Continue to Factory Tour
              </Button>
            </div>
          </Card>
        );

      case 4:
        return (
          <Card>
            <div className="mb-6">
              <h3 className="text-lg font-medium text-secondary-900 mb-2">
                Factory Tour Upload
              </h3>
              <p className="text-sm text-secondary-600">
                Showcase your manufacturing capabilities with photos and videos.
              </p>
            </div>

            <div className="space-y-6">
              <FileUpload
                key={`step4-video-${currentStep}`}
                label="Factory Overview Video (Max 100MB)"
                accept=".mp4,.mov,.avi"
                maxSize={100}
                onUpload={(files) => handleFileUpload(files, 'factory-tour', 'factory_overview_video')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step4-production-${currentStep}`}
                label="Production Line Photos"
                accept=".jpg,.jpeg,.png"
                multiple
                maxSize={10}
                onUpload={(files) => handleFileUpload(files, 'factory-tour', 'production_line_photos')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step4-quality-${currentStep}`}
                label="Quality Control Area Photos"
                accept=".jpg,.jpeg,.png"
                multiple
                maxSize={10}
                onUpload={(files) => handleFileUpload(files, 'factory-tour', 'quality_control_photos')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step4-warehouse-${currentStep}`}
                label="Warehouse/Storage Photos"
                accept=".jpg,.jpeg,.png"
                multiple
                maxSize={10}
                onUpload={(files) => handleFileUpload(files, 'factory-tour', 'warehouse_photos')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
              
              <FileUpload
                key={`step4-certifications-${currentStep}`}
                label="Certifications Display Photos"
                accept=".jpg,.jpeg,.png"
                multiple
                maxSize={10}
                onUpload={(files) => handleFileUpload(files, 'factory-tour', 'certifications_display_photos')}
                uploadProgress={uploadProgress}
                uploadErrors={uploadErrors}
              />
            </div>

            <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <div className="flex">
                <div className="flex-shrink-0">
                  <Camera className="h-5 w-5 text-blue-400" />
                </div>
                <div className="ml-3">
                  <h3 className="text-sm font-medium text-blue-800">
                    Tips for Better Factory Tour
                  </h3>
                  <div className="mt-2 text-sm text-blue-700">
                    <ul className="list-disc list-inside space-y-1">
                      <li>Ensure good lighting in all photos and videos</li>
                      <li>Show your production capacity and equipment</li>
                      <li>Include shots of quality control processes</li>
                      <li>Display any certifications prominently</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex justify-end mt-6">
              <Button onClick={async () => {
                setSuccess(true);
                // Refresh auth context to update user with company data
                await checkAuthStatus();
                setTimeout(() => {
                  router.push('/');
                }, 2000);
              }}>
                Complete Onboarding
              </Button>
            </div>
          </Card>
        );

      default:
        return null;
    }
  };

  return (
    <>
      <Head>
        <title>Onboarding - SupplierHub</title>
      </Head>

      <div className="max-w-4xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center">
          <h1 className="text-2xl font-bold text-secondary-900">
            Welcome to SupplierHub
          </h1>
          <p className="mt-2 text-secondary-600">
            Complete your profile to start connecting with buyers worldwide
          </p>
        </div>

        {/* Progress Steps */}
        <Card className="p-6">
          <nav aria-label="Progress">
            <ol className="flex items-center">
              {steps.map((step, stepIdx) => {
                const Icon = step.icon;
                const isActive = step.id === currentStep;
                const isCompleted = step.id < currentStep;
                
                return (
                  <li key={step.name} className={`${stepIdx !== steps.length - 1 ? 'flex-1' : ''}`}>
                    <div className={`flex items-center ${stepIdx !== steps.length - 1 ? 'w-full' : ''}`}>
                      <div className="flex items-center">
                        <div className={`
                          flex items-center justify-center w-10 h-10 rounded-full border-2
                          ${isActive 
                            ? 'border-primary-600 bg-primary-600 text-white' 
                            : isCompleted 
                              ? 'border-green-600 bg-green-600 text-white'
                              : 'border-secondary-300 bg-white text-secondary-500'
                          }
                        `}>
                          {isCompleted ? (
                            <CheckCircle className="w-6 h-6" />
                          ) : (
                            <Icon className="w-5 h-5" />
                          )}
                        </div>
                        <div className="ml-3">
                          <p className={`text-sm font-medium ${
                            isActive ? 'text-primary-600' : 
                            isCompleted ? 'text-green-600' : 'text-secondary-500'
                          }`}>
                            {step.name}
                          </p>
                        </div>
                      </div>
                      
                      {stepIdx !== steps.length - 1 && (
                        <div className={`flex-1 h-0.5 ml-4 ${
                          isCompleted ? 'bg-green-600' : 'bg-secondary-300'
                        }`} />
                      )}
                    </div>
                  </li>
                );
              })}
            </ol>
          </nav>
        </Card>

        {/* Step Content */}
        {renderStepContent()}

        {/* Help Section */}
        <Card className="bg-secondary-50">
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center">
                <FileText className="w-4 h-4 text-primary-600" />
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-secondary-900">
                Need Help?
              </h3>
              <p className="mt-1 text-sm text-secondary-600">
                Contact our support team at support@supplierhub.com or call +63-2-123-4567 
                for assistance with the onboarding process.
              </p>
            </div>
          </div>
        </Card>
      </div>
    </>
  );
}
